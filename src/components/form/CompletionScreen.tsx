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

      <h1 className="mb-2 text-center type-heading-xl text-gray-900">
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

        {/* Payment CTA — v1 uses WhatsApp/contact, not Razorpay */}
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-center">
          <p className="text-sm font-medium text-gray-900">
            Ready to pay &#8377;7,080?
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Our team will reach out shortly, or you can contact us directly.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919742811599'}?text=${encodeURIComponent('Hi, I have completed my Samvaya profile and would like to proceed with the verification fee payment of ₹7,080.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-samvaya-red px-5 py-2.5 text-sm font-medium text-white hover:bg-samvaya-red-dark transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .611.611l4.458-1.495A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.594-.838-6.318-2.236l-.44-.362-3.122 1.046 1.046-3.122-.362-.44A9.958 9.958 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
            </svg>
            Contact us on WhatsApp
          </a>
        </div>

        {/* GooCampus note */}
        <p className="mt-6 text-xs leading-relaxed text-gray-500 italic">
          If you have already completed verification through GooCampus, this step is not required
          for you.
        </p>
      </div>
    </div>
  );
}
