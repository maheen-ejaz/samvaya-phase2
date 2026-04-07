'use client';

import { useState, useEffect, useCallback } from 'react';

interface IntroductionData {
  id: string;
  match_presentation_id: string;
  introduction_number: number;
  scheduled_at: string | null;
  meeting_link: string | null;
  is_team_facilitated: boolean;
  facilitator_id: string | null;
  status: string;
  outcome_member_a: string | null;
  outcome_member_b: string | null;
  team_feedback_notes: string | null;
  created_at: string;
}

export function IntroductionManager() {
  const [introductions, setIntroductions] = useState<IntroductionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [outcomeModal, setOutcomeModal] = useState<string | null>(null);
  const [outcomeA, setOutcomeA] = useState('want_to_continue');
  const [outcomeB, setOutcomeB] = useState('want_to_continue');
  const [teamNotes, setTeamNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchIntroductions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/matching/introductions?status=${statusFilter}&limit=50`
      );
      if (!res.ok) throw new Error('Failed to fetch introductions');
      const data = await res.json();
      setIntroductions(data.introductions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchIntroductions();
  }, [fetchIntroductions]);

  const handleRecordOutcome = async () => {
    if (!outcomeModal) return;
    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/admin/matching/introductions/${outcomeModal}/outcome`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            outcomeMemberA: outcomeA,
            outcomeMemberB: outcomeB,
            teamFeedbackNotes: teamNotes,
          }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to record outcome');
      }
      setOutcomeModal(null);
      setTeamNotes('');
      fetchIntroductions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rescheduled': return 'bg-amber-100 text-amber-800';
      case 'cancelled': return 'bg-gray-100 text-gray-600';
      case 'no_show': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label htmlFor="intro-status" className="text-sm font-medium text-gray-700">Status:</label>
        <select
          id="intro-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="all">All</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="rescheduled">Rescheduled</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-rose-600" />
        </div>
      )}

      {!loading && introductions.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">No introductions scheduled yet.</p>
        </div>
      )}

      {!loading && introductions.length > 0 && (
        <div className="space-y-3">
          {introductions.map((intro) => (
            <div key={intro.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Introduction #{intro.introduction_number}
                    {intro.is_team_facilitated && (
                      <span className="ml-2 text-xs text-gray-400">(facilitated)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {intro.scheduled_at
                      ? new Date(intro.scheduled_at).toLocaleString('en-IN')
                      : 'Not yet scheduled'}
                  </p>
                  {intro.meeting_link && (
                    <a
                      href={intro.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-rose-600 hover:text-rose-700"
                    >
                      Meeting Link
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-xs ${getStatusBadge(intro.status)}`}>
                    {intro.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                  {(intro.status === 'scheduled' || intro.status === 'rescheduled') && (
                    <button
                      onClick={() => setOutcomeModal(intro.id)}
                      className="rounded-md bg-gray-800 px-3 py-1 text-xs text-white hover:bg-gray-900"
                    >
                      Record Outcome
                    </button>
                  )}
                </div>
              </div>

              {/* Show outcomes if completed */}
              {intro.status === 'completed' && (
                <div className="mt-2 border-t border-gray-100 pt-2">
                  <p className="text-xs text-gray-500">
                    Member A: <span className="font-medium">{intro.outcome_member_a?.replace('_', ' ')}</span>
                    {' | '}
                    Member B: <span className="font-medium">{intro.outcome_member_b?.replace('_', ' ')}</span>
                  </p>
                  {intro.team_feedback_notes && (
                    <p className="mt-1 text-xs text-gray-500">Notes: {intro.team_feedback_notes}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Outcome recording modal */}
      {outcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="outcome-dialog-title"
          >
            <h3 id="outcome-dialog-title" className="text-lg font-semibold text-gray-900">
              Record Introduction Outcome
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Member A Outcome</label>
                <select
                  value={outcomeA}
                  onChange={(e) => setOutcomeA(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="want_to_continue">Want to Continue</option>
                  <option value="not_a_match">Not a Match</option>
                  <option value="need_more_time">Need More Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Member B Outcome</label>
                <select
                  value={outcomeB}
                  onChange={(e) => setOutcomeB(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="want_to_continue">Want to Continue</option>
                  <option value="not_a_match">Not a Match</option>
                  <option value="need_more_time">Need More Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Team Feedback Notes</label>
                <textarea
                  value={teamNotes}
                  onChange={(e) => setTeamNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Observations from the facilitated call..."
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleRecordOutcome}
                disabled={actionLoading}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Saving...' : 'Save Outcome'}
              </button>
              <button
                onClick={() => setOutcomeModal(null)}
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
