'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from '../FormProvider';
import { QuestionField } from '../QuestionField';
import { BgvConsentInput } from '../inputs/BgvConsentInput';
import { BentoGrid, BentoTile } from '../bento/BentoGrid';
import { getBentoSpan } from '../bento/bento-spans';
import { SectionHeader } from '../shell/SectionHeader';
import { StickyCTA } from '../shell/StickyCTA';
import { getQuestion } from '@/lib/form/questions';
import { getVisibleQuestionsForSection, isQuestionAnswered } from '@/lib/form/section-navigation';
import { getSectionMeta, getSectionPosition, sectionPath } from '@/lib/form/section-routing';
import { SECTIONS, getSectionIndex } from '@/lib/form/sections';
import type { SectionId } from '@/lib/form/types';

interface SectionScreenProps {
  sectionId: SectionId;
}

const CHAT_PATH: Record<string, string> = {
  Q38: '/app/onboarding/chat/q38',
  Q75: '/app/onboarding/chat/q75',
  Q100: '/app/onboarding/chat/q100',
};

export function SectionScreen({ sectionId }: SectionScreenProps) {
  const router = useRouter();
  const { state, setAnswer, navigateToSection, submitForm } = useForm();
  const [errors, setErrors] = useState<Set<string>>(new Set());

  // Sync form state's currentSectionId with the URL on mount and when route changes.
  useEffect(() => {
    if (state.currentSectionId !== sectionId) {
      navigateToSection(sectionId);
    }
  }, [sectionId, state.currentSectionId, navigateToSection]);

  const meta = getSectionMeta(sectionId);
  const { position, total } = getSectionPosition(sectionId);
  const positionLabel = String(position).padStart(2, '0');
  const totalLabel = String(total);
  const sectionIndex = getSectionIndex(sectionId);
  const isLastSection = sectionIndex === SECTIONS.length - 1;

  const visibleIds = useMemo(
    () => getVisibleQuestionsForSection(sectionId, state.answers),
    [sectionId, state.answers]
  );

  const answeredCount = visibleIds.filter((id) => isQuestionAnswered(id, state.answers)).length;
  const progress = visibleIds.length > 0 ? answeredCount / visibleIds.length : 0;

  if (!meta) return null;

  function handleContinue() {
    // Validate every visible question; collect first invalid for focus
    const invalid = new Set<string>();
    let firstInvalid: string | null = null;
    for (const id of visibleIds) {
      if (!isQuestionAnswered(id, state.answers)) {
        invalid.add(id);
        if (!firstInvalid) firstInvalid = id;
      }
    }

    if (invalid.size > 0) {
      setErrors(invalid);
      if (firstInvalid) {
        const el = document.getElementById(`q-${firstInvalid}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const focusable = el?.querySelector<HTMLElement>('input, select, textarea, button');
        focusable?.focus();
      }
      return;
    }

    setErrors(new Set());

    if (isLastSection) {
      void submitForm().then((ok) => {
        if (ok) router.push('/app/onboarding/complete');
      });
      return;
    }

    const nextIdx = sectionIndex + 1;
    const next = SECTIONS[nextIdx];
    if (next) router.push(`${sectionPath(next.id)}/intro`);
  }

  function handleBack() {
    if (sectionIndex === 0) {
      router.push('/app/onboarding/welcome');
      return;
    }
    const prev = SECTIONS[sectionIndex - 1];
    if (prev) router.push(sectionPath(prev.id));
  }

  return (
    <>
      <SectionHeader
        positionLabel={positionLabel}
        totalLabel={totalLabel}
        title={meta.label}
        subtitle={meta.description}
        progress={progress}
      />

      <BentoGrid>
        {visibleIds.map((id) => {
          const question = getQuestion(id);
          if (!question) return null;
          const span = getBentoSpan(question);

          // Chats render as link tiles in Phase 3; Phase 5 wires the full-screen ChatScreen.
          if (question.type === 'claude_chat') {
            const href = CHAT_PATH[question.id];
            const done = state.answers[question.id] === 'complete';
            return (
              <BentoTile key={id} span={span} id={`q-${id}`}>
                <ChatLinkTile href={href} text={question.text} done={done} />
              </BentoTile>
            );
          }

          // BGV consent gets its own rich layout — bypass QuestionField wrapper
          if (question.type === 'bgv_consent') {
            return (
              <BentoTile key={id} span={span} id={`q-${id}`}>
                <BgvConsentInput
                  question={question}
                  value={(state.answers[id] as string) || ''}
                  onChange={(value) => setAnswer(id, value)}
                />
              </BentoTile>
            );
          }

          return (
            <BentoTile key={id} span={span} id={`q-${id}`}>
              <QuestionField
                question={question}
                value={state.answers[id]}
                onChange={(value) => {
                  setAnswer(id, value);
                  if (errors.has(id)) {
                    const next = new Set(errors);
                    next.delete(id);
                    setErrors(next);
                  }
                }}
                hasError={errors.has(id)}
              />
            </BentoTile>
          );
        })}
      </BentoGrid>

      <StickyCTA
        onBack={handleBack}
        onContinue={handleContinue}
        continueLabel={isLastSection ? 'Submit application' : 'Continue'}
      />
    </>
  );
}

function ChatLinkTile({ href, text, done }: { href: string; text: string; done: boolean }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-xl border border-[color:var(--color-form-border)] bg-[color:var(--color-form-surface-muted)] px-5 py-5 hover:border-[color:var(--color-form-border-strong)] transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="form-eyebrow mb-1.5">Conversation</div>
        <p className="form-label">{text}</p>
      </div>
      <span
        className={`form-caption flex items-center gap-1.5 ${
          done ? 'text-[color:var(--color-form-success)]' : ''
        }`}
      >
        {done ? 'Complete' : 'Open'}
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="2" y1="8" x2="13" y2="8" />
          <polyline points="9 4 13 8 9 12" />
        </svg>
      </span>
    </Link>
  );
}
