'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MatchSuggestionWithProfiles, CompatibilityReport } from '@/types/matching';
import { CompatibilityBreakdown } from './CompatibilityBreakdown';

export function MatchHistory() {
  const [suggestions, setSuggestions] = useState<MatchSuggestionWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/matching/suggestions?status=${statusFilter}&page=${page}&limit=20`
      );
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setSuggestions(data.suggestions);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label htmlFor="history-status" className="text-sm font-medium text-gray-700">Status:</label>
        <select
          id="history-status"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="all">All</option>
          <option value="pending_review">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
        <span className="text-sm text-gray-500">{total} total</span>
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-rose-600" />
        </div>
      )}

      {!loading && suggestions.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">No match history found.</p>
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
              <tr>
                <th scope="col" className="px-4 py-3">Person A</th>
                <th scope="col" className="px-4 py-3">Person B</th>
                <th scope="col" className="px-4 py-3">Score</th>
                <th scope="col" className="px-4 py-3">Recommendation</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suggestions.map((s) => (
                <>
                  <tr key={s.id} className="bg-white hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.profile_a.full_name}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{s.profile_b.full_name}</td>
                    <td className="px-4 py-3">{s.overall_compatibility_score}</td>
                    <td className="px-4 py-3 capitalize">{s.recommendation?.replace('_', ' ') || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs ${getStatusBadge(s.admin_status)}`}>
                        {s.admin_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(s.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                        className="text-xs text-rose-600 hover:text-rose-700"
                      >
                        {expandedId === s.id ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === s.id && (
                    <tr key={`${s.id}-details`}>
                      <td colSpan={7} className="bg-gray-50 px-6 py-4">
                        <CompatibilityBreakdown report={s.compatibility_report as CompatibilityReport} />
                        {s.admin_notes && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-gray-500">Admin Notes:</p>
                            <p className="text-sm text-gray-700">{s.admin_notes}</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
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
