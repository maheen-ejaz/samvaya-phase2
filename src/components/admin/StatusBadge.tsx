import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ShieldCheckIcon, StarIcon } from 'lucide-react';

const PAYMENT_STATUS_STYLES: Record<string, { bg: string; dot: string; text: string }> = {
  unverified:           { bg: 'bg-gray-100',     dot: 'bg-gray-400',    text: 'text-gray-700' },
  verification_pending: { bg: 'bg-amber-50',     dot: 'bg-amber-400',   text: 'text-amber-800' },
  in_pool:              { bg: 'bg-emerald-50',   dot: 'bg-emerald-500', text: 'text-emerald-800' },
  match_presented:      { bg: 'bg-blue-50',      dot: 'bg-blue-500',    text: 'text-blue-800' },
  awaiting_payment:     { bg: 'bg-orange-50',    dot: 'bg-orange-400',  text: 'text-orange-800' },
  active_member:        { bg: 'bg-green-50',     dot: 'bg-green-500',   text: 'text-green-800' },
  membership_expired:   { bg: 'bg-gray-100',     dot: 'bg-gray-400',    text: 'text-gray-600' },
};

export function PaymentStatusBadge({ status }: { status: string }) {
  const style = PAYMENT_STATUS_STYLES[status] || PAYMENT_STATUS_STYLES.unverified;
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Badge variant="outline" className={cn('gap-1.5 border-0 font-medium', style.bg, style.text)}>
      <span className={cn('size-1.5 rounded-full', style.dot)} />
      {label}
    </Badge>
  );
}

export function ConsentBadge({ consent }: { consent: string }) {
  const consented = consent === 'consented' || consent === 'consented_wants_call';
  if (!consented) {
    return <span className="text-xs text-muted-foreground">Not given</span>;
  }
  return (
    <Badge variant="outline" className="gap-1 border-0 bg-emerald-50 text-emerald-800 font-medium">
      Consented
    </Badge>
  );
}

export function GooCampusBadge({ isMember = true }: { isMember?: boolean } = {}) {
  if (!isMember) return null;
  return (
    <Badge variant="outline" className="gap-1 border-0 bg-violet-50 text-violet-700 font-medium">
      <StarIcon className="size-3" />
      GooCampus
    </Badge>
  );
}

export function BgvBadge({ status, isComplete, isFlagged }: { status?: string | null; isComplete?: boolean; isFlagged?: boolean }) {
  // Support both prop styles: { status } or { isComplete, isFlagged }
  const resolvedStatus = status ?? (isFlagged ? 'flagged' : isComplete ? 'complete' : null);
  if (!resolvedStatus) return null;

  if (resolvedStatus === 'flagged') {
    return (
      <Badge variant="outline" className="gap-1 border-0 bg-red-50 text-red-700 font-medium">
        <ShieldCheckIcon className="size-3" />
        Flagged
      </Badge>
    );
  }

  if (resolvedStatus === 'complete') {
    return (
      <Badge variant="outline" className="gap-1 border-0 bg-green-50 text-green-700 font-medium">
        <ShieldCheckIcon className="size-3" />
        Verified
      </Badge>
    );
  }

  return null;
}
