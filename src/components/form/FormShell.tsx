'use client';

import { FormProvider, useForm } from './FormProvider';
import { ProgressBar } from './ProgressBar';
import { WelcomeHeader } from './WelcomeHeader';
import { ConfidentialityCallout } from './ConfidentialityCallout';
import { QuestionRenderer } from './QuestionRenderer';
import { NavigationButtons } from './NavigationButtons';
import { CompletionScreen } from './CompletionScreen';
import type { FormAnswers } from '@/lib/form/types';

interface FormShellProps {
  userId: string;
  initialAnswers: FormAnswers;
  initialGateAnswers: Record<string, string>;
  initialChatState: Record<string, unknown>;
  resumeQuestionNumber: number;
  isAlreadySubmitted?: boolean;
}

export function FormShell({
  userId,
  initialAnswers,
  initialGateAnswers,
  initialChatState,
  resumeQuestionNumber,
  isAlreadySubmitted,
}: FormShellProps) {
  if (isAlreadySubmitted) {
    return <CompletionScreen />;
  }

  return (
    <FormProvider
      userId={userId}
      initialAnswers={initialAnswers}
      initialGateAnswers={initialGateAnswers}
      initialChatState={initialChatState}
      resumeQuestionNumber={resumeQuestionNumber}
    >
      <FormContent />
    </FormProvider>
  );
}

function FormContent() {
  const { formSubmitted } = useForm();

  if (formSubmitted) {
    return <CompletionScreen />;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <ProgressBar />
      <WelcomeHeader />
      <ConfidentialityCallout />
      <QuestionRenderer />
      <NavigationButtons />
    </div>
  );
}
