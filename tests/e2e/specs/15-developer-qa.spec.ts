import { test, expect } from '@playwright/test';

test.describe('Module 15: Developer, QA Tools & Data Sanitization', () => {

  test.beforeEach(async ({ page }) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  });

  test('TC-DEV-01: Real Authenticated Session Enforced (No Mock Switcher)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header', { timeout: 15000 });

    // Verify mock account persona switcher is completely absent from the platform
    const mockSwitcher = page.locator('text=Chuyển tài khoản');
    expect(await mockSwitcher.count()).toBe(0);
  });

  test('TC-DEV-02: Zero Junk Communities on Main Platform', async ({ page }) => {
    await page.goto('/community');
    await page.waitForTimeout(800);

    // Ensure test strings do not pollute the UI
    const junk1 = page.locator('text="Test Vote Community"');
    const junk2 = page.locator('text="Community Public"');
    expect(await junk1.count()).toBe(0);
    expect(await junk2.count()).toBe(0);
  });

  test('TC-DEV-03: Developer Portal Route Structure', async ({ page }) => {
    await page.goto('/developer');
    await page.waitForTimeout(800);

    // Route should load developer container or redirect gracefully
    expect(page.url()).toMatch(/\/(developer|auth)/);
  });

});
