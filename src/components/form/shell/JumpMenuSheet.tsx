'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useForm } from '../FormProvider';
import { buildSectionList, sectionPath, type SectionListItem } from '@/lib/form/section-routing';
import { SECTIONS } from '@/lib/form/sections';
import { getSectionCompletionStatus } from '@/lib/form/section-navigation';
import type { SectionId } from '@/lib/form/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';

interface JumpMenuSheetProps {
  open: boolean;
  onClose: () => void;
  currentSection: SectionId;
  resumeSection: SectionId;
}

const SECTION_GROUPS = [
  { label: 'About You', ids: ['A', 'B', 'C'] },
  { label: 'Life & Values', ids: ['D', 'E', 'F', 'G'] },
  { label: 'Career & Finances', ids: ['H', 'I', 'J'] },
  { label: 'Compatibility', ids: ['K', 'L'] },
  { label: 'Verification', ids: ['M', 'N'] },
] as const;

export function JumpMenuSheet({ open, onClose, currentSection, resumeSection }: JumpMenuSheetProps) {
  const { state } = useForm();
  const items = buildSectionList(state.answers, resumeSection, currentSection);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const completedCount = items.filter((i) => i.status === 'complete').length;
  const totalCount = items.length;
  const completedPct = Math.round((completedCount / totalCount) * 100);

  const remainingMinutes = SECTIONS.filter((s) => {
    const status = getSectionCompletionStatus(s.id, state.answers);
    return status !== 'complete';
  }).reduce((sum, s) => sum + (s.estimatedMinutes ?? 0), 0);

  const itemMap = new Map(items.map((i) => [i.id, i]));
  let firstLinkSet = false;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl lg:rounded-none px-0">
        <SheetHeader className="px-6 lg:px-10">
          <SheetTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Sections
          </SheetTitle>
          <SheetDescription className="sr-only">Navigate between form sections</SheetDescription>
        </SheetHeader>

        <div className="mx-auto max-w-3xl px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:px-10 lg:pb-8">
          {/* Progress summary */}
          <div className="mb-6 rounded-xl border bg-muted/50 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                {completedCount} of {totalCount} sections complete
              </span>
              <span className="text-xs text-muted-foreground">
                {remainingMinutes > 0 ? `~${remainingMinutes} min remaining` : 'All done!'}
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${completedPct}%` }}
              />
            </div>
          </div>

          {completedCount > 0 && (
            <p className="mb-4 text-xs text-muted-foreground">
              Tap any completed section to jump back and edit your answers.
            </p>
          )}

          <div className="space-y-5">
            {SECTION_GROUPS.map((group) => {
              const groupItems = group.ids
                .map((id) => itemMap.get(id as SectionId))
                .filter(Boolean) as SectionListItem[];
              if (groupItems.length === 0) return null;

              return (
                <div key={group.label}>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1 pb-1">
                    {group.label}
                  </div>
                  <Separator className="mb-1" />
                  <ul className="space-y-0.5">
                    {groupItems.map((item) => {
                      const isFirst = !firstLinkSet && item.unlocked && !item.isCurrent;
                      if (isFirst) firstLinkSet = true;
                      return (
                        <SectionListRow
                          key={item.id}
                          item={item}
                          onClose={onClose}
                          firstRef={isFirst ? firstLinkRef : undefined}
                        />
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SectionListRow({
  item,
  onClose,
  firstRef,
}: {
  item: SectionListItem;
  onClose: () => void;
  firstRef?: React.RefObject<HTMLAnchorElement | null>;
}) {
  const sectionMeta = SECTIONS.find((s) => s.id === item.id);
  const timeLabel = item.status === 'complete' ? 'Done' : sectionMeta ? `~${sectionMeta.estimatedMinutes} min` : null;

  const content = (
    <div className="flex items-center gap-4 py-2.5">
      <span
        className={cn(
          'flex size-5 items-center justify-center rounded-full shrink-0',
          item.isCurrent && 'bg-primary',
          !item.isCurrent && item.status === 'complete' && 'bg-emerald-500',
          !item.isCurrent && item.status !== 'complete' && 'bg-muted-foreground/30',
        )}
      >
        {item.status === 'complete' && !item.isCurrent && (
          <CheckIcon className="size-3 text-white" strokeWidth={3} />
        )}
      </span>
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'text-sm leading-tight',
            item.unlocked ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {item.label}
        </div>
        {item.description && (
          <div className="mt-0.5 truncate text-xs text-muted-foreground">{item.description}</div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {timeLabel && (
          <span className={cn(
            'text-xs',
            item.status === 'complete' ? 'text-emerald-600' : 'text-muted-foreground',
          )}>
            {timeLabel}
          </span>
        )}
        {item.isCurrent && (
          <Badge variant="secondary" className="text-[10px]">Current</Badge>
        )}
      </div>
    </div>
  );

  if (item.unlocked && !item.isCurrent) {
    return (
      <li>
        <Link
          ref={firstRef}
          href={sectionPath(item.id)}
          onClick={onClose}
          className="block px-3 -mx-3 rounded-lg hover:bg-accent transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1"
        >
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div className="px-3 -mx-3 cursor-default">{content}</div>
    </li>
  );
}
