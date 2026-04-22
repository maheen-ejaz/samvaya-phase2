'use client';

import Link from 'next/link';
import { useForm } from '../FormProvider';
import {
  buildSectionList,
  sectionPath,
  type SectionListItem,
} from '@/lib/form/section-routing';
import { SECTIONS } from '@/lib/form/sections';
import {
  getVisibleQuestionsForSection,
  getSectionCompletionStatus,
  isQuestionAnswered,
} from '@/lib/form/section-navigation';
import type { SectionId } from '@/lib/form/types';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { CheckIcon, LockIcon } from 'lucide-react';

const SECTION_GROUPS = [
  { label: 'About You', ids: ['A', 'B', 'C'] },
  { label: 'Life & Values', ids: ['D', 'E', 'F', 'G'] },
  { label: 'Career & Finances', ids: ['H', 'I', 'J'] },
  { label: 'Compatibility', ids: ['K', 'L'] },
  { label: 'Verification', ids: ['M', 'N'] },
] as const;

interface OnboardingSidebarProps {
  currentSection: SectionId;
  resumeSection: SectionId;
}

export function OnboardingSidebar({ currentSection, resumeSection }: OnboardingSidebarProps) {
  const { state } = useForm();
  const items = buildSectionList(state.answers, resumeSection, currentSection);
  const itemMap = new Map(items.map((i) => [i.id, i]));

  // Total question count and answered count across all visible questions
  const allQuestionStats = SECTIONS.reduce(
    (acc, s) => {
      const visible = getVisibleQuestionsForSection(s.id, state.answers);
      const answered = visible.filter((id) => isQuestionAnswered(id, state.answers)).length;
      return { total: acc.total + visible.length, answered: acc.answered + answered };
    },
    { total: 0, answered: 0 },
  );

  const completedPct = allQuestionStats.total > 0
    ? Math.round((allQuestionStats.answered / allQuestionStats.total) * 100)
    : 0;

  const remainingMinutes = SECTIONS.filter((s) => {
    const status = getSectionCompletionStatus(s.id, state.answers);
    return status !== 'complete';
  }).reduce((sum, s) => sum + (s.estimatedMinutes ?? 0), 0);

  return (
    <Sidebar variant="inset" collapsible="none">
      <SidebarHeader className="px-5 py-5 border-b border-[color:var(--color-form-border)]">
        <Link href="/app" className="mb-4 block">
          <span className="text-sm font-semibold tracking-tight text-[color:var(--color-form-text-primary)]">
            samvaya
          </span>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--color-form-text-muted)]">
              Your Progress
            </p>
            <p className="mt-0.5 text-xs text-[color:var(--color-form-text-secondary)]">
              {allQuestionStats.answered} of {allQuestionStats.total} questions
              {remainingMinutes > 0 && <> · ~{remainingMinutes} min remaining</>}
            </p>
          </div>
          <span className="text-sm font-semibold tabular-nums text-[color:var(--color-form-text-primary)]">
            {completedPct}%
          </span>
        </div>
        <div className="mt-3 h-0.5 w-full rounded-full bg-[color:var(--color-form-border)]">
          <div
            className="h-full rounded-full bg-[color:var(--color-form-accent)] transition-all duration-500"
            style={{ width: `${completedPct}%` }}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {SECTION_GROUPS.map((group) => {
          const groupItems = group.ids
            .map((id) => itemMap.get(id as SectionId))
            .filter(Boolean) as SectionListItem[];
          if (groupItems.length === 0) return null;

          return (
            <SidebarGroup key={group.label} className="py-3">
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--color-form-text-muted)] px-4 pb-1">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {groupItems.map((item) => (
                    <SectionMenuItem
                      key={item.id}
                      item={item}
                      currentSection={currentSection}
                      answers={state.answers}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="px-4 py-3 border-t border-[color:var(--color-form-border)]">
        <p className="text-[10px] text-[color:var(--color-form-text-muted)] text-center">
          Press <kbd className="rounded border px-1 py-0.5 text-[10px]">?</kbd> for sections
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function SectionMenuItem({
  item,
  currentSection,
  answers,
}: {
  item: SectionListItem;
  currentSection: SectionId;
  answers: Record<string, unknown>;
}) {
  const isActive = item.id === currentSection;
  const isComplete = item.status === 'complete';

  const visibleIds = getVisibleQuestionsForSection(item.id, answers);
  const answeredCount = visibleIds.filter((id) => isQuestionAnswered(id, answers)).length;
  const totalCount = visibleIds.length;

  const statusIcon = isComplete ? (
    <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[color:var(--color-form-accent)]">
      <CheckIcon className="size-2.5 stroke-[2.5] text-white" />
    </span>
  ) : !item.unlocked ? (
    <span className="flex size-[18px] shrink-0 items-center justify-center">
      <LockIcon className="size-3 text-[color:var(--color-form-text-muted)]" />
    </span>
  ) : isActive ? (
    <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[color:var(--color-form-accent)]">
      <span className="size-1.5 rounded-full bg-white" />
    </span>
  ) : (
    <span className="size-[18px] shrink-0 rounded-full border-[1.5px] border-[color:var(--color-form-border-strong)]" />
  );

  const rightLabel = isActive
    ? `${answeredCount} of ${totalCount}`
    : isComplete
    ? null
    : totalCount > 0
    ? `${totalCount} ${totalCount === 1 ? 'question' : 'questions'}`
    : null;

  return (
    <SidebarMenuItem>
      {item.unlocked ? (
        <SidebarMenuButton asChild isActive={isActive} className="h-auto py-2 px-4">
          <Link href={sectionPath(item.id)}>
            {statusIcon}
            <span
              className={cn(
                'flex-1 truncate text-xs',
                isActive && 'font-semibold text-[color:var(--color-form-text-primary)]',
                isComplete && 'text-[color:var(--color-form-text-muted)]',
                !isActive && !isComplete && 'text-[color:var(--color-form-text-secondary)]',
              )}
            >
              {item.label}
            </span>
            {rightLabel && (
              <span className={cn(
                'text-[10px] tabular-nums shrink-0',
                isActive ? 'font-medium text-[color:var(--color-form-accent)]' : 'text-[color:var(--color-form-text-muted)]',
              )}>
                {rightLabel}
              </span>
            )}
          </Link>
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton disabled className="h-auto cursor-not-allowed py-2 px-4 opacity-50">
          {statusIcon}
          <span className="flex-1 truncate text-xs text-[color:var(--color-form-text-secondary)]">
            {item.label}
          </span>
          {rightLabel && (
            <span className="text-[10px] text-[color:var(--color-form-text-muted)] tabular-nums shrink-0">
              {rightLabel}
            </span>
          )}
        </SidebarMenuButton>
      )}
    </SidebarMenuItem>
  );
}
