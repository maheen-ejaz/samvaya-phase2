'use client';

import { useState, useEffect } from 'react';

interface BatchEntry {
  batch_id: string;
  count: number;
  sent: number;
  failed: number;
  pending: number;
  first_sent: string;
  subject: string;
}

export function BulkSendHistory() {
  const [batches, setBatches] = useState<BatchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setError(null);
        const res = await fetch('/api/admin/communications/bulk-send?history=true');
        if (res.ok) {
          const data = await res.json();
          setBatches(data.batches || []);
        } else {
          setError('Failed to load send history');
        }
      } catch {
        setError('Failed to load send history');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-rose-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">No bulk sends yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {batches.map((batch) => (
        <div key={batch.batch_id} className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{batch.subject || 'Bulk send'}</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {new Date(batch.first_sent).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                {batch.sent} sent
              </span>
              {batch.failed > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">
                  {batch.failed} failed
                </span>
              )}
              {batch.pending > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
                  {batch.pending} pending
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
