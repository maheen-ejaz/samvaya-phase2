import { test as setup, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load env vars from .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.substring(0, eqIdx);
  const val = trimmed.substring(eqIdx + 1);
  if (!process.env[key]) process.env[key] = val;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TEST_ADMIN_EMAIL = 'e2e-admin@samvayatest.com';
const TEST_ADMIN_PASSWORD = 'TestAdmin123!';

setup('authenticate as admin', async ({ page }) => {
  setup.setTimeout(60000);

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Create admin test user if needed
  const { data: existingUsers } = await adminClient.auth.admin.listUsers();
  let adminUser = existingUsers?.users?.find((u) => u.email === TEST_ADMIN_EMAIL);

  if (!adminUser) {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    adminUser = data.user!;
    await adminClient.from('users').update({ role: 'admin' }).eq('id', adminUser.id);
  }

  // Ensure user has admin role
  const { data: userRecord } = await adminClient.from('users').select('role').eq('id', adminUser.id).single();
  if (!userRecord || (userRecord.role !== 'admin' && userRecord.role !== 'super_admin')) {
    await adminClient.from('users').update({ role: 'admin' }).eq('id', adminUser.id);
  }

  // Sign in with password to get session
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
    email: TEST_ADMIN_EMAIL,
    password: TEST_ADMIN_PASSWORD,
  });

  if (signInError || !signInData.session) {
    throw new Error(`Failed to sign in: ${signInError?.message || 'No session'}`);
  }

  const { access_token, refresh_token } = signInData.session;

  // Navigate to login page first to set domain context
  await page.goto('/auth/login');
  await page.waitForLoadState('domcontentloaded');

  // Supabase SSR (@supabase/ssr) stores session in chunked cookies
  // The cookie name pattern is: sb-<project-ref>-auth-token.0, .1, etc.
  const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];
  const cookieBase = `sb-${projectRef}-auth-token`;

  // Encode session data as base64
  const sessionPayload = JSON.stringify({
    access_token,
    refresh_token,
    expires_at: signInData.session.expires_at,
    expires_in: signInData.session.expires_in,
    token_type: 'bearer',
    type: 'access',
    user: signInData.session.user,
  });

  // Supabase SSR uses base64url encoded chunks
  const encoded = Buffer.from(sessionPayload).toString('base64');

  // Split into chunks of 3180 chars (Supabase SSR default)
  const CHUNK_SIZE = 3180;
  const chunks = [];
  for (let i = 0; i < encoded.length; i += CHUNK_SIZE) {
    chunks.push(encoded.substring(i, i + CHUNK_SIZE));
  }

  const cookies = chunks.map((chunk, i) => ({
    name: chunks.length === 1 ? cookieBase : `${cookieBase}.${i}`,
    value: `base64-${chunk}`,
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'Lax' as const,
  }));

  await page.context().addCookies(cookies);

  // Navigate to admin
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');

  // Verify we landed on admin
  await expect(page).toHaveURL(/\/admin/);

  // Save authenticated state
  await page.context().storageState({ path: 'e2e/.auth/admin.json' });
});
