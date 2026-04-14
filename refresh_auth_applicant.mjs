import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf-8');
const envVars = {};
for (const line of env.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const idx = t.indexOf('=');
  if (idx === -1) continue;
  envVars[t.slice(0, idx)] = t.slice(idx + 1);
}

const SUPABASE_URL = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_KEY = envVars['SUPABASE_SERVICE_ROLE_KEY'];
const TEST_EMAIL = 'maheenejaz@goocampus.in';

// Use service role to generate a magic link / sign-in link for the test user
const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

// Generate a session using admin.generateLink (sign-in OTP)
// Better: use admin.createSession directly (Supabase supports this via service key)
const { data: userData } = await admin.auth.admin.listUsers();
const user = userData?.users?.find(u => u.email === TEST_EMAIL);

if (!user) {
  console.error(`User ${TEST_EMAIL} not found in Supabase`);
  process.exit(1);
}

console.log(`Found user: ${user.email}, id: ${user.id}`);

// Create a session using the admin API
const { data: sessionData, error: sessionError } = await admin.auth.admin.createSession(user.id);
if (sessionError || !sessionData?.session) {
  console.error('Session error:', sessionError?.message);
  process.exit(1);
}

const { access_token, refresh_token, expires_at, expires_in } = sessionData.session;
const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];
const cookieBase = `sb-${projectRef}-auth-token`;

const payload = JSON.stringify({ access_token, refresh_token, expires_at, expires_in, token_type: 'bearer', type: 'access', user });
const encoded = Buffer.from(payload).toString('base64');
const CHUNK = 3180;
const chunks = [];
for (let i = 0; i < encoded.length; i += CHUNK) chunks.push(encoded.slice(i, i + CHUNK));

const cookies = chunks.map((chunk, i) => ({
  name: chunks.length === 1 ? cookieBase : `${cookieBase}.${i}`,
  value: `base64-${chunk}`,
  domain: 'localhost',
  path: '/',
  httpOnly: false,
  secure: false,
  sameSite: 'Lax',
}));

writeFileSync('e2e/.auth/applicant.json', JSON.stringify({ cookies, origins: [] }, null, 2));
console.log(`✅ Applicant auth: ${cookies.length} cookie chunk(s), user: ${user.email}`);
