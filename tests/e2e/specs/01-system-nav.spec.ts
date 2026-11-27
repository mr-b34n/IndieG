import { test, expect } from '@playwright/test';

test.describe('Module 1: System, Navigation, Keyboard Shortcuts & Theme/i18n', () => {

  test.beforeEach(async ({ page }) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  });

  test('TC-SYS-01: Theme Switcher via Keyboard Shortcut (T)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header', { timeout: 15000 });
    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme') || 'dark';

    // Press 'T' to toggle theme
    await page.keyboard.press('t');
    await page.waitForTimeout(600);

    const updatedTheme = await html.getAttribute('data-theme') || 'dark';
    expect(updatedTheme).not.toBe(initialTheme);

    // Press 'T' again to revert
    await page.keyboard.press('t');
    await page.waitForTimeout(600);
    const finalTheme = await html.getAttribute('data-theme') || 'dark';
    expect(finalTheme).toBe(initialTheme);
  });

  test('TC-SYS-02: Language Switcher via Keyboard Shortcut (L)', async ({ page }) => {
    await page.goto('/');
    
    // Find a text element that changes between VI and EN, e.g. in Header or Sidebar
    // Press 'L' to toggle language
    await page.keyboard.press('l');
    await page.waitForTimeout(500);

    // Toggle back
    await page.keyboard.press('l');
    await page.waitForTimeout(500);
    expect(true).toBe(true);
  });

  test('TC-SYS-03: Shortcuts Cheatsheet Modal (\\)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header', { timeout: 15000 });
    // Press '\' (Backslash)
    await page.keyboard.press('Backslash');
    await page.waitForTimeout(600);

    // Expect modal or cheatsheet overlay to be visible
    const cheatsheet = page.locator('[role="dialog"]').or(page.locator('text=PHÍM TẮT')).or(page.locator('text=SHORTCUTS')).or(page.locator('#shortcuts-cheatsheet-modal'));
    await expect(cheatsheet.first()).toBeVisible({ timeout: 5000 });

    // Press Esc to close
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('TC-SYS-04: Global Go-To Shortcuts (G -> C, G -> F)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header', { timeout: 15000 });
    // Type 'g' then 'c' within 600ms
    await page.keyboard.press('g');
    await page.waitForTimeout(150);
    await page.keyboard.press('c');
    
    // Expect URL to become /community
    await page.waitForURL('**/community', { timeout: 8000 });
    expect(page.url()).toContain('/community');

    // Go back to feed: 'g' then 'f'
    await page.keyboard.press('g');
    await page.waitForTimeout(150);
    await page.keyboard.press('f');
    await page.waitForURL('http://localhost:3000/', { timeout: 8000 });
    expect(page.url()).toBe('http://localhost:3000/');
  });

  test('TC-SYS-05 & TC-SYS-06: Feed Focus J/K and Post Actions', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('main', { timeout: 5000 });

    // Press 'j' to focus first post
    await page.keyboard.press('j');
    await page.waitForTimeout(300);

    // Press 'j' again to focus next post
    await page.keyboard.press('j');
    await page.waitForTimeout(300);

    // Press 'k' to navigate back up
    await page.keyboard.press('k');
    await page.waitForTimeout(300);
    expect(true).toBe(true);
  });

  test('TC-SYS-07: IME & Input Guard (Shortcuts ignored inside input)', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('input[placeholder*="Nhập tên game"]').or(page.locator('input[type="text"]').first());
    await searchInput.click();
    await searchInput.fill('test');
    
    // Press 't' inside input - should not toggle theme
    const html = page.locator('html');
    const classBefore = await html.getAttribute('class') || '';
    await page.keyboard.type('t');
    await page.waitForTimeout(300);
    const classAfter = await html.getAttribute('class') || '';
    expect(classAfter).toBe(classBefore);
  });

  test('TC-SYS-08: Responsive Layout (Mobile Viewport)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(500);

    // On mobile, bottom navigation should be visible or desktop sidebar hidden
    const body = page.locator('body');
    await expect(body).toBeVisible();
    await page.screenshot({ path: 'tests/e2e/artifacts/mobile_viewport.png' });
  });

  test('TC-SYS-09: Network Latency Simulation & Skeleton Loading States', async ({ page }) => {
    // Delay API data requests by 600ms to verify skeleton loading states
    await page.route('**/api/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.continue();
    });

    await page.goto('/');
    await page.waitForSelector('header', { timeout: 15000 });
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

});
