'use client';

import Link from 'next/link';
import { useState } from 'react';
import { NotchCutout, BTN_SIZE, NOTCH_GAP } from '@/components/admin/dashboard/PipelineStrip';

export interface StageCounts {
  waitlist: number;
  invited: number;
  signed_up: number;
  form_in_progress: number;
  form_complete: number;
  payment_verified: number;
  bgv_complete: number;
  in_pool: number;
  active_member: number;
}

interface ApplicantDashboardProps {
  stageCounts: StageCounts;
}

const FUNNEL_STAGES = [
  { key: 'waitlist',         label: 'Waitlist' },
  { key: 'invited',          label: 'Invited' },
  { key: 'signed_up',        label: 'Signed Up' },
  { key: 'form_in_progress', label: 'Form Started' },
  { key: 'form_complete',    label: 'Form Complete' },
  { key: 'payment_verified', label: 'Fee Paid' },
  { key: 'bgv_complete',     label: 'BGV Done' },
  { key: 'in_pool',          label: 'In Pool' },
  { key: 'active_member',    label: 'Active' },
] as const;

const STAT_CARDS = [
  { key: 'signed_up',     label: 'Signed Up',      sub: 'All registered applicants', featured: true  },
  { key: 'form_complete', label: 'Form Complete',  sub: 'Submitted the full form',   featured: true  },
  { key: 'in_pool',       label: 'In Pool',        sub: 'Ready for matching',        featured: true  },
  { key: 'active_member', label: 'Active Members', sub: 'Paid membership',           featured: true  },
] as const;

// Gap between bars in px — this is what creates the waterfall separation
const BAR_GAP = 6;
const BAR_MAX_HEIGHT = 180;
const MIN_BAR_HEIGHT = 4; // always show at least a sliver so 0-count bars are visible

function FunnelChart({ stageCounts }: { stageCounts: StageCounts }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const counts = FUNNEL_STAGES.map((s) => stageCounts[s.key as keyof StageCounts]);
  const maxCount = Math.max(...counts, 1);

  const barHeights = counts.map((c) =>
    c === 0 ? MIN_BAR_HEIGHT : Math.max(Math.round((c / maxCount) * BAR_MAX_HEIGHT), MIN_BAR_HEIGHT)
  );

  const conversions = counts.map((c, i) => {
    if (i === 0) return null;
    const prev = counts[i - 1];
    if (prev === 0) return null;
    const rate = Math.round((c / prev) * 100);
    return { rate, dropOff: rate - 100 };
  });

  const colStyle = { flex: '1 1 0%', minWidth: 0 };

  return (
    <div>
      {/* Header row — stage name + count, aligned to each column with the same gap */}
      <div className="mb-5 flex" style={{ gap: BAR_GAP }}>
        {FUNNEL_STAGES.map((stage, i) => {
          const isHovered = hoveredIndex === i;
          const count = counts[i];
          return (
            <div
              key={stage.key}
              style={colStyle}
              className="flex flex-col items-center text-center"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span
                className={`block truncate text-[10px] leading-tight transition-colors ${
                  isHovered ? 'font-semibold text-rose-600' : 'text-gray-400'
                }`}
              >
                {stage.label}
              </span>
              <span
                className={`mt-0.5 block tabular-nums transition-all ${
                  isHovered ? 'text-sm font-bold text-rose-600' : 'text-sm font-semibold text-gray-700'
                }`}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chart: bottom-aligned bars with gaps */}
      <div
        className="flex items-end"
        style={{ height: BAR_MAX_HEIGHT, gap: BAR_GAP }}
      >
        {FUNNEL_STAGES.map((stage, i) => {
          const isHovered = hoveredIndex === i;
          const count = counts[i];
          const barH = barHeights[i];
          const conv = conversions[i];

          return (
            <div
              key={stage.key}
              style={{ ...colStyle, height: barH, position: 'relative' }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div
                  className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-xl text-xs text-gray-700"
                  style={{ bottom: barH + 8 }}
                >
                  <span className="font-semibold text-gray-900">{count} applicants</span>
                  {conv && (
                    <>
                      <span className="mx-2 text-gray-200">|</span>
                      <span>
                        Conversion:{' '}
                        <span className="font-medium text-emerald-600">{conv.rate}%</span>
                      </span>
                      <span className="mx-2 text-gray-200">|</span>
                      <span>
                        Drop-off:{' '}
                        <span className="font-medium text-rose-500">{conv.dropOff}%</span>
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Bar — full height of this column div */}
              <Link
                href={`/admin/applicants?stage=${stage.key}`}
                className="block h-full w-full overflow-hidden transition-opacity duration-150"
                style={{ opacity: isHovered ? 1 : 0.9 }}
                tabIndex={-1}
              >
                {isHovered ? (
                  <div className="h-full w-full bg-rose-500" />
                ) : (
                  /* Diagonal hatch via inline SVG */
                  <svg
                    width="100%"
                    height="100%"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ display: 'block' }}
                  >
                    <defs>
                      <pattern
                        id={`hatch-bar-${i}`}
                        patternUnits="userSpaceOnUse"
                        width="10"
                        height="10"
                        patternTransform="rotate(45)"
                      >
                        <rect width="10" height="10" fill="#ffe4e6" />
                        <line
                          x1="0" y1="0" x2="0" y2="10"
                          stroke="#fca5a5"
                          strokeWidth="4"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#hatch-bar-${i})`} />
                  </svg>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-[10px] text-gray-300">
        Click any stage to view applicants
      </p>
    </div>
  );
}

export function ApplicantDashboard({ stageCounts }: ApplicantDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="type-heading-xl text-gray-900">Applicants</h1>
        <p className="mt-1 text-sm text-gray-500">Pipeline overview</p>
      </div>

      {/* Stat cards — same design as dashboard PipelineStrip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STAT_CARDS.map((card) => {
          const count = stageCounts[card.key as keyof StageCounts];
          const href = `/admin/applicants?stage=${card.key}`;
          return (
            <div key={card.key} className="relative">
              {/* Card */}
              <Link
                href={href}
                className={`group relative block h-full rounded-xl rounded-br-none border border-admin-green-200 bg-admin-green-100 p-5 pb-6 transition-all hover:-translate-y-0.5 hover:shadow-md${card.featured ? ' texture-stripes' : ''}`}
              >
                <p className="text-lg font-medium text-gray-900">{card.label}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">{card.sub}</p>
                <p className="mt-4 type-display-sm type-stat text-gray-900">
                  {count.toLocaleString('en-IN')}
                </p>
              </Link>

              {/* Concave notch cutout */}
              <NotchCutout />

              {/* Arrow button */}
              <Link
                href={href}
                className="absolute z-20 flex items-center justify-center rounded-full bg-admin-green-900 text-white shadow-md transition-all hover:bg-admin-green-800 hover:scale-105 hover:shadow-lg"
                style={{
                  width: `${BTN_SIZE}px`,
                  height: `${BTN_SIZE}px`,
                  bottom: `${NOTCH_GAP}px`,
                  right: `${NOTCH_GAP}px`,
                }}
                aria-label={`View ${card.label}`}
                tabIndex={-1}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M5 11L11 5M11 5H6M11 5V10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Funnel chart card */}
      <div className="rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
        <h2 className="mb-6 text-sm font-semibold text-gray-700">Recruitment Pipeline</h2>
        <FunnelChart stageCounts={stageCounts} />
      </div>

      {/* Waitlist row */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/admin/applicants?stage=waitlist"
          className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Waitlist
            </p>
            <p className="mt-0.5 text-2xl font-[350] tabular-nums text-gray-900">
              {stageCounts.waitlist}
            </p>
          </div>
          <span className="text-gray-200 transition-colors group-hover:text-rose-300">→</span>
        </Link>
        <Link
          href="/admin/applicants?stage=invited"
          className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              Invited
            </p>
            <p className="mt-0.5 text-2xl font-[350] tabular-nums text-gray-900">
              {stageCounts.invited}
            </p>
          </div>
          <span className="text-gray-200 transition-colors group-hover:text-rose-300">→</span>
        </Link>
      </div>
    </div>
  );
}
