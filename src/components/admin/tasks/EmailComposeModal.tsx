'use client';

import { useState } from 'react';
import { TASK_EMAIL_TEMPLATES } from '@/lib/email/task-templates';
import type { AdminTask } from '@/types/dashboard';

interface EmailComposeModalProps {
  task: AdminTask;
  onClose: () => void;
}

export function EmailComposeModal({ task, onClose }: EmailComposeModalProps) {
  const [templateId, setTemplateId] = useState('');
  const [to, setTo] = useState(task.applicantEmail ?? '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function applyTemplate(id: string) {
    setTemplateId(id);
    if (!id) return;
    const tpl = TASK_EMAIL_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    const name = task.applicantName?.split(' ')[0] ?? 'there';
    setSubject(tpl.subject);
    setBody(tpl.body.replace(/\{name\}/g, name));
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!to || !subject || !body) {
      setError('Please fill in all fields.');
      return;
    }
    setSending(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/tasks/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          text_body: body,
          task_id: task.id,
          applicant_user_id: task.entityId,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Send failed');
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Compose Email</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 10l4 4 8-8" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">Email sent successfully</p>
            <p className="mt-1 text-xs text-gray-500">Logged to communication history.</p>
            <button
              onClick={onClose}
              className="mt-6 rounded-lg bg-[#1B4332] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B4332]/90"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="divide-y divide-gray-100">
            {/* Template selector */}
            <div className="px-6 py-3">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Template</label>
              <select
                value={templateId}
                onChange={(e) => applyTemplate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30"
              >
                <option value="">— Free-form (no template) —</option>
                {TASK_EMAIL_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* To */}
            <div className="px-6 py-3">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">To</label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="applicant@email.com"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30"
                required
              />
            </div>

            {/* Subject */}
            <div className="px-6 py-3">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30"
                required
              />
            </div>

            {/* Body */}
            <div className="px-6 py-3">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message..."
                rows={8}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30 resize-none"
                required
              />
            </div>

            {error && (
              <div className="px-6 py-2">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="rounded-lg bg-[#1B4332] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B4332]/90 disabled:opacity-60"
              >
                {sending ? 'Sending…' : 'Send Email'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
