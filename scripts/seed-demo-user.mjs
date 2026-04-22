#!/usr/bin/env node

/**
 * Seed a demo applicant with complete form data so you can preview the PWA.
 *
 * Usage:
 *   node scripts/seed-demo-user.mjs <email>
 *
 * The user must already exist in auth.users (i.e., they must have logged in at least once).
 * This script populates all form tables with realistic dummy data and sets
 * onboarding_section = 'completed' so the PWA renders the post-form experience.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch { /* rely on env vars */ }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/seed-demo-user.mjs <email>');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log(`\nSeeding demo data for: ${email}`);
  console.log('─'.repeat(50));

  // Find user by email
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const authUser = usersData?.users?.find((u) => u.email === email);

  if (!authUser) {
    console.error(`User not found in auth.users. Log in at least once first.`);
    process.exit(1);
  }

  const userId = authUser.id;
  console.log(`Found user: ${userId}`);

  // 1. Update users table — mark onboarding complete, set payment status
  // ai_conversation_status_enum: 'not_started','conv1_in_progress','conv1_complete','conv2_in_progress','conv2_complete','conv3_in_progress','all_complete'
  // onboarding_section is INTEGER in schema but layout checks === 'completed' (string)
  const { error: userErr } = await supabase
    .from('users')
    .update({
      role: 'applicant',
      payment_status: 'match_presented',
      membership_status: 'onboarding_complete',
      onboarding_section: 13,
      onboarding_last_question: 100,
      ai_conversation_status: 'all_complete',
      profile_completion_pct: 100,
      bgv_consent: 'consented',
      is_bgv_complete: true,
    })
    .eq('id', userId);

  if (userErr) console.error('users update failed:', userErr.message);
  else console.log('✓ users table updated');

  // 2. Upsert profiles
  // attire_preference_enum: 'modern_western','traditional','mix','no_preference'
  // fitness_habits_enum: 'regularly_exercises','occasionally','rarely','not_interested'
  // drinking_enum: 'never','occasionally','frequently'
  // tattoos_piercings_enum: 'none','tattoos_only','piercings_only','both'
  // marital_status_enum: 'first_marriage','divorced','widowed'
  // religious_observance_enum: 'actively_practicing','culturally_observant','spiritual','not_religious'
  // marriage_timeline_enum: 'within_6_months','6_to_12_months','1_to_2_years','no_fixed_timeline'
  // long_distance_enum: 'yes_absolutely','open_to_it','prefer_same_location'
  // family_arrangement_enum: 'nuclear','joint','flexible','no_preference'
  // working_expectation_enum: 'both_continue','comfortable_either_way','i_prefer_home','prefer_partner_home','open'
  // children_count_enum: '1','2','3_or_more','no_preference'
  // children_timing_enum: 'within_1_2_years','after_3_5_years','after_milestones','no_preference'
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({
      user_id: userId,
      first_name: 'Priya',
      last_name: 'Sharma',
      gender: 'female',
      referral_source: 'goocampus',
      marital_status: 'first_marriage',
      has_children_from_previous: false,
      date_of_birth: '1995-08-15',
      place_of_birth: 'Bengaluru',
      city_of_birth: 'Bengaluru',
      blood_group: 'B+',
      mother_tongue: 'Kannada',
      languages_spoken: ['Kannada', 'English', 'Hindi'],
      citizenship_country: 'India',
      current_country: 'India',
      current_state: 'Karnataka',
      current_city: 'Bengaluru',
      religion: 'Hindu',
      religious_observance: 'spiritual',
      believes_in_kundali: false,
      caste_comfort: false,
      father_name: 'Dr. Rajesh Sharma',
      father_occupation: 'Retired Cardiologist',
      mother_name: 'Sunita Sharma',
      mother_occupation: 'School Principal',
      siblings_count: 1,
      height_cm: 165,
      weight_kg: 58,
      diet: 'vegetarian',
      attire_preference: 'mix',
      fitness_habits: 'regularly_exercises',
      smoking: 'never',
      drinking: 'occasionally',
      tattoos_piercings: 'none',
      has_disability: 'no',
      has_allergies: false,
      hobbies_interests: ['Reading', 'Yoga', 'Travel', 'Classical Music', 'Cooking', 'Photography'],
      hobbies_regular: 'I practice yoga every morning and try to read at least 30 minutes before bed. On weekends, I love exploring new cafés and cooking elaborate meals.',
      marriage_timeline: '6_to_12_months',
      long_distance_comfort: 'open_to_it',
      post_marriage_family_arrangement: 'nuclear',
      both_partners_working_expectation: 'both_continue',
      wants_children: 'yes',
      children_count_preference: '2',
      children_timing_preference: 'after_3_5_years',
      preferred_settlement_countries: ['India'],
      open_to_immediate_relocation: 'open',
      plans_to_go_abroad: false,
    }, { onConflict: 'user_id' });

  if (profileErr) console.error('profiles upsert failed:', profileErr.message);
  else console.log('✓ profiles table seeded');

  // 3. Upsert medical_credentials
  // medical_status_enum: 'mbbs_student','intern','mbbs_passed','pursuing_pg','completed_pg'
  const { error: medErr } = await supabase
    .from('medical_credentials')
    .upsert({
      user_id: userId,
      current_status: 'pursuing_pg',
      additional_qualifications: ['DNB'],
      specialty: ['Dermatology'],
      has_work_experience: true,
      work_experience: [
        {
          org_name: 'St. John\'s Medical College Hospital',
          designation: 'Junior Resident',
          start_month: '01',
          start_year: '2022',
          end_month: '',
          end_year: '',
          is_current: true,
        },
        {
          org_name: 'Victoria Hospital, Bengaluru',
          designation: 'House Surgeon',
          start_month: '06',
          start_year: '2020',
          end_month: '12',
          end_year: '2021',
          is_current: false,
        },
      ],
      current_designation: 'Junior Resident',
      total_experience_months: 48,
    }, { onConflict: 'user_id' });

  if (medErr) console.error('medical_credentials upsert failed:', medErr.message);
  else console.log('✓ medical_credentials table seeded');

  // 4. Upsert partner_preferences
  // drinking_preference_enum: 'never','occasionally','frequently','no_preference'
  // fitness_preference_enum: 'regularly_exercises','occasionally','rarely','no_preference'
  // smoking_preference_enum: 'never','occasionally','frequently','no_preference'
  // tattoo_preference_enum: 'none','tattoos_only','piercings_only','both','no_preference'
  // religious_observance_preference_enum: 'actively_practicing','culturally_observant','spiritual','not_religious','no_preference'
  // partner_career_expectation_enum: 'both_continue','comfortable_either_way','prefer_partner_home','open'
  // family_arrangement_enum: 'nuclear','joint','flexible','no_preference'
  const { error: prefErr } = await supabase
    .from('partner_preferences')
    .upsert({
      user_id: userId,
      preferred_age_min: 28,
      preferred_age_max: 35,
      preferred_height_min_cm: 170,
      preferred_height_max_cm: 190,
      prefers_specific_specialty: false,
      preferred_indian_states: ['Karnataka', 'Maharashtra', 'Tamil Nadu'],
      preferred_countries: ['India'],
      no_location_preference: false,
      preferred_mother_tongue: ['Kannada', 'Hindi', 'English'],
      diet_preference: ['vegetarian', 'eggetarian'],
      fitness_preference: 'regularly_exercises',
      smoking_preference: 'never',
      drinking_preference: 'occasionally',
      tattoo_preference: 'no_preference',
      family_type_preference: 'nuclear',
      religious_observance_preference: 'no_preference',
      partner_career_expectation_after_marriage: 'both_continue',
      partner_qualities: ['Kind', 'Ambitious', 'Good communicator', 'Family-oriented', 'Emotionally mature'],
    }, { onConflict: 'user_id' });

  if (prefErr) console.error('partner_preferences upsert failed:', prefErr.message);
  else console.log('✓ partner_preferences table seeded');

  // 5. Upsert compatibility_profiles
  // communication_style_enum: 'direct','indirect','avoidant','expressive','reserved'
  // conflict_approach_enum: 'addresses_immediately','reflects_first','withdraws','collaborative'
  // partner_role_vision_enum: 'co_builder','anchor_complement','flexible'
  // financial_values_enum: 'financially_intentional','financially_casual','financially_anxious','not_discussed'
  const { error: compErr } = await supabase
    .from('compatibility_profiles')
    .upsert({
      user_id: userId,
      family_orientation_score: 78,
      family_orientation_notes: 'Values close family ties but equally committed to building an independent life.',
      career_ambition_score: 85,
      career_ambition_notes: 'Highly driven in her medical career, with plans to specialize further.',
      independence_vs_togetherness_score: 62,
      independence_vs_togetherness_notes: 'Comfortable with personal space. Believes healthy relationships need individuality.',
      emotional_expressiveness_score: 72,
      emotional_expressiveness_notes: 'Articulate about feelings when comfortable. Prefers honest, direct conversations.',
      social_orientation_score: 65,
      social_orientation_notes: 'Enjoys small gatherings over large social events.',
      traditionalism_score: 35,
      traditionalism_notes: 'Progressive on most cultural matters. Open to interfaith relationships.',
      relocation_openness_score: 70,
      relocation_openness_notes: 'Open to relocating within India for the right opportunity. Prefers metro cities.',
      life_pace_score: 60,
      life_pace_notes: 'Balances busy work schedule with intentional downtime.',
      communication_style: 'direct',
      conflict_approach: 'addresses_immediately',
      partner_role_vision: 'co_builder',
      financial_values: 'financially_intentional',
      ai_personality_summary: 'Priya is a thoughtful, career-driven dermatologist who balances ambition with warmth. She values intellectual compatibility and emotional depth over surface-level attraction. Her ideal partnership is one of equals — both supporting each other\'s growth while building a shared life.',
      ai_compatibility_keywords: ['intellectually curious', 'emotionally mature', 'career-driven', 'family-connected', 'progressive', 'direct communicator'],
      key_quote: 'I want someone who gets excited about their own goals the way I get excited about mine — and then we celebrate each other.',
      closing_freeform_note: 'I believe marriage should be a partnership between two complete individuals who choose to grow together.',
      extraction_model_version: 'claude-sonnet-4-20250514',
    }, { onConflict: 'user_id' });

  if (compErr) console.error('compatibility_profiles upsert failed:', compErr.message);
  else console.log('✓ compatibility_profiles table seeded');

  // 6. Insert a payment record
  // payment_type_enum: 'verification_fee','membership_fee','membership_renewal'
  // First delete any existing payment for this user to avoid duplicates
  await supabase.from('payments').delete().eq('user_id', userId);

  const { error: payErr } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      payment_type: 'verification_fee',
      amount: 708000,
      currency: 'INR',
      verification_fee_paid: true,
      status: 'captured',
      paid_at: new Date().toISOString(),
    });

  if (payErr) console.error('payments insert failed:', payErr.message);
  else console.log('✓ payments table seeded');

  console.log('─'.repeat(50));
  console.log('\nDone! Your demo user is ready.');
  console.log('Visit http://localhost:3000/app to see the PWA.');
  console.log(`\nUser status: match_presented`);
  console.log('You should see the full post-onboarding PWA with:');
  console.log('  - Status dashboard (home)');
  console.log('  - Profile view');
  console.log('  - Settings page');
  console.log('  - Bottom navigation bar');
}

seed().catch((err) => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
