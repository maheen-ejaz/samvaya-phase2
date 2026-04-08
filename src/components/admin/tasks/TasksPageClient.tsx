'use client';

import { useState, useMemo, useCallback } from 'react';
import type { AdminTask, TaskStatus, TaskPriority, TaskCategory } from '@/types/dashboard';
import { TaskGroupSection } from './TaskGroupSection';
import { TaskFilters } from './TaskFilters';
import { TaskCreateModal } from './TaskCreateModal';

interface TasksPageClientProps {
  initialTasks: AdminTask[];
}

const STATUS_ORDER: TaskStatus[] = ['open', 'in_progress', 'in_review', 'closed'];

export function TasksPageClient({ initialTasks }: TasksPageClientProps) {
  const [tasks, setTasks] = useState<AdminTask[]>(initialTasks);
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');
  const [showClosed, setShowClosed] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived: apply filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!showClosed && t.status === 'closed') return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterCategory !== 'all' && t.taskCategory !== filterCategory) return false;
      return true;
    });
  }, [tasks, showClosed, filterPriority, filterCategory]);

  // Group by status
  const grouped = useMemo(() => {
    const map = new Map<TaskStatus, AdminTask[]>();
    for (const s of STATUS_ORDER) map.set(s, []);
    for (const t of filteredTasks) {
      map.get(t.status)?.push(t);
    }
    return map;
  }, [filteredTasks]);

  // Counts for summary chips
  const counts = useMemo(() => ({
    open: tasks.filter((t) => t.status === 'open').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    in_review: tasks.filter((t) => t.status === 'in_review').length,
    closed: tasks.filter((t) => t.status === 'closed').length,
  }), [tasks]);

  const handleStatusChange = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    setError(null);

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              resolvedAt: newStatus === 'closed' ? new Date().toISOString() : t.resolvedAt,
            }
          : t
      )
    );

    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to update task');
      }

      const { task: updated } = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      // Revert
      setTasks(initialTasks);
    }
  }, [initialTasks]);

  const handleTaskCreated = useCallback((task: AdminTask) => {
    setTasks((prev) => [task, ...prev]);
  }, []);

  const visibleStatuses = showClosed ? STATUS_ORDER : STATUS_ORDER.filter((s) => s !== 'closed');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            {counts.open + counts.in_progress + counts.in_review} active
            {counts.closed > 0 && ` · ${counts.closed} closed`}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[#1B4332] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1B4332]/90 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M7 1.75v10.5M1.75 7h10.5" />
          </svg>
          Add Task
        </button>
      </div>

      {/* Filters */}
      <TaskFilters
        filterPriority={filterPriority}
        filterCategory={filterCategory}
        showClosed={showClosed}
        onPriorityChange={setFilterPriority}
        onCategoryChange={setFilterCategory}
        onShowClosedChange={setShowClosed}
      />

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Status summary chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { label: 'Open', count: counts.open, color: 'bg-gray-100 text-gray-700' },
          { label: 'In Progress', count: counts.in_progress, color: 'bg-blue-50 text-blue-700' },
          { label: 'In Review', count: counts.in_review, color: 'bg-amber-50 text-amber-700' },
          { label: 'Closed', count: counts.closed, color: 'bg-green-50 text-green-700' },
        ].map((chip) => (
          <span key={chip.label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${chip.color}`}>
            {chip.label}
            <span className="font-bold">{chip.count}</span>
          </span>
        ))}
      </div>

      {/* Task groups */}
      <div className="space-y-4">
        {visibleStatuses.map((status) => (
          <TaskGroupSection
            key={status}
            status={status}
            tasks={grouped.get(status) ?? []}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <TaskCreateModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}
