import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hydrateOnboardingForm } from '@/lib/form/hydrate';
import { OnboardingShell } from '@/components/form/shell/OnboardingShell';
import { WelcomeScreen } from '@/components/form/screens/WelcomeScreen';
import type { SectionId } from '@/lib/form/types';

export default async function WelcomePage() {
  const data = await hydrateOnboardingForm();
  if (!data) redirect('/auth/login?next=/app/onboarding/welcome');

  const resumeSection = (String(data.resumeSection).toUpperCase() as SectionId) || 'A';

  // Pull first name (if any) for the greeting — Q1 is stored in profiles.first_name
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('user_id', data.userId)
    .maybeSingle();
  const firstName = (profile?.first_name as string | null) ?? null;

  return (
    <OnboardingShell
      userId={data.userId}
      initialAnswers={data.answers}
      initialGateAnswers={data.gateAnswers}
      initialChatState={data.chatState}
      resumeQuestionNumber={data.resumeQuestionNumber}
      resumeSection={resumeSection}
      currentSection="A"
    >
      <WelcomeScreen firstName={firstName} />
    </OnboardingShell>
  );
}
