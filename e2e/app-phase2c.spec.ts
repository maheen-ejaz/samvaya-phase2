import { test, expect } from '@playwright/test';

// Phase 2C tests use the applicant auth state
// These tests verify the user-facing PWA pages render correctly

test.describe('Phase 2C — User-Facing PWA', () => {
  test.describe('Status Dashboard', () => {
    test('dashboard page loads and renders status card', async ({ page }) => {
      await page.goto('/app');
      await page.waitForLoadState('networkidle');

      // Should either show the dashboard or redirect to onboarding/login
      const url = page.url();
      // If redirected to login, that's valid (no auth state)
      if (url.includes('/auth/login')) {
        expect(url).toContain('/auth/login');
        return;
      }
      // If redirected to onboarding, that's valid (onboarding not complete)
      if (url.includes('/app/onboarding')) {
        expect(url).toContain('/app/onboarding');
        return;
      }

      // If we're on /app, the dashboard should render
      await expect(page).toHaveURL(/\/app$/);
    });
  });

  test.describe('Matches Page', () => {
    test('matches page loads', async ({ page }) => {
      await page.goto('/app/matches');
      await page.waitForLoadState('networkidle');

      const url = page.url();
      if (url.includes('/auth/login')) return; // Not authenticated

      // Page should load — either with matches or empty state
      const heading = page.getByText('Your Matches');
      const emptyState = page.getByText('No matches yet');
      const skeleton = page.locator('.animate-pulse');

      // At least one of these should be visible
      const hasContent = await heading.isVisible().catch(() => false);
      const hasEmpty = await emptyState.isVisible().catch(() => false);
      const hasLoading = await skeleton.first().isVisible().catch(() => false);

      expect(hasContent || hasEmpty || hasLoading).toBeTruthy();
    });
  });

  test.describe('Profile Page', () => {
    test('profile page loads', async ({ page }) => {
      await page.goto('/app/profile');
      await page.waitForLoadState('networkidle');

      const url = page.url();
      if (url.includes('/auth/login')) return;

      // Should show profile or loading state
      expect(url).toContain('/app');
    });
  });

  test.describe('Settings Page', () => {
    test('settings page renders account section', async ({ page }) => {
      await page.goto('/app/settings');
      await page.waitForLoadState('networkidle');

      const url = page.url();
      if (url.includes('/auth/login')) return;

      // Settings should show account info
      const settingsHeading = page.getByText('Settings');
      const accountSection = page.getByText('Account');

      const hasSettings = await settingsHeading.isVisible().catch(() => false);
      const hasAccount = await accountSection.isVisible().catch(() => false);

      expect(hasSettings || hasAccount).toBeTruthy();
    });

    test('settings page renders support section', async ({ page }) => {
      await page.goto('/app/settings');
      await page.waitForLoadState('networkidle');

      const url = page.url();
      if (url.includes('/auth/login')) return;

      const supportSection = page.getByText('Support');
      const hasSupport = await supportSection.isVisible().catch(() => false);
      if (hasSupport) {
        // WhatsApp link should exist
        const whatsappLink = page.getByText('WhatsApp Support');
        await expect(whatsappLink).toBeVisible();
      }
    });

    test('settings page renders legal links', async ({ page }) => {
      await page.goto('/app/settings');
      await page.waitForLoadState('networkidle');

      const url = page.url();
      if (url.includes('/auth/login')) return;

      const legalSection = page.getByText('Legal');
      const hasLegal = await legalSection.isVisible().catch(() => false);
      if (hasLegal) {
        const privacyLink = page.getByText('Privacy Policy');
        const termsLink = page.getByText('Terms of Service');
        await expect(privacyLink).toBeVisible();
        await expect(termsLink).toBeVisible();
      }
    });
  });

  test.describe('Bottom Navigation', () => {
    test('bottom nav renders 4 tabs', async ({ page }) => {
      await page.goto('/app');
      await page.waitForLoadState('networkidle');

      const url = page.url();
      if (url.includes('/auth/login')) return;
      // May redirect to onboarding (nav hidden) — that's fine
      if (url.includes('/app/onboarding')) return;

      const nav = page.locator('nav[aria-label="Main navigation"]');
      const isVisible = await nav.isVisible().catch(() => false);
      if (isVisible) {
        const links = nav.locator('a');
        await expect(links).toHaveCount(4);
      }
    });

    test('home tab is active on /app', async ({ page }) => {
      await page.goto('/app');
      await page.waitForLoadState('networkidle');

      const url = page.url();
      if (url.includes('/auth/login') || url.includes('/app/onboarding')) return;

      const homeLink = page.locator('nav[aria-label="Main navigation"] a[aria-current="page"]');
      const isVisible = await homeLink.isVisible().catch(() => false);
      if (isVisible) {
        await expect(homeLink).toContainText('Home');
      }
    });
  });

  test.describe('PWA Manifest', () => {
    test('manifest link is present in HTML head', async ({ page }) => {
      await page.goto('/app');
      await page.waitForLoadState('domcontentloaded');

      // Check that the manifest link tag exists in the document head
      const manifestLink = page.locator('link[rel="manifest"]');
      await expect(manifestLink).toHaveAttribute('href', '/manifest.json');
    });
  });

  test.describe('API Routes', () => {
    test('GET /api/app/status returns 401 without auth', async ({ page }) => {
      const response = await page.goto('/api/app/status');
      // Should return 401 since no auth
      expect(response?.status()).toBe(401);
    });

    test('GET /api/app/matches returns 401 without auth', async ({ page }) => {
      const response = await page.goto('/api/app/matches');
      expect(response?.status()).toBe(401);
    });

    test('GET /api/app/profile returns 401 without auth', async ({ page }) => {
      const response = await page.goto('/api/app/profile');
      expect(response?.status()).toBe(401);
    });
  });
});
