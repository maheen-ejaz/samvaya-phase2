'use client';

import { useState } from 'react';
import { FormProvider, useForm } from './FormProvider';
import { SectionSidebar, MobileDrawer } from './SectionSidebar';
import { MobileSectionBar } from './MobileSectionBar';
import { SectionPanel } from './SectionPanel';
import { SectionNavigationButtons } from './SectionNavigationButtons';
import { CompletionScreen } from './CompletionScreen';
import type { FormAnswers } from '@/lib/form/types';

interface FormShellProps {
  userId: string;
  initialAnswers: FormAnswers;
  initialGateAnswers: Record<string, string>;
  initialChatState: Record<string, unknown>;
  resumeQuestionNumber: number;
  isAlreadySubmitted?: boolean;
  isEditMode?: boolean;
}

export function FormShell({
  userId,
  initialAnswers,
  initialGateAnswers,
  initialChatState,
  resumeQuestionNumber,
  isAlreadySubmitted,
  isEditMode,
}: FormShellProps) {
  // Already submitted and NOT in edit mode — show completion screen
  if (isAlreadySubmitted && !isEditMode) {
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
      <FormContent isEditMode={isEditMode} />
    </FormProvider>
  );
}

function FormContent({ isEditMode }: { isEditMode?: boolean }) {
  const { formSubmitted } = useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());

  if (formSubmitted) {
    return <CompletionScreen />;
  }

  return (
    <div className="bg-samvaya-gradient flex min-h-screen items-start justify-center lg:p-8">
      {/* Contained panel — sidebar + content together */}
      <div className="relative flex w-full min-h-screen lg:min-h-0 lg:h-[calc(100vh-4rem)] lg:max-w-[88%] lg:rounded-3xl lg:overflow-hidden lg:shadow-2xl">
        {/* Desktop sidebar — sits on the gradient, glass effect shows red through */}
        <SectionSidebar />

        {/* Mobile drawer */}
        <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

        {/* Mobile top bar */}
        <MobileSectionBar onMenuOpen={() => setDrawerOpen(true)} />

        {/* Main content — white background for clean form */}
        <main className="flex-1 bg-white lg:overflow-y-auto">
          <div className="mx-auto max-w-2xl px-4 py-6 pt-16 lg:px-10 lg:py-12 lg:pt-12">
            {isEditMode && (
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                You are editing your submitted application. Changes are saved automatically.
              </div>
            )}
            <SectionPanel validationErrors={validationErrors} />
            <SectionNavigationButtons onValidationErrors={setValidationErrors} />
          </div>
        </main>
      </div>
    </div>
  );
}
