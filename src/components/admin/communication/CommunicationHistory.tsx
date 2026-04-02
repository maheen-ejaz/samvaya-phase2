'use client';

import { useState, useEffect, useCallback } from 'react';

interface CommLog {
  id: string;
  channel: string;
  subject: string | null;
  body: string;
  status: string;
  sent_at: string | null;
  created_at: string;
}

interface CommunicationHistoryProps {
  userId: string;
  refreshKey?: number;
}

export function CommunicationHistory({ userId, refreshKey }: CommunicationHistoryProps) {
  const [logs, setLogs] = useState<CommLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/applicants/${userId}/communications`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, refreshKey]);

  if (loading) return <p className="text-sm text-gray-500">Loading communication history...</p>;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-lg font-medium text-gray-900">
        Communication History
      </h3>

      {logs.length === 0 ? (
        <p className="text-sm text-gray-400">No emails or messages sent yet.</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="rounded border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {log.subject || '(no subject)'}
                </span>
                <span className={`text-xs ${log.status === 'sent' ? 'text-green-600' : 'text-red-600'}`}>
                  {log.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{log.body}</p>
              <p className="mt-1 text-xs text-gray-400">
                {log.channel} — {log.sent_at ? new Date(log.sent_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'pending'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
