import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hydrateOnboardingForm } from '@/lib/form/hydrate';
import { OnboardingShell } from '@/components/form/shell/OnboardingShell';
import { CompleteScreen } from '@/components/form/screens/CompleteScreen';
import type { SectionId } from '@/lib/form/types';

export default async function CompletePage() {
  const data = await hydrateOnboardingForm();
  if (!data) redirect('/auth/login?next=/app/onboarding/complete');

  const resumeSection = (String(data.resumeSection).toUpperCase() as SectionId) || 'A';

  // Read GooCampus flag — they skip the verification fee block (per CLAUDE.md)
  const supabase = await createClient();
  const { data: userRow } = await supabase
    .from('users')
    .select('is_goocampus_member')
    .eq('id', data.userId)
    .single();
  const isGoocampus = Boolean(userRow?.is_goocampus_member);

  return (
    <OnboardingShell
      userId={data.userId}
      initialAnswers={data.answers}
      initialGateAnswers={data.gateAnswers}
      initialChatState={data.chatState}
      resumeQuestionNumber={data.resumeQuestionNumber}
      resumeSection={resumeSection}
      currentSection="N"
    >
      <CompleteScreen isGoocampus={isGoocampus} />
    </OnboardingShell>
  );
}
