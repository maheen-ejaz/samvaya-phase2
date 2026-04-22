'use client';

import { useEffect, useState } from 'react';
import { useForm } from '../FormProvider';
import { Badge } from '@/components/ui/badge';
import { LoaderIcon } from 'lucide-react';

export function SaveStatusBadge() {
  const { state, flushNow } = useForm();
  const [, setTick] = useState(0);
  const [savedKey, setSavedKey] = useState(0);
  const [prevStatus, setPrevStatus] = useState(state.saveStatus);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (state.saveStatus === 'saved' && prevStatus !== 'saved') {
      setSavedKey((k) => k + 1);
    }
    setPrevStatus(state.saveStatus);
  }, [state.saveStatus, prevStatus]);

  if (state.saveStatus === 'saving') {
    return (
      <Badge variant="secondary" className="gap-1.5 text-xs font-normal">
        <LoaderIcon className="size-3 animate-spin" />
        Saving…
      </Badge>
    );
  }

  if (state.saveStatus === 'error') {
    return (
      <Badge variant="destructive" className="gap-1.5 text-xs font-normal">
        <span className="size-1.5 rounded-full bg-current" />
        Save failed
        <button
          type="button"
          onClick={() => void flushNow()}
          className="underline underline-offset-2 hover:no-underline"
        >
          Retry
        </button>
      </Badge>
    );
  }

  if (state.saveStatus === 'saved' && state.lastSavedAt) {
    return (
      <Badge key={savedKey} variant="outline" className="gap-1.5 text-xs font-normal text-muted-foreground">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Saved {formatTimeAgo(state.lastSavedAt)}
      </Badge>
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
