import { redirect, notFound } from 'next/navigation';
import { hydrateOnboardingForm } from '@/lib/form/hydrate';
import { OnboardingShell } from '@/components/form/shell/OnboardingShell';
import { ChatScreen } from '@/components/form/screens/ChatScreen';
import type { SectionId } from '@/lib/form/types';

const VALID_CHAT_IDS = new Set(['q38', 'q75', 'q100']);

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  const lowerId = chatId.toLowerCase();
  if (!VALID_CHAT_IDS.has(lowerId)) notFound();

  const data = await hydrateOnboardingForm();
  if (!data) redirect(`/auth/login?next=/app/onboarding/chat/${chatId}`);

  const resumeSection = (String(data.resumeSection).toUpperCase() as SectionId) || 'A';
  const questionId = lowerId.toUpperCase() as 'Q38' | 'Q75' | 'Q100';

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
      <ChatScreen questionId={questionId} />
    </OnboardingShell>
  );
}
