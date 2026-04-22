'use client';

import type { ReactNode } from 'react';

interface CompleteScreenProps {
  isGoocampus?: boolean;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919742811599';

function formatDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function CompleteScreen({ isGoocampus }: CompleteScreenProps) {
  return (
    <div className="relative mx-auto max-w-xl py-10 pb-[calc(3rem+env(safe-area-inset-bottom))] text-center lg:py-16">
      {/* Decorative rings behind the crest */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
      >
        <svg width="440" height="300" viewBox="0 0 440 300" fill="none">
          {[190, 140, 90].map((r, i) => (
            <circle
              key={r}
              cx="220"
              cy="150"
              r={r}
              stroke="var(--color-form-accent)"
              strokeWidth="1"
              opacity={0.08 + i * 0.04}
            />
          ))}
        </svg>
      </div>

      {/* Crest */}
      <div className="relative flex justify-center">
        <div
          className="flex size-[76px] animate-scale-in items-center justify-center rounded-full"
          style={{
            background:
              'linear-gradient(135deg, var(--color-form-accent) 0%, var(--color-form-accent-deep) 100%)',
            boxShadow:
              '0 12px 32px rgba(107, 26, 43, 0.25), inset 0 1px 0 rgba(255,255,255,0.14)',
          }}
        >
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <path
              d="M8 17l6 6 12-14"
              stroke="#fff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="30"
              className="animate-checkmark"
            />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <div className="relative mt-6">
        <div className="form-eyebrow text-[color:var(--color-form-accent)]">
          Profile complete
        </div>
        <h1 className="form-title mt-3">
          Your application is in
        </h1>
        <p className="form-subtitle mx-auto mt-3 max-w-md">
          Thank you for completing your Samvaya profile. We&apos;ll take it from
          here — quietly.
        </p>
        <div className="mt-2 text-xs text-[color:var(--color-form-text-tertiary)]">
          All 14 sections complete · {formatDate()}
        </div>
      </div>

      {/* Content block */}
      <div className="relative mt-10 text-left">
        {isGoocampus ? <GooCampusBlock /> : <VerificationBlock />}
      </div>
    </div>
  );
}

function InfoRow({
  title,
  sub,
  icon,
}: {
  title: string;
  sub: ReactNode;
  icon: ReactNode;
}) {
  return (
    <div className="flex gap-3.5 rounded-2xl border border-[color:var(--color-form-border)] bg-white p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-form-accent-soft)] text-[color:var(--color-form-accent)]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold leading-tight text-[color:var(--color-form-text-primary)]">
          {title}
        </div>
        <div className="mt-1 text-[12.5px] leading-snug text-[color:var(--color-form-text-muted)]">
          {sub}
        </div>
      </div>
    </div>
  );
}

function GooCampusBlock() {
  return (
    <div>
      <div className="form-eyebrow mb-3 px-1">What happens next</div>
      <div className="space-y-2.5">
        <InfoRow
          title="Our team reviews your profile"
          sub="Every Samvaya application is read, not screened by rules."
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M3 16c.5-3 3-4.5 6-4.5S14.5 13 15 16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          }
        />
        <InfoRow
          title="GooCampus verification applies"
          sub="As a GooCampus member, your verification is already complete."
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 1.5L2.5 4v5c0 3.6 2.7 6.5 6.5 7 3.8-.5 6.5-3.4 6.5-7V4L9 1.5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M6.5 9L8 10.5l3.5-3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <InfoRow
          title="First curated match · within 7 days"
          sub="No endless swiping. We introduce you to someone only when we think it's right."
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 15s-6-3.6-6-8a3.5 3.5 0 016-2.5A3.5 3.5 0 0115 7c0 4.4-6 8-6 8z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
      </div>
    </div>
  );
}

function VerificationBlock() {
  return (
    <div>
      <div className="form-eyebrow mb-3 px-1">What happens next</div>
      <div className="space-y-2.5">
        <InfoRow
          title="Human review · 24–48 hours"
          sub="Our matchmakers read every answer. We may reach out for a short clarifying call."
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M3 16c.5-3 3-4.5 6-4.5S14.5 13 15 16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          }
        />
        <InfoRow
          title="Verification fee · ₹4,130"
          sub="One-time. Covers identity, education, employment, address and court-record checks."
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 1.5L2.5 4v5c0 3.6 2.7 6.5 6.5 7 3.8-.5 6.5-3.4 6.5-7V4L9 1.5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <InfoRow
          title="First curated match · within 7 days of verification"
          sub={
            <>
              A service fee of ₹41,300 applies only once we find a match and
              both parties confirm mutual interest.
            </>
          }
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 15s-6-3.6-6-8a3.5 3.5 0 016-2.5A3.5 3.5 0 0115 7c0 4.4-6 8-6 8z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
      </div>

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          'Hi, I have completed my Samvaya profile and would like to proceed with the verification fee payment of ₹4,130.',
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="form-btn-primary mt-6 w-full"
      >
        Contact us on WhatsApp
      </a>

      <p className="mt-3 text-center text-xs text-[color:var(--color-form-text-muted)]">
        Our team will also reach out to you shortly.
      </p>
    </div>
  );
}
