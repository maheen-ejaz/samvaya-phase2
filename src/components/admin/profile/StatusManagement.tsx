'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';
import { PRICING } from '@/lib/constants';
import { formatEnum } from './IdentitySnapshot';

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

  async function saveCustomPricing() {
    setSavingPricing(true);
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
        toast.success('Pricing saved successfully');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save pricing');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSavingPricing(false);
    }
  }

  const canMarkFeePaid = paymentStatus === 'unverified' && !isGooCampusMember;
  const canMarkGooCampus = paymentStatus === 'unverified' && isGooCampusMember;
  const canMoveToPool =
    paymentStatus === 'verification_pending' &&
    isBgvComplete;

  const CONFIRM_MESSAGES: Record<string, { title: string; description: string }> = {
    mark_verification_paid: {
      title: 'Mark verification fee as paid?',
      description: `This will mark the verification fee (${PRICING.VERIFICATION_FEE_DISPLAY}) as paid and move the applicant to verification_pending status.`,
    },
    mark_goocampus_verified: {
      title: 'Verify as GooCampus member?',
      description: 'This moves them directly to the candidate pool (skips verification fee).',
    },
    move_to_pool: {
      title: 'Move to candidate pool?',
      description: 'They will be eligible for matching. Ensure BGV is fully complete.',
    },
  };

  async function handleStatusChange(action: string) {
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
        toast.error(data.error || 'Failed to update status');
        return;
      }

      toast.success('Status updated successfully');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function renderActionButton(action: string, label: string, variant: 'default' | 'destructive' | 'secondary' = 'default') {
    const confirm = CONFIRM_MESSAGES[action];
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant={variant} disabled={loading}>
            {label}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.title || `Proceed with ${action}?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.description || 'This action will update the applicant status.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleStatusChange(action)}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Settings className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-foreground">Status Management</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Current Status */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Payment Status:</span>
            <span className="font-medium text-foreground">
              {PAYMENT_STATUS_LABELS[paymentStatus] || paymentStatus}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Membership Status:</span>
            <span className="font-medium text-foreground">{formatEnum(membershipStatus)}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">BGV Consent:</span>
            <span className="font-medium text-foreground">{formatEnum(bgvConsent)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {canMarkFeePaid && renderActionButton('mark_verification_paid', `Mark Fee Paid (${PRICING.VERIFICATION_FEE_DISPLAY})`)}
            {canMarkGooCampus && renderActionButton('mark_goocampus_verified', 'Verify GooCampus → In Pool', 'secondary')}
            {canMoveToPool && renderActionButton('move_to_pool', 'Move to Pool (BGV Complete)', 'secondary')}
          </div>

          {/* BGV prerequisite warning */}
          {paymentStatus === 'verification_pending' && !isBgvComplete && (
            <p className="text-xs text-amber-600">
              BGV must be complete before moving to pool.
              {bgvConsent === 'not_given' && ' (Consent not yet given)'}
              {bgvConsent === 'consented_wants_call' && ' (Wants call first)'}
            </p>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Custom Pricing */}
          <Separator className="my-4" />
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pricing Override</h4>
            <div className="mt-2 flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isComplementary}
                  onChange={(e) => {
                    setIsComplementary(e.target.checked);
                    if (e.target.checked) setCustomAmount('0');
                  }}
                  className="rounded border-border"
                />
                Complementary (₹0)
              </label>
              {!isComplementary && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Custom amount:</span>
                  <Input
                    type="text"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder={PRICING.VERIFICATION_FEE_DISPLAY}
                    className="w-32"
                  />
                </div>
              )}
              <Button
                onClick={saveCustomPricing}
                disabled={savingPricing}
                variant="default"
                size="sm"
              >
                {savingPricing ? 'Saving...' : 'Save Pricing'}
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Standard fee: {PRICING.VERIFICATION_FEE_DISPLAY}. Override only if this applicant has a special arrangement.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
