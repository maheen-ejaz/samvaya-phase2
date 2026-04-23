import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { isValidCssColor } from '@/lib/theme';

export interface ThemeConfig {
  primary: string;
  chart_1: string;
  chart_2: string;
  chart_3: string;
  chart_4: string;
  chart_5: string;
  font_sans: string;
  font_form: string;
  radius: string;
}

// Preset b5cjpD3po defaults — Vega / Teal / Inter / medium-radius
export const DEFAULT_THEME: ThemeConfig = {
  primary: 'oklch(0.511 0.096 186.391)',
  chart_1: 'oklch(0.855 0.138 181.071)',
  chart_2: 'oklch(0.704 0.14 182.503)',
  chart_3: 'oklch(0.6 0.118 184.704)',
  chart_4: 'oklch(0.511 0.096 186.391)',
  chart_5: 'oklch(0.437 0.078 188.216)',
  font_sans: 'inter',
  font_form: 'inter',
  radius: '0.5rem',
};

const ALLOWED_FONTS = ['inter', 'instrument-sans', 'geist'] as const;
const ALLOWED_RADII = ['0rem', '0.25rem', '0.5rem', '0.625rem', '0.75rem', '1rem'] as const;

// GET is unauthenticated — theme must load for all pages including public ones.
// TODO: migrate to anon + RLS once theme_config row is publicly readable.
// Service role is scoped via .eq('key', 'theme_config') so only that row is read.
export async function GET() {
  const adminSupabase = createAdminClient();
  const { data } = await adminSupabase
    .from('system_config' as never)
    .select('value' as never)
    .eq('key' as never, 'theme_config')
    .single();

  const theme: ThemeConfig = data
    ? { ...DEFAULT_THEME, ...(data as { value: Partial<ThemeConfig> }).value }
    : DEFAULT_THEME;

  return NextResponse.json(theme, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}

export async function PUT(request: NextRequest) {
  const result = await requireAdmin();
  if (result.error) return result.error;
  const { admin } = result;

  let body: Partial<ThemeConfig>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Validate each field
  const merged: ThemeConfig = { ...DEFAULT_THEME, ...body };

  const colorFields = ['primary', 'chart_1', 'chart_2', 'chart_3', 'chart_4', 'chart_5'] as const;
  for (const field of colorFields) {
    const val = merged[field];
    if (!isValidCssColor(val)) {
      return NextResponse.json({ error: `Invalid CSS color for ${field}` }, { status: 400 });
    }
  }

  if (!ALLOWED_FONTS.includes(merged.font_sans as typeof ALLOWED_FONTS[number])) {
    return NextResponse.json({ error: 'Invalid font_sans' }, { status: 400 });
  }
  if (!ALLOWED_FONTS.includes(merged.font_form as typeof ALLOWED_FONTS[number])) {
    return NextResponse.json({ error: 'Invalid font_form' }, { status: 400 });
  }
  if (!ALLOWED_RADII.includes(merged.radius as typeof ALLOWED_RADII[number])) {
    return NextResponse.json({ error: 'Invalid radius' }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('system_config' as never)
    .upsert(
      {
        key: 'theme_config',
        value: merged,
        updated_by: admin.id,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: 'key' } as never
    );

  if (error) {
    return NextResponse.json({ error: 'Failed to save theme' }, { status: 500 });
  }

  revalidatePath('/', 'layout');

  return NextResponse.json({ success: true, theme: merged });
}
