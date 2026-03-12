import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/client';
import { applicantCompletionEmail, teamNotificationEmail } from '@/lib/email/templates';

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
    return NextResponse.json({ success: true, alreadySubmitted: true });
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
      onboarding_section: 13,
      onboarding_last_question: 100,
      profile_completion_pct: 100,
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('Failed to update user status:', updateError);
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
    sendEmail(applicantEmail, subject, html).catch((err) =>
      console.error('Applicant email failed:', err)
    );
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
  sendEmail(TEAM_EMAIL, teamEmailData.subject, teamEmailData.html).catch((err) =>
    console.error('Team notification email failed:', err)
  );

  return NextResponse.json({ success: true });
}
