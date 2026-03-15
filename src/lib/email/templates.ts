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
