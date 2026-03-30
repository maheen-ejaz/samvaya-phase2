import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Temporary seed route — DELETE after testing
// POST /api/admin/seed

const SEED_USERS = [
  { email: 'priya.sharma@test.com', first: 'Priya', last: 'Sharma', gender: 'female', dob: '1996-03-15', state: 'Maharashtra', city: 'Mumbai', specialty: ['Dermatology'], eduStatus: 'completed_pg', religion: 'hindu', mother_tongue: 'marathi', marital: 'first_marriage' },
  { email: 'rahul.patel@test.com', first: 'Rahul', last: 'Patel', gender: 'male', dob: '1994-08-22', state: 'Gujarat', city: 'Ahmedabad', specialty: ['Cardiology'], eduStatus: 'completed_pg', religion: 'hindu', mother_tongue: 'gujarati', marital: 'first_marriage' },
  { email: 'ananya.reddy@test.com', first: 'Ananya', last: 'Reddy', gender: 'female', dob: '1997-11-03', state: 'Telangana', city: 'Hyderabad', specialty: ['Ophthalmology'], eduStatus: 'pursuing_pg', religion: 'hindu', mother_tongue: 'telugu', marital: 'first_marriage' },
  { email: 'vikram.singh@test.com', first: 'Vikram', last: 'Singh', gender: 'male', dob: '1993-01-28', state: 'Delhi', city: 'New Delhi', specialty: ['Orthopedics'], eduStatus: 'completed_pg', religion: 'sikh', mother_tongue: 'punjabi', marital: 'first_marriage' },
  { email: 'sneha.nair@test.com', first: 'Sneha', last: 'Nair', gender: 'female', dob: '1995-06-10', state: 'Kerala', city: 'Kochi', specialty: ['Pediatrics'], eduStatus: 'completed_pg', religion: 'hindu', mother_tongue: 'malayalam', marital: 'first_marriage' },
  { email: 'arjun.mehta@test.com', first: 'Arjun', last: 'Mehta', gender: 'male', dob: '1996-09-17', state: 'Karnataka', city: 'Bangalore', specialty: ['General Surgery'], eduStatus: 'pursuing_pg', religion: 'jain', mother_tongue: 'hindi', marital: 'first_marriage' },
  { email: 'kavitha.iyer@test.com', first: 'Kavitha', last: 'Iyer', gender: 'female', dob: '1994-12-05', state: 'Tamil Nadu', city: 'Chennai', specialty: ['Psychiatry'], eduStatus: 'completed_pg', religion: 'hindu', mother_tongue: 'tamil', marital: 'first_marriage' },
  { email: 'rohit.gupta@test.com', first: 'Rohit', last: 'Gupta', gender: 'male', dob: '1995-04-20', state: 'Uttar Pradesh', city: 'Lucknow', specialty: ['Radiology'], eduStatus: 'completed_pg', religion: 'hindu', mother_tongue: 'hindi', marital: 'first_marriage' },
  { email: 'divya.krishnan@test.com', first: 'Divya', last: 'Krishnan', gender: 'female', dob: '1998-02-14', state: 'Karnataka', city: 'Bangalore', specialty: ['Anesthesiology'], eduStatus: 'pursuing_pg', religion: 'hindu', mother_tongue: 'kannada', marital: 'first_marriage' },
  { email: 'aditya.joshi@test.com', first: 'Aditya', last: 'Joshi', gender: 'male', dob: '1993-07-30', state: 'Maharashtra', city: 'Pune', specialty: ['ENT'], eduStatus: 'completed_pg', religion: 'hindu', mother_tongue: 'marathi', marital: 'divorced' },
  { email: 'meera.das@test.com', first: 'Meera', last: 'Das', gender: 'female', dob: '1997-05-08', state: 'West Bengal', city: 'Kolkata', specialty: ['Gynecology'], eduStatus: 'completed_pg', religion: 'hindu', mother_tongue: 'bengali', marital: 'first_marriage' },
  { email: 'karthik.raman@test.com', first: 'Karthik', last: 'Raman', gender: 'male', dob: '1996-10-12', state: 'Tamil Nadu', city: 'Coimbatore', specialty: ['Neurology'], eduStatus: 'pursuing_pg', religion: 'hindu', mother_tongue: 'tamil', marital: 'first_marriage' },
  // These 3 will be in-progress (not complete)
  { email: 'pooja.verma@test.com', first: 'Pooja', last: 'Verma', gender: 'female', dob: '1997-08-25', state: 'Madhya Pradesh', city: 'Bhopal', specialty: ['Pathology'], eduStatus: 'mbbs_passed', religion: 'hindu', mother_tongue: 'hindi', marital: 'first_marriage' },
  { email: 'sanjay.rao@test.com', first: 'Sanjay', last: 'Rao', gender: 'male', dob: '1995-03-18', state: 'Andhra Pradesh', city: 'Visakhapatnam', specialty: ['General Medicine'], eduStatus: 'intern', religion: 'hindu', mother_tongue: 'telugu', marital: 'first_marriage' },
  { email: 'nisha.kapoor@test.com', first: 'Nisha', last: 'Kapoor', gender: 'female', dob: '1996-01-07', state: 'Punjab', city: 'Chandigarh', specialty: ['Dermatology'], eduStatus: 'mbbs_student', religion: 'hindu', mother_tongue: 'punjabi', marital: 'first_marriage' },
];

// Pipeline distribution: who's at which stage
const PIPELINE = {
  // Indices 0-2: onboarding_complete + unverified (need payment)
  unverified: [0, 1, 2],
  // Indices 3-5: verification_pending (fee paid, BGV in progress)
  verificationPending: [3, 4, 5],
  // Indices 6-8: in_pool (BGV complete, ready for matching)
  inPool: [6, 7, 8],
  // Indices 9-11: various match stages
  matched: [9, 10, 11],
  // Indices 12-14: still filling the form
  inProgress: [12, 13, 14],
};

export async function POST() {
  // Block in production — seed data must never overwrite real data
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seed route is disabled in production' }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: roleData } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (!roleData || (roleData.role !== 'admin' && roleData.role !== 'super_admin')) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const admin = createAdminClient();
  const createdUserIds: string[] = [];
  const errors: string[] = [];

  // ================================================================
  // 1. Create auth users + user rows
  // ================================================================
  for (let i = 0; i < SEED_USERS.length; i++) {
    const su = SEED_USERS[i];

    // Check if already exists
    const { data: existingUsers } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const existing = existingUsers?.users?.find((u) => u.email === su.email);
    if (existing) {
      createdUserIds.push(existing.id);
      continue;
    }

    // Create auth user
    const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
      email: su.email,
      email_confirm: true,
      user_metadata: { full_name: `${su.first} ${su.last}` },
    });

    if (authErr || !authUser?.user) {
      errors.push(`Failed to create ${su.email}: ${authErr?.message}`);
      createdUserIds.push('');
      continue;
    }

    createdUserIds.push(authUser.user.id);

    // Wait briefly for trigger to create user row
    await new Promise((r) => setTimeout(r, 200));
  }

  // ================================================================
  // 2. Set user statuses based on pipeline stage
  // ================================================================
  for (let i = 0; i < SEED_USERS.length; i++) {
    const uid = createdUserIds[i];
    if (!uid) continue;

    let membershipStatus = 'onboarding_complete';
    let paymentStatus = 'unverified';
    let bgvComplete = false;
    let onboardingSection = 13;
    let onboardingLastQuestion = 100;
    let completionPct = 100;

    if (PIPELINE.verificationPending.includes(i)) {
      paymentStatus = 'verification_pending';
    } else if (PIPELINE.inPool.includes(i)) {
      paymentStatus = 'in_pool';
      bgvComplete = true;
    } else if (PIPELINE.matched.includes(i)) {
      paymentStatus = 'in_pool';
      bgvComplete = true;
    } else if (PIPELINE.inProgress.includes(i)) {
      membershipStatus = 'onboarding_in_progress';
      paymentStatus = 'unverified';
      onboardingSection = 3 + (i - 12) * 3; // Sections 3, 6, 9
      onboardingLastQuestion = 20 + (i - 12) * 15;
      completionPct = 20 + (i - 12) * 20;
    }

    await admin.from('users').update({
      role: 'applicant' as never,
      membership_status: membershipStatus as never,
      payment_status: paymentStatus as never,
      is_bgv_complete: bgvComplete as never,
      bgv_consent: 'consented' as never,
      onboarding_section: onboardingSection as never,
      onboarding_last_question: onboardingLastQuestion as never,
      profile_completion_pct: completionPct as never,
    }).eq('id', uid);
  }

  // ================================================================
  // 3. Create profiles
  // ================================================================
  for (let i = 0; i < SEED_USERS.length; i++) {
    const uid = createdUserIds[i];
    if (!uid) continue;
    const su = SEED_USERS[i];

    await admin.from('profiles').upsert({
      user_id: uid,
      first_name: su.first,
      last_name: su.last,
      gender: su.gender as never,
      date_of_birth: su.dob,
      current_state: su.state,
      current_city: su.city,
      current_country: 'India',
      citizenship_country: 'India',
      religion: su.religion,
      mother_tongue: su.mother_tongue,
      marital_status: su.marital as never,
      diet: (['vegetarian', 'non_vegetarian', 'eggetarian'] as const)[i % 3] as never,
      fitness_habits: (['regularly_exercises', 'occasionally', 'rarely'] as const)[i % 3] as never,
      marriage_timeline: (['within_6_months', '6_to_12_months', '1_to_2_years'] as const)[i % 3] as never,
    } as never, { onConflict: 'user_id' });
  }

  // ================================================================
  // 4. Create medical credentials
  // ================================================================
  for (let i = 0; i < SEED_USERS.length; i++) {
    const uid = createdUserIds[i];
    if (!uid) continue;
    const su = SEED_USERS[i];

    await admin.from('medical_credentials').upsert({
      user_id: uid,
      current_status: su.eduStatus as never,
      specialty: su.specialty as never,
      has_work_experience: su.eduStatus === 'completed_pg' as never,
    } as never, { onConflict: 'user_id' });
  }

  // ================================================================
  // 5. Create payments for verification_pending+ users
  // ================================================================
  for (const idx of [...PIPELINE.verificationPending, ...PIPELINE.inPool, ...PIPELINE.matched]) {
    const uid = createdUserIds[idx];
    if (!uid) continue;

    // Check if payment already exists
    const { data: existingPayment } = await admin.from('payments').select('id').eq('user_id', uid as never).maybeSingle();
    if (existingPayment) continue;

    await admin.from('payments').insert({
      user_id: uid,
      payment_type: 'verification_fee' as never,
      amount: 708000 as never, // ₹7,080 in paise
      currency: 'INR' as never,
      verification_fee_paid: true as never,
      status: 'captured' as never,
      paid_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString() as never,
    } as never);
  }

  // ================================================================
  // 6. Create match suggestions (3 pairs from in_pool/matched users)
  // ================================================================
  const matchPairs = [
    { a: 6, b: 9, score: 87, narrative: 'Strong alignment on career ambition and family values. Both value independence while maintaining close family ties. Kavitha\'s structured communication style complements Aditya\'s reflective approach. Shared interest in classical arts and fitness. Geographic proximity (Tamil Nadu / Maharashtra) is manageable given both express relocation openness.' },
    { a: 7, b: 10, score: 74, narrative: 'Good lifestyle compatibility — both are fitness-oriented non-vegetarians with similar social energy levels. Rohit\'s career stability in Radiology pairs well with Meera\'s ambition in Gynecology. Mild concern on geographic alignment (UP vs West Bengal) but both indicated flexibility. Financial values are well-aligned.' },
    { a: 8, b: 11, score: 91, narrative: 'Exceptional match across multiple dimensions. Both are pursuing PG in Karnataka, share South Indian cultural background, and have remarkably similar life pace preferences. Strong emotional expressiveness scores for both. Family orientation closely aligned — both prefer nuclear family with openness to extended family visits. Divya\'s adventurous spirit complements Karthik\'s grounded nature.' },
  ];

  const suggestionIds: string[] = [];
  for (const pair of matchPairs) {
    const aId = createdUserIds[pair.a];
    const bId = createdUserIds[pair.b];
    if (!aId || !bId) continue;

    // Ensure canonical ordering
    const [profileA, profileB] = aId < bId ? [aId, bId] : [bId, aId];

    const { data: existing } = await admin
      .from('match_suggestions' as never)
      .select('id')
      .eq('profile_a_id', profileA as never)
      .eq('profile_b_id', profileB as never)
      .maybeSingle();

    if (existing) {
      suggestionIds.push((existing as { id: string }).id);
      continue;
    }

    const status = pair.score >= 85 ? 'approved' : 'pending_review';
    const { data: suggestion } = await admin
      .from('match_suggestions' as never)
      .insert({
        profile_a_id: profileA,
        profile_b_id: profileB,
        overall_compatibility_score: pair.score,
        match_narrative: pair.narrative,
        recommendation: pair.score >= 80 ? 'strongly_recommend' : 'recommend',
        admin_status: status,
        compatibility_report: {
          overall_score: pair.score,
          dimension_scores: {
            career_alignment: { score: pair.score - 5 + Math.floor(Math.random() * 10), weight: 0.15, notes: 'Career goals well-aligned' },
            values_alignment: { score: pair.score - 3 + Math.floor(Math.random() * 6), weight: 0.15, notes: 'Shared core values' },
            lifestyle_compatibility: { score: pair.score + Math.floor(Math.random() * 8) - 4, weight: 0.12, notes: 'Compatible daily habits' },
            relocation_compatibility: { score: 60 + Math.floor(Math.random() * 30), weight: 0.1, notes: 'Both open to relocation' },
            communication_compatibility: { score: pair.score - 2 + Math.floor(Math.random() * 8), weight: 0.12, notes: 'Communication styles complement each other' },
            family_orientation: { score: pair.score + Math.floor(Math.random() * 6) - 3, weight: 0.12, notes: 'Family values aligned' },
            financial_alignment: { score: 65 + Math.floor(Math.random() * 25), weight: 0.12, notes: 'Financial expectations compatible' },
            timeline_alignment: { score: pair.score + Math.floor(Math.random() * 10) - 5, weight: 0.06, notes: 'Marriage timeline compatible' },
            emotional_compatibility: { score: pair.score - 1 + Math.floor(Math.random() * 6), weight: 0.06, notes: 'Emotional expression styles complement' },
          },
          highlights: ['Strong career alignment', 'Shared family values', 'Compatible lifestyle'],
          concerns: pair.score < 80 ? ['Geographic distance may require discussion'] : [],
          narrative: pair.narrative,
          recommendation: pair.score >= 80 ? 'strongly_recommend' : 'recommend',
        },
      } as never)
      .select('id')
      .single();

    suggestionIds.push(suggestion ? (suggestion as { id: string }).id : '');
  }

  // ================================================================
  // 7. Create a match presentation for the highest-scored pair
  // ================================================================
  if (suggestionIds[2]) {
    const { data: existingPres } = await admin
      .from('match_presentations' as never)
      .select('id')
      .eq('match_suggestion_id', suggestionIds[2] as never)
      .maybeSingle();

    if (!existingPres) {
      await admin.from('match_presentations' as never).insert({
        match_suggestion_id: suggestionIds[2],
        status: 'pending',
        member_a_response: 'pending',
        member_b_response: 'interested',
        presented_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      } as never);
    }
  }

  // ================================================================
  // 8. Create waitlist entries
  // ================================================================
  const waitlistEntries = [
    { full_name: 'Dr. Amit Deshmukh', email: 'amit.d@test.com', phone: '9876543210', specialty: 'Cardiology', city: 'Nagpur', status: 'invited' },
    { full_name: 'Dr. Fatima Khan', email: 'fatima.k@test.com', phone: '9876543211', specialty: 'Dermatology', city: 'Hyderabad', status: 'invited' },
    { full_name: 'Dr. Raghav Menon', email: 'raghav.m@test.com', phone: '9876543212', specialty: 'Orthopedics', city: 'Thiruvananthapuram', status: 'pending' },
    { full_name: 'Dr. Swati Kulkarni', email: 'swati.k@test.com', phone: '9876543213', specialty: 'Pediatrics', city: 'Pune', status: 'pending' },
    { full_name: 'Dr. Nikhil Banerjee', email: 'nikhil.b@test.com', phone: '9876543214', specialty: 'Psychiatry', city: 'Kolkata', status: 'pending' },
    { full_name: 'Dr. Lakshmi Subramanian', email: 'lakshmi.s@test.com', phone: '9876543215', specialty: 'Gynecology', city: 'Madurai', status: 'converted' },
    { full_name: 'Dr. Pranav Agarwal', email: 'pranav.a@test.com', phone: '9876543216', specialty: 'Radiology', city: 'Jaipur', status: 'pending' },
    { full_name: 'Dr. Ritu Saxena', email: 'ritu.s@test.com', phone: '9876543217', specialty: 'ENT', city: 'Lucknow', status: 'invited' },
  ];

  for (const entry of waitlistEntries) {
    const { data: existing } = await admin.from('waitlist').select('id').eq('email', entry.email).maybeSingle();
    if (existing) continue;

    await admin.from('waitlist').insert({
      full_name: entry.full_name,
      email: entry.email,
      phone: entry.phone,
      specialty: entry.specialty,
      city: entry.city,
      country: 'India',
      status: entry.status as never,
      career_stage: 'consultant' as never,
    } as never);
  }

  // ================================================================
  // 9. Create activity log entries
  // ================================================================
  const activityEntries = [
    { action: 'marked_verification_paid', entity_type: 'user', entity_idx: 3 },
    { action: 'moved_to_pool', entity_type: 'user', entity_idx: 6 },
    { action: 'approved_match', entity_type: 'match_suggestion', entity_idx: 0 },
    { action: 'presented_match', entity_type: 'match_presentation', entity_idx: 0 },
    { action: 'added_note', entity_type: 'user', entity_idx: 1 },
    { action: 'marked_verification_paid', entity_type: 'user', entity_idx: 4 },
  ];

  for (let i = 0; i < activityEntries.length; i++) {
    const entry = activityEntries[i];
    const entityId = entry.entity_type === 'user'
      ? createdUserIds[entry.entity_idx] || user.id
      : suggestionIds[entry.entity_idx] || user.id;

    await admin.from('activity_log' as never).insert({
      actor_id: user.id,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entityId,
      metadata: {},
      created_at: new Date(Date.now() - (i + 1) * 2 * 60 * 60 * 1000).toISOString(),
    } as never);
  }

  // ================================================================
  // 10. Create communication log entries
  // ================================================================
  const commEntries = [
    { idx: 0, subject: 'Welcome to Samvaya — Your Application is Received', status: 'sent' },
    { idx: 3, subject: 'Payment Confirmed — BGV Process Initiated', status: 'sent' },
    { idx: 6, subject: 'You\'re in the Pool — Matching Has Begun', status: 'sent' },
    { idx: 1, subject: 'Reminder: Complete Your Verification Fee', status: 'sent' },
    { idx: 12, subject: 'Continue Your Application — You\'re Almost There', status: 'sent' },
  ];

  for (let i = 0; i < commEntries.length; i++) {
    const entry = commEntries[i];
    const recipientId = createdUserIds[entry.idx];
    if (!recipientId) continue;

    await admin.from('communication_log' as never).insert({
      user_id: recipientId,
      sent_by: user.id,
      channel: 'email',
      subject: entry.subject,
      body: `Email body for: ${entry.subject}`,
      status: entry.status,
      sent_at: new Date(Date.now() - (i + 1) * 4 * 60 * 60 * 1000).toISOString(),
    } as never);
  }

  return NextResponse.json({
    success: true,
    usersCreated: createdUserIds.filter(Boolean).length,
    waitlistEntries: waitlistEntries.length,
    matchSuggestions: suggestionIds.filter(Boolean).length,
    errors,
  });
}
