'use client';

import type { ReactNode } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';

interface StickyCTAProps {
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: ReactNode;
  backLabel?: ReactNode;
  continueDisabled?: boolean;
  backDisabled?: boolean;
  asSubmit?: boolean;
  breadcrumb?: string;
}

/**
 * Mobile: Back link centered above a full-width primary CTA.
 * Desktop: Back link on the left, primary CTA on the right, separated by a hairline.
 * Matches the claude.ai/design handoff (Apr 2026).
 */
export function StickyCTA({
  onBack,
  onContinue,
  continueLabel = 'Save & continue',
  backLabel = 'Back',
  continueDisabled,
  backDisabled,
  asSubmit,
  breadcrumb,
}: StickyCTAProps) {
  return (
    <div className="form-sticky-cta">
      {breadcrumb && (
        <div className="text-xs text-[color:var(--color-form-text-muted)] lg:hidden">
          {breadcrumb}
        </div>
      )}

      {/* Back — centered above on mobile, left-aligned on desktop */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          disabled={backDisabled}
          className="form-btn-secondary lg:order-first"
        >
          <ArrowLeftIcon className="size-3.5" aria-hidden="true" />
          {backLabel}
        </button>
      )}

      {/* Primary — full-width on mobile, auto on desktop */}
      <button
        type={asSubmit ? 'submit' : 'button'}
        onClick={onContinue}
        disabled={continueDisabled}
        className="form-btn-primary w-full lg:w-auto lg:min-w-[12rem]"
      >
        {continueLabel}
        <ArrowRightIcon className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
