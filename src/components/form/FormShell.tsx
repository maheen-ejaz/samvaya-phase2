'use client';

import { FormProvider } from './FormProvider';
import { ProgressBar } from './ProgressBar';
import { WelcomeHeader } from './WelcomeHeader';
import { ConfidentialityCallout } from './ConfidentialityCallout';
import { QuestionRenderer } from './QuestionRenderer';
import { NavigationButtons } from './NavigationButtons';
import type { FormAnswers } from '@/lib/form/types';

interface FormShellProps {
  userId: string;
  initialAnswers: FormAnswers;
  initialGateAnswers: Record<string, string>;
  resumeQuestionNumber: number;
}

export function FormShell({
  userId,
  initialAnswers,
  initialGateAnswers,
  resumeQuestionNumber,
}: FormShellProps) {
  return (
    <FormProvider
      userId={userId}
      initialAnswers={initialAnswers}
      initialGateAnswers={initialGateAnswers}
      resumeQuestionNumber={resumeQuestionNumber}
    >
      <div className="mx-auto max-w-lg px-4 py-6">
        <ProgressBar />
        <WelcomeHeader />
        <ConfidentialityCallout />
        <QuestionRenderer />
        <NavigationButtons />
      </div>
    </FormProvider>
  );
}
