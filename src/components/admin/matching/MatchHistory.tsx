'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MatchSuggestionWithProfiles, CompatibilityReport } from '@/types/matching';
import { CompatibilityBreakdown } from './CompatibilityBreakdown';
import { ApplicantStatusIcons } from '@/components/admin/ApplicantStatusIcons';

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

  const STATUS_STYLES: Record<string, { bg: string; dot: string; text: string }> = {
    pending_review: { bg: 'bg-blue-50',  dot: 'bg-blue-500',  text: 'text-blue-800' },
    approved:       { bg: 'bg-green-50', dot: 'bg-green-500', text: 'text-green-800' },
    rejected:       { bg: 'bg-red-50',   dot: 'bg-red-500',   text: 'text-red-800' },
    expired:        { bg: 'bg-gray-100', dot: 'bg-gray-400',  text: 'text-gray-600' },
  };

  const getStatusBadge = (status: string) => {
    return STATUS_STYLES[status] || { bg: 'bg-gray-100', dot: 'bg-gray-400', text: 'text-gray-600' };
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
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th scope="col" className="px-5 py-3.5 text-sm font-normal text-gray-500">Person A</th>
                <th scope="col" className="px-5 py-3.5 text-sm font-normal text-gray-500">Person B</th>
                <th scope="col" className="px-5 py-3.5 text-sm font-normal text-gray-500">Score</th>
                <th scope="col" className="px-5 py-3.5 text-sm font-normal text-gray-500">Recommendation</th>
                <th scope="col" className="px-5 py-3.5 text-sm font-normal text-gray-500">Status</th>
                <th scope="col" className="px-5 py-3.5 text-sm font-normal text-gray-500">Date</th>
                <th scope="col" className="px-5 py-3.5 text-sm font-normal text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {suggestions.map((s) => {
                const badgeStyle = getStatusBadge(s.admin_status);
                return (
                  <>
                    <tr
                      key={s.id}
                      className="group relative border-l-2 border-l-transparent transition-all duration-150 hover:border-l-admin-green-300 hover:bg-gray-50 hover:shadow-sm hover:-translate-y-px"
                    >
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 font-medium text-gray-900">
                          {s.profile_a.full_name}
                          <ApplicantStatusIcons isGooCampusMember={s.profile_a.is_goocampus_member ?? false} paymentStatus={s.profile_a.payment_status} size={12} />
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 font-medium text-gray-900">
                          {s.profile_b.full_name}
                          <ApplicantStatusIcons isGooCampusMember={s.profile_b.is_goocampus_member ?? false} paymentStatus={s.profile_b.payment_status} size={12} />
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{s.overall_compatibility_score}</td>
                      <td className="px-5 py-4 text-gray-500">{s.recommendation?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${badgeStyle.bg} ${badgeStyle.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${badgeStyle.dot}`} />
                          {s.admin_status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {new Date(s.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:border-gray-300 hover:text-gray-900"
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
                );
              })}
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
