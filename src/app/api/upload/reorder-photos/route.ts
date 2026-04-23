import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isValidUUID } from '@/lib/validation';

interface ReorderPhotosRequest {
  ids: string[];
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: ReorderPhotosRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { ids } = body;
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string' && isValidUUID(id))) {
    return NextResponse.json({ error: 'Invalid ids' }, { status: 400 });
  }

  try {
    for (let i = 0; i < ids.length; i++) {
      const { error } = await supabase
        .from('photos')
        .update({ display_order: i })
        .eq('id', ids[i])
        .eq('user_id', user.id);
      if (error) {
        console.error('Failed to update display_order:', error);
        return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Reorder photos failed:', err);
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}
