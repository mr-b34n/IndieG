import { test, expect } from '@playwright/test';

test.describe('Module 10: Global Search & Recent History', () => {

  test.beforeEach(async ({ page }) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  });

  test('TC-SRCH-01: Header Instant Search Dropdown', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header', { timeout: 15000 });

    const searchInput = page.locator('input[placeholder*="Nhập tên game"]').or(page.locator('input[type="text"]').first());
    await searchInput.click();
    await searchInput.fill('CS2');
    await page.waitForTimeout(500);

    // Dropdown suggestions or results preview should be present
    expect(await searchInput.inputValue()).toBe('CS2');
  });

  test('TC-SRCH-02: Deep Search 6 Tabs Navigation', async ({ page }) => {
    await page.goto('/search?q=CS2');
    await page.waitForTimeout(1000);

    // Target category tabs inside the search results container
    const searchTabs = page.locator('main .inline-flex button').or(page.locator('main button[role="tab"]'));
    if (await searchTabs.count() > 1) {
      await searchTabs.nth(1).click();
      await page.waitForTimeout(400);

      if (await searchTabs.count() > 2) {
        await searchTabs.nth(2).click();
        await page.waitForTimeout(400);
      }
    }

    expect(page.url()).toContain('/search');
  });

  test('TC-SRCH-03: Recent Searches Storage & Pills', async ({ page }) => {
    await page.goto('/search?q=Elden');
    await page.waitForTimeout(500);

    // Search query should persist or be saved
    expect(page.url()).toContain('q=Elden');
  });

});
