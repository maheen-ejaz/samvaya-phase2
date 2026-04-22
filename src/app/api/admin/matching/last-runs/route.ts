import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const result = await requireAdmin();
  if (result.error) return result.error;

  try {
    const supabase = createAdminClient();

    const [preFilterResult, fullPipelineResult] = await Promise.all([
      supabase
        .from('system_config' as never)
        .select('value')
        .eq('key', 'pre_filter_last_run')
        .single(),
      supabase
        .from('system_config' as never)
        .select('value')
        .eq('key', 'matching_last_run')
        .single(),
    ]);

    const preFilterValue = preFilterResult.data as { value: { ran_at: string } } | null;
    const fullPipelineValue = fullPipelineResult.data as { value: { ran_at: string } } | null;

    return NextResponse.json({
      pre_filter: preFilterValue?.value?.ran_at ?? null,
      full_pipeline: fullPipelineValue?.value?.ran_at ?? null,
    });
  } catch (err) {
    console.error('Failed to fetch last run timestamps:', err);
    return NextResponse.json({ pre_filter: null, full_pipeline: null });
  }
}
