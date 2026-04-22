import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iqpcrjofhwollksgevqo.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxcGNyam9maHdvbGxrc2dldnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzU4NjAsImV4cCI6MjA4ODcxMTg2MH0.6uYH9tfyHAELY5RJ5h2I9oMy4_OlkA2JBBBpg94jz4o';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxcGNyam9maHdvbGxrc2dldnFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzEzNTg2MCwiZXhwIjoyMDg4NzExODYwfQ.sTvYDxX_2jcd2HdAWAlLh3v8nwT38FSFWaO43yjyKdY';

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});
const anon = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Generate and immediately exchange in one shot
const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
  type: 'magiclink',
  email: 'maheenejaz@goocampus.in',
});
if (linkErr) { console.error('generateLink error:', linkErr.message); process.exit(1); }

const token = linkData.properties.hashed_token;

// Exchange immediately
const { data: otpData, error: otpErr } = await anon.auth.verifyOtp({
  email: 'maheenejaz@goocampus.in',
  token,
  type: 'magiclink',
});
if (otpErr) { console.error('verifyOtp error:', otpErr.message); process.exit(1); }

const session = otpData.session;
console.log(JSON.stringify({
  access_token: session.access_token,
  refresh_token: session.refresh_token,
  expires_at: session.expires_at,
}));
