'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatDateIN } from '@/lib/utils';

interface UserSummary {
  name: string | null;
  age: number | null;
  gender: string | null;
  specialty: string[];
  religion: string | null;
  location: string | null;
  registrationDate: string;
  paymentStatus: string;
  formProgress: number;
  isGoocampusMember: boolean;
  bgvStatus: boolean;
  membershipStatus: string;
  photoUrl: string | null;
}

interface RecipientProfileDrawerProps {
  userId: string;
  onClose: () => void;
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

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  unverified: 'bg-gray-100 text-gray-700',
  verification_pending: 'bg-yellow-100 text-yellow-800',
  in_pool: 'bg-blue-100 text-blue-800',
  match_presented: 'bg-purple-100 text-purple-800',
  awaiting_payment: 'bg-orange-100 text-orange-800',
  active_member: 'bg-admin-green-100 text-admin-green-900',
  membership_expired: 'bg-red-100 text-red-800',
};

export function RecipientProfileDrawer({ userId, onClose }: RecipientProfileDrawerProps) {
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailState, setEmailState] = useState<{ open: boolean; subject: string; body: string }>({
    open: false, subject: '', body: '',
  });
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setLoading(true);
    setSummary(null);
    fetch(`/api/admin/users/${userId}/summary`)
      .then((r) => r.json())
      .then((data) => setSummary(data))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [userId]);

  async function handleSendEmail() {
    if (!emailState.subject.trim() || !emailState.body.trim()) return;
    setEmailSending(true);
    setEmailError(null);
    try {
      const res = await fetch(`/api/admin/applicants/${userId}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: emailState.subject, body: emailState.body }),
      });
      if (!res.ok) {
        const d = await res.json();
        setEmailError(d.error || 'Failed to send email.');
      } else {
        setEmailSuccess(true);
        setEmailState({ open: false, subject: '', body: '' });
        setTimeout(() => setEmailSuccess(false), 3000);
      }
    } catch {
      setEmailError('Network error. Please try again.');
    } finally {
      setEmailSending(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-[420px] flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div className="flex items-center gap-4">
            {/* Photo */}
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
              {summary?.photoUrl ? (
                <Image
                  src={summary.photoUrl}
                  alt={summary.name || 'Profile photo'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-gray-400">
                  {summary?.name?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>

            {/* Name + specialty */}
            <div>
              {loading ? (
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
              ) : (
                <h2 className="text-base font-semibold text-gray-900">{summary?.name || 'Unknown'}</h2>
              )}
              {summary?.specialty && summary.specialty.length > 0 && (
                <p className="mt-0.5 text-sm text-gray-500">{summary.specialty.join(', ')}</p>
              )}
              {summary?.isGoocampusMember && (
                <span className="mt-1 inline-block rounded-full bg-admin-green-100 px-2 py-0.5 text-xs font-medium text-admin-green-800">
                  GooCampus
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-gray-100" style={{ width: `${60 + (i % 3) * 15}%` }} />
              ))}
            </div>
          ) : !summary ? (
            <p className="text-sm text-gray-400">Could not load profile data.</p>
          ) : (
            <>
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <InfoItem label="Age" value={summary.age ? `${summary.age} yrs` : null} />
                <InfoItem label="Gender" value={summary.gender ? capitalize(summary.gender) : null} />
                <InfoItem label="Location" value={summary.location} />
                <InfoItem label="Religion" value={summary.religion ? capitalize(summary.religion) : null} />
                <InfoItem label="Registered" value={formatDateIN(summary.registrationDate)} />
                <InfoItem label="BGV" value={summary.bgvStatus ? 'Complete' : 'Pending'} valueClass={summary.bgvStatus ? 'text-admin-green-700' : 'text-yellow-700'} />
              </div>

              {/* Payment status */}
              <div>
                <p className="type-label text-gray-500 mb-1.5">Payment Status</p>
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${PAYMENT_STATUS_COLORS[summary.paymentStatus] || 'bg-gray-100 text-gray-700'}`}>
                  {PAYMENT_STATUS_LABELS[summary.paymentStatus] || capitalize(summary.paymentStatus)}
                </span>
              </div>

              {/* Form progress */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="type-label text-gray-500">Form Progress</p>
                  <span className="text-xs font-medium text-gray-700">{summary.formProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-admin-green-600 transition-all"
                    style={{ width: `${summary.formProgress}%` }}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Actions */}
              <div className="space-y-3">
                <p className="type-label text-gray-500">Actions</p>

                {emailSuccess && (
                  <p className="rounded-lg bg-admin-green-50 px-3 py-2 text-sm text-admin-green-800">
                    Email sent successfully.
                  </p>
                )}

                {!emailState.open ? (
                  <button
                    onClick={() => setEmailState((s) => ({ ...s, open: true }))}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Send Email
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Subject"
                      value={emailState.subject}
                      onChange={(e) => setEmailState((s) => ({ ...s, subject: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-admin-green-500 focus:ring-1 focus:ring-admin-green-500"
                    />
                    <textarea
                      placeholder="Message..."
                      value={emailState.body}
                      onChange={(e) => setEmailState((s) => ({ ...s, body: e.target.value }))}
                      rows={4}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-admin-green-500 focus:ring-1 focus:ring-admin-green-500 resize-none"
                    />
                    {emailError && <p className="text-xs text-red-600">{emailError}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={handleSendEmail}
                        disabled={emailSending || !emailState.subject.trim() || !emailState.body.trim()}
                        className="flex-1 rounded-lg bg-admin-green-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-admin-green-800 disabled:opacity-50"
                      >
                        {emailSending ? 'Sending…' : 'Send'}
                      </button>
                      <button
                        onClick={() => setEmailState({ open: false, subject: '', body: '' })}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <a
                  href={`/admin/applicants/${userId}`}
                  className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  View Full Profile →
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function InfoItem({ label, value, valueClass }: { label: string; value: string | null | undefined; valueClass?: string }) {
  return (
    <div>
      <p className="type-label text-gray-500">{label}</p>
      <p className={`mt-0.5 text-sm font-medium text-gray-900 ${valueClass ?? ''}`}>
        {value || <span className="font-normal text-gray-400">—</span>}
      </p>
    </div>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}
