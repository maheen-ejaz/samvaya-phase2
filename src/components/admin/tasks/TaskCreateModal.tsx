'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { AdminTask, TaskPriority, TaskCategory } from '@/types/dashboard';

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
      <div className="flex items-center justify-between rounded-lg border border-[#1B4332]/30 bg-[#1B4332]/5 px-3 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-7 w-7 flex-shrink-0 rounded-full bg-[#1B4332]/20 flex items-center justify-center text-xs font-semibold text-[#1B4332] uppercase select-none">
            {selected.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{selected.name}</p>
            <p className="text-xs text-gray-500 truncate">{selected.email ?? 'No email'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="ml-3 flex-shrink-0 rounded p-1 text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
          aria-label="Remove linked applicant"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="6" cy="6" r="4" />
          <path d="M9 9l3 3" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Search by name…"
          className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="animate-spin text-gray-400" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.93 2.93l1.41 1.41M9.66 9.66l1.41 1.41M2.93 11.07l1.41-1.41M9.66 4.34l1.41-1.41" />
            </svg>
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden max-h-48 overflow-y-auto">
          {results.map((a) => (
            <li key={a.userId}>
              <button
                type="button"
                onClick={() => handleSelect(a)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 text-left transition-colors"
              >
                <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 uppercase select-none">
                  {a.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{a.name}</p>
                  {a.email && <p className="text-xs text-gray-500 truncate">{a.email}</p>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg px-3 py-3 text-xs text-gray-500">
          No applicants found for "{query}"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-900">New Task</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
          {/* Title */}
          <div className="px-6 py-4">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Task title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Call Dr. Meera Nair to explain onboarding"
              autoFocus
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30"
            />
          </div>

          {/* Priority + Category row */}
          <div className="grid grid-cols-2 gap-4 px-6 py-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border border-gray-200 pl-3 pr-8 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Type</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full rounded-lg border border-gray-200 pl-3 pr-8 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due date */}
          <div className="px-6 py-4">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Due date (optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30"
            />
          </div>

          {/* Linked applicant — search autocomplete */}
          <div className="px-6 py-4">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Linked applicant (optional)</label>
            <ApplicantSearch
              selected={selectedApplicant}
              onSelect={setSelectedApplicant}
              onClear={() => setSelectedApplicant(null)}
            />
            {selectedApplicant && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                  <p className="text-xs font-medium text-gray-600">{selectedApplicant.phone ?? '—'}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-400 mb-0.5">Email</p>
                  <p className="text-xs font-medium text-gray-600 truncate">{selectedApplicant.email ?? '—'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="px-6 py-4">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30 resize-none"
            />
          </div>

          {error && (
            <div className="px-6 py-2">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#1B4332] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B4332]/90 disabled:opacity-60"
            >
              {submitting ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
