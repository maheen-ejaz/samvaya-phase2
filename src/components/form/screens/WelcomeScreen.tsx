'use client';

import Link from 'next/link';

interface WelcomeScreenProps {
  firstName?: string | null;
}

/**
 * First-visit intro for the onboarding form. Replaces the old inline
 * WelcomeHeader. Calm, white, centered, ends with a single CTA into
 * Section A.
 */
export function WelcomeScreen({ firstName }: WelcomeScreenProps) {
  return (
    <div className="max-w-xl mx-auto py-12 lg:py-20">
      <div className="form-eyebrow mb-4 text-center">Welcome</div>
      <h1 className="form-title text-center mb-4">
        {firstName ? `Hi ${firstName}, let's begin` : "Let's build your profile"}
      </h1>
      <p className="form-subtitle text-center mb-10">
        About 100 questions, 14 sections. Takes around 45–60 minutes.
        Everything is saved automatically — you can pause and resume anytime.
      </p>

      <div className="rounded-xl border border-[color:var(--color-form-border)] bg-[color:var(--color-form-surface-muted)] px-5 py-5 mb-10">
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
