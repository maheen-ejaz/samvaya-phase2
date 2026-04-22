import { test, expect, Page } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

// ============================================================
// Constants
// ============================================================

const TEST_EMAIL = 'e2e-onboarding@samvayatest.com';
const TEST_PASSWORD = 'TestOnboard123!';
const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

// ============================================================
// Env loading (same pattern as auth.setup.ts)
// ============================================================

const envPath = path.resolve(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.substring(0, eqIdx);
  const val = trimmed.substring(eqIdx + 1);
  if (!process.env[key]) process.env[key] = val;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ============================================================
// Supabase admin client
// ============================================================

function getAdminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ============================================================
// Test PNG generator (pure Node.js, no deps)
// ============================================================

function createTestPng(width: number, height: number, r: number, g: number, b: number): Buffer {
  function crc32(data: Buffer): number {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
      crc ^= data[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type: string, data: Buffer): Buffer {
    const typeBuffer = Buffer.from(type, 'ascii');
    const combined = Buffer.concat([typeBuffer, data]);
    const crc = crc32(combined);
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([lenBuf, combined, crcBuf]);
  }

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  const ihdr = chunk('IHDR', ihdrData);

  // Build raw image data
  const row = Buffer.alloc(1 + width * 3);
  row[0] = 0; // filter none
  for (let x = 0; x < width; x++) {
    row[1 + x * 3] = r;
    row[2 + x * 3] = g;
    row[3 + x * 3] = b;
  }
  const rawData = Buffer.alloc(height * row.length);
  for (let y = 0; y < height; y++) {
    row.copy(rawData, y * row.length);
  }
  const compressed = zlib.deflateSync(rawData);
  const idat = chunk('IDAT', compressed);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdr, idat, iend]);
}

// ============================================================
// Helper functions
// ============================================================

async function clickNext(page: Page) {
  // Blur any focused input first to trigger validation
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  await page.waitForTimeout(300);
  const btn = page.getByRole('button', { name: 'Next', exact: true });
  await expect(btn).toBeEnabled({ timeout: 10000 });
  await btn.click();
  await page.waitForTimeout(800); // auto-save debounce
}

async function selectRadio(page: Page, label: string) {
  await page.getByRole('radio', { name: label, exact: true }).click();
}

async function selectDropdown(page: Page, value: string) {
  await page.locator('select').selectOption(value);
}

async function clickIllustratedMC(page: Page, label: string) {
  // IllustratedMC uses buttons with aria-pressed — use exact role match to avoid substring collisions
  await page.getByRole('button', { name: label, exact: true }).click();
}

async function fillAutocomplete(page: Page, text: string, suggestion: string) {
  const input = page.locator('input[type="text"]');
  await input.fill(text);
  await page.waitForTimeout(500); // wait for dropdown
  await page.locator('li').filter({ hasText: suggestion }).first().click();
  await page.waitForTimeout(300);
}

async function fillRange(page: Page, min: number, max: number) {
  await page.locator('input[type="number"]').first().fill(String(min));
  await page.locator('input[type="number"]').last().fill(String(max));
}

async function chatExchange(page: Page, message: string) {
  const textarea = page.locator('textarea[aria-label="Your response"]');
  await expect(textarea).toBeEnabled({ timeout: 30000 });
  await textarea.fill(message);
  const sendBtn = page.getByRole('button', { name: 'Send message' });
  await expect(sendBtn).toBeEnabled({ timeout: 5000 });
  await sendBtn.click();
  // Wait for typing indicator to appear and then disappear (assistant responded)
  await page.waitForTimeout(1000);
  await expect(page.locator('[aria-label="Typing..."]')).toBeHidden({ timeout: 60000 });
  await page.waitForTimeout(500);
}

async function waitForChatComplete(page: Page) {
  // After final exchange, extraction begins
  await expect(page.getByText('Saving your conversation')).toBeVisible({ timeout: 30000 });
  await expect(page.getByText('Saving your conversation')).toBeHidden({ timeout: 60000 });
  await page.waitForTimeout(1000);
}

async function selectGroupedItem(page: Page, categoryLabel: string, itemLabel: string) {
  // Expand category if not already expanded
  const categoryBtn = page.locator('button[aria-expanded]').filter({ has: page.locator(`text="${categoryLabel}"`) });
  const isExpanded = await categoryBtn.getAttribute('aria-expanded');
  if (isExpanded === 'false') {
    await categoryBtn.click();
    await page.waitForTimeout(300);
  }
  // Click item button — use exact role match to avoid substring collisions
  await page.getByRole('button', { name: itemLabel, exact: true }).click();
  await page.waitForTimeout(200);
}

async function waitForQuestion(page: Page, questionText: string) {
  await expect(page.getByText(questionText).first()).toBeVisible({ timeout: 10000 });
}

// ============================================================
// Test setup
// ============================================================

let adminClient: SupabaseClient;
let userId: string;

test.beforeAll(async () => {
  adminClient = getAdminClient();

  // Create test fixtures directory
  if (!fs.existsSync(FIXTURES_DIR)) {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  }

  // Generate test PNG files
  fs.writeFileSync(path.join(FIXTURES_DIR, 'test-passport.png'), createTestPng(400, 500, 50, 100, 200));
  fs.writeFileSync(path.join(FIXTURES_DIR, 'test-profile-1.png'), createTestPng(600, 800, 100, 200, 50));
  fs.writeFileSync(path.join(FIXTURES_DIR, 'test-profile-2.png'), createTestPng(600, 800, 200, 50, 100));
  fs.writeFileSync(path.join(FIXTURES_DIR, 'test-id-doc.png'), createTestPng(800, 600, 150, 150, 150));
  fs.writeFileSync(path.join(FIXTURES_DIR, 'test-kundali.png'), createTestPng(800, 600, 200, 150, 50));

  // Find or create test user
  const { data: existingUsers } = await adminClient.auth.admin.listUsers();
  let testUser = existingUsers?.users?.find((u) => u.email === TEST_EMAIL);

  if (!testUser) {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (error) throw new Error(`Failed to create test user: ${error.message}`);
    testUser = data.user!;
  }

  userId = testUser.id;

  // Delete all related records first (before resetting users row)
  await adminClient.from('compatibility_profiles').delete().eq('user_id', userId);
  await adminClient.from('profiles').delete().eq('user_id', userId);
  await adminClient.from('medical_credentials').delete().eq('user_id', userId);
  await adminClient.from('partner_preferences').delete().eq('user_id', userId);
  await adminClient.from('photos').delete().eq('user_id', userId);
  await adminClient.from('documents').delete().eq('user_id', userId);
  await adminClient.from('payments').delete().eq('user_id', userId);

  // Reset user data completely
  const { error: resetError } = await adminClient.from('users').update({
    onboarding_section: 1,
    onboarding_last_question: 1,
    membership_status: 'onboarding_pending',
    payment_status: 'unverified',
    gate_answers: {},
    bgv_consent: 'not_given',
  }).eq('id', userId);

  if (resetError) {
    console.error('Failed to reset users row:', resetError);
    throw new Error(`Failed to reset users row: ${resetError.message}`);
  }

  // Verify reset worked
  const { data: verifyUser } = await adminClient.from('users').select('onboarding_section, onboarding_last_question').eq('id', userId).single();
  console.log('User reset verification:', verifyUser);
});

test.afterAll(async () => {
  // Clean up fixture files
  if (fs.existsSync(FIXTURES_DIR)) {
    for (const file of fs.readdirSync(FIXTURES_DIR)) {
      fs.unlinkSync(path.join(FIXTURES_DIR, file));
    }
  }
});

// ============================================================
// Main test
// ============================================================

test('complete onboarding flow - all 100 questions including optional fields', async ({ page }) => {
  test.setTimeout(900_000); // 15 minutes

  // Collect console errors
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // Track issues found
  const issues: string[] = [];

  // ========================================
  // AUTHENTICATION (password sign-in + cookie injection)
  // ========================================
  await test.step('Authentication - Session cookie injection', async () => {
    // Sign in with password to get session tokens
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    if (signInError || !signInData.session) {
      throw new Error(`Failed to sign in: ${signInError?.message || 'No session'}`);
    }

    const { access_token, refresh_token } = signInData.session;

    // Build session cookie payload (Supabase SSR chunked cookie pattern from auth.setup.ts)
    const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];
    const cookieBase = `sb-${projectRef}-auth-token`;
    const sessionPayload = JSON.stringify({
      access_token,
      refresh_token,
      expires_at: signInData.session.expires_at,
      expires_in: signInData.session.expires_in,
      token_type: 'bearer',
      type: 'access',
      user: signInData.session.user,
    });

    const encoded = Buffer.from(sessionPayload).toString('base64');
    const CHUNK_SIZE = 3180;
    const chunks: string[] = [];
    for (let i = 0; i < encoded.length; i += CHUNK_SIZE) {
      chunks.push(encoded.substring(i, i + CHUNK_SIZE));
    }

    // Navigate to establish domain context first
    await page.goto('/auth/login', { timeout: 20000 });
    await page.waitForLoadState('domcontentloaded');

    const pageUrl = new URL(page.url());

    const cookies = chunks.map((chunk, i) => ({
      name: chunks.length === 1 ? cookieBase : `${cookieBase}.${i}`,
      value: `base64-${chunk}`,
      domain: pageUrl.hostname,
      path: '/',
      httpOnly: false,
      secure: pageUrl.protocol === 'https:',
      sameSite: 'Lax' as const,
    }));

    await page.context().addCookies(cookies);

    // Navigate to onboarding — middleware should recognize the session
    await page.goto('/app/onboarding', { timeout: 30000 });
    await page.waitForTimeout(3000);

    // Debug: if still on login, check what happened
    if (page.url().includes('/auth/login')) {
      // Try with storageState approach: save and restore
      const storageState = await page.context().storageState();
      console.log('Cookie names set:', storageState.cookies.map(c => c.name));
      console.log('Current URL after nav:', page.url());
      throw new Error('Authentication failed - still on login page after cookie injection');
    }
  });

  // ========================================
  // SECTION A: Basic Identity (Q1-Q17)
  // ========================================
  await test.step('Section A: Basic Identity', async () => {
    // Q1 + Q2 (grouped): First name + Last name
    await waitForQuestion(page, 'What is your first name?');
    await page.getByPlaceholder('First name').fill('Priya');
    await page.getByPlaceholder('Last name').fill('Sharma');
    await clickNext(page);

    // Q3: Email (read-only)
    await waitForQuestion(page, 'Your email address');
    await clickNext(page);

    // Q4: Phone number
    await waitForQuestion(page, 'Your phone number');
    await page.getByPlaceholder('+91 98765 43210').fill('+919876543210');
    await clickNext(page);

    // Q5: Gender (2 options = radios)
    await waitForQuestion(page, 'What is your gender?');
    await selectRadio(page, 'Female');
    await clickNext(page);

    // Q6: Referral source (6 options = radios)
    await waitForQuestion(page, 'How did you hear about Samvaya?');
    await selectRadio(page, 'Friend or Family');
    await clickNext(page);

    // Q7: Marital status (3 options = radios)
    await waitForQuestion(page, 'Have you been married before?');
    await selectRadio(page, 'No, this will be my first marriage');
    await clickNext(page);

    // Q8 skipped (conditional: only for divorced/widowed)

    // Q9: Date of birth
    await waitForQuestion(page, 'What is your date of birth?');
    await page.locator('input[type="date"]').fill('1995-06-15');
    await clickNext(page);

    // Q10: Knows time of birth (2 options = radios)
    await waitForQuestion(page, 'Do you know your time of birth?');
    await selectRadio(page, 'Yes');
    await clickNext(page);

    // Q11: Time of birth (conditional: Q10=yes)
    await waitForQuestion(page, 'What is your time of birth?');
    await page.locator('input[type="time"]').fill('08:30');
    await clickNext(page);

    // Q12: Place of birth (37 options = dropdown: outside_india + 36 states)
    await waitForQuestion(page, 'Where were you born?');
    await selectDropdown(page, 'karnataka');
    await clickNext(page);

    // Q13 skipped (conditional: only for outside_india)

    // Q14: Birth city India (conditional: Q12=karnataka, autocomplete)
    await waitForQuestion(page, 'Which city were you born in?');
    await fillAutocomplete(page, 'Beng', 'Bengaluru');
    await clickNext(page);

    // Q15: Blood group (9 options = dropdown, OPTIONAL)
    await waitForQuestion(page, 'What is your blood group?');
    await selectDropdown(page, 'B+');
    await clickNext(page);

    // Q16: Mother tongue (23 options = dropdown)
    await waitForQuestion(page, 'What is your mother tongue?');
    await selectDropdown(page, 'kannada');
    await clickNext(page);

    // Q17: Languages spoken (18 options = checkboxes)
    await waitForQuestion(page, 'Which languages do you speak fluently?');
    await page.getByRole('checkbox', { name: 'Kannada', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Hindi', exact: true }).click();
    await page.getByRole('checkbox', { name: 'English', exact: true }).click();
    await clickNext(page);
  });

  // ========================================
  // SECTION B: Location & Citizenship (Q18-Q26)
  // ========================================
  await test.step('Section B: Location & Citizenship', async () => {
    // Q18: Citizenship country (130+ options = dropdown)
    await waitForQuestion(page, 'Which country are you a citizen of?');
    await selectDropdown(page, 'india');
    await clickNext(page);

    // Q19: Employment visa (2 options = radios)
    await waitForQuestion(page, 'Do you have an employment visa');
    await selectRadio(page, 'No');
    await clickNext(page);

    // Q20 skipped (conditional: Q19=no)

    // Q21: Current residence country (dropdown)
    await waitForQuestion(page, 'Which country are you currently residing in?');
    await selectDropdown(page, 'india');
    await clickNext(page);

    // Q22: Current state (conditional: Q21=india, 36 options = dropdown)
    await waitForQuestion(page, 'Which state are you in?');
    await selectDropdown(page, 'karnataka');
    await clickNext(page);

    // Q23: Current city (autocomplete)
    await waitForQuestion(page, 'Which city do you currently live in?');
    await fillAutocomplete(page, 'Beng', 'Bengaluru');
    await clickNext(page);

    // Q24: Permanent = current address (2 options = radios)
    await waitForQuestion(page, 'Is your permanent address the same');
    await selectRadio(page, 'No');
    await clickNext(page);

    // Q25: Permanent city (conditional: Q24=no)
    await waitForQuestion(page, 'What is your permanent city');
    await page.locator('input[type="text"]').fill('Mysuru, Karnataka');
    await clickNext(page);

    // Q26: Home ownership (conditional: Q24=no, 3 options = radios)
    await waitForQuestion(page, 'Is your permanent home owned or rented?');
    await selectRadio(page, 'Family home');
    await clickNext(page);
  });

  // ========================================
  // SECTION C: Religion & Community (Q27-Q31)
  // ========================================
  await test.step('Section C: Religion & Community', async () => {
    // Q27: Religion (10 options = dropdown)
    await waitForQuestion(page, 'What is your religion?');
    await selectDropdown(page, 'hindu');
    await clickNext(page);

    // Q28: Religious observance (4 options = radios)
    await waitForQuestion(page, 'How would you describe your level of religious observance?');
    await selectRadio(page, 'Culturally observant');
    await clickNext(page);

    // Q29: Kundali (conditional: Hindu, 2 options = radios)
    await waitForQuestion(page, 'Do you believe in Kundali');
    await selectRadio(page, 'Yes');
    await clickNext(page);

    // Q30: Comfortable sharing caste (2 options = radios)
    await waitForQuestion(page, 'Are you comfortable sharing your sect');
    await selectRadio(page, 'Yes');
    await clickNext(page);

    // Q31: Caste (conditional: Q30=true, text)
    await waitForQuestion(page, 'What is your sect, caste, or community?');
    await page.getByPlaceholder('e.g. Sunni, Brahmin, Catholic, Jat Sikh').fill('Brahmin');
    await clickNext(page);
  });

  // ========================================
  // SECTION D: Family Background (Q32-Q39)
  // ========================================
  await test.step('Section D: Family Background', async () => {
    // Q32 + Q33 (grouped): Father's name + occupation
    await waitForQuestion(page, "What is your father's name?");
    await page.getByPlaceholder('Full name').first().fill('Ramesh Sharma');
    // Q33: Father's occupation (14 options = dropdown)
    await page.locator('select').selectOption('doctor');
    await clickNext(page);

    // Q34 skipped (conditional: Q33 != other)

    // Q35 + Q36 (grouped): Mother's name + occupation
    await waitForQuestion(page, "What is your mother's name?");
    await page.getByPlaceholder('Full name').first().fill('Sunita Sharma');
    // Q36: Mother's occupation (14 options = dropdown)
    await page.locator('select').selectOption('teacher_professor');
    await clickNext(page);

    // Q37 skipped (conditional: Q36 != other)

    // Q38: Claude Chat 1 - Family Background (4 exchanges)
    await test.step('Q38 - Claude Chat 1: Family Background', async () => {
      // Wait for assistant's opening message
      await expect(page.locator('[aria-label="Samvaya message"]').first()).toBeVisible({ timeout: 45000 });

      await chatExchange(page,
        'My family has always been close-knit. Growing up in Bengaluru, my parents emphasized education and compassion. My father is a doctor and my mother is a teacher, so learning was always valued at home.'
      );
      await chatExchange(page,
        'Marriage in our family is seen as a partnership. My parents have a very equal relationship — they make decisions together and support each other\'s careers. That\'s the model I grew up with.'
      );
      await chatExchange(page,
        'We celebrate all major festivals together. Diwali and Ugadi are big occasions. My family is traditional but progressive — they believe in respecting customs while embracing modern values.'
      );
      await chatExchange(page,
        'I\'m very close to my younger brother. We\'re each other\'s biggest supporters. Family gatherings are frequent and I value that connectedness deeply.'
      );

      await waitForChatComplete(page);
      await page.getByRole('button', { name: 'Continue to next question' }).click();
      await page.waitForTimeout(1000);
    });

    // Q39: Number of siblings
    await waitForQuestion(page, 'How many siblings do you have?');
    await page.locator('input[type="number"]').fill('1');
    await clickNext(page);
  });

  // ========================================
  // SECTION E: Physical Details (Q40-Q42)
  // ========================================
  await test.step('Section E: Physical Details', async () => {
    // Q40 + Q41 (grouped): Height + Weight
    await waitForQuestion(page, 'What is your height?');
    await page.getByPlaceholder('e.g. 170').fill('165');
    await page.getByPlaceholder('e.g. 65').fill('58');
    await clickNext(page);

    // Q42: Skin tone (illustrated_mc, OPTIONAL)
    await waitForQuestion(page, 'How would you describe your skin tone?');
    await clickIllustratedMC(page, 'Wheatish');
    await clickNext(page);
  });

  // ========================================
  // SECTION F: Lifestyle (Q43-Q52)
  // ========================================
  await test.step('Section F: Lifestyle', async () => {
    // Q43: Diet (illustrated_mc)
    await waitForQuestion(page, 'What are your dietary preferences?');
    await clickIllustratedMC(page, 'Vegetarian');
    await clickNext(page);

    // Q44: Attire (illustrated_mc)
    await waitForQuestion(page, 'What is your everyday attire preference?');
    await clickIllustratedMC(page, 'Mix of both');
    await clickNext(page);

    // Q45: Fitness (illustrated_mc)
    await waitForQuestion(page, 'How would you describe your fitness habits?');
    await clickIllustratedMC(page, 'Moderate (1-3 times/week)');
    await clickNext(page);

    // Q46: Smoking (illustrated_mc)
    await waitForQuestion(page, 'Do you smoke?');
    await clickIllustratedMC(page, 'No');
    await clickNext(page);

    // Q47: Drinking (illustrated_mc)
    await waitForQuestion(page, 'Do you drink?');
    await clickIllustratedMC(page, 'Socially');
    await clickNext(page);

    // Q48: Tattoos/piercings (illustrated_mc)
    await waitForQuestion(page, 'Do you have tattoos or piercings?');
    await clickIllustratedMC(page, 'None');
    await clickNext(page);

    // Q49: Disability (3 options = radios)
    await waitForQuestion(page, 'Do you have any disabilities');
    await selectRadio(page, 'No');
    await clickNext(page);

    // Q50 skipped (conditional: Q49 != yes)

    // Q51: Allergies (2 options = radios)
    await waitForQuestion(page, 'Do you have any allergies?');
    await selectRadio(page, 'Yes');
    await clickNext(page);

    // Q52: Allergy description (conditional: Q51=true)
    await waitForQuestion(page, 'Please describe your allergies');
    await page.getByPlaceholder('e.g. peanuts, dust, pollen').fill('Dust, pollen');
    await clickNext(page);
  });

  // ========================================
  // SECTION G: Personality & Interests (Q53-Q55)
  // ========================================
  await test.step('Section G: Personality & Interests', async () => {
    // Q53: Hobbies (grouped multi-select with accordions)
    await waitForQuestion(page, 'What are your hobbies and interests?');

    // Select items from different categories
    await selectGroupedItem(page, 'Arts & Creativity', 'Photography');
    await selectGroupedItem(page, 'Sports & Fitness', 'Yoga');
    await selectGroupedItem(page, 'Sports & Fitness', 'Swimming');
    await selectGroupedItem(page, 'Food & Lifestyle', 'Cooking');
    await selectGroupedItem(page, 'Reading & Learning', 'Fiction');
    await selectGroupedItem(page, 'Reading & Learning', 'Podcasts');
    await clickNext(page);

    // Q54: Regular hobbies (text)
    await waitForQuestion(page, 'Which 2-3 hobbies do you actually spend time on regularly?');
    await page.getByPlaceholder('e.g. Reading, Cooking, Running').fill('Reading, Yoga, Cooking');
    await clickNext(page);

    // Q55 skipped (conditional: "other" not selected in Q53)
  });

  // ========================================
  // SECTION H: Education (Q56-Q60)
  // ========================================
  await test.step('Section H: Education', async () => {
    // Q56: Current medical status (5 options = radios)
    await waitForQuestion(page, 'What best describes your current status?');
    await selectRadio(page, 'Completed PG');
    await clickNext(page);

    // Q57 skipped (conditional: Q56 != mbbs_passed)

    // Q58: Additional qualifications (OPTIONAL, 14 options = checkboxes)
    await waitForQuestion(page, 'Do you have any additional qualifications?');
    await page.getByRole('checkbox', { name: 'MD', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Fellowship', exact: true }).click();
    await clickNext(page);

    // Q59 skipped (conditional: "other" not in Q58)

    // Q60: Medical specialty (OPTIONAL, 32 options = checkboxes)
    await waitForQuestion(page, 'What specialty are you currently pursuing');
    await page.getByRole('checkbox', { name: 'Dermatology', exact: true }).click();
    await clickNext(page);
  });

  // ========================================
  // SECTION I: Career (Q61-Q62)
  // ========================================
  await test.step('Section I: Career', async () => {
    // Q61: Has work experience (2 options = radios)
    await waitForQuestion(page, 'Have you worked or are you currently working?');
    await selectRadio(page, 'Yes');
    await clickNext(page);

    // Q62: Work experience timeline (conditional: Q61=true)
    await waitForQuestion(page, 'Add your work experience');
    await page.locator('input[placeholder="e.g. AIIMS New Delhi"]').first().fill('Apollo Hospitals, Bengaluru');
    await page.locator('input[placeholder="e.g. Senior Resident"]').first().fill('Senior Dermatology Resident');
    await page.locator('select[aria-label="Start month"]').first().selectOption('6'); // June
    await page.locator('select[aria-label="Start year"]').first().selectOption('2022');
    await page.getByLabel('I currently work here').click();
    await clickNext(page);
  });

  // ========================================
  // SECTION J: Goals & Values (Q63-Q75)
  // ========================================
  await test.step('Section J: Goals & Values', async () => {
    // Q63: Marriage timeline (4 options = radios)
    await waitForQuestion(page, 'When are you looking to get married?');
    await selectRadio(page, '6-12 months');
    await clickNext(page);

    // Q64: Long-distance (3 options = radios)
    await waitForQuestion(page, 'Are you open to a long-distance relationship');
    await selectRadio(page, 'Open to it');
    await clickNext(page);

    // Q65: Post-marriage arrangement (4 options = radios)
    await waitForQuestion(page, 'What would your preferred post-marriage family arrangement be?');
    await selectRadio(page, 'Flexible');
    await clickNext(page);

    // Q66: Both partners working (5 options = radios)
    await waitForQuestion(page, 'Should both partners work after marriage?');
    await selectRadio(page, 'Yes, both should work');
    await clickNext(page);

    // Q67: Want children (3 options = radios)
    await waitForQuestion(page, 'Do you want children?');
    await selectRadio(page, 'Yes');
    await clickNext(page);

    // Q68: Number of children (conditional: Q67=yes, 4 options = radios)
    await waitForQuestion(page, 'How many children would you ideally like?');
    await selectRadio(page, '2');
    await clickNext(page);

    // Q69: When have children (conditional: Q67=yes, 4 options = radios)
    await waitForQuestion(page, 'When would you like to have children?');
    await selectRadio(page, '3-5 years');
    await clickNext(page);

    // Q70 skipped (conditional: only for divorced/widowed with children)

    // Q71: Settlement countries (multi_select with countries, checkboxes)
    await waitForQuestion(page, 'Where would you like to settle eventually?');
    await page.getByRole('checkbox', { name: 'India', exact: true }).click();
    await clickNext(page);

    // Q72: Immediate relocation (3 options = radios)
    await waitForQuestion(page, 'Are you open to immediate relocation');
    await selectRadio(page, 'Open to it');
    await clickNext(page);

    // Q73: Plans to go abroad (2 options = radios)
    await waitForQuestion(page, 'Do you have plans to study or work outside India');
    await selectRadio(page, 'Yes');
    await clickNext(page);

    // Q74: Countries exploring (conditional: Q73=true, checkboxes)
    await waitForQuestion(page, 'Which countries are you exploring?');
    await page.getByRole('checkbox', { name: 'United States', exact: true }).click();
    await page.getByRole('checkbox', { name: 'United Kingdom', exact: true }).click();
    await clickNext(page);

    // Q75: Claude Chat 2 - Goals & Values (6 exchanges)
    await test.step('Q75 - Claude Chat 2: Goals & Values', async () => {
      await expect(page.locator('[aria-label="Samvaya message"]').first()).toBeVisible({ timeout: 45000 });

      await chatExchange(page,
        'I plan to establish my dermatology practice in Bengaluru within the next year. Long-term, I want to build a clinic that combines cosmetic and medical dermatology.'
      );
      await chatExchange(page,
        'In a partner, I value intellectual curiosity and emotional maturity. Someone who has their own career ambitions but also values family time.'
      );
      await chatExchange(page,
        'When disagreements happen, I believe in open communication. I prefer to address issues directly rather than letting them fester. I think respectful dialogue is key.'
      );
      await chatExchange(page,
        'Financially, I believe in shared responsibility. Both partners should contribute and have transparency about finances. I save consistently and invest wisely.'
      );
      await chatExchange(page,
        'Work-life balance is essential to me. Medicine can be all-consuming, so I make deliberate effort to have hobbies and spend time with family.'
      );
      await chatExchange(page,
        'My ideal future involves both of us growing professionally while building a warm home together. I want children eventually and believe in being an involved parent.'
      );

      await waitForChatComplete(page);
      await page.getByRole('button', { name: 'Continue to next question' }).click();
      await page.waitForTimeout(1000);
    });
  });

  // ========================================
  // SECTION K: Partner Preferences (Q76-Q94)
  // ========================================
  await test.step('Section K: Partner Preferences', async () => {
    // Q76: Age range (range input)
    await waitForQuestion(page, 'What is your preferred age range');
    await fillRange(page, 27, 33);
    await clickNext(page);

    // Q77: Height range (range input)
    await waitForQuestion(page, 'What is your preferred height range');
    await fillRange(page, 170, 185);
    await clickNext(page);

    // Q78: Specific specialty preference (2 options = radios)
    await waitForQuestion(page, 'Do you want your partner in a specific medical specialty?');
    await selectRadio(page, 'No, open to all');
    await clickNext(page);

    // Q79 skipped (conditional: Q78=false)

    // Q80: Partner location (dual location selector)
    await waitForQuestion(page, 'Where would you prefer your partner to currently be based?');
    await page.locator('button[aria-pressed]').filter({ hasText: 'No location preference' }).click();
    await clickNext(page);

    // Q81: Mother tongue preference (OPTIONAL, 23 options = checkboxes)
    await waitForQuestion(page, 'Do you have a mother tongue preference');
    await page.getByRole('checkbox', { name: 'Kannada', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Hindi', exact: true }).click();
    await clickNext(page);

    // Q82: Body type preference (OPTIONAL, 5 options = checkboxes)
    await waitForQuestion(page, 'Do you have a body type preference?');
    await page.getByRole('checkbox', { name: 'Athletic', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Average', exact: true }).click();
    await clickNext(page);

    // Q83: Attire preference (OPTIONAL, 4 options = radios)
    await waitForQuestion(page, "What is your preference for your partner's everyday attire?");
    await selectRadio(page, 'No preference');
    await clickNext(page);

    // Q84: Diet preference (OPTIONAL, 6 options = checkboxes)
    await waitForQuestion(page, "What is your preference for your partner's diet?");
    await page.getByRole('checkbox', { name: 'Vegetarian', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Eggetarian', exact: true }).click();
    await clickNext(page);

    // Q85: Fitness preference (OPTIONAL, 4 options = radios)
    await waitForQuestion(page, "What is your preference for your partner's fitness habits?");
    await selectRadio(page, 'Any level');
    await clickNext(page);

    // Q86: Smoking preference (OPTIONAL, 4 options = radios)
    await waitForQuestion(page, "What is your preference regarding your partner's smoking?");
    await selectRadio(page, 'Non-smoker only');
    await clickNext(page);

    // Q87: Drinking preference (OPTIONAL, 4 options = radios)
    await waitForQuestion(page, "What is your preference regarding your partner's drinking?");
    await selectRadio(page, 'Social drinking is fine');
    await clickNext(page);

    // Q88: Tattoo preference (OPTIONAL, 5 options = radios)
    await waitForQuestion(page, "What is your preference regarding your partner's tattoos");
    await selectRadio(page, 'No preference');
    await clickNext(page);

    // Q89: Family type preference (OPTIONAL, 4 options = radios)
    await waitForQuestion(page, 'What is your preference for family type?');
    await selectRadio(page, 'Flexible');
    await clickNext(page);

    // Q90: Religious observance preference (OPTIONAL, 5 options = radios)
    await waitForQuestion(page, "What is your preference for your partner's religious observance?");
    await selectRadio(page, 'No preference');
    await clickNext(page);

    // Q91: Partner career after marriage (4 options = radios)
    await waitForQuestion(page, "What are your expectations for your partner's career after marriage?");
    await selectRadio(page, 'Both should work');
    await clickNext(page);

    // Q92: Career stages (OPTIONAL, 7 options = checkboxes)
    await waitForQuestion(page, 'Which career stages are acceptable');
    await page.getByRole('checkbox', { name: 'PG Resident', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Completed PG', exact: true }).click();
    await clickNext(page);

    // Q93: Partner qualities (grouped multi-select, max 7)
    await waitForQuestion(page, 'What qualities are you looking for');
    await selectGroupedItem(page, 'Character & Values', 'Honest');
    await selectGroupedItem(page, 'Character & Values', 'Kind');
    await selectGroupedItem(page, 'Character & Values', 'Emotionally Mature');
    await selectGroupedItem(page, 'Personality', 'Humorous');
    await selectGroupedItem(page, 'Personality', 'Intellectual');
    await selectGroupedItem(page, 'Relationship Style', 'Good Listener');
    await selectGroupedItem(page, 'Relationship Style', 'Supportive');
    await clickNext(page);

    // Q94 skipped (conditional: "other" not in Q93)
  });

  // ========================================
  // SECTION L: Documents & Verification (Q95-Q99)
  // ========================================
  await test.step('Section L: Documents & Verification', async () => {
    // Q95: Passport photo (file upload, 1 file)
    await waitForQuestion(page, 'Upload a passport-size photo');
    await page.locator('input[type="file"]').setInputFiles(
      path.join(FIXTURES_DIR, 'test-passport.png')
    );
    // Wait for upload and server-side blur processing
    await expect(page.locator('img[alt="Uploaded photo"]')).toBeVisible({ timeout: 30000 });
    await page.waitForTimeout(2000);
    await clickNext(page);

    // Q96: Profile photos (file upload, min 2)
    await waitForQuestion(page, 'Upload profile photos');
    await page.locator('input[type="file"]').setInputFiles([
      path.join(FIXTURES_DIR, 'test-profile-1.png'),
      path.join(FIXTURES_DIR, 'test-profile-2.png'),
    ]);
    // Wait for both uploads
    await expect(page.locator('img[alt="Uploaded photo"]').nth(1)).toBeVisible({ timeout: 45000 });
    await page.waitForTimeout(2000);
    await clickNext(page);

    // Q97: Identity document (file upload, 1 file)
    await waitForQuestion(page, 'Upload an identity document');
    await page.locator('input[type="file"]').setInputFiles(
      path.join(FIXTURES_DIR, 'test-id-doc.png')
    );
    await expect(page.locator('img[alt="Uploaded document"]')).toBeVisible({ timeout: 30000 });
    await page.waitForTimeout(2000);
    await clickNext(page);

    // Q98: Kundali (conditional: Q29=true, OPTIONAL file upload)
    await waitForQuestion(page, 'Upload your Kundali');
    await page.locator('input[type="file"]').setInputFiles(
      path.join(FIXTURES_DIR, 'test-kundali.png')
    );
    await expect(page.locator('img[alt="Uploaded document"]')).toBeVisible({ timeout: 30000 });
    await page.waitForTimeout(2000);
    await clickNext(page);

    // Q99: BGV consent (3 options = radios)
    await waitForQuestion(page, 'Background Verification Consent');
    // Select the consent option (click it explicitly in case it's not pre-selected)
    await page.getByRole('radio', { name: /I consent to a background check/ }).click();
    await clickNext(page);
  });

  // ========================================
  // SECTION M: Closing (Q100)
  // ========================================
  await test.step('Section M: Closing - Claude Chat 3', async () => {
    await expect(page.locator('[aria-label="Samvaya message"]').first()).toBeVisible({ timeout: 45000 });

    await chatExchange(page,
      'I just want to add that I am genuinely looking for a life partner who values growth, kindness, and family. I am ready for this journey and grateful for the thoughtful process Samvaya provides. Thank you for this experience.'
    );

    await waitForChatComplete(page);

    // Q100 shows "Submit your application" instead of "Continue to next question"
    await page.getByRole('button', { name: 'Submit your application' }).click();
    await page.waitForTimeout(3000);
  });

  // ========================================
  // VERIFY COMPLETION
  // ========================================
  await test.step('Verify completion screen', async () => {
    await expect(page.getByText('Application submitted')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Thank you for completing your Samvaya profile')).toBeVisible();
    await expect(page.getByText('Verification fee: ₹6,000')).toBeVisible();
  });

  // ========================================
  // CHECK FOR CONSOLE ERRORS
  // ========================================
  await test.step('Check for console errors', async () => {
    const realErrors = consoleErrors.filter((e) =>
      !e.includes('Download the React DevTools') &&
      !e.includes('favicon') &&
      !e.includes('Failed to load resource: the server responded with a status of 404') &&
      !e.includes('third-party cookie')
    );

    if (realErrors.length > 0) {
      issues.push(`Console errors found: ${realErrors.join(' | ')}`);
    }

    // Log issues for the report
    if (issues.length > 0) {
      console.log('\n========================================');
      console.log('ISSUES FOUND DURING E2E TEST:');
      console.log('========================================');
      issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
      console.log('========================================\n');
    } else {
      console.log('\n✅ Full onboarding flow completed successfully with zero issues.\n');
    }
  });
});
