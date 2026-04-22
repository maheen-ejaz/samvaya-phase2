'use client';

import { useState } from 'react';
import type { AdminTask, TaskStatus } from '@/types/dashboard';
import { TaskRow } from './TaskRow';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface TaskGroupSectionProps {
  status: TaskStatus;
  tasks: AdminTask[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const STATUS_META: Record<TaskStatus, { label: string; dotColor: string }> = {
  open: {
    label: 'Open',
    dotColor: 'bg-gray-400',
  },
  in_progress: {
    label: 'In Progress',
    dotColor: 'bg-blue-500',
  },
  in_review: {
    label: 'In Review',
    dotColor: 'bg-amber-500',
  },
  closed: {
    label: 'Closed',
    dotColor: 'bg-green-500',
  },
};

export function TaskGroupSection({ status, tasks, onStatusChange }: TaskGroupSectionProps) {
  const [open, setOpen] = useState(true);
  const meta = STATUS_META[status];

  return (
    <Card className="overflow-hidden">
      <Collapsible open={open} onOpenChange={setOpen}>
        {/* Section header */}
        <CollapsibleTrigger asChild>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left"
            aria-expanded={open}
          >
            {/* Collapse chevron */}
            <ChevronDown
              className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform ${!open ? '-rotate-90' : ''}`}
              aria-hidden="true"
            />

            {/* Status dot */}
            <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${meta.dotColor}`} aria-hidden="true" />

            {/* Label */}
            <span className="text-sm font-semibold text-foreground">{meta.label}</span>

            {/* Count */}
            <span className="ml-1 text-sm font-medium text-muted-foreground">{tasks.length}</span>
          </button>
        </CollapsibleTrigger>

        {/* Task rows */}
        <CollapsibleContent>
          <div className="border-t border-border px-2 py-1">
            {tasks.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">No {meta.label.toLowerCase()} tasks</p>
            ) : (
              <div>
                {/* Column headers */}
                <div className="flex items-center gap-3 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <span className="w-4 flex-shrink-0" />
                  <span className="w-4 flex-shrink-0" />
                  <span className="w-4 flex-shrink-0" />
                  <span className="flex-1">Name task</span>
                  <span className="hidden sm:block w-[130px] flex-shrink-0">Applicant</span>
                  <span className="hidden md:block w-24 text-right flex-shrink-0">Due date</span>
                  <span className="w-16 flex-shrink-0">Priority</span>
                  <span className="w-20 flex-shrink-0" />
                </div>
                {tasks.map((task) => (
                  <TaskRow key={task.id} task={task} onStatusChange={onStatusChange} />
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
