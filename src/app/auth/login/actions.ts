"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

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
  const { allowed } = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
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

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email,
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
