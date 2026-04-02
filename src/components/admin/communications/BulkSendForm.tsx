'use client';

import { useState, useEffect } from 'react';
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

export function BulkSendForm({ templates }: BulkSendFormProps) {
  const [step, setStep] = useState(1);

  // Step 1: Content
  const [useTemplate, setUseTemplate] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');

  // Step 2: Recipients
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterGooCampus, setFilterGooCampus] = useState<string>('all');
  const [recipients, setRecipients] = useState<RecipientPreview[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  // Step 3: Schedule
  const [scheduledAt, setScheduledAt] = useState('');

  // Step 4: Confirm
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const statuses = ['unverified', 'verification_pending', 'in_pool', 'match_presented', 'awaiting_payment', 'active_member', 'membership_expired'];

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
        // Update local template data
        selectedTemplate.subject = editSubject;
        selectedTemplate.body = editBody;
        setEditingTemplate(false);
      }
    } catch { /* ignore */ }
    finally { setSavingTemplate(false); }
  }

  const [recipientError, setRecipientError] = useState<string | null>(null);

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
    if (step === 2) fetchRecipients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, filterStatus, filterGooCampus]);

  const handleSend = async () => {
    setSending(true);
    setResult(null);

    try {
      const payload: Record<string, unknown> = {
        payment_status: filterStatus,
        goocampus: filterGooCampus,
      };

      if (useTemplate && selectedTemplateId) {
        payload.template_id = selectedTemplateId;
      } else {
        payload.subject = customSubject;
        payload.body = customBody;
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
          ? `Scheduled ${sent} emails for ${new Date(scheduledAt).toLocaleString()}`
          : `Sent ${sent} emails successfully${failed > 0 ? ` (${failed} failed)` : ''}`,
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
  const canProceedStep2 = recipients.length > 0;

  return (
    <div>
      {result && (
        <div className={`mb-4 rounded-md p-3 text-sm ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`} role={result.success ? 'status' : 'alert'} aria-live="polite">
          {result.message}
        </div>
      )}

      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                step === s ? 'bg-rose-600 text-white' : step > s ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step > s ? '\u2713' : s}
            </div>
            <span className={step === s ? 'font-medium text-gray-900' : 'text-gray-400'}>
              {s === 1 ? 'Content' : s === 2 ? 'Recipients' : 'Review & Send'}
            </span>
            {s < 3 && <span className="mx-2 text-gray-300">—</span>}
          </div>
        ))}
      </div>

      {/* Step 1: Content */}
      {step === 1 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setUseTemplate(true)}
              className={`rounded-md px-4 py-2 text-sm ${useTemplate ? 'bg-rose-600 text-white' : 'border border-gray-300 text-gray-600'}`}
            >
              Use Template
            </button>
            <button
              type="button"
              onClick={() => setUseTemplate(false)}
              className={`rounded-md px-4 py-2 text-sm ${!useTemplate ? 'bg-rose-600 text-white' : 'border border-gray-300 text-gray-600'}`}
            >
              Custom Content
            </button>
          </div>

          {useTemplate ? (
            <div>
              <label htmlFor="bulk-template" className="block text-sm font-medium text-gray-700">Select Template</label>
              <select
                id="bulk-template"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Choose a template...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {selectedTemplate && (
                <div className="mt-3 rounded-md bg-gray-50 p-4 text-sm">
                  {editingTemplate ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Subject</label>
                        <input
                          type="text"
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                          className="mt-1 block w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Body</label>
                        <textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          rows={8}
                          className="mt-1 block w-full rounded border border-gray-300 px-3 py-1.5 text-sm font-mono"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveTemplateEdit}
                          disabled={savingTemplate}
                          className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
                        >
                          {savingTemplate ? 'Saving...' : 'Save Template'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTemplate(false)}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-gray-900">Subject: {selectedTemplate.subject}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setEditSubject(selectedTemplate.subject);
                            setEditBody(selectedTemplate.body);
                            setEditingTemplate(true);
                          }}
                          className="flex-shrink-0 text-xs text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-gray-600">{selectedTemplate.body}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label htmlFor="bulk-subject" className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  id="bulk-subject"
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  maxLength={255}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="bulk-body" className="block text-sm font-medium text-gray-700">Body</label>
                <textarea
                  id="bulk-body"
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  rows={8}
                  maxLength={10000}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Select Recipients
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Recipients */}
      {step === 2 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Filter Recipients</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Payment Status</label>
              <div className="space-y-1">
                {statuses.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filterStatus.includes(s)}
                      onChange={(e) => {
                        setFilterStatus(e.target.checked
                          ? [...filterStatus, s]
                          : filterStatus.filter((x) => x !== s)
                        );
                      }}
                      className="rounded border-gray-300 text-rose-600"
                    />
                    {s.replace(/_/g, ' ')}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">GooCampus Member</label>
              <select
                value={filterGooCampus}
                onChange={(e) => setFilterGooCampus(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="yes">GooCampus Only</option>
                <option value="no">Non-GooCampus Only</option>
              </select>
            </div>
          </div>

          <div className="rounded-md bg-gray-50 p-3">
            {recipientError ? (
              <p className="text-sm text-red-600">{recipientError}</p>
            ) : loadingRecipients ? (
              <p className="text-sm text-gray-500">Loading recipients...</p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-900">
                  {recipients.length} recipient{recipients.length !== 1 ? 's' : ''} match your filters
                </p>
                {recipients.length > 100 && (
                  <p className="mt-1 text-xs text-amber-600">
                    Warning: Resend free tier allows 100 emails/day. Consider sending in batches.
                  </p>
                )}
                {recipients.length > 0 && recipients.length <= 10 && (
                  <ul className="mt-2 space-y-1">
                    {recipients.map((r) => (
                      <li key={r.id} className="text-xs text-gray-500">
                        {r.first_name} {r.last_name} ({r.email})
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          {/* Schedule option */}
          <div>
            <label htmlFor="schedule-at" className="block text-sm font-medium text-gray-700">
              Schedule (optional)
            </label>
            <input
              id="schedule-at"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {scheduledAt && (
              <p className="mt-1 text-xs text-gray-500">
                Will be sent at {new Date(scheduledAt).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
              className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Review
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Send */}
      {step === 3 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Review & Confirm</h3>

          <div className="rounded-md bg-gray-50 p-4 space-y-2 text-sm">
            <p><span className="font-medium text-gray-700">Content:</span> {useTemplate ? selectedTemplate?.name : 'Custom content'}</p>
            <p><span className="font-medium text-gray-700">Recipients:</span> {recipients.length}</p>
            <p><span className="font-medium text-gray-700">Delivery:</span> {scheduledAt ? `Scheduled for ${new Date(scheduledAt).toLocaleString()}` : 'Immediate'}</p>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              {scheduledAt ? 'Schedule Send' : 'Send Now'}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="confirm-send-title">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-md">
            <h3 id="confirm-send-title" className="text-lg font-semibold text-gray-900">Confirm Send</h3>
            <p className="mt-2 text-sm text-gray-600">
              You are about to {scheduledAt ? 'schedule' : 'send'}{' '}
              <span className="font-semibold">{recipients.length}</span> email{recipients.length !== 1 ? 's' : ''}.
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={sending}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
