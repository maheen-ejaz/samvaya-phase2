'use client';

import { useState } from 'react';
import type { MatchSuggestionWithProfiles, CompatibilityReport } from '@/types/matching';
import { CompatibilityBreakdown } from './CompatibilityBreakdown';

interface SuggestionCardProps {
  suggestion: MatchSuggestionWithProfiles;
  onApprove: (id: string, narrative: string, notes: string) => Promise<void>;
  onReject: (id: string, notes: string) => Promise<void>;
}

function getScoreBadgeColor(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800';
  if (score >= 65) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

function getRecommendationLabel(rec: string): string {
  switch (rec) {
    case 'strongly_recommend': return 'Strongly Recommend';
    case 'recommend': return 'Recommend';
    case 'worth_considering': return 'Worth Considering';
    case 'not_recommended': return 'Not Recommended';
    default: return rec;
  }
}

export function SuggestionCard({ suggestion, onApprove, onReject }: SuggestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [narrative, setNarrative] = useState(suggestion.match_narrative || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const report = suggestion.compatibility_report as CompatibilityReport;

  const handleApprove = async () => {
    setValidationError(null);
    setLoading(true);
    try {
      await onApprove(suggestion.id, narrative, notes);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Approval failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      setValidationError('Please provide a rejection reason');
      return;
    }
    setValidationError(null);
    setLoading(true);
    try {
      await onReject(suggestion.id, notes);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Rejection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      {/* Header: Two profiles + score */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-6">
          {/* Profile A */}
          <div className="flex-1">
            <p className="font-medium text-gray-900">{suggestion.profile_a.full_name}</p>
            <p className="text-sm text-gray-500">
              {suggestion.profile_a.age ? `${suggestion.profile_a.age}y` : '—'}{' '}
              {suggestion.profile_a.gender || ''}{' '}
              {suggestion.profile_a.specialty?.join(', ') || ''}
            </p>
            <p className="text-xs text-gray-400">
              {[suggestion.profile_a.current_city, suggestion.profile_a.current_state]
                .filter(Boolean)
                .join(', ') || '—'}
            </p>
          </div>

          {/* Score Badge */}
          <div className="flex flex-col items-center">
            <span
              className={`rounded-full px-3 py-1 text-lg font-bold ${getScoreBadgeColor(
                suggestion.overall_compatibility_score
              )}`}
            >
              {suggestion.overall_compatibility_score}
            </span>
            {suggestion.recommendation && (
              <span className="mt-1 text-xs text-gray-500">
                {getRecommendationLabel(suggestion.recommendation)}
              </span>
            )}
          </div>

          {/* Profile B */}
          <div className="flex-1 text-right">
            <p className="font-medium text-gray-900">{suggestion.profile_b.full_name}</p>
            <p className="text-sm text-gray-500">
              {suggestion.profile_b.age ? `${suggestion.profile_b.age}y` : '—'}{' '}
              {suggestion.profile_b.gender || ''}{' '}
              {suggestion.profile_b.specialty?.join(', ') || ''}
            </p>
            <p className="text-xs text-gray-400">
              {[suggestion.profile_b.current_city, suggestion.profile_b.current_state]
                .filter(Boolean)
                .join(', ') || '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Stale badge */}
      {suggestion.is_stale && (
        <span className="mt-2 inline-block rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
          Stale — profiles updated since scoring
        </span>
      )}

      {/* Expand toggle */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-rose-600 hover:text-rose-700"
          aria-expanded={expanded}
        >
          {expanded ? 'Hide Details' : 'Show Details'}
        </button>
        {suggestion.admin_status === 'pending_review' && (
          <button
            onClick={() => setShowActions(!showActions)}
            className="text-sm text-gray-600 hover:text-gray-700"
          >
            {showActions ? 'Hide Actions' : 'Review'}
          </button>
        )}
      </div>

      {/* Expanded: Compatibility Breakdown */}
      {expanded && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <CompatibilityBreakdown report={report} />
        </div>
      )}

      {/* Actions: Approve / Reject */}
      {showActions && suggestion.admin_status === 'pending_review' && (
        <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          <div>
            <label htmlFor={`narrative-${suggestion.id}`} className="block text-sm font-medium text-gray-700">
              Match Narrative (editable)
            </label>
            <textarea
              id={`narrative-${suggestion.id}`}
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor={`notes-${suggestion.id}`} className="block text-sm font-medium text-gray-700">
              Admin Notes {suggestion.admin_status === 'pending_review' && '(required for rejection)'}
            </label>
            <textarea
              id={`notes-${suggestion.id}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Notes or rejection reason..."
            />
          </div>
          {validationError && (
            <p className="text-sm text-red-600" role="alert">{validationError}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Approve Match'}
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Reject'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
