'use client';

import { useState, useEffect, useCallback } from 'react';

interface BgvCheck {
  id: string;
  check_type: string;
  status: string;
  notes: string | null;
}

interface BgvUserInfo {
  paymentStatus: string;
  bgvConsent: string;
  isBgvComplete: boolean;
  bgvFlagged: boolean;
}

const CHECK_LABELS: Record<string, string> = {
  aadhaar: 'Aadhaar Verification',
  pan: 'PAN Verification',
  bank_account: 'Bank Account',
  credit_check: 'Credit Check',
  employment: 'Employment History',
  education: 'Education Verification',
  professional_reference: 'Professional Reference',
  court_records: 'Court Records',
  criminal_records: 'Criminal Records',
  global_database: 'Global Database',
  address_digital: 'Address (Digital)',
  address_physical: 'Address (Physical)',
  social_media: 'Social Media',
};

const STATUS_OPTIONS = ['pending', 'in_progress', 'verified', 'flagged'] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  verified: 'bg-green-100 text-green-700',
  flagged: 'bg-red-100 text-red-700',
};

export function DrawerBgvTracker({ userId }: { userId: string }) {
  const [checks, setChecks] = useState<BgvCheck[]>([]);
  const [userInfo, setUserInfo] = useState<BgvUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingCheck, setSavingCheck] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchChecks = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/applicants/${userId}/bgv`);
      const data = await res.json();
      if (res.ok) {
        setChecks(data.checks);
        setUserInfo(data.user);
      } else {
        setError(data.error || 'Failed to load BGV checks');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchChecks();
  }, [fetchChecks]);

  async function saveCheck(checkType: string, status: string, notes: string | null) {
    setSavingCheck(checkType);
    // Optimistic update
    setChecks((prev) =>
      prev.map((c) => (c.check_type === checkType ? { ...c, status, notes } : c))
    );
    try {
      const res = await fetch(`/api/admin/applicants/${userId}/bgv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkType, status, notes }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.isBgvComplete !== undefined && userInfo) {
          setUserInfo({ ...userInfo, isBgvComplete: data.isBgvComplete, bgvFlagged: data.bgvFlagged });
        }
      } else {
        // Revert on error
        await fetchChecks();
        showToast(data.error || 'Failed to save', 'error');
      }
    } catch {
      await fetchChecks();
      showToast('Network error — changes not saved', 'error');
    } finally {
      setSavingCheck(null);
    }
  }

  if (loading) {
    return (
      <div className="px-5 py-5 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="px-5 py-5 text-sm text-red-500">{error}</p>;
  }

  const feePaid = userInfo?.paymentStatus !== 'unverified';
  const consentGiven =
    userInfo?.bgvConsent === 'consented' || userInfo?.bgvConsent === 'consented_wants_call';
  const canEdit = feePaid && consentGiven;

  const verifiedCount = checks.filter((c) => c.status === 'verified').length;
  const flaggedCount = checks.filter((c) => c.status === 'flagged').length;

  return (
    <div className="px-5 py-4 pb-8">
      {/* Toast */}
      {toast && (
        <div
          className={`mb-3 rounded-lg px-3 py-2 text-xs font-medium ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Summary */}
      <div className="mb-3 flex items-center gap-3">
        <span className="text-sm text-gray-500">{verifiedCount} / 13 verified</span>
        {flaggedCount > 0 && (
          <span className="text-sm text-red-500">{flaggedCount} flagged</span>
        )}
        {userInfo?.isBgvComplete && (
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            BGV Complete
          </span>
        )}
      </div>

      {/* Prerequisites warning */}
      {!canEdit && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <p className="font-medium mb-1">BGV checks are read-only</p>
          <p>Both conditions must be met to edit:</p>
          <ul className="mt-1 space-y-0.5">
            <li className="flex items-center gap-1.5">
              <span className={feePaid ? 'text-green-600' : 'text-red-500'}>{feePaid ? '✓' : '✗'}</span>
              Verification fee paid
            </li>
            <li className="flex items-center gap-1.5">
              <span className={consentGiven ? 'text-green-600' : 'text-red-500'}>{consentGiven ? '✓' : '✗'}</span>
              BGV consent given
            </li>
          </ul>
        </div>
      )}

      {/* Checks list */}
      <div className="divide-y divide-gray-50 rounded-xl border border-gray-100 bg-white">
        {checks.map((check) => (
          <DrawerCheckRow
            key={check.check_type}
            check={check}
            canEdit={canEdit}
            isSaving={savingCheck === check.check_type}
            onSave={saveCheck}
          />
        ))}
      </div>
    </div>
  );
}

function DrawerCheckRow({
  check,
  canEdit,
  isSaving,
  onSave,
}: {
  check: BgvCheck;
  canEdit: boolean;
  isSaving: boolean;
  onSave: (checkType: string, status: string, notes: string | null) => void;
}) {
  const [localNotes, setLocalNotes] = useState(check.notes ?? '');

  // Keep local notes in sync when check updates (e.g. after revert)
  useEffect(() => {
    setLocalNotes(check.notes ?? '');
  }, [check.notes]);

  return (
    <div className={`px-4 py-3 transition-opacity ${isSaving ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[check.status]}`}>
            {check.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
          <span className="truncate text-sm text-gray-800">
            {CHECK_LABELS[check.check_type] || check.check_type}
          </span>
        </div>

        {canEdit ? (
          <select
            value={check.status}
            onChange={(e) => onSave(check.check_type, e.target.value, localNotes || null)}
            disabled={isSaving}
            aria-label={`Status for ${CHECK_LABELS[check.check_type] || check.check_type}`}
            className="shrink-0 rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-gray-400 focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        ) : (
          <span className="shrink-0 text-xs text-gray-300">Locked</span>
        )}
      </div>

      {/* Notes */}
      <div className="mt-1.5 pl-1">
        {canEdit ? (
          <input
            type="text"
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            onBlur={() => {
              const newNotes = localNotes.trim() || null;
              if (newNotes !== (check.notes ?? null)) {
                onSave(check.check_type, check.status, newNotes);
              }
            }}
            placeholder="Add notes..."
            maxLength={2000}
            aria-label={`Notes for ${CHECK_LABELS[check.check_type] || check.check_type}`}
            className="w-full rounded border-0 bg-transparent px-0 py-0 text-xs text-gray-500 placeholder-gray-300 focus:outline-none focus:ring-0"
          />
        ) : check.notes ? (
          <p className="text-xs text-gray-400">{check.notes}</p>
        ) : null}
      </div>
    </div>
  );
}
