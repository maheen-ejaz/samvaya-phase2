'use client';

import React, { useState } from 'react';
import type { MatchShareData, ShareProfile, DimensionScore } from '@/lib/share/match-data';

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtHeight(cm: number | undefined): string {
  if (!cm) return '—';
  const ft = Math.floor(cm / 30.48);
  const inch = Math.round((cm / 2.54) % 12);
  return `${ft}'${inch}" (${cm} cm)`;
}

function fmtExp(months: number | undefined): string {
  if (!months) return '—';
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m}mo`;
  if (m === 0) return `${y}yr`;
  return `${y}yr ${m}mo`;
}

function fmtTimeline(t: string | undefined): string {
  if (!t) return '—';
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function scoreColor(score: number): string {
  if (score >= 80) return '#16a34a';
  if (score >= 65) return '#d97706';
  return '#dc2626';
}

// ── ScoreRing ─────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="108" height="108" viewBox="0 0 108 108">
        <circle cx="54" cy="54" r={r} fill="none" stroke="#e5e0d8" strokeWidth="8" />
        <circle
          cx="54" cy="54" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 54 54)"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        <text x="54" y="50" textAnchor="middle" fontSize="22" fontWeight="700" fill={color}>{score}</text>
        <text x="54" y="66" textAnchor="middle" fontSize="10" fill="#9e8f82">/ 100</text>
      </svg>
      <span className="text-xs font-medium" style={{ color }}>
        {score >= 80 ? 'Excellent Match' : score >= 65 ? 'Good Match' : 'Moderate Match'}
      </span>
    </div>
  );
}

// ── DimensionBar ──────────────────────────────────────────────────────────────

function DimensionBar({ dim }: { dim: DimensionScore }) {
  const avg = Math.round((dim.scoreA + dim.scoreB) / 2);
  const pct = (avg / 10) * 100;
  const color = avg >= 8 ? '#16a34a' : avg >= 6 ? '#d97706' : '#dc2626';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span style={{ color: '#6b5c52' }}>{dim.label}</span>
        <span className="font-semibold" style={{ color }}>{avg}/10</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: '#e5e0d8' }}>
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ── ProfilePhoto ──────────────────────────────────────────────────────────────

function ProfilePhoto({ profile, label, blurred }: { profile: ShareProfile; label: string; blurred: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: '3/4' }}>
      {profile.photoUrl ? (
        <img
          src={profile.photoUrl}
          alt={blurred ? 'Profile' : (profile.firstName || label)}
          className="h-full w-full object-cover"
          style={blurred ? { filter: 'blur(16px)', transform: 'scale(1.1)' } : undefined}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center" style={{ background: '#e5e0d8' }}>
          <span className="text-4xl">👤</span>
        </div>
      )}

      {blurred && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: 'rgba(163, 23, 31, 0.85)', color: '#fff', backdropFilter: 'blur(4px)' }}
          >
            Preview
          </span>
        </div>
      )}

      {!blurred && profile.firstName && (
        <div
          className="absolute bottom-0 left-0 right-0 px-3 py-2"
          style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}
        >
          <p className="text-sm font-semibold text-white">{profile.firstName}</p>
        </div>
      )}

      <div
        className="absolute top-2 left-2 rounded-lg px-2 py-0.5 text-xs font-medium"
        style={{ background: 'rgba(251,248,244,0.9)', color: '#A3171F' }}
      >
        {label}
      </div>
    </div>
  );
}

// ── StatGrid ──────────────────────────────────────────────────────────────────

function StatGrid({ profile }: { profile: ShareProfile }) {
  const items = [
    { label: 'Age', value: profile.age ? `${profile.age} yrs` : '—' },
    { label: 'Height', value: fmtHeight(profile.heightCm) },
    { label: 'City', value: profile.city || '—' },
    { label: 'Specialty', value: profile.specialty || '—' },
    { label: 'Experience', value: fmtExp(profile.experienceMonths) },
    { label: 'Religion', value: profile.religion || '—' },
    { label: 'Marriage', value: fmtTimeline(profile.marriageTimeline) },
    { label: 'Status', value: fmtTimeline(profile.maritalStatus) },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl p-3" style={{ background: '#f0ede8' }}>
          <p className="text-xs" style={{ color: '#9e8f82' }}>{item.label}</p>
          <p className="text-sm font-medium mt-0.5" style={{ color: '#2d1f19' }}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── FullProfileCard ───────────────────────────────────────────────────────────

function FullProfileCard({ profile, label }: { profile: ShareProfile; label: string }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const photos = profile.allPhotoUrls ?? (profile.photoUrl ? [profile.photoUrl] : []);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e0d8', background: '#fff' }}>
      {/* Photo gallery */}
      {photos.length > 0 && (
        <div className="relative" style={{ aspectRatio: '4/3' }}>
          <img src={photos[activePhoto]} alt={profile.firstName || label} className="h-full w-full object-cover" />
          {photos.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: i === activePhoto ? '20px' : '6px', background: i === activePhoto ? '#A3171F' : 'rgba(255,255,255,0.6)' }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-4 space-y-4">
        <div>
          <p className="text-lg font-semibold" style={{ color: '#2d1f19' }}>{profile.firstName || label}</p>
          {profile.designation && (
            <p className="text-sm" style={{ color: '#6b5c52' }}>{profile.designation} · {profile.specialty}</p>
          )}
        </div>

        {profile.keyQuote && (
          <blockquote className="rounded-xl p-3 text-sm italic" style={{ background: '#fdf6ee', borderLeft: '3px solid #A3171F', color: '#4a3728' }}>
            &ldquo;{profile.keyQuote}&rdquo;
          </blockquote>
        )}

        <StatGrid profile={profile} />

        {profile.personalitySummary && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9e8f82' }}>Personality</p>
            <p className="text-sm leading-relaxed" style={{ color: '#4a3728' }}>{profile.personalitySummary}</p>
          </div>
        )}

        {profile.hobbies && profile.hobbies.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9e8f82' }}>Interests</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.hobbies.map((h, i) => (
                <span key={i} className="rounded-full px-2.5 py-1 text-xs" style={{ background: '#fdf6ee', color: '#A3171F', border: '1px solid #e5cfc8' }}>
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}

        {(profile.diet || profile.smoking || profile.drinking || profile.fitnessHabits) && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9e8f82' }}>Lifestyle</p>
            <div className="grid grid-cols-2 gap-2">
              {profile.diet && <div className="rounded-lg p-2" style={{ background: '#f0ede8' }}><p className="text-xs" style={{ color: '#9e8f82' }}>Diet</p><p className="text-xs font-medium mt-0.5" style={{ color: '#2d1f19' }}>{fmtTimeline(profile.diet)}</p></div>}
              {profile.smoking && <div className="rounded-lg p-2" style={{ background: '#f0ede8' }}><p className="text-xs" style={{ color: '#9e8f82' }}>Smoking</p><p className="text-xs font-medium mt-0.5" style={{ color: '#2d1f19' }}>{fmtTimeline(profile.smoking)}</p></div>}
              {profile.drinking && <div className="rounded-lg p-2" style={{ background: '#f0ede8' }}><p className="text-xs" style={{ color: '#9e8f82' }}>Drinking</p><p className="text-xs font-medium mt-0.5" style={{ color: '#2d1f19' }}>{fmtTimeline(profile.drinking)}</p></div>}
              {profile.fitnessHabits && <div className="rounded-lg p-2" style={{ background: '#f0ede8' }}><p className="text-xs" style={{ color: '#9e8f82' }}>Fitness</p><p className="text-xs font-medium mt-0.5" style={{ color: '#2d1f19' }}>{fmtTimeline(profile.fitnessHabits)}</p></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MatchExpiredView ──────────────────────────────────────────────────────────

export function MatchExpiredView() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ background: '#FBF8F4' }}>
      <div className="text-center max-w-sm space-y-4">
        <div className="text-5xl">🔒</div>
        <h1 className="text-xl font-semibold" style={{ color: '#2d1f19' }}>Link Expired</h1>
        <p className="text-sm leading-relaxed" style={{ color: '#6b5c52' }}>
          This match preview link has expired or is no longer valid.
          Please contact the Samvaya team for assistance.
        </p>
        <a
          href="https://samvayamatrimony.com"
          className="inline-block rounded-full px-6 py-2.5 text-sm font-medium text-white"
          style={{ background: '#A3171F' }}
        >
          Visit Samvaya
        </a>
      </div>
    </div>
  );
}

// ── Main MatchShareView ───────────────────────────────────────────────────────

export function MatchShareView({ data }: { data: MatchShareData }) {
  const isRevealed = data.tier === 'full';
  const expiryLabel = new Date(data.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen" style={{ background: '#FBF8F4', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="mx-auto max-w-[480px] pb-16">
        {/* Header */}
        <div className="px-4 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid #e5e0d8' }}>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#A3171F' }}>Samvaya</p>
            <p className="text-xs mt-0.5" style={{ color: '#9e8f82' }}>Curated Match Preview</p>
          </div>
          {isRevealed ? (
            <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: '#fdf0e8', color: '#c05621', border: '1px solid #f8d5b8' }}>
              ✦ Full Reveal
            </span>
          ) : (
            <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: '#f0ede8', color: '#6b5c52', border: '1px solid #e5e0d8' }}>
              🔒 Preview
            </span>
          )}
        </div>

        <div className="px-4 space-y-6 pt-6">
          {/* Photos row */}
          <div className="grid grid-cols-2 gap-3">
            <ProfilePhoto profile={data.profileA} label="Profile A" blurred={!isRevealed} />
            <ProfilePhoto profile={data.profileB} label="Profile B" blurred={!isRevealed} />
          </div>

          {/* Score */}
          <div className="flex flex-col items-center py-4">
            <ScoreRing score={data.overallScore} />
            {data.recommendation && (
              <p className="mt-3 text-xs text-center max-w-xs" style={{ color: '#6b5c52' }}>{data.recommendation}</p>
            )}
          </div>

          {/* Narrative */}
          {data.matchNarrative && (
            <div className="rounded-2xl p-4" style={{ background: '#fff', border: '1px solid #e5e0d8' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9e8f82' }}>Why They Match</p>
              <p className="text-sm leading-relaxed" style={{ color: '#4a3728' }}>{data.matchNarrative}</p>
            </div>
          )}

          {/* Highlights */}
          {data.highlights.length > 0 && (
            <div className="rounded-2xl p-4 space-y-2" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#15803d' }}>Strengths</p>
              {data.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-green-600 text-sm">✓</span>
                  <p className="text-sm" style={{ color: '#166534' }}>{h}</p>
                </div>
              ))}
            </div>
          )}

          {/* Concerns (full only) */}
          {isRevealed && data.concerns.length > 0 && (
            <div className="rounded-2xl p-4 space-y-2" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#92400e' }}>Points to Discuss</p>
              {data.concerns.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-amber-600 text-sm">◆</span>
                  <p className="text-sm" style={{ color: '#78350f' }}>{c}</p>
                </div>
              ))}
            </div>
          )}

          {/* Dimensions */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: '#fff', border: '1px solid #e5e0d8' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9e8f82' }}>Compatibility Dimensions</p>
            {(isRevealed ? data.dimensions : data.dimensions.slice(0, 5)).map((dim) => (
              <DimensionBar key={dim.key} dim={dim} />
            ))}
            {!isRevealed && data.dimensions.length > 5 && (
              <p className="text-xs text-center pt-1" style={{ color: '#9e8f82' }}>+{data.dimensions.length - 5} more dimensions in full profile</p>
            )}
          </div>

          {/* Full profile cards */}
          {isRevealed && (
            <>
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px" style={{ background: '#e5e0d8' }} />
                <span className="text-xs font-semibold" style={{ color: '#9e8f82' }}>FULL PROFILES</span>
                <div className="flex-1 h-px" style={{ background: '#e5e0d8' }} />
              </div>
              <FullProfileCard profile={data.profileA} label="Profile A" />
              <FullProfileCard profile={data.profileB} label="Profile B" />
            </>
          )}

          {/* Preview CTA */}
          {!isRevealed && (
            <div className="rounded-2xl p-5 text-center space-y-2" style={{ background: '#A3171F' }}>
              <p className="text-sm font-semibold text-white">Interested in this match?</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Let the Samvaya team know. Once both parties express interest, full profiles will be shared.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 px-4 text-center">
          <p className="text-xs" style={{ color: '#b8a99d' }}>
            Shared by Samvaya Matrimony · Link expires {expiryLabel}
          </p>
          <p className="text-xs mt-1" style={{ color: '#d4c9c3' }}>
            This profile is confidential. Do not share beyond intended recipients.
          </p>
        </div>
      </div>
    </div>
  );
}
