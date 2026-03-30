import type { DashboardMatch } from '@/types/dashboard';
import { InteractiveSpiderChart } from './InteractiveSpiderChart';

interface MatchRowDetailProps {
  match: DashboardMatch;
}

export function MatchRowDetail({ match }: MatchRowDetailProps) {
  const report = match.compatibilityReport;
  const hasDimensions = report && typeof report === 'object' && 'dimension_scores' in report;
  const dimensions = hasDimensions
    ? (report.dimension_scores as Record<string, { score: number; weight: number; notes: string }>)
    : null;
  const highlights = report && Array.isArray(report.highlights) ? report.highlights as string[] : [];
  const concerns = report && Array.isArray(report.concerns) ? report.concerns as string[] : [];

  return (
    <div className="bg-gray-50 px-6 py-5 border-t border-gray-100">
      {/* Match narrative */}
      {match.fullNarrative && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
          <h4 className="text-xs font-semibold uppercase text-gray-500">Why This Match</h4>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">{match.fullNarrative}</p>
        </div>
      )}

      {/* Spider chart + Highlights/Concerns side by side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left: Interactive spider chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          {dimensions ? (
            <InteractiveSpiderChart
              dimensions={dimensions}
              overallScore={match.compatibilityScore}
            />
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">No compatibility data available.</p>
          )}
        </div>

        {/* Right: Highlights + Concerns */}
        <div className="space-y-3">
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
          {match.adminNotes && (
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <h5 className="text-xs font-semibold text-gray-500">Admin Notes</h5>
              <p className="mt-1 text-xs text-gray-600">{match.adminNotes}</p>
            </div>
          )}
          <p className="text-xs text-gray-400">{match.daysInStage}d in current stage</p>
        </div>
      </div>
    </div>
  );
}
