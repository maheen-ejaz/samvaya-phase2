'use client';

interface SpiderWebChartProps {
  myScores: Record<string, number> | null;
  theirScores: Record<string, number> | null;
}

const AXES = [
  { key: 'family_orientation', label: 'Family' },
  { key: 'career_ambition', label: 'Career' },
  { key: 'independence_togetherness', label: 'Independence' },
  { key: 'emotional_expressiveness', label: 'Emotional' },
  { key: 'social_orientation', label: 'Social' },
  { key: 'traditionalism', label: 'Traditional' },
  { key: 'relocation_openness', label: 'Relocation' },
  { key: 'life_pace', label: 'Life Pace' },
];

const SIZE = 280;
const CENTER = SIZE / 2;
const RADIUS = 110;
const RINGS = [25, 50, 75, 100];

function polarToCartesian(angle: number, value: number): [number, number] {
  const r = (value / 100) * RADIUS;
  const x = CENTER + r * Math.cos(angle);
  const y = CENTER + r * Math.sin(angle);
  return [x, y];
}

function buildPolygon(scores: Record<string, number>): string {
  return AXES.map((axis, i) => {
    const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
    const value = scores[axis.key] ?? 50;
    const [x, y] = polarToCartesian(angle, value);
    return `${x},${y}`;
  }).join(' ');
}

export function SpiderWebChart({ myScores, theirScores }: SpiderWebChartProps) {
  if (!myScores && !theirScores) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-gray-400">
        Compatibility chart not available yet
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[280px]" role="img" aria-label="8-axis compatibility chart comparing scores across family, career, independence, emotional, social, traditionalism, relocation, and life pace">
        {/* Reference rings */}
        {RINGS.map((ring) => (
          <circle
            key={ring}
            cx={CENTER}
            cy={CENTER}
            r={(ring / 100) * RADIUS}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        ))}

        {/* Axis lines and labels */}
        {AXES.map((axis, i) => {
          const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
          const [endX, endY] = polarToCartesian(angle, 100);
          const [labelX, labelY] = polarToCartesian(angle, 115);

          return (
            <g key={axis.key}>
              <line
                x1={CENTER}
                y1={CENTER}
                x2={endX}
                y2={endY}
                stroke="#d1d5db"
                strokeWidth={0.5}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-gray-500 text-xs"
              >
                {axis.label}
              </text>
            </g>
          );
        })}

        {/* My scores polygon (blue) */}
        {myScores && (
          <polygon
            points={buildPolygon(myScores)}
            fill="rgba(59, 130, 246, 0.15)"
            stroke="#3b82f6"
            strokeWidth={1.5}
          />
        )}

        {/* Their scores polygon (rose) */}
        {theirScores && (
          <polygon
            points={buildPolygon(theirScores)}
            fill="rgba(244, 63, 94, 0.15)"
            stroke="#f43f5e"
            strokeWidth={1.5}
          />
        )}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
        {myScores && (
          <div className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
            You
          </div>
        )}
        {theirScores && (
          <div className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-samvaya-red" />
            Them
          </div>
        )}
      </div>
    </div>
  );
}
