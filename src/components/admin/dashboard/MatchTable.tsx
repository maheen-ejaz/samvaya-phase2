'use client';

import { cn } from '@/lib/utils';
import type { DashboardMatch } from '@/types/dashboard';
import { ApplicantStatusIcons } from '@/components/admin/ApplicantStatusIcons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MatchTableProps {
  matches: DashboardMatch[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onAction: (match: DashboardMatch) => void;
  actionLoading: string | null;
}

// Horizontal score bar with diagonal stripe texture
function ScoreBar({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));

  let barColor: string;
  if (clamped < 50) barColor = '#EF5350';
  else if (clamped < 75) barColor = '#FFA726';
  else barColor = '#66BB6A';

  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl font-light tabular-nums tracking-tight text-foreground">{score}</span>
      <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-muted">
        {/* Filled portion — diagonal stripes */}
        <div
          className="absolute inset-y-0 left-0 rounded-md"
          style={{
            width: `${clamped}%`,
            background: `repeating-linear-gradient(-45deg, ${barColor}, ${barColor} 4px, ${barColor}CC 4px, ${barColor}CC 8px)`,
          }}
        />
        {/* Unfilled portion — subtle gray stripes */}
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

// Ordered pipeline stages for the horizontal stepper
const STAGE_PIPELINE = [
  { key: 'pending_review', label: 'Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'presented', label: 'Presented' },
  { key: 'mutual_interest', label: 'Mutual Interest' },
] as const;

/** Horizontal stepper — filled stages get blue diagonal stripes, future stages get gray stripes */
function StageStepper({ currentStage }: { currentStage: string }) {
  const currentIdx = STAGE_PIPELINE.findIndex((s) => s.key === currentStage);

  return (
    <div className="flex flex-col gap-1.5">
      {/* Bar segments */}
      <div className="flex items-center gap-1">
        {STAGE_PIPELINE.map((stage, i) => {
          const isCompleted = i <= currentIdx;
          return (
            <div key={stage.key} className="relative h-3 flex-1 overflow-hidden rounded-full">
              <div
                className="absolute inset-0"
                style={{
                  background: isCompleted
                    ? 'hsl(var(--primary))'
                    : 'hsl(var(--muted))',
                }}
              />
              {/* Needle marker on current stage */}
              {i === currentIdx && (
                <div className="absolute -bottom-1.5 right-0 flex flex-col items-center">
                  <div className="h-3 w-0.5 bg-foreground" />
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Labels */}
      <div className="flex">
        {STAGE_PIPELINE.map((stage, i) => (
          <span
            key={stage.key}
            className={cn(
              'flex-1 text-[11px]',
              i <= currentIdx ? 'font-medium text-foreground' : 'text-muted-foreground',
              i === 0 ? 'text-left' : i === STAGE_PIPELINE.length - 1 ? 'text-right' : 'text-center'
            )}
          >
            {stage.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MatchTable({ matches, expandedId, onToggleExpand, onAction, actionLoading }: MatchTableProps) {
  if (matches.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No matches in this stage.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      {matches.map((match) => {
        const isExpanded = expandedId === match.suggestionId;

        return (
          <MatchCard
            key={match.suggestionId}
            match={match}
            isExpanded={isExpanded}
            onToggle={() => onToggleExpand(match.suggestionId)}
            onAction={() => onAction(match)}
            actionLoading={actionLoading === match.suggestionId}
          />
        );
      })}
    </div>
  );
}

/** Gender-based placeholder when no photo is uploaded */
function getPlaceholderSrc(gender?: string): string {
  if (gender?.toLowerCase() === 'male') return '/male-placeholder.jpg';
  if (gender?.toLowerCase() === 'female') return '/female-placeholder.jpg';
  return '/male-placeholder.jpg'; // default fallback
}

// Gender-based card gradient: blue tint for male, pink tint for female
function getCardStyle(gender?: string): string {
  const g = gender?.toLowerCase();
  if (g === 'male') return 'border-blue-200 bg-gradient-to-b from-blue-50/80 to-white';
  if (g === 'female') return 'border-pink-200 bg-gradient-to-b from-pink-50/80 to-white';
  return 'border-border bg-card';
}

/** Profile card — contained card with photo, name, and structured details */
function ProfileCard({ person }: { person: DashboardMatch['personA'] }) {
  const photoSrc = person.primaryPhotoUrl || getPlaceholderSrc(person.gender);
  const cardStyle = getCardStyle(person.gender);

  // Parse details: "28y · Female · Anesthesiology · Bangalore" → extract parts, skip gender
  const parts = person.details?.split(' \u00b7 ') || [];
  const genderValues = ['male', 'female', 'Male', 'Female'];
  const age = parts.find((p) => p.match(/^\d+y$/));
  const location = parts.find((p) => !p.match(/^\d+y$/) && !genderValues.includes(p) && parts.indexOf(p) === parts.length - 1) || parts[parts.length - 1];
  const specialty = parts.find((p) => !p.match(/^\d+y$/) && !genderValues.includes(p) && p !== location);

  return (
    <div className="flex-1">
      <Card className={cn('p-2.5 shadow-sm', cardStyle)}>
        {/* Photo */}
        <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted">
          <img src={photoSrc} alt={person.name} className="h-full w-full object-cover" />
        </div>

        {/* Name + details — left-aligned */}
        <div className="mt-2 px-0.5">
          <p className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
            {person.name}
            <ApplicantStatusIcons isGooCampusMember={person.isGooCampusMember ?? false} paymentStatus={person.paymentStatus} size={13} />
          </p>

          {/* Specialty */}
          {specialty && (
            <p className="mt-1 text-sm text-muted-foreground">{specialty}</p>
          )}

          {/* Age + Location in a 2-column row */}
          {(age || location) && (
            <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
              {age && <span>{age}</span>}
              {location && <span>{location}</span>}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function MatchCard({
  match,
  isExpanded,
  onToggle,
  onAction,
  actionLoading,
}: {
  match: DashboardMatch;
  isExpanded: boolean;
  onToggle: () => void;
  onAction: () => void;
  actionLoading: boolean;
}) {
  return (
    <Card className={cn(
      'rounded-2xl transition-shadow',
      isExpanded ? 'ring-2 ring-ring shadow-md' : 'hover:shadow-sm'
    )}>
      {/* Match layout: profiles on top, gauge + CTA on bottom */}
      <CardContent className="cursor-pointer" onClick={onToggle}>
        {/* Row 1: Two profile cards side by side — female always on the left */}
        {(() => {
          const [first, second] = match.personA?.gender?.toLowerCase() === 'female'
            ? [match.personA, match.personB]
            : [match.personB, match.personA];
          return (
            <div className="flex gap-3">
              <ProfileCard person={first} />
              <ProfileCard person={second} />
            </div>
          );
        })()}

        {/* Row 2: Score bar */}
        <div className="mt-3">
          <ScoreBar score={match.compatibilityScore} />
        </div>

        {/* Row 3: Stage stepper */}
        <div className="mt-4">
          <StageStepper currentStage={match.currentStage} />
        </div>

        {/* Row 4: CTA right-aligned */}
        <div className="mt-3 flex items-center justify-end gap-3">
          <span className="text-xs text-muted-foreground">{match.daysInStage}d in stage</span>
          <Button
            onClick={(e) => { e.stopPropagation(); onAction(); }}
            disabled={actionLoading}
            size="sm"
          >
            {actionLoading ? '...' : match.nextAction}
          </Button>
        </div>
      </CardContent>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/50 px-8 py-5">
          {match.fullNarrative && (
            <Card className="mb-4">
              <CardContent>
                <h4 className="text-xs font-semibold uppercase text-muted-foreground">Why This Match</h4>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{match.fullNarrative}</p>
              </CardContent>
            </Card>
          )}

          {match.compatibilityReport && (
            <HighlightsConcerns report={match.compatibilityReport} />
          )}

          {match.adminNotes && (
            <Card className="mt-3">
              <CardContent>
                <h4 className="text-xs font-semibold uppercase text-muted-foreground">Admin Notes</h4>
                <p className="mt-1 text-sm text-foreground">{match.adminNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </Card>
  );
}

function HighlightsConcerns({ report }: { report: Record<string, unknown> }) {
  const highlights = Array.isArray(report.highlights) ? report.highlights as string[] : [];
  const concerns = Array.isArray(report.concerns) ? report.concerns as string[] : [];

  if (highlights.length === 0 && concerns.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {highlights.length > 0 && (
        <Card className="border-border bg-muted">
          <CardContent>
            <h5 className="text-xs font-semibold text-primary">Highlights</h5>
            <ul className="mt-1.5 space-y-1">
              {highlights.map((h, i) => (
                <li key={i} className="text-xs text-primary">+ {h}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {concerns.length > 0 && (
        <Card className="border-border bg-muted/50">
          <CardContent>
            <h5 className="text-xs font-semibold text-foreground">Concerns</h5>
            <ul className="mt-1.5 space-y-1">
              {concerns.map((c, i) => (
                <li key={i} className="text-xs text-muted-foreground">! {c}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
