'use client';

import Link from 'next/link';
import { useState } from 'react';

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

/**
 * First-visit intro for the onboarding form. Replaces the old inline
 * WelcomeHeader. Calm, white, centered, ends with a single CTA into
 * Section A.
 */
export function WelcomeScreen({ firstName }: WelcomeScreenProps) {
  const [sectionMapOpen, setSectionMapOpen] = useState(false);

  return (
    <div className="max-w-xl mx-auto py-12 lg:py-20 pb-[calc(3rem+env(safe-area-inset-bottom))] lg:pb-20">
      <div className="form-eyebrow mb-4 text-center">Welcome</div>
      <h1 className="form-title text-center mb-4">
        {firstName ? `Hi ${firstName}, let's begin` : "Let's build your profile"}
      </h1>
      <p className="form-subtitle text-center mb-10">
        About 100 questions, 14 sections. Takes around 45–60 minutes.
        Everything is saved automatically — you can pause and resume anytime.
      </p>

      <div className="rounded-xl border border-[color:var(--color-form-border)] bg-[color:var(--color-form-surface-muted)] px-5 py-5 mb-6">
        <div className="form-label mb-3">A few things to know</div>
        <ul className="space-y-2.5">
          <Bullet>
            Everything you share is private. We never share your details with
            other members until you both confirm mutual interest.
          </Bullet>
          <Bullet>
            There are no right or wrong answers — be honest, take your time.
          </Bullet>
          <Bullet>
            Three of the questions are short conversations with Samvaya
            (about 4–6 messages each). They&apos;re how we get to know you.
          </Bullet>
        </ul>
      </div>

      {/* Expandable section map */}
      <div className="mb-10">
        <button
          type="button"
          onClick={() => setSectionMapOpen((o) => !o)}
          className="form-caption flex items-center gap-1.5 text-[color:var(--color-samvaya-red)] hover:opacity-80 transition-opacity mx-auto"
          aria-expanded={sectionMapOpen}
        >
          <svg
            viewBox="0 0 16 16"
            className={`h-3 w-3 transition-transform ${sectionMapOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 4 10 8 6 12" />
          </svg>
          {sectionMapOpen ? 'Hide section overview' : 'See what\'s covered in 14 sections'}
        </button>

        {sectionMapOpen && (
          <div className="mt-4 rounded-xl border border-[color:var(--color-form-border)] bg-[color:var(--color-form-surface-muted)] px-5 py-4 animate-fade-in-up space-y-3">
            {SECTION_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="form-caption font-medium text-[color:var(--color-form-text-tertiary)] uppercase tracking-wider mb-1">
                  {group.label}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.sections.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-[color:var(--color-form-border)] form-caption"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Link href="/app/onboarding/a/intro" className="form-btn-primary min-w-[14rem]">
          Begin
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="2" y1="8" x2="13" y2="8" />
            <polyline points="9 4 13 8 9 12" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 form-helper">
      <span
        className="mt-2 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-[color:var(--color-samvaya-red)]"
        aria-hidden="true"
      />
      <span>{children}</span>
    </li>
  );
}
