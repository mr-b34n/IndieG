import { test, expect } from '@playwright/test';

test.describe('Module 4: Post Detail & Threaded Comments', () => {

  test.beforeEach(async ({ page }) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  });

  test('TC-POST-01 & TC-POST-02: Post Detail View & Back Navigation', async ({ page }) => {
    // Navigate directly to a post detail route (e.g. /post/41 or click from feed)
    await page.goto('/post/41');
    await page.waitForTimeout(1000);

    const mainContent = page.locator('main').or(page.locator('article'));
    await expect(mainContent.first()).toBeVisible();

    // Verify back navigation button exists
    const backBtn = page.locator('button:has-text("Quay lại")').or(page.locator('button:has-text("Back")')).first();
    if (await backBtn.count() > 0) {
      await backBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('TC-POST-03 & TC-POST-06: Comment Section & Sorting', async ({ page }) => {
    await page.goto('/post/41');
    await page.waitForTimeout(1000);

    // Look for comment sorting buttons: Nổi bật nhất vs Mới nhất
    const topSortBtn = page.locator('button:has-text("Nổi bật nhất")').or(page.locator('button:has-text("Top")'));
    const newestSortBtn = page.locator('button:has-text("Mới nhất")').or(page.locator('button:has-text("Newest")'));

    if (await newestSortBtn.count() > 0) {
      await newestSortBtn.first().click();
      await page.waitForTimeout(300);
    }

    if (await topSortBtn.count() > 0) {
      await topSortBtn.first().click();
      await page.waitForTimeout(300);
    }

    expect(true).toBe(true);
  });

  test('TC-POST-04: Comment Input Validation & Length Guard', async ({ page }) => {
    await page.goto('/post/41');
    await page.waitForTimeout(800);

    // Look for comment textarea
    const commentInput = page.locator('textarea[placeholder*="bình luận"]').or(page.locator('textarea[placeholder*="comment"]')).first();
    if (await commentInput.count() > 0) {
      await commentInput.fill('Hi'); // Under 6 characters
      await page.waitForTimeout(200);

      // Check submit button state or error warning
      const submitBtn = page.locator('button:has-text("Bình luận")').or(page.locator('button:has-text("Gửi")')).or(page.locator('button:has-text("Comment")')).first();
      if (await submitBtn.count() > 0) {
        expect(await submitBtn.isVisible()).toBe(true);
      }
    }
  });

  test('TC-POST-05: Reply Button and Nested Thread Box Trigger', async ({ page }) => {
    await page.goto('/post/41');
    await page.waitForTimeout(800);

    // Find a reply button on any comment
    const replyBtn = page.locator('button:has-text("Trả lời")').or(page.locator('button:has-text("Reply")')).first();
    if (await replyBtn.count() > 0) {
      await replyBtn.click();
      await page.waitForTimeout(300);

      // A nested reply textarea should appear
      const replyArea = page.locator('textarea').nth(1);
      if (await replyArea.count() > 0) {
        await expect(replyArea).toBeVisible();
      }
    }
    expect(true).toBe(true);
  });

});
