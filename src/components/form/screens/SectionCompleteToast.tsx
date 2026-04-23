'use client';

import { useEffect, useState } from 'react';
import { CheckIcon } from 'lucide-react';

const STORAGE_KEY = 'samvaya_section_complete_toast';

export interface SectionCompletePayload {
  label: string;
  position: number;
  total: number;
}

export function setSectionCompleteToast(payload: SectionCompletePayload) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore quota or privacy-mode errors — toast is purely cosmetic.
  }
}

function readPayload(): SectionCompletePayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.label === 'string' &&
      typeof parsed.position === 'number' &&
      typeof parsed.total === 'number'
    ) {
      return parsed;
    }
  } catch {
    // Malformed payload — ignore.
  }
  return null;
}

export function SectionCompleteToast() {
  const [payload, setPayload] = useState<SectionCompletePayload | null>(null);

  useEffect(() => {
    setPayload(readPayload());
  }, []);

  if (!payload) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-md items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  const progressPct = Math.round((payload.position / payload.total) * 100);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-toast-pop">
        <CheckIcon className="size-7" strokeWidth={2.5} />
      </div>
      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Section {payload.position} of {payload.total} complete
      </p>
      <h2 className="form-title mb-6 text-2xl">{payload.label}</h2>
      <div className="w-full max-w-xs">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/50">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{progressPct}% done</p>
      </div>
    </div>
  );
}
