'use client';

import { SpiderWebChart } from '@/components/app/SpiderWebChart';

interface CompatibilityChartProps {
  spiderWeb: {
    mine: Record<string, number> | null;
    theirs: Record<string, number> | null;
  };
  dimensionScores: Record<string, { score: number; note: string }> | null;
}

const DIMENSION_LABELS: Record<string, string> = {
  career_alignment: 'Career',
  values_alignment: 'Values',
  lifestyle_compatibility: 'Lifestyle',
  relocation_compatibility: 'Relocation',
  communication_compatibility: 'Communication',
  family_orientation: 'Family',
  financial_alignment: 'Financial',
  timeline_alignment: 'Timeline',
  emotional_compatibility: 'Emotional',
};

export function CompatibilityChart({ spiderWeb, dimensionScores }: CompatibilityChartProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h4 className="text-sm font-semibold text-gray-900">Compatibility Profile</h4>

      <div className="mt-3">
        <SpiderWebChart
          myScores={spiderWeb.mine}
          theirScores={spiderWeb.theirs}
        />
      </div>

      {dimensionScores && (
        <div className="mt-4 space-y-2">
          {Object.entries(dimensionScores).map(([key, { score }]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-24 text-xs text-gray-500 truncate">
                {DIMENSION_LABELS[key] ?? key}
              </span>
              <div className="flex-1">
                <div className="h-1.5 rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full bg-samvaya-red-light transition-all"
                    style={{ width: `${Math.min(100, score)}%` }}
                  />
                </div>
              </div>
              <span className="w-8 text-right text-xs text-gray-400">{score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
