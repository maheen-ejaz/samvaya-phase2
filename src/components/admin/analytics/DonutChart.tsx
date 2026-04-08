export const DONUT_COLORS = [
  '#4F6EF7', // admin-blue-600 (primary)
  '#818CF8', // admin-blue-400
  '#A5B4FC', // admin-blue-300
  '#C7D2FE', // admin-blue-200
  '#2563EB', // admin-blue-700
  '#6B8AF9', // admin-blue-500
  '#1D4ED8', // admin-blue-800
  '#E0E7FF', // admin-blue-100
];

export interface DonutSlice {
  label: string;
  count: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  size?: number;
  strokeWidth?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  // Clamp arc to just under 360° to avoid SVG full-circle collapse
  const sweep = Math.min(endDeg - startDeg, 359.999);
  const start = polarToCartesian(cx, cy, r, startDeg);
  const end = polarToCartesian(cx, cy, r, startDeg + sweep);
  const largeArc = sweep >= 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function DonutChart({ data, size = 120, strokeWidth = 18 }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Build arc segments
  let startDeg = 0;
  const arcs = data
    .filter((slice) => slice.count > 0)
    .map((slice) => {
      const pct = slice.count / total;
      // Clamp so a single 100% slice doesn't collapse; use < 360 always
      const sweep = Math.min(pct * 360, 359.9999);
      const path = arcPath(center, center, radius, startDeg, startDeg + sweep);
      startDeg += pct * 360; // advance by real degrees so gaps don't accumulate
      return { ...slice, path };
    });

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
        />
        {/* Arcs */}
        {arcs.map((arc, i) => (
          <path
            key={i}
            d={arc.path}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      {/* Center label */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        aria-hidden="true"
      >
        <p className="text-lg font-semibold tabular-nums text-gray-900 leading-none">
          {total > 0 ? total.toLocaleString('en-IN') : '—'}
        </p>
        <p className="mt-0.5 text-[10px] text-gray-400">total</p>
      </div>
    </div>
  );
}
