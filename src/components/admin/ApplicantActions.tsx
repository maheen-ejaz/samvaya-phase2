'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentStatusBadge } from './StatusBadge';

interface ApplicantActionsProps {
  userId: string;
  paymentStatus: string;
  bgvConsent: string;
  isGooCampusMember: boolean;
}

export function ApplicantActions({
  userId,
  paymentStatus,
  bgvConsent,
  isGooCampusMember,
}: ApplicantActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(action: 'mark_verification_paid' | 'mark_goocampus_verified') {
    const confirmMsg =
      action === 'mark_verification_paid'
        ? 'Mark verification fee (\u20B93,500 + GST) as paid for this applicant?'
        : 'Move this GooCampus member directly to the candidate pool?';

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/applicants/${userId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'An error occurred');
        return;
      }

      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Already processed — show read-only badge
  if (paymentStatus !== 'unverified') {
    return <PaymentStatusBadge status={paymentStatus} />;
  }

  // BGV consent warning
  const consentMissing = bgvConsent === 'not_given' || bgvConsent === 'refused';

  return (
    <div className="flex flex-col gap-2">
      {isGooCampusMember ? (
        <button
          onClick={() => handleAction('mark_goocampus_verified')}
          disabled={loading}
          className="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs text-gray-900 hover:border-gray-300 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? 'Processing…' : 'Verify GooCampus'}
        </button>
      ) : (
        <button
          onClick={() => handleAction('mark_verification_paid')}
          disabled={loading}
          className="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs text-gray-900 hover:border-gray-300 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? 'Processing…' : 'Mark Fee Paid (\u20B93,500 + GST)'}
        </button>
      )}

      {consentMissing && (
        <p className="text-xs text-amber-600">
          BGV consent: {bgvConsent === 'refused' ? 'refused' : 'not yet given'}
        </p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
