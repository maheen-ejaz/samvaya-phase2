'use client';

import { useState } from 'react';

interface SendEmailFormProps {
  userId: string;
  applicantEmail: string;
  onSent?: () => void;
}

export function SendEmailForm({ userId, applicantEmail, onSent }: SendEmailFormProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  async function handleSend() {
    if (!subject.trim() || !body.trim()) return;

    setSending(true);
    setStatus('idle');

    try {
      const res = await fetch(`/api/admin/applicants/${userId}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), body: body.trim() }),
      });

      if (res.ok) {
        setStatus('success');
        setSubject('');
        setBody('');
        onSent?.();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
        Send Email
      </h3>
      <p className="mb-3 text-xs text-gray-400">To: {applicantEmail}</p>

      <div className="space-y-3">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          aria-label="Email subject"
          maxLength={255}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Email body..."
          aria-label="Email body"
          maxLength={5000}
          rows={4}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !body.trim()}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Email'}
          </button>
          {status === 'success' && <span className="text-sm text-green-600">Sent!</span>}
          {status === 'error' && <span className="text-sm text-red-600">Failed to send</span>}
        </div>
      </div>
    </div>
  );
}
