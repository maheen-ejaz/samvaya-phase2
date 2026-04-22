import type { ReactNode } from 'react';
import { spanClassNames } from './bento-spans';
import type { BentoSpan } from '@/lib/form/types';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  children: ReactNode;
}

export function BentoGrid({ children }: BentoGridProps) {
  return <div className="bento-grid">{children}</div>;
}

interface BentoTileProps {
  span: BentoSpan;
  children: ReactNode;
  id?: string;
  animationIndex?: number;
}

export function BentoTile({ span, children, id, animationIndex }: BentoTileProps) {
  const delay = animationIndex !== undefined
    ? Math.min(animationIndex * 50, 250)
    : undefined;

  return (
    <div
      id={id}
      className={cn(
        spanClassNames(span),
        'form-question-card animate-fade-in-up',
      )}
      style={delay !== undefined ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
