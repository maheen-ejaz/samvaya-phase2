import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

type AdminClient = ReturnType<typeof createAdminClient>;

interface TokenRow {
  token: string;
  match_presentation_id: string;
  expires_at: string;
}

type TokenTable = {
  from: (table: 'match_share_tokens') => {
    insert: (row: Omit<TokenRow, 'id' | 'created_at'>) => Promise<{ error: { message: string } | null }>;
    select: (cols?: string) => {
      eq: (col: string, val: string) => {
        single: () => Promise<{ data: TokenRow | null; error: { message: string } | null }>;
      };
    };
  };
};

/** Generate a share token for a match. One per presentation (idempotent — returns existing if duplicate). */
export async function generateMatchToken(
  client: AdminClient,
  matchPresentationId: string,
  expiresAt: string
): Promise<string> {
  const token = crypto.randomUUID();
  const db = client as unknown as TokenTable;

  const { error } = await db.from('match_share_tokens').insert({
    token,
    match_presentation_id: matchPresentationId,
    expires_at: expiresAt,
  });

  if (error) {
    // Duplicate key means token already exists — fetch existing
    if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
      const existing = await getMatchToken(client, matchPresentationId);
      if (existing) return existing;
    }
    throw new Error(`Failed to generate match token: ${error.message}`);
  }

  return token;
}

/** Look up the token for a presentation. Returns null if none exists. */
export async function getMatchToken(
  client: AdminClient,
  matchPresentationId: string
): Promise<string | null> {
  const db = client as unknown as TokenTable;
  const { data } = await db
    .from('match_share_tokens')
    .select('token')
    .eq('match_presentation_id', matchPresentationId)
    .single();
  return data?.token ?? null;
}

/** Validate a token and return presentation ID + expiry. Returns null if invalid or expired. */
export async function resolveToken(
  client: AdminClient,
  token: string
): Promise<{ match_presentation_id: string; expires_at: string } | null> {
  const db = client as unknown as TokenTable;
  const { data } = await db
    .from('match_share_tokens')
    .select('match_presentation_id, expires_at')
    .eq('token', token)
    .single();

  if (!data) return null;
  if (new Date(data.expires_at) < new Date()) return null;
  return { match_presentation_id: data.match_presentation_id, expires_at: data.expires_at };
}
