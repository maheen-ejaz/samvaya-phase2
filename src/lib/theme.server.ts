import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ThemeConfig } from '@/app/api/admin/theme/route';
import { DEFAULT_THEME } from './theme';

export async function fetchThemeConfig(): Promise<ThemeConfig> {
  try {
    const adminSupabase = createAdminClient();
    const { data } = await adminSupabase
      .from('system_config' as never)
      .select('value' as never)
      .eq('key' as never, 'theme_config')
      .single();

    if (!data) return DEFAULT_THEME;
    return { ...DEFAULT_THEME, ...(data as { value: Partial<ThemeConfig> }).value };
  } catch {
    return DEFAULT_THEME;
  }
}
