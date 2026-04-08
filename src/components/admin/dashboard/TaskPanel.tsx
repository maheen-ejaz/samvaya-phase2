'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import type { AdminTask } from '@/types/dashboard';

interface TaskPanelProps {
  initialTasks: AdminTask[];
}

type StatusFilter = 'all' | 'open' | 'in_progress' | 'in_review' | 'closed';

const statusColors: Record<string, { badge: string; text: string; dot: string }> = {
  open: {
    badge: 'bg-gray-100 text-gray-900',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  },
  in_progress: {
    badge: 'bg-blue-50 text-gray-900',
    text: 'text-blue-600',
    dot: 'bg-blue-500',
  },
  in_review: {
    badge: 'bg-amber-50 text-gray-900',
    text: 'text-amber-600',
    dot: 'bg-amber-500',
  },
  closed: {
    badge: 'bg-green-50 text-gray-900',
    text: 'text-green-600',
    dot: 'bg-green-500',
  },
};

export function TaskPanel({ initialTasks }: TaskPanelProps) {
  const [tasks, setTasks] = useState<AdminTask[]>(initialTasks);
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (filterStatus !== 'all') {
      filtered = filtered.filter((task) => task.status === filterStatus);
    }

    // Only show active and recent closed tasks (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    filtered = filtered.filter((task) => {
      if (task.status !== 'closed') return true;
      const resolvedDate = task.resolvedAt ? new Date(task.resolvedAt) : null;
      return resolvedDate && resolvedDate > sevenDaysAgo;
    });

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tasks, filterStatus]);

  // Count by status
  const counts = useMemo(() => {
    const all = tasks.length;
    const open = tasks.filter((t) => t.status === 'open').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const inReview = tasks.filter((t) => t.status === 'in_review').length;
    const closed = tasks.filter((t) => t.status === 'closed').length;
    return { all, open, inProgress, inReview, closed };
  }, [tasks]);

  // Handle task status update
  const updateTaskStatus = useCallback(
    async (taskId: string, newStatus: string) => {
      setError(null);
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: newStatus as any,
                resolvedAt: newStatus === 'closed' ? new Date().toISOString() : t.resolvedAt,
              }
            : t
        )
      );

      try {
        const response = await fetch(`/api/admin/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update task');
        }

        const { task: updated } = await response.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update task');
        // Revert on error
        setTasks(initialTasks);
      }
    },
    [tasks, initialTasks]
  );

  // Cycle status on badge click
  const cycleStatus = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const cycle: Record<string, string> = {
      open: 'in_progress',
      in_progress: 'in_review',
      in_review: 'closed',
      closed: 'open',
    };

    updateTaskStatus(taskId, cycle[task.status]);
  };

  // Handle add task
  const handleAddTask = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTaskTitle.trim()) {
        setError('Task title is required');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const response = await fetch('/api/admin/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newTaskTitle,
            task_type: 'manual',
            task_category: 'manual',
            priority: 'normal',
            due_date: newTaskDueDate || null,
            notes: newTaskNotes || null,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create task');
        }

        const { task } = await response.json();
        setTasks((prev) => [task, ...prev]);
        setNewTaskTitle('');
        setNewTaskDueDate('');
        setNewTaskNotes('');
        setShowAddForm(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create task');
      } finally {
        setIsSubmitting(false);
      }
    },
    [newTaskTitle, newTaskDueDate, newTaskNotes]
  );

  return (
    <div className="rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="type-heading text-gray-900">Tasks</h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-admin-blue-800 hover:text-admin-blue-700"
          >
            <span>+</span> Add Task
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="mt-4 flex gap-2 border-b border-gray-200">
        {[
          { key: 'all', label: 'All', countKey: 'all' },
          { key: 'open', label: 'Open', countKey: 'open' },
          { key: 'in_progress', label: 'In Progress', countKey: 'inProgress' },
          { key: 'in_review', label: 'In Review', countKey: 'inReview' },
          { key: 'closed', label: 'Closed', countKey: 'closed' },
        ].map(({ key, label, countKey }) => {
          const statusKey = key as StatusFilter;
          const count = counts[countKey as keyof typeof counts];

          return (
            <button
              key={key}
              onClick={() => setFilterStatus(statusKey)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                filterStatus === statusKey
                  ? 'border-admin-blue-600 text-admin-blue-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {label} <span className="ml-1 text-xs text-gray-500">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Add task form */}
      {showAddForm && (
        <form onSubmit={handleAddTask} className="mt-4 border-t border-gray-200 pt-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task title</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g., Follow up with John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due date (optional)</label>
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea
                value={newTaskNotes}
                onChange={(e) => setNewTaskNotes(e.target.value)}
                placeholder="Add any additional notes..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-admin-blue-500"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 bg-admin-blue-600 text-white text-sm font-medium rounded-lg hover:bg-admin-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Task'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* View all link */}
      <div className="mt-3 flex justify-end">
        <Link href="/admin/tasks" className="text-xs font-medium text-admin-blue-600 hover:text-admin-blue-700 transition-colors">
          View all tasks →
        </Link>
      </div>

      {/* Tasks list */}
      <div className="mt-4">
        {filteredTasks.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            {filterStatus === 'all' ? 'No tasks yet' : `No ${filterStatus.replace('_', ' ')} tasks`}
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTasks.map((task) => {
              const colors = statusColors[task.status];
              return (
                <div key={task.id} className="flex items-start gap-3 py-3 px-2 rounded-lg hover:bg-gray-50/70 transition-colors">
                  {/* Checkbox / status dot */}
                  <div className="pt-1 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={task.status === 'closed'}
                      onChange={() => updateTaskStatus(task.id, task.status === 'closed' ? 'open' : 'closed')}
                      className="w-4 h-4 rounded border-gray-300 text-admin-blue-600 focus:ring-admin-blue-500 cursor-pointer"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.status === 'closed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    {task.notes && <p className="text-xs text-gray-500 mt-1">{task.notes}</p>}

                    {/* Due date and action link */}
                    <div className="flex items-center gap-2 mt-2">
                      {task.dueDate && (
                        <span className="text-xs text-gray-500">
                          Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}
                        </span>
                      )}
                      {task.actionHref && (
                        <a href={task.actionHref} className="text-xs text-admin-blue-600 hover:text-admin-blue-700">
                          View →
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => cycleStatus(task.id)}
                      className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${colors.badge} hover:opacity-80 cursor-pointer`}
                      title="Click to change status"
                    >
                      {task.status === 'open'
                        ? 'Open'
                        : task.status === 'in_progress'
                          ? 'In Progress'
                          : task.status === 'in_review'
                            ? 'In Review'
                            : 'Closed'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
