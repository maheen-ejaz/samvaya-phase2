'use client';

import Link from 'next/link';
import type { PipelineStripStage } from '@/types/dashboard';

interface PipelineStripProps {
  stages: PipelineStripStage[];
}

// Green shade progression — lighter for early stages, deeper for later stages
const STAGE_COLORS: Record<string, { bg: string; border: string; featured?: boolean }> = {
  waitlist: { bg: 'bg-admin-green-50', border: 'border-admin-green-200' },
  invited: { bg: 'bg-admin-green-50', border: 'border-admin-green-200' },
  signed_up: { bg: 'bg-admin-green-100', border: 'border-admin-green-200', featured: true },
  form_in_progress: { bg: 'bg-admin-green-50', border: 'border-admin-green-200' },
  form_complete: { bg: 'bg-admin-green-100', border: 'border-admin-green-300', featured: true },
  payment_verified: { bg: 'bg-admin-green-50', border: 'border-admin-green-200' },
  bgv_complete: { bg: 'bg-admin-green-50', border: 'border-admin-green-200' },
  in_pool: { bg: 'bg-admin-green-100', border: 'border-admin-green-300', featured: true },
  matches_active: { bg: 'bg-admin-green-50', border: 'border-admin-green-200' },
  active_members: { bg: 'bg-admin-green-100', border: 'border-admin-green-300', featured: true },
};

// Button size and notch geometry (exported for reuse in MatchStageCard)
export const BTN_SIZE = 36; // px — diameter of the arrow button
export const NOTCH_GAP = 6; // px — breathing room between button edge and notch curve
const BTN_R = BTN_SIZE / 2; // 18px — button radius
const ARC_R = BTN_R + NOTCH_GAP; // 24px — radius of the concave cutout arc
const BTN_INSET = NOTCH_GAP; // button offset from card edge
const BTN_CENTER = BTN_INSET + BTN_R; // 24px — button center distance from card edge
// SVG covers from card corner up/left to the arc tangent points + ear curves
const EAR_R = 16; // px — radius of the small convex "ear" curves at arc ends
const SVG_SIZE = BTN_CENTER + ARC_R + EAR_R; // total SVG extent from corner
const PAGE_BG = '#F4F5F7'; // matches bg-page-admin

/** SVG-based concave notch that perfectly follows the circular button shape */
export function NotchCutout() {
  // All coordinates relative to SVG origin at top-left, with SVG positioned at bottom-right of card.
  // Card corner = SVG bottom-right = (SVG_SIZE, SVG_SIZE)
  // Button center in SVG coords:
  const cx = SVG_SIZE - BTN_CENTER;
  const cy = SVG_SIZE - BTN_CENTER;

  // Arc tangent points on the card edges (right edge: x=SVG_SIZE, bottom edge: y=SVG_SIZE)
  // Right edge tangent: the arc (radius ARC_R, center (cx,cy)) meets x=SVG_SIZE
  // x = cx + ARC_R = SVG_SIZE - BTN_CENTER + ARC_R = SVG_SIZE (since BTN_CENTER = ARC_R = 24) ✓
  // At this point y = cy = SVG_SIZE - BTN_CENTER
  const rightTangentY = cy;
  // Bottom edge tangent: similarly at y=SVG_SIZE, x = cx
  const bottomTangentX = cx;

  // Ear curves: small convex arcs that smoothly transition from the straight card edge into the concave arc
  // Right edge ear: from (SVG_SIZE, rightTangentY - EAR_R) curving to the arc tangent point
  // Bottom edge ear: from the arc tangent to (bottomTangentX - EAR_R, SVG_SIZE)

  // Path: start from top of right ear, curve into concave arc, curve out via bottom ear, then fill corner
  const d = [
    // Start at top of right-edge ear
    `M ${SVG_SIZE} ${rightTangentY - EAR_R}`,
    // Small convex ear curve into the concave arc (quarter circle, radius EAR_R)
    `A ${EAR_R} ${EAR_R} 0 0 0 ${SVG_SIZE - EAR_R} ${rightTangentY}`,
    // Main concave arc following the button circle (quarter circle from right tangent to bottom tangent)
    `A ${ARC_R} ${ARC_R} 0 0 1 ${bottomTangentX} ${SVG_SIZE - EAR_R}`,
    // Small convex ear curve out to bottom edge
    `A ${EAR_R} ${EAR_R} 0 0 0 ${bottomTangentX - EAR_R} ${SVG_SIZE}`,
    // Close via card corner
    `L ${SVG_SIZE} ${SVG_SIZE}`,
    'Z',
  ].join(' ');

  return (
    <svg
      className="pointer-events-none absolute z-10"
      style={{ bottom: 0, right: 0, width: SVG_SIZE, height: SVG_SIZE }}
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      aria-hidden="true"
    >
      <path d={d} fill={PAGE_BG} />
    </svg>
  );
}

export function PipelineStrip({ stages }: PipelineStripProps) {
  const row1 = stages.slice(0, 5);
  const row2 = stages.slice(5, 10);

  return (
    <div className="space-y-3">
      <PipelineRow stages={row1} />
      <PipelineRow stages={row2} />
    </div>
  );
}

function PipelineRow({ stages }: { stages: PipelineStripStage[] }) {
  return (
    <div className="flex items-stretch gap-3">
      {stages.map((stage, i) => (
        <div key={stage.key} className="flex min-w-0 flex-1 items-stretch gap-3">
          {/* Card wrapper — positions the notched card and the button */}
          <div className="relative min-w-0 flex-1">
            {/* Notched card background */}
            <Link
              href={stage.href}
              className={`group relative block h-full rounded-xl rounded-br-none border p-5 pb-6 transition-all hover:shadow-md hover:-translate-y-0.5 ${STAGE_COLORS[stage.key]?.bg || 'bg-admin-green-50'} ${STAGE_COLORS[stage.key]?.border || 'border-admin-green-200'} ${STAGE_COLORS[stage.key]?.featured ? 'texture-stripes' : ''}`}
            >
              {/* Label */}
              <p className="text-lg font-medium text-gray-900">
                {stage.stage}
              </p>

              {/* Trend subtitle */}
              {stage.trend ? (
                <p
                  className={`mt-0.5 text-[11px] font-medium ${
                    stage.trend.direction === 'up'
                      ? 'text-admin-green-800'
                      : stage.trend.direction === 'down'
                        ? 'text-red-600'
                        : 'text-gray-400'
                  }`}
                >
                  {stage.trend.direction === 'up'
                    ? '↑'
                    : stage.trend.direction === 'down'
                      ? '↓'
                      : '→'}{' '}
                  {stage.trend.percentage}% vs 7d ago
                </p>
              ) : (
                <p className="mt-0.5 text-[11px] text-gray-400">—</p>
              )}

              {/* Count */}
              <p className="mt-4 text-3xl font-bold text-gray-900">
                {stage.count.toLocaleString('en-IN')}
              </p>
            </Link>

            {/* Concave notch cutout */}
            <NotchCutout />

            {/* Arrow button — sits in the bottom-right corner notch */}
            <Link
              href={stage.href}
              className="absolute z-20 flex items-center justify-center rounded-full bg-admin-green-900 text-white shadow-md transition-all hover:bg-admin-green-800 hover:shadow-lg hover:scale-105"
              style={{
                width: `${BTN_SIZE}px`,
                height: `${BTN_SIZE}px`,
                bottom: `${NOTCH_GAP}px`,
                right: `${NOTCH_GAP}px`,
              }}
              aria-label={`View ${stage.stage}`}
              tabIndex={-1}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M5 11L11 5M11 5H6M11 5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {/* Chevron with conversion % between cards (not after last) */}
          {i < stages.length - 1 && (
            <div className="flex flex-col items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                className="text-gray-300"
                aria-hidden="true"
              >
                <path
                  d="M5 2.5l4.5 4.5-4.5 4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {stage.conversionPct !== null && stage.conversionPct !== undefined && (
                <p className="mt-0.5 text-[9px] font-medium text-gray-400">
                  {stage.conversionPct}%
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
