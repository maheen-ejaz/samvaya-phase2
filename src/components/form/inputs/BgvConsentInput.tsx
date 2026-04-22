'use client';

import type { QuestionConfig } from '@/lib/form/types';

interface BgvConsentInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
}

export function BgvConsentInput({ value, onChange }: BgvConsentInputProps) {
  const isConsented = value === 'consented';

  return (
    <div className="mx-auto max-w-2xl">
      {/* Title */}
      <div className="form-eyebrow mb-3">Verification</div>
      <h3 className="form-title mb-3" style={{ fontSize: '1.625rem' }}>
        Background verification
      </h3>

      {/* Why paragraph */}
      <p className="form-subtitle mb-8">
        At Samvaya, every member undergoes the same comprehensive verification —
        no exceptions. This is how we ensure every profile is genuine and every
        match is between two verified people.
      </p>

      {/* What we verify */}
      <div className="mb-6 rounded-xl border border-[color:var(--color-form-border)] bg-[color:var(--color-form-surface-muted)] p-5">
        <h4 className="form-eyebrow mb-4">What we verify</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <VerifyItem icon="identity" label="Identity verification" />
          <VerifyItem icon="employment" label="Employment history" />
          <VerifyItem icon="education" label="Education credentials" />
          <VerifyItem icon="financial" label="Financial standing" />
          <VerifyItem icon="address" label="Address verification" />
          <VerifyItem icon="court" label="Court & criminal records" />
          <VerifyItem icon="social" label="Social media check" />
        </div>
      </div>

      {/* Safety notes */}
      <div className="mb-6 space-y-3">
        <p className="form-helper">
          Your verification begins only after you give consent below
          <strong className="text-[color:var(--color-form-text-primary)] font-medium"> and </strong>
          your verification fee (&#x20B9;4,130) is processed.
        </p>
        <p className="form-helper">
          If consent is not provided, your profile will be deleted within 30 working days.
        </p>
        <p className="form-caption">
          All verification results are strictly confidential and never shared with other members or third parties.
        </p>
      </div>

      {/* Consent toggle */}
      <div className="flex items-center gap-4 rounded-xl border border-[color:var(--color-form-border)] bg-white p-5">
        <button
          type="button"
          role="switch"
          aria-checked={isConsented}
          aria-label="Consent to background verification"
          onClick={() => onChange(isConsented ? '' : 'consented')}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--color-samvaya-red)]/20 ${
            isConsented ? 'bg-[color:var(--color-samvaya-red)]' : 'bg-[color:var(--color-form-border-strong)]'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              isConsented ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="form-label leading-snug">
          I consent to a comprehensive background verification
        </span>
      </div>
    </div>
  );
}

type VerifyIconType = 'identity' | 'employment' | 'education' | 'financial' | 'address' | 'court' | 'social';

function VerifyItem({ icon, label }: { icon: VerifyIconType; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-[color:var(--color-form-border)]">
        <VerifyIcon type={icon} />
      </div>
      <span className="form-helper text-[color:var(--color-form-text-primary)]">{label}</span>
    </div>
  );
}

function VerifyIcon({ type }: { type: VerifyIconType }) {
  const cls = "h-4 w-4 text-[color:var(--color-form-text-secondary)]";

  switch (type) {
    case 'identity':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
        </svg>
      );
    case 'employment':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      );
    case 'education':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
        </svg>
      );
    case 'financial':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
        </svg>
      );
    case 'address':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      );
    case 'court':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" />
        </svg>
      );
    case 'social':
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      );
  }
}
