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

  // Verify the path belongs to this user and block path traversal
  if (!storagePath.startsWith(`${user.id}/`) || storagePath.includes('..')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // SEC-28: Validate file size (max 50MB)
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(storagePath);

    if (downloadError || !fileData) {
      console.error('Failed to download document for validation:', downloadError);
      return NextResponse.json({ error: 'Failed to validate document' }, { status: 500 });
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());

    // Reject empty or corrupt files (need at least 4 bytes for magic byte check)
    if (buffer.length < 4) {
      await supabase.storage.from('documents').remove([storagePath]);
      return NextResponse.json({ error: 'File is too small or corrupted' }, { status: 400 });
    }

    const MAX_DOC_SIZE = 50 * 1024 * 1024; // 50MB
    if (buffer.length > MAX_DOC_SIZE) {
      // Clean up oversized file
      await supabase.storage.from('documents').remove([storagePath]);
      return NextResponse.json({ error: 'Document exceeds maximum size of 50MB' }, { status: 400 });
    }

    // SEC-29: Validate file type via magic bytes
    const MAGIC_BYTES: Record<string, number[]> = {
      pdf: [0x25, 0x50, 0x44, 0x46],       // %PDF
      jpeg: [0xFF, 0xD8, 0xFF],             // JPEG SOI
      png: [0x89, 0x50, 0x4E, 0x47],        // PNG header
    };

    const header = Array.from(buffer.subarray(0, 4));
    const isValidType = Object.values(MAGIC_BYTES).some((magic) =>
      magic.every((byte, i) => header[i] === byte)
    );

    if (!isValidType) {
      await supabase.storage.from('documents').remove([storagePath]);
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, JPEG, and PNG files are accepted.' },
        { status: 400 }
      );
    }

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
