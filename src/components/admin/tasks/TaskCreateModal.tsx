'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { AdminTask, TaskPriority, TaskCategory } from '@/types/dashboard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';

interface TaskCreateModalProps {
  onClose: () => void;
  onCreated: (task: AdminTask) => void;
}

interface ApplicantResult {
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
}

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
];

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'review', label: 'Review' },
  { value: 'bgv', label: 'BGV' },
  { value: 'payment', label: 'Payment' },
  { value: 'manual', label: 'Manual' },
];

function ApplicantSearch({
  onSelect,
  selected,
  onClear,
}: {
  onSelect: (a: ApplicantResult) => void;
  selected: ApplicantResult | null;
  onClear: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ApplicantResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/applicants/search?q=${encodeURIComponent(val)}`);
        const data = await res.json();
        setResults(data.applicants ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function handleSelect(a: ApplicantResult) {
    onSelect(a);
    setQuery('');
    setResults([]);
    setOpen(false);
  }

  // If an applicant is selected, show the selection card instead of the search input
  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-7 w-7 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary uppercase select-none">
            {selected.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{selected.name}</p>
            <p className="text-xs text-muted-foreground truncate">{selected.email ?? 'No email'}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ml-3 h-7 w-7 flex-shrink-0"
          onClick={onClear}
          aria-label="Remove linked applicant"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4"
          aria-hidden="true"
        />
        <Input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Search by name..."
          className="pl-9"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden max-h-48 overflow-y-auto">
          {results.map((a) => (
            <li key={a.userId}>
              <button
                type="button"
                onClick={() => handleSelect(a)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-accent text-left transition-colors"
              >
                <div className="h-7 w-7 flex-shrink-0 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground uppercase select-none">
                  {a.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                  {a.email && <p className="text-xs text-muted-foreground truncate">{a.email}</p>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg px-3 py-3 text-xs text-muted-foreground">
          No applicants found for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}

export function TaskCreateModal({ onClose, onCreated }: TaskCreateModalProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [category, setCategory] = useState<TaskCategory>('manual');
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) {
        setError('Task title is required.');
        return;
      }
      setSubmitting(true);
      setError(null);

      try {
        const res = await fetch('/api/admin/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            task_type: 'manual',
            task_category: category,
            priority,
            due_date: dueDate || null,
            notes: notes.trim() || null,
            entity_type: selectedApplicant ? 'user' : null,
            entity_id: selectedApplicant?.userId ?? null,
            applicant_name: selectedApplicant?.name ?? null,
            applicant_phone: selectedApplicant?.phone ?? null,
            applicant_email: selectedApplicant?.email ?? null,
            action_href: selectedApplicant ? `/admin/applicants/${selectedApplicant.userId}` : null,
          }),
        });

        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Failed to create task');
        }

        const { task } = await res.json();
        onCreated(task);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create task');
      } finally {
        setSubmitting(false);
      }
    },
    [title, notes, dueDate, priority, category, selectedApplicant, onCreated, onClose]
  );

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label>Task title *</Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Call Dr. Meera Nair to explain onboarding"
              autoFocus
              className="mt-1.5"
            />
          </div>

          {/* Priority + Category row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <Label>Due date (optional)</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1.5"
            />
          </div>

          {/* Linked applicant — search autocomplete */}
          <div>
            <Label>Linked applicant (optional)</Label>
            <div className="mt-1.5">
              <ApplicantSearch
                selected={selectedApplicant}
                onSelect={setSelectedApplicant}
                onClear={() => setSelectedApplicant(null)}
              />
            </div>
            {selectedApplicant && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Card className="bg-muted/50">
                  <CardContent className="py-2 px-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                    <p className="text-xs font-medium text-foreground">{selectedApplicant.phone ?? '—'}</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="py-2 px-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                    <p className="text-xs font-medium text-foreground truncate">{selectedApplicant.email ?? '—'}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context..."
              rows={3}
              className="mt-1.5 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
