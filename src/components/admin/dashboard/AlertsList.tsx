'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { DashboardAlert, AlertType } from '@/types/dashboard';
import { ApplicantStatusIcons } from '@/components/admin/ApplicantStatusIcons';

interface AlertsListProps {
  alerts: DashboardAlert[];
}

const TABS: { key: AlertType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'payment', label: 'Payments' },
  { key: 'bgv', label: 'BGV' },
  { key: 'match', label: 'Matches' },
  { key: 'verification', label: 'Verification' },
  { key: 'stalled', label: 'Stalled' },
];

const TAG_STYLES: Record<AlertType, string> = {
  payment: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  bgv: 'bg-red-50 text-red-700 border-red-200',
  match: 'bg-violet-50 text-violet-700 border-violet-200',
  verification: 'bg-amber-50 text-amber-700 border-amber-200',
  stalled: 'bg-gray-100 text-gray-600 border-gray-200',
};

const TAG_LABELS: Record<AlertType, string> = {
  payment: 'Payment',
  bgv: 'BGV',
  match: 'Match',
  verification: 'Verification',
  stalled: 'Stalled',
};

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-400',
  low: 'bg-gray-300',
};

// Dismiss TTL: 24 hours
const DISMISS_TTL = 24 * 60 * 60 * 1000;

function getDismissedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem('samvaya-dismissed-alerts');
    if (!stored) return new Set();
    const parsed = JSON.parse(stored) as Record<string, number>;
    const now = Date.now();
    const valid = new Set<string>();
    for (const [id, expiry] of Object.entries(parsed)) {
      if (expiry > now) valid.add(id);
    }
    return valid;
  } catch {
    return new Set();
  }
}

function dismissAlert(id: string) {
  try {
    const stored = localStorage.getItem('samvaya-dismissed-alerts');
    const parsed = stored ? (JSON.parse(stored) as Record<string, number>) : {};
    parsed[id] = Date.now() + DISMISS_TTL;
    const now = Date.now();
    for (const key of Object.keys(parsed)) {
      if (parsed[key] <= now) delete parsed[key];
    }
    localStorage.setItem('samvaya-dismissed-alerts', JSON.stringify(parsed));
  } catch {
    // localStorage unavailable
  }
}

export function AlertsList({ alerts }: AlertsListProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AlertType | 'all'>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [nudgeSubject, setNudgeSubject] = useState('');
  const [nudgeBody, setNudgeBody] = useState('');
  const [nudgeSending, setNudgeSending] = useState(false);
  const [nudgeSuccess, setNudgeSuccess] = useState<string | null>(null);

  useEffect(() => {
    setDismissedIds(getDismissedIds());
  }, []);

  // Filter: remove dismissed, then filter by tab
  const visibleAlerts = alerts.filter((a) => {
    if (dismissedIds.has(a.id)) return false;
    if (activeTab !== 'all' && a.alertType !== activeTab) return false;
    return true;
  });

  // Tab counts (excluding dismissed)
  const nonDismissed = alerts.filter((a) => !dismissedIds.has(a.id));
  const tabCounts: Record<string, number> = {
    all: nonDismissed.length,
    payment: nonDismissed.filter((a) => a.alertType === 'payment').length,
    bgv: nonDismissed.filter((a) => a.alertType === 'bgv').length,
    match: nonDismissed.filter((a) => a.alertType === 'match').length,
    verification: nonDismissed.filter((a) => a.alertType === 'verification').length,
    stalled: nonDismissed.filter((a) => a.alertType === 'stalled').length,
  };

  const handleDismiss = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    dismissAlert(id);
    setDismissedIds((prev) => new Set([...prev, id]));
    if (expandedId === id) setExpandedId(null);
  }, [expandedId]);

  function toggleExpand(id: string) {
    const alert = alerts.find((a) => a.id === id);
    if (expandedId === id) {
      setExpandedId(null);
      setNudgeSuccess(null);
    } else {
      setExpandedId(id);
      setNudgeSuccess(null);
      // Pre-fill nudge fields if applicable
      if (alert?.nudgeEmailTo) {
        setNudgeSubject(alert.nudgeEmailSubject || '');
        setNudgeBody(alert.nudgeEmailBody || '');
      }
    }
  }

  async function handleAction(e: React.MouseEvent, alert: DashboardAlert) {
    e.stopPropagation();
    if (alert.actionHref) {
      router.push(alert.actionHref);
      return;
    }
    if (!alert.actionEndpoint) return;

    setLoadingId(alert.id);
    try {
      const res = await fetch(alert.actionEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert.actionPayload || {}),
      });
      if (res.ok) router.refresh();
    } catch {
      // silently fail
    } finally {
      setLoadingId(null);
    }
  }

  async function sendNudge(alert: DashboardAlert) {
    if (!alert.nudgeEmailTo) return;
    setNudgeSending(true);
    try {
      const res = await fetch(`/api/admin/applicants/${alert.nudgeEmailTo}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: nudgeSubject, body: nudgeBody }),
      });
      if (res.ok) {
        setNudgeSuccess(alert.id);
        setTimeout(() => {
          setExpandedId(null);
          setNudgeSuccess(null);
          router.refresh();
        }, 1500);
      }
    } catch {
      // fail silently
    } finally {
      setNudgeSending(false);
    }
  }

  // Bulk actions
  const paymentAlerts = visibleAlerts.filter((a) => a.alertType === 'payment' && a.actionEndpoint);
  const allPaymentsSelected = paymentAlerts.length > 0 && paymentAlerts.every((a) => selectedIds.has(a.id));

  function toggleSelectAll() {
    if (allPaymentsSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(paymentAlerts.map((a) => a.id)));
  }

  function toggleSelect(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkMarkPaid() {
    const selected = paymentAlerts.filter((a) => selectedIds.has(a.id));
    if (selected.length === 0) return;
    setBulkLoading(true);
    try {
      await Promise.all(
        selected.map((alert) =>
          fetch(alert.actionEndpoint!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alert.actionPayload || {}),
          })
        )
      );
      setSelectedIds(new Set());
      router.refresh();
    } catch {
      // fail silently
    } finally {
      setBulkLoading(false);
    }
  }

  const showBulkActions = activeTab === 'payment' && paymentAlerts.length > 1;

  return (
    <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="type-heading text-gray-900">
          Alerts & Action Items
          {nonDismissed.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              {nonDismissed.length}
            </span>
          )}
        </h3>
      </div>

      {/* Filter tabs — curved pill buttons */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {TABS.map((tab) => {
          const count = tabCounts[tab.key] || 0;
          if (tab.key !== 'all' && count === 0) return null;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedIds(new Set()); setExpandedId(null); }}
              className={`rounded-full px-3.5 py-1 text-xs font-medium border transition-colors ${
                activeTab === tab.key
                  ? 'bg-admin-blue-900 text-white border-admin-blue-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1 ${activeTab === tab.key ? 'text-white/60' : 'text-gray-400'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bulk actions bar */}
      {showBulkActions && (
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
          <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={allPaymentsSelected}
              onChange={toggleSelectAll}
              className="rounded border-gray-300 text-admin-blue-900 focus:ring-admin-blue-500"
            />
            Select all
          </label>
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkMarkPaid}
              disabled={bulkLoading}
              className="rounded-full bg-admin-blue-900 px-3 py-1 text-xs font-medium text-white hover:bg-admin-blue-800 disabled:bg-gray-400"
            >
              {bulkLoading ? 'Processing...' : `Mark ${selectedIds.size} Fee Paid`}
            </button>
          )}
        </div>
      )}

      {/* Alert list */}
      {visibleAlerts.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400 flex-1 flex items-center justify-center">No pending actions. All clear.</p>
      ) : (
        <div className="mt-3 space-y-1 flex-1 overflow-y-auto max-h-[500px]">
          {visibleAlerts.map((alert) => {
            const isExpanded = expandedId === alert.id;

            return (
              <div key={alert.id}>
                {/* Collapsed row — clickable summary */}
                <div
                  onClick={() => toggleExpand(alert.id)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                    isExpanded
                      ? 'bg-gray-50 border border-gray-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  {/* Bulk checkbox */}
                  {showBulkActions && alert.alertType === 'payment' && alert.actionEndpoint && (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(alert.id)}
                      onClick={(e) => toggleSelect(e, alert.id)}
                      onChange={() => {}}
                      className="rounded border-gray-300 text-admin-blue-900 focus:ring-admin-blue-500 flex-shrink-0"
                    />
                  )}

                  {/* Priority dot */}
                  <span className={`h-2 w-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[alert.priority]}`} />

                  {/* Summary text */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900 truncate">
                      <span className="inline-flex items-center gap-1 font-medium">
                        {alert.name}
                        <ApplicantStatusIcons isGooCampusMember={alert.isGooCampusMember ?? false} paymentStatus={alert.paymentStatus} size={12} />
                      </span>{' '}
                      <span className="text-gray-500">{alert.message}</span>
                    </p>
                  </div>

                  {/* Tag */}
                  <span className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${TAG_STYLES[alert.alertType]}`}>
                    {TAG_LABELS[alert.alertType]}
                  </span>

                  {/* Time ago */}
                  {alert.daysStuck !== undefined && alert.daysStuck > 0 && (
                    <span className="flex-shrink-0 text-[11px] text-gray-400">{alert.daysStuck}d</span>
                  )}

                  {/* Dismiss */}
                  <button
                    onClick={(e) => handleDismiss(e, alert.id)}
                    className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
                    title="Dismiss for 24 hours"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Expanded panel — context + actions */}
                {isExpanded && (
                  <div className="ml-[52px] mr-2 mb-2 rounded-lg border border-gray-100 bg-white p-3 space-y-3">
                    {/* Profile context */}
                    {(alert.age || alert.specialty || alert.city) && (
                      <p className="text-xs text-gray-500">
                        {[
                          alert.age ? `${alert.age}y` : null,
                          alert.gender,
                          alert.specialty,
                          alert.city,
                        ].filter(Boolean).join(' · ')}
                      </p>
                    )}

                    {/* Match-specific details */}
                    {alert.compatibilityScore !== undefined && (
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <p>{alert.compatibilityScore}% compatible{alert.hoursRemaining !== undefined && ` · ${alert.hoursRemaining}h remaining`}</p>
                        {alert.waitingOn && (
                          <p className="text-amber-600">Waiting on: {alert.waitingOn}</p>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Primary action (non-nudge) */}
                      {(alert.actionEndpoint || alert.actionHref) && !alert.nudgeEmailTo && (
                        <button
                          onClick={(e) => handleAction(e, alert)}
                          disabled={loadingId === alert.id}
                          className="rounded-full bg-admin-blue-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-admin-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {loadingId === alert.id ? '...' : alert.actionLabel}
                        </button>
                      )}

                      {/* Secondary action */}
                      {alert.secondaryActionHref && (
                        <Link
                          href={alert.secondaryActionHref}
                          className="rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                          {alert.secondaryActionLabel}
                        </Link>
                      )}
                    </div>

                    {/* Nudge email form (two-step) */}
                    {alert.nudgeEmailTo && (
                      <div className="space-y-2 border-t border-gray-100 pt-3">
                        {nudgeSuccess === alert.id ? (
                          <p className="text-xs text-emerald-600 font-medium">Email sent successfully!</p>
                        ) : (
                          <>
                            <div>
                              <label className="text-[11px] text-gray-400 block mb-0.5">Subject</label>
                              <input
                                type="text"
                                value={nudgeSubject}
                                onChange={(e) => setNudgeSubject(e.target.value)}
                                className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-300"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-gray-400 block mb-0.5">Message</label>
                              <textarea
                                value={nudgeBody}
                                onChange={(e) => setNudgeBody(e.target.value)}
                                rows={3}
                                className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
                              />
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => sendNudge(alert)}
                                disabled={nudgeSending || !nudgeSubject.trim() || !nudgeBody.trim()}
                                className="rounded-full bg-admin-blue-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-admin-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                              >
                                {nudgeSending ? 'Sending...' : 'Send Email'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
