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
  const [savePhase, setSavePhase] = useState<'idle' | 'saving' | 'saved'>('idle');

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

  // Auto-scroll to newly-visible conditional questions (e.g. Q14 appearing after Q12 answered).
  // Skip initial mount; only react to diffs where a new id appears in the visible list.
  const prevVisibleRef = useRef<Set<string>>(new Set(visibleIds));
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      prevVisibleRef.current = new Set(visibleIds);
      return;
    }
    const prev = prevVisibleRef.current;
    const newlyAdded = visibleIds.find((id) => !prev.has(id));
    prevVisibleRef.current = new Set(visibleIds);
    if (!newlyAdded) return;
    // Defer to next frame so the DOM has mounted the new tile.
    requestAnimationFrame(() => {
      const el = document.getElementById(`q-${newlyAdded}`);
      if (!el) return;
      const header = document.querySelector('.form-header-sticky, header.sticky') as HTMLElement | null;
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const offset = headerHeight + 100;
      const elTop = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elTop - offset, behavior: 'smooth' });
    });
  }, [visibleIds]);

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
    setSavePhase('saving');

    // Flush all pending auto-saves before navigating so the server-side lock check
    // sees the current answers and doesn't redirect to a stale/invalid section URL.
    try {
      await flushNow();
    } catch (err) {
      console.warn('[onboarding] continue flush failed (continuing anyway):', err);
    }

    setSavePhase('saved');
    await new Promise((r) => setTimeout(r, 700));

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
    <>
    {savePhase !== 'idle' && (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
        {savePhase === 'saving' ? (
          <>
            <div className="mb-4 size-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <p className="text-sm text-muted-foreground">Saving your responses…</p>
          </>
        ) : (
          <>
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-toast-pop">
              <CheckIcon className="size-7" strokeWidth={2.5} />
            </div>
            <p className="text-base font-semibold text-foreground">All responses saved</p>
            <p className="mt-1 text-sm text-muted-foreground">Moving to the next section…</p>
          </>
        )}
      </div>
    )}
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
    </>
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
