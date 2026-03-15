import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

const VALID_DOCUMENT_TYPES = ['identity_document', 'kundali', 'other'] as const;

interface RegisterDocumentRequest {
  storagePath: string;
  documentType: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: max 20 document uploads per hour per user
  const { allowed } = checkRateLimit(`doc-upload:${user.id}`, 20, 3600_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many uploads. Please try again later.' }, { status: 429 });
  }

  let body: RegisterDocumentRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { storagePath, documentType } = body;

  if (!storagePath || !documentType) {
    return NextResponse.json({ error: 'Missing storagePath or documentType' }, { status: 400 });
  }

  // Validate document type
  if (!VALID_DOCUMENT_TYPES.includes(documentType as typeof VALID_DOCUMENT_TYPES[number])) {
    return NextResponse.json({ error: 'Invalid documentType' }, { status: 400 });
  }

  // Verify the path belongs to this user
  if (!storagePath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { data: docRow, error: insertError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        document_type: documentType,
        storage_path: storagePath,
        verification_status: 'pending',
      } as never)
      .select()
      .single();

    if (insertError) {
      console.error('Failed to save document record:', insertError);
      return NextResponse.json(
        { error: 'Failed to save document record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, document: docRow });
  } catch (err) {
    console.error('Document registration failed:', err);
    return NextResponse.json({ error: 'Failed to save document record' }, { status: 500 });
  }
}
