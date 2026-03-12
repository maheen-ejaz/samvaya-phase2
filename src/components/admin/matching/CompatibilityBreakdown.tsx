'use client';

import type { CompatibilityReport, ScoringDimension } from '@/types/matching';
import { SCORING_DIMENSIONS, DIMENSION_LABELS } from '@/types/matching';

interface CompatibilityBreakdownProps {
  report: CompatibilityReport;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 65) return 'bg-amber-500';
  return 'bg-red-500';
}

function getScoreTextColor(score: number): string {
  if (score >= 80) return 'text-green-700';
  if (score >= 65) return 'text-amber-700';
  return 'text-red-700';
}

export function CompatibilityBreakdown({ report }: CompatibilityBreakdownProps) {
  return (
    <div className="space-y-6">
      {/* Dimension Scores */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Dimension Scores</h4>
        {SCORING_DIMENSIONS.map((dim: ScoringDimension) => {
          const ds = report.dimension_scores[dim];
          return (
            <div key={dim}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{DIMENSION_LABELS[dim]}</span>
                <span className={`font-medium ${getScoreTextColor(ds.score)}`}>
                  {ds.score}
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-gray-100">
                <div
                  className={`h-2 rounded-full ${getScoreColor(ds.score)}`}
                  style={{ width: `${ds.score}%` }}
                />
              </div>
              {ds.note && (
                <p className="mt-0.5 text-xs text-gray-500">{ds.note}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Highlights */}
      {report.highlights.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-green-700">Highlights</h4>
          <ul className="mt-1 space-y-1">
            {report.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5 text-green-500">+</span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Concerns */}
      {report.concerns.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-amber-700">Concerns</h4>
          <ul className="mt-1 space-y-1">
            {report.concerns.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5 text-amber-500">!</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Narrative */}
      {report.narrative && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Narrative</h4>
          <p className="mt-1 text-sm text-gray-600">{report.narrative}</p>
        </div>
      )}
    </div>
  );
}
