'use client';

import { useState } from 'react';

interface DimensionScore {
  score: number;
  weight: number;
  notes: string;
}

interface InteractiveSpiderChartProps {
  dimensions: Record<string, DimensionScore>;
  overallScore: number;
}

const AXES = [
  { key: 'career_alignment', label: 'Career' },
  { key: 'values_alignment', label: 'Values' },
  { key: 'lifestyle_compatibility', label: 'Lifestyle' },
  { key: 'relocation_compatibility', label: 'Relocation' },
  { key: 'communication_compatibility', label: 'Communication' },
  { key: 'family_orientation', label: 'Family' },
  { key: 'financial_alignment', label: 'Financial' },
  { key: 'timeline_alignment', label: 'Timeline' },
  { key: 'emotional_compatibility', label: 'Emotional' },
];

const SIZE = 580;
const CENTER = SIZE / 2;
const RADIUS = 150;
const SCORE_RADIUS = 195;
const LABEL_RADIUS = 218;
const RINGS = [25, 50, 75, 100];

function polarToXY(angle: number, radius: number): { x: number; y: number } {
  return {
    x: CENTER + radius * Math.cos(angle - Math.PI / 2),
    y: CENTER + radius * Math.sin(angle - Math.PI / 2),
  };
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#16A34A';
  if (score >= 65) return '#D97706';
  return '#DC2626';
}

export function InteractiveSpiderChart({ dimensions, overallScore }: InteractiveSpiderChartProps) {
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null);
  const angleStep = (2 * Math.PI) / AXES.length;

  // Build data polygon points
  const dataPoints = AXES.map((axis, i) => {
    const angle = i * angleStep;
    const score = dimensions[axis.key]?.score ?? 50;
    const r = (score / 100) * RADIUS;
    return polarToXY(angle, r);
  });

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  const hoveredData = hoveredDimension ? dimensions[hoveredDimension] : null;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto" role="img" aria-label="Compatibility scores radar chart">
        <title>Compatibility scores radar chart</title>
        {/* Background rings */}
        {RINGS.map((ring) => {
          const points = AXES.map((_, i) => {
            const angle = i * angleStep;
            const p = polarToXY(angle, (ring / 100) * RADIUS);
            return `${p.x},${p.y}`;
          }).join(' ');
          return (
            <polygon
              key={ring}
              points={points}
              fill={ring === 100 ? 'rgba(243, 244, 246, 0.5)' : 'none'}
              stroke="#E5E7EB"
              strokeWidth="0.5"
              strokeDasharray={ring < 100 ? '3,3' : undefined}
            />
          );
        })}

        {/* Axis lines */}
        {AXES.map((_, i) => {
          const angle = i * angleStep;
          const end = polarToXY(angle, RADIUS);
          return (
            <line key={i} x1={CENTER} y1={CENTER} x2={end.x} y2={end.y} stroke="#E5E7EB" strokeWidth="0.5" />
          );
        })}

        {/* Data polygon — filled area */}
        <path
          d={dataPath}
          fill="rgba(139, 92, 246, 0.15)"
          stroke="rgba(139, 92, 246, 0.8)"
          strokeWidth="2"
        />

        {/* Dots + Score labels + Axis labels at each vertex */}
        {AXES.map((axis, i) => {
          const score = dimensions[axis.key]?.score ?? 50;
          const angle = i * angleStep;
          const r = (score / 100) * RADIUS;
          const dot = polarToXY(angle, r);
          const scorePos = polarToXY(angle, SCORE_RADIUS);
          const labelPos = polarToXY(angle, LABEL_RADIUS);
          const isHovered = hoveredDimension === axis.key;

          // Text anchor based on position
          const degrees = ((angle * 180) / Math.PI + 270) % 360;
          const anchor = degrees > 60 && degrees < 120 ? 'middle'
            : degrees > 240 && degrees < 300 ? 'middle'
            : degrees >= 120 && degrees <= 240 ? 'end'
            : 'start';

          return (
            <g
              key={axis.key}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredDimension(axis.key)}
              onMouseLeave={() => setHoveredDimension(null)}
            >
              {/* Dot on the polygon */}
              <circle
                cx={dot.x}
                cy={dot.y}
                r={isHovered ? 6 : 4}
                fill={isHovered ? '#7C3AED' : '#8B5CF6'}
                stroke="white"
                strokeWidth="2"
              />

              {/* Score number — prominent, colored by value */}
              <text
                x={scorePos.x}
                y={scorePos.y}
                textAnchor={anchor}
                dominantBaseline="central"
                fill={getScoreColor(score)}
                className="text-sm font-bold"
              >
                {score}
              </text>

              {/* Axis label — below/beside the score */}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor={anchor}
                dominantBaseline="central"
                className={`text-xs ${isHovered ? 'fill-gray-900 font-semibold' : 'fill-gray-500'}`}
              >
                {axis.label}
              </text>
            </g>
          );
        })}

        {/* Overall score in center */}
        <text x={CENTER} y={CENTER - 8} textAnchor="middle" className="text-2xl font-bold" fill={getScoreColor(overallScore)}>
          {overallScore}
        </text>
        <text x={CENTER} y={CENTER + 12} textAnchor="middle" className="text-[10px]" fill="#9CA3AF">
          overall
        </text>
      </svg>

      {/* Hover tooltip — shows notes */}
      {hoveredData && hoveredDimension && (
        <div className="mt-2 w-full max-w-sm rounded-lg border border-gray-200 bg-white px-4 py-3 text-center shadow-sm">
          <p className="text-sm text-gray-600">{hoveredData.notes || 'No additional notes.'}</p>
        </div>
      )}
    </div>
  );
}
