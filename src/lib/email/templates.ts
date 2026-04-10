/**
 * Email templates for Samvaya transactional emails.
 * TOUCHPOINT 1 copy sourced from PRD v9.0 lines 1436–1453.
 */

/** Escape HTML entities to prevent XSS in email templates */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================================
// TOUCHPOINT 1 — Applicant completion email
// ============================================================

export function applicantCompletionEmail(firstName: string): {
  subject: string;
  html: string;
} {
  return {
    subject: 'Your Samvaya application — one step remaining',
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e5e7eb;">
      <h1 style="font-size:22px;font-weight:600;margin:0 0 24px;">One last step before we get started.</h1>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hi ${escapeHtml(firstName)},
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Thank you for completing your Samvaya application.
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Before we add you to our candidate pool, we carry out a comprehensive background verification &mdash; the same check that every single Samvaya member goes through. This covers your identity, education, employment history, address, financial standing, and court and criminal records.
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        We do this because every person you could potentially be matched with has been through this same process. It&rsquo;s how we make sure Samvaya is a pool of verified, genuine applicants &mdash; and nothing less.
      </p>

      <div style="background:#fef2f2;border-radius:8px;padding:20px;margin:24px 0;">
        <p style="font-size:15px;font-weight:600;margin:0 0 8px;">
          Verification fee: &#8377;6,000 + GST (&#8377;7,080 total)
        </p>
        <p style="font-size:14px;line-height:1.5;margin:0;color:#4b5563;">
          This is a one-time, non-refundable fee. Work begins as soon as your payment is confirmed.
        </p>
      </div>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        <strong>What happens next:</strong> Once verification is complete (typically 7&ndash;10 working days), your profile enters our candidate pool and our matching process begins. You don&rsquo;t need to do anything &mdash; we&rsquo;ll be in touch when we have a compatible match for you.
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        <strong>Want to update your answers?</strong> You can review and edit your application at any time before we begin processing.
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="https://app.samvayamatrimony.com/auth/login?next=/app/onboarding" style="display:inline-block;background:#A3171F;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:500;">Review &amp; edit your application</a>
      </div>

      <p style="font-size:14px;line-height:1.5;margin:24px 0 0;color:#6b7280;font-style:italic;">
        If you have already completed verification through GooCampus, this step is not required for you.
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;">
      <p style="font-size:13px;color:#9ca3af;margin:0;">
        &mdash; The Samvaya Team
      </p>
    </div>
  </div>
</body>
</html>`.trim(),
  };
}

// ============================================================
// Team notification email — new application submitted
// ============================================================

interface TeamNotificationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  isGooCampus: boolean;
  submittedAt: string;
}

// ============================================================
// Match presented — notify applicant of a new match
// ============================================================

export function matchPresentedEmail(firstName: string): {
  subject: string;
  html: string;
} {
  return {
    subject: "Samvaya: We've found a potential match for you",
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e5e7eb;">
      <h1 style="font-size:22px;font-weight:600;margin:0 0 24px;">We&rsquo;ve found someone for you.</h1>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hi ${escapeHtml(firstName)},
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Our team has carefully reviewed your profile and found a potential match we think could be a great fit. Their profile is now ready for you to review.
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Log in to Samvaya to view their profile and let us know what you think.
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="https://app.samvayamatrimony.com/app/matches" style="display:inline-block;background:#A3171F;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:500;">View Your Match</a>
      </div>

      <p style="font-size:14px;line-height:1.5;margin:0;color:#6b7280;">
        Take your time reviewing &mdash; there&rsquo;s no rush. When you&rsquo;re ready, you can share your interest or let us know it&rsquo;s not the right fit.
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;">
      <p style="font-size:13px;color:#9ca3af;margin:0;">
        &mdash; The Samvaya Team
      </p>
    </div>
  </div>
</body>
</html>`.trim(),
  };
}

// ============================================================
// Match response received — notify the other party
// ============================================================

export function matchResponseReceivedEmail(
  firstName: string,
  isMutualInterest: boolean
): {
  subject: string;
  html: string;
} {
  if (isMutualInterest) {
    return {
      subject: 'Samvaya: Mutual interest confirmed!',
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e5e7eb;">
      <h1 style="font-size:22px;font-weight:600;margin:0 0 24px;">It&rsquo;s mutual! &#127881;</h1>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hi ${escapeHtml(firstName)},
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Great news &mdash; both you and your match have expressed interest in each other. This is an exciting step forward.
      </p>

      <div style="background:#fef2f2;border-radius:8px;padding:20px;margin:24px 0;">
        <p style="font-size:15px;font-weight:600;margin:0 0 8px;">What happens next</p>
        <p style="font-size:14px;line-height:1.5;margin:0;color:#4b5563;">
          To proceed with an introduction, the membership fee of &#8377;35,000 + GST (&#8377;41,300 total) applies. Our team will reach out to guide you through the next steps.
        </p>
      </div>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Log in to Samvaya to see your match&rsquo;s full profile, including their name, contact information, and unblurred photos.
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="https://app.samvayamatrimony.com/app/matches" style="display:inline-block;background:#A3171F;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:500;">View Full Profile</a>
      </div>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;">
      <p style="font-size:13px;color:#9ca3af;margin:0;">
        &mdash; The Samvaya Team
      </p>
    </div>
  </div>
</body>
</html>`.trim(),
    };
  }

  return {
    subject: 'Samvaya: Your match has responded',
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e5e7eb;">
      <h1 style="font-size:22px;font-weight:600;margin:0 0 24px;">An update on your match</h1>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hi ${escapeHtml(firstName)},
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Your match has reviewed your profile and, unfortunately, has decided not to move forward at this time.
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        We know this can be disappointing, but please know that our team continues to look for the right person for you. Every match we present is carefully considered, and your next one could be just around the corner.
      </p>

      <p style="font-size:14px;line-height:1.5;margin:24px 0 0;color:#6b7280;font-style:italic;">
        You don&rsquo;t need to take any action &mdash; we&rsquo;ll reach out when we have a new match for you.
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;">
      <p style="font-size:13px;color:#9ca3af;margin:0;">
        &mdash; The Samvaya Team
      </p>
    </div>
  </div>
</body>
</html>`.trim(),
  };
}

// ============================================================
// Status update — notify applicant of account status change
// ============================================================

export function statusUpdateEmail(
  firstName: string,
  newStatus: string
): {
  subject: string;
  html: string;
} {
  const statusContent: Record<string, { heading: string; body: string }> = {
    verification_pending: {
      heading: 'Your verification has begun',
      body: 'We&rsquo;ve received your payment and your background verification is now underway. This typically takes 7&ndash;10 working days. We&rsquo;ll notify you as soon as it&rsquo;s complete.',
    },
    in_pool: {
      heading: 'You&rsquo;re in the candidate pool!',
      body: 'Your background verification is complete and your profile has been added to our candidate pool. Our team is now actively looking for compatible matches for you. We&rsquo;ll be in touch as soon as we find someone.',
    },
    active_member: {
      heading: 'Your membership is now active',
      body: 'Your membership fee has been confirmed and your 6-month membership window has started. You now have full access to your match&rsquo;s profile, including their name, contact information, and unblurred photos. Log in to Samvaya to view everything.',
    },
  };

  const content = statusContent[newStatus] || {
    heading: 'Your account has been updated',
    body: 'There&rsquo;s been an update to your Samvaya account. Log in to see the latest.',
  };

  return {
    subject: `Samvaya: ${content.heading}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e5e7eb;">
      <h1 style="font-size:22px;font-weight:600;margin:0 0 24px;">${content.heading}</h1>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hi ${escapeHtml(firstName)},
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        ${content.body}
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="https://app.samvayamatrimony.com/app" style="display:inline-block;background:#A3171F;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:500;">Open Samvaya</a>
      </div>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;">
      <p style="font-size:13px;color:#9ca3af;margin:0;">
        &mdash; The Samvaya Team
      </p>
    </div>
  </div>
</body>
</html>`.trim(),
  };
}

// ============================================================
// Form abandonment reminder 1 (24h after last activity)
// ============================================================

export function formReminder1Email(firstName: string): {
  subject: string;
  html: string;
} {
  return {
    subject: "Your Samvaya application is waiting for you",
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e5e7eb;">
      <h1 style="font-size:22px;font-weight:600;margin:0 0 24px;">You&rsquo;re partway through &mdash; let&rsquo;s finish this.</h1>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hi ${escapeHtml(firstName)},
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        We noticed you started your Samvaya application but haven&rsquo;t completed it yet. Your progress has been saved &mdash; you can pick up right where you left off.
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Samvaya is a curated community of verified medical professionals looking for meaningful connections. Completing your profile is the first step toward finding your match.
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="https://app.samvayamatrimony.com/auth/login?next=/app/onboarding" style="display:inline-block;background:#A3171F;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:500;">Continue your application</a>
      </div>

      <p style="font-size:14px;line-height:1.5;margin:0;color:#6b7280;">
        It only takes a few more minutes to complete.
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;">
      <p style="font-size:13px;color:#9ca3af;margin:0;">
        &mdash; The Samvaya Team
      </p>
    </div>
  </div>
</body>
</html>`.trim(),
  };
}

// ============================================================
// Form abandonment reminder 2 (72h after last activity)
// ============================================================

export function formReminder2Email(firstName: string): {
  subject: string;
  html: string;
} {
  return {
    subject: "Your Samvaya application is still waiting",
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e5e7eb;">
      <h1 style="font-size:22px;font-weight:600;margin:0 0 24px;">We&rsquo;re saving your spot.</h1>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hi ${escapeHtml(firstName)},
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Your Samvaya application is still incomplete. We&rsquo;ve saved all your progress, so you won&rsquo;t need to start over.
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Every profile in our candidate pool goes through a thorough background verification. The sooner you complete your application, the sooner we can begin the process and start matching you with compatible professionals.
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="https://app.samvayamatrimony.com/auth/login?next=/app/onboarding" style="display:inline-block;background:#A3171F;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:500;">Complete your application</a>
      </div>

      <p style="font-size:14px;line-height:1.5;margin:0;color:#6b7280;">
        This is our last reminder. If you have any questions, reply to this email or reach out on WhatsApp.
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;">
      <p style="font-size:13px;color:#9ca3af;margin:0;">
        &mdash; The Samvaya Team
      </p>
    </div>
  </div>
</body>
</html>`.trim(),
  };
}

// ============================================================
// Form abandonment reminder 3 (7 days after last activity)
// ============================================================

export function formReminder3Email(firstName: string): {
  subject: string;
  html: string;
} {
  return {
    subject: 'A quick check-in from Samvaya',
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e5e7eb;">
      <h1 style="font-size:22px;font-weight:600;margin:0 0 24px;">Just checking in.</h1>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hi ${escapeHtml(firstName)},
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        It&rsquo;s been about a week since you started your Samvaya application. We understand life gets busy &mdash; especially for doctors.
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Your progress is still saved. Whenever you&rsquo;re ready, you can pick up exactly where you left off. The whole process takes about 15&ndash;20 minutes.
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="https://app.samvayamatrimony.com/auth/login?next=/app/onboarding" style="display:inline-block;background:#A3171F;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:500;">Continue your application</a>
      </div>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;">
      <p style="font-size:13px;color:#9ca3af;margin:0;">
        &mdash; The Samvaya Team
      </p>
    </div>
  </div>
</body>
</html>`.trim(),
  };
}

// ============================================================
// Form abandonment reminder 4 (14 days after last activity)
// ============================================================

export function formReminder4Email(firstName: string): {
  subject: string;
  html: string;
} {
  return {
    subject: 'Your Samvaya profile is still here',
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e5e7eb;">
      <h1 style="font-size:22px;font-weight:600;margin:0 0 24px;">Your profile is waiting for you.</h1>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hi ${escapeHtml(firstName)},
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        We wanted to let you know that your partially completed Samvaya application is still saved and ready for you.
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Samvaya is built around a small, carefully verified pool of medical professionals. Completing your profile is the only way to enter the pool and be considered for a match. We&rsquo;d love to have you.
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="https://app.samvayamatrimony.com/auth/login?next=/app/onboarding" style="display:inline-block;background:#A3171F;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:500;">Finish your application</a>
      </div>

      <p style="font-size:14px;line-height:1.5;margin:0;color:#6b7280;">
        If something about the application isn&rsquo;t working or you have questions, just reply to this email. We&rsquo;re happy to help.
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;">
      <p style="font-size:13px;color:#9ca3af;margin:0;">
        &mdash; The Samvaya Team
      </p>
    </div>
  </div>
</body>
</html>`.trim(),
  };
}

// ============================================================
// Form abandonment reminder 5 (21 days — final reminder)
// ============================================================

export function formReminder5Email(firstName: string): {
  subject: string;
  html: string;
} {
  return {
    subject: 'Last reminder: Your Samvaya application',
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e5e7eb;">
      <h1 style="font-size:22px;font-weight:600;margin:0 0 24px;">One last note from us.</h1>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hi ${escapeHtml(firstName)},
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        This is our final reminder about your Samvaya application. We don&rsquo;t want to be a nuisance &mdash; so after this, we&rsquo;ll leave the ball in your court.
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Your progress is still saved. If you decide to come back &mdash; whether that&rsquo;s tomorrow or months from now &mdash; you can pick up where you left off. No pressure, no expiry.
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="https://app.samvayamatrimony.com/auth/login?next=/app/onboarding" style="display:inline-block;background:#A3171F;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:500;">Complete your application</a>
      </div>

      <p style="font-size:14px;line-height:1.5;margin:0;color:#6b7280;">
        We wish you all the best. If you ever want to reach us, just reply to this email or message us on WhatsApp.
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;">
      <p style="font-size:13px;color:#9ca3af;margin:0;">
        &mdash; The Samvaya Team
      </p>
    </div>
  </div>
</body>
</html>`.trim(),
  };
}

// ============================================================
// Team notification — applicant updated their application
// ============================================================

interface ApplicationUpdatedData {
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
}

export function applicationUpdatedEmail(data: ApplicationUpdatedData): {
  subject: string;
  html: string;
} {
  return {
    subject: `Application updated: ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e5e7eb;">
      <h1 style="font-size:20px;font-weight:600;margin:0 0 24px;">Application Updated</h1>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        <strong>${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</strong> has updated their submitted application.
      </p>

      <table style="width:100%;font-size:14px;line-height:1.8;border-collapse:collapse;">
        <tr><td style="color:#6b7280;padding:4px 12px 4px 0;white-space:nowrap;">Email</td><td>${escapeHtml(data.email)}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 12px 4px 0;white-space:nowrap;">Specialty</td><td>${escapeHtml(data.specialty || 'Not specified')}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 12px 4px 0;white-space:nowrap;">Updated</td><td>${new Date().toISOString()}</td></tr>
      </table>

      <p style="font-size:14px;line-height:1.5;margin:24px 0 0;color:#6b7280;">
        Please re-review their profile in the admin dashboard if processing has already begun.
      </p>
    </div>
  </div>
</body>
</html>`.trim(),
  };
}

// ============================================================
// Membership expired — notify member that their membership has lapsed
// ============================================================

export function membershipExpiredEmail(firstName: string): {
  subject: string;
  html: string;
} {
  return {
    subject: 'Samvaya: Your membership has expired',
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e5e7eb;">
      <h1 style="font-size:22px;font-weight:600;margin:0 0 24px;">Your Samvaya membership has expired</h1>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Hi ${escapeHtml(firstName)},
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        Your Samvaya membership window has come to an end. We hope your time with us was meaningful.
      </p>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        If you&rsquo;d like to continue your journey with Samvaya, you&rsquo;re welcome to renew your membership. Our team will be in touch to walk you through the options.
      </p>

      <div style="background:#fef2f2;border-radius:8px;padding:20px;margin:24px 0;">
        <p style="font-size:15px;font-weight:600;margin:0 0 8px;">Membership renewal</p>
        <p style="font-size:14px;line-height:1.5;margin:0;color:#4b5563;">
          Membership fee: &#8377;35,000 + GST (&#8377;41,300 total). Reach out to us and we&rsquo;ll take it from there.
        </p>
      </div>

      <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
        If you have any questions or would like to speak with our team, simply reply to this email or reach us on WhatsApp.
      </p>

      <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px;">
      <p style="font-size:13px;color:#9ca3af;margin:0;">
        &mdash; The Samvaya Team
      </p>
    </div>
  </div>
</body>
</html>`.trim(),
  };
}

// ============================================================
// Team notification email — new application submitted
// ============================================================

export function teamNotificationEmail(data: TeamNotificationData): {
  subject: string;
  html: string;
} {
  return {
    subject: `New applicant submission: ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="background:#fff;border-radius:12px;padding:32px 24px;border:1px solid #e5e7eb;">
      <h1 style="font-size:20px;font-weight:600;margin:0 0 24px;">New Application Submitted</h1>

      <table style="width:100%;font-size:14px;line-height:1.8;border-collapse:collapse;">
        <tr><td style="color:#6b7280;padding:4px 12px 4px 0;white-space:nowrap;">Name</td><td style="font-weight:500;">${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 12px 4px 0;white-space:nowrap;">Email</td><td>${escapeHtml(data.email)}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 12px 4px 0;white-space:nowrap;">Phone</td><td>${escapeHtml(data.phone)}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 12px 4px 0;white-space:nowrap;">Specialty</td><td>${escapeHtml(data.specialty || 'Not specified')}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 12px 4px 0;white-space:nowrap;">GooCampus</td><td>${data.isGooCampus ? 'Yes' : 'No'}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 12px 4px 0;white-space:nowrap;">Status</td><td>unverified (awaiting payment)</td></tr>
        <tr><td style="color:#6b7280;padding:4px 12px 4px 0;white-space:nowrap;">Submitted</td><td>${data.submittedAt}</td></tr>
      </table>

      <div style="margin-top:24px;">
        <p style="font-size:14px;font-weight:500;margin:0 0 8px;">Next Steps:</p>
        <ol style="font-size:14px;line-height:1.8;margin:0;padding-left:20px;color:#374151;">
          <li>Review profile in admin dashboard</li>
          <li>Verify documents</li>
          <li>Collect verification fee (&#8377;7,080)${data.isGooCampus ? ' — <strong>waived (GooCampus)</strong>' : ''}</li>
          <li>Initiate BGV once fee confirmed + consent obtained</li>
        </ol>
      </div>
    </div>
  </div>
</body>
</html>`.trim(),
  };
}
