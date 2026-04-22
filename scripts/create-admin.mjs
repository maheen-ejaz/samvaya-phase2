#!/usr/bin/env node

/**
 * Create an admin user in Supabase.
 *
 * Usage:
 *   node scripts/create-admin.mjs <email> [role]
 *
 * Arguments:
 *   email  - The admin user's email address
 *   role   - 'admin' or 'super_admin' (default: 'super_admin')
 *
 * Prerequisites:
 *   - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set
 *     in .env.local or as environment variables
 *
 * What it does:
 *   1. Creates the user in Supabase Auth (sends invite email)
 *   2. Sets their role in the public.users table
 *   3. Sets membership_status to 'onboarding_complete' (so they skip the form)
 *
 * The user will receive an email invite. After clicking the link and
 * confirming, they can log in at /auth/login and will be routed to /admin.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local if present
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
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local not found — rely on environment variables
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  console.error('Set them in .env.local or as environment variables.');
  process.exit(1);
}

const email = process.argv[2];
const role = process.argv[3] || 'super_admin';

if (!email) {
  console.error('Usage: node scripts/create-admin.mjs <email> [role]');
  console.error('  role: admin | super_admin (default: super_admin)');
  process.exit(1);
}

if (!['admin', 'super_admin'].includes(role)) {
  console.error(`Error: role must be 'admin' or 'super_admin', got '${role}'`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createAdmin() {
  console.log(`\nCreating ${role} account for: ${email}`);
  console.log('─'.repeat(50));

  // Step 1: Check if user already exists in Auth
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);

  let userId;

  if (existing) {
    userId = existing.id;
    console.log(`User already exists in Auth (ID: ${userId})`);
  } else {
    // Create user via invite (sends email)
    const { data: invited, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email);

    if (inviteError) {
      console.error(`Failed to invite user: ${inviteError.message}`);
      process.exit(1);
    }

    userId = invited.user.id;
    console.log(`Invited user via email (ID: ${userId})`);
  }

  // Step 2: Upsert into public.users with admin role
  const { error: upsertError } = await supabase
    .from('users')
    .upsert(
      {
        id: userId,
        role: role,
        membership_status: 'onboarding_complete',
        payment_status: 'unverified',
      },
      { onConflict: 'id' }
    );

  if (upsertError) {
    console.error(`Failed to set role: ${upsertError.message}`);
    console.error('You may need to manually run:');
    console.error(`  UPDATE users SET role = '${role}' WHERE id = '${userId}';`);
    process.exit(1);
  }

  console.log(`Set role to '${role}' in users table`);
  console.log('─'.repeat(50));
  console.log('\nDone! Next steps:');
  if (!existing) {
    console.log(`  1. ${email} will receive an invite email`);
    console.log('  2. Click the link to confirm the account');
  }
  console.log(`  ${existing ? '1' : '3'}. Log in at https://app.samvayamatrimony.com/auth/login`);
  console.log(`  ${existing ? '2' : '4'}. You'll be routed to /admin automatically`);
}

createAdmin().catch((err) => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
