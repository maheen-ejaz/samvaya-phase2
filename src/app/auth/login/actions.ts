"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Test bypass is permitted only in non-production builds. `VERCEL_ENV` is
 * the authoritative production marker on Vercel (prod vs preview vs dev);
 * `NODE_ENV` covers local dev and any non-Vercel host. Both checks run
 * server-side — no public env var is consulted so an accidentally-set flag
 * cannot ship the bypass to real users.
 */
function isTestLoginAllowed(): boolean {
  if (process.env.VERCEL_ENV === "production") return false;
  return process.env.NODE_ENV !== "production";
}

export async function sendOtp(email: string) {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { error: "Please enter a valid email address." };
  }

  // Canonicalize email for rate limiting — strip +suffix to prevent bypass
  // e.g., "user+spam@gmail.com" → "user@gmail.com"
  const [localPart, domain] = normalizedEmail.split('@');
  const canonicalLocal = localPart.includes('+') ? localPart.split('+')[0] : localPart;
  const rateLimitKey = `otp:${canonicalLocal}@${domain}`;

  // Rate limit: 5 OTP requests per email per 15 minutes
  const { allowed } = await checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
  if (!allowed) {
    return { error: "Too many attempts. Please wait 15 minutes before trying again." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function verifyOtp(email: string, token: string) {
  if (!token || !/^\d{6}$/.test(token)) {
    return { error: "Please enter a valid 6-digit code." };
  }

  const normalizedEmail = email?.trim().toLowerCase();

  // Rate limit OTP verification: 5 attempts per email per 15 minutes
  const { allowed } = await checkRateLimit(`otp-verify:${normalizedEmail}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return { error: "Too many verification attempts. Please request a new code." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email: normalizedEmail,
    token,
    type: "email",
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

/**
 * Testing shortcut — bypasses OTP entirely. Creates (or reuses) a single fixed
 * test applicant account and signs them in via an admin-generated magic link
 * token. No email is sent. Remove once real applicants begin onboarding.
 */
const TEST_APPLICANT_EMAIL = "testform@samvaya.test";

export async function beginTestSession() {
  if (!isTestLoginAllowed()) {
    return { error: "Test login is disabled in this environment." };
  }

  // Rate-limit with a global key (server actions have no request object, so we
  // can't do per-IP). A generous window still blocks trivial abuse.
  const { allowed } = await checkRateLimit(
    "test-session:global",
    20,
    15 * 60 * 1000,
  );
  if (!allowed) {
    return { error: "Too many test sessions started. Please wait a few minutes." };
  }

  const admin = createAdminClient();

  // Ensure the test applicant exists. `listUsers` + filter is acceptable for a
  // test-only path; Supabase has no "get user by email" admin endpoint.
  const { data: listed, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) {
    return { error: `Admin list failed: ${listErr.message}` };
  }
  const existing = listed.users.find((u) => u.email === TEST_APPLICANT_EMAIL);
  let testUserId: string;

  if (!existing) {
    const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
      email: TEST_APPLICANT_EMAIL,
      email_confirm: true,
    });
    if (createErr) {
      return { error: `Admin create failed: ${createErr.message}` };
    }
    testUserId = newUser.user.id;
  } else {
    testUserId = existing.id;
  }

  // Q4 (phone) is required in Section A. Ensure the test user always has a fake
  // phone so `answers['Q4']` is non-empty and the form can proceed past Section A.
  if (!existing?.phone) {
    await admin.auth.admin.updateUserById(testUserId, {
      phone: '+919999999999',
      phone_confirm: true,
    });
  }

  // Generate a magic-link token and exchange it for a cookie-backed session.
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: TEST_APPLICANT_EMAIL,
  });
  if (linkErr || !linkData.properties?.hashed_token) {
    return { error: linkErr?.message ?? "Could not generate test session" };
  }

  const supabase = await createClient();
  const { error: verifyErr } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "magiclink",
  });
  if (verifyErr) {
    return { error: verifyErr.message };
  }

  return { success: true };
}
