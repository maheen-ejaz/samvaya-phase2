/**
 * Seed script for admin dashboard testing.
 * Run: node scripts/seed-dashboard.mjs
 *
 * Creates 15 realistic test applicants at various pipeline stages,
 * waitlist entries, match suggestions, activity logs, and communications.
 *
 * DELETE this script after testing.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env vars
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.substring(0, eqIdx);
  const val = trimmed.substring(eqIdx + 1);
  if (!process.env[key]) process.env[key] = val;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ================================================================
// Test data
// ================================================================

const SEED_USERS = [
  { email: 'priya.sharma@test.com', first: 'Priya', last: 'Sharma', gender: 'female', dob: '1996-03-15', state: 'Maharashtra', city: 'Mumbai', specialty: ['Dermatology'], edu: 'completed_pg', religion: 'hindu', tongue: 'marathi', marital: 'first_marriage' },
  { email: 'rahul.patel@test.com', first: 'Rahul', last: 'Patel', gender: 'male', dob: '1994-08-22', state: 'Gujarat', city: 'Ahmedabad', specialty: ['Cardiology'], edu: 'completed_pg', religion: 'hindu', tongue: 'gujarati', marital: 'first_marriage' },
  { email: 'ananya.reddy@test.com', first: 'Ananya', last: 'Reddy', gender: 'female', dob: '1997-11-03', state: 'Telangana', city: 'Hyderabad', specialty: ['Ophthalmology'], edu: 'pursuing_pg', religion: 'hindu', tongue: 'telugu', marital: 'first_marriage' },
  { email: 'vikram.singh@test.com', first: 'Vikram', last: 'Singh', gender: 'male', dob: '1993-01-28', state: 'Delhi', city: 'New Delhi', specialty: ['Orthopedics'], edu: 'completed_pg', religion: 'sikh', tongue: 'punjabi', marital: 'first_marriage' },
  { email: 'sneha.nair@test.com', first: 'Sneha', last: 'Nair', gender: 'female', dob: '1995-06-10', state: 'Kerala', city: 'Kochi', specialty: ['Pediatrics'], edu: 'completed_pg', religion: 'hindu', tongue: 'malayalam', marital: 'first_marriage' },
  { email: 'arjun.mehta@test.com', first: 'Arjun', last: 'Mehta', gender: 'male', dob: '1996-09-17', state: 'Karnataka', city: 'Bangalore', specialty: ['General Surgery'], edu: 'pursuing_pg', religion: 'jain', tongue: 'hindi', marital: 'first_marriage' },
  { email: 'kavitha.iyer@test.com', first: 'Kavitha', last: 'Iyer', gender: 'female', dob: '1994-12-05', state: 'Tamil Nadu', city: 'Chennai', specialty: ['Psychiatry'], edu: 'completed_pg', religion: 'hindu', tongue: 'tamil', marital: 'first_marriage' },
  { email: 'rohit.gupta@test.com', first: 'Rohit', last: 'Gupta', gender: 'male', dob: '1995-04-20', state: 'Uttar Pradesh', city: 'Lucknow', specialty: ['Radiology'], edu: 'completed_pg', religion: 'hindu', tongue: 'hindi', marital: 'first_marriage' },
  { email: 'divya.krishnan@test.com', first: 'Divya', last: 'Krishnan', gender: 'female', dob: '1998-02-14', state: 'Karnataka', city: 'Bangalore', specialty: ['Anesthesiology'], edu: 'pursuing_pg', religion: 'hindu', tongue: 'kannada', marital: 'first_marriage' },
  { email: 'aditya.joshi@test.com', first: 'Aditya', last: 'Joshi', gender: 'male', dob: '1993-07-30', state: 'Maharashtra', city: 'Pune', specialty: ['ENT'], edu: 'completed_pg', religion: 'hindu', tongue: 'marathi', marital: 'divorced' },
  { email: 'meera.das@test.com', first: 'Meera', last: 'Das', gender: 'female', dob: '1997-05-08', state: 'West Bengal', city: 'Kolkata', specialty: ['Gynecology'], edu: 'completed_pg', religion: 'hindu', tongue: 'bengali', marital: 'first_marriage' },
  { email: 'karthik.raman@test.com', first: 'Karthik', last: 'Raman', gender: 'male', dob: '1996-10-12', state: 'Tamil Nadu', city: 'Coimbatore', specialty: ['Neurology'], edu: 'pursuing_pg', religion: 'hindu', tongue: 'tamil', marital: 'first_marriage' },
  { email: 'pooja.verma@test.com', first: 'Pooja', last: 'Verma', gender: 'female', dob: '1997-08-25', state: 'Madhya Pradesh', city: 'Bhopal', specialty: ['Pathology'], edu: 'mbbs_passed', religion: 'hindu', tongue: 'hindi', marital: 'first_marriage' },
  { email: 'sanjay.rao@test.com', first: 'Sanjay', last: 'Rao', gender: 'male', dob: '1995-03-18', state: 'Andhra Pradesh', city: 'Visakhapatnam', specialty: ['General Medicine'], edu: 'intern', religion: 'hindu', tongue: 'telugu', marital: 'first_marriage' },
  { email: 'nisha.kapoor@test.com', first: 'Nisha', last: 'Kapoor', gender: 'female', dob: '1996-01-07', state: 'Punjab', city: 'Chandigarh', specialty: ['Dermatology'], edu: 'mbbs_student', religion: 'hindu', tongue: 'punjabi', marital: 'first_marriage' },
];

// Pipeline: which users are at which stage
const UNVERIFIED = [0, 1, 2];           // form done, no payment
const VERIFICATION_PENDING = [3, 4, 5]; // fee paid, BGV in progress
const IN_POOL = [6, 7, 8];             // BGV done, ready for matching
const MATCHED = [9, 10, 11];           // in pool + have matches
const IN_PROGRESS = [12, 13, 14];      // still filling the form

async function main() {
  console.log('🌱 Seeding dashboard test data...\n');

  // Ensure admin test user exists
  const { data: existingUsers } = await admin.auth.admin.listUsers({ perPage: 1000 });
  let adminUser = existingUsers?.users?.find((u) => u.email === 'e2e-admin@samvayatest.com');
  if (!adminUser) {
    const { data } = await admin.auth.admin.createUser({
      email: 'e2e-admin@samvayatest.com',
      password: 'TestAdmin123!',
      email_confirm: true,
    });
    adminUser = data?.user;
    if (adminUser) {
      await admin.from('users').update({ role: 'admin' }).eq('id', adminUser.id);
      console.log('✅ Created admin user: e2e-admin@samvayatest.com');
    }
  } else {
    // Ensure admin role
    await admin.from('users').update({ role: 'admin' }).eq('id', adminUser.id);
  }
  const adminId = adminUser?.id;

  // ================================================================
  // 1. Create auth users
  // ================================================================
  const userIds = [];

  for (const su of SEED_USERS) {
    const existing = existingUsers?.users?.find((u) => u.email === su.email);
    if (existing) {
      userIds.push(existing.id);
      console.log(`  ⏭  ${su.first} ${su.last} (${su.email}) — already exists`);
      continue;
    }

    const { data, error } = await admin.auth.admin.createUser({
      email: su.email,
      email_confirm: true,
      user_metadata: { full_name: `${su.first} ${su.last}` },
    });

    if (error) {
      console.error(`  ❌ Failed: ${su.email} — ${error.message}`);
      userIds.push(null);
      continue;
    }

    userIds.push(data.user.id);
    console.log(`  ✅ ${su.first} ${su.last}`);
    await sleep(150); // let trigger fire
  }

  // ================================================================
  // 2. Set user statuses
  // ================================================================
  console.log('\n📊 Setting pipeline statuses...');

  for (let i = 0; i < SEED_USERS.length; i++) {
    const uid = userIds[i];
    if (!uid) continue;

    const update = {
      role: 'applicant',
      bgv_consent: 'consented',
    };

    if (UNVERIFIED.includes(i)) {
      Object.assign(update, {
        membership_status: 'onboarding_complete',
        payment_status: 'unverified',
        is_bgv_complete: false,
        onboarding_section: 13,
        onboarding_last_question: 100,
        profile_completion_pct: 100,
      });
    } else if (VERIFICATION_PENDING.includes(i)) {
      Object.assign(update, {
        membership_status: 'onboarding_complete',
        payment_status: 'verification_pending',
        is_bgv_complete: false,
        onboarding_section: 13,
        onboarding_last_question: 100,
        profile_completion_pct: 100,
      });
    } else if (IN_POOL.includes(i) || MATCHED.includes(i)) {
      Object.assign(update, {
        membership_status: 'onboarding_complete',
        payment_status: 'in_pool',
        is_bgv_complete: true,
        onboarding_section: 13,
        onboarding_last_question: 100,
        profile_completion_pct: 100,
      });
    } else if (IN_PROGRESS.includes(i)) {
      const sectionNum = 3 + (i - 12) * 3;
      const questionNum = 20 + (i - 12) * 15;
      const pct = 20 + (i - 12) * 20;
      Object.assign(update, {
        membership_status: 'onboarding_in_progress',
        payment_status: 'unverified',
        is_bgv_complete: false,
        onboarding_section: sectionNum,
        onboarding_last_question: questionNum,
        profile_completion_pct: pct,
      });
    }

    await admin.from('users').update(update).eq('id', uid);
  }

  // ================================================================
  // 3. Create profiles
  // ================================================================
  console.log('👤 Creating profiles...');

  for (let i = 0; i < SEED_USERS.length; i++) {
    const uid = userIds[i];
    if (!uid) continue;
    const su = SEED_USERS[i];

    const diets = ['vegetarian', 'non_vegetarian', 'eggetarian'];
    const fitness = ['regularly_exercises', 'occasionally', 'rarely'];
    const timelines = ['within_6_months', '6_to_12_months', '1_to_2_years'];

    await admin.from('profiles').upsert({
      user_id: uid,
      first_name: su.first,
      last_name: su.last,
      gender: su.gender,
      date_of_birth: su.dob,
      current_state: su.state,
      current_city: su.city,
      current_country: 'India',
      citizenship_country: 'India',
      religion: su.religion,
      mother_tongue: su.tongue,
      marital_status: su.marital,
      diet: diets[i % 3],
      fitness_habits: fitness[i % 3],
      marriage_timeline: timelines[i % 3],
    }, { onConflict: 'user_id' });
  }

  // ================================================================
  // 4. Create medical credentials
  // ================================================================
  console.log('🏥 Creating medical credentials...');

  for (let i = 0; i < SEED_USERS.length; i++) {
    const uid = userIds[i];
    if (!uid) continue;
    const su = SEED_USERS[i];

    await admin.from('medical_credentials').upsert({
      user_id: uid,
      current_status: su.edu,
      specialty: su.specialty,
      has_work_experience: su.edu === 'completed_pg',
    }, { onConflict: 'user_id' });
  }

  // ================================================================
  // 5. Create payments for verification_pending+ users
  // ================================================================
  console.log('💰 Creating payment records...');

  for (const idx of [...VERIFICATION_PENDING, ...IN_POOL, ...MATCHED]) {
    const uid = userIds[idx];
    if (!uid) continue;

    const { data: existing } = await admin.from('payments').select('id').eq('user_id', uid).maybeSingle();
    if (existing) continue;

    await admin.from('payments').insert({
      user_id: uid,
      payment_type: 'verification_fee',
      amount: 708000,
      currency: 'INR',
      verification_fee_paid: true,
      status: 'captured',
      paid_at: new Date(Date.now() - Math.random() * 14 * 86400000).toISOString(),
    });
  }

  // ================================================================
  // 6. Create match suggestions
  // ================================================================
  console.log('💕 Creating match suggestions...');

  const matchPairs = [
    { a: 6, b: 9, score: 87, rec: 'strongly_recommend', status: 'approved',
      narrative: 'Strong alignment on career ambition and family values. Both value independence while maintaining close family ties. Kavitha\'s structured communication style complements Aditya\'s reflective approach. Shared interest in classical arts and fitness. Geographic proximity (Tamil Nadu / Maharashtra) is manageable given both express relocation openness.' },
    { a: 7, b: 10, score: 74, rec: 'recommend', status: 'pending_review',
      narrative: 'Good lifestyle compatibility — both are fitness-oriented non-vegetarians with similar social energy levels. Rohit\'s career stability in Radiology pairs well with Meera\'s ambition in Gynecology. Mild concern on geographic alignment (UP vs West Bengal) but both indicated flexibility. Financial values are well-aligned.' },
    { a: 8, b: 11, score: 91, rec: 'strongly_recommend', status: 'approved',
      narrative: 'Exceptional match across multiple dimensions. Both are pursuing PG in Karnataka, share South Indian cultural background, and have remarkably similar life pace preferences. Strong emotional expressiveness scores for both. Family orientation closely aligned — both prefer nuclear family with openness to extended family visits. Divya\'s adventurous spirit complements Karthik\'s grounded nature.' },
  ];

  const suggestionIds = [];

  for (const pair of matchPairs) {
    const aId = userIds[pair.a];
    const bId = userIds[pair.b];
    if (!aId || !bId) { suggestionIds.push(null); continue; }

    const [profileA, profileB] = aId < bId ? [aId, bId] : [bId, aId];

    const { data: existing } = await admin
      .from('match_suggestions')
      .select('id')
      .eq('profile_a_id', profileA)
      .eq('profile_b_id', profileB)
      .maybeSingle();

    if (existing) {
      suggestionIds.push(existing.id);
      continue;
    }

    function dimScore(base) { return Math.min(100, Math.max(40, base - 5 + Math.floor(Math.random() * 10))); }

    const { data, error } = await admin
      .from('match_suggestions')
      .insert({
        profile_a_id: profileA,
        profile_b_id: profileB,
        overall_compatibility_score: pair.score,
        match_narrative: pair.narrative,
        recommendation: pair.rec,
        admin_status: pair.status,
        compatibility_report: {
          overall_score: pair.score,
          dimension_scores: {
            career_alignment: { score: dimScore(pair.score), weight: 0.15, notes: 'Career goals well-aligned' },
            values_alignment: { score: dimScore(pair.score), weight: 0.15, notes: 'Shared core values' },
            lifestyle_compatibility: { score: dimScore(pair.score), weight: 0.12, notes: 'Compatible daily habits' },
            relocation_compatibility: { score: dimScore(65), weight: 0.1, notes: 'Both open to relocation' },
            communication_compatibility: { score: dimScore(pair.score), weight: 0.12, notes: 'Communication styles complement' },
            family_orientation: { score: dimScore(pair.score), weight: 0.12, notes: 'Family values aligned' },
            financial_alignment: { score: dimScore(70), weight: 0.12, notes: 'Financial expectations compatible' },
            timeline_alignment: { score: dimScore(pair.score), weight: 0.06, notes: 'Marriage timeline compatible' },
            emotional_compatibility: { score: dimScore(pair.score), weight: 0.06, notes: 'Emotional expression complementary' },
          },
          highlights: ['Strong career alignment', 'Shared family values', 'Compatible lifestyle'],
          concerns: pair.score < 80 ? ['Geographic distance may require discussion'] : [],
          narrative: pair.narrative,
          recommendation: pair.rec,
        },
      })
      .select('id')
      .single();

    if (error) {
      console.error(`  ❌ Match suggestion error: ${error.message}`);
      suggestionIds.push(null);
    } else {
      suggestionIds.push(data.id);
      console.log(`  ✅ Match: ${SEED_USERS[pair.a].first} ↔ ${SEED_USERS[pair.b].first} (score: ${pair.score})`);
    }
  }

  // ================================================================
  // 7. Create a match presentation for the 91-score pair
  // ================================================================
  if (suggestionIds[2]) {
    const { data: existing } = await admin
      .from('match_presentations')
      .select('id')
      .eq('match_suggestion_id', suggestionIds[2])
      .maybeSingle();

    if (!existing) {
      await admin.from('match_presentations').insert({
        match_suggestion_id: suggestionIds[2],
        status: 'pending',
        member_a_response: 'pending',
        member_b_response: 'interested',
        presented_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        expires_at: new Date(Date.now() + 4 * 86400000).toISOString(),
      });
      console.log('  ✅ Presentation: Divya ↔ Karthik (awaiting response)');
    }
  }

  // ================================================================
  // 8. Create waitlist entries
  // ================================================================
  console.log('\n📋 Creating waitlist entries...');

  const waitlistEntries = [
    { full_name: 'Dr. Amit Deshmukh', email: 'amit.d@test.com', specialty: 'Cardiology', city: 'Nagpur', status: 'invited' },
    { full_name: 'Dr. Fatima Khan', email: 'fatima.k@test.com', specialty: 'Dermatology', city: 'Hyderabad', status: 'invited' },
    { full_name: 'Dr. Raghav Menon', email: 'raghav.m@test.com', specialty: 'Orthopedics', city: 'Thiruvananthapuram', status: 'pending' },
    { full_name: 'Dr. Swati Kulkarni', email: 'swati.k@test.com', specialty: 'Pediatrics', city: 'Pune', status: 'pending' },
    { full_name: 'Dr. Nikhil Banerjee', email: 'nikhil.b@test.com', specialty: 'Psychiatry', city: 'Kolkata', status: 'pending' },
    { full_name: 'Dr. Lakshmi Subramanian', email: 'lakshmi.s@test.com', specialty: 'Gynecology', city: 'Madurai', status: 'converted' },
    { full_name: 'Dr. Pranav Agarwal', email: 'pranav.a@test.com', specialty: 'Radiology', city: 'Jaipur', status: 'pending' },
    { full_name: 'Dr. Ritu Saxena', email: 'ritu.s@test.com', specialty: 'ENT', city: 'Lucknow', status: 'invited' },
  ];

  for (const entry of waitlistEntries) {
    const { data: existing } = await admin.from('waitlist').select('id').eq('email', entry.email).maybeSingle();
    if (existing) continue;

    await admin.from('waitlist').insert({
      full_name: entry.full_name,
      email: entry.email,
      phone: '98765' + String(Math.floor(Math.random() * 100000)).padStart(5, '0'),
      specialty: entry.specialty,
      city: entry.city,
      country: 'India',
      status: entry.status,
      career_stage: 'consultant',
    });
    console.log(`  ✅ ${entry.full_name} (${entry.status})`);
  }

  // ================================================================
  // 9. Create activity log entries (last 24h)
  // ================================================================
  console.log('\n📝 Creating activity log...');

  if (adminId) {
    const activities = [
      { action: 'marked_verification_paid', entity_type: 'user', idx: 3, hoursAgo: 2 },
      { action: 'moved_to_pool', entity_type: 'user', idx: 6, hoursAgo: 4 },
      { action: 'approved_match', entity_type: 'match_suggestion', idx: null, hoursAgo: 6 },
      { action: 'presented_match', entity_type: 'match_presentation', idx: null, hoursAgo: 8 },
      { action: 'added_note', entity_type: 'user', idx: 1, hoursAgo: 10 },
      { action: 'marked_verification_paid', entity_type: 'user', idx: 4, hoursAgo: 14 },
      { action: 'sent_email', entity_type: 'user', idx: 0, hoursAgo: 18 },
      { action: 'updated_bgv_check', entity_type: 'user', idx: 5, hoursAgo: 20 },
    ];

    for (const act of activities) {
      const entityId = act.idx !== null ? (userIds[act.idx] || adminId) : (suggestionIds[0] || adminId);
      await admin.from('activity_log').insert({
        actor_id: adminId,
        action: act.action,
        entity_type: act.entity_type,
        entity_id: entityId,
        metadata: {},
        created_at: new Date(Date.now() - act.hoursAgo * 3600000).toISOString(),
      });
    }
    console.log('  ✅ 8 activity log entries');
  }

  // ================================================================
  // 10. Create communication log entries
  // ================================================================
  console.log('✉️  Creating communication log...');

  if (adminId) {
    const comms = [
      { idx: 0, subject: 'Welcome to Samvaya — Your Application is Received', hoursAgo: 3 },
      { idx: 3, subject: 'Payment Confirmed — BGV Process Initiated', hoursAgo: 8 },
      { idx: 6, subject: 'You\'re in the Pool — Matching Has Begun', hoursAgo: 16 },
      { idx: 1, subject: 'Reminder: Complete Your Verification Fee', hoursAgo: 24 },
      { idx: 12, subject: 'Continue Your Application — Section D Awaits', hoursAgo: 36 },
      { idx: 2, subject: 'Your Form is Complete — Next Steps', hoursAgo: 48 },
    ];

    for (const c of comms) {
      const recipientId = userIds[c.idx];
      if (!recipientId) continue;

      await admin.from('communication_log').insert({
        user_id: recipientId,
        sent_by: adminId,
        channel: 'email',
        subject: c.subject,
        body: `Email body for: ${c.subject}`,
        status: 'sent',
        sent_at: new Date(Date.now() - c.hoursAgo * 3600000).toISOString(),
      });
    }
    console.log('  ✅ 6 communication log entries');
  }

  console.log('\n✅ Seed complete! Open http://localhost:3000/admin to review the dashboard.');
  console.log('\n📊 Pipeline summary:');
  console.log(`   Waitlist: 8 (3 invited, 4 pending, 1 converted)`);
  console.log(`   Signed up: 15 applicants`);
  console.log(`   Form in progress: 3`);
  console.log(`   Form complete: 12`);
  console.log(`   Payment verified: 9`);
  console.log(`   BGV complete / In pool: 6`);
  console.log(`   Match suggestions: 3 (2 approved, 1 pending review)`);
  console.log(`   Match presentations: 1 (awaiting response)`);
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
