'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MatchSuggestionWithProfiles, CompatibilityReport } from '@/types/matching';
import { CompatibilityBreakdown } from './CompatibilityBreakdown';
import { capitalize } from '@/lib/utils';

interface MatchDrawerProps {
  suggestions: MatchSuggestionWithProfiles[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
  onApprove: (id: string, narrative: string, notes: string) => Promise<void>;
  onReject: (id: string, notes: string) => Promise<void>;
}

function getPlaceholderSrc(gender?: string | null): string {
  if (gender?.toLowerCase() === 'male') return '/male-placeholder.jpg';
  if (gender?.toLowerCase() === 'female') return '/female-placeholder.jpg';
  return '/male-placeholder.jpg';
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

function getRecommendationStyle(rec: string): string {
  switch (rec) {
    case 'strongly_recommend': return 'bg-admin-green-100 text-admin-green-900 border-admin-green-200';
    case 'recommend': return 'bg-admin-green-50 text-admin-green-800 border-admin-green-100';
    case 'worth_considering': return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'not_recommended': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

function getStatusStyle(status: string): string {
  switch (status) {
    case 'approved': return 'bg-admin-green-100 text-admin-green-900 border-admin-green-200';
    case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
    case 'pending_review': return 'bg-amber-50 text-amber-800 border-amber-200';
    default: return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending_review': return 'Pending Review';
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    default: return status;
  }
}

function getCardGradient(gender?: string | null): string {
  const g = gender?.toLowerCase();
  if (g === 'male') return 'border-blue-200 bg-gradient-to-b from-blue-50/80 to-white';
  if (g === 'female') return 'border-pink-200 bg-gradient-to-b from-pink-50/80 to-white';
  return 'border-gray-200 bg-white';
}

/** Horizontal score bar — diagonal stripe texture */
function ScoreBar({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  let barColor: string;
  if (clamped < 50) barColor = '#EF5350';
  else if (clamped < 75) barColor = '#FFA726';
  else barColor = '#66BB6A';

  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl font-bold tabular-nums text-gray-900">{score}</span>
      <div className="relative h-4 flex-1 overflow-hidden rounded-md bg-gray-100">
        <div
          className="absolute inset-y-0 left-0 rounded-md"
          style={{
            width: `${clamped}%`,
            background: `repeating-linear-gradient(-45deg, ${barColor}, ${barColor} 4px, ${barColor}CC 4px, ${barColor}CC 8px)`,
          }}
        />
        <div
          className="absolute inset-y-0 right-0"
          style={{
            left: `${clamped}%`,
            background: 'repeating-linear-gradient(-45deg, #E5E7EB, #E5E7EB 4px, #F3F4F6 4px, #F3F4F6 8px)',
          }}
        />
      </div>
    </div>
  );
}

function ProfileCard({ person }: { person: MatchSuggestionWithProfiles['profile_a'] }) {
  const photoSrc = person.primary_photo_url || getPlaceholderSrc(person.gender);
  const cardStyle = getCardGradient(person.gender);
  const details = [
    person.specialty?.map((s) => capitalize(s)).join(', '),
  ].filter(Boolean);
  const age = person.age ? `${person.age}y` : null;
  const location = [person.current_city, person.current_state].filter(Boolean).map((v) => capitalize(v!)).join(', ') || null;

  return (
    <div className={`flex-1 rounded-2xl border p-4 shadow-sm ${cardStyle}`}>
      <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-100">
        <img src={photoSrc} alt={person.full_name} className="h-full w-full object-cover" />
      </div>
      <div className="mt-3 px-1">
        <p className="text-base font-bold text-gray-900">{person.full_name}</p>
        {details.length > 0 && <p className="mt-1 text-sm text-gray-500">{details.join(', ')}</p>}
        {(age || location) && (
          <div className="mt-1 flex items-center justify-between text-sm text-gray-400">
            {age && <span>{age}</span>}
            {location && <span>{location}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export function MatchDrawer({
  suggestions,
  currentIndex,
  onNavigate,
  onClose,
  onApprove,
  onReject,
}: MatchDrawerProps) {
  const suggestion = suggestions[currentIndex];
  const [narrative, setNarrative] = useState(suggestion?.match_narrative || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Reset form fields when suggestion changes
  useEffect(() => {
    setNarrative(suggestion?.match_narrative || '');
    setNotes('');
    setValidationError(null);
    setActionSuccess(null);
  }, [suggestion?.id, suggestion?.match_narrative]);

  // Escape key closes drawer
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
    if (e.key === 'ArrowRight' && currentIndex < suggestions.length - 1) onNavigate(currentIndex + 1);
  }, [onClose, onNavigate, currentIndex, suggestions.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!suggestion) return null;

  const report = suggestion.compatibility_report as CompatibilityReport;
  const isPending = suggestion.admin_status === 'pending_review';
  const daysAgo = Math.floor((Date.now() - new Date(suggestion.created_at).getTime()) / (1000 * 60 * 60 * 24));

  const handleApprove = async () => {
    setValidationError(null);
    setLoading(true);
    try {
      await onApprove(suggestion.id, narrative, notes);
      setActionSuccess('Match approved successfully.');
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Approval failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      setValidationError('Please provide a rejection reason in the notes field.');
      return;
    }
    setValidationError(null);
    setLoading(true);
    try {
      await onReject(suggestion.id, notes);
      setActionSuccess('Match rejected.');
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Rejection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-[640px] flex-col bg-white shadow-2xl">

        {/* Header */}
        <div className="flex shrink-0 items-center gap-4 border-b border-gray-100 px-6 py-4">
          {/* Prev/Next navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-admin-green-300 hover:text-admin-green-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous match (←)"
            >
              ←
            </button>
            <span className="min-w-[60px] text-center text-xs text-gray-400">
              {currentIndex + 1} of {suggestions.length}
            </span>
            <button
              onClick={() => onNavigate(currentIndex + 1)}
              disabled={currentIndex === suggestions.length - 1}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-admin-green-300 hover:text-admin-green-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next match (→)"
            >
              →
            </button>
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {suggestion.profile_a.full_name} &amp; {suggestion.profile_b.full_name}
            </p>
            <p className="text-xs text-gray-400">Created {daysAgo === 0 ? 'today' : `${daysAgo}d ago`}</p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Profile cards */}
          <div className="flex gap-4 px-6 pt-6">
            <ProfileCard person={suggestion.profile_a} />
            <ProfileCard person={suggestion.profile_b} />
          </div>

          {/* Score + badges */}
          <div className="px-6 pt-5">
            <ScoreBar score={suggestion.overall_compatibility_score} />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {suggestion.recommendation && (
                <span className={`rounded-full border px-3 py-0.5 text-xs font-medium ${getRecommendationStyle(suggestion.recommendation)}`}>
                  {getRecommendationLabel(suggestion.recommendation)}
                </span>
              )}
              <span className={`rounded-full border px-3 py-0.5 text-xs font-medium ${getStatusStyle(suggestion.admin_status)}`}>
                {getStatusLabel(suggestion.admin_status)}
              </span>
              {suggestion.is_stale && (
                <span className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-0.5 text-xs text-yellow-700">
                  Stale — profiles updated
                </span>
              )}
            </div>
          </div>

          {/* Compatibility breakdown */}
          {report && (
            <div className="px-6 pt-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">Compatibility Breakdown</h3>
              <CompatibilityBreakdown report={report} />
            </div>
          )}

          {/* Review form */}
          <div className="px-6 py-6">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                {isPending ? 'Review Decision' : 'Admin Review'}
              </h3>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-gray-400">
                  Match Narrative {!isPending && '(read-only)'}
                </label>
                <textarea
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  readOnly={!isPending}
                  rows={4}
                  className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm ${
                    isPending
                      ? 'border-gray-200 bg-white focus:border-admin-green-400 focus:ring-1 focus:ring-admin-green-400/30 focus:outline-none'
                      : 'border-transparent bg-white/60 text-gray-500 cursor-default'
                  }`}
                  placeholder="AI-generated narrative about why these two are compatible…"
                />
              </div>

              {isPending && (
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-gray-400">
                    Admin Notes (required for rejection)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-admin-green-400 focus:ring-1 focus:ring-admin-green-400/30 focus:outline-none"
                    placeholder="Notes or rejection reason…"
                  />
                </div>
              )}

              {suggestion.admin_notes && !isPending && (
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-gray-400">Admin Notes</label>
                  <p className="mt-1.5 rounded-lg border border-transparent bg-white/60 px-3 py-2 text-sm text-gray-500">{suggestion.admin_notes}</p>
                </div>
              )}

              {validationError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{validationError}</p>
              )}

              {actionSuccess && (
                <p className="rounded-lg bg-admin-green-50 px-3 py-2 text-sm text-admin-green-900" role="status">{actionSuccess}</p>
              )}

              {isPending && !actionSuccess && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleApprove}
                    disabled={loading}
                    className="rounded-full bg-admin-green-900 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-admin-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Processing…' : 'Approve Match'}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className="rounded-full border border-red-200 bg-red-50 px-6 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Processing…' : 'Reject'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
