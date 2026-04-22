'use client';

import { useUserStatus } from '@/lib/app/user-context';
import { ContactPaymentCTA } from '@/components/app/ContactPaymentCTA';
import { PRICING } from '@/lib/constants';

interface ProfileRevealProps {
  isMutualInterest: boolean;
  canSeeOriginal: boolean;
  revealData: {
    firstName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  presentationId: string;
}

export function ProfileReveal({
  isMutualInterest,
  canSeeOriginal,
  revealData,
  presentationId,
}: ProfileRevealProps) {
  const { paymentStatus } = useUserStatus();

  // Not mutual interest — nothing to show
  if (!isMutualInterest) return null;

  // Mutual interest but awaiting payment — show congratulations + payment CTA
  if (!canSeeOriginal) {
    return (
      <div className="rounded-xl border-2 border-samvaya-gold bg-gradient-to-b from-samvaya-blush to-white p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-samvaya-gold/20">
          <svg className="h-6 w-6 text-samvaya-gold" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">It&apos;s a Match!</h3>
        <p className="mt-2 text-sm text-gray-600">
          You both expressed interest in each other. Complete your membership to see their full profile,
          including their name, photos, and contact details.
        </p>

        {paymentStatus === 'awaiting_payment' && (
          <div className="mt-4">
            <ContactPaymentCTA amount={PRICING.MEMBERSHIP_FEE_DISPLAY} feeType="membership" />
          </div>
        )}
      </div>
    );
  }

  // Full reveal — show name and contact details
  if (!revealData) return null;

  return (
    <div className="overflow-hidden rounded-xl border-2 border-samvaya-gold">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-samvaya-red to-samvaya-red-light px-6 py-4 text-center text-white">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">
          Meet {revealData.firstName || 'Your Match'}
        </h3>
        <p className="mt-1 text-sm text-white/80">
          Your profiles have been revealed to each other
        </p>
      </div>

      {/* Contact details */}
      <div className="bg-white p-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Contact Details
        </h4>
        <div className="mt-3 space-y-3">
          {revealData.email && (
            <a
              href={`mailto:${revealData.email}`}
              className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-samvaya-blush">
                <svg className="h-4 w-4 text-samvaya-red" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-900">{revealData.email}</p>
              </div>
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </a>
          )}

          {revealData.phone && (
            <a
              href={`tel:${revealData.phone}`}
              className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-samvaya-blush">
                <svg className="h-4 w-4 text-samvaya-red" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400">Phone</p>
                <p className="text-sm font-medium text-gray-900">{revealData.phone}</p>
              </div>
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </a>
          )}

          {!revealData.email && !revealData.phone && (
            <p className="text-sm text-gray-500">
              Contact details will be shared by our team shortly.
            </p>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Our team will also reach out to coordinate your introduction
        </p>
      </div>
    </div>
  );
}
