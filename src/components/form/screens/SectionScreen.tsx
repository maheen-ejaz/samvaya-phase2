'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from '../FormProvider';
import { QuestionField } from '../QuestionField';
import { BgvConsentInput } from '../inputs/BgvConsentInput';
import { BentoGrid, BentoTile } from '../bento/BentoGrid';
import { getBentoSpan } from '../bento/bento-spans';
import { SectionHeader } from '../shell/SectionHeader';
import { StickyCTA } from '../shell/StickyCTA';
import { setSectionCompleteToast } from './SectionCompleteToast';
import { getQuestion } from '@/lib/form/questions';
import { getVisibleQuestionsForSection, isQuestionAnswered } from '@/lib/form/section-navigation';
import { getSectionMeta, getSectionPosition, sectionPath } from '@/lib/form/section-routing';
import { SECTIONS, getSectionIndex } from '@/lib/form/sections';
import type { SectionId } from '@/lib/form/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowRightIcon, CheckIcon, XIcon } from 'lucide-react';

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
  const { state, setAnswer, navigateToSection, submitForm, flushNow } = useForm();
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [isExiting, setIsExiting] = useState(false);

  // Resume banner
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [bannerLeaving, setBannerLeaving] = useState(false);
  const resumeBannerShown = useRef(false);
  useEffect(() => {
    if (resumeBannerShown.current) return;
    const key = 'samvaya_resume_banner_shown';
    const alreadyShown = sessionStorage.getItem(key);
    const isReturningUser = sectionId !== 'A' || Object.keys(state.answers).length > 5;
    if (!alreadyShown && isReturningUser) {
      sessionStorage.setItem(key, '1');
      resumeBannerShown.current = true;
      setShowResumeBanner(true);
      const t = setTimeout(() => {
        setBannerLeaving(true);
        setTimeout(() => setShowResumeBanner(false), 150);
      }, 4000);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function dismissResumeBanner() {
    setBannerLeaving(true);
    setTimeout(() => setShowResumeBanner(false), 150);
  }

  async function handleContinue() {
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
        if (el) {
          const header = document.querySelector('.form-header-sticky, header.sticky') as HTMLElement | null;
          const headerHeight = header ? header.getBoundingClientRect().height : 0;
          const elTop = el.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: elTop - headerHeight - 24, behavior: 'smooth' });
          el.classList.add('animate-shake');
          el.addEventListener('animationend', () => el.classList.remove('animate-shake'), { once: true });
          setTimeout(() => {
            const focusable = el.querySelector<HTMLElement>('input, select, textarea, button');
            focusable?.focus();
          }, 350);
        }
      }
      return;
    }

    setErrors(new Set());
    setIsExiting(true);

    // Flush all pending auto-saves before navigating so the server-side lock check
    // sees the current answers and doesn't redirect to a stale/invalid section URL.
    try {
      await flushNow();
    } catch (err) {
      console.warn('[onboarding] continue flush failed (continuing anyway):', err);
    }

    if (isLastSection) {
      const ok = await submitForm();
      if (ok) router.push('/app/onboarding/complete');
      return;
    }
    if (meta) setSectionCompleteToast({ label: meta.label, position, total });
    const nextIdx = sectionIndex + 1;
    const next = SECTIONS[nextIdx];
    if (next) router.push(`${sectionPath(next.id)}/intro`);
  }

  async function handleBack() {
    setIsExiting(true);
    // Drain pending auto-saves before navigating so the previous section
    // hydrates with the user's most recent answers (not stale DB rows).
    // Save failures must not block backward navigation — the user can retry
    // editing on the previous section if something didn't persist.
    try {
      await flushNow();
    } catch (err) {
      console.warn('[onboarding] back-navigation flush failed (continuing anyway):', err);
    }
    if (sectionIndex === 0) {
      router.push('/app/onboarding/welcome');
      return;
    }
    const prev = SECTIONS[sectionIndex - 1];
    if (prev) router.push(sectionPath(prev.id));
  }

  return (
    <div className={isExiting ? 'form-section-exit' : 'form-section-enter'}>
      {showResumeBanner && (
        <div
          className={cn(
            'mb-6 flex items-center justify-between gap-3 rounded-xl border bg-muted/50 px-4 py-3',
            bannerLeaving && 'animate-slide-out-left',
          )}
          role="status"
        >
          <span className="text-sm text-muted-foreground">
            Welcome back — you left off here. Your answers are saved.
          </span>
          <button
            type="button"
            onClick={dismissResumeBanner}
            aria-label="Dismiss"
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      )}

      <SectionHeader
        positionLabel={positionLabel}
        totalLabel={totalLabel}
        title={meta.label}
        subtitle={meta.description}
        progress={progress}
        meta={[
          `${visibleIds.length} ${visibleIds.length === 1 ? 'question' : 'questions'}`,
          ...(meta.estimatedMinutes ? [`~${meta.estimatedMinutes} minutes`] : []),
          'Auto-saves as you type',
        ]}
      />

      <BentoGrid>
        {visibleIds.map((id, index) => {
          const question = getQuestion(id);
          if (!question) return null;
          const span = getBentoSpan(question);

          if (question.type === 'claude_chat') {
            const href = CHAT_PATH[question.id];
            const done = state.answers[question.id] === 'complete';
            return (
              <BentoTile key={id} span={span} id={`q-${id}`} animationIndex={index}>
                <ChatLinkTile href={href} text={question.text} done={done} />
              </BentoTile>
            );
          }

          if (question.type === 'bgv_consent') {
            return (
              <BentoTile key={id} span={span} id={`q-${id}`} animationIndex={index}>
                <BgvConsentInput
                  question={question}
                  value={(state.answers[id] as string) || ''}
                  onChange={(value) => setAnswer(id, value)}
                />
              </BentoTile>
            );
          }

          return (
            <BentoTile key={id} span={span} id={`q-${id}`} animationIndex={index}>
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
        breadcrumb={`Section ${positionLabel} · ${meta.label}`}
      />
    </div>
  );
}

function ChatLinkTile({ href, text, done }: { href: string; text: string; done: boolean }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-xl border bg-muted/50 px-5 py-5 hover:border-border/80 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="mb-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Conversation
        </div>
        <p className="text-sm font-medium text-foreground">{text}</p>
      </div>
      <span
        className={cn(
          'flex items-center gap-1.5 text-xs shrink-0',
          done ? 'text-emerald-600' : 'text-muted-foreground',
        )}
      >
        {done ? (
          <>
            <CheckIcon className="size-3.5" />
            Complete
          </>
        ) : (
          <>
            Open
            <ArrowRightIcon className="size-3.5" />
          </>
        )}
      </span>
    </Link>
  );
}
