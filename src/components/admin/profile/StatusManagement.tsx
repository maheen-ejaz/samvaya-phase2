'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface StatusManagementProps {
  userId: string;
  paymentStatus: string;
  membershipStatus: string;
  bgvConsent: string;
  isGooCampusMember: boolean;
  isBgvComplete: boolean;
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unverified: 'Unverified',
  verification_pending: 'Verification Pending',
  in_pool: 'In Pool',
  match_presented: 'Match Presented',
  awaiting_payment: 'Awaiting Payment',
  active_member: 'Active Member',
  membership_expired: 'Membership Expired',
};

export function StatusManagement({
  userId,
  paymentStatus,
  membershipStatus,
  bgvConsent,
  isGooCampusMember,
  isBgvComplete,
}: StatusManagementProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canMarkFeePaid = paymentStatus === 'unverified' && !isGooCampusMember;
  const canMarkGooCampus = paymentStatus === 'unverified' && isGooCampusMember;
  const canMoveToPool =
    paymentStatus === 'verification_pending' &&
    isBgvComplete;

  const CONFIRM_MESSAGES: Record<string, string> = {
    mark_verification_paid: 'Mark verification fee (₹7,080) as paid? This moves the applicant to verification_pending.',
    mark_goocampus_verified: 'Verify as GooCampus member? This moves them directly to the candidate pool (skips verification).',
    move_to_pool: 'Move to candidate pool? They will be eligible for matching. Ensure BGV is fully complete.',
  };

  async function handleStatusChange(action: string) {
    const confirmMsg = CONFIRM_MESSAGES[action] || `Proceed with: ${action}?`;
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
        setError(data.error || 'Failed to update status');
        return;
      }

      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
        Status Management
      </h3>

      <div className="space-y-3">
        {/* Current Status */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">Payment Status:</span>
          <span className="font-medium text-gray-900">
            {PAYMENT_STATUS_LABELS[paymentStatus] || paymentStatus}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">Membership Status:</span>
          <span className="font-medium text-gray-900">{membershipStatus.replace(/_/g, ' ')}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">BGV Consent:</span>
          <span className="font-medium text-gray-900">{bgvConsent.replace(/_/g, ' ')}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {canMarkFeePaid && (
            <button
              onClick={() => handleStatusChange('mark_verification_paid')}
              disabled={loading}
              className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
            >
              Mark Fee Paid (₹7,080)
            </button>
          )}
          {canMarkGooCampus && (
            <button
              onClick={() => handleStatusChange('mark_goocampus_verified')}
              disabled={loading}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Verify GooCampus → In Pool
            </button>
          )}
          {canMoveToPool && (
            <button
              onClick={() => handleStatusChange('move_to_pool')}
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Move to Pool (BGV Complete)
            </button>
          )}
        </div>

        {/* BGV prerequisite warning */}
        {paymentStatus === 'verification_pending' && !isBgvComplete && (
          <p className="text-xs text-amber-600">
            BGV must be complete before moving to pool.
            {bgvConsent === 'not_given' && ' (Consent not yet given)'}
            {bgvConsent === 'consented_wants_call' && ' (Wants call first)'}
          </p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
