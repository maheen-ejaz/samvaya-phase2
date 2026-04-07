'use client';

import { useEffect } from 'react';
import { capitalize } from '@/lib/utils';
import type { WaitlistEntry } from './WaitlistTable';

interface WaitlistEntryDrawerProps {
  entry: WaitlistEntry;
  onClose: () => void;
}

const STATUS_STYLES: Record<string, { bg: string; dot: string; text: string }> = {
  pending:   { bg: 'bg-amber-50',  dot: 'bg-amber-400',  text: 'text-amber-800' },
  invited:   { bg: 'bg-blue-50',   dot: 'bg-blue-500',   text: 'text-blue-800' },
  signed_up: { bg: 'bg-green-50',  dot: 'bg-green-500',  text: 'text-green-800' },
  rejected:  { bg: 'bg-red-50',    dot: 'bg-red-500',    text: 'text-red-800' },
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="mt-0.5 text-sm text-gray-900">{value || '—'}</p>
    </div>
  );
}

export function WaitlistEntryDrawer({ entry, onClose }: WaitlistEntryDrawerProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const style = STATUS_STYLES[entry.status] || { bg: 'bg-gray-100', dot: 'bg-gray-400', text: 'text-gray-600' };
  const label = entry.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const joinedDate = entry.createdAt
    ? new Date(entry.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-96 flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{entry.fullName}</h2>
            <span className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
              {label}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-5">
            <Field label="Email" value={entry.email} />
            <Field label="Phone" value={entry.phone} />
            <Field label="Specialty" value={entry.specialty ? capitalize(entry.specialty) : ''} />
            <Field label="City" value={entry.city ? capitalize(entry.city) : ''} />
            <Field label="Joined waitlist" value={joinedDate} />
          </div>
        </div>
      </div>
    </>
  );
}
