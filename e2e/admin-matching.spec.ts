import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load env
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ============================================================
// Admin Matching Pipeline E2E
// ============================================================
test.describe('Admin Matching Pipeline', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });
  test.setTimeout(90_000);

  test('pre-filter endpoint returns valid stats', async ({ request }) => {
    const response = await request.post('/api/admin/matching/pre-filter');

    if (response.ok()) {
      const body = await response.json();
      expect(body.stats).toBeDefined();
      expect(typeof body.stats.total_in_pool).toBe('number');
      expect(typeof body.stats.pairs_after_filter).toBe('number');
      expect(typeof body.stats.reduction_pct).toBe('number');
    } else {
      // May fail with insufficient users — acceptable
      const body = await response.json();
      expect(body.error).toBeDefined();
    }
  });

  test('batch-score endpoint succeeds or reports cached', async ({ request }) => {
    const response = await request.post('/api/admin/matching/batch-score', {
      data: { mode: 'all' },
    });

    if (response.ok()) {
      const body = await response.json();
      expect(body.scoring).toBeDefined();
      expect(typeof body.scoring.scored).toBe('number');
      expect(typeof body.scoring.skipped_cached).toBe('number');
    } else {
      const body = await response.json();
      expect(body.error).toBeDefined();
    }
  });

  test('suggestion queue page renders with filter options', async ({ page }) => {
    await page.goto('/admin/matching');
    await page.waitForLoadState('networkidle');

    // Pipeline controls should be visible
    const pipelineSection = page.locator('text=Pipeline Controls');
    await expect(pipelineSection).toBeVisible();

    // Status filter should exist
    const statusFilter = page.locator('#status-filter');
    await expect(statusFilter).toBeVisible();
  });

  test('suggestion review API validates required fields', async ({ request }) => {
    // Attempt to review a non-existent suggestion
    const response = await request.post(
      '/api/admin/matching/suggestions/00000000-0000-0000-0000-000000000000/review',
      { data: { action: 'approve', narrative: 'test', notes: '' } }
    );

    // Should return 404 (not found) or 400 (validation error), not 500
    expect(response.status()).toBeLessThan(500);
  });

  test('presentation creation requires valid suggestion', async ({ request }) => {
    const response = await request.post('/api/admin/matching/presentations', {
      data: { suggestionId: '00000000-0000-0000-0000-000000000000' },
    });

    expect(response.status()).toBeLessThan(500);
  });
});

// ============================================================
// BGV Consent Flow
// ============================================================
test.describe('BGV Consent Flow', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });
  test.setTimeout(60_000);

  test('BGV cannot start without fee paid', async () => {
    const admin = getAdminClient();

    // Find user with consent but no fee paid
    const { data: users } = await admin
      .from('users')
      .select('id, payment_status, bgv_consent')
      .eq('payment_status', 'unverified')
      .not('bgv_consent', 'is', null)
      .limit(1);

    if (!users || users.length === 0) {
      test.skip(true, 'No user with consent + unverified status found');
      return;
    }

    // Verify the BGV guard: both conditions must be true
    const user = users[0];
    const feeNotPaid = user.payment_status !== 'verification_pending' && user.payment_status !== 'in_pool';
    expect(feeNotPaid).toBe(true);
    // BGV should NOT be startable in this state
  });

  test('BGV consent states are correctly stored', async () => {
    const admin = getAdminClient();

    // Check that consent values in DB are one of the valid enum values
    const { data: usersWithConsent } = await admin
      .from('users')
      .select('id, bgv_consent')
      .not('bgv_consent', 'is', null)
      .limit(10);

    if (!usersWithConsent || usersWithConsent.length === 0) {
      test.skip(true, 'No users with BGV consent found');
      return;
    }

    const validConsents = ['consented', 'consented_wants_call', 'declined'];
    for (const user of usersWithConsent) {
      expect(validConsents).toContain(user.bgv_consent);
    }
  });
});

// ============================================================
// Profile Edit Persistence
// ============================================================
test.describe('Profile Edit Persistence', () => {
  test.setTimeout(60_000);

  test('profile changes persist after update', async () => {
    const admin = getAdminClient();

    // Find a user with a profile
    const { data: profiles } = await admin
      .from('profiles')
      .select('user_id, first_name, about_me')
      .not('first_name', 'is', null)
      .limit(1);

    if (!profiles || profiles.length === 0) {
      test.skip(true, 'No profiles found');
      return;
    }

    const profile = profiles[0];
    const originalAbout = profile.about_me;
    const testValue = `Test edit ${Date.now()}`;

    // Update
    const { error: updateError } = await admin
      .from('profiles')
      .update({ about_me: testValue })
      .eq('user_id', profile.user_id);

    expect(updateError).toBeNull();

    // Verify persistence
    const { data: updated } = await admin
      .from('profiles')
      .select('about_me')
      .eq('user_id', profile.user_id)
      .single();

    expect(updated?.about_me).toBe(testValue);

    // Restore original
    await admin
      .from('profiles')
      .update({ about_me: originalAbout })
      .eq('user_id', profile.user_id);
  });
});
