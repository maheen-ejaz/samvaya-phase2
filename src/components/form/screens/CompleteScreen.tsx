'use client';

import type { ReactNode } from 'react';

interface CompleteScreenProps {
  isGoocampus?: boolean;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919742811599';

const PC = {
  bg: '#FBF8F4',
  ink: '#1A1614',
  muted: '#7A7370',
  faint: '#A8A19D',
  line: '#ECE7E2',
  line2: '#E3DDD6',
  accent: '#A3171F',
  accentDeep: '#7D1118',
  accentSoft: '#FFF4F4',
  gold: '#A8804A',
  goldSoft: '#F5EEDE',
  card: '#FFFFFF',
};

function formatDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function Crest() {
  return (
    <div style={{
      position: 'relative',
      width: 320, height: 320, margin: '0 auto',
      display: 'grid', placeItems: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(closest-side, ${PC.accentSoft} 0%, rgba(255,244,244,0.5) 40%, rgba(251,248,244,0) 72%)`,
        pointerEvents: 'none',
      }} />

      <svg viewBox="0 0 320 320" width="320" height="320" fill="none"
        style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
        <defs>
          <linearGradient id="ringFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PC.accent} stopOpacity="0.32" />
            <stop offset="55%" stopColor={PC.accent} stopOpacity="0.18" />
            <stop offset="100%" stopColor={PC.accent} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ringFade2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PC.gold} stopOpacity="0.35" />
            <stop offset="100%" stopColor={PC.gold} stopOpacity="0" />
          </linearGradient>
        </defs>

        <circle cx="160" cy="160" r="154" stroke="url(#ringFade)" strokeWidth="1" />
        <circle cx="160" cy="160" r="124" stroke="url(#ringFade)" strokeWidth="1" strokeDasharray="1 4" opacity="0.85" />
        <circle cx="160" cy="160" r="96" stroke="url(#ringFade)" strokeWidth="1" />
        <circle cx="160" cy="160" r="68" stroke="url(#ringFade2)" strokeWidth="1" strokeDasharray="1 3" />

        <path d="M160 26 C200 86 200 234 160 294 C120 234 120 86 160 26 Z"
          stroke={PC.accent} strokeOpacity="0.18" strokeWidth="1" fill="none" />
        <path d="M26 160 C86 120 234 120 294 160 C234 200 86 200 26 160 Z"
          stroke={PC.accent} strokeOpacity="0.10" strokeWidth="1" fill="none" />

        {[[160, 26], [294, 160], [160, 294], [26, 160]].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" fill={PC.gold} opacity="0.5" />
        ))}
      </svg>

      <div style={{
        position: 'relative',
        width: 104, height: 104, borderRadius: '50%',
        display: 'grid', placeItems: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: -10, borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(163,23,31,0.10) 0%, rgba(163,23,31,0) 70%)',
        }} />
        <div style={{
          position: 'relative',
          width: 104, height: 104, borderRadius: '50%',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFAF5 100%)',
          boxShadow: `
            0 1px 0 rgba(255,255,255,0.9) inset,
            0 0 0 1px rgba(168,128,74,0.28),
            0 12px 28px rgba(125,17,24,0.12),
            0 2px 6px rgba(26,22,20,0.06)
          `,
          display: 'grid', placeItems: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: `radial-gradient(120% 120% at 30% 20%, #C53640 0%, ${PC.accent} 45%, ${PC.accentDeep} 100%)`,
            display: 'grid', placeItems: 'center',
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.22),
              inset 0 -4px 10px rgba(0,0,0,0.18),
              0 6px 14px rgba(125,17,24,0.35)
            `,
          }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <path d="M6 13.2l4.6 4.6L20 8" stroke="#FFF" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))' }} />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, title, subtitle }: { icon: ReactNode; title: ReactNode; subtitle: ReactNode }) {
  return (
    <div style={{
      display: 'flex', gap: 16,
      padding: '20px 20px',
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      border: `1px solid ${PC.line}`,
      borderRadius: 16,
      boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 1px 2px rgba(26,22,20,0.03)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flex: 'none',
        background: `linear-gradient(180deg, ${PC.accentSoft} 0%, #FFFFFF 100%)`,
        border: `1px solid ${PC.line2}`,
        display: 'grid', placeItems: 'center',
        color: PC.accent,
        boxShadow: 'inset 0 1px 0 #FFFFFF',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: PC.ink, letterSpacing: '-0.15px' }}>
          {title}
        </div>
        <div style={{ marginTop: 4, fontSize: 12.5, lineHeight: 1.55, color: PC.muted, letterSpacing: '-0.05px' }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function DividerRule() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      margin: '0 auto', width: '100%',
    }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${PC.line2}, transparent)` }} />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flex: 'none' }} aria-hidden="true">
        <path d="M7 1 L8.4 5.6 L13 7 L8.4 8.4 L7 13 L5.6 8.4 L1 7 L5.6 5.6 Z"
          fill={PC.gold} opacity="0.55" />
      </svg>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${PC.line2}, transparent)` }} />
    </div>
  );
}

export function CompleteScreen({ isGoocampus }: CompleteScreenProps) {
  return (
    <div style={{
      width: '100%',
      maxWidth: 520,
      margin: '0 auto',
      background: PC.bg,
      fontFamily: 'var(--font-inter), sans-serif',
      color: PC.ink,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div aria-hidden="true" style={{
        position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
        width: 520, height: 520,
        background: `radial-gradient(closest-side, ${PC.accentSoft} 0%, rgba(255,244,244,0.4) 45%, rgba(251,248,244,0) 72%)`,
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: -200, right: -100,
        width: 380, height: 380,
        background: `radial-gradient(closest-side, ${PC.goldSoft} 0%, rgba(245,238,222,0) 72%)`,
        pointerEvents: 'none', opacity: 0.7,
      }} />

      <div style={{ height: 24 }} />

      <div style={{
        position: 'relative',
        maxWidth: 520, margin: '0 auto',
        padding: '8px 24px 32px',
      }}>
        <div style={{ marginTop: 8 }}>
          <Crest />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: -24, position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 14px',
            background: `linear-gradient(180deg, #FBF3E0 0%, ${PC.goldSoft} 100%)`,
            border: `1px solid rgba(168,128,74,0.32)`,
            borderRadius: 999,
            boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 4px 10px rgba(168,128,74,0.12)',
            color: PC.gold,
            fontSize: 10.5, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase',
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: PC.gold,
              boxShadow: `0 0 0 3px rgba(168,128,74,0.18)`,
            }} />
            Profile complete
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 22 }}>
          <h1 style={{
            margin: 0,
            fontFamily: 'var(--font-fraunces), serif',
            fontSize: 40, lineHeight: 1.05,
            fontWeight: 500, letterSpacing: '-1.2px',
            color: PC.ink,
          }}>
            Your application
            <br />
            <span style={{ fontStyle: 'italic', fontWeight: 500, color: PC.accent }}>
              is in.
            </span>
          </h1>
        </div>

        <div style={{
          textAlign: 'center',
          fontSize: 14.5, lineHeight: 1.6, color: PC.muted,
          maxWidth: 320, margin: '18px auto 0',
          letterSpacing: '-0.05px',
        }}>
          Thank you for completing your Samvaya profile. We&apos;ll take it from here — quietly.
        </div>

        <div style={{
          marginTop: 16,
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
          fontSize: 11.5, color: PC.faint, letterSpacing: '0.1px',
        }}>
          <span>All 14 sections complete</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: PC.line2 }} />
          <span>{formatDate()}</span>
        </div>

        <div style={{ marginTop: 40 }}>
          <DividerRule />
        </div>

        <div style={{
          marginTop: 22,
          display: 'flex', justifyContent: 'center',
          fontSize: 10.5, fontWeight: 600, color: PC.muted,
          letterSpacing: '1.8px', textTransform: 'uppercase',
        }}>
          What happens next
        </div>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isGoocampus ? <GooCampusRows /> : <VerificationRows />}
        </div>

        {!isGoocampus && (
          <>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                'Hi, I have completed my Samvaya profile and would like to proceed with the verification fee payment of ₹3,500 + GST.',
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 32,
                width: '100%', height: 58,
                background: `linear-gradient(180deg, ${PC.accent} 0%, ${PC.accentDeep} 100%)`,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 16,
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.1px',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                cursor: 'pointer',
                textDecoration: 'none',
                boxShadow: `
                  0 1px 0 rgba(255,255,255,0.18) inset,
                  0 -2px 0 rgba(0,0,0,0.10) inset,
                  0 10px 24px rgba(163,23,31,0.28),
                  0 2px 4px rgba(125,17,24,0.20)
                `,
              }}
            >
              <span style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'rgba(255,255,255,0.16)',
                display: 'grid', placeItems: 'center',
              }}>
                <WhatsAppIcon />
              </span>
              Contact us on WhatsApp
            </a>

            <div style={{
              marginTop: 14, textAlign: 'center',
              fontSize: 12.5, color: PC.faint, letterSpacing: '-0.05px',
            }}>
              Our team will also reach out to you shortly.
            </div>
          </>
        )}

        <div style={{
          marginTop: 36, paddingTop: 22,
          borderTop: `1px solid ${PC.line}`,
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
          fontSize: 11.5, color: PC.muted, letterSpacing: '0.05px',
        }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="2.5" y="6" width="9" height="6" rx="1.2" stroke={PC.muted} strokeWidth="1.2" />
            <path d="M4.5 6V4.2a2.5 2.5 0 015 0V6" stroke={PC.muted} strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Your profile is private and reviewed only by our team.
        </div>
      </div>
    </div>
  );
}

function GooCampusRows() {
  return (
    <>
      <Row
        title={"You\u2019ve done the hard part"}
        subtitle="Your profile is complete. Our team will read every answer carefully — this usually takes 3–5 days."
        icon={<PersonIcon />}
      />
      <Row
        title="GooCampus verification applies"
        subtitle="As a GooCampus member, your verification is already complete."
        icon={<ShieldCheckIcon />}
      />
      <Row
        title={"We\u2019ll reach out to you"}
        subtitle={"Once our review is done, we\u2019ll contact you directly with everything you need to know about the next steps."}
        icon={<MessageIcon />}
      />
    </>
  );
}

function VerificationRows() {
  return (
    <>
      <Row
        title={"You\u2019ve done the hard part"}
        subtitle="Your profile is complete. Our team will read every answer carefully — this usually takes 3–5 days."
        icon={<PersonIcon />}
      />
      <Row
        title={<>Verification fee · ₹3,500 <span style={{ color: PC.muted, fontWeight: 500 }}>+ GST</span></>}
        subtitle="One-time. Covers identity, education, employment, address and court-record checks."
        icon={<ShieldWithCheckIcon />}
      />
      <Row
        title={"We\u2019ll reach out to you"}
        subtitle={"Once our review is done, we\u2019ll contact you directly with everything you need to know about the next steps."}
        icon={<MessageIcon />}
      />
    </>
  );
}

function PersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="7" r="3.2" stroke={PC.accent} strokeWidth="1.4" />
      <path d="M3.5 17c.8-3.2 3.3-4.8 6.5-4.8s5.7 1.6 6.5 4.8" stroke={PC.accent} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ShieldWithCheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 1.8 L3 4.2 V9.5 c0 4.2 3.2 7.6 7 8.3 3.8-.7 7-4.1 7-8.3 V4.2 L10 1.8 Z"
        stroke={PC.accent} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7 10.2 L9 12.2 L13.2 8" stroke={PC.accent} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
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

function MessageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5 a2 2 0 012-2 h10 a2 2 0 012 2 v7 a2 2 0 01-2 2 H8 l-3.5 2.8 V14 H5 a2 2 0 01-2-2 V5 Z"
        stroke={PC.accent} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      <circle cx="7.5" cy="8.5" r="0.9" fill={PC.accent} />
      <circle cx="10" cy="8.5" r="0.9" fill={PC.accent} />
      <circle cx="12.5" cy="8.5" r="0.9" fill={PC.accent} />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true">
      <path d="M17.5 14.4c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.22 1.35.19 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z" />
    </svg>
  );
}
