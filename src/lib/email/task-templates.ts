// Pre-built email templates for the Tasks page compose modal.
// These appear as dropdown options in EmailComposeModal.

export interface TaskEmailTemplate {
  id: string;
  label: string;
  subject: string;
  body: string;
}

export const TASK_EMAIL_TEMPLATES: TaskEmailTemplate[] = [
  {
    id: 'waitlist_call_followup',
    label: 'Waitlist — Call follow-up',
    subject: 'Welcome to Samvaya — A quick note from us',
    body: `Hi {name},

Thank you for joining the Samvaya waitlist! We're thrilled to have you here.

Samvaya is a premium matrimony platform exclusively for medical professionals in India. We believe that doctors deserve a thoughtful, curated matching experience — not a swipe-based app.

Here's what to expect:
• A short conversation with our team to understand what you're looking for
• A comprehensive profile form (it's thorough — it helps us match you well)
• A one-time verification fee of ₹4,130 (₹3,500 + 18% GST)
• GooCampus members have the verification fee waived

We'd love to schedule a quick call to walk you through the process. Please reply to this email or call us directly and we'll find a time that works.

Warm regards,
The Samvaya Team`,
  },
  {
    id: 'verification_fee_reminder',
    label: 'Verification fee reminder',
    subject: 'Your Samvaya profile is ready — next step',
    body: `Hi {name},

Great news — you've completed your Samvaya profile form!

The next step is to pay the one-time verification fee of ₹4,130 (₹3,500 + 18% GST). This covers the background verification check that every Samvaya member goes through, ensuring a safe and trusted pool of profiles.

Once your payment is confirmed, we'll initiate the verification process and you'll be on your way to the member pool.

Please log in to your dashboard to complete the payment, or reply to this email if you have any questions.

Warm regards,
The Samvaya Team`,
  },
  {
    id: 'bgv_initiated',
    label: 'BGV initiated',
    subject: 'Your Samvaya background verification has started',
    body: `Hi {name},

We've received your payment — thank you!

We've now initiated your background verification check. This typically takes 3–5 business days. We verify your medical credentials, professional history, and other details to ensure the integrity of the Samvaya member pool.

You'll receive an update from us once the verification is complete. In the meantime, feel free to reach out if you have any questions.

Warm regards,
The Samvaya Team`,
  },
  {
    id: 'welcome_to_pool',
    label: 'Welcome to the pool',
    subject: 'You\'re now a verified Samvaya member!',
    body: `Hi {name},

Congratulations — your background verification is complete and you're now a verified Samvaya member!

Your profile is now active in our member pool. Our team will begin curating match recommendations based on your preferences and compatibility. We take this process seriously and only present matches we genuinely believe are worth your attention.

You'll hear from us when we have a match to share. We appreciate your patience — quality takes time.

Welcome to Samvaya.

Warm regards,
The Samvaya Team`,
  },
];
