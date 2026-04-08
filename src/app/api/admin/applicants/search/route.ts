import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').trim();

    if (q.length < 2) {
      return new Response(JSON.stringify({ applicants: [] }), { status: 200 });
    }

    // Search profiles by first_name or last_name (case-insensitive)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name')
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
      .limit(10) as any;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ applicants: [] }), { status: 200 });
    }

    // Fetch emails from auth.users via admin client
    const adminSupabase = createAdminClient();
    const userIds: string[] = profiles.map((p: any) => p.user_id);

    // Batch-fetch auth users to get emails
    const emailMap = new Map<string, string>();
    await Promise.all(
      userIds.map(async (uid: string) => {
        try {
          const { data } = await adminSupabase.auth.admin.getUserById(uid);
          if (data?.user?.email) emailMap.set(uid, data.user.email);
        } catch {
          // skip
        }
      })
    );

    const applicants = profiles.map((p: any) => ({
      userId: p.user_id,
      name: [p.first_name, p.last_name].filter(Boolean).join(' '),
      email: emailMap.get(p.user_id) ?? null,
      phone: null, // phone not stored in typed profiles — left null
    }));

    return new Response(JSON.stringify({ applicants }), { status: 200 });
  } catch (err) {
    console.error('[GET /api/admin/applicants/search]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
