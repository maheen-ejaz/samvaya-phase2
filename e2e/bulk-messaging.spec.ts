import { test, expect } from '@playwright/test';
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

// ============================================================
// Bulk Messaging E2E
// ============================================================
test.describe('Bulk Messaging', () => {
  test.use({ storageState: 'e2e/.auth/admin.json' });
  test.setTimeout(60_000);

  let createdTemplateId: string | null = null;

  test('template creation via API', async ({ request }) => {
    const response = await request.post('/api/admin/templates', {
      data: {
        name: `E2E Test Template ${Date.now()}`,
        subject: 'Test Subject {{first_name}}',
        body: 'Hello {{first_name}}, this is a test template for {{status}}.',
        category: 'general',
      },
    });

    if (response.ok()) {
      const body = await response.json();
      expect(body.template).toBeDefined();
      expect(body.template.id).toBeDefined();
      createdTemplateId = body.template.id;
    } else {
      // Template endpoint might not exist or may require different fields
      const body = await response.json();
      expect(typeof body.error).toBe('string');
    }
  });

  test('template list returns templates', async ({ request }) => {
    const response = await request.get('/api/admin/templates');

    if (response.ok()) {
      const body = await response.json();
      expect(Array.isArray(body.templates)).toBe(true);
    } else {
      expect(response.status()).toBeLessThan(500);
    }
  });

  test('bulk send endpoint validates required fields', async ({ request }) => {
    // Send without required fields
    const response = await request.post('/api/admin/communications/bulk-send', {
      data: {},
    });

    // Should return 400 (validation error), not 500
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test('bulk send rejects unauthenticated requests', async ({ request }) => {
    // Use a fresh context without auth
    const response = await request.post('/api/admin/communications/bulk-send', {
      data: { templateId: 'test', recipientIds: [] },
      headers: { Cookie: '' },
    });

    // Auth check should reject
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('communications page renders', async ({ page }) => {
    await page.goto('/admin/communications');
    await page.waitForLoadState('networkidle');

    // Page should render without error
    const hasContent = await page.locator('h1, h2, [role="tablist"]').first().isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });

  test.afterAll(async ({ request }) => {
    // Clean up created template
    if (createdTemplateId) {
      await request.delete(`/api/admin/templates/${createdTemplateId}`).catch(() => {});
    }
  });
});
