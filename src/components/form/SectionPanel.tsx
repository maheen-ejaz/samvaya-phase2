'use client';

import { useEffect, useState } from 'react';
import { useForm } from './FormProvider';
import { QuestionField } from './QuestionField';
import { ChatInterface } from './inputs/ChatInterface';
import { BgvConsentInput } from './inputs/BgvConsentInput';
import { SECTIONS, getSectionIndex } from '@/lib/form/sections';
import { getVisibleQuestionsForSection, getSubGroupForQuestion, getSectionCompletionStatus } from '@/lib/form/section-navigation';
import { getQuestion } from '@/lib/form/questions';
import type { SectionId } from '@/lib/form/types';
import type { ChatState } from '@/lib/claude/types';
import { CHAT_METADATA } from '@/lib/claude/chat-metadata';

interface SectionPanelProps {
  validationErrors: Set<string>;
}

// Group consecutive questions that share groupWith into pairs/clusters
type RenderItem =
  | { kind: 'single'; qId: string; dividerLabel?: string }
  | { kind: 'group'; qIds: string[]; dividerLabel?: string }
  | { kind: 'chat'; qId: string; dividerLabel?: string };

function buildRenderItems(
  visibleIds: string[],
  sectionId: SectionId
): RenderItem[] {
  const items: RenderItem[] = [];
  const consumed = new Set<string>();
  let lastSubGroup: string | null = null;

  for (let i = 0; i < visibleIds.length; i++) {
    const qId = visibleIds[i];
    if (consumed.has(qId)) continue;

    const question = getQuestion(qId);
    if (!question) continue;

    // Sub-group divider tracking
    const subGroup = getSubGroupForQuestion(sectionId, question.questionNumber);
    let dividerLabel: string | undefined;
    if (subGroup && subGroup !== lastSubGroup) {
      if (lastSubGroup !== null) dividerLabel = subGroup;
      lastSubGroup = subGroup;
    }

    if (question.type === 'claude_chat') {
      items.push({ kind: 'chat', qId, dividerLabel });
      consumed.add(qId);
      continue;
    }

    // Check if this question has groupWith partners that are also visible & adjacent
    if (question.groupWith && question.groupWith.length > 0) {
      const groupIds = [qId];
      consumed.add(qId);

      // Collect adjacent groupWith partners
      for (let j = i + 1; j < visibleIds.length; j++) {
        const nextId = visibleIds[j];
        if (consumed.has(nextId)) continue;
        const nextQ = getQuestion(nextId);
        if (!nextQ) break;
        if (question.groupWith.includes(nextId) || nextQ.groupWith?.includes(qId)) {
          groupIds.push(nextId);
          consumed.add(nextId);
        } else {
          break;
        }
      }

      if (groupIds.length > 1) {
        items.push({ kind: 'group', qIds: groupIds, dividerLabel });
      } else {
        items.push({ kind: 'single', qId, dividerLabel });
      }
      continue;
    }

    items.push({ kind: 'single', qId, dividerLabel });
    consumed.add(qId);
  }

  return items;
}

export function SectionPanel({ validationErrors }: SectionPanelProps) {
  const { state, chatState, setAnswer, submitForm, userId, navigateToSection } = useForm();
  const { currentSectionId, answers } = state;

  const sectionIndex = getSectionIndex(currentSectionId);
  const section = SECTIONS[sectionIndex];

  // Welcome screen state — persisted in localStorage per user
  const welcomeKey = `samvaya_conversations_welcome_seen_${userId}`;
  const [hasSeenWelcome, setHasSeenWelcome] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(welcomeKey) === 'true';
  });

  // Redirect if user lands on Section N with incomplete prior sections
  useEffect(() => {
    if (currentSectionId !== 'N') return;
    const incomplete = SECTIONS.filter((s) => s.id !== 'N' && getSectionCompletionStatus(s.id as SectionId, answers) !== 'complete');
    if (incomplete.length > 0) {
      navigateToSection(incomplete[0].id as SectionId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSectionId]);

  if (!section) return null;

  const visibleQuestionIds = getVisibleQuestionsForSection(currentSectionId, answers);
  const isLastSection = sectionIndex === SECTIONS.length - 1;
  const renderItems = buildRenderItems(visibleQuestionIds, currentSectionId);

  return (
    <div>
      {/* Section intro card */}
      <div className="mb-8 rounded-xl border border-rose-100/60 bg-gradient-to-r from-rose-50/50 to-white px-5 py-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-samvaya-red/60">
          Section {sectionIndex + 1} of {SECTIONS.length}
        </p>
        <h2 className="type-heading-lg text-gray-900" data-section-heading>
          {section.label}
        </h2>
        {section.description && (
          <p className="mt-1.5 text-sm text-gray-500">{section.description}</p>
        )}
        {section.estimatedMinutes && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            ~{section.estimatedMinutes} min
          </div>
        )}
      </div>

      {/* Confidentiality callout */}
      {section.showConfidentialityCallout && section.confidentialityText && (
        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
            <p className="text-sm text-blue-800">{section.confidentialityText}</p>
          </div>
        </div>
      )}

      {/* Conversations welcome screen — Section N, shown once */}
      {currentSectionId === 'N' && !hasSeenWelcome && (
        <div className="flex flex-col items-center text-center py-6">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-3xl">
            🎉
          </div>
          <h2 className="type-heading text-gray-900 mb-2">
            You&apos;ve made it to the final step
          </h2>
          <p className="text-sm text-samvaya-red font-medium mb-6">
            Now for the most important part
          </p>
          <div className="w-full rounded-xl border border-rose-100 bg-rose-50/60 px-6 py-5 text-left mb-8">
            <p className="text-sm leading-relaxed text-gray-700 mb-3">
              These three short conversations are how we understand the real person behind your profile — your values, your family, your hopes for the future.
            </p>
            <p className="text-sm leading-relaxed text-gray-700">
              Your honest, unhurried answers are what help us find the right match, not just a good one. There are no right or wrong answers — just be yourself, and take your time.
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.setItem(welcomeKey, 'true');
              setHasSeenWelcome(true);
            }}
            className="w-full rounded-lg bg-rose-600 py-3.5 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-samvaya-red/30"
          >
            Begin conversations →
          </button>
        </div>
      )}

      {/* Welcome header — only in Section A */}
      {currentSectionId === 'A' && (
        <div className="mb-8 rounded-xl border border-rose-100 bg-rose-50 px-5 py-6">
          <h1 className="mb-3 type-heading text-gray-900">
            Welcome to Samvaya
          </h1>
          <p className="text-base leading-relaxed text-gray-700">
            Everything you share here is completely confidential. We don&apos;t judge
            — and we never will. We ask detailed questions because the more honestly
            you answer, the better your matches will be. There are no right or wrong
            answers. Take your time.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Your progress is saved automatically — you can close this and pick up
            right where you left off.
          </p>
        </div>
      )}

      {/* Questions — hidden while conversations welcome screen is showing */}
      {!(currentSectionId === 'N' && !hasSeenWelcome) && <div className="space-y-8">
        {renderItems.map((item) => {
          if (item.kind === 'chat') {
            const question = getQuestion(item.qId)!;
            const savedChatState = chatState[item.qId] as ChatState | undefined;
            const isLastChat = isLastSection && item.qId === 'Q100';
            // Seed answer from saved chat state so section validation can check completion
            if (savedChatState?.isComplete && !answers[item.qId]) {
              setAnswer(item.qId, 'complete');
            }

            const isChatDone = savedChatState?.isComplete || answers[item.qId] === 'complete';

            // Determine if a prior chat in this section is still incomplete
            const chatItems = renderItems.filter((r) => r.kind === 'chat');
            const myIndexAmongChats = chatItems.findIndex((r) => r.qId === item.qId);
            const priorChatIncomplete = chatItems.slice(0, myIndexAmongChats).some((r) => {
              const prior = chatState[r.qId] as ChatState | undefined;
              return !prior?.isComplete && answers[r.qId] !== 'complete';
            });

            // Completed chat — show compact summary card
            if (isChatDone) {
              const meta = CHAT_METADATA[item.qId];
              return (
                <div key={item.qId} id={`q-${item.qId}`}>
                  {item.dividerLabel && <SubGroupDivider label={item.dividerLabel} />}
                  <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                        <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{meta?.title ?? question.text}</p>
                        <p className="text-xs text-green-700 mt-0.5">Conversation complete</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Future chat — a prior one is still incomplete, don't render yet
            if (priorChatIncomplete) {
              return null;
            }

            // Active chat — render full interface
            return (
              <div key={item.qId} id={`q-${item.qId}`}>
                {item.dividerLabel && <SubGroupDivider label={item.dividerLabel} />}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <ChatInterface
                    question={question}
                    initialChatState={savedChatState || null}
                    onComplete={isLastChat ? () => { setAnswer(item.qId, 'complete'); submitForm(); } : () => { setAnswer(item.qId, 'complete'); }}
                    completeButtonLabel={isLastChat ? 'Submit your application' : undefined}
                  />
                </div>
              </div>
            );
          }

          if (item.kind === 'group') {
            return (
              <div key={item.qIds.join('-')} id={`q-${item.qIds[0]}`}>
                {item.dividerLabel && <SubGroupDivider label={item.dividerLabel} />}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                  {item.qIds.map((qId) => {
                    const question = getQuestion(qId)!;
                    return (
                      <QuestionField
                        key={qId}
                        question={question}
                        value={answers[qId]}
                        onChange={(value) => setAnswer(qId, value)}
                        hasError={validationErrors.has(qId)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          }

          // single
          const question = getQuestion(item.qId)!;

          // BGV consent gets its own rich layout — bypass QuestionField wrapper
          if (question.type === 'bgv_consent') {
            return (
              <div key={item.qId} id={`q-${item.qId}`}>
                {item.dividerLabel && <SubGroupDivider label={item.dividerLabel} />}
                <BgvConsentInput
                  question={question}
                  value={(answers[item.qId] as string) || ''}
                  onChange={(value) => setAnswer(item.qId, value)}
                />
              </div>
            );
          }

          return (
            <div key={item.qId} id={`q-${item.qId}`}>
              {item.dividerLabel && <SubGroupDivider label={item.dividerLabel} />}
              <QuestionField
                question={question}
                value={answers[item.qId]}
                onChange={(value) => setAnswer(item.qId, value)}
                hasError={validationErrors.has(item.qId)}
              />
            </div>
          );
        })}
      </div>}
    </div>
  );
}

function SubGroupDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-8 pb-8">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}
