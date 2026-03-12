import { NextRequest, NextResponse } from 'next/server';
import { requireApplicant } from '@/lib/app/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ presentationId: string }> }
) {
  const result = await requireApplicant();
  if (result.error) return result.error;

  const { presentationId } = await params;
  const userId = result.user.id;

  try {
    const body = await request.json();
    const { response } = body;

    // Validate input before calling RPC
    if (response !== 'interested' && response !== 'not_interested') {
      return NextResponse.json(
        { error: 'response must be "interested" or "not_interested"' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Call atomic RPC — handles locking, validation, expiry, mutual interest in one transaction
    const { data, error: rpcError } = await supabase.rpc(
      'handle_match_response' as never,
      {
        p_presentation_id: presentationId,
        p_user_id: userId,
        p_response: response,
      } as never
    );

    if (rpcError) {
      console.error('RPC error:', rpcError);
      return NextResponse.json(
        { error: 'Failed to record response' },
        { status: 500 }
      );
    }

    const rpcResult = data as Record<string, unknown>;

    // RPC returns error objects for validation failures
    if (rpcResult.error) {
      return NextResponse.json(
        { error: rpcResult.error },
        { status: (rpcResult.status_code as number) || 400 }
      );
    }

    return NextResponse.json({
      success: rpcResult.success,
      status: rpcResult.status,
      is_mutual_interest: rpcResult.is_mutual_interest,
    });
  } catch (err) {
    console.error('User respond error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
