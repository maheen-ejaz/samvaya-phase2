'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';

interface CompleteScreenProps {
  isGoocampus?: boolean;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919742811599';

const C = {
  ink: '#1A1614',
  ink2: '#3B3430',
  muted: '#7A7370',
  faint: '#A8A19D',
  line: '#ECE7E2',
  line2: '#E3DDD6',
  bg: '#FBF8F4',
  accent: '#A3171F',
  accentSoft: '#FFF4F4',
  accentDeep: '#7D1118',
  gold: '#A8804A',
  goldSoft: '#F5EEDE',
};

function formatDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function InfoRow({ title, sub, icon }: { title: string; sub: ReactNode; icon: ReactNode }) {
  return (
    <div style={{
      display: 'flex', gap: 14,
      borderRadius: 16,
      border: `1px solid ${C.line}`,
      background: '#FFFFFF',
      padding: 16,
    }}>
      <div style={{
        width: 40, height: 40, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 12,
        background: C.accentSoft,
        color: C.accent,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, color: C.ink }}>
          {title}
        </div>
        <div style={{ marginTop: 4, fontSize: 12.5, lineHeight: 1.5, color: C.muted }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

export function CompleteScreen({ isGoocampus }: CompleteScreenProps) {
  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px calc(40px + env(safe-area-inset-bottom))',
      fontFamily: 'var(--font-inter), sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 520, position: 'relative' }}>

        {/* Brand */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <Image src="/samvaya-logo-red.png" alt="Samvaya" width={120} height={32} style={{ height: '24px', width: 'auto' }} />
        </div>

        {/* Arch ornament behind crest */}
        <div aria-hidden="true" style={{
          position: 'absolute', left: '50%', top: -60,
          transform: 'translateX(-50%)',
          pointerEvents: 'none', opacity: 0.18,
        }}>
          <svg viewBox="0 0 440 300" width="440" height="300" fill="none">
            {[190, 140, 90].map((r) => (
              <circle key={r} cx="220" cy="150" r={r}
                stroke={C.accent} strokeWidth="1" />
            ))}
            <path d="M220 80 C255 130 255 200 220 240 C185 200 185 130 220 80 Z"
              stroke={C.accent} strokeWidth="1" opacity="0.5" />
          </svg>
        </div>

        {/* Checkmark crest */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div style={{
            width: 80, height: 80,
            borderRadius: '50%',
            background: `radial-gradient(135deg at 30% 30%, ${C.accent} 0%, ${C.accentDeep} 100%)`,
            boxShadow: `0 12px 32px ${C.accent}40, inset 0 1px 0 rgba(255,255,255,0.14)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <path d="M8 17l6 6 12-14" stroke="#fff" strokeWidth="2.4"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Gold "success" badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 14px',
            background: C.goldSoft,
            border: `1px solid rgba(168,128,74,0.28)`,
            borderRadius: 999,
            fontSize: 11, fontWeight: 600,
            letterSpacing: '1.5px', textTransform: 'uppercase',
            color: C.gold,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold }} />
            Profile complete
          </span>
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <h1 style={{
            margin: 0,
            fontFamily: 'var(--font-fraunces), serif',
            fontSize: 'clamp(32px, 5vw, 42px)',
            fontWeight: 500, letterSpacing: '-1.2px',
            lineHeight: 1.08, color: C.ink,
          }}>
            Your application<br />
            <span style={{ fontStyle: 'italic', color: C.accent, fontWeight: 400 }}>is in.</span>
          </h1>
          <p style={{
            marginTop: 14, fontSize: 15, lineHeight: 1.6,
            color: C.muted, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto',
            letterSpacing: '-0.05px',
          }}>
            Thank you for completing your Samvaya profile. We&apos;ll take it from here — quietly.
          </p>
          <div style={{ marginTop: 8, fontSize: 12, color: C.faint }}>
            All 14 sections complete · {formatDate()}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: C.line, margin: '28px 0' }} />

        {/* What happens next */}
        <div>
          <div style={{
            fontSize: 10.5, fontWeight: 600,
            letterSpacing: '1.6px', textTransform: 'uppercase',
            color: C.muted, marginBottom: 12, paddingLeft: 2,
          }}>
            What happens next
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isGoocampus ? <GooCampusRows /> : <VerificationRows />}
          </div>
        </div>

        {/* WhatsApp CTA (non-GooCampus only) */}
        {!isGoocampus && (
          <>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                'Hi, I have completed my Samvaya profile and would like to proceed with the verification fee payment of ₹3,500 + GST.',
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                marginTop: 24, width: '100%', height: 56,
                background: C.accent, color: '#FFFFFF',
                borderRadius: 14, border: 'none',
                fontSize: 15.5, fontWeight: 600,
                fontFamily: 'var(--font-inter), sans-serif',
                letterSpacing: '-0.1px', textDecoration: 'none',
                boxShadow: `0 6px 18px ${C.accent}38, inset 0 1px 0 rgba(255,255,255,0.14)`,
              }}
            >
              <WhatsAppIcon />
              Contact us on WhatsApp
            </a>
            <p style={{ marginTop: 10, textAlign: 'center', fontSize: 12.5, color: C.faint }}>
              Our team will also reach out to you shortly.
            </p>
          </>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 32, paddingTop: 20,
          borderTop: `1px solid ${C.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          fontSize: 12, color: C.faint,
        }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="2.5" y="6" width="9" height="6" rx="1.2" stroke={C.faint} strokeWidth="1.3" />
            <path d="M4.5 6V4.2a2.5 2.5 0 015 0V6" stroke={C.faint} strokeWidth="1.3" strokeLinecap="round" />
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
      <InfoRow
        title="Our team reviews your profile"
        sub="Every Samvaya application is read, not screened by rules."
        icon={<PersonIcon />}
      />
      <InfoRow
        title="GooCampus verification applies"
        sub="As a GooCampus member, your verification is already complete."
        icon={<ShieldCheckIcon />}
      />
      <InfoRow
        title="First curated match · within 7 days"
        sub="No endless swiping. We introduce you to someone only when we think it's right."
        icon={<HeartIcon />}
      />
    </>
  );
}

function VerificationRows() {
  return (
    <>
      <InfoRow
        title="Human review · 24–48 hours"
        sub="Our matchmakers read every answer. We may reach out for a short clarifying call."
        icon={<PersonIcon />}
      />
      <InfoRow
        title="Verification fee · ₹3,500 + GST"
        sub="One-time. Covers identity, education, employment, address and court-record checks."
        icon={<ShieldIcon />}
      />
      <InfoRow
        title="First curated match · within 7 days of verification"
        sub="A service fee of ₹35,000 + GST applies only once we find a match and both parties confirm mutual interest."
        icon={<HeartIcon />}
      />
    </>
  );
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 16c.5-3 3-4.5 6-4.5S14.5 13 15 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 1.5L2.5 4v5c0 3.6 2.7 6.5 6.5 7 3.8-.5 6.5-3.4 6.5-7V4L9 1.5z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6.5 9L8 10.5l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 1.5L2.5 4v5c0 3.6 2.7 6.5 6.5 7 3.8-.5 6.5-3.4 6.5-7V4L9 1.5z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 15s-6-3.6-6-8a3.5 3.5 0 016-2.5A3.5 3.5 0 0115 7c0 4.4-6 8-6 8z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.535 5.845L.057 23.552a.5.5 0 00.613.614l5.788-1.48A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.798 9.798 0 01-5.015-1.378l-.36-.213-3.732.954.984-3.641-.234-.374A9.817 9.817 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
    </svg>
  );
}
