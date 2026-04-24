import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';

// Allow unicode letters, space, hyphen, apostrophe. Reject PostgREST-reserved
// chars that could inject extra filter clauses: , ( ) \ : .
const SEARCH_REJECT_REGEX = /[,()\\:.]/;
const SEARCH_ALLOW_REGEX = /^[\p{L}\s'\-]+$/u;

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

    const { allowed } = await checkRateLimit(`admin-search:${user.id}`, 30, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again in a moment.' }, { status: 429 });
    }

    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').trim();

    if (q.length < 2) {
      return NextResponse.json({ applicants: [] });
    }

    if (q.length > 100 || SEARCH_REJECT_REGEX.test(q) || !SEARCH_ALLOW_REGEX.test(q)) {
      return NextResponse.json(
        { error: 'Search query contains invalid characters. Use letters, spaces, hyphens, or apostrophes only.' },
        { status: 400 }
      );
    }

    // Search profiles by first_name or last_name (case-insensitive)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name')
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
      .limit(10);

    if (error) {
      console.error('[GET /api/admin/applicants/search] db error:', error.message);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
