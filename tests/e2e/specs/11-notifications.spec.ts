import { test, expect, type Page } from '@playwright/test';

interface MockNotification {
  id: string;
  type: 'comment' | 'reply' | 'like' | 'community' | 'mention' | 'system';
  referenceId: string;
  message: string;
  title: string;
  isRead: boolean;
  link?: string;
  createdAt?: string;
}

test.describe('Module 11: Notification Center - Interactive Scenarios', () => {

  test.beforeEach(async ({ page }) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  });

  const loginUser = async (page: Page) => {
    await page.goto('/auth');
    await page.fill('#email', 'admin@indieg.gg');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await page.goto('/');
    await page.waitForSelector('header', { timeout: 10000 });
  };

  const seedNotifications = async (page: Page, items: MockNotification[]) => {
    await page.evaluate((notifications: MockNotification[]) => {
      const store = (window as unknown as { __notificationStore?: { setState: (state: unknown) => void } }).__notificationStore;
      if (store) {
        store.setState({
          notifications: notifications.map((n) => ({
            userId: 'user-current',
            ...n,
          })),
        });
      }
    }, items);
  };

  test('TC-NOTIF-01: Bell Trigger & Lifecycle (Open, Close with X, Close Outside)', async ({ page }) => {
    await loginUser(page);

    const bellBtn = page.locator('header button:has(svg[data-icon="bell"])').first();
    await expect(bellBtn).toBeVisible({ timeout: 10000 });

    // 1. Click bell to open dropdown
    await bellBtn.click();
    const dropdown = page.locator('.animate-slide-up');
    await expect(dropdown).toBeVisible();
    await expect(dropdown.locator('h3')).toContainText(/thông báo|notification/i);

    // 2. Click 'X' close button inside dropdown
    const closeBtn = dropdown.locator('button:has(svg[data-icon="xmark"])');
    await closeBtn.click();
    await expect(dropdown).not.toBeVisible();

    // 3. Open again and test click outside to close
    await bellBtn.click();
    await expect(dropdown).toBeVisible();

    // Click outside on main area
    await page.locator('main').click({ position: { x: 50, y: 50 } });
    await expect(dropdown).not.toBeVisible();
  });

  test('TC-NOTIF-02: Unread Indicator & Notification List Display', async ({ page }) => {
    await loginUser(page);

    // Seed 2 unread notifications
    await seedNotifications(page, [
      {
        id: 'notif-1',
        type: 'comment',
        referenceId: 'post-1',
        title: 'Bình luận mới',
        message: 'Alex đã bình luận về bài viết của bạn',
        isRead: false,
        link: '/post/post-1',
      },
      {
        id: 'notif-2',
        type: 'like',
        referenceId: 'post-2',
        title: 'Lượt thích mới',
        message: 'Sarah đã thích bài viết của bạn',
        isRead: false,
        link: '/post/post-2',
      },
    ]);

    // Bell button should display unread indicator
    const bellBtn = page.locator('header button:has(svg[data-icon="bell"])').first();
    const unreadDot = bellBtn.locator('span.rounded-full');
    await expect(unreadDot).toBeVisible();

    // Open dropdown
    await bellBtn.click();
    const dropdown = page.locator('.animate-slide-up');
    await expect(dropdown).toBeVisible();

    // Dropdown header shows unread count badge (2 mới)
    const headerBadge = dropdown.locator('span.bg-primary\\/15');
    await expect(headerBadge).toContainText('2');

    // Both notification cards should be rendered
    const items = dropdown.locator('.overflow-y-auto > div.cursor-pointer');
    await expect(items).toHaveCount(2);

    await expect(items.nth(0)).toContainText('Bình luận mới');
    await expect(items.nth(0)).toContainText('Alex đã bình luận về bài viết của bạn');
    await expect(items.nth(1)).toContainText('Lượt thích mới');
    await expect(items.nth(1)).toContainText('Sarah đã thích bài viết của bạn');
  });

  test('TC-NOTIF-03: Filter Tabs Interaction (All vs Unread & Empty States)', async ({ page }) => {
    await loginUser(page);

    // Seed 1 unread and 1 read notification
    await seedNotifications(page, [
      {
        id: 'notif-unread',
        type: 'comment',
        referenceId: 'post-10',
        title: 'Tin nhắn chưa đọc',
        message: 'Nội dung tin nhắn chưa đọc',
        isRead: false,
      },
      {
        id: 'notif-read',
        type: 'system',
        referenceId: 'sys-1',
        title: 'Thông báo đã đọc',
        message: 'Cập nhật hệ thống định kỳ',
        isRead: true,
      },
    ]);

    const bellBtn = page.locator('header button:has(svg[data-icon="bell"])').first();
    await bellBtn.click();
    const dropdown = page.locator('.animate-slide-up');

    // Default 'Tất cả' tab shows both items
    const allTabBtn = dropdown.getByRole('button', { name: /^Tất cả/ });
    const unreadTabBtn = dropdown.getByRole('button', { name: /^Chưa đọc/ });
    await expect(allTabBtn).toBeVisible();
    await expect(unreadTabBtn).toBeVisible();

    let listItems = dropdown.locator('.overflow-y-auto > div.cursor-pointer');
    await expect(listItems).toHaveCount(2);

    // Switch to 'Chưa đọc' tab -> only 1 item shown
    await unreadTabBtn.click();
    listItems = dropdown.locator('.overflow-y-auto > div.cursor-pointer');
    await expect(listItems).toHaveCount(1);
    await expect(listItems.first()).toContainText('Tin nhắn chưa đọc');

    // Switch back to 'Tất cả' tab -> both items shown again
    await allTabBtn.click();
    listItems = dropdown.locator('.overflow-y-auto > div.cursor-pointer');
    await expect(listItems).toHaveCount(2);
  });

  test('TC-NOTIF-04: Click Individual Notification to Mark Read & Update Status', async ({ page }) => {
    await loginUser(page);

    await seedNotifications(page, [
      {
        id: 'notif-click',
        type: 'comment',
        referenceId: 'post-target',
        title: 'Chuyển hướng bài viết',
        message: 'Nhấn để xem bài viết chi tiết',
        isRead: false,
        link: '/',
      },
    ]);

    const bellBtn = page.locator('header button:has(svg[data-icon="bell"])').first();
    await bellBtn.click();
    const dropdown = page.locator('.animate-slide-up');

    // Check that unread circle icon exists for this unread item
    const targetItem = dropdown.locator('.overflow-y-auto > div.cursor-pointer').first();
    const unreadCircle = targetItem.locator('svg[data-icon="circle"]');
    await expect(unreadCircle).toBeVisible();

    // Click the notification item
    await targetItem.click();

    // Reopen dropdown to verify state
    await bellBtn.click();
    await expect(dropdown).toBeVisible();

    // Verify unread circle icon is gone
    const updatedItem = dropdown.locator('.overflow-y-auto > div.cursor-pointer').first();
    await expect(updatedItem.locator('svg[data-icon="circle"]')).not.toBeVisible();
  });

  test('TC-NOTIF-05: Mark All Notifications as Read', async ({ page }) => {
    await loginUser(page);

    await seedNotifications(page, [
      {
        id: 'notif-1',
        type: 'comment',
        referenceId: 'p1',
        title: 'Unread 1',
        message: 'Content 1',
        isRead: false,
      },
      {
        id: 'notif-2',
        type: 'like',
        referenceId: 'p2',
        title: 'Unread 2',
        message: 'Content 2',
        isRead: false,
      },
    ]);

    const bellBtn = page.locator('header button:has(svg[data-icon="bell"])').first();
    await bellBtn.click();
    const dropdown = page.locator('.animate-slide-up');

    // Click 'Đọc tất cả' button
    const markAllBtn = dropdown.locator('button:has(svg[data-icon="check-double"])');
    await expect(markAllBtn).toBeVisible();
    await markAllBtn.click();

    // Red dot on bell icon should disappear
    const unreadDot = bellBtn.locator('span.rounded-full');
    await expect(unreadDot).not.toBeVisible();

    // In 'Chưa đọc' filter tab, empty unread state should be visible
    const unreadTabBtn = dropdown.getByRole('button', { name: /^Chưa đọc/ });
    await unreadTabBtn.click();
    await expect(dropdown).toContainText('Bạn đã xem hết thông báo mới!');
  });

  test('TC-NOTIF-06: Delete Individual Notification and Clear All', async ({ page }) => {
    await loginUser(page);

    await seedNotifications(page, [
      {
        id: 'notif-delete-1',
        type: 'comment',
        referenceId: 'p1',
        title: 'Xóa mục này',
        message: 'Mục sẽ bị xóa',
        isRead: true,
      },
      {
        id: 'notif-delete-2',
        type: 'like',
        referenceId: 'p2',
        title: 'Mục giữ lại tạm thời',
        message: 'Sẽ bị xóa bởi nút Xóa tất cả',
        isRead: true,
      },
    ]);

    const bellBtn = page.locator('header button:has(svg[data-icon="bell"])').first();
    await bellBtn.click();
    const dropdown = page.locator('.animate-slide-up');

    // 1. Delete single item using trash button
    const firstItem = dropdown.locator('.overflow-y-auto > div.cursor-pointer').first();
    const trashBtn = firstItem.locator('button:has(svg[data-icon="trash"])');
    await trashBtn.click({ force: true });

    // Item count decreases to 1
    const remainingItems = dropdown.locator('.overflow-y-auto > div.cursor-pointer');
    await expect(remainingItems).toHaveCount(1);
    await expect(remainingItems.first()).toContainText('Mục giữ lại tạm thời');

    // 2. Clear all notifications using footer action
    const clearAllBtn = dropdown.locator('button:has-text("Xóa tất cả")');
    await clearAllBtn.click();

    // Empty state should be rendered
    await expect(dropdown).toContainText('Không có thông báo nào');
    await expect(dropdown).toContainText('Các hoạt động mới sẽ xuất hiện ở đây.');
  });

  test('TC-NOTIF-07: Real-Time Notification Ingestion (WebSocket Simulation)', async ({ page }) => {
    await loginUser(page);

    const bellBtn = page.locator('header button:has(svg[data-icon="bell"])').first();
    await bellBtn.click();
    const dropdown = page.locator('.animate-slide-up');

    // Initially clear store to ensure empty state
    await page.evaluate(() => {
      const store = (window as unknown as { __notificationStore?: { setState: (state: unknown) => void } }).__notificationStore;
      store?.setState({ notifications: [] });
    });

    await expect(dropdown).toContainText('Không có thông báo nào');

    // Simulate incoming WebSocket event notification:new via store addNotification
    await page.evaluate(() => {
      const store = (window as unknown as {
        __notificationStore?: {
          getState: () => {
            addNotification: (item: unknown) => void;
          };
        };
      }).__notificationStore;

      store?.getState()?.addNotification({
        id: 'notif-realtime',
        type: 'mention',
        referenceId: 'post-socket',
        title: 'Nhắc đến bạn',
        message: 'GamerX vừa nhắc đến bạn trong một bình luận trực tiếp',
        isRead: false,
      });
    });

    // Verify incoming notification dynamically renders at top of list
    const newItem = dropdown.locator('.overflow-y-auto > div.cursor-pointer').first();
    await expect(newItem).toBeVisible();
    await expect(newItem).toContainText('Nhắc đến bạn');
    await expect(newItem).toContainText('GamerX vừa nhắc đến bạn');
  });

});
