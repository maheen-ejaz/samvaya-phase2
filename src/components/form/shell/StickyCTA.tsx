'use client';

import type { ReactNode } from 'react';

interface StickyCTAProps {
  onBack?: () => void;
  onContinue?: () => void;
  /** Override the right button label, defaults to "Continue" */
  continueLabel?: ReactNode;
  backLabel?: ReactNode;
  continueDisabled?: boolean;
  backDisabled?: boolean;
  /** Submit-style: red button is `type="submit"` instead of `button` */
  asSubmit?: boolean;
  /** Optional breadcrumb shown above the buttons on mobile (e.g. "Section B · Location & Citizenship") */
  breadcrumb?: string;
}

/**
 * Bottom action bar for section screens.
 * Mobile: pinned to viewport bottom via .form-sticky-cta (CSS handles
 * position: sticky + safe-area-inset). Desktop: collapses to inline,
 * right-aligned, sitting at the end of the section content.
 */
export function StickyCTA({
  onBack,
  onContinue,
  continueLabel = 'Continue',
  backLabel = 'Back',
  continueDisabled,
  backDisabled,
  asSubmit,
  breadcrumb,
}: StickyCTAProps) {
  return (
    <div className="form-sticky-cta">
      {breadcrumb && (
        <div className="w-full lg:hidden form-caption text-[color:var(--color-form-text-tertiary)] mb-2 text-center">
          {breadcrumb}
        </div>
      )}
      <div className="flex w-full gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            disabled={backDisabled}
            className="form-btn-secondary flex-1 lg:flex-none"
          >
            {backLabel}
          </button>
        ) : (
          <span className="flex-1 lg:hidden" aria-hidden="true" />
        )}
        <button
          type={asSubmit ? 'submit' : 'button'}
          onClick={onContinue}
          disabled={continueDisabled}
          className="form-btn-primary flex-1 lg:flex-none lg:min-w-[10rem]"
        >
          {continueLabel}
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="2" y1="8" x2="13" y2="8" />
            <polyline points="9 4 13 8 9 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
