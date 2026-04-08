'use client';

import type { DashboardMatch } from '@/types/dashboard';
import { ApplicantStatusIcons } from '@/components/admin/ApplicantStatusIcons';

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
      <span className="type-display-sm type-stat text-gray-900">{score}</span>
      <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-gray-100">
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

/** Horizontal stepper — filled stages get green diagonal stripes, future stages get gray stripes */
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
                    ? 'repeating-linear-gradient(-45deg, #4F6EF7, #4F6EF7 3px, #818CF8 3px, #818CF8 6px)'
                    : 'repeating-linear-gradient(-45deg, #E5E7EB, #E5E7EB 3px, #F3F4F6 3px, #F3F4F6 6px)',
                }}
              />
              {/* Needle marker on current stage */}
              {i === currentIdx && (
                <div className="absolute -bottom-1.5 right-0 flex flex-col items-center">
                  <div className="h-3 w-0.5 bg-gray-900" />
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-900" />
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
            className={`flex-1 text-[11px] ${i <= currentIdx ? 'font-medium text-gray-700' : 'text-gray-400'} ${i === 0 ? 'text-left' : i === STAGE_PIPELINE.length - 1 ? 'text-right' : 'text-center'}`}
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
      <div className="py-12 text-center text-sm text-gray-400">
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
  return 'border-gray-200 bg-white';
}

/** Profile card — contained card with photo, name, and structured details */
function ProfileCard({ person }: { person: DashboardMatch['personA'] }) {
  const photoSrc = person.primaryPhotoUrl || getPlaceholderSrc(person.gender);
  const cardStyle = getCardStyle(person.gender);

  // Parse details: "28y · Female · Anesthesiology · Bangalore" → extract parts, skip gender
  const parts = person.details?.split(' · ') || [];
  const genderValues = ['male', 'female', 'Male', 'Female'];
  const age = parts.find((p) => p.match(/^\d+y$/));
  const location = parts.find((p) => !p.match(/^\d+y$/) && !genderValues.includes(p) && parts.indexOf(p) === parts.length - 1) || parts[parts.length - 1];
  const specialty = parts.find((p) => !p.match(/^\d+y$/) && !genderValues.includes(p) && p !== location);

  return (
    <div className="flex-1">
      <div className={`rounded-xl border p-2.5 shadow-sm ${cardStyle}`}>
        {/* Photo */}
        <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100">
          <img src={photoSrc} alt={person.name} className="h-full w-full object-cover" />
        </div>

        {/* Name + details — left-aligned */}
        <div className="mt-2 px-0.5">
          <p className="inline-flex items-center gap-1 type-subheading text-gray-900">
            {person.name}
            <ApplicantStatusIcons isGooCampusMember={person.isGooCampusMember ?? false} paymentStatus={person.paymentStatus} size={13} />
          </p>

          {/* Specialty */}
          {specialty && (
            <p className="mt-1 text-sm text-gray-500">{specialty}</p>
          )}

          {/* Age + Location in a 2-column row */}
          {(age || location) && (
            <div className="mt-1 flex items-center justify-between text-sm text-gray-400">
              {age && <span>{age}</span>}
              {location && <span>{location}</span>}
            </div>
          )}
        </div>
      </div>
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
    <div className={`rounded-2xl border transition-shadow ${isExpanded ? 'border-admin-blue-300 shadow-md' : 'border-gray-200 hover:shadow-sm'}`}>
      {/* Match layout: profiles on top, gauge + CTA on bottom */}
      <div className="cursor-pointer px-4 py-4" onClick={onToggle}>
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
          <span className="text-xs text-gray-400">{match.daysInStage}d in stage</span>
          <button
            onClick={(e) => { e.stopPropagation(); onAction(); }}
            disabled={actionLoading}
            className="rounded-full bg-admin-blue-900 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-admin-blue-800 disabled:bg-gray-300"
          >
            {actionLoading ? '...' : match.nextAction}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-8 py-5">
          {match.fullNarrative && (
            <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
              <h4 className="text-xs font-semibold uppercase text-gray-500">Why This Match</h4>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{match.fullNarrative}</p>
            </div>
          )}

          {match.compatibilityReport && (
            <HighlightsConcerns report={match.compatibilityReport} />
          )}

          {match.adminNotes && (
            <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
              <h4 className="text-xs font-semibold uppercase text-gray-500">Admin Notes</h4>
              <p className="mt-1 text-sm text-gray-600">{match.adminNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HighlightsConcerns({ report }: { report: Record<string, unknown> }) {
  const highlights = Array.isArray(report.highlights) ? report.highlights as string[] : [];
  const concerns = Array.isArray(report.concerns) ? report.concerns as string[] : [];

  if (highlights.length === 0 && concerns.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {highlights.length > 0 && (
        <div className="rounded-lg border border-admin-blue-200 bg-admin-blue-50 p-3">
          <h5 className="text-xs font-semibold text-admin-blue-900">Highlights</h5>
          <ul className="mt-1.5 space-y-1">
            {highlights.map((h, i) => (
              <li key={i} className="text-xs text-admin-blue-800">+ {h}</li>
            ))}
          </ul>
        </div>
      )}
      {concerns.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <h5 className="text-xs font-semibold text-gray-700">Concerns</h5>
          <ul className="mt-1.5 space-y-1">
            {concerns.map((c, i) => (
              <li key={i} className="text-xs text-gray-600">! {c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
