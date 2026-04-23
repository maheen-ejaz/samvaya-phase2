'use client';

/**
 * Post-submission page for returning users who completed the form.
 * Shows application status + option to edit their submission.
 * No PWA chrome (BottomNav, AppHeader, etc.) — just status + edit CTA.
 */

interface StatusReviewPageProps {
  firstName: string | null;
  submittedAt: string;
  isGoocampusMember: boolean;
}

export function StatusReviewPage({ firstName, submittedAt, isGoocampusMember }: StatusReviewPageProps) {
  const displayName = firstName || 'there';
  const formattedDate = new Date(submittedAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Status banner */}
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <h2 className="type-heading text-gray-900">Application submitted</h2>
              <p className="text-sm text-gray-600">Submitted on {formattedDate}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-gray-700">
            Hi {displayName}, your application is under review. Our team will be in touch once we&rsquo;ve
            processed your profile.
          </p>
        </div>

        {/* Verification fee info (skip for GooCampus members) */}
        {!isGoocampusMember && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 type-subheading text-gray-900">Next step: Verification fee</h3>
            <p className="mb-4 text-sm leading-relaxed text-gray-700">
              Before we can begin your background verification, the verification fee of{' '}
              <span className="font-semibold">&#8377;3,500 + GST</span> needs to be paid.
              Our team will reach out, or you can contact us directly.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919742811599'}?text=${encodeURIComponent('Hi, I have completed my Samvaya profile and would like to proceed with the verification fee payment of ₹3,500 + GST.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-samvaya-red px-5 py-2.5 text-sm font-medium text-white hover:bg-samvaya-red-dark transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .611.611l4.458-1.495A11.953 11.953 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.594-.838-6.318-2.236l-.44-.362-3.122 1.046 1.046-3.122-.362-.44A9.958 9.958 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
              </svg>
              Contact us on WhatsApp
            </a>
          </div>
        )}

        {isGoocampusMember && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm leading-relaxed text-gray-700">
              <span className="font-semibold">GooCampus member:</span> Your verification fee is waived.
              Our team will begin processing your profile shortly.
            </p>
          </div>
        )}

        {/* Edit application CTA */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 type-subheading text-gray-900">Want to update your application?</h3>
          <p className="mb-4 text-sm text-gray-600">
            You can review and edit your answers before our team processes your profile.
          </p>
          <a
            href="/app/onboarding"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            Review &amp; edit your application
          </a>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-400">
          If you have questions, reach out to our team on WhatsApp or email us at team@samvayamatrimony.com
        </p>
      </div>
    </div>
  );
}
