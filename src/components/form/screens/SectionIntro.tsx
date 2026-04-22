'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '../FormProvider';
import { getVisibleQuestionsForSection, getSectionCompletionStatus } from '@/lib/form/section-navigation';
import { getSectionMeta, getSectionPosition, sectionPath } from '@/lib/form/section-routing';
import { SECTIONS, getSectionIndex } from '@/lib/form/sections';
import type { SectionId } from '@/lib/form/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRightIcon, CheckIcon, LockIcon, MessageSquareIcon } from 'lucide-react';

interface SectionIntroProps {
  sectionId: SectionId;
}

const AI_CHAT_SECTIONS: SectionId[] = ['D', 'K', 'N'];

export function SectionIntro({ sectionId }: SectionIntroProps) {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const { state } = useForm();
  const meta = getSectionMeta(sectionId);
  const { position, total } = getSectionPosition(sectionId);

  if (!meta) return null;

  const visibleIds = getVisibleQuestionsForSection(sectionId, state.answers);
  const questionCount = visibleIds.length;
  const positionLabel = String(position).padStart(2, '0');
  const hasAiChat = AI_CHAT_SECTIONS.includes(sectionId);

  const sectionIdx = getSectionIndex(sectionId);
  const prevSection = sectionIdx > 0 ? SECTIONS[sectionIdx - 1] : null;
  const prevComplete = prevSection
    ? getSectionCompletionStatus(prevSection.id, state.answers) === 'complete'
    : false;

  function handleBegin() {
    setIsExiting(true);
    setTimeout(() => router.push(sectionPath(sectionId)), 200);
  }

  return (
    <>
      <div className={cn(
        'max-w-xl mx-auto py-12 lg:py-20',
        isExiting ? 'form-section-exit' : 'form-section-enter',
      )}>
        {prevComplete && prevSection && (
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
              <CheckIcon className="size-3" />
              {prevSection.label} complete
            </span>
          </div>
        )}

        <div className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Section {positionLabel} of {total}
        </div>
        <h1 className="form-title text-center mb-4">
          {meta.label}
        </h1>
        {meta.description && (
          <p className="text-sm text-muted-foreground text-center mb-8">{meta.description}</p>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-center flex-wrap gap-3 mb-8">
          <span className="text-xs text-muted-foreground">
            {questionCount} {questionCount === 1 ? 'question' : 'questions'}
          </span>
          {meta.estimatedMinutes && (
            <>
              <span className="text-xs text-muted-foreground" aria-hidden="true">·</span>
              <span className="text-xs text-muted-foreground">~{meta.estimatedMinutes} min</span>
            </>
          )}
          {hasAiChat && (
            <>
              <span className="text-xs text-muted-foreground" aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquareIcon className="size-3" />
                Includes an AI conversation
              </span>
            </>
          )}
        </div>

        {meta.showConfidentialityCallout && meta.confidentialityText && (
          <Card className="mb-8 border-amber-200/50 bg-amber-50/30">
            <CardContent>
              <div className="flex items-start gap-3">
                <LockIcon className="mt-0.5 size-5 shrink-0 text-amber-500" />
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">Private &amp; confidential</div>
                  <p className="text-sm text-muted-foreground">{meta.confidentialityText}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Desktop CTA */}
        <div className="hidden lg:flex lg:justify-center">
          <Button onClick={handleBegin} className="min-w-[14rem] gap-1.5 rounded-xl">
            Begin section
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>

        {/* Spacer for mobile fixed CTA */}
        <div className="h-[calc(5rem+env(safe-area-inset-bottom))] lg:hidden" aria-hidden="true" />
      </div>

      {/* Mobile CTA — fixed outside animated wrapper */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-background border-t lg:hidden z-20">
        <Button onClick={handleBegin} className="w-full gap-1.5 rounded-xl">
          Begin section
          <ArrowRightIcon className="size-4" />
        </Button>
      </div>
    </>
  );
}
