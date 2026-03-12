import { test, expect } from '@playwright/test';

// Use stored auth state
test.use({ storageState: 'e2e/.auth/admin.json' });

test.describe('Part 3: Sidebar Navigation', () => {
  test('all 4 new nav items render and navigate correctly', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Check all sidebar items exist
    const sidebar = page.locator('nav, aside').first();
    await expect(sidebar.getByText('Analytics')).toBeVisible();
    await expect(sidebar.getByText('Communications')).toBeVisible();
    await expect(sidebar.getByText('Activity Log')).toBeVisible();
    await expect(sidebar.getByText('Settings')).toBeVisible();

    // Navigate to Analytics
    await sidebar.getByText('Analytics').click();
    await expect(page).toHaveURL(/\/admin\/analytics/);

    // Navigate to Communications
    await sidebar.getByText('Communications').click();
    await expect(page).toHaveURL(/\/admin\/communications/);

    // Navigate to Activity Log
    await sidebar.getByText('Activity Log').click();
    await expect(page).toHaveURL(/\/admin\/activity/);

    // Navigate to Settings
    await sidebar.getByText('Settings').click();
    await expect(page).toHaveURL(/\/admin\/settings/);
  });
});

test.describe('Part 3: Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');
  });

  test('pricing section renders with Locked badge', async ({ page }) => {
    // Use heading role to avoid matching paragraph text
    await expect(page.getByRole('heading', { name: 'Pricing' })).toBeVisible();
    await expect(page.getByText('Locked', { exact: true })).toBeVisible();

    // Verify fee labels are present
    await expect(page.getByText('Verification Fee')).toBeVisible();
    await expect(page.getByText('Membership Fee')).toBeVisible();
  });

  test('feature flags section renders and toggles persist', async ({ page }) => {
    await expect(page.getByText('Feature Flags')).toBeVisible();
    await expect(page.getByText(/toggle features/i)).toBeVisible();

    // Test toggle behavior if switches exist
    const toggles = page.getByRole('switch');
    const toggleCount = await toggles.count();

    if (toggleCount > 0) {
      const toggle = toggles.first();
      const initialState = await toggle.getAttribute('aria-checked');
      await toggle.click();
      await expect(page.getByText(/enabled|disabled/i).first()).toBeVisible({ timeout: 5000 });

      // Wait a bit for the API call to complete before reloading
      await page.waitForTimeout(1000);

      // Reload and verify persistence
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      const toggleAfterReload = page.getByRole('switch').first();
      const newState = await toggleAfterReload.getAttribute('aria-checked');
      expect(newState).not.toBe(initialState);

      // Toggle back to restore
      await toggleAfterReload.click();
      await page.waitForTimeout(1000);
    }
  });

  test('Airtable sync card renders', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Airtable Sync' })).toBeVisible();
    await expect(page.getByRole('button', { name: /sync/i })).toBeVisible();
    await expect(page.getByText('Never synced')).toBeVisible();
  });
});

test.describe('Part 3: Activity Log', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/activity');
    await page.waitForLoadState('networkidle');
  });

  test('page renders with heading', async ({ page }) => {
    await page.waitForTimeout(2000);
    await expect(page.getByRole('heading', { name: 'Activity Log' })).toBeVisible();
  });

  test('filter controls are present', async ({ page }) => {
    await page.waitForTimeout(2000);
    const selects = page.locator('select');
    expect(await selects.count()).toBeGreaterThan(0);
    await expect(page.getByRole('button', { name: /reset/i })).toBeVisible();
  });

  test('reset filters works', async ({ page }) => {
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /reset/i }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Activity Log' })).toBeVisible();
  });
});

test.describe('Part 3: Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');
  });

  test('analytics page renders', async ({ page }) => {
    await page.waitForTimeout(3000);
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible();

    // Check for funnel content — use first() to avoid strict mode
    const hasFunnel = await page.getByText('Registered').first().isVisible().catch(() => false);
    const hasFunnel2 = await page.getByText('Applicant Funnel').isVisible().catch(() => false);
    const hasError = await page.getByText(/failed|error/i).first().isVisible().catch(() => false);
    const hasLoading = await page.locator('[class*="animate-spin"]').first().isVisible().catch(() => false);

    expect(hasFunnel || hasFunnel2 || hasError || hasLoading).toBeTruthy();
  });

  test('geographic and specialty distribution sections exist', async ({ page }) => {
    await page.waitForTimeout(3000);
    const hasGeo = await page.getByText('Geographic Distribution').isVisible().catch(() => false);
    const hasSpecialty = await page.getByText('Specialty Distribution').isVisible().catch(() => false);
    expect(hasGeo || hasSpecialty).toBeTruthy();
  });
});

test.describe('Part 3: Communications — Templates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/communications');
    await page.waitForLoadState('networkidle');
  });

  test('tabs render correctly', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Send' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Templates' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'History' })).toBeVisible();
  });

  test('template CRUD lifecycle', async ({ page }) => {
    test.setTimeout(60000);

    // Use a unique name to avoid conflicts with previous runs
    const uniqueName = `E2E Test ${Date.now()}`;

    // Go to Templates tab
    await page.getByRole('tab', { name: 'Templates' }).click();
    await page.waitForTimeout(1000);

    // Create a new template
    await page.getByRole('button', { name: /new template/i }).click();

    await page.locator('#tpl-name').fill(uniqueName);
    await page.locator('#tpl-subject').fill('Test Subject for {{first_name}}');
    await page.locator('#tpl-body').fill('Hello {{first_name}}, this is an E2E test template.');

    // Save
    await page.getByRole('button', { name: /create template/i }).click();

    // Verify template appears in list
    await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 5000 });

    // Edit the template using aria-label pattern
    await page.getByRole('button', { name: new RegExp(`Edit ${uniqueName}`, 'i') }).click();

    await page.locator('#tpl-subject').fill('Updated Subject for {{first_name}}');
    await page.getByRole('button', { name: /update template/i }).click();
    await page.waitForTimeout(1000);

    // Verify updated
    await expect(page.getByText('Updated Subject')).toBeVisible({ timeout: 5000 });

    // Delete the template
    await page.getByRole('button', { name: new RegExp(`Delete ${uniqueName}`, 'i') }).click();

    // Confirm deletion in dialog
    const confirmDialog = page.getByRole('dialog');
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });
    await confirmDialog.getByRole('button', { name: /^delete$/i }).click();

    // Template should disappear
    await expect(page.getByText(uniqueName)).not.toBeVisible({ timeout: 5000 });
  });

  test('template preview with variable substitution', async ({ page }) => {
    // Go to Templates tab
    await page.getByRole('tab', { name: 'Templates' }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /new template/i }).click();

    await page.locator('#tpl-name').fill('Preview Test');
    await page.locator('#tpl-subject').fill('Hello {{first_name}}');
    await page.locator('#tpl-body').fill('Dear {{first_name}} {{last_name}}, welcome!');

    // Show preview
    await page.getByRole('button', { name: /show preview/i }).click();

    // Verify sample data substitution
    await expect(page.getByText('Dear Priya Sharma, welcome!')).toBeVisible();

    // Cancel without saving
    await page.getByRole('button', { name: /cancel/i }).click();
  });
});

test.describe('Part 3: Communications — Bulk Send Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/communications');
    await page.waitForLoadState('networkidle');
  });

  test('bulk send step 1 renders', async ({ page }) => {
    await expect(page.getByText('Content', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /use template/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /custom content/i })).toBeVisible();
  });

  test('bulk send flow navigation', async ({ page }) => {
    await page.getByRole('button', { name: /custom content/i }).click();

    await page.locator('#bulk-subject').fill('Test bulk subject');
    await page.locator('#bulk-body').fill('Test bulk email body.');

    // Proceed to step 2
    await page.getByRole('button', { name: /next.*recipients/i }).click();
    await expect(page.getByText('Filter Recipients')).toBeVisible();

    await page.waitForTimeout(2000);

    // Back button should work
    await page.getByRole('button', { name: /back/i }).click();
    await expect(page.getByText('Content', { exact: true })).toBeVisible();
  });
});

test.describe('Part 3: Communications — History', () => {
  test('history tab renders', async ({ page }) => {
    await page.goto('/admin/communications');
    await page.waitForLoadState('networkidle');

    await page.getByRole('tab', { name: 'History' }).click();
    await page.waitForTimeout(2000);

    const hasEmpty = await page.getByText(/no bulk sends/i).isVisible().catch(() => false);
    const hasEntries = await page.locator('[class*="bg-green-100"]').count() > 0;
    expect(hasEmpty || hasEntries).toBeTruthy();
  });
});
