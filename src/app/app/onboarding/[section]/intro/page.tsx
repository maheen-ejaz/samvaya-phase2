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

  if (!isSectionUnlocked(sectionId, data.answers, resumeSection)) {
    redirect(sectionPath(resumeSection));
  }

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
