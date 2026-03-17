const PAYMENT_STATUS_STYLES: Record<string, string> = {
  unverified: 'bg-gray-100 text-gray-700',
  verification_pending: 'bg-yellow-100 text-yellow-800',
  in_pool: 'bg-green-100 text-green-800',
  match_presented: 'bg-blue-100 text-blue-800',
  awaiting_payment: 'bg-orange-100 text-orange-800',
  active_member: 'bg-emerald-100 text-emerald-800',
  membership_expired: 'bg-gray-100 text-gray-600',
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
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
        PAYMENT_STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {PAYMENT_STATUS_LABELS[status] || status}
    </span>
  );
}

export function ConsentBadge({ consent }: { consent: string }) {
  if (consent === 'consented') {
    return <span className="text-xs font-medium text-green-700">Consented</span>;
  }
  return <span className="text-xs text-gray-400">Not given</span>;
}

export function GooCampusBadge({ isMember }: { isMember: boolean }) {
  if (!isMember) return <span className="text-gray-400">—</span>;
  return (
    <span className="inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
      GooCampus
    </span>
  );
}

export function BgvBadge({ isComplete, isFlagged }: { isComplete: boolean; isFlagged: boolean }) {
  if (isFlagged) {
    return (
      <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
        Flagged
      </span>
    );
  }
  if (isComplete) {
    return (
      <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
        BGV Complete
      </span>
    );
  }
  return null;
}
