'use client';

import type { MatchSuggestionWithProfiles } from '@/types/matching';
import { capitalize } from '@/lib/utils';

interface SuggestionCardProps {
  suggestion: MatchSuggestionWithProfiles;
  onOpen: () => void;
}

function getPlaceholderSrc(gender?: string | null): string {
  if (gender?.toLowerCase() === 'male') return '/male-placeholder.jpg';
  if (gender?.toLowerCase() === 'female') return '/female-placeholder.jpg';
  return '/male-placeholder.jpg';
}

function getCardGradient(gender?: string | null): string {
  const g = gender?.toLowerCase();
  if (g === 'male') return 'border-blue-200 bg-gradient-to-b from-blue-50/80 to-white';
  if (g === 'female') return 'border-pink-200 bg-gradient-to-b from-pink-50/80 to-white';
  return 'border-gray-200 bg-white';
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

function ProfileMiniCard({ person }: { person: MatchSuggestionWithProfiles['profile_a'] }) {
  const photoSrc = person.primary_photo_url || getPlaceholderSrc(person.gender);
  const cardStyle = getCardGradient(person.gender);
  const specialty = person.specialty?.map((s) => capitalize(s)).join(', ') || null;
  const age = person.age ? `${person.age}y` : null;
  const location = [person.current_city, person.current_state]
    .filter(Boolean).map((v) => capitalize(v!)).join(', ') || null;

  return (
    <div className={`w-44 rounded-2xl border p-3 shadow-sm ${cardStyle}`}>
      <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-100">
        <img src={photoSrc} alt={person.full_name} className="h-full w-full object-cover" />
      </div>
      <div className="mt-2.5 px-0.5">
        <p className="truncate text-sm font-bold text-gray-900">{person.full_name}</p>
        {specialty && <p className="mt-0.5 truncate text-xs text-gray-500">{specialty}</p>}
        {(age || location) && (
          <div className="mt-0.5 flex items-center justify-between text-xs text-gray-400">
            {age && <span>{age}</span>}
            {location && <span className="truncate ml-1">{location}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export function SuggestionCard({ suggestion, onOpen }: SuggestionCardProps) {
  const daysAgo = Math.floor(
    (Date.now() - new Date(suggestion.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className="flex cursor-pointer items-center gap-6 px-6 py-5 hover:bg-gray-50/60 transition-colors"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(); }}
    >
      {/* Profile A card */}
      <ProfileMiniCard person={suggestion.profile_a} />

      {/* Center: score + badges */}
      <div className="flex flex-1 flex-col items-center gap-3">
        <div className="w-full max-w-xs">
          <ScoreBar score={suggestion.overall_compatibility_score} />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {suggestion.recommendation && (
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRecommendationStyle(suggestion.recommendation)}`}>
              {getRecommendationLabel(suggestion.recommendation)}
            </span>
          )}
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(suggestion.admin_status)}`}>
            {getStatusLabel(suggestion.admin_status)}
          </span>
          {suggestion.is_stale && (
            <span className="rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-0.5 text-xs text-yellow-700">
              Stale
            </span>
          )}
        </div>

        <p className="text-xs text-gray-400">
          {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`} · Click to review
        </p>
      </div>

      {/* Profile B card */}
      <ProfileMiniCard person={suggestion.profile_b} />
    </div>
  );
}
