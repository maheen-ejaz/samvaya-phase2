import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PricingDisplay } from '@/components/admin/settings/PricingDisplay';
import { FeatureFlagEditor } from '@/components/admin/settings/FeatureFlagEditor';
import { AirtableSyncCard } from '@/components/admin/settings/AirtableSyncCard';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    redirect('/app/onboarding');
  }

  try {
    const adminSupabase = createAdminClient();

    const { data: configRows } = await adminSupabase
      .from('system_config' as never)
      .select('*');

    // Build config map
    const configMap = new Map<string, Record<string, unknown>>();
    for (const row of (configRows || []) as Array<{ key: string; value: Record<string, unknown> }>) {
      configMap.set(row.key, row.value);
    }

    const verificationFee = configMap.get('verification_fee') as {
      amount: number; gst_pct: number; total: number; currency: string;
    } | undefined ?? null;

    const membershipFee = configMap.get('membership_fee') as {
      amount: number; gst_pct: number; total: number; currency: string;
    } | undefined ?? null;

    const featureFlags = (configMap.get('feature_flags') ?? {}) as Record<string, boolean>;

    const airtableLastSync = configMap.get('airtable_last_sync') as {
      synced_at: string | null; status: string; records_synced: number;
    } | undefined ?? null;

    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">System configuration and feature management.</p>

        <div className="mt-6 space-y-6">
          <PricingDisplay verificationFee={verificationFee} membershipFee={membershipFee} />
          <FeatureFlagEditor flags={featureFlags} />
          <AirtableSyncCard lastSync={airtableLastSync} />
        </div>
      </div>
    );
  } catch (err) {
    console.error('Settings page load error:', err);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8" role="alert">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load data</h2>
        <p className="text-gray-500 mb-4">Something went wrong while loading this page.</p>
        <a href="/admin" className="text-rose-600 hover:text-rose-700 font-medium">
          Return to dashboard
        </a>
      </div>
    );
  }
}
