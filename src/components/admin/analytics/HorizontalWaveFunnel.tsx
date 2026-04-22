'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface FunnelStage {
  stage: string;
  count: number;
  placeholder?: boolean;
}

interface HorizontalWaveFunnelProps {
  data: FunnelStage[];
}

// SVG layout constants
const W = 1000;
const H = 260;
const PADDING_X = 48;      // left/right padding inside SVG
const CHART_TOP = 40;      // top margin (space for count bubbles)
const CHART_BOTTOM = 200;  // bottom of the wave area
const LABEL_Y = 228;       // y position of stage labels
const MAX_BAR_H = CHART_BOTTOM - CHART_TOP; // 160px max bar height

// Depth layers: back → front, each with a scale factor for height
const LAYERS = [
  { color: 'hsl(var(--chart-3))', scale: 1.00 },
  { color: 'hsl(var(--chart-2))', scale: 0.78 },
  { color: 'hsl(var(--chart-1))', scale: 0.56 },
] as const;

/** Cardinal spline → smooth SVG cubic bezier path through points */
function smoothPath(pts: { x: number; y: number }[], close: boolean, baseline: number): string {
  if (pts.length === 0) return '';
  const n = pts.length;

  // Pad with ghost points at the ends to handle the edge tangents
  const ext = [pts[0], ...pts, pts[n - 1]];

  let d = `M ${pts[0].x},${baseline} L ${pts[0].x},${pts[0].y}`;

  for (let i = 0; i < n - 1; i++) {
    const p0 = ext[i];
    const p1 = ext[i + 1];
    const p2 = ext[i + 2];
    const p3 = ext[i + 3];

    // Cardinal spline control points (tension = 0.4)
    const t = 0.4;
    const cp1x = p1.x + (p2.x - p0.x) * t / 2;
    const cp1y = p1.y + (p2.y - p0.y) * t / 2;
    const cp2x = p2.x - (p3.x - p1.x) * t / 2;
    const cp2y = p2.y - (p3.y - p1.y) * t / 2;

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  if (close) {
    d += ` L ${pts[n - 1].x},${baseline} Z`;
  }

  return d;
}

export function HorizontalWaveFunnel({ data }: HorizontalWaveFunnelProps) {
  const activeStages = data.filter((d) => !d.placeholder);
  if (activeStages.length === 0) return null;

  const n = activeStages.length;
  const maxCount = Math.max(...activeStages.map((s) => s.count), 1);
  const colW = (W - PADDING_X * 2) / (n - 1 || 1);

  // Stage x positions and bar heights
  const stagePoints = activeStages.map((s, i) => ({
    x: n === 1 ? W / 2 : PADDING_X + i * colW,
    barH: Math.max((s.count / maxCount) * MAX_BAR_H, 4),
    count: s.count,
    label: s.stage,
  }));

  // Front-layer top Y positions (for bubble placement)
  const frontScale = LAYERS[2].scale;

  return (
    <Card>
      <CardHeader>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Funnel</p>
        <CardTitle>Applicant Pipeline</CardTitle>
        <CardDescription>Stage-by-stage progression through the pipeline.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ minWidth: 480 }}
            aria-label="Horizontal funnel chart"
          >
            {/* Vertical stage marker lines */}
            {stagePoints.map((pt, i) => (
              <line
                key={`marker-${i}`}
                x1={pt.x} y1={CHART_TOP}
                x2={pt.x} y2={CHART_BOTTOM}
                stroke="#E0E7FF"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            ))}

            {/* Wave layers — back to front */}
            {LAYERS.map((layer, li) => {
              const pts = stagePoints.map((pt) => ({
                x: pt.x,
                y: CHART_BOTTOM - pt.barH * layer.scale,
              }));
              return (
                <path
                  key={`layer-${li}`}
                  d={smoothPath(pts, true, CHART_BOTTOM)}
                  fill={layer.color}
                  opacity={0.9}
                />
              );
            })}

            {/* Count bubbles — above front layer peaks */}
            {stagePoints.map((pt, i) => {
              const frontY = CHART_BOTTOM - pt.barH * frontScale;
              const bubbleY = frontY - 14;
              const label = pt.count.toLocaleString('en-IN');
              // Approximate text width: ~6.5px per char + 16px padding
              const bw = Math.max(label.length * 6.5 + 16, 36);
              const bh = 20;
              const bx = pt.x - bw / 2;
              const by = bubbleY - bh;

              return (
                <g key={`bubble-${i}`}>
                  <rect
                    x={bx} y={by}
                    width={bw} height={bh}
                    rx="10" ry="10"
                    fill="white"
                    stroke="#E0E7FF"
                    strokeWidth="1.5"
                    filter="url(#bubble-shadow)"
                  />
                  <text
                    x={pt.x} y={by + bh / 2 + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="hsl(var(--foreground))"
                    fontFamily="inherit"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Stage labels */}
            {stagePoints.map((pt, i) => (
              <text
                key={`label-${i}`}
                x={pt.x}
                y={LABEL_Y}
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fill="hsl(var(--muted-foreground))"
                fontFamily="inherit"
                style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}
              >
                {pt.label.length > 10 ? pt.label.slice(0, 9) + '...' : pt.label}
              </text>
            ))}

            {/* Drop shadow filter for bubbles */}
            <defs>
              <filter id="bubble-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#4F6EF7" floodOpacity="0.12" />
              </filter>
            </defs>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
