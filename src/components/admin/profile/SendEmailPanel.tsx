'use client';

import { useState } from 'react';
import type { EmailTemplate } from '@/types';

interface SendEmailPanelProps {
  userId: string;
  recipientName: string;
  templates: EmailTemplate[];
}

export function SendEmailPanel({ userId, recipientName, templates }: SendEmailPanelProps) {
  const [open, setOpen] = useState(false);
  const [useTemplate, setUseTemplate] = useState(true);
  const [templateId, setTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const selectedTemplate = templates.find((t) => t.id === templateId);

  async function handleSend() {
    setSending(true);
    setResult(null);
    try {
      const payload = useTemplate && templateId
        ? { template_id: templateId, user_id: userId }
        : { subject, body, user_id: userId };

      const res = await fetch('/api/admin/communications/bulk-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult({ ok: false, message: data.error || 'Send failed. Please try again.' });
      } else {
        setResult({ ok: true, message: `Email sent to ${recipientName}.` });
        setOpen(false);
        setTemplateId('');
        setSubject('');
        setBody('');
      }
    } catch {
      setResult({ ok: false, message: 'Network error. Please try again.' });
    } finally {
      setSending(false);
    }
  }

  const canSend = useTemplate
    ? !!templateId
    : subject.trim().length > 0 && body.trim().length > 0;

  return (
    <div>
      {/* Trigger */}
      <button
        onClick={() => { setOpen((o) => !o); setResult(null); }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
        Send Email
      </button>

      {/* Panel */}
      {open && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm text-gray-500">
            Sending to: <span className="font-medium text-gray-900">{recipientName}</span>
          </p>

          {/* Mode toggle */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setUseTemplate(true)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${useTemplate ? 'bg-admin-blue-50 text-admin-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Use template
            </button>
            <button
              onClick={() => setUseTemplate(false)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${!useTemplate ? 'bg-admin-blue-50 text-admin-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Custom message
            </button>
          </div>

          {useTemplate ? (
            <div className="space-y-3">
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-0"
              >
                <option value="">Select a template…</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {selectedTemplate && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">Subject</p>
                  <p className="mt-0.5 text-sm text-gray-800">{selectedTemplate.subject}</p>
                  <p className="mt-2 text-xs font-medium text-gray-500">Preview</p>
                  <p className="mt-0.5 whitespace-pre-wrap text-xs text-gray-600 line-clamp-4">{selectedTemplate.body}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject…"
                maxLength={255}
                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-0"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Message body…"
                rows={5}
                maxLength={10000}
                className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-0"
              />
            </div>
          )}

          {result && (
            <div className={`mt-3 rounded-lg px-3 py-2 text-sm ${result.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {result.message}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={handleSend}
              disabled={!canSend || sending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? 'Sending…' : 'Send now'}
            </button>
            <button
              onClick={() => { setOpen(false); setResult(null); }}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
