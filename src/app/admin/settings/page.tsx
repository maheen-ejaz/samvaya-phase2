import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PricingDisplay } from '@/components/admin/settings/PricingDisplay';
import { FeatureFlagEditor } from '@/components/admin/settings/FeatureFlagEditor';
import { AirtableSyncCard } from '@/components/admin/settings/AirtableSyncCard';

type FeeConfig = { amount: number; gst_pct: number; total: number; currency: string } | null;
type SyncConfig = { synced_at: string | null; status: string; records_synced: number } | null;

interface SettingsData {
  verificationFee: FeeConfig;
  membershipFee: FeeConfig;
  featureFlags: Record<string, boolean>;
  airtableLastSync: SyncConfig;
}

async function loadSettingsData(): Promise<SettingsData | null> {
  try {
    const adminSupabase = createAdminClient();
    const { data: configRows } = await adminSupabase.from('system_config' as never).select('*');
    const configMap = new Map<string, Record<string, unknown>>();
    for (const row of (configRows || []) as Array<{ key: string; value: Record<string, unknown> }>) {
      configMap.set(row.key, row.value);
    }
    return {
      verificationFee: (configMap.get('verification_fee') as FeeConfig) ?? null,
      membershipFee: (configMap.get('membership_fee') as FeeConfig) ?? null,
      featureFlags: (configMap.get('feature_flags') ?? {}) as Record<string, boolean>,
      airtableLastSync: (configMap.get('airtable_last_sync') as SyncConfig) ?? null,
    };
  } catch (err) {
    console.error('Settings page load error:', err);
    return null;
  }
}

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

  const data = await loadSettingsData();

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8" role="alert">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load data</h2>
        <p className="text-gray-500 mb-4">Something went wrong while loading this page.</p>
        <Link href="/admin" className="text-rose-600 hover:text-rose-700 font-medium">
          Return to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Settings</h1>
      <p className="mt-1 text-sm text-gray-500">System configuration and feature management.</p>

      <div className="mt-6 space-y-6">
        <PricingDisplay verificationFee={data.verificationFee} membershipFee={data.membershipFee} />
        <FeatureFlagEditor flags={data.featureFlags} />
        <AirtableSyncCard lastSync={data.airtableLastSync} />
      </div>
    </div>
  );
}
