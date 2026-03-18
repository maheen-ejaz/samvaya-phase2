'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MatchSuggestionWithProfiles } from '@/types/matching';
import { SuggestionCard } from './SuggestionCard';

export function SuggestionQueue() {
  const [suggestions, setSuggestions] = useState<MatchSuggestionWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<{ message: string; isError: boolean } | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

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
        });
      } else {
        setPipelineResult({
          message: `Batch scoring complete: ${data.scoring.scored} scored, ${data.scoring.skipped_cached} cached, ${data.scoring.failed} failed${data.scoring.daily_limit_reached ? ' (daily limit reached)' : ''}`,
          isError: false,
        });
      }

      fetchSuggestions();
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

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      {/* Pipeline Controls */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-900">Pipeline Controls</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            onClick={() => runPipeline('pre-filter')}
            disabled={pipelineLoading}
            className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pipelineLoading ? 'Running...' : 'Run Pre-filter'}
          </button>
          <button
            onClick={() => runPipeline('batch-score')}
            disabled={pipelineLoading}
            className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pipelineLoading ? 'Running...' : 'Run Full Pipeline'}
          </button>
        </div>
        {pipelineResult && (
          <p
            className={`mt-3 text-sm ${pipelineResult.isError ? 'text-red-600' : 'text-green-600'}`}
            role={pipelineResult.isError ? 'alert' : 'status'}
          >
            {pipelineResult.message}
          </p>
        )}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
          Status:
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="pending_review">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
        <span className="text-sm text-gray-500">{total} total</span>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-rose-600" />
        </div>
      )}

      {/* Suggestions List */}
      {!loading && suggestions.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            No match suggestions found. Run the pipeline to generate new suggestions.
          </p>
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="space-y-4">
          {suggestions.map((s) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
