'use client';

import { useEffect, useState } from 'react';
import { useForm } from '../FormProvider';

/**
 * Subtle save indicator. Sits in the header corner. Updates as the auto-save
 * engine reports state changes. The "Saved · just now" timestamp ticks every
 * 30 seconds while a recent save exists. lastSavedAt comes from FormState
 * (set by the reducer when status transitions to 'saved').
 */
export function SaveStatusBadge() {
  const { state } = useForm();
  const [, setTick] = useState(0);

  // Tick every 30s so the relative timestamp ("just now" → "1m ago") refreshes.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  if (state.saveStatus === 'saving') {
    return (
      <span className="form-caption flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-pulse-soft" />
        Saving…
      </span>
    );
  }

  if (state.saveStatus === 'error') {
    return (
      <span className="form-caption flex items-center gap-1.5 text-[color:var(--color-form-error)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-form-error)]" />
        Save failed
      </span>
    );
  }

  if (state.saveStatus === 'saved' && state.lastSavedAt) {
    return (
      <span className="form-caption flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-form-success)]" />
        Saved {formatTimeAgo(state.lastSavedAt)}
      </span>
    );
  }

  return null;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 30) return '· just now';
  if (seconds < 60) return `· ${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `· ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `· ${hours}h ago`;
}
