'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';

interface LogEntry {
  id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatMetadataSnippet(metadata: Record<string, unknown>): string | null {
  if (!metadata || Object.keys(metadata).length === 0) return null;
  const humanize = (v: unknown) =>
    String(v).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  if (metadata.checkType && metadata.newStatus) {
    return `${humanize(metadata.checkType)} → ${humanize(metadata.newStatus)}`;
  }
  if (metadata.newStatus) return humanize(metadata.newStatus);
  if (metadata.status) return humanize(metadata.status);
  if (metadata.action) return humanize(metadata.action);
  return null;
}

function getIconForAction(action: string): React.ReactNode {
  const a = action.toLowerCase();

  // Form events
  if (a.includes('form_start') || a.includes('form_begin')) {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    );
  }
  if (a.includes('form_complete') || a.includes('form_submit') || a.includes('onboarding')) {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }

  // Payment events
  if (a.includes('payment') || a.includes('fee') || a.includes('verification_paid') || a.includes('membership_paid')) {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }

  // BGV events
  if (a.includes('bgv')) {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    );
  }

  // Match events
  if (a.includes('match')) {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }

  // Status / pool events
  if (a.includes('status') || a.includes('pool') || a.includes('member')) {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    );
  }

  // Note events
  if (a.includes('note')) {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    );
  }

  // Default
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function getIconColor(action: string): string {
  const a = action.toLowerCase();
  if (a.includes('payment') || a.includes('fee') || a.includes('verification_paid') || a.includes('membership_paid')) {
    return 'bg-emerald-50 text-emerald-600';
  }
  if (a.includes('bgv')) return 'bg-blue-50 text-blue-600';
  if (a.includes('match')) return 'bg-violet-50 text-violet-600';
  if (a.includes('form_complete') || a.includes('onboarding')) return 'bg-primary/10 text-primary';
  if (a.includes('form_start') || a.includes('form_begin')) return 'bg-orange-50 text-orange-600';
  return 'bg-muted text-muted-foreground';
}

export function ApplicantActivityTimeline({ userId }: { userId: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const params = new URLSearchParams({
          entity_type: 'user',
          entity_id: userId,
          per_page: '20',
        });
        const res = await fetch(`/api/admin/activity?${params}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setLogs(data.logs || []);
      } catch {
        setError('Failed to load activity');
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">Activity History</span>
        </CardTitle>
        <CardAction>
          <a
            href="/admin/activity"
            className="text-xs text-primary hover:text-primary/80 hover:underline"
          >
            View all →
          </a>
        </CardAction>
      </CardHeader>

      <CardContent>
        {/* Loading */}
        {loading && (
          <div className="space-y-3 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-[34px] w-[34px] rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <p className="py-4 text-center text-sm text-muted-foreground">{error}</p>
        )}

        {/* Empty state */}
        {!loading && !error && logs.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">Events will appear here as the applicant progresses.</p>
          </div>
        )}

        {/* Timeline */}
        {!loading && logs.length > 0 && (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border" aria-hidden="true" />

            <div className="space-y-4">
              {logs.map((log) => {
                const snippet = formatMetadataSnippet(log.metadata);
                return (
                  <div key={log.id} className="relative flex gap-4">
                    {/* Icon dot */}
                    <div
                      className={`relative z-10 flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full ${getIconColor(log.action)}`}
                    >
                      {getIconForAction(log.action)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1.5 pb-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {formatAction(log.action)}
                          </p>
                          {snippet && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{snippet}</p>
                          )}
                          {log.actor_name && log.actor_name !== 'Unknown' && (
                            <p className="mt-0.5 text-xs text-muted-foreground">by {log.actor_name}</p>
                          )}
                        </div>
                        <span className="flex-shrink-0 text-xs text-muted-foreground">
                          {timeAgo(log.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
