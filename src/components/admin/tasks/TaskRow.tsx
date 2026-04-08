'use client';

import { useState } from 'react';
import type { AdminTask, TaskStatus } from '@/types/dashboard';
import { EmailComposeModal } from './EmailComposeModal';

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

const PRIORITY_FLAGS: Record<string, { label: string; color: string; bg: string }> = {
  urgent: { label: 'Urgent', color: 'text-red-600', bg: 'bg-red-50' },
  high: { label: 'High', color: 'text-orange-500', bg: 'bg-orange-50' },
  normal: { label: 'Normal', color: 'text-blue-500', bg: 'bg-blue-50' },
  low: { label: 'Low', color: 'text-green-600', bg: 'bg-green-50' },
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
        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50/80 ${
          isClosed ? 'opacity-50' : ''
        }`}
      >
        {/* Drag handle (decorative) */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 cursor-grab select-none" aria-hidden="true">
          <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
            <circle cx="3" cy="3" r="1.2" /><circle cx="7" cy="3" r="1.2" />
            <circle cx="3" cy="7" r="1.2" /><circle cx="7" cy="7" r="1.2" />
            <circle cx="3" cy="11" r="1.2" /><circle cx="7" cy="11" r="1.2" />
          </svg>
        </div>

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isClosed}
          onChange={handleCheckboxChange}
          className="h-4 w-4 flex-shrink-0 rounded border-gray-300 text-[#1B4332] focus:ring-[#1B4332]/30 cursor-pointer"
          aria-label={`Mark task "${task.title}" complete`}
        />

        {/* Category icon */}
        <span className="flex-shrink-0 text-gray-400">
          {CATEGORY_ICONS[task.taskCategory] ?? CATEGORY_ICONS.manual}
        </span>

        {/* Task name */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isClosed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {task.title}
          </p>
          {task.notes && !isClosed && (
            <p className="mt-0.5 text-xs text-gray-500 truncate">{task.notes}</p>
          )}
        </div>

        {/* Linked applicant */}
        {task.applicantName && (
          <div className="hidden sm:flex flex-shrink-0 items-center gap-2 min-w-[130px]">
            <div className="h-6 w-6 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 uppercase select-none">
              {task.applicantName.charAt(0)}
            </div>
            <span className="text-xs text-gray-600 truncate max-w-[100px]">{task.applicantName}</span>
          </div>
        )}

        {/* Due date */}
        <div className="hidden md:block flex-shrink-0 w-24 text-right">
          {task.dueDate ? (
            <span className={`text-xs ${isDueSoon(task.dueDate) && !isClosed ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
              {formatDate(task.dueDate)}
            </span>
          ) : (
            <span className="text-xs text-gray-300">—</span>
          )}
        </div>

        {/* Priority flag */}
        <div className="flex-shrink-0">
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${flag.color} ${flag.bg}`}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
              <path d="M1 1h6L5.5 4 7 7H1V1z" />
            </svg>
            {flag.label}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Call */}
          {task.applicantPhone && (
            <a
              href={`tel:${task.applicantPhone}`}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              title={`Call ${task.applicantName ?? 'applicant'}: ${task.applicantPhone}`}
              aria-label={`Call ${task.applicantName ?? 'applicant'}`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.25 9.625v1.75A1.167 1.167 0 0 1 10.98 12.5a11.537 11.537 0 0 1-5.03-1.902A11.36 11.36 0 0 1 2.4 7.05 11.537 11.537 0 0 1 .5 2.008 1.167 1.167 0 0 1 1.659.75H3.41a1.167 1.167 0 0 1 1.167 1.004c.073.56.21 1.109.402 1.634a1.167 1.167 0 0 1-.263 1.23L4.005 5.25A9.333 9.333 0 0 0 6.917 8.162l.712-.714a1.167 1.167 0 0 1 1.23-.262c.525.192 1.073.328 1.633.402a1.167 1.167 0 0 1 1.004 1.179l-.246.858z" />
              </svg>
            </a>
          )}

          {/* Email */}
          {(task.applicantEmail || task.entityId) && (
            <button
              onClick={() => setShowEmail(true)}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              title="Send email to applicant"
              aria-label="Send email"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1.75" y="3.5" width="10.5" height="7" rx="1" />
                <path d="M1.75 5.25l5.25 3 5.25-3" />
              </svg>
            </button>
          )}

          {/* Action link */}
          {task.actionHref && (
            <a
              href={task.actionHref}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              title="Open applicant profile"
              aria-label="View"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5.25 2.625H2.625A.875.875 0 0 0 1.75 3.5v7.875A.875.875 0 0 0 2.625 12.25H10.5a.875.875 0 0 0 .875-.875V8.75" />
                <path d="M8.75 1.75h3.5v3.5" />
                <path d="M5.833 8.167l6.417-6.417" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {showEmail && (
        <EmailComposeModal task={task} onClose={() => setShowEmail(false)} />
      )}
    </>
  );
}
