import { redirect } from 'next/navigation';
import { hydrateOnboardingForm } from '@/lib/form/hydrate';
import { getResumeSection, sectionPath } from '@/lib/form/section-routing';
import type { SectionId } from '@/lib/form/types';

/**
 * Resume redirect — bounces the user to their saved section.
 *
 * - Unauthenticated → login
 * - Already submitted → /app/onboarding/complete
 * - Brand-new user (resume = A, no answers) → /app/onboarding/welcome
 * - Returning user → /app/onboarding/{resumeSection}
 */
export default async function OnboardingResumePage() {
  const data = await hydrateOnboardingForm();
  if (!data) redirect('/auth/login?next=/app/onboarding');

  if (data.isAlreadySubmitted) {
    redirect('/app/onboarding/complete');
  }

  const resumeSection = getResumeSection(data.answers, data.resumeSection as SectionId);
  const isBrandNew = resumeSection === 'A' && Object.keys(data.answers).length <= 2;
  if (isBrandNew) {
    redirect('/app/onboarding/welcome');
  }

  redirect(sectionPath(resumeSection));
}
