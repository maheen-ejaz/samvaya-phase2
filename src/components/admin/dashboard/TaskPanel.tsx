'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
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

  // Render task list for a given status filter
  const renderTaskList = () => (
    <>
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
                <div className="pt-0.5 flex-shrink-0">
                  <Checkbox
                    checked={task.status === 'closed'}
                    onCheckedChange={() => updateTaskStatus(task.id, task.status === 'closed' ? 'open' : 'closed')}
                    className="cursor-pointer"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', task.status === 'closed' ? 'text-gray-400 line-through' : 'text-gray-900')}>
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
                      <Button variant="link" size="xs" asChild className="text-xs text-primary hover:text-primary p-0 h-auto">
                        <a href={task.actionHref}>View</a>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <div className="flex-shrink-0">
                  <Badge
                    className={cn('cursor-pointer hover:opacity-80 h-auto rounded-md px-2.5 py-1 text-xs font-medium border-0', colors.badge)}
                    onClick={() => cycleStatus(task.id)}
                    title="Click to change status"
                  >
                    {task.status === 'open'
                      ? 'Open'
                      : task.status === 'in_progress'
                        ? 'In Progress'
                        : task.status === 'in_review'
                          ? 'In Review'
                          : 'Closed'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <Card className="shadow-sm ring-1 ring-gray-200/60">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">Tasks</CardTitle>
        <CardAction>
          {!showAddForm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="text-xs font-medium text-primary hover:text-primary"
            >
              <Plus className="h-3 w-3" />
              Add Task
            </Button>
          )}
        </CardAction>
      </CardHeader>

      <CardContent>
        {/* Status tabs */}
        <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as StatusFilter)}>
          <TabsList variant="line" className="w-full justify-start">
            {[
              { key: 'all', label: 'All', countKey: 'all' },
              { key: 'open', label: 'Open', countKey: 'open' },
              { key: 'in_progress', label: 'In Progress', countKey: 'inProgress' },
              { key: 'in_review', label: 'In Review', countKey: 'inReview' },
              { key: 'closed', label: 'Closed', countKey: 'closed' },
            ].map(({ key, label, countKey }) => {
              const count = counts[countKey as keyof typeof counts];
              return (
                <TabsTrigger key={key} value={key} className="text-sm">
                  {label} <span className="ml-1 text-xs text-gray-500">({count})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* All tab contents render the same filtered list */}
          {['all', 'open', 'in_progress', 'in_review', 'closed'].map((key) => (
            <TabsContent key={key} value={key}>
              {renderTaskList()}
            </TabsContent>
          ))}
        </Tabs>

        {/* Add task form */}
        {showAddForm && (
          <form onSubmit={handleAddTask} className="mt-4 border-t border-gray-200 pt-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task title</label>
                <Input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Follow up with John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due date (optional)</label>
                <Input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <Textarea
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={2}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* View all link */}
        <div className="mt-3 flex justify-end">
          <Button variant="link" size="sm" asChild className="text-xs font-medium text-primary hover:text-primary p-0 h-auto no-underline hover:no-underline">
            <Link href="/admin/tasks">View all tasks &rarr;</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
