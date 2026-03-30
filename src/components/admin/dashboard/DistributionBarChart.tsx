import type { DistributionEntry } from '@/types/dashboard';

interface DonutChartProps {
  data: DistributionEntry[];
  emptyMessage?: string;
}

// Color palette for donut segments
const COLORS = [
  '#F43F5E', '#FB923C', '#FBBF24', '#34D399', '#22D3EE',
  '#818CF8', '#A78BFA', '#F472B6', '#94A3B8', '#6EE7B7',
  '#FCA5A5', '#FDE68A', '#A5F3FC', '#C4B5FD', '#FDBA74',
];

export function DistributionBarChart({ data, emptyMessage = 'No data available' }: DonutChartProps) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">{emptyMessage}</p>;
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (total === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">{emptyMessage}</p>;
  }

  // SVG donut parameters
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 70;
  const innerRadius = 45;

  // Build arc segments
  let cumulativeAngle = -90; // start at top
  const segments = data.map((entry, i) => {
    const angle = (entry.count / total) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    const endAngle = cumulativeAngle;
    return { ...entry, startAngle, endAngle, color: COLORS[i % COLORS.length] };
  });

  function polarToCartesian(centerX: number, centerY: number, radius: number, angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: centerX + radius * Math.cos(rad), y: centerY + radius * Math.sin(rad) };
  }

  function describeArc(startAngle: number, endAngle: number, outer: number, inner: number) {
    const sweep = endAngle - startAngle;
    const largeArc = sweep > 180 ? 1 : 0;

    const outerStart = polarToCartesian(cx, cy, outer, startAngle);
    const outerEnd = polarToCartesian(cx, cy, outer, endAngle);
    const innerStart = polarToCartesian(cx, cy, inner, endAngle);
    const innerEnd = polarToCartesian(cx, cy, inner, startAngle);

    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${outer} ${outer} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${inner} ${inner} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
      'Z',
    ].join(' ');
  }

  return (
    <div className="flex items-center gap-6">
      {/* Donut chart */}
      <div className="flex-shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((seg, i) => {
            // Handle full circle (single segment)
            if (segments.length === 1) {
              return (
                <g key={i}>
                  <circle cx={cx} cy={cy} r={outerRadius} fill={seg.color} />
                  <circle cx={cx} cy={cy} r={innerRadius} fill="white" />
                </g>
              );
            }
            // Small gap between segments
            const gap = 1;
            const start = seg.startAngle + gap / 2;
            const end = seg.endAngle - gap / 2;
            if (end <= start) return null;
            return (
              <path
                key={i}
                d={describeArc(start, end, outerRadius, innerRadius)}
                fill={seg.color}
              />
            );
          })}
          {/* Center text */}
          <text x={cx} y={cy - 6} textAnchor="middle" className="text-lg font-semibold" fill="#111827">
            {total}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" className="text-[10px]" fill="#9CA3AF">
            total
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 max-h-[160px] overflow-y-auto space-y-1">
        {segments.map((seg, i) => {
          const pct = Math.round((seg.count / total) * 100);
          return (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block h-3 w-3 flex-shrink-0 rounded-sm"
                style={{ backgroundColor: seg.color }}
              />
              <span className="flex-1 truncate text-gray-700">{seg.label}</span>
              <span className="flex-shrink-0 text-xs text-gray-500">{seg.count} ({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
