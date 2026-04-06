const PAYMENT_STATUS_STYLES: Record<string, string> = {
  unverified: 'bg-gray-100 text-gray-900',
  verification_pending: 'bg-amber-50 text-gray-900',
  in_pool: 'bg-emerald-50 text-gray-900',
  match_presented: 'bg-blue-50 text-gray-900',
  awaiting_payment: 'bg-orange-50 text-gray-900',
  active_member: 'bg-green-50 text-gray-900',
  membership_expired: 'bg-gray-100 text-gray-900',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unverified: 'Unverified',
  verification_pending: 'Pending',
  in_pool: 'In Pool',
  match_presented: 'Match Presented',
  awaiting_payment: 'Awaiting Payment',
  active_member: 'Active',
  membership_expired: 'Expired',
};

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-md px-2.5 py-1 text-xs font-medium ${
        PAYMENT_STATUS_STYLES[status] || 'bg-gray-100 text-gray-500'
      }`}
    >
      {PAYMENT_STATUS_LABELS[status] || status}
    </span>
  );
}

export function ConsentBadge({ consent }: { consent: string }) {
  if (consent === 'consented') {
    return (
      <span className="inline-block rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-gray-900">
        Consented
      </span>
    );
  }
  return <span className="text-xs text-gray-400">Not given</span>;
}

export function GooCampusBadge({ isMember }: { isMember: boolean }) {
  if (!isMember) return <span className="text-gray-300">—</span>;
  return (
    <span className="inline-block rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-600">
      GooCampus
    </span>
  );
}

export function BgvBadge({ isComplete, isFlagged }: { isComplete: boolean; isFlagged: boolean }) {
  if (isFlagged) {
    return (
      <span className="inline-block rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">
        Flagged
      </span>
    );
  }
  if (isComplete) {
    return (
      <span className="inline-block rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
        BGV Complete
      </span>
    );
  }
  return null;
}
