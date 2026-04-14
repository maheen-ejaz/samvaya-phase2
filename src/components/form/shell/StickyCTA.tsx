'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';

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
        <div className="w-full text-center text-xs text-muted-foreground mb-2 lg:hidden">
          {breadcrumb}
        </div>
      )}
      <div className="flex w-full gap-3">
        {onBack ? (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={backDisabled}
            className="flex-1 rounded-xl lg:flex-none"
          >
            {backLabel}
          </Button>
        ) : (
          <span className="flex-1 lg:hidden" aria-hidden="true" />
        )}
        <Button
          type={asSubmit ? 'submit' : 'button'}
          onClick={onContinue}
          disabled={continueDisabled}
          className="flex-1 gap-1.5 rounded-xl lg:flex-none lg:min-w-[10rem]"
        >
          {continueLabel}
          <ArrowRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
