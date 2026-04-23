'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '../FormProvider';
import { ChatInterface } from '../inputs/ChatInterface';
import { getQuestion } from '@/lib/form/questions';
import { sectionPath } from '@/lib/form/section-routing';
import type { ChatState } from '@/lib/claude/types';

interface ChatScreenProps {
  /** Q38 | Q75 | Q100 — the chat question id (uppercase) */
  questionId: 'Q38' | 'Q75' | 'Q100';
}

const NEXT_AFTER_CHAT: Record<string, string> = {
  Q38: '/app/onboarding/chat/q75',
  Q75: '/app/onboarding/chat/q100',
  Q100: '/app/onboarding/complete',
};

/**
 * Full-screen Claude conversation. Wraps ChatInterface in a focused
 * layout: section eyebrow + title at the top, the conversation taking
 * the remaining space, no other questions visible.
 *
 * On completion, navigates to the next chat or to the completion page.
 */
export function ChatScreen({ questionId }: ChatScreenProps) {
  const router = useRouter();
  const { state, chatState, setAnswer, navigateToSection, submitForm } = useForm();

  const question = getQuestion(questionId);
  const savedChatState = chatState[questionId] as ChatState | undefined;
  const isLastChat = questionId === 'Q100';
  const [isChatBusy, setIsChatBusy] = useState(false);

  // Sync currentSection to N when this chat mounts
  useEffect(() => {
    if (state.currentSectionId !== 'N') {
      navigateToSection('N');
    }
  }, [state.currentSectionId, navigateToSection]);

  if (!question) return null;

  const handleComplete = async () => {
    setAnswer(questionId, 'complete');
    if (isLastChat) {
      const ok = await submitForm();
      if (ok) router.push('/app/onboarding/complete');
      return;
    }
    const next = NEXT_AFTER_CHAT[questionId];
    if (next) router.push(next);
  };

  const handleBack = () => {
    // Block back-nav while a message is in flight / extraction is running /
    // submission is pending — prevents half-written server state and
    // mid-chat "complete" miscounts.
    if (isChatBusy) return;
    if (questionId === 'Q38') {
      router.push(sectionPath('M'));
      return;
    }
    if (questionId === 'Q75') {
      router.push('/app/onboarding/chat/q38');
      return;
    }
    router.push('/app/onboarding/chat/q75');
  };

  const chatNumber = questionId === 'Q38' ? 1 : questionId === 'Q75' ? 2 : 3;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="form-eyebrow mb-3">
          Conversation {chatNumber} of 3
        </div>
        <h1 className="form-title" style={{ fontSize: '1.875rem' }}>
          {chatTitleForId(questionId)}
        </h1>
      </div>

      <ChatInterface
        question={question}
        initialChatState={savedChatState || null}
        onComplete={handleComplete}
        completeButtonLabel={isLastChat ? 'Submit your application' : 'Continue to next conversation'}
        onBusyChange={setIsChatBusy}
      />

      <div className="mt-6 flex justify-start">
        <button
          type="button"
          onClick={handleBack}
          disabled={isChatBusy}
          aria-disabled={isChatBusy}
          title={isChatBusy ? 'Please wait — message in progress' : undefined}
          className="form-btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Back
        </button>
      </div>
    </div>
  );
}

function chatTitleForId(id: 'Q38' | 'Q75' | 'Q100'): string {
  if (id === 'Q38') return 'Family background';
  if (id === 'Q75') return 'Goals & values';
  return 'A closing thought';
}
