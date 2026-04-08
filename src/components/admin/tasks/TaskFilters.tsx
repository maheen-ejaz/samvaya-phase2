'use client';

import type { TaskStatus, TaskPriority, TaskCategory } from '@/types/dashboard';

interface TaskFiltersProps {
  filterPriority: TaskPriority | 'all';
  filterCategory: TaskCategory | 'all';
  showClosed: boolean;
  onPriorityChange: (p: TaskPriority | 'all') => void;
  onCategoryChange: (c: TaskCategory | 'all') => void;
  onShowClosedChange: (v: boolean) => void;
}

const PRIORITY_OPTIONS: { value: TaskPriority | 'all'; label: string }[] = [
  { value: 'all', label: 'All priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
];

const CATEGORY_OPTIONS: { value: TaskCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'review', label: 'Review' },
  { value: 'bgv', label: 'BGV' },
  { value: 'payment', label: 'Payment' },
  { value: 'manual', label: 'Manual' },
];

export function TaskFilters({
  filterPriority,
  filterCategory,
  showClosed,
  onPriorityChange,
  onCategoryChange,
  onShowClosedChange,
}: TaskFiltersProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Group: Status label */}
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="1" y="1" width="4" height="4" rx="0.5" />
          <rect x="7" y="1" width="4" height="4" rx="0.5" />
          <rect x="1" y="7" width="4" height="4" rx="0.5" />
          <rect x="7" y="7" width="4" height="4" rx="0.5" />
        </svg>
        Group: Status
      </span>

      {/* Priority filter */}
      <select
        value={filterPriority}
        onChange={(e) => onPriorityChange(e.target.value as TaskPriority | 'all')}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30 cursor-pointer"
        aria-label="Filter by priority"
      >
        {PRIORITY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Category / Type filter */}
      <select
        value={filterCategory}
        onChange={(e) => onCategoryChange(e.target.value as TaskCategory | 'all')}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30 cursor-pointer"
        aria-label="Filter by type"
      >
        {CATEGORY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Show closed toggle */}
      <button
        onClick={() => onShowClosedChange(!showClosed)}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
          showClosed
            ? 'border-[#1B4332] bg-[#1B4332]/5 text-[#1B4332]'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
        }`}
        aria-pressed={showClosed}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z" />
          <circle cx="6" cy="6" r="1.5" />
        </svg>
        Show closed
      </button>
    </div>
  );
}
