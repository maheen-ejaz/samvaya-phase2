'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { PRICING } from '@/lib/constants';

const PC = {
  bg: '#FBF8F4',
  ink: '#1A1614',
  ink2: '#3B3430',
  muted: '#7A7370',
  faint: '#A8A19D',
  line: '#ECE7E2',
  line2: '#E3DDD6',
  accent: '#A3171F',
  accentDeep: '#7D1118',
  accentSoft: '#FFF4F4',
  gold: '#A8804A',
  goldSoft: '#F5EEDE',
  green: '#2F7A5B',
  greenSoft: '#E8F3EC',
  greenLine: '#BFE0D4',
};

const SECTION_GROUPS = [
  { label: 'About You',         sections: ['Basic Identity', 'Location & Citizenship', 'Religion & Community'] },
  { label: 'Life & Values',     sections: ['Family Background', 'Physical Details', 'Lifestyle', 'Personality & Interests'] },
  { label: 'Career & Finances', sections: ['Education', 'Career', 'Financial Background'] },
  { label: 'Compatibility',     sections: ['Goals & Values', 'Partner Preferences'] },
  { label: 'Verification',      sections: ['Documents & Verification', 'Conversations'] },
];

// ── Icons ─────────────────────────────────────────────────

function DocumentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="2" width="12" height="16" rx="2" stroke={PC.accent} strokeWidth="1.4" />
      <path d="M7 7h6M7 10.5h6M7 14h4" stroke={PC.accent} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6S1.5 10 1.5 10z" stroke={PC.accent} strokeWidth="1.4" />
      <circle cx="10" cy="10" r="2.5" stroke={PC.accent} strokeWidth="1.4" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 1.8 L3 4.2 V9.5 c0 4.2 3.2 7.6 7 8.3 3.8-.7 7-4.1 7-8.3 V4.2 L10 1.8 Z"
        stroke={PC.accent} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7 10.2 L9 12.2 L13.2 8" stroke={PC.accent} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PoolIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="2.5" stroke={PC.accent} strokeWidth="1.4" />
      <circle cx="13" cy="7" r="2.5" stroke={PC.accent} strokeWidth="1.4" />
      <path d="M2.5 17c.7-2.8 2.8-4 4.5-4s3.8 1.2 4.5 4" stroke={PC.accent} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10.5 17c.7-2.8 2.8-4 4.5-4" stroke={PC.accent} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// ── Shared primitives ──────────────────────────────────────

function StepBadge({ n }: { n: string }) {
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 99,
      background: 'rgba(163,23,31,0.07)',
      fontSize: 10.5, fontWeight: 600, color: PC.accent, letterSpacing: '0.2px',
      flexShrink: 0,
    }}>
      {n}
    </span>
  );
}

function Row({ icon, title, subtitle, badge }: {
  icon: ReactNode; title: ReactNode; subtitle: ReactNode; badge?: ReactNode;
}) {
  return (
    <div style={{
      display: 'flex', gap: 16,
      padding: '18px 20px',
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      border: `1px solid ${PC.line}`,
      borderRadius: 16,
      boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 1px 2px rgba(26,22,20,0.03)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `linear-gradient(180deg, ${PC.accentSoft} 0%, #FFFFFF 100%)`,
        border: `1px solid ${PC.line2}`,
        display: 'grid', placeItems: 'center',
        boxShadow: 'inset 0 1px 0 #FFFFFF',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: PC.ink, letterSpacing: '-0.15px' }}>
            {title}
          </div>
          {badge}
        </div>
        <div style={{ marginTop: 4, fontSize: 12.5, lineHeight: 1.55, color: PC.muted, letterSpacing: '-0.05px' }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function FeeCard({ title, body, amount }: { title: string; body: string; amount: string }) {
  return (
    <div style={{
      padding: '18px 20px',
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      border: `1px solid ${PC.line}`,
      borderRadius: 16,
      boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 1px 2px rgba(26,22,20,0.03)',
    }}>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: PC.ink, letterSpacing: '-0.15px' }}>{title}</p>
      <p style={{ margin: '6px 0 0', fontSize: 12.5, lineHeight: 1.55, color: PC.muted }}>{body}</p>
      <p style={{
        margin: '12px 0 0', fontSize: 18, fontWeight: 600,
        letterSpacing: '-0.04em', color: PC.ink,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {amount}{' '}
        <span style={{ fontSize: 13, fontWeight: 400, color: PC.muted }}>+ GST</span>
      </p>
    </div>
  );
}

function GooCampusNote({ children }: { children: ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 16px',
      background: PC.greenSoft,
      border: `1px solid ${PC.greenLine}`,
      borderRadius: 14,
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 8, flexShrink: 0,
        display: 'grid', placeItems: 'center',
        background: '#FFFFFF', border: `1px solid ${PC.greenLine}`,
        marginTop: 1,
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2.5 6.5l2.5 2.5L10 3.5" stroke={PC.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: '#1A4035' }}>
        {children}
      </p>
    </div>
  );
}

function DividerRule() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${PC.line2}, transparent)` }} />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 1 L8.4 5.6 L13 7 L8.4 8.4 L7 13 L5.6 8.4 L1 7 L5.6 5.6 Z"
          fill={PC.gold} opacity="0.55" />
      </svg>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${PC.line2}, transparent)` }} />
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{
      marginTop: 18,
      display: 'flex', justifyContent: 'center',
      fontSize: 10.5, fontWeight: 600, color: PC.muted,
      letterSpacing: '1.8px', textTransform: 'uppercase',
    }}>
      {children}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────

interface WelcomeScreenProps {
  firstName?: string | null;
}

export function WelcomeScreen({ firstName }: WelcomeScreenProps) {
  const [sectionMapOpen, setSectionMapOpen] = useState(false);

  return (
    <div style={{
      position: 'relative',
      width: '100%', maxWidth: 520,
      margin: '0 auto',
      padding: '40px 24px calc(3rem + env(safe-area-inset-bottom))',
      overflow: 'hidden',
      fontFamily: 'var(--font-inter), sans-serif',
      color: PC.ink,
    }}>
      {/* Decorative radial blobs */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
        width: 480, height: 480,
        background: `radial-gradient(closest-side, ${PC.accentSoft} 0%, rgba(255,244,244,0.4) 45%, rgba(251,248,244,0) 72%)`,
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: -200, right: -100,
        width: 320, height: 320,
        background: `radial-gradient(closest-side, ${PC.goldSoft} 0%, rgba(245,238,222,0) 72%)`,
        pointerEvents: 'none', opacity: 0.7,
      }} />

      {/* Brand logo */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <Image src="/samvaya-logo-red.png" alt="Samvaya" width={120} height={32}
          style={{ height: 24, width: 'auto' }} />
      </div>

      {/* Eyebrow */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px',
          background: 'rgba(163,23,31,0.06)',
          border: '1px solid rgba(163,23,31,0.18)',
          borderRadius: 999,
          fontSize: 10.5, fontWeight: 600, letterSpacing: '1.4px',
          textTransform: 'uppercase',
          color: PC.accent,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: PC.accent }} />
          For verified doctors
        </div>
      </div>

      {/* Hero heading */}
      <div style={{ position: 'relative', textAlign: 'center', marginTop: 24 }}>
        <h1 style={{
          margin: '0 auto',
          fontFamily: 'var(--font-fraunces), serif',
          fontSize: 40, lineHeight: 1.08,
          fontWeight: 500, letterSpacing: '-1.2px',
          color: PC.ink, maxWidth: '14ch',
        }}>
          Let&apos;s build your profile
          {firstName && (
            <>, <span style={{ fontStyle: 'italic', color: PC.accent }}>{firstName}</span></>
          )}
        </h1>
        <p style={{
          marginTop: 14, fontSize: 15, lineHeight: 1.6,
          color: PC.muted, maxWidth: 340, marginInline: 'auto',
          letterSpacing: '-0.05px',
        }}>
          A thoughtful questionnaire, built by matchmakers. Answer at your pace — we&apos;ll keep your spot.
        </p>
      </div>

      {/* Stats strip */}
      <div style={{
        position: 'relative',
        display: 'flex', marginTop: 24,
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: `1px solid ${PC.line}`,
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 1px 2px rgba(26,22,20,0.03)',
      }}>
        {[
          { k: '14',       l: 'sections' },
          { k: '~38 min',  l: 'to complete' },
          { k: 'Auto',     l: 'saved always' },
        ].map((s, i) => (
          <div key={s.l} style={{
            flex: 1, textAlign: 'center', padding: '14px 0',
            borderLeft: i > 0 ? `1px solid ${PC.line}` : 'none',
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.3px', color: PC.ink }}>{s.k}</div>
            <div style={{ marginTop: 3, fontSize: 11, color: PC.muted }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── How it works ── */}
      <div style={{ position: 'relative', marginTop: 36 }}>
        <DividerRule />
        <SectionLabel>How it works</SectionLabel>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Row
            icon={<DocumentIcon />}
            title="Complete your profile"
            subtitle="Fill in all 14 sections at your own pace — auto-saved so you never lose progress."
            badge={<StepBadge n="Step 1" />}
          />
          <Row
            icon={<EyeIcon />}
            title="We review & reach out"
            subtitle="Our team reads every answer carefully, verifies your medical credentials, and contacts you within a few business days."
            badge={<StepBadge n="Step 2" />}
          />
          <Row
            icon={<ShieldCheckIcon />}
            title={
              <>
                Pay the verification fee{' '}
                <span style={{ color: PC.muted, fontWeight: 500, fontSize: 13 }}>· {PRICING.VERIFICATION_FEE_DISPLAY}</span>
              </>
            }
            subtitle="One-time fee — charged only after you've completed the form and we've reviewed it. GooCampus clients pay nothing."
            badge={<StepBadge n="Step 3" />}
          />
          <Row
            icon={<PoolIcon />}
            title="Join the matching pool"
            subtitle="Once verified, we begin curating compatible matches from our pool of verified doctors."
            badge={<StepBadge n="Step 4" />}
          />
        </div>
      </div>

      {/* ── Fees at a glance ── */}
      <div style={{ position: 'relative', marginTop: 36 }}>
        <DividerRule />
        <SectionLabel>Fees at a glance</SectionLabel>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <FeeCard
            title="Verification fee"
            body="Identity, education, employment, address & court-record checks — powered by OnGrid BGV. Paid once after profile review."
            amount={PRICING.VERIFICATION_BASE}
          />
          <GooCampusNote>
            <strong style={{ fontWeight: 600 }}>GooCampus clients</strong> — your verification fee is fully waived. Contact your GooCampus representative for details.
          </GooCampusNote>

          <FeeCard
            title="Service fee"
            body="Charged only after we find a match and both parties confirm mutual interest. Nothing until then."
            amount={PRICING.MEMBERSHIP_BASE}
          />
          <GooCampusNote>
            <strong style={{ fontWeight: 600 }}>GooCampus clients</strong> — special discounted pricing available. Contact your GooCampus representative for exclusive member rates.
          </GooCampusNote>

          {/* Founder-led matchmaking — premium card */}
          <div style={{
            position: 'relative', overflow: 'hidden',
            padding: '18px 20px',
            background: PC.goldSoft,
            border: '1px solid rgba(168,128,74,0.30)',
            borderRadius: 16,
            boxShadow: '0 1px 2px rgba(26,22,20,0.04)',
          }}>
            <div aria-hidden="true" style={{
              position: 'absolute', top: -20, right: -20,
              width: 90, height: 90, borderRadius: '50%',
              background: 'rgba(163,23,31,0.04)',
            }} />
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '2px 10px 2px 8px', marginBottom: 10,
              background: 'rgba(163,23,31,0.08)', borderRadius: 99,
              fontSize: 10.5, fontWeight: 700, letterSpacing: '0.8px',
              textTransform: 'uppercase', color: PC.accent,
            }}>
              <svg width="9" height="9" viewBox="0 0 10 10" fill={PC.accent} aria-hidden="true">
                <path d="M5 1l1.2 2.5L9 4l-2 2 .5 2.8L5 7.5 2.5 8.8 3 6 1 4l2.8-.5L5 1z" />
              </svg>
              Premium
            </div>
            <p style={{
              margin: 0, position: 'relative',
              fontFamily: 'var(--font-fraunces), serif',
              fontSize: 18, fontWeight: 500, letterSpacing: '-0.04em',
              color: PC.ink,
            }}>
              Founder-led matchmaking
            </p>
            <p style={{ margin: '8px 0 0', position: 'relative', fontSize: 13, lineHeight: 1.6, color: PC.ink2 }}>
              Premium, hands-on matchmaking facilitated directly by Samvaya&apos;s founding members. We personally handle every coordination, collaboration, and discussion.
            </p>
            <a href="mailto:hello@samvayamatrimony.com" style={{
              position: 'relative', marginTop: 14,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 38, padding: '0 16px',
              background: PC.accent, border: 'none', borderRadius: 99, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: '#FFFFFF', textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(163,23,31,0.25)',
              fontFamily: 'var(--font-inter), sans-serif',
            }}>
              Contact us for pricing
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 6h7M7 3l2.5 3L7 9" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Expandable section map ── */}
      <div style={{ position: 'relative', marginTop: 32 }}>
        <button
          type="button"
          onClick={() => setSectionMapOpen(o => !o)}
          aria-expanded={sectionMapOpen}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            margin: '0 auto', background: 'transparent', border: 'none',
            cursor: 'pointer', padding: 0,
            fontSize: 12, fontWeight: 500, color: PC.accent,
            fontFamily: 'var(--font-inter), sans-serif',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ transition: 'transform 0.2s', transform: sectionMapOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
            aria-hidden="true">
            <path d="M4 3l3 3-3 3" stroke={PC.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {sectionMapOpen ? 'Hide section overview' : "See what's covered in 14 sections"}
        </button>

        {sectionMapOpen && (
          <div style={{
            marginTop: 14, padding: '16px 18px',
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: `1px solid ${PC.line}`, borderRadius: 16,
            boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 1px 2px rgba(26,22,20,0.03)',
          }}>
            {SECTION_GROUPS.map(group => (
              <div key={group.label} style={{ marginBottom: 14 }}>
                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '1.4px',
                  textTransform: 'uppercase', color: PC.muted, marginBottom: 8,
                }}>
                  {group.label}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {group.sections.map(name => (
                    <span key={name} style={{
                      padding: '3px 10px',
                      background: '#FFFFFF',
                      border: `1px solid ${PC.line}`,
                      borderRadius: 99,
                      fontSize: 12, color: PC.ink2,
                    }}>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy footer note */}
      <div style={{
        position: 'relative', marginTop: 28,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
        fontSize: 11.5, color: PC.faint,
      }}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="2.5" y="6" width="9" height="6" rx="1.2" stroke={PC.faint} strokeWidth="1.2" />
          <path d="M4.5 6V4.2a2.5 2.5 0 015 0V6" stroke={PC.faint} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        Your profile is private and reviewed only by our team.
      </div>

      {/* CTA */}
      <div style={{
        position: 'relative', marginTop: 28,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      }}>
        <Link
          href="/app/onboarding/a/intro"
          className="form-btn-primary"
          style={{ width: '100%', maxWidth: 320 }}
        >
          Begin
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
