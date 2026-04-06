import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const result = await requireAdmin();
  if (result.error) return result.error;

  const { userId } = await params;
  const idError = validateUserId(userId);
  if (idError) return idError;

  const supabase = createAdminClient();

  const [{ data: user }, { data: profile }, { data: photo }, { data: medical }] = await Promise.all([
    supabase
      .from('users')
      .select('payment_status, profile_completion_pct, created_at, is_bgv_complete, is_goocampus_member, membership_status')
      .eq('id', userId)
      .single(),
    supabase
      .from('profiles')
      .select('first_name, last_name, date_of_birth, current_city, current_state, gender, religion')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('photos')
      .select('blurred_path, storage_path')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .maybeSingle(),
    supabase
      .from('medical_credentials')
      .select('specialty')
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Calculate age from date_of_birth
  let age: number | null = null;
  if (profile?.date_of_birth) {
    const dob = new Date(profile.date_of_birth);
    const today = new Date();
    age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  }

  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || null;

  return NextResponse.json({
    name,
    age,
    gender: profile?.gender ?? null,
    specialty: medical?.specialty ?? [],
    religion: profile?.religion ?? null,
    location: [profile?.current_city, profile?.current_state].filter(Boolean).join(', ') || null,
    registrationDate: user.created_at,
    paymentStatus: user.payment_status,
    formProgress: user.profile_completion_pct ?? 0,
    isGoocampusMember: user.is_goocampus_member,
    bgvStatus: user.is_bgv_complete,
    membershipStatus: user.membership_status,
    photoUrl: photo?.blurred_path ?? photo?.storage_path ?? null,
  });
}
