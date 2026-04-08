'use client';

import { useState, useEffect, useRef } from 'react';
import type { EmailTemplate } from '@/types';

interface BulkSendFormProps {
  templates: EmailTemplate[];
}

interface RecipientPreview {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface SearchResult {
  userId: string;
  name: string;
  email: string | null;
}

type RecipientMode = 'bulk' | 'single';

export function BulkSendForm({ templates }: BulkSendFormProps) {
  const [step, setStep] = useState(1);

  // Step 1: Content
  const [useTemplate, setUseTemplate] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');

  // Step 2: Recipient mode
  const [recipientMode, setRecipientMode] = useState<RecipientMode>('bulk');

  // Bulk filter state
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterGooCampus, setFilterGooCampus] = useState<string>('all');
  const [recipients, setRecipients] = useState<RecipientPreview[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [recipientError, setRecipientError] = useState<string | null>(null);

  // Single recipient search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSingleRecipient, setSelectedSingleRecipient] = useState<SearchResult | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // Step 3: Schedule
  const [scheduledAt, setScheduledAt] = useState('');

  // Confirm + result
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const statuses = [
    'unverified',
    'verification_pending',
    'in_pool',
    'match_presented',
    'awaiting_payment',
    'active_member',
    'membership_expired',
  ];

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // Inline template editing
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);

  async function saveTemplateEdit() {
    if (!selectedTemplate) return;
    setSavingTemplate(true);
    try {
      const res = await fetch(`/api/admin/templates/${selectedTemplate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: editSubject, body: editBody }),
      });
      if (res.ok) {
        selectedTemplate.subject = editSubject;
        selectedTemplate.body = editBody;
        setEditingTemplate(false);
      }
    } catch { /* ignore */ }
    finally { setSavingTemplate(false); }
  }

  // Bulk recipient preview fetch
  const fetchRecipients = async () => {
    setLoadingRecipients(true);
    setRecipientError(null);
    try {
      const params = new URLSearchParams();
      if (filterStatus.length > 0) params.set('payment_status', filterStatus.join(','));
      if (filterGooCampus !== 'all') params.set('goocampus', filterGooCampus);
      params.set('preview', 'true');

      const res = await fetch(`/api/admin/communications/bulk-send?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRecipients(data.recipients || []);
      } else {
        setRecipientError('Failed to load recipients');
      }
    } catch {
      setRecipientError('Failed to load recipients');
    } finally {
      setLoadingRecipients(false);
    }
  };

  useEffect(() => {
    if (step === 2 && recipientMode === 'bulk') fetchRecipients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, filterStatus, filterGooCampus, recipientMode]);

  // Search debounce
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    searchDebounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/admin/applicants/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.applicants || []);
          setShowDropdown(true);
        }
      } catch { /* ignore */ }
      finally { setSearchLoading(false); }
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function selectSingleRecipient(r: SearchResult) {
    setSelectedSingleRecipient(r);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  }

  function switchMode(mode: RecipientMode) {
    setRecipientMode(mode);
    if (mode === 'bulk') {
      setSelectedSingleRecipient(null);
      setSearchQuery('');
      setSearchResults([]);
    } else {
      setFilterStatus([]);
      setFilterGooCampus('all');
      setRecipients([]);
    }
  }

  const handleSend = async () => {
    setSending(true);
    setResult(null);

    try {
      const payload: Record<string, unknown> = {};

      if (useTemplate && selectedTemplateId) {
        payload.template_id = selectedTemplateId;
      } else {
        payload.subject = customSubject;
        payload.body = customBody;
      }

      if (recipientMode === 'single' && selectedSingleRecipient) {
        payload.user_id = selectedSingleRecipient.userId;
      } else {
        payload.payment_status = filterStatus;
        payload.goocampus = filterGooCampus;
      }

      if (scheduledAt) {
        payload.scheduled_at = new Date(scheduledAt).toISOString();
      }

      const res = await fetch('/api/admin/communications/bulk-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');

      const sent = data.sent ?? data.count ?? 0;
      const failed = data.failed ?? 0;
      setResult({
        success: true,
        message: scheduledAt
          ? `Scheduled ${sent} email${sent !== 1 ? 's' : ''} for ${new Date(scheduledAt).toLocaleString()}`
          : `Sent ${sent} email${sent !== 1 ? 's' : ''} successfully${failed > 0 ? ` (${failed} failed)` : ''}`,
      });
      setShowConfirm(false);
      setStep(1);
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : 'Send failed' });
    } finally {
      setSending(false);
    }
  };

  const canProceedStep1 = useTemplate ? !!selectedTemplateId : (!!customSubject && !!customBody);
  const canProceedStep2 = recipientMode === 'single'
    ? !!selectedSingleRecipient
    : recipients.length > 0;

  const recipientCount = recipientMode === 'single' ? (selectedSingleRecipient ? 1 : 0) : recipients.length;

  return (
    <div>
      {result && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm border ${result.success ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}
          role={result.success ? 'status' : 'alert'}
          aria-live="polite"
        >
          {result.message}
        </div>
      )}

      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                step === s
                  ? 'bg-rose-600 text-white'
                  : step > s
                  ? 'bg-[#4F6EF7] text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
            <span className={step === s ? 'font-medium text-gray-900' : step > s ? 'text-[#4F6EF7] font-medium' : 'text-gray-400'}>
              {s === 1 ? 'Content' : s === 2 ? 'Recipients' : 'Review & Send'}
            </span>
            {s < 3 && <span className="mx-2 text-gray-200">—</span>}
          </div>
        ))}
      </div>

      {/* Step 1: Content */}
      {step === 1 && (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
          {/* Segmented control */}
          <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 w-fit">
            <button
              type="button"
              onClick={() => setUseTemplate(true)}
              className={`rounded-md px-4 py-1.5 text-sm transition-all duration-150 ${
                useTemplate
                  ? 'bg-white shadow-sm text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Use Template
            </button>
            <button
              type="button"
              onClick={() => setUseTemplate(false)}
              className={`rounded-md px-4 py-1.5 text-sm transition-all duration-150 ${
                !useTemplate
                  ? 'bg-white shadow-sm text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Custom Content
            </button>
          </div>

          {useTemplate ? (
            <div>
              <label htmlFor="bulk-template" className="block text-sm font-medium text-gray-700 mb-1">
                Select Template
              </label>
              <select
                id="bulk-template"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F6EF7]/20 focus:border-[#4F6EF7] transition-colors"
              >
                <option value="">Choose a template...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              {selectedTemplate && (
                <div className="mt-3 rounded-lg bg-[#F8F9FF] border border-[#E0E7FF] p-4 text-sm">
                  {editingTemplate ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                        <input
                          type="text"
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                          className="block w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F6EF7]/20 focus:border-[#4F6EF7]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Body</label>
                        <textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          rows={8}
                          className="block w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#4F6EF7]/20 focus:border-[#4F6EF7]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveTemplateEdit}
                          disabled={savingTemplate}
                          className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:bg-gray-400 transition-all duration-150"
                        >
                          {savingTemplate ? 'Saving...' : 'Save Template'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTemplate(false)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium text-gray-900">Subject: {selectedTemplate.subject}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setEditSubject(selectedTemplate.subject);
                            setEditBody(selectedTemplate.body);
                            setEditingTemplate(true);
                          }}
                          className="flex-shrink-0 text-xs text-[#4F6EF7] hover:underline font-medium"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-gray-600">{selectedTemplate.body}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="bulk-subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  id="bulk-subject"
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  maxLength={255}
                  className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F6EF7]/20 focus:border-[#4F6EF7] transition-colors"
                />
              </div>
              <div>
                <label htmlFor="bulk-body" className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                <textarea
                  id="bulk-body"
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  rows={8}
                  maxLength={10000}
                  className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#4F6EF7]/20 focus:border-[#4F6EF7] transition-colors"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 hover:shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              Next: Select Recipients
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Recipients */}
      {step === 2 && (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Select Recipients</h3>
            {/* Mode toggle */}
            <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
              <button
                type="button"
                onClick={() => switchMode('bulk')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                  recipientMode === 'bulk'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Filter (Bulk)
              </button>
              <button
                type="button"
                onClick={() => switchMode('single')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                  recipientMode === 'single'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Single Recipient
              </button>
            </div>
          </div>

          {recipientMode === 'single' ? (
            /* Single recipient search */
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search by name</label>
              <div ref={searchWrapperRef} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Start typing a name..."
                    autoComplete="off"
                    className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F6EF7]/20 focus:border-[#4F6EF7] transition-colors pr-8"
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-[#4F6EF7]" />
                    </div>
                  )}
                </div>

                {/* Dropdown */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden">
                    {searchResults.map((r) => (
                      <button
                        key={r.userId}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectSingleRecipient(r)}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#EEF2FF] transition-colors"
                      >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4F6EF7] text-xs font-semibold">
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{r.name}</p>
                          <p className="text-xs text-gray-500 truncate">{r.email ?? 'No email on file'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showDropdown && searchResults.length === 0 && !searchLoading && searchQuery.length >= 2 && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-4 py-3">
                    <p className="text-sm text-gray-500">No matching applicants found.</p>
                  </div>
                )}
              </div>

              {/* Selected recipient chip */}
              {selectedSingleRecipient && (
                <div className="mt-3 flex items-center gap-3 rounded-lg bg-[#EEF2FF] border border-[#E0E7FF] px-4 py-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#4F6EF7] text-white text-sm font-semibold">
                    {selectedSingleRecipient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">{selectedSingleRecipient.name}</p>
                    <p className="text-xs text-[#4F6EF7] font-medium">{selectedSingleRecipient.email ?? 'No email on file'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSingleRecipient(null)}
                    className="flex-shrink-0 rounded-full p-1 text-gray-400 hover:text-gray-700 hover:bg-white/60 transition-colors"
                    aria-label="Remove recipient"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Bulk filter */
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Payment Status</p>
                <div className="space-y-2">
                  {statuses.map((s) => (
                    <label key={s} className="flex items-center gap-2.5 text-sm cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filterStatus.includes(s)}
                        onChange={(e) => {
                          setFilterStatus(e.target.checked
                            ? [...filterStatus, s]
                            : filterStatus.filter((x) => x !== s)
                          );
                        }}
                        style={{ accentColor: '#4F6EF7' }}
                        className="rounded border-gray-300 h-4 w-4 flex-shrink-0"
                      />
                      <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                        {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">GooCampus Member</p>
                  <select
                    value={filterGooCampus}
                    onChange={(e) => setFilterGooCampus(e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F6EF7]/20 focus:border-[#4F6EF7] transition-colors"
                  >
                    <option value="all">All</option>
                    <option value="yes">GooCampus Only</option>
                    <option value="no">Non-GooCampus Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Recipients count banner */}
          <div className={`rounded-lg border p-3 ${
            recipientCount > 0
              ? 'bg-[#EEF2FF] border-[#E0E7FF]'
              : 'bg-gray-50 border-gray-100'
          }`}>
            {recipientMode === 'bulk' && recipientError ? (
              <p className="text-sm text-red-600">{recipientError}</p>
            ) : recipientMode === 'bulk' && loadingRecipients ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-[#4F6EF7]" />
                <p className="text-sm text-gray-500">Loading recipients...</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-700">
                  <span className={`font-semibold ${recipientCount > 0 ? 'text-[#4F6EF7]' : 'text-gray-400'}`}>
                    {recipientCount}
                  </span>{' '}
                  recipient{recipientCount !== 1 ? 's' : ''}{' '}
                  {recipientMode === 'bulk' ? 'match your filters' : 'selected'}
                </p>
                {recipientMode === 'bulk' && recipients.length > 100 && (
                  <p className="mt-1 text-xs text-amber-600 font-medium">
                    Warning: Resend free tier allows 100 emails/day. Consider sending in batches.
                  </p>
                )}
                {recipientMode === 'bulk' && recipients.length > 0 && recipients.length <= 10 && (
                  <ul className="mt-2 space-y-0.5">
                    {recipients.map((r) => (
                      <li key={r.id} className="text-xs text-[#4F6EF7]">
                        {r.first_name} {r.last_name} — <span className="text-gray-500">{r.email}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          {/* Schedule option */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <label htmlFor="schedule-at" className="block text-sm font-medium text-gray-700 mb-2">
              Schedule <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="schedule-at"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F6EF7]/20 focus:border-[#4F6EF7] transition-colors"
            />
            {scheduledAt && (
              <p className="mt-1.5 text-xs text-gray-500">
                Will be sent at {new Date(scheduledAt).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex justify-between pt-1">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 hover:shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              Next: Review
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Send */}
      {step === 3 && (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
          <h3 className="text-base font-semibold text-gray-900">Review & Confirm</h3>

          <div className="rounded-xl bg-[#F8F9FF] border border-[#E0E7FF] p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Content</span>
              <span className="font-medium text-gray-900">{useTemplate ? selectedTemplate?.name : 'Custom content'}</span>
            </div>
            <div className="h-px bg-[#E0E7FF]" />
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Recipients</span>
              <span className="font-semibold text-[#4F6EF7]">
                {recipientMode === 'single' && selectedSingleRecipient
                  ? `${selectedSingleRecipient.name} (${selectedSingleRecipient.email})`
                  : `${recipients.length} applicant${recipients.length !== 1 ? 's' : ''}`}
              </span>
            </div>
            <div className="h-px bg-[#E0E7FF]" />
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Delivery</span>
              <span className="font-medium text-gray-900">
                {scheduledAt ? `Scheduled for ${new Date(scheduledAt).toLocaleString()}` : 'Immediate'}
              </span>
            </div>
          </div>

          <div className="flex justify-between pt-1">
            <button
              onClick={() => setStep(2)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 hover:shadow-md active:scale-[0.98] transition-all duration-150"
            >
              {scheduledAt ? 'Schedule Send' : 'Send Now'}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-send-title"
        >
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <h3 id="confirm-send-title" className="text-lg font-semibold text-gray-900">Confirm Send</h3>
            <p className="mt-2 text-sm text-gray-600">
              You are about to {scheduledAt ? 'schedule' : 'send'}{' '}
              {recipientMode === 'single' && selectedSingleRecipient ? (
                <>an email to <span className="font-semibold text-gray-900">{selectedSingleRecipient.name}</span> ({selectedSingleRecipient.email})</>
              ) : (
                <><span className="font-semibold text-gray-900">{recipients.length}</span> email{recipients.length !== 1 ? 's' : ''}</>
              )}.
              {' '}This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={sending}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 hover:shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
