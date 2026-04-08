'use client';

interface FunnelStage {
  stage: string;
  count: number;
  placeholder?: boolean;
}

interface FunnelChartProps {
  data: FunnelStage[];
}

// Admin-blue shades from darkest (top of funnel) to lightest
const BAR_SHADES = [
  'bg-[#1E3A8A]',
  'bg-[#2563EB]',
  'bg-[#4F6EF7]',
  'bg-[#6B8AF9]',
  'bg-[#A5B4FC]',
  'bg-[#C7D2FE]',
];

export function FunnelChart({ data }: FunnelChartProps) {
  const activeStages = data.filter((d) => !d.placeholder);
  const placeholderStages = data.filter((d) => d.placeholder);
  const maxCount = Math.max(...activeStages.map((d) => d.count), 1);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Funnel</p>
      <h2 className="mt-1 text-lg font-semibold text-gray-900">Applicant Funnel</h2>
      <p className="mt-0.5 text-sm text-gray-500">Stage-by-stage progression with conversion rates.</p>

      <div className="mt-6 space-y-1">
        {activeStages.map((stage, i) => {
          const widthPct = Math.max(10, (stage.count / maxCount) * 100);
          const nextStage = activeStages[i + 1];
          const convPct =
            nextStage && stage.count > 0
              ? Math.min(100, Math.round((nextStage.count / stage.count) * 100))
              : null;
          const shade = BAR_SHADES[Math.min(i, BAR_SHADES.length - 1)];
          const textColor = i <= 1 ? 'text-white' : 'text-[#1E3A8A]';

          return (
            <div key={stage.stage}>
              {/* Bar row */}
              <div className="flex items-center gap-3">
                {/* Stage label — fixed width */}
                <p className="w-36 flex-shrink-0 text-[10px] font-semibold uppercase tracking-widest text-gray-500 text-right">
                  {stage.stage}
                </p>

                {/* Bar */}
                <div className="relative flex-1">
                  <div
                    className={`flex h-10 items-center rounded-md px-3 transition-all ${shade}`}
                    style={{ width: `${widthPct}%` }}
                  >
                    <span className={`text-sm font-semibold tabular-nums ${textColor}`}>
                      {stage.count.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Conversion label between stages */}
              {convPct !== null && (
                <div className="flex items-center gap-3">
                  <div className="w-36 flex-shrink-0" />
                  <div className="flex items-center gap-1 py-0.5 pl-3">
                    <span className="text-[10px] font-medium text-[#4F6EF7]">
                      ↓ {convPct}%
                    </span>
                    <span className="text-[10px] text-gray-400">conversion</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Placeholder stages */}
        {placeholderStages.length > 0 && (
          <div className="mt-2 flex items-center gap-3 border-t border-dashed border-gray-100 pt-3">
            <div className="w-36 flex-shrink-0" />
            <div className="flex flex-col gap-1">
              {placeholderStages.map((stage) => (
                <p key={stage.stage} className="text-xs italic text-gray-400">
                  {stage.stage} — coming soon
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
