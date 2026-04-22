'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

function formatAction(action: string): string {
  return action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatMetadata(metadata: Record<string, unknown>): string {
  const parts: string[] = [];
  const humanize = (v: unknown) => String(v).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  if (metadata.checkType && metadata.newStatus) {
    return `Changed ${humanize(metadata.checkType)} to ${humanize(metadata.newStatus)}`;
  }
  if (metadata.action) {
    parts.push(`Action: ${humanize(metadata.action)}`);
  }
  if (metadata.status || metadata.newStatus) {
    parts.push(`Status: ${humanize(metadata.status || metadata.newStatus)}`);
  }
  if (metadata.reason) {
    parts.push(`Reason: ${String(metadata.reason)}`);
  }
  if (metadata.subject) {
    parts.push(`Subject: ${String(metadata.subject)}`);
  }
  if (metadata.templateName) {
    parts.push(`Template: ${String(metadata.templateName)}`);
  }
  if (metadata.recipientCount) {
    parts.push(`Recipients: ${metadata.recipientCount}`);
  }
  if (parts.length > 0) return parts.join(' · ');
  // Fallback: simple key-value pairs
  return Object.entries(metadata)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${humanize(k)}: ${typeof v === 'object' ? JSON.stringify(v) : humanize(v)}`)
    .join(' · ');
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { dateStyle: 'medium' });
}

export function ActivityLogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterAction, setFilterAction] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 50;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filterAction) params.set('action', filterAction);
    if (filterFrom) params.set('from', filterFrom);
    if (filterTo) params.set('to', filterTo);
    params.set('page', String(page));
    params.set('per_page', String(perPage));

    try {
      const res = await fetch(`/api/admin/activity?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
      if (data.actions) setActions(data.actions);
    } catch {
      setError('Failed to load activity log');
    } finally {
      setLoading(false);
    }
  }, [filterAction, filterFrom, filterTo, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / perPage);

  const resetFilters = () => {
    setFilterAction('');
    setFilterFrom('');
    setFilterTo('');
    setPage(1);
  };

  return (
    <div>
      {/* Filter bar */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 pt-4">
          <div>
            <Label htmlFor="filter-action">Action</Label>
            <Select
              value={filterAction}
              onValueChange={(v) => { setFilterAction(v === '__all__' ? '' : v); setPage(1); }}
            >
              <SelectTrigger id="filter-action" className="mt-1 w-[180px]">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All actions</SelectItem>
                {actions.map((a) => (
                  <SelectItem key={a} value={a}>{formatAction(a)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="filter-from">From</Label>
            <Input
              id="filter-from"
              type="date"
              value={filterFrom}
              onChange={(e) => { setFilterFrom(e.target.value); setPage(1); }}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="filter-to">To</Label>
            <Input
              id="filter-to"
              type="date"
              value={filterTo}
              onChange={(e) => { setFilterTo(e.target.value); setPage(1); }}
              className="mt-1"
            />
          </div>

          <Button
            variant="outline"
            onClick={resetFilters}
            aria-label="Reset all filters"
          >
            Reset
          </Button>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="mt-6 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      )}

      {/* Empty state */}
      {!loading && logs.length === 0 && (
        <Card className="mt-6">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No activity log entries found.</p>
          </CardContent>
        </Card>
      )}

      {/* Log entries */}
      {!loading && logs.length > 0 && (
        <div className="mt-4 space-y-2">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="px-4 py-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {log.actor_name}
                    </span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {formatAction(log.action)}
                    </span>
                    <Badge variant="secondary" className="ml-2 capitalize">
                      {log.entity_type}
                    </Badge>
                  </div>
                  <span className="flex-shrink-0 text-xs text-muted-foreground">
                    {timeAgo(log.created_at)}
                  </span>
                </div>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="mt-1.5">
                    <p className="rounded bg-muted px-3 py-2 text-xs text-muted-foreground">
                      {formatMetadata(log.metadata)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="mt-4">
          <CardContent className="flex items-center justify-between px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                Prev
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page - 2 + i;
                if (p > totalPages) return null;
                return (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(p)}
                    aria-label={`Page ${p}`}
                    aria-current={p === page ? 'page' : undefined}
                  >
                    {p}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
