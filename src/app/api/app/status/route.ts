import { NextResponse } from 'next/server';
import { requireApplicant } from '@/lib/app/auth';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET() {
  const result = await requireApplicant();
  if (result.error) return result.error;

  const { allowed } = checkRateLimit(`status-read:${result.user.id}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
  }

  const supabase = await createClient();

  const { data: userDataRaw } = await supabase
    .from('users')
    .select('payment_status, is_goocampus_member')
    .eq('id', result.user.id)
    .single();
  const userData = userDataRaw as Record<string, unknown> | null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('user_id', result.user.id)
    .single();

  // Fetch membership dates from payments table
  const { data: paymentRaw } = await supabase
    .from('payments')
    .select('membership_start_date, membership_end_date')
    .eq('user_id', result.user.id)
    .single();
  const payment = paymentRaw as Record<string, unknown> | null;

  return NextResponse.json({
    userId: result.user.id,
    firstName: profile?.first_name ?? null,
    paymentStatus: userData?.payment_status ?? 'unverified',
    isGoocampusMember: userData?.is_goocampus_member ?? false,
    membershipStartDate: payment?.membership_start_date ?? null,
    membershipEndDate: payment?.membership_end_date ?? null,
  });
}
