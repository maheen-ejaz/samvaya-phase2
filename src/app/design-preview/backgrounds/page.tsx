'use client';

import { useState } from 'react';

const OPTIONS = [
  { key: 'bg-option-a', label: 'A — Sage / Mint', desc: 'Zocdoc-inspired, fresh and medical' },
  { key: 'bg-option-b', label: 'B — Blush / Rose', desc: 'Samvaya-branded warmth, saturated pink' },
  { key: 'bg-option-c', label: 'C — Lavender', desc: 'Calm, sophisticated, gender-neutral' },
  { key: 'bg-option-d', label: 'D — Rich Cream', desc: 'Warm cream with rose & gold spots' },
];

export default function BackgroundPreview() {
  const [active, setActive] = useState('bg-option-a');

  return (
    <div className={`${active} min-h-screen p-6 transition-all duration-500`}>
      {/* Selector */}
      <div className="mx-auto max-w-md mb-8">
        <h1 className="text-lg font-semibold text-gray-800 mb-4 text-center">Background Options</h1>
        <div className="grid grid-cols-2 gap-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setActive(opt.key)}
              className={`rounded-2xl px-4 py-3 text-left text-sm transition-all ${
                active === opt.key
                  ? 'bg-white shadow-lg ring-2 ring-gray-900'
                  : 'bg-white/60 backdrop-blur-sm hover:bg-white/80'
              }`}
            >
              <div className="font-semibold text-gray-900">{opt.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sample cards — mimics the real dashboard */}
      <div className="mx-auto max-w-md space-y-4">
        {/* Profile Card Preview */}
        <div className="card-glass overflow-hidden rounded-3xl">
          <div className="mx-3 mt-3">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="h-20 w-20 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <span className="rounded-full bg-white/30 backdrop-blur-xl border border-white/40 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg">
                  Cardiology
                </span>
                <span className="rounded-full bg-white/30 backdrop-blur-xl border border-white/40 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg">
                  Bangalore, KA
                </span>
              </div>
            </div>
          </div>
          <div className="px-5 pb-5 pt-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-gray-900">Dr. Priya Sharma</h3>
              <span className="badge badge-success">Verified</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Senior Resident</p>
          </div>
        </div>

        {/* Status Card Preview */}
        <div className="card-glass overflow-hidden rounded-2xl">
          <div className="flex">
            <div className="w-1 flex-shrink-0 bg-blue-500" />
            <div className="flex-1 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/50 backdrop-blur-sm shadow-sm">
                  <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-medium text-gray-900">Verification In Progress</h3>
                    <span className="badge badge-info">Verifying</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    Your payment has been received. Background verification takes 7-10 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Match Stats Preview */}
        <div className="card-glass rounded-2xl p-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Matches</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="glass-sub-card rounded-2xl px-4 py-4 text-center">
              <p className="text-4xl font-thin text-gray-900">5</p>
              <p className="mt-1 text-xs text-gray-400">total</p>
            </div>
            <div className="glass-sub-card rounded-2xl px-4 py-4 text-center">
              <p className="text-4xl font-thin text-gray-900">2</p>
              <p className="mt-1 text-xs text-gray-400">pending</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
