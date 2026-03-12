'use client';

/**
 * Post-submission screen — TOUCHPOINT 1 in-app copy from PRD v9.0 lines 1436–1450.
 * Shown after the applicant submits the complete onboarding form.
 * CTA button is non-functional in v1 (no Razorpay) — just displays the amount.
 */
export function CompletionScreen() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* Success badge */}
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
      </div>

      <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
        Application submitted
      </h1>
      <p className="mb-8 text-center text-sm text-gray-500">
        Thank you for completing your Samvaya profile.
      </p>

      {/* TOUCHPOINT 1 content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          One last step before we get started.
        </h2>

        <p className="mb-4 text-sm leading-relaxed text-gray-700">
          Before we add you to our candidate pool, we carry out a comprehensive background
          verification &mdash; the same check that every single Samvaya member goes through.
          This covers your identity, education, employment history, address, financial standing,
          and court and criminal records.
        </p>

        <p className="mb-6 text-sm leading-relaxed text-gray-700">
          We do this because every person you could potentially be matched with has been through
          this same process. It&rsquo;s how we make sure Samvaya is a pool of verified, genuine
          applicants &mdash; and nothing less.
        </p>

        {/* Fee callout */}
        <div className="mb-6 rounded-lg bg-rose-50 p-4">
          <p className="text-sm font-semibold text-gray-900">
            Verification fee: &#8377;6,000 + GST (&#8377;7,080 total)
          </p>
          <p className="mt-1 text-xs text-gray-600">
            This is a one-time, non-refundable fee. Work begins as soon as your payment is confirmed.
          </p>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-gray-700">
          <span className="font-medium">What happens next:</span>{' '}
          Once verification is complete (typically 7&ndash;10 working days), your profile enters
          our candidate pool and our matching process begins. You don&rsquo;t need to do anything
          &mdash; we&rsquo;ll be in touch when we have a compatible match for you.
        </p>

        {/* CTA button — non-functional in v1 */}
        <button
          disabled
          className="w-full rounded-lg bg-rose-600 py-3 text-sm font-medium text-white opacity-60 cursor-not-allowed"
          aria-label="Payment will be enabled soon"
        >
          Pay &#8377;7,080 and complete verification
        </button>
        <p className="mt-2 text-center text-xs text-gray-500">
          Our team will reach out with payment details shortly.
        </p>

        {/* GooCampus note */}
        <p className="mt-6 text-xs leading-relaxed text-gray-500 italic">
          If you have already completed verification through GooCampus, this step is not required
          for you.
        </p>
      </div>
    </div>
  );
}
