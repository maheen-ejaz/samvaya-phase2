'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface DropdownPortalProps {
  /** The input/trigger element to anchor the dropdown to */
  anchorRef: React.RefObject<HTMLElement | null>;
  /** Whether the dropdown is currently visible */
  isOpen: boolean;
  children: ReactNode;
}

/**
 * Renders dropdown content via a React Portal at document.body level,
 * positioned fixed below the anchor element.
 *
 * This escapes all CSS stacking contexts (including ancestors with
 * `transform`, `animation`, `will-change`, etc.) so the dropdown
 * always paints above sibling cards and other content.
 */
export function DropdownPortal({ anchorRef, isOpen, children }: DropdownPortalProps) {
  const [style, setStyle] = useState<React.CSSProperties>({ position: 'fixed', opacity: 0, top: 0 });
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !anchorRef.current) return;

    function updatePosition() {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      // Prefer opening downward. Only flip upward if space below is truly
      // insufficient (< 160px) AND there's significantly more room above.
      // The dropdown itself handles overflow with internal scrolling via max-height.
      const MIN_SPACE_BELOW = 160;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openAbove = spaceBelow < MIN_SPACE_BELOW && spaceAbove > spaceBelow + 80;

      if (openAbove) {
        setStyle({
          position: 'fixed',
          bottom: window.innerHeight - rect.top + 4,
          left: rect.left,
          width: rect.width,
          maxHeight: Math.max(spaceAbove - 16, 120),
          zIndex: 9999,
          opacity: 1,
        });
      } else {
        setStyle({
          position: 'fixed',
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
          maxHeight: Math.max(spaceBelow - 16, 120),
          zIndex: 9999,
          opacity: 1,
        });
      }
    }

    updatePosition();
    // Use capture phase for scroll to catch scrolls on any ancestor
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, anchorRef]);

  if (!isOpen) return null;

  // SSR guard — portals require document.body
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div ref={portalRef} style={{ ...style, display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>,
    document.body,
  );
}
