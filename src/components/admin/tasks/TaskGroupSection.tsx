'use client';

import { useState } from 'react';
import type { AdminTask, TaskStatus } from '@/types/dashboard';
import { TaskRow } from './TaskRow';

interface TaskGroupSectionProps {
  status: TaskStatus;
  tasks: AdminTask[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

const STATUS_META: Record<TaskStatus, { label: string; dotColor: string; borderColor: string }> = {
  open: {
    label: 'Open',
    dotColor: 'bg-gray-400',
    borderColor: 'border-gray-300',
  },
  in_progress: {
    label: 'In Progress',
    dotColor: 'bg-blue-500',
    borderColor: 'border-blue-200',
  },
  in_review: {
    label: 'In Review',
    dotColor: 'bg-amber-500',
    borderColor: 'border-amber-200',
  },
  closed: {
    label: 'Closed',
    dotColor: 'bg-green-500',
    borderColor: 'border-green-200',
  },
};

export function TaskGroupSection({ status, tasks, onStatusChange }: TaskGroupSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const meta = STATUS_META[status];

  return (
    <div className="rounded-xl border border-gray-200/70 bg-white overflow-hidden shadow-sm">
      {/* Section header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50/70 transition-colors text-left"
        aria-expanded={!collapsed}
      >
        {/* Collapse chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`flex-shrink-0 text-gray-400 transition-transform ${collapsed ? '-rotate-90' : ''}`}
          aria-hidden="true"
        >
          <path d="M3.5 5.25l3.5 3.5 3.5-3.5" />
        </svg>

        {/* Status dot */}
        <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${meta.dotColor}`} aria-hidden="true" />

        {/* Label */}
        <span className="text-sm font-semibold text-gray-800">{meta.label}</span>

        {/* Count */}
        <span className="ml-1 text-sm font-medium text-gray-400">{tasks.length}</span>
      </button>

      {/* Task rows */}
      {!collapsed && (
        <div className="border-t border-gray-100 px-2 py-1">
          {tasks.length === 0 ? (
            <p className="py-4 text-center text-xs text-gray-400">No {meta.label.toLowerCase()} tasks</p>
          ) : (
            <div>
              {/* Column headers */}
              <div className="flex items-center gap-3 px-3 py-1.5 text-xs font-medium text-gray-400">
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
      )}
    </div>
  );
}
