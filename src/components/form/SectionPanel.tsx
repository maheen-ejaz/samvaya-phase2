'use client';

import { useForm } from './FormProvider';
import { QuestionField } from './QuestionField';
import { ChatInterface } from './inputs/ChatInterface';
import { SECTIONS, getSectionIndex } from '@/lib/form/sections';
import { getVisibleQuestionsForSection, getSubGroupForQuestion } from '@/lib/form/section-navigation';
import { getQuestion } from '@/lib/form/questions';
import type { SectionId } from '@/lib/form/types';
import type { ChatState } from '@/lib/claude/types';

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
  const { state, chatState, setAnswer, submitForm } = useForm();
  const { currentSectionId, answers } = state;

  const sectionIndex = getSectionIndex(currentSectionId);
  const section = SECTIONS[sectionIndex];
  if (!section) return null;

  const visibleQuestionIds = getVisibleQuestionsForSection(currentSectionId, answers);
  const isLastSection = sectionIndex === SECTIONS.length - 1;
  const renderItems = buildRenderItems(visibleQuestionIds, currentSectionId);

  return (
    <div>
      {/* Section header */}
      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Section {sectionIndex + 1} of {SECTIONS.length}
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          {section.label}
        </h2>
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

      {/* Welcome header — only in Section A */}
      {currentSectionId === 'A' && (
        <div className="mb-8 rounded-xl border border-rose-100 bg-rose-50 px-5 py-6">
          <h1 className="mb-3 text-xl font-bold text-gray-900">
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

      {/* Questions */}
      <div className="space-y-8">
        {renderItems.map((item) => {
          if (item.kind === 'chat') {
            const question = getQuestion(item.qId)!;
            const savedChatState = chatState[item.qId] as ChatState | undefined;
            const isLastChat = isLastSection;
            return (
              <div key={item.qId}>
                {item.dividerLabel && <SubGroupDivider label={item.dividerLabel} />}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <ChatInterface
                    question={question}
                    initialChatState={savedChatState || null}
                    onComplete={isLastChat ? () => { submitForm(); } : () => {}}
                    completeButtonLabel={isLastChat ? 'Submit your application' : undefined}
                  />
                </div>
              </div>
            );
          }

          if (item.kind === 'group') {
            return (
              <div key={item.qIds.join('-')}>
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
          return (
            <div key={item.qId}>
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
      </div>
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
