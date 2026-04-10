import { SECTIONS, getSectionIndex } from './sections';
import { getSectionCompletionStatus } from './section-navigation';
import type { FormAnswers, SectionId, SectionConfig } from './types';

/**
 * URL-level routing helpers for the section-by-section onboarding form.
 * Each section gets its own route segment, e.g. /app/onboarding/a, /b, ...
 *
 * `section-navigation.ts` handles in-state navigation (next/prev section ids,
 * visible questions, completion status). This file handles the URL <-> SectionId
 * conversion and the unlock rules used by section page server components.
 */

export type SectionSlug = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n';

const VALID_SLUGS: ReadonlySet<string> = new Set(
  SECTIONS.map((s) => s.id.toLowerCase())
);

/** Convert a URL slug to a SectionId, or return null if invalid. */
export function slugToSectionId(slug: string): SectionId | null {
  const lower = slug.toLowerCase();
  if (!VALID_SLUGS.has(lower)) return null;
  return lower.toUpperCase() as SectionId;
}

/** Convert a SectionId to its URL slug. */
export function sectionIdToSlug(id: SectionId): SectionSlug {
  return id.toLowerCase() as SectionSlug;
}

/** Get the URL path for a section's main page. */
export function sectionPath(id: SectionId): string {
  return `/app/onboarding/${sectionIdToSlug(id)}`;
}

/** Get the URL path for a section's intro/decompression screen. */
export function sectionIntroPath(id: SectionId): string {
  return `/app/onboarding/${sectionIdToSlug(id)}/intro`;
}

/**
 * Decide whether a section is reachable for this user.
 *
 * Linear-with-jumpback rule:
 * - The first section is always unlocked.
 * - A section is unlocked if every prior section is `complete`.
 * - The user's current resume section is unlocked even if previous sections
 *   were partial (so a partial save doesn't strand them).
 */
export function isSectionUnlocked(
  id: SectionId,
  answers: FormAnswers,
  resumeSection: SectionId
): boolean {
  const targetIdx = getSectionIndex(id);
  if (targetIdx < 0) return false;
  if (targetIdx === 0) return true;

  const resumeIdx = getSectionIndex(resumeSection);
  if (targetIdx <= resumeIdx) return true;

  for (let i = 0; i < targetIdx; i++) {
    const prior = SECTIONS[i];
    const status = getSectionCompletionStatus(prior.id, answers);
    if (status !== 'complete') return false;
  }
  return true;
}

/**
 * Resolve where the user should land when they hit /app/onboarding with no section.
 * Returns the section ID of their resume position, or 'A' if they haven't started.
 */
export function getResumeSection(
  answers: FormAnswers,
  resumeSection: SectionId | string | null | undefined
): SectionId {
  if (!resumeSection) return 'A';
  const upper = String(resumeSection).toUpperCase();
  const found = SECTIONS.find((s) => s.id === upper);
  if (found) return found.id;
  return 'A';
}

/** Get section metadata for the header / intro screen. */
export function getSectionMeta(id: SectionId): SectionConfig | null {
  return SECTIONS.find((s) => s.id === id) ?? null;
}

/** "Section X of N" — 1-indexed position out of total sections. */
export function getSectionPosition(id: SectionId): { position: number; total: number } {
  const idx = getSectionIndex(id);
  return {
    position: idx + 1,
    total: SECTIONS.length,
  };
}

/**
 * Build a list of all sections with their unlock + completion state.
 * Used by `JumpMenuSheet` to render the section list.
 */
export interface SectionListItem {
  id: SectionId;
  slug: SectionSlug;
  label: string;
  description?: string;
  status: 'complete' | 'partial' | 'empty';
  unlocked: boolean;
  isCurrent: boolean;
}

export function buildSectionList(
  answers: FormAnswers,
  resumeSection: SectionId,
  currentSection: SectionId
): SectionListItem[] {
  return SECTIONS.map((s) => ({
    id: s.id,
    slug: sectionIdToSlug(s.id),
    label: s.label,
    description: s.description,
    status: getSectionCompletionStatus(s.id, answers),
    unlocked: isSectionUnlocked(s.id, answers, resumeSection),
    isCurrent: s.id === currentSection,
  }));
}
