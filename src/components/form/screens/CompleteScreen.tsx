'use client';

interface CompleteScreenProps {
  isGoocampus?: boolean;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919742811599';

/**
 * Post-submission screen. Replaces the old CompletionScreen.
 *
 * For non-GooCampus applicants: explains the verification fee (₹7,080) and
 * offers a WhatsApp contact link. Razorpay is deferred to v2 (per CLAUDE.md),
 * so payments are handled offline by the team.
 *
 * For GooCampus members: skips the verification fee section entirely (per
 * CLAUDE.md "GooCampus gate is a hard block").
 */
export function CompleteScreen({ isGoocampus }: CompleteScreenProps) {
  return (
    <div className="max-w-xl mx-auto py-12 lg:py-20">
      <div className="form-eyebrow mb-4 text-center">Submitted</div>
      <h1 className="form-title text-center mb-4">Your application is in</h1>
      <p className="form-subtitle text-center mb-10">
        Thank you for completing your Samvaya profile.
      </p>

      {isGoocampus ? (
        <GooCampusBlock />
      ) : (
        <VerificationBlock />
      )}
    </div>
  );
}

function GooCampusBlock() {
  return (
    <div className="rounded-xl border border-[color:var(--color-form-border)] bg-[color:var(--color-form-surface-muted)] px-6 py-6">
      <div className="form-label mb-3">You&apos;re all set</div>
      <p className="form-helper mb-4">
        As a GooCampus member, your verification has already been completed,
        so you can skip the verification step. Your profile will enter our
        candidate pool shortly.
      </p>
      <p className="form-helper">
        We&apos;ll reach out as soon as we have a compatible match for you.
      </p>
    </div>
  );
}

function VerificationBlock() {
  return (
    <div className="rounded-xl border border-[color:var(--color-form-border)] bg-[color:var(--color-form-surface-muted)] px-6 py-6">
      <div className="form-label mb-3">One last step</div>
      <p className="form-helper mb-4">
        Before we add you to our candidate pool, we carry out the same
        comprehensive background verification that every Samvaya member
        goes through — identity, education, employment, address, financial
        standing, and court records.
      </p>
      <p className="form-helper mb-6">
        This is how we ensure every match on Samvaya is between two
        verified people. No exceptions.
      </p>

      <div className="rounded-lg border border-[color:var(--color-form-border)] bg-white p-5 mb-5">
        <div className="form-eyebrow mb-2">Verification fee</div>
        <div className="form-title mb-1" style={{ fontSize: '1.625rem' }}>₹7,080</div>
        <p className="form-caption">
          ₹6,000 + 18% GST. One-time, non-refundable. Verification begins
          once payment is confirmed.
        </p>
      </div>

      <div className="rounded-lg border border-[color:var(--color-form-border)] bg-white p-5 mb-6">
        <div className="form-eyebrow mb-2">About the service fee</div>
        <p className="form-caption">
          A service fee of ₹41,300 (₹35,000 + 18% GST) only applies once we
          find a compatible match and both parties confirm mutual interest.
          If we don&apos;t find a match, no service fee is required.
        </p>
      </div>

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          'Hi, I have completed my Samvaya profile and would like to proceed with the verification fee payment of ₹7,080.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="form-btn-primary w-full"
      >
        Contact us on WhatsApp
      </a>

      <p className="form-caption text-center mt-4">
        Our team will also reach out to you shortly.
      </p>
    </div>
  );
}
