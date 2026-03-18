import { Section, Field, formatEnum } from './IdentitySnapshot';

interface Dimension {
  label: string;
  score: number | null;
  notes: string | null;
}

interface CompatibilityProfileProps {
  dimensions: Dimension[];
  communicationStyle: string | null;
  conflictApproach: string | null;
  partnerRoleVision: string | null;
  financialValues: string | null;
}

export function CompatibilityProfile({
  dimensions,
  communicationStyle,
  conflictApproach,
  partnerRoleVision,
  financialValues,
}: CompatibilityProfileProps) {
  const hasScores = dimensions.some((d) => d.score !== null);

  return (
    <Section title="Compatibility Profile">
      {/* Spider Web Chart */}
      {hasScores && (
        <div className="mb-6 flex justify-center">
          <SpiderWebChart dimensions={dimensions} />
        </div>
      )}

      {/* Dimension Details */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {dimensions.map((d) => (
          <div key={d.label} className="rounded border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">{d.label}</span>
              <span className="text-sm font-semibold text-gray-900">
                {d.score !== null ? d.score : '—'}
              </span>
            </div>
            {d.notes && (
              <p className="mt-1 text-xs text-gray-500">{d.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Additional Dimensions */}
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 lg:grid-cols-4">
        <Field label="Communication Style" value={formatEnum(communicationStyle)} />
        <Field label="Conflict Approach" value={formatEnum(conflictApproach)} />
        <Field label="Partner Role Vision" value={formatEnum(partnerRoleVision)} />
        <Field label="Financial Values" value={formatEnum(financialValues)} />
      </div>
    </Section>
  );
}

function SpiderWebChart({ dimensions }: { dimensions: Dimension[] }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 110;
  const levels = 4;
  const n = dimensions.length;

  // Angle for each axis (starting from top, clockwise)
  function angleFor(i: number) {
    return (Math.PI * 2 * i) / n - Math.PI / 2;
  }

  function pointAt(i: number, radius: number) {
    const angle = angleFor(i);
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  }

  // Grid circles
  const gridLines = Array.from({ length: levels }, (_, l) => {
    const r = (maxRadius * (l + 1)) / levels;
    const points = Array.from({ length: n }, (_, i) => {
      const p = pointAt(i, r);
      return `${p.x},${p.y}`;
    }).join(' ');
    return <polygon key={l} points={points} fill="none" stroke="#e5e7eb" strokeWidth="1" />;
  });

  // Axis lines
  const axes = Array.from({ length: n }, (_, i) => {
    const p = pointAt(i, maxRadius);
    return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth="1" />;
  });

  // Data polygon
  const dataPoints = dimensions.map((d, i) => {
    const score = d.score ?? 0;
    const r = (maxRadius * score) / 100;
    return pointAt(i, r);
  });
  const dataPolygonStr = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Labels
  const labels = dimensions.map((d, i) => {
    const p = pointAt(i, maxRadius + 20);
    return (
      <text
        key={i}
        x={p.x}
        y={p.y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-gray-500 text-xs"
      >
        {d.label}
      </text>
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Compatibility spider web chart">
      {gridLines}
      {axes}
      <polygon
        points={dataPolygonStr}
        fill="rgba(244, 63, 94, 0.15)"
        stroke="rgb(244, 63, 94)"
        strokeWidth="2"
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="rgb(244, 63, 94)" />
      ))}
      {labels}
    </svg>
  );
}
