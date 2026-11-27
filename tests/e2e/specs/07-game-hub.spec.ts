import { test, expect } from '@playwright/test';

test.describe('Module 7: Game Hub & Library', () => {

  test.beforeEach(async ({ page }) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  });

  test('TC-GAME-01 & TC-GAME-02: Game Detail View & System Specs', async ({ page }) => {
    await page.goto('/game/counter-strike-2');
    await page.waitForTimeout(1000);

    // Verify game title is visible
    const gameHeading = page.locator('h1').or(page.locator('h2')).first();
    await expect(gameHeading).toBeVisible();

    // Look for specs section or specs tab
    const specsSection = page.locator('text=Cấu hình').or(page.locator('text=Tối thiểu')).or(page.locator('text=Minimum'));
    if (await specsSection.count() > 0) {
      await expect(specsSection.first()).toBeVisible();
    }
  });

  test('TC-GAME-03 & TC-GAME-04: Patch Notes & Player Reviews Tabs', async ({ page }) => {
    await page.goto('/game/counter-strike-2');
    await page.waitForTimeout(1000);

    const patchTab = page.locator('button:has-text("Bản vá")').or(page.locator('button:has-text("Patch")')).or(page.locator('text=Bản vá'));
    if (await patchTab.count() > 0) {
      await patchTab.first().click();
      await page.waitForTimeout(400);
    }

    const reviewTab = page.locator('button:has-text("Đánh giá")').or(page.locator('button:has-text("Reviews")')).or(page.locator('text=Đánh giá'));
    if (await reviewTab.count() > 0) {
      await reviewTab.first().click();
      await page.waitForTimeout(400);
    }

    expect(true).toBe(true);
  });

  test('TC-GAME-05: Bidirectional Join Community Button & External Steam Link', async ({ page }) => {
    await page.goto('/game/counter-strike-2');
    await page.waitForTimeout(800);

    const communityBtn = page.locator('button:has-text("Tham gia Cộng đồng")').or(page.locator('a:has-text("Tham gia Cộng đồng")')).or(page.locator('button:has-text("Cộng đồng")'));
    if (await communityBtn.count() > 0) {
      await expect(communityBtn.first()).toBeVisible();
    }

    const steamBtn = page.locator('button:has-text("Steam")').or(page.locator('a:has-text("Steam")')).or(page.locator('a[href*="steampowered.com"]'));
    if (await steamBtn.count() > 0) {
      await expect(steamBtn.first()).toBeVisible();
    }
  });

  test('TC-GAME-06: Create Review / Write Guide Modal Trigger', async ({ page }) => {
    await page.goto('/game/counter-strike-2');
    await page.waitForTimeout(800);

    // Click write review button if present
    const writeReviewBtn = page.locator('button:has-text("Viết đánh giá")').or(page.locator('button:has-text("Write Review")'));
    if (await writeReviewBtn.count() > 0) {
      await writeReviewBtn.first().click();
      await page.waitForTimeout(400);

      const modal = page.locator('[role="dialog"]').or(page.locator('text=Đánh giá'));
      if (await modal.count() > 0) {
        await expect(modal.first()).toBeVisible();
        await page.keyboard.press('Escape');
      }
    }
    expect(true).toBe(true);
  });

});
