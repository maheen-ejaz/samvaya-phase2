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
import { getQuestion } from '@/lib/form/questions';
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { CheckIcon, CircleIcon, LockIcon } from 'lucide-react';

// Section groups matching the JumpMenuSheet
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

  // Overall progress
  const completedCount = items.filter((i) => i.status === 'complete').length;
  const totalCount = items.length;
  const completedPct = Math.round((completedCount / totalCount) * 100);

  // Remaining time
  const remainingMinutes = SECTIONS.filter((s) => {
    const status = getSectionCompletionStatus(s.id, state.answers);
    return status !== 'complete';
  }).reduce((sum, s) => sum + (s.estimatedMinutes ?? 0), 0);

  return (
    <Sidebar variant="inset" collapsible="none">
      <SidebarHeader className="px-4 py-5">
        <Link href="/app" className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight text-foreground">
            samvaya
          </span>
        </Link>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{completedCount} of {totalCount} complete</span>
            <span>{completedPct}%</span>
          </div>
          <div className="h-1 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${completedPct}%` }}
            />
          </div>
          {remainingMinutes > 0 && (
            <p className="text-[10px] text-muted-foreground">
              ~{remainingMinutes} min remaining
            </p>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {SECTION_GROUPS.map((group) => {
          const groupItems = group.ids
            .map((id) => itemMap.get(id as SectionId))
            .filter(Boolean) as SectionListItem[];
          if (groupItems.length === 0) return null;

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-wider">
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

      <SidebarFooter className="px-4 py-3">
        <p className="text-[10px] text-muted-foreground text-center">
          Press <kbd className="rounded border px-1 py-0.5 text-[10px]">?</kbd> for keyboard shortcuts
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

  // Get visible questions for this section (sub-items)
  const visibleQuestionIds = isActive
    ? getVisibleQuestionsForSection(item.id, answers)
    : [];

  const statusIcon = item.status === 'complete' ? (
    <CheckIcon className="size-3.5 text-emerald-500" />
  ) : !item.unlocked ? (
    <LockIcon className="size-3 text-muted-foreground/40" />
  ) : item.isCurrent ? (
    <CircleIcon className="size-3 fill-primary text-primary" />
  ) : (
    <CircleIcon className="size-3 text-muted-foreground/30" />
  );

  const sectionMeta = SECTIONS.find((s) => s.id === item.id);
  const timeLabel = item.status === 'complete'
    ? null
    : sectionMeta?.estimatedMinutes
    ? `${sectionMeta.estimatedMinutes}m`
    : null;

  return (
    <SidebarMenuItem>
      {item.unlocked ? (
        <SidebarMenuButton asChild isActive={isActive}>
          <Link href={sectionPath(item.id)}>
            {statusIcon}
            <span className="flex-1 truncate">{item.label}</span>
            {timeLabel && (
              <span className="text-[10px] text-muted-foreground tabular-nums">{timeLabel}</span>
            )}
          </Link>
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton disabled className="opacity-50 cursor-not-allowed">
          {statusIcon}
          <span className="flex-1 truncate">{item.label}</span>
        </SidebarMenuButton>
      )}

      {/* Sub-items: show visible questions for the current section */}
      {isActive && visibleQuestionIds.length > 0 && (
        <SidebarMenuSub>
          {visibleQuestionIds.map((qId) => {
            const question = getQuestion(qId);
            if (!question) return null;
            const isAnswered = isQuestionAnswered(qId, answers);

            return (
              <SidebarMenuSubItem key={qId}>
                <SidebarMenuSubButton
                  asChild
                  className={cn(
                    'text-xs',
                    isAnswered && 'text-muted-foreground',
                  )}
                >
                  <a
                    href={`#q-${qId}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(`q-${qId}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                  >
                    {isAnswered && (
                      <CheckIcon className="size-3 text-emerald-500 shrink-0" />
                    )}
                    <span className="truncate">{question.text}</span>
                  </a>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}
