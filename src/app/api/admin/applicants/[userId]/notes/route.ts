import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, validateUserId } from '@/lib/admin/auth';
import { logActivity } from '@/lib/admin/activity';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const { admin } = result;

  const { userId } = await params;
  const idError = validateUserId(userId);
  if (idError) return idError;

  let body: { noteText?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const noteText = body.noteText?.trim();
  if (!noteText) {
    return NextResponse.json({ error: 'Note text is required' }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase.from('admin_notes' as never).insert({
    entity_type: 'user',
    entity_id: userId,
    admin_user_id: admin.id,
    note_text: noteText,
  } as never);

  if (error) {
    console.error('Failed to insert note:', error);
    return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
  }

  await logActivity(admin.id, 'added_note', 'user', userId);

  return NextResponse.json({ success: true });
}
