'use client';

import { useState } from 'react';
import type { AdminTask, TaskStatus } from '@/types/dashboard';
import { EmailComposeModal } from './EmailComposeModal';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Phone, Mail, ExternalLink } from 'lucide-react';

interface TaskRowProps {
  task: AdminTask;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  open: 'in_progress',
  in_progress: 'in_review',
  in_review: 'closed',
  closed: 'open',
};

const PRIORITY_FLAGS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  urgent: { label: 'Urgent', variant: 'destructive' },
  high: { label: 'High', variant: 'default' },
  normal: { label: 'Normal', variant: 'secondary' },
  low: { label: 'Low', variant: 'outline' },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  call: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.5 8.25v1.5a1 1 0 0 1-1.09.999A9.892 9.892 0 0 1 5.1 9.12 9.74 9.74 0 0 1 2.7 6.9a9.892 9.892 0 0 1-1.629-4.32A1 1 0 0 1 2.07 1.5h1.5a1 1 0 0 1 1 .86c.063.48.18.95.345 1.4a1 1 0 0 1-.225 1.056L4.005 5.5a8 8 0 0 0 2.496 2.496l.684-.685a1 1 0 0 1 1.056-.225c.45.165.92.282 1.4.345a1 1 0 0 1 .86 1.019z" />
    </svg>
  ),
  email: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="2.5" width="10" height="7" rx="1" />
      <path d="M1 4l5 3 5-3" />
    </svg>
  ),
  review: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2H2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zM3.5 6l1.5 1.5L8 4.5" />
    </svg>
  ),
  bgv: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 1L1.5 3v3c0 2.625 1.875 4.5 4.5 5.25 2.625-.75 4.5-2.625 4.5-5.25V3L6 1z" />
      <path d="M4 6l1.5 1.5 2.5-2.5" />
    </svg>
  ),
  payment: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="2.5" width="10" height="7" rx="1" />
      <path d="M1 5h10" />
    </svg>
  ),
  manual: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 1v10M1 6h10" />
    </svg>
  ),
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function isDueSoon(dateStr: string | null) {
  if (!dateStr) return false;
  const due = new Date(dateStr);
  const now = new Date();
  const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 2;
}

export function TaskRow({ task, onStatusChange }: TaskRowProps) {
  const [showEmail, setShowEmail] = useState(false);

  const flag = PRIORITY_FLAGS[task.priority] ?? PRIORITY_FLAGS.normal;
  const isClosed = task.status === 'closed';

  function handleCheckboxChange() {
    const next = STATUS_CYCLE[task.status];
    onStatusChange(task.id, next);
  }

  return (
    <>
      <div
        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/50 ${
          isClosed ? 'opacity-50' : ''
        }`}
      >
        {/* Drag handle (decorative) */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground cursor-grab select-none" aria-hidden="true">
          <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
            <circle cx="3" cy="3" r="1.2" /><circle cx="7" cy="3" r="1.2" />
            <circle cx="3" cy="7" r="1.2" /><circle cx="7" cy="7" r="1.2" />
            <circle cx="3" cy="11" r="1.2" /><circle cx="7" cy="11" r="1.2" />
          </svg>
        </div>

        {/* Checkbox */}
        <Checkbox
          checked={isClosed}
          onCheckedChange={handleCheckboxChange}
          aria-label={`Mark task "${task.title}" complete`}
        />

        {/* Category icon */}
        <span className="flex-shrink-0 text-muted-foreground">
          {CATEGORY_ICONS[task.taskCategory] ?? CATEGORY_ICONS.manual}
        </span>

        {/* Task name */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isClosed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.title}
          </p>
          {task.notes && !isClosed && (
            <p className="mt-0.5 text-xs text-muted-foreground truncate">{task.notes}</p>
          )}
        </div>

        {/* Linked applicant */}
        {task.applicantName && (
          <div className="hidden sm:flex flex-shrink-0 items-center gap-2 min-w-[130px]">
            <div className="h-6 w-6 flex-shrink-0 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground uppercase select-none">
              {task.applicantName.charAt(0)}
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">{task.applicantName}</span>
          </div>
        )}

        {/* Due date */}
        <div className="hidden md:block flex-shrink-0 w-24 text-right">
          {task.dueDate ? (
            <span className={`text-xs ${isDueSoon(task.dueDate) && !isClosed ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
              {formatDate(task.dueDate)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/50">—</span>
          )}
        </div>

        {/* Priority flag */}
        <div className="flex-shrink-0">
          <Badge variant={flag.variant}>
            {flag.label}
          </Badge>
        </div>

        {/* Action icons */}
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Call */}
          {task.applicantPhone && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              asChild
            >
              <a
                href={`tel:${task.applicantPhone}`}
                title={`Call ${task.applicantName ?? 'applicant'}: ${task.applicantPhone}`}
                aria-label={`Call ${task.applicantName ?? 'applicant'}`}
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}

          {/* Email */}
          {(task.applicantEmail || task.entityId) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowEmail(true)}
              title="Send email to applicant"
              aria-label="Send email"
            >
              <Mail className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Action link */}
          {task.actionHref && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              asChild
            >
              <a
                href={task.actionHref}
                title="Open applicant profile"
                aria-label="View"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {showEmail && (
        <EmailComposeModal task={task} onClose={() => setShowEmail(false)} />
      )}
    </>
  );
}
