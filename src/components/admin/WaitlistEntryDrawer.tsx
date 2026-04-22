'use client';

import { capitalize } from '@/lib/utils';
import type { WaitlistEntry } from './WaitlistTable';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

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
      <p className="mt-0.5 text-sm text-gray-900">{value || '\u2014'}</p>
    </div>
  );
}

export function WaitlistEntryDrawer({ entry, onClose }: WaitlistEntryDrawerProps) {
  const style = STATUS_STYLES[entry.status] || { bg: 'bg-gray-100', dot: 'bg-gray-400', text: 'text-gray-600' };
  const label = entry.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const joinedDate = entry.createdAt
    ? new Date(entry.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '\u2014';

  return (
    <Sheet open onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-96 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{entry.fullName}</SheetTitle>
          <SheetDescription className="sr-only">Waitlist entry details</SheetDescription>
          <span className={`mt-1.5 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {label}
          </span>
        </SheetHeader>

        <Separator />

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          <div className="grid grid-cols-1 gap-5">
            <Field label="Email" value={entry.email} />
            <Field label="Phone" value={entry.phone} />
            <Field label="Specialty" value={entry.specialty ? capitalize(entry.specialty) : ''} />
            <Field label="City" value={entry.city ? capitalize(entry.city) : ''} />
            <Field label="Joined waitlist" value={joinedDate} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
