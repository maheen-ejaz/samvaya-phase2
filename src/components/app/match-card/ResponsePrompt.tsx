'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUserStatus } from '@/lib/app/user-context';
import { ContactPaymentCTA } from '@/components/app/ContactPaymentCTA';
import { PRICING } from '@/lib/constants';

interface ResponsePromptProps {
  presentationId: string;
  myResponse: string;
  isMutualInterest: boolean;
  expiresAt: string;
  status: string;
  onResponseRecorded: () => void;
}

export function ResponsePrompt({
  presentationId,
  myResponse,
  isMutualInterest,
  expiresAt,
  status,
  onResponseRecorded,
}: ResponsePromptProps) {
  const { paymentStatus } = useUserStatus();
  const [confirming, setConfirming] = useState<'interested' | 'not_interested' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap + keyboard handling for confirmation dialog
  useEffect(() => {
    if (!confirming) return;

    // Store previous focus to restore later
    previousFocusRef.current = document.activeElement as HTMLElement;
    // Focus the confirm button when dialog opens
    confirmBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        setConfirming(null);
        previousFocusRef.current?.focus();
        return;
      }

      // Focus trap within dialog
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [confirming, submitting]);

  // Restore focus when dialog closes
  const closeDialog = useCallback(() => {
    setConfirming(null);
    previousFocusRef.current?.focus();
  }, []);

  // Already responded — show status
  if (myResponse !== 'pending') {
    if (isMutualInterest) {
      return (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <h4 className="text-sm font-semibold text-green-800">Mutual Interest!</h4>
          <p className="mt-2 text-sm text-green-700">
            You both expressed interest in each other. Our team will be in touch to arrange the next steps.
          </p>
          {paymentStatus === 'awaiting_payment' && (
            <div className="mt-4">
              <ContactPaymentCTA amount={PRICING.MEMBERSHIP_FEE_DISPLAY} feeType="membership" />
            </div>
          )}
          <a
            href={`/app/matches/${presentationId}/feedback`}
            className="mt-4 block text-center text-xs text-green-600 hover:text-green-700"
          >
            Leave feedback about this match
          </a>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-600">
          You responded: <strong>{myResponse === 'interested' ? 'Interested' : 'Not Interested'}</strong>
        </p>
        <a
          href={`/app/matches/${presentationId}/feedback`}
          className="mt-3 block text-center text-xs text-gray-500 hover:text-gray-700"
        >
          Leave feedback about this match
        </a>
      </div>
    );
  }

  // Expired
  if (status === 'expired') {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <p className="text-sm text-gray-500">This match has expired.</p>
      </div>
    );
  }

  // Countdown
  const diff = new Date(expiresAt).getTime() - Date.now();
  const daysLeft = diff > 0 ? Math.ceil(diff / (24 * 60 * 60 * 1000)) : 0;

  const handleSubmit = async (response: 'interested' | 'not_interested') => {
    if (submitting) return; // Prevent double-submit
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/app/matches/${presentationId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit response');
      }
      setConfirming(null);
      onResponseRecorded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h4 className="text-sm font-semibold text-gray-900">What Do You Think?</h4>

      {daysLeft === 0 && (
        <p className="mt-1 text-xs text-red-500">
          Expiring today
        </p>
      )}
      {daysLeft > 0 && (
        <p className={`mt-1 text-xs ${daysLeft <= 2 ? 'text-red-500' : 'text-gray-400'}`}>
          {daysLeft} day{daysLeft !== 1 ? 's' : ''} left to respond
        </p>
      )}

      {error && (
        <div className="mt-2 rounded-md bg-red-50 p-2 text-xs text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* Confirmation dialog */}
      {confirming ? (
        <div
          ref={dialogRef}
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirm your response"
          aria-describedby="confirm-description"
          className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
        >
          <p className="text-sm font-medium text-gray-900">
            Are you sure? This cannot be changed.
          </p>
          <p id="confirm-description" className="mt-1 text-xs text-gray-500">
            You&apos;re about to respond: <strong>{confirming === 'interested' ? "I'm interested" : 'Not for me'}</strong>
          </p>
          <div className="mt-3 flex gap-2">
            <button
              ref={confirmBtnRef}
              onClick={() => handleSubmit(confirming)}
              disabled={submitting}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50 ${
                confirming === 'interested'
                  ? 'bg-samvaya-red hover:bg-samvaya-red-dark'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {submitting ? 'Submitting...' : 'Confirm'}
            </button>
            <button
              onClick={closeDialog}
              disabled={submitting}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Go Back
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => setConfirming('interested')}
            disabled={submitting}
            className="form-btn-primary flex-1"
          >
            I&apos;m Interested
          </button>
          <button
            onClick={() => setConfirming('not_interested')}
            disabled={submitting}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Not for Me
          </button>
        </div>
      )}
    </div>
  );
}
