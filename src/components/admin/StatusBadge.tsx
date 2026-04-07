const PAYMENT_STATUS_STYLES: Record<string, { bg: string; dot: string; text: string }> = {
  unverified:           { bg: 'bg-gray-100',     dot: 'bg-gray-400',    text: 'text-gray-700' },
  verification_pending: { bg: 'bg-amber-50',     dot: 'bg-amber-400',   text: 'text-amber-800' },
  in_pool:              { bg: 'bg-emerald-50',   dot: 'bg-emerald-500', text: 'text-emerald-800' },
  match_presented:      { bg: 'bg-blue-50',      dot: 'bg-blue-500',    text: 'text-blue-800' },
  awaiting_payment:     { bg: 'bg-orange-50',    dot: 'bg-orange-400',  text: 'text-orange-800' },
  active_member:        { bg: 'bg-green-50',     dot: 'bg-green-500',   text: 'text-green-800' },
  membership_expired:   { bg: 'bg-gray-100',     dot: 'bg-gray-400',    text: 'text-gray-600' },
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unverified:           'Unverified',
  verification_pending: 'Pending',
  in_pool:              'In Pool',
  match_presented:      'Match Presented',
  awaiting_payment:     'Awaiting Payment',
  active_member:        'Active',
  membership_expired:   'Expired',
};

export function PaymentStatusBadge({ status }: { status: string }) {
  const style = PAYMENT_STATUS_STYLES[status] || { bg: 'bg-gray-100', dot: 'bg-gray-400', text: 'text-gray-600' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {PAYMENT_STATUS_LABELS[status] || status}
    </span>
  );
}

export function ConsentBadge({ consent }: { consent: string }) {
  if (consent === 'consented') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Consented
      </span>
    );
  }
  return <span className="text-xs text-gray-400">Not given</span>;
}

export function GooCampusBadge({ isMember }: { isMember: boolean }) {
  if (!isMember) return <span className="text-gray-300">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
      <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
      GooCampus
    </span>
  );
}

export function BgvBadge({ isComplete, isFlagged }: { isComplete: boolean; isFlagged: boolean }) {
  if (isFlagged) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Flagged
      </span>
    );
  }
  if (isComplete) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        BGV Complete
      </span>
    );
  }
  return null;
}
