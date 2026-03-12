'use client';

import { useState, useEffect, useCallback } from 'react';

interface Presentation {
  id: string;
  status: string;
  member_a_response: string;
  member_b_response: string;
  is_mutual_interest: boolean;
  presented_at: string;
  expires_at: string;
  profile_a_name: string;
  profile_b_name: string;
  match_suggestions: {
    overall_compatibility_score: number;
    profile_a_id: string;
    profile_b_id: string;
  };
}

export function PresentationTracker() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [respondingTo, setRespondingTo] = useState<{ presentationId: string; memberId: string; memberLabel: string } | null>(null);
  const [responseValue, setResponseValue] = useState<'interested' | 'not_interested'>('interested');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPresentations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/matching/presentations?status=${statusFilter}&limit=50`
      );
      if (!res.ok) throw new Error('Failed to fetch presentations');
      const data = await res.json();
      setPresentations(data.presentations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPresentations();
  }, [fetchPresentations]);

  const getResponseBadge = (response: string) => {
    switch (response) {
      case 'interested': return 'bg-green-100 text-green-800';
      case 'not_interested': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-600';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'mutual_interest': return 'bg-green-100 text-green-800';
      case 'one_sided': return 'bg-amber-100 text-amber-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-600';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
    return `${days}d remaining`;
  };

  const handleRecordResponse = async () => {
    if (!respondingTo) return;
    setActionLoading(true);
    setSuccessMessage(null);
    try {
      const res = await fetch(
        `/api/admin/matching/presentations/${respondingTo.presentationId}/respond`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: respondingTo.memberId,
            response: responseValue,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to record response');
      }
      const data = await res.json();
      setSuccessMessage(
        data.is_mutual_interest
          ? 'Mutual interest confirmed!'
          : `Response recorded. Status: ${data.status}`
      );
      setRespondingTo(null);
      fetchPresentations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <label htmlFor="pres-status" className="text-sm font-medium text-gray-700">Status:</label>
        <select
          id="pres-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="mutual_interest">Mutual Interest</option>
          <option value="one_sided">One-Sided</option>
          <option value="expired">Expired</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>}
      {successMessage && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700" role="status">{successMessage}</div>}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-rose-600" />
        </div>
      )}

      {!loading && presentations.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">No presentations found.</p>
        </div>
      )}

      {!loading && presentations.length > 0 && (
        <div className="space-y-3">
          {presentations.map((p) => (
            <div key={p.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.profile_a_name}</p>
                    <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ${getResponseBadge(p.member_a_response)}`}>
                      {p.member_a_response}
                    </span>
                  </div>
                  <span className="text-gray-400">×</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.profile_b_name}</p>
                    <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ${getResponseBadge(p.member_b_response)}`}>
                      {p.member_b_response}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`rounded px-2 py-1 text-xs font-medium ${getStatusBadge(p.status)}`}>
                    {p.status.replace('_', ' ')}
                  </span>
                  <p className="mt-1 text-xs text-gray-400">
                    Score: {p.match_suggestions.overall_compatibility_score}
                  </p>
                  {p.status === 'pending' && (
                    <p className="text-xs text-gray-400">{getDaysRemaining(p.expires_at)}</p>
                  )}
                </div>
              </div>

              {/* Record response buttons */}
              {p.status === 'pending' && (
                <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                  {p.member_a_response === 'pending' && (
                    <button
                      onClick={() => setRespondingTo({
                        presentationId: p.id,
                        memberId: p.match_suggestions.profile_a_id,
                        memberLabel: p.profile_a_name,
                      })}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
                    >
                      Record {p.profile_a_name}&apos;s Response
                    </button>
                  )}
                  {p.member_b_response === 'pending' && (
                    <button
                      onClick={() => setRespondingTo({
                        presentationId: p.id,
                        memberId: p.match_suggestions.profile_b_id,
                        memberLabel: p.profile_b_name,
                      })}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
                    >
                      Record {p.profile_b_name}&apos;s Response
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Response dialog */}
      {respondingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="response-dialog-title"
          >
            <h3 id="response-dialog-title" className="text-lg font-semibold text-gray-900">
              Record Response
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Recording response for <strong>{respondingTo.memberLabel}</strong>
            </p>
            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="response"
                  value="interested"
                  checked={responseValue === 'interested'}
                  onChange={() => setResponseValue('interested')}
                />
                <span className="text-sm">Interested</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="response"
                  value="not_interested"
                  checked={responseValue === 'not_interested'}
                  onChange={() => setResponseValue('not_interested')}
                />
                <span className="text-sm">Not Interested</span>
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleRecordResponse}
                disabled={actionLoading}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setRespondingTo(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
