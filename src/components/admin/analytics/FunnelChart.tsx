'use client';

interface FunnelStage {
  stage: string;
  count: number;
  placeholder?: boolean;
}

interface FunnelChartProps {
  data: FunnelStage[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  const activeStages = data.filter((d) => !d.placeholder);
  const placeholderStages = data.filter((d) => d.placeholder);
  const maxCount = Math.max(...activeStages.map((d) => d.count), 1);

  // SVG funnel dimensions
  const svgWidth = 280;
  const stageHeight = 60;
  const gap = 4;
  const svgHeight = activeStages.length * (stageHeight + gap) + placeholderStages.length * 40;
  const centerX = svgWidth / 2;
  const minWidth = 60;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">Applicant Funnel</h2>
      <p className="mt-1 text-sm text-gray-500">Progression through each stage.</p>

      <div className="mt-6 flex justify-center">
        <div className="relative">
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          >
            <defs>
              <linearGradient id="vfunnel-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.7)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0.2)" />
              </linearGradient>
            </defs>

            {activeStages.map((stage, i) => {
              const widthRatio = Math.max(0.2, stage.count / maxCount);
              const nextStage = i < activeStages.length - 1 ? activeStages[i + 1] : null;
              const nextWidthRatio = nextStage
                ? Math.max(0.2, nextStage.count / maxCount)
                : widthRatio * 0.7;

              const topWidth = Math.max(minWidth, (svgWidth - 40) * widthRatio);
              const bottomWidth = Math.max(minWidth, (svgWidth - 40) * nextWidthRatio);

              const y = i * (stageHeight + gap);
              const topLeft = centerX - topWidth / 2;
              const topRight = centerX + topWidth / 2;
              const bottomLeft = centerX - bottomWidth / 2;
              const bottomRight = centerX + bottomWidth / 2;

              const opacity = 0.3 + (1 - i / activeStages.length) * 0.5;

              return (
                <g key={stage.stage}>
                  <path
                    d={`M ${topLeft} ${y} L ${topRight} ${y} L ${bottomRight} ${y + stageHeight} L ${bottomLeft} ${y + stageHeight} Z`}
                    fill={`rgba(59, 130, 246, ${opacity})`}
                    stroke="rgba(59, 130, 246, 0.3)"
                    strokeWidth="1"
                  />
                </g>
              );
            })}
          </svg>

          {/* Labels overlaid on the funnel */}
          {activeStages.map((stage, i) => {
            const y = i * (stageHeight + gap);
            const convPct = i > 0 && activeStages[i - 1].count > 0
              ? Math.min(100, Math.round((stage.count / activeStages[i - 1].count) * 100))
              : null;

            return (
              <div
                key={stage.stage}
                className="absolute flex items-center justify-between px-6"
                style={{
                  top: `${y + 8}px`,
                  left: 0,
                  right: 0,
                  height: `${stageHeight - 16}px`,
                }}
              >
                <span className="text-xs font-medium text-gray-700">{stage.stage}</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-gray-900">{stage.count.toLocaleString()}</span>
                  {convPct !== null && (
                    <span className="ml-2 text-[10px] text-gray-400">{convPct}%</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Placeholder stages */}
          {placeholderStages.map((stage, i) => {
            const y = activeStages.length * (stageHeight + gap) + i * 40;
            return (
              <div
                key={stage.stage}
                className="absolute left-0 right-0 flex items-center justify-center"
                style={{ top: `${y + 8}px`, height: '24px' }}
              >
                <span className="text-xs italic text-gray-400">{stage.stage} — coming soon</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
