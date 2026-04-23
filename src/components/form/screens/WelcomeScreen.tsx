'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react';
import { useUserStatus } from '@/lib/app/user-context';
import { PRICING } from '@/lib/constants';

interface WelcomeScreenProps {
  firstName?: string | null;
}

const SECTION_GROUPS = [
  {
    label: 'About You',
    sections: ['Basic Identity', 'Location & Citizenship', 'Religion & Community'],
  },
  {
    label: 'Life & Values',
    sections: ['Family Background', 'Physical Details', 'Lifestyle', 'Personality & Interests'],
  },
  {
    label: 'Career & Finances',
    sections: ['Education', 'Career', 'Financial Background'],
  },
  {
    label: 'Compatibility',
    sections: ['Goals & Values', 'Partner Preferences'],
  },
  {
    label: 'Verification',
    sections: ['Documents & Verification', 'Conversations'],
  },
];

const STATS = [
  { k: '14', l: 'sections' },
  { k: '~38 min', l: 'total' },
  { k: 'Saved', l: 'auto-saves' },
];

export function WelcomeScreen({ firstName }: WelcomeScreenProps) {
  const [sectionMapOpen, setSectionMapOpen] = useState(false);
  const { isGoocampusMember } = useUserStatus();

  return (
    <div className="relative mx-auto flex max-w-xl flex-col items-center py-10 pb-[calc(3rem+env(safe-area-inset-bottom))] text-center lg:py-16">
      {/* Eyebrow pill */}
      <div className="form-eyebrow inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-form-border)] bg-white px-3 py-1.5 text-[color:var(--color-form-accent)]">
        <span className="size-1.5 rounded-full bg-[color:var(--color-form-accent)]" />
        For verified doctors
      </div>

      {/* Hero copy — increased line-height so italic name has breathing room */}
      <h1 className="form-title mt-8 max-w-[16ch] leading-[1.25]">
        Let&apos;s build your profile
        {firstName && (
          <>
            ,{' '}
            <span className="italic text-[color:var(--color-form-accent)]">
              {firstName}
            </span>
          </>
        )}
      </h1>
      <p className="form-subtitle mx-auto mt-3 max-w-md">
        A thoughtful questionnaire, built by matchmakers. Answer at your pace —
        we&apos;ll keep your spot.
      </p>

      {/* Stats strip — contained card with dividers for breathing room */}
      <div className="mt-5 flex w-full max-w-sm items-stretch rounded-2xl border border-[#ECE7E2] bg-white py-3.5">
        {STATS.map((s, i) => (
          <div
            key={s.l}
            className={cn(
              'flex-1 text-center',
              i > 0 && 'border-l border-[#ECE7E2]',
            )}
          >
            <div className="text-[15px] font-semibold leading-tight tracking-tight text-[#1A1614]">
              {s.k}
            </div>
            <div className="mt-1 text-[11px] text-[#7A7370]">
              {s.l}
            </div>
          </div>
        ))}
      </div>

      {/* Fees at a glance */}
      <div className="mt-8 w-full max-w-sm space-y-2.5 text-left">
        <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#7A7370]">
          Fees at a glance
        </p>

        {/* Verification fee card */}
        <div className="rounded-2xl border border-[#ECE7E2] bg-white p-[18px] shadow-[0_1px_2px_rgba(26,22,20,0.04)]">
          <p className="text-[14px] font-semibold leading-snug tracking-[-0.01em] text-[#1A1614]">
            Verification fee
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#7A7370]">
            Identity, education, employment, address &amp; court-record checks — powered by OnGrid BGV. Paid once after profile review.
          </p>
          <p className="mt-3 text-[18px] font-semibold tracking-[-0.04em] tabular-nums text-[#1A1614]">
            {PRICING.VERIFICATION_BASE}{' '}
            <span className="text-[13px] font-normal text-[#7A7370]">+ GST</span>
          </p>
        </div>

        {/* Verification fee GooCampus disclaimer */}
        <div className="flex items-start gap-2.5 rounded-xl border border-[#BFE0D4] bg-[#E8F3EC] px-3.5 py-3">
          <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border border-[#BFE0D4] bg-white">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6.5l2.5 2.5L10 3.5" stroke="#2F7A5B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="text-[12.5px] leading-relaxed text-[#1A4035]">
            <span className="font-semibold">GooCampus clients</span><br />
            Your verification fee is fully waived. Contact your GooCampus representative for details.
          </div>
        </div>

        {/* Service fee card */}
        <div className="rounded-2xl border border-[#ECE7E2] bg-white p-[18px] shadow-[0_1px_2px_rgba(26,22,20,0.04)]">
          <p className="text-[14px] font-semibold leading-snug tracking-[-0.01em] text-[#1A1614]">
            Service fee
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#7A7370]">
            Charged only after we find a match and <em>both</em> parties confirm mutual interest. Nothing until then.
          </p>
          <p className="mt-3 text-[18px] font-semibold tracking-[-0.04em] tabular-nums text-[#1A1614]">
            {PRICING.MEMBERSHIP_BASE}{' '}
            <span className="text-[13px] font-normal text-[#7A7370]">+ GST</span>
          </p>
        </div>

        {/* Service fee GooCampus disclaimer */}
        <div className="flex items-start gap-2.5 rounded-xl border border-[#BFE0D4] bg-[#E8F3EC] px-3.5 py-3">
          <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border border-[#BFE0D4] bg-white">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="#2F7A5B" strokeWidth="1.3"/>
              <path d="M6 3.5v3l1.5 1.5" stroke="#2F7A5B" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="text-[12.5px] leading-relaxed text-[#1A4035]">
            <span className="font-semibold">GooCampus clients</span><br />
            Special discounted pricing available. Contact your GooCampus representative for exclusive member rates.
          </div>
        </div>

        {/* Founder-led matchmaking card */}
        <div className="relative overflow-hidden rounded-2xl border border-[#D4AF8C] bg-[#FAF5EE] p-[18px] shadow-[0_1px_2px_rgba(26,22,20,0.04)]">
          {/* Decorative circle */}
          <div className="pointer-events-none absolute -right-5 -top-5 size-[90px] rounded-full bg-[rgba(163,23,31,0.04)]" />
          {/* Premium badge */}
          <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-[rgba(163,23,31,0.08)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#A3171F]">
            <svg width="9" height="9" viewBox="0 0 10 10" fill="#A3171F">
              <path d="M5 1l1.2 2.5L9 4l-2 2 .5 2.8L5 7.5 2.5 8.8 3 6 1 4l2.8-.5L5 1z"/>
            </svg>
            Premium
          </div>
          <p className="font-[family-name:var(--font-form-serif)] text-[18px] font-semibold leading-tight tracking-[-0.04em] text-[#1A1614]">
            Founder-led matchmaking
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#3B3430]">
            Premium, hands-on matchmaking facilitated directly by Samvaya&apos;s founding members. We personally handle every coordination, collaboration, and discussion — so your match gets the attention it deserves.
          </p>
          <button
            type="button"
            className="mt-3.5 inline-flex h-[38px] items-center gap-1.5 rounded-full bg-[#A3171F] px-4 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(163,23,31,0.25)]"
          >
            Contact us for pricing
            <ArrowRightIcon className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable section map */}
      <div className="mt-8 w-full">
        <button
          type="button"
          onClick={() => setSectionMapOpen((o) => !o)}
          className="mx-auto flex items-center gap-1.5 text-xs font-medium text-[color:var(--color-form-accent)] transition-opacity hover:opacity-80"
          aria-expanded={sectionMapOpen}
        >
          <ChevronRightIcon
            className={cn('size-3 transition-transform', sectionMapOpen && 'rotate-90')}
          />
          {sectionMapOpen ? 'Hide section overview' : "See what's covered in 14 sections"}
        </button>

        {sectionMapOpen && (
          <div className="form-intro-card mt-4 animate-fade-in-up text-left">
            <div className="space-y-4">
              {SECTION_GROUPS.map((group) => (
                <div key={group.label}>
                  <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--color-form-text-muted)]">
                    {group.label}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.sections.map((name) => (
                      <span
                        key={name}
                        className="rounded-full border border-[color:var(--color-form-border)] bg-white px-2.5 py-0.5 text-xs font-normal text-[color:var(--color-form-text-secondary)]"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Back + Begin — Back gets a bordered pill so it reads as a button, not a link */}
      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <div className="flex justify-center">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E3DDD6] px-5 py-2 text-[13px] font-medium text-[#7A7370]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7.5 2.5L4 6l3.5 3.5" stroke="#7A7370" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
        </div>
        <Link
          href="/app/onboarding/a/intro"
          className="form-btn-primary w-full"
        >
          Begin
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </div>
  );
}
