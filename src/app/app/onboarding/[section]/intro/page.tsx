import { redirect, notFound } from 'next/navigation';
import { hydrateOnboardingForm } from '@/lib/form/hydrate';
import {
  slugToSectionId,
  isSectionUnlocked,
  sectionPath,
  getSectionMeta,
} from '@/lib/form/section-routing';
import { OnboardingShell } from '@/components/form/shell/OnboardingShell';
import { SectionIntro } from '@/components/form/screens/SectionIntro';
import type { SectionId } from '@/lib/form/types';

export default async function SectionIntroPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: slug } = await params;
  const sectionId = slugToSectionId(slug);
  if (!sectionId) notFound();

  const data = await hydrateOnboardingForm();
  if (!data) redirect(`/auth/login?next=/app/onboarding/${slug}/intro`);

  const resumeSection = (String(data.resumeSection).toUpperCase() as SectionId) || 'A';

  // Section N has no list view — redirect directly to the first incomplete chat.
  // This also sidesteps the isSectionUnlocked race (see comment on section page).
  if (sectionId === 'N') {
    const CHAT_ORDER = ['Q38', 'Q75', 'Q100'] as const;
    const CHAT_PATHS: Record<string, string> = {
      Q38: '/app/onboarding/chat/q38',
      Q75: '/app/onboarding/chat/q75',
      Q100: '/app/onboarding/chat/q100',
    };
    const firstIncomplete = CHAT_ORDER.find((id) => data.answers[id] !== 'complete');
    redirect(firstIncomplete ? CHAT_PATHS[firstIncomplete] : '/app/onboarding/complete');
  }

  // The intro page is a transitional screen, not a security gate — isSectionUnlocked
  // is intentionally omitted here. The section page (/app/onboarding/[section]) is
  // the real gate. Checking here causes false bounces: the DB write from handleContinue
  // is confirmed before navigation, but a connection-pool race can return a stale
  // onboarding_section on this immediate server render, making the fast-path fail
  // and the slow-path fail for sections with file-upload questions (e.g. M → N).

  if (!getSectionMeta(sectionId)) notFound();

  return (
    <OnboardingShell
      userId={data.userId}
      initialAnswers={data.answers}
      initialGateAnswers={data.gateAnswers}
      initialChatState={data.chatState}
      resumeQuestionNumber={data.resumeQuestionNumber}
      resumeSection={resumeSection}
      currentSection={sectionId}
    >
      <SectionIntro sectionId={sectionId} />
    </OnboardingShell>
  );
}
