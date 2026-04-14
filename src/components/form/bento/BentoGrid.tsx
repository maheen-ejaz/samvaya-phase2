import type { ReactNode } from 'react';
import { spanClassNames } from './bento-spans';
import type { BentoSpan } from '@/lib/form/types';

interface BentoGridProps {
  children: ReactNode;
}

/**
 * 3-column dense bento grid on desktop, single column on mobile.
 * Apply `<BentoTile>` to children to control their span.
 */
export function BentoGrid({ children }: BentoGridProps) {
  return <div className="bento-grid">{children}</div>;
}

interface BentoTileProps {
  span: BentoSpan;
  children: ReactNode;
  id?: string;
  /** Zero-based index used to stagger the entrance animation. Capped at 5 tiles (250ms max). */
  animationIndex?: number;
}

/** A single tile in the bento grid. Use `span` to control desktop placement. */
export function BentoTile({ span, children, id, animationIndex }: BentoTileProps) {
  const delay = animationIndex !== undefined
    ? Math.min(animationIndex * 50, 250)
    : undefined;

  return (
    <div
      id={id}
      className={`${spanClassNames(span)} form-question-card animate-fade-in-up`}
      style={delay !== undefined ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
