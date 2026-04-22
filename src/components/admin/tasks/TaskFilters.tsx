'use client';

import type { TaskStatus, TaskPriority, TaskCategory } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LayoutGrid, Eye } from 'lucide-react';

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
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
        <LayoutGrid className="h-3 w-3" />
        Group: Status
      </span>

      {/* Priority filter */}
      <Select
        value={filterPriority}
        onValueChange={(v) => onPriorityChange(v as TaskPriority | 'all')}
      >
        <SelectTrigger className="w-[140px] h-8 text-xs" aria-label="Filter by priority">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRIORITY_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category / Type filter */}
      <Select
        value={filterCategory}
        onValueChange={(v) => onCategoryChange(v as TaskCategory | 'all')}
      >
        <SelectTrigger className="w-[130px] h-8 text-xs" aria-label="Filter by type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Show closed toggle */}
      <div className="flex items-center gap-2">
        <Switch
          id="show-closed"
          checked={showClosed}
          onCheckedChange={onShowClosedChange}
        />
        <Label htmlFor="show-closed" className="text-xs text-muted-foreground cursor-pointer">
          Show closed
        </Label>
      </div>
    </div>
  );
}
