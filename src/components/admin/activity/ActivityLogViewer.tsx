'use client';

import { useState, useEffect, useCallback } from 'react';

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
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <label className="block text-xs font-medium text-gray-500" htmlFor="filter-action">
            Action
          </label>
          <select
            id="filter-action"
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
            className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            <option value="">All actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>{formatAction(a)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500" htmlFor="filter-from">
            From
          </label>
          <input
            id="filter-from"
            type="date"
            value={filterFrom}
            onChange={(e) => { setFilterFrom(e.target.value); setPage(1); }}
            className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500" htmlFor="filter-to">
            To
          </label>
          <input
            id="filter-to"
            type="date"
            value={filterTo}
            onChange={(e) => { setFilterTo(e.target.value); setPage(1); }}
            className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>

        <button
          onClick={resetFilters}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          aria-label="Reset all filters"
        >
          Reset
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="mt-6 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-rose-600" />
        </div>
      )}

      {/* Empty state */}
      {!loading && logs.length === 0 && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">No activity log entries found.</p>
        </div>
      )}

      {/* Log entries */}
      {!loading && logs.length > 0 && (
        <div className="mt-4 space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-lg border border-gray-200 bg-white px-4 py-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {log.actor_name}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {formatAction(log.action)}
                  </span>
                  <span className="ml-2 text-xs text-gray-400 capitalize">
                    on {log.entity_type}
                  </span>
                </div>
                <span className="flex-shrink-0 text-xs text-gray-400">
                  {timeAgo(log.created_at)}
                </span>
              </div>
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="mt-1.5">
                  <p className="rounded bg-gray-50 px-3 py-2 text-xs text-gray-600">
                    {formatMetadata(log.metadata)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
              aria-label="Previous page"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i;
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-md border px-3 py-1 text-sm ${
                    p === page
                      ? 'border-rose-600 bg-rose-50 text-rose-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
