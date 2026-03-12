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
