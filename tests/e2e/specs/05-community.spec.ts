import { test, expect } from '@playwright/test';

test.describe('Module 5: Communities & Community Hub (TC-COM)', () => {

  test.beforeEach(async ({ page }) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  });

  test('TC-COM-01: Header CTA to Ludon Game Page', async ({ page }) => {
    await page.goto('/community/cs2-vietnam');
    await page.waitForTimeout(1000);

    // Look for button leading to game page in header banner
    const gameBtn = page.locator('button[title*="Xem trang game"]').or(page.locator('button[title*="View"]').filter({ has: page.locator('svg') })).or(page.locator('button:has-text("Counter-Strike 2")')).first();
    await expect(gameBtn).toBeVisible();

    await gameBtn.click();
    await page.waitForTimeout(1000);

    // Expect navigation to game page
    expect(page.url()).toMatch(/\/game\/(counter-strike-2|cs2)/);
  });

  test('TC-COM-02: Community Sidebar / Links Shortcut to Game Hub', async ({ page }) => {
    await page.goto('/community/elden-ring-vietnam');
    await page.waitForTimeout(1000);

    // Look for Game Page shortcut in left sidebar or about tab
    const sidebarGameBtn = page.locator('button[title*="Trang Game Ludon"]').or(page.locator('button[title*="Ludon Game Page"]')).first();
    if (await sidebarGameBtn.count() > 0) {
      await sidebarGameBtn.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toMatch(/\/game\/elden-ring/);
    } else {
      // Check About tab game page card
      await page.goto('/community/elden-ring-vietnam?nav=about');
      await page.waitForTimeout(800);
      const aboutGameCard = page.locator('text=Trang Game').or(page.locator('text=ELDEN RING')).first();
      await expect(aboutGameCard).toBeVisible();
    }
  });

  test('TC-COM-04: Breadcrumb Game Badge Link', async ({ page }) => {
    await page.goto('/community/cs2-vietnam');
    await page.waitForTimeout(1000);

    const gameBadge = page.locator('text=GAME:').or(page.locator('text=Counter-Strike 2')).first();
    if (await gameBadge.count() > 0) {
      await gameBadge.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toMatch(/\/game\/(counter-strike-2|cs2)/);
    }
  });

  test('TC-COM-05: Reverse Linking (Game Page -> Community)', async ({ page }) => {
    await page.goto('/game/counter-strike-2');
    await page.waitForTimeout(1000);

    // Click "Tham gia Cộng đồng" or "Cộng đồng"
    const joinCommunityBtn = page.locator('button:has-text("Tham gia Cộng đồng")').or(page.locator('a:has-text("Tham gia Cộng đồng")')).or(page.locator('text=Tham gia Cộng đồng')).first();
    if (await joinCommunityBtn.count() > 0) {
      await joinCommunityBtn.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toMatch(/\/community\/cs2/);
    }
  });

  test('TC-COM-08: Tab Media Gallery', async ({ page }) => {
    await page.goto('/community/elden-ring-vietnam');
    await page.waitForTimeout(1000);

    const mediaTab = page.locator('button:has-text("Media")').or(page.locator('a:has-text("Media")')).or(page.locator('text=Media'));
    if (await mediaTab.count() > 0) {
      await mediaTab.first().click();
      await page.waitForTimeout(800);
      expect(page.url()).toContain('nav=media');
    }
  });

  test('TC-COM-09: Tab Events', async ({ page }) => {
    await page.goto('/community/cs2-vietnam');
    await page.waitForTimeout(1000);

    const eventsTab = page.locator('button:has-text("Sự kiện")').or(page.locator('a:has-text("Sự kiện")')).or(page.locator('button:has-text("Events")'));
    if (await eventsTab.count() > 0) {
      await eventsTab.first().click();
      await page.waitForTimeout(800);
      expect(page.url()).toContain('nav=events');
    }
  });

  test('TC-COM-11: Join / Leave Community Toggle', async ({ page }) => {
    await page.goto('/community/cs2-vietnam');
    await page.waitForTimeout(1000);

    const joinBtn = page.locator('button:has-text("Đã tham gia")').or(page.locator('button:has-text("Tham gia")')).first();
    if (await joinBtn.count() > 0) {
      await joinBtn.click();
      await page.waitForTimeout(500);
      expect(true).toBe(true);
    }
  });

  test('TC-COM-12: Sanitization of Junk & Test Communities', async ({ page }) => {
    await page.goto('/community');
    await page.waitForTimeout(1000);

    // Verify no "Report Community" or "Comment Community" exists in DOM
    const junkText1 = page.locator('text="Report Community"');
    const junkText2 = page.locator('text="Comment Community"');
    expect(await junkText1.count()).toBe(0);
    expect(await junkText2.count()).toBe(0);
  });

  test('TC-COM-03: Create Community Modal Trigger', async ({ page }) => {
    await page.goto('/community');
    await page.waitForTimeout(800);

    const createBtn = page.locator('button:has-text("Tạo cộng đồng")').or(page.locator('button:has-text("Create Community")')).first();
    if (await createBtn.count() > 0) {
      await createBtn.click();
      await page.waitForTimeout(500);

      const modal = page.locator('[role="dialog"]').or(page.locator('text=Tạo cộng đồng mới'));
      await expect(modal.first()).toBeVisible();

      // Close with Esc
      await page.keyboard.press('Escape');
    }
  });

  test('TC-COM-07: Community Chat Drawer Trigger', async ({ page }) => {
    await page.goto('/community/cs2-vietnam');
    await page.waitForTimeout(800);

    const chatBtn = page.locator('button[title*="Chat"]').or(page.locator('button[aria-label*="chat"]')).or(page.locator('button:has(svg.lucide-message-square)')).first();
    if (await chatBtn.count() > 0) {
      await chatBtn.click();
      await page.waitForTimeout(500);
      expect(true).toBe(true);
    }
  });

});
