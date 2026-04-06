'use client';

import type { CompatibilityReport } from '@/types/matching';
import { SCORING_DIMENSIONS } from '@/types/matching';
import { InteractiveSpiderChart } from '@/components/admin/dashboard/InteractiveSpiderChart';

interface CompatibilityBreakdownProps {
  report: CompatibilityReport;
}

export function CompatibilityBreakdown({ report }: CompatibilityBreakdownProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Column 1: Spider Chart (2/3) */}
      <div className="col-span-2">
        <InteractiveSpiderChart
          dimensions={Object.fromEntries(
            SCORING_DIMENSIONS.map((dim) => [dim, {
              score: report.dimension_scores[dim].score,
              weight: 0.11,
              notes: report.dimension_scores[dim].note || '',
            }])
          )}
          overallScore={report.overall_score}
        />
      </div>

      {/* Column 2: Highlights + Concerns + Narrative (1/3) */}
      <div className="space-y-4">
        <div className="space-y-4">
          {/* Highlights — 50% of column 2 */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-green-800">
              <span>✓</span> Highlights
            </h4>
            {report.highlights.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {report.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-900">
                    <span className="mt-0.5 text-green-500">+</span>
                    {h}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-green-600">No highlights noted.</p>
            )}
          </div>

          {/* Concerns — 50% of column 2 */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-red-800">
              <span>⚠</span> Concerns
            </h4>
            {report.concerns.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {report.concerns.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-900">
                    <span className="mt-0.5 text-red-500">!</span>
                    {c}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-red-600">No concerns noted.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
