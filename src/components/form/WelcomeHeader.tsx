'use client';

import { useForm } from './FormProvider';

export function WelcomeHeader() {
  const { state } = useForm();

  // Only show on the first question (Q1/Q2 group)
  if (state.currentQuestionIndex !== 0) return null;

  return (
    <div className="mb-8 rounded-xl bg-rose-50 border border-rose-100 px-5 py-6">
      <h1 className="mb-3 text-xl font-semibold text-gray-900">
        Welcome to Samvaya
      </h1>
      <p className="text-base leading-relaxed text-gray-700">
        Everything you share here is completely confidential. We don&apos;t judge
        — and we never will. We ask detailed questions because the more honestly
        you answer, the better your matches will be. There are no right or wrong
        answers. Take your time.
      </p>
    </div>
  );
}
