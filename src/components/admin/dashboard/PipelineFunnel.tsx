import type { PipelineStage } from '@/types/dashboard';

interface PipelineFunnelProps {
  data: PipelineStage[];
}

export function PipelineFunnel({ data }: PipelineFunnelProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const stageWidth = 100 / data.length;

  // SVG dimensions
  const svgWidth = 900;
  const svgHeight = 120;
  const topPad = 10;
  const bottomPad = 10;
  const chartHeight = svgHeight - topPad - bottomPad;

  // Build wave points — each stage gets a column, wave height = proportional to count
  const points: { x: number; y: number }[] = [];
  const baseY = svgHeight - bottomPad;

  for (let i = 0; i < data.length; i++) {
    const x = (i / (data.length - 1)) * svgWidth;
    const heightRatio = data[i].count / maxCount;
    const waveHeight = Math.max(chartHeight * 0.1, chartHeight * heightRatio);
    points.push({ x, y: baseY - waveHeight });
  }

  // Build smooth SVG path for the wave top
  let wavePath = `M 0 ${baseY}`;
  wavePath += ` L ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cpx = (curr.x + next.x) / 2;
    wavePath += ` C ${cpx} ${curr.y}, ${cpx} ${next.y}, ${next.x} ${next.y}`;
  }

  wavePath += ` L ${svgWidth} ${baseY}`;
  wavePath += ' Z';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">Pipeline</h2>

      {/* Stage labels + numbers above the wave */}
      <div className="mt-4 flex">
        {data.map((stage, i) => (
          <div
            key={stage.stage}
            className="flex-1 text-center"
            style={{ width: `${stageWidth}%` }}
          >
            <p className="text-xs text-gray-500 truncate">{stage.stage}</p>
            <p className="text-xl font-bold text-gray-900">{stage.count}</p>
            {stage.conversionPct !== null && stage.conversionPct !== undefined && (
              <p className="text-[10px] text-gray-400">{stage.conversionPct}%</p>
            )}
          </div>
        ))}
      </div>

      {/* Wave SVG */}
      <div className="mt-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-20"
          preserveAspectRatio="none"
          role="img"
          aria-label="Pipeline funnel chart"
        >
          <defs>
            <linearGradient id="funnel-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.6)" />
              <stop offset="40%" stopColor="rgba(59, 130, 246, 0.4)" />
              <stop offset="70%" stopColor="rgba(59, 130, 246, 0.25)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
            </linearGradient>
          </defs>
          <path
            d={wavePath}
            fill="url(#funnel-gradient)"
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </div>
  );
}
