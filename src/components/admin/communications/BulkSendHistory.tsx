'use client';

import { useState, useEffect, useMemo } from 'react';
import { DonutChart, DONUT_COLORS, type DonutSlice } from '@/components/admin/analytics/DonutChart';
import { DonutLegend } from '@/components/admin/analytics/DonutLegend';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (batches.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No bulk sends yet.</p>
        </CardContent>
      </Card>
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
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Aggregate Deliverability</p>
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
          </CardContent>
        </Card>
      )}

      {/* Per-batch stacked bars */}
      <div className="space-y-3">
        {batches.map((batch) => {
          const total = batch.sent + batch.failed + batch.pending;
          const sentPct = total > 0 ? (batch.sent / total) * 100 : 0;
          const failedPct = total > 0 ? (batch.failed / total) * 100 : 0;
          const pendingPct = total > 0 ? (batch.pending / total) * 100 : 0;

          return (
            <Card key={batch.batch_id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{batch.subject || 'Bulk send'}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(batch.first_sent).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>

                {/* Stacked bar */}
                <div className="flex h-5 gap-0.5 rounded-full bg-muted overflow-hidden">
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
                  <span className="text-muted-foreground">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />
                    Sent: {batch.sent}
                  </span>
                  {batch.failed > 0 && (
                    <span className="text-muted-foreground">
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />
                      Failed: {batch.failed}
                    </span>
                  )}
                  {batch.pending > 0 && (
                    <span className="text-muted-foreground">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />
                      Pending: {batch.pending}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
