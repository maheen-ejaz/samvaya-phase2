import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/client';
import { applicantCompletionEmail, teamNotificationEmail, applicationUpdatedEmail } from '@/lib/email/templates';
import { checkRateLimit } from '@/lib/rate-limit';
import { hydrateOnboardingForm } from '@/lib/form/hydrate';
import { QUESTIONS } from '@/lib/form/questions';
import { isQuestionVisible } from '@/lib/form/conditional-rules';
import { isQuestionAnswered } from '@/lib/form/section-navigation';

const TEAM_EMAIL = process.env.TEAM_NOTIFICATION_EMAIL || 'team@samvayamatrimony.com';

export async function POST() {
  const supabase = await createClient();

  // Authenticate
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 3 submissions per user per 10 minutes
  const { allowed } = await checkRateLimit(`submit:${user.id}`, 3, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many attempts. Please wait before trying again.' }, { status: 429 });
  }

  // Check if already submitted (idempotency guard)
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('membership_status, is_goocampus_member')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (userData.membership_status === 'onboarding_complete') {
    // Re-submission from edit mode — send update notification to team
    const [editProfileResult, editMedicalResult] = await Promise.all([
      supabase.from('profiles').select('first_name, last_name').eq('user_id', user.id).maybeSingle(),
      supabase.from('medical_credentials').select('specialty').eq('user_id', user.id).maybeSingle(),
    ]);
    const editFirstName = editProfileResult.data?.first_name || 'Applicant';
    const editLastName = editProfileResult.data?.last_name || '';
    const editRawSpecialty = editMedicalResult.data?.specialty;
    const editSpecialty = Array.isArray(editRawSpecialty) ? editRawSpecialty.join(', ') : (editRawSpecialty || '');

    const updateEmail = applicationUpdatedEmail({
      firstName: editFirstName,
      lastName: editLastName,
      email: user.email || 'unknown',
      specialty: editSpecialty,
    });
    sendEmail(TEAM_EMAIL, updateEmail.subject, updateEmail.html).catch((err) => {
      const e = err as { code?: string; message?: string } | undefined;
      console.error('Update notification email failed:', e?.code, e?.message?.slice(0, 120));
    });

    return NextResponse.json({ success: true, alreadySubmitted: true });
  }

  // Validate every required visible question is answered before marking complete.
  // Uses the same hydrate → isQuestionVisible → isQuestionAnswered path as the UI.
  const hydrated = await hydrateOnboardingForm();
  if (!hydrated) {
    return NextResponse.json({ error: 'Failed to load form data' }, { status: 500 });
  }
  for (const q of QUESTIONS) {
    if (!q.required) continue;
    if (!isQuestionVisible(q.id, hydrated.answers)) continue;
    if (!isQuestionAnswered(q.id, hydrated.answers)) {
      return NextResponse.json({ error: `Incomplete: ${q.id}` }, { status: 400 });
    }
  }

  // Fetch profile + medical data for emails (in parallel)
  const [profileResult, medicalResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('medical_credentials')
      .select('specialty')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  const firstName = profileResult.data?.first_name || 'Applicant';
  const lastName = profileResult.data?.last_name || '';
  const rawSpecialty = medicalResult.data?.specialty;
  const specialty = Array.isArray(rawSpecialty) ? rawSpecialty.join(', ') : (rawSpecialty || '');

  // Update users table — mark form as complete
  const { error: updateError } = await supabase
    .from('users')
    .update({
      membership_status: 'onboarding_complete' as never,
      onboarding_section: 14,
      onboarding_last_question: 100,
      profile_completion_pct: 100,
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('Failed to update user status:', updateError?.code, updateError?.message?.slice(0, 120));
    return NextResponse.json(
      { error: 'Failed to submit form. Please try again.' },
      { status: 500 }
    );
  }

  // Send emails (fire-and-forget — don't block the response)
  const applicantEmail = user.email;
  const applicantPhone = user.phone || '';

  if (applicantEmail) {
    const { subject, html } = applicantCompletionEmail(firstName);
    sendEmail(applicantEmail, subject, html).catch((err) => {
      const e = err as { code?: string; message?: string } | undefined;
      console.error('Applicant email failed:', e?.code, e?.message?.slice(0, 120));
    });
  }

  const teamEmailData = teamNotificationEmail({
    firstName,
    lastName,
    email: applicantEmail || 'unknown',
    phone: applicantPhone,
    specialty,
    isGooCampus: userData.is_goocampus_member,
    submittedAt: new Date().toISOString(),
  });
  sendEmail(TEAM_EMAIL, teamEmailData.subject, teamEmailData.html).catch((err) => {
    const e = err as { code?: string; message?: string } | undefined;
    console.error('Team notification email failed:', e?.code, e?.message?.slice(0, 120));
  });

  return NextResponse.json({ success: true });
}
