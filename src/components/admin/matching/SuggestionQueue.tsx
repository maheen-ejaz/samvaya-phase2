'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import type { MatchSuggestionWithProfiles } from '@/types/matching';
import { SuggestionCard } from './SuggestionCard';
import { MatchDrawer } from './MatchDrawer';

interface PoolHealth {
  active_pool: number;
  paused: number;
  not_verified: number;
}

interface StatusCounts {
  pending_review: number;
  approved: number;
  rejected: number;
}

type StatusFilter = 'all' | 'pending_review' | 'approved' | 'rejected';
type SortField = 'score' | 'date';
type SortDir = 'asc' | 'desc';

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export function SuggestionQueue() {
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get('status') as StatusFilter) || 'pending_review';

  const [suggestions, setSuggestions] = useState<MatchSuggestionWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<{ message: string; isError: boolean; usersSkipped?: number } | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [poolHealth, setPoolHealth] = useState<PoolHealth | null>(null);
  const [statusCounts, setStatusCounts] = useState<StatusCounts | null>(null);
  const [drawerIndex, setDrawerIndex] = useState<number | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/matching/suggestions?status=${statusFilter}&page=${page}&limit=20`
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch suggestions');
      }
      const data = await res.json();
      setSuggestions(data.suggestions);
      setTotal(data.total);
      if (data.counts) setStatusCounts(data.counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  const fetchPoolHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/matching/pool-health');
      if (res.ok) {
        const data = await res.json();
        setPoolHealth(data);
      }
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
    fetchPoolHealth();
  }, [fetchSuggestions, fetchPoolHealth]);

  const runPipeline = async (mode: 'pre-filter' | 'batch-score') => {
    setPipelineLoading(true);
    setPipelineResult(null);
    try {
      const endpoint =
        mode === 'pre-filter'
          ? '/api/admin/matching/pre-filter'
          : '/api/admin/matching/batch-score';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'batch-score' ? { mode: 'all' } : {}),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `${mode} failed`);
      }

      const data = await res.json();

      if (mode === 'pre-filter') {
        setPipelineResult({
          message: `Pre-filter complete: ${data.stats.total_in_pool} in pool, ${data.stats.pairs_after_filter} pairs found (${data.stats.reduction_pct}% reduction)`,
          isError: false,
          usersSkipped: data.stats.users_skipped ?? 0,
        });
      } else {
        setPipelineResult({
          message: `Batch scoring complete: ${data.scoring.scored} scored, ${data.scoring.skipped_cached} cached, ${data.scoring.failed} failed${data.scoring.daily_limit_reached ? ' (daily limit reached)' : ''}`,
          isError: false,
        });
      }

      fetchSuggestions();
      fetchPoolHealth();
    } catch (err) {
      setPipelineResult({
        message: err instanceof Error ? err.message : 'Pipeline failed',
        isError: true,
      });
    } finally {
      setPipelineLoading(false);
    }
  };

  const handleApprove = async (id: string, narrative: string, notes: string) => {
    const res = await fetch(`/api/admin/matching/suggestions/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', narrative, notes }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Approval failed. Please try again.');
    }
    fetchSuggestions();
  };

  const handleReject = async (id: string, notes: string) => {
    const res = await fetch(`/api/admin/matching/suggestions/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', notes }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Rejection failed. Please try again.');
    }
    fetchSuggestions();
  };

  // Client-side sort of fetched page
  const sortedSuggestions = useMemo(() => {
    const sorted = [...suggestions].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'score') cmp = a.overall_compatibility_score - b.overall_compatibility_score;
      else if (sortField === 'date') cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [suggestions, sortField, sortDir]);

  const totalPages = Math.ceil(total / 20);

  const getTabLabel = (tab: typeof STATUS_TABS[0]) => {
    if (!statusCounts) return tab.label;
    const count = tab.value === 'all'
      ? (statusCounts.pending_review + statusCounts.approved + statusCounts.rejected)
      : statusCounts[tab.value as keyof StatusCounts];
    if (count === undefined) return tab.label;
    return `${tab.label} (${count})`;
  };

  return (
    <div className="space-y-5">

      {/* Pipeline Controls card */}
      <div className="rounded-xl border border-gray-200/60 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">Pipeline Controls</h3>
        </div>
        <div className="px-6 py-4 space-y-4">

          {/* Stats strip */}
          {statusCounts && (
            <div className="flex items-center gap-6">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Queue</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-sm font-semibold text-gray-900">{statusCounts.pending_review}</span>
                  <span className="text-sm text-gray-500">pending</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-admin-green-500" />
                  <span className="text-sm font-semibold text-gray-900">{statusCounts.approved}</span>
                  <span className="text-sm text-gray-500">approved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="text-sm font-semibold text-gray-900">{statusCounts.rejected}</span>
                  <span className="text-sm text-gray-500">rejected</span>
                </div>
              </div>

              {poolHealth && (
                <>
                  <span className="text-gray-200">|</span>
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Pool</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-admin-green-500" />
                      <span className="text-sm font-semibold text-gray-900">{poolHealth.active_pool}</span>
                      <span className="text-sm text-gray-500">active</span>
                    </div>
                    {poolHealth.paused > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        <span className="text-sm font-semibold text-amber-700">{poolHealth.paused}</span>
                        <span className="text-sm text-gray-500">paused</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-gray-300" />
                      <span className="text-sm font-semibold text-gray-500">{poolHealth.not_verified}</span>
                      <span className="text-sm text-gray-500">pending BGV</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Pipeline buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => runPipeline('pre-filter')}
              disabled={pipelineLoading}
              className="rounded-full bg-admin-green-900 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-admin-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {pipelineLoading ? 'Running…' : 'Run Pre-filter'}
            </button>
            <button
              onClick={() => runPipeline('batch-score')}
              disabled={pipelineLoading}
              className="rounded-full border border-admin-green-300 bg-admin-green-50 px-5 py-2 text-sm font-medium text-admin-green-900 hover:bg-admin-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {pipelineLoading ? 'Running…' : 'Run Full Pipeline'}
            </button>
          </div>

          {/* Pipeline result */}
          {pipelineResult && (
            <div
              className={`rounded-lg px-4 py-2.5 text-sm ${pipelineResult.isError ? 'bg-red-50 text-red-700' : 'bg-admin-green-50 text-admin-green-900'}`}
              role={pipelineResult.isError ? 'alert' : 'status'}
            >
              {pipelineResult.message}
              {!pipelineResult.isError && (pipelineResult.usersSkipped ?? 0) > 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  ⚠ {pipelineResult.usersSkipped} user{pipelineResult.usersSkipped === 1 ? '' : 's'} skipped due to profile data errors. Check server logs.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Suggestions list card */}
      <div className="rounded-xl border border-gray-200/60 bg-white shadow-sm">
        {/* Header: filter tabs + sort */}
        <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setStatusFilter(tab.value); setPage(1); setDrawerIndex(null); }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-admin-green-900 text-white shadow-sm'
                    : 'border border-gray-200 text-gray-500 hover:border-admin-green-300 hover:text-admin-green-900'
                }`}
              >
                {getTabLabel(tab)}
              </button>
            ))}
          </div>

          {/* Sort control */}
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
            <span className="text-xs">Sort:</span>
            <select
              value={`${sortField}-${sortDir}`}
              onChange={(e) => {
                const [f, d] = e.target.value.split('-') as [SortField, SortDir];
                setSortField(f);
                setSortDir(d);
              }}
              className="rounded-lg border border-gray-200 px-2 py-1 text-sm focus:border-admin-green-400 focus:outline-none"
            >
              <option value="score-desc">Score (High → Low)</option>
              <option value="score-asc">Score (Low → High)</option>
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-admin-green-600" />
          </div>
        )}

        {/* Empty state */}
        {!loading && sortedSuggestions.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400">No match suggestions in this category.</p>
            <p className="mt-1 text-xs text-gray-300">Run the pipeline to generate new suggestions.</p>
          </div>
        )}

        {/* Suggestion cards */}
        {!loading && sortedSuggestions.length > 0 && (
          <div className="divide-y divide-gray-100">
            {sortedSuggestions.map((s, idx) => (
              <SuggestionCard
                key={s.id}
                suggestion={s}
                onOpen={() => setDrawerIndex(idx)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 border-t border-gray-100 px-6 py-4">
            <button
              onClick={() => { setPage(Math.max(1, page - 1)); setDrawerIndex(null); }}
              disabled={page === 1}
              className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600 hover:border-admin-green-300 hover:text-admin-green-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => { setPage(Math.min(totalPages, page + 1)); setDrawerIndex(null); }}
              disabled={page === totalPages}
              className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600 hover:border-admin-green-300 hover:text-admin-green-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Match drawer */}
      {drawerIndex !== null && (
        <MatchDrawer
          suggestions={sortedSuggestions}
          currentIndex={drawerIndex}
          onNavigate={setDrawerIndex}
          onClose={() => setDrawerIndex(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
