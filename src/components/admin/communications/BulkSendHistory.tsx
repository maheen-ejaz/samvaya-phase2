'use client';

import { useState, useEffect, useMemo } from 'react';
import { DonutChart, DONUT_COLORS, type DonutSlice } from '@/components/admin/analytics/DonutChart';
import { DonutLegend } from '@/components/admin/analytics/DonutLegend';

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

  // Aggregate deliverability stats
  const aggregateStats = useMemo(() => {
    let totalSent = 0, totalFailed = 0, totalPending = 0;
    batches.forEach((b) => {
      totalSent += b.sent;
      totalFailed += b.failed;
      totalPending += b.pending;
    });
    return { totalSent, totalFailed, totalPending };
  }, [batches]);

  return (
    <div className="space-y-4">
      {/* Aggregate Deliverability Donut */}
      {(aggregateStats.totalSent + aggregateStats.totalFailed + aggregateStats.totalPending) > 0 && (
        <div className="rounded-lg border border-gray-100 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Aggregate Deliverability</p>
          <div className="flex items-center gap-4">
            <DonutChart
              data={[
                { label: 'Sent', count: aggregateStats.totalSent, color: DONUT_COLORS[0] },
                { label: 'Failed', count: aggregateStats.totalFailed, color: DONUT_COLORS[2] },
                { label: 'Pending', count: aggregateStats.totalPending, color: DONUT_COLORS[1] },
              ]}
              size={80}
              strokeWidth={14}
            />
            <DonutLegend
              data={[
                { label: 'Sent', count: aggregateStats.totalSent, color: DONUT_COLORS[0] },
                { label: 'Failed', count: aggregateStats.totalFailed, color: DONUT_COLORS[2] },
                { label: 'Pending', count: aggregateStats.totalPending, color: DONUT_COLORS[1] },
              ]}
              total={aggregateStats.totalSent + aggregateStats.totalFailed + aggregateStats.totalPending}
              maxItems={3}
            />
          </div>
        </div>
      )}

      {/* Per-batch stacked bars */}
      <div className="space-y-3">
        {batches.map((batch) => {
          const total = batch.sent + batch.failed + batch.pending;
          const sentPct = total > 0 ? (batch.sent / total) * 100 : 0;
          const failedPct = total > 0 ? (batch.failed / total) * 100 : 0;
          const pendingPct = total > 0 ? (batch.pending / total) * 100 : 0;

          return (
            <div key={batch.batch_id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{batch.subject || 'Bulk send'}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {new Date(batch.first_sent).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>

              {/* Stacked bar */}
              <div className="flex h-5 gap-0.5 rounded-full bg-gray-100 overflow-hidden">
                {sentPct > 0 && (
                  <div
                    className="bg-emerald-500"
                    style={{ width: `${sentPct}%` }}
                    title={`Sent: ${batch.sent}`}
                  />
                )}
                {failedPct > 0 && (
                  <div
                    className="bg-red-500"
                    style={{ width: `${failedPct}%` }}
                    title={`Failed: ${batch.failed}`}
                  />
                )}
                {pendingPct > 0 && (
                  <div
                    className="bg-amber-400"
                    style={{ width: `${pendingPct}%` }}
                    title={`Pending: ${batch.pending}`}
                  />
                )}
              </div>

              {/* Legend below bar */}
              <div className="flex gap-4 mt-2 text-xs">
                <span className="text-gray-600">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />
                  Sent: {batch.sent}
                </span>
                {batch.failed > 0 && (
                  <span className="text-gray-600">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />
                    Failed: {batch.failed}
                  </span>
                )}
                {batch.pending > 0 && (
                  <span className="text-gray-600">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />
                    Pending: {batch.pending}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
