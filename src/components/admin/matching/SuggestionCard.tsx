'use client';

import { useMemo, useRef } from 'react';
import type { MatchSuggestionWithProfiles } from '@/types/matching';
import { capitalize } from '@/lib/utils';
import { ApplicantStatusIcons } from '@/components/admin/ApplicantStatusIcons';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SuggestionCardProps {
  suggestion: MatchSuggestionWithProfiles;
  onOpen: () => void;
}

function getPlaceholderSrc(gender?: string | null, slotIndex = 1): string {
  if (gender?.toLowerCase() === 'male') return '/male-placeholder.jpg';
  if (gender?.toLowerCase() === 'female') return '/female-placeholder.jpg';
  // Samvaya always pairs male+female; left slot (0) is female, right slot (1) is male
  return slotIndex === 0 ? '/female-placeholder.jpg' : '/male-placeholder.jpg';
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

function getRecommendationVariant(rec: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (rec) {
    case 'strongly_recommend': return 'default';
    case 'recommend': return 'secondary';
    case 'worth_considering': return 'outline';
    case 'not_recommended': return 'destructive';
    default: return 'outline';
  }
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'approved': return 'default';
    case 'rejected': return 'destructive';
    case 'pending_review': return 'outline';
    default: return 'outline';
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
      <span className="text-3xl font-light tabular-nums tracking-tight text-foreground">{score}</span>
      <div className="relative h-4 flex-1 overflow-hidden rounded-md bg-muted">
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

function ProfileMiniCard({ person, slotIndex }: { person: MatchSuggestionWithProfiles['profile_a']; slotIndex: number }) {
  const photoSrc = person.primary_photo_url || getPlaceholderSrc(person.gender, slotIndex);
  const cardStyle = getCardGradient(person.gender);
  const specialty = person.specialty?.map((s) => capitalize(s)).join(', ') || null;
  const age = person.age ? `${person.age}y` : null;
  const location = [person.current_city, person.current_state]
    .filter(Boolean).map((v) => capitalize(v!)).join(', ') || null;

  return (
    <div className={`flex-1 rounded-xl border p-2.5 ${cardStyle}`}>
      <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted">
        <img src={photoSrc} alt={person.full_name} className="h-full w-full object-cover" />
      </div>
      <div className="mt-2 px-0.5">
        <p className="inline-flex items-center gap-1 truncate text-sm font-bold text-foreground">
          {person.full_name}
          <ApplicantStatusIcons isGooCampusMember={person.is_goocampus_member ?? false} paymentStatus={person.payment_status} size={12} />
        </p>
        {specialty && <p className="mt-0.5 truncate text-xs text-muted-foreground">{specialty}</p>}
        {(age || location) && (
          <div className="mt-0.5 flex items-center justify-between text-xs text-muted-foreground/70">
            {age && <span>{age}</span>}
            {location && <span className="truncate ml-1 text-right">{location}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export function SuggestionCard({ suggestion, onOpen }: SuggestionCardProps) {
  // eslint-disable-next-line react-hooks/purity -- Date.now() used once at mount via ref, stable for display purposes
  const nowRef = useRef(Date.now());
  const daysAgo = useMemo(
    () => Math.floor(
      (nowRef.current - new Date(suggestion.created_at).getTime()) / (1000 * 60 * 60 * 24)
    ),
    [suggestion.created_at]
  );

  return (
    <Card
      className="cursor-pointer p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(); }}
    >
      {/* Profile photos side by side — female always on the left */}
      {(() => {
        const [first, second] = suggestion.profile_a?.gender?.toLowerCase() === 'female'
          ? [suggestion.profile_a, suggestion.profile_b]
          : [suggestion.profile_b, suggestion.profile_a];
        return (
          <div className="flex gap-3">
            <ProfileMiniCard person={first} slotIndex={0} />
            <ProfileMiniCard person={second} slotIndex={1} />
          </div>
        );
      })()}

      {/* Score + badges */}
      <div className="mt-4 space-y-2.5">
        <ScoreBar score={suggestion.overall_compatibility_score} />

        <div className="flex flex-wrap items-center gap-1.5">
          {suggestion.recommendation && (
            <Badge variant={getRecommendationVariant(suggestion.recommendation)}>
              {getRecommendationLabel(suggestion.recommendation)}
            </Badge>
          )}
          <Badge variant={getStatusVariant(suggestion.admin_status)}>
            {getStatusLabel(suggestion.admin_status)}
          </Badge>
          {suggestion.is_stale && (
            <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">
              Stale
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`} · Click to review
        </p>
      </div>
    </Card>
  );
}
