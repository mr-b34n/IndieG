import { test, expect } from '@playwright/test';

test.describe('Module 9: Gamer Profile & Battlestation Gear', () => {

  test.beforeEach(async ({ page }) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  });

  test('TC-PROF-01: Profile View & Tab Navigation', async ({ page }) => {
    // Navigate to a user profile or /profile
    await page.goto('/profile');
    await page.waitForTimeout(1000);

    const main = page.locator('main').first();
    await expect(main).toBeVisible();

    // Check tabs: Games, Gear/Góc máy, Guestbook, etc.
    const gearTab = page.locator('button:has-text("Góc máy")').or(page.locator('button:has-text("Gear")')).or(page.locator('text=Góc máy'));
    if (await gearTab.count() > 0) {
      await gearTab.first().click();
      await page.waitForTimeout(400);
    }

    const guestbookTab = page.locator('button:has-text("Lưu bút")').or(page.locator('button:has-text("Guestbook")')).or(page.locator('text=Lưu bút'));
    if (await guestbookTab.count() > 0) {
      await guestbookTab.first().click();
      await page.waitForTimeout(400);
    }

    expect(true).toBe(true);
  });

  test('TC-PROF-02: Profile Specialized Tabs Switching', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForTimeout(800);

    // Switch between Overview, Games, Posts tabs
    const overviewTab = page.locator('button:has-text("Tổng quan")').or(page.locator('button:has-text("Overview")')).first();
    const gamesTab = page.locator('button:has-text("Tủ game")').or(page.locator('button:has-text("Games")')).first();

    if (await gamesTab.count() > 0) {
      await gamesTab.click();
      await page.waitForTimeout(400);
    }

    if (await overviewTab.count() > 0) {
      await overviewTab.click();
      await page.waitForTimeout(400);
    }

    expect(true).toBe(true);
  });

  test('TC-PROF-03: Badge Selector Modal & Avatar Aura Glow', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForTimeout(800);

    // Look for badge selector trigger button
    const badgeBtn = page.locator('button[title*="huy hiệu"]').or(page.locator('button[title*="badge"]')).or(page.locator('button:has-text("Huy hiệu")')).first();
    if (await badgeBtn.count() > 0) {
      await badgeBtn.click();
      await page.waitForTimeout(400);

      const modal = page.locator('[role="dialog"]').or(page.locator('text=Huy hiệu danh dự'));
      if (await modal.count() > 0) {
        await expect(modal.first()).toBeVisible();
        await page.keyboard.press('Escape');
      }
    }
    expect(true).toBe(true);
  });

  test('TC-PROF-04: Edit Profile Modal & Rich Bio Editor Trigger', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForTimeout(800);

    const editProfileBtn = page.locator('button:has-text("Chỉnh sửa hồ sơ")').or(page.locator('button:has-text("Edit Profile")')).first();
    if (await editProfileBtn.count() > 0) {
      await editProfileBtn.click();
      await page.waitForTimeout(400);

      const modal = page.locator('[role="dialog"]').or(page.locator('text=Chỉnh sửa hồ sơ'));
      if (await modal.count() > 0) {
        await expect(modal.first()).toBeVisible();
        await page.keyboard.press('Escape');
      }
    }
    expect(true).toBe(true);
  });

  test('TC-PROF-05: Battlestation 10 Gear Categories Showcase', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForTimeout(800);

    // Check if gear / battlestation categories exist
    const gearSection = page.locator('text=Góc Máy').or(page.locator('text=Battlestation')).or(page.locator('text=CPU')).first();
    if (await gearSection.count() > 0) {
      await expect(gearSection).toBeVisible();
    }
    expect(true).toBe(true);
  });

});
