'use client';

import { useState } from 'react';
import type { DashboardMatch } from '@/types/dashboard';

interface MatchTableProps {
  matches: DashboardMatch[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onAction: (match: DashboardMatch) => void;
  actionLoading: string | null;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-700 bg-green-100 border-green-200';
  if (score >= 65) return 'text-amber-700 bg-amber-100 border-amber-200';
  return 'text-red-700 bg-red-100 border-red-200';
}

const STAGE_BADGE: Record<string, string> = {
  pending_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-purple-100 text-purple-700',
  presented: 'bg-amber-100 text-amber-700',
  mutual_interest: 'bg-green-100 text-green-700',
};

const STAGE_LABELS: Record<string, string> = {
  pending_review: 'Pending Review',
  approved: 'Approved',
  presented: 'Presented',
  mutual_interest: 'Mutual Interest',
};

export function MatchTable({ matches, expandedId, onToggleExpand, onAction, actionLoading }: MatchTableProps) {
  if (matches.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        No matches in this stage.
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
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
  const scoreColor = getScoreColor(match.compatibilityScore);

  return (
    <div className={`rounded-lg border transition-shadow ${isExpanded ? 'border-gray-300 shadow-md' : 'border-gray-200 hover:shadow-sm'}`}>
      {/* Card header — side-by-side profiles */}
      <div className="cursor-pointer p-4" onClick={onToggle}>
        <div className="flex items-center gap-4">
          {/* Person A */}
          <div className="flex-1 text-right">
            <p className="text-sm font-semibold text-gray-900">{match.personA.name}</p>
            {match.personA.details && (
              <p className="text-xs text-gray-500">{match.personA.details}</p>
            )}
          </div>

          {/* Score circle */}
          <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 ${scoreColor}`}>
            <span className="text-lg font-bold">{match.compatibilityScore}</span>
          </div>

          {/* Person B */}
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{match.personB.name}</p>
            {match.personB.details && (
              <p className="text-xs text-gray-500">{match.personB.details}</p>
            )}
          </div>

          {/* Stage + Action */}
          <div className="flex flex-shrink-0 items-center gap-3">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_BADGE[match.currentStage] || 'bg-gray-100'}`}>
              {STAGE_LABELS[match.currentStage]}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onAction(); }}
              disabled={actionLoading}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:bg-gray-300"
            >
              {actionLoading ? '...' : match.nextAction}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-5">
          {/* Match reason / narrative */}
          {match.fullNarrative && (
            <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
              <h4 className="text-xs font-semibold uppercase text-gray-500">Why This Match</h4>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{match.fullNarrative}</p>
            </div>
          )}

          {/* Highlights and Concerns side by side */}
          {match.compatibilityReport && (
            <HighlightsConcerns report={match.compatibilityReport} />
          )}

          {match.adminNotes && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
              <h4 className="text-xs font-semibold uppercase text-gray-500">Admin Notes</h4>
              <p className="mt-1 text-sm text-gray-600">{match.adminNotes}</p>
            </div>
          )}

          <p className="mt-3 text-xs text-gray-400">{match.daysInStage}d in current stage</p>
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
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <h5 className="text-xs font-semibold text-green-800">✓ Highlights</h5>
          <ul className="mt-1.5 space-y-1">
            {highlights.map((h, i) => (
              <li key={i} className="text-xs text-green-900">+ {h}</li>
            ))}
          </ul>
        </div>
      )}
      {concerns.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <h5 className="text-xs font-semibold text-red-800">⚠ Concerns</h5>
          <ul className="mt-1.5 space-y-1">
            {concerns.map((c, i) => (
              <li key={i} className="text-xs text-red-900">! {c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
