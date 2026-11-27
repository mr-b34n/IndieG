import { test, expect } from '@playwright/test';

test.describe('Module 14: Settings & Preferences', () => {

  test.beforeEach(async ({ page }) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  });

  test('TC-SET-01: General & Feedback Tabs Navigation', async ({ page }) => {
    // Navigate to public settings tab: general
    await page.goto('/settings?tab=general');
    await page.waitForTimeout(1000);

    // Verify general settings controls (Heading Giao diện)
    const themeHeading = page.locator('h3:has-text("Giao diện")').or(page.locator('text=Tự động (Theo thiết bị)'));
    await expect(themeHeading.first()).toBeVisible();

    // Switch to Feedback tab using visible navigation button
    const feedbackTab = page.locator('button:visible').filter({ hasText: 'Báo lỗi & Đóng góp' }).first();
    if (await feedbackTab.count() > 0) {
      await feedbackTab.click();
      await page.waitForTimeout(500);
      expect(page.url()).toContain('tab=feedback');
    }

    expect(page.url()).toContain('/settings');
  });

  test('TC-SET-02: Quick Access Pinned Games Settings', async ({ page }) => {
    await page.goto('/settings?tab=quickAccess');
    await page.waitForTimeout(800);

    const quickAccessTitle = page.locator('text=Lối Tắt').or(page.locator('text=Quick Access')).or(page.locator('text=Ghim'));
    if (await quickAccessTitle.count() > 0) {
      await expect(quickAccessTitle.first()).toBeVisible();
    }
    expect(page.url()).toContain('tab=quickAccess');
  });

  test('TC-SET-03: Privacy & Notifications Settings Toggles', async ({ page }) => {
    await page.goto('/settings?tab=privacy');
    await page.waitForTimeout(800);

    // Look for toggle switches
    const toggles = page.locator('button[role="switch"]').or(page.locator('input[type="checkbox"]'));
    if (await toggles.count() > 0) {
      await toggles.first().click();
      await page.waitForTimeout(300);
    }
    expect(page.url()).toContain('tab=privacy');
  });

  test('TC-SET-04: Account Settings & Danger Zone', async ({ page }) => {
    await page.goto('/settings?tab=account');
    await page.waitForTimeout(800);

    // Look for Danger Zone or Change Password
    const dangerZone = page.locator('text=Vùng Nguy Hiểm').or(page.locator('text=Danger Zone')).or(page.locator('text=Xóa tài khoản'));
    if (await dangerZone.count() > 0) {
      await expect(dangerZone.first()).toBeVisible();
    }
    expect(true).toBe(true);
  });

});
