import { redirect, notFound } from 'next/navigation';
import { hydrateOnboardingForm } from '@/lib/form/hydrate';
import {
  slugToSectionId,
  isSectionUnlocked,
  sectionPath,
  getSectionMeta,
} from '@/lib/form/section-routing';
import { OnboardingShell } from '@/components/form/shell/OnboardingShell';
import { SectionScreen } from '@/components/form/screens/SectionScreen';
import type { SectionId } from '@/lib/form/types';

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: slug } = await params;
  const sectionId = slugToSectionId(slug);
  if (!sectionId) notFound();

  const data = await hydrateOnboardingForm();
  if (!data) redirect(`/auth/login?next=/app/onboarding/${slug}`);

  const resumeSection = (String(data.resumeSection).toUpperCase() as SectionId) || 'A';

  // Linear gate: bounce locked sections back to the user's resume position
  if (!isSectionUnlocked(sectionId, data.answers, resumeSection)) {
    redirect(sectionPath(resumeSection));
  }

  const meta = getSectionMeta(sectionId);
  if (!meta) notFound();

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
      <SectionScreen sectionId={sectionId} />
    </OnboardingShell>
  );
}
