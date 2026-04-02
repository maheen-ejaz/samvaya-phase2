'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRICING } from '@/lib/constants';

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

  // Custom pricing
  const [isComplementary, setIsComplementary] = useState(isGooCampusMember);
  const [customAmount, setCustomAmount] = useState('');
  const [savingPricing, setSavingPricing] = useState(false);
  const [pricingSaved, setPricingSaved] = useState(false);

  async function saveCustomPricing() {
    setSavingPricing(true);
    setPricingSaved(false);
    try {
      const amount = isComplementary ? 0 : parseInt(customAmount || '0', 10);
      const res = await fetch(`/api/admin/applicants/${userId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_custom_pricing',
          customAmount: amount,
          isComplementary,
        }),
      });
      if (res.ok) {
        setPricingSaved(true);
        setTimeout(() => setPricingSaved(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save pricing');
      }
    } catch {
      setError('Network error');
    } finally {
      setSavingPricing(false);
    }
  }

  const canMarkFeePaid = paymentStatus === 'unverified' && !isGooCampusMember;
  const canMarkGooCampus = paymentStatus === 'unverified' && isGooCampusMember;
  const canMoveToPool =
    paymentStatus === 'verification_pending' &&
    isBgvComplete;

  const CONFIRM_MESSAGES: Record<string, string> = {
    mark_verification_paid: `Mark verification fee (${PRICING.VERIFICATION_FEE_DISPLAY}) as paid? This moves the applicant to verification_pending.`,
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
      <h3 className="mb-4 text-lg font-medium text-gray-900">
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
              Mark Fee Paid ({PRICING.VERIFICATION_FEE_DISPLAY})
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

        {/* Custom Pricing */}
        <div className="mt-4 border-t border-gray-100 pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pricing Override</h4>
          <div className="mt-2 flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isComplementary}
                onChange={(e) => {
                  setIsComplementary(e.target.checked);
                  if (e.target.checked) setCustomAmount('0');
                }}
                className="rounded border-gray-300"
              />
              Complementary (₹0)
            </label>
            {!isComplementary && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Custom amount:</span>
                <input
                  type="text"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder={PRICING.VERIFICATION_FEE_DISPLAY}
                  className="w-32 rounded border border-gray-300 px-2 py-1 text-sm"
                />
              </div>
            )}
            <button
              onClick={saveCustomPricing}
              disabled={savingPricing}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
            >
              {savingPricing ? 'Saving...' : 'Save Pricing'}
            </button>
            {pricingSaved && <span className="text-xs text-green-600">Saved</span>}
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Standard fee: {PRICING.VERIFICATION_FEE_DISPLAY}. Override only if this applicant has a special arrangement.
          </p>
        </div>
      </div>
    </div>
  );
}
