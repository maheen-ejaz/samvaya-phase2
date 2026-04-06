/**
 * Scroll the form's <main> container to bring an element into view.
 *
 * scrollIntoView() is NOT safe in this layout because the outer panel has
 * overflow:hidden — scrollIntoView traverses all ancestors and will also
 * scroll that hidden container, pushing content off-screen with no way for
 * the user to recover (overflow:hidden blocks user scrolling).
 *
 * This helper targets only the <main> scroll container explicitly.
 */
export function scrollMainToElement(elementId: string, offset = 24) {
  const mainEl = document.querySelector('main');
  const targetEl = document.getElementById(elementId);
  if (!mainEl || !targetEl) return;
  const mainRect = mainEl.getBoundingClientRect();
  const elRect = targetEl.getBoundingClientRect();
  const scrollTarget = mainEl.scrollTop + (elRect.top - mainRect.top) - offset;
  mainEl.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' });
}
