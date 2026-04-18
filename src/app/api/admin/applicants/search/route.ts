import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface ProfileRow {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').trim();

    if (q.length < 2) {
      return NextResponse.json({ applicants: [] });
    }

    // Search profiles by first_name or last_name (case-insensitive)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name')
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ applicants: [] });
    }

    // Batch-fetch all auth users once instead of N+1 individual calls
    const adminSupabase = createAdminClient();
    const { data: authResult } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });
    const emailMap = new Map(
      (authResult?.users || []).map((u) => [u.id, u.email || ''])
    );

    const applicants = (profiles as ProfileRow[]).map((p) => ({
      userId: p.user_id,
      name: [p.first_name, p.last_name].filter(Boolean).join(' '),
      email: emailMap.get(p.user_id) ?? null,
      phone: null,
    }));

    return NextResponse.json({ applicants });
  } catch (err) {
    console.error('[GET /api/admin/applicants/search]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
