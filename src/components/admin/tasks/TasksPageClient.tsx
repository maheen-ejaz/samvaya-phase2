'use client';

import { useState, useMemo, useCallback } from 'react';
import type { AdminTask, TaskStatus, TaskPriority, TaskCategory } from '@/types/dashboard';
import { TaskGroupSection } from './TaskGroupSection';
import { TaskFilters } from './TaskFilters';
import { TaskCreateModal } from './TaskCreateModal';
import { DonutChart, DONUT_COLORS } from '@/components/admin/analytics/DonutChart';
import { DonutLegend } from '@/components/admin/analytics/DonutLegend';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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
      toast.success('Status updated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      toast.error(err instanceof Error ? err.message : 'Failed to update task');
      // Revert
      setTasks(initialTasks);
    }
  }, [initialTasks]);

  const handleTaskCreated = useCallback((task: AdminTask) => {
    setTasks((prev) => [task, ...prev]);
    toast.success('Task created');
  }, []);

  const visibleStatuses = showClosed ? STATUS_ORDER : STATUS_ORDER.filter((s) => s !== 'closed');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {counts.open + counts.in_progress + counts.in_review} active
            {counts.closed > 0 && ` · ${counts.closed} closed`}
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
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
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Status summary donut */}
      {(counts.open + counts.in_progress + counts.in_review + counts.closed) > 0 && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Task Status Overview</p>
            <div className="flex items-center gap-5">
              <DonutChart
                data={[
                  { label: 'Open', count: counts.open, color: DONUT_COLORS[3] },
                  { label: 'In Progress', count: counts.in_progress, color: DONUT_COLORS[0] },
                  { label: 'In Review', count: counts.in_review, color: DONUT_COLORS[1] },
                  { label: 'Closed', count: counts.closed, color: DONUT_COLORS[2] },
                ]}
                size={90}
                strokeWidth={14}
              />
              <DonutLegend
                data={[
                  { label: 'Open', count: counts.open, color: DONUT_COLORS[3] },
                  { label: 'In Progress', count: counts.in_progress, color: DONUT_COLORS[0] },
                  { label: 'In Review', count: counts.in_review, color: DONUT_COLORS[1] },
                  { label: 'Closed', count: counts.closed, color: DONUT_COLORS[2] },
                ]}
                total={counts.open + counts.in_progress + counts.in_review + counts.closed}
                maxItems={4}
              />
            </div>
          </CardContent>
        </Card>
      )}

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
