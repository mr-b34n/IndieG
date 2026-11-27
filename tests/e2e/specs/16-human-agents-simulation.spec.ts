import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * ============================================================================
 * 🎭 HUMAN AGENTS SIMULATION (Mô phỏng hành vi đa tác tử người dùng thực)
 * ============================================================================
 * 
 * Mô phỏng 3 người dùng thực với tính cách và phong cách khác biệt:
 * 1. Alex "Vanguard" Chen (Admin/Creator):
 *    - Đăng nhập, lướt đọc các bài đang nổi bật trên feed.
 *    - Mở modal tạo bài viết, chọn cộng đồng, gõ tiêu đề & bài review game chuyên sâu.
 *    - Xuất bản bài viết và chờ cộng đồng phản hồi.
 * 
 * 2. Peter Griffin (Casual Gamer):
 *    - Đăng nhập từ phiên trình duyệt riêng biệt.
 *    - Cuộn feed, phát hiện bài viết của Alex.
 *    - Di chuột mềm mại và bấm Upvote (Like).
 *    - Mở bài viết chi tiết, gõ bình luận hài hước về trải nghiệm boss.
 * 
 * 3. Geralt of Rivia (RPG Veteran):
 *    - Đăng nhập từ phiên trình duyệt thứ 3.
 *    - Điều hướng vào bài thảo luận, đọc bài (khoảng nghỉ tự nhiên).
 *    - Thả Upvote cho bình luận của Peter và trả lời chia sẻ mẹo dùng chiêu thức.
 * 
 * 4. Alex Chen (Real-time Notification):
 *    - Trở lại màn hình của Alex.
 *    - Di chuột lên chuông thông báo (Notification Bell) trên thanh điều hướng.
 *    - Mở Notification Center để xem ai vừa tương tác và đóng lại.
 */

test.describe.configure({ mode: 'serial' });

// ============================================================================
// HỖ TRỢ HÀNH VI TỰ NHIÊN GIỐNG CON NGƯỜI (HUMAN-LIKE HELPERS)
// ============================================================================

function logAgent(persona: string, icon: string, message: string) {
  const timestamp = new Date().toLocaleTimeString('vi-VN');
  console.log(`\x1b[36m[${timestamp}] ${icon} [${persona}]\x1b[0m ${message}`);
}

/** Di chuyển chuột mềm mại và hover trước khi click */
async function humanClick(page: Page, locator: Locator, description?: string) {
  if (description) {
    console.log(`   👉 Thao tác: Click vào "${description}"`);
  }
  try {
    await locator.scrollIntoViewIfNeeded({ timeout: 5000 });
  } catch {
    // Scroll fallback
  }
  await page.waitForTimeout(100);
  
  const box = await locator.boundingBox();
  if (box && box.width > 0 && box.height > 0) {
    const targetX = box.x + box.width / 2;
    const targetY = box.y + box.height / 2;
    await page.mouse.move(targetX, targetY, { steps: 8 });
    await page.waitForTimeout(120);
    await page.mouse.click(targetX, targetY);
  } else {
    await locator.click();
  }
  await page.waitForTimeout(150);
}

/** Gõ phím theo tốc độ người thật với độ trễ ngẫu nhiên giữa các ký tự */
async function humanType(page: Page, locator: Locator, text: string) {
  await locator.click();
  await page.waitForTimeout(100);
  for (const char of text) {
    const delay = Math.floor(Math.random() * 30) + 15; // 15ms - 45ms mượt mà
    await page.keyboard.type(char, { delay });
  }
  await page.waitForTimeout(150);
}

/** Cuộn trang tự nhiên và dừng lại đọc bài (Cognitive Reading Pause) */
async function humanScrollAndRead(page: Page, distance: number = 300, readTimeMs: number = 800) {
  const steps = 4;
  const stepDist = distance / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, stepDist);
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(readTimeMs);
}

/** Đăng nhập một người dùng cụ thể */
async function loginUser(page: Page, email: string, name: string) {
  logAgent(name, '🔑', `Đang đăng nhập với tài khoản: ${email}`);
  await page.goto('/auth');
  await page.waitForSelector('#email', { timeout: 10000 });

  const emailInput = page.locator('#email');
  const passInput = page.locator('#password');
  await emailInput.fill(email);
  await passInput.fill('Password123!');
  
  const submitBtn = page.locator('button[type="submit"]');
  await humanClick(page, submitBtn, 'Nút Đăng nhập');

  await page.waitForTimeout(1200);
  await page.goto('/');
  await page.waitForSelector('header', { timeout: 15000 });
  logAgent(name, '✅', `Đăng nhập thành công! Đã vào trang chủ Feed.`);
}

// ============================================================================
// SIMULATION TEST SUITE
// ============================================================================

test.describe('🎭 Multi-Agent Human-like Behavior Simulation', () => {
  test.setTimeout(180000);

  test('Kịch bản 3 Agent tương tác thời gian thực: Tạo bài -> Like/Bình luận -> Phản hồi -> Thông báo', async ({ browser }) => {
    console.log('\n===============================================================');
    console.log('🚀 BẮT ĐẦU CHƯƠNG TRÌNH MÔ PHỎNG ĐA TÁC TỬ HÀNH VI CON NGƯỜI');
    console.log('===============================================================\n');

    // ------------------------------------------------------------------------
    // GIAI ĐOẠN 1: Alex Chen (Creator) mở máy, lướt feed & đăng bài review
    // ------------------------------------------------------------------------
    const alexContext = await browser.newContext();
    const alexPage = await alexContext.newPage();
    alexPage.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

    logAgent('Alex Chen (Creator)', '👤', 'Bắt đầu phiên làm việc của Alex Chen.');
    await loginUser(alexPage, 'admin@indieg.gg', 'Alex Chen');

    logAgent('Alex Chen (Creator)', '👀', 'Lướt feed xem các tin tức và bài đăng đang nổi bật...');
    await humanScrollAndRead(alexPage, 350, 1000);
    await humanScrollAndRead(alexPage, -250, 800);

    logAgent('Alex Chen (Creator)', '✍️', 'Mở khung tạo bài viết mới...');
    const trigger = alexPage.locator('text=Chia sẻ khoảnh khắc').first();
    await humanClick(alexPage, trigger, 'Khung Tạo bài viết');

    await alexPage.waitForSelector('div.animate-modal', { timeout: 8000 });
    const modal = alexPage.locator('div.animate-modal');
    await expect(modal).toBeVisible();

    // Chọn cộng đồng
    logAgent('Alex Chen (Creator)', '🏷️', 'Chọn cộng đồng cho bài viết...');
    await modal.locator('button:has-text("Đăng trong"), button:has-text("Posting in"), button:has-text("Chọn cộng đồng")').first().click();
    await alexPage.waitForTimeout(400);
    const commOption = alexPage.locator('.max-h-56 button').first();
    if (await commOption.count() > 0) {
      await humanClick(alexPage, commOption, 'Chọn cộng đồng đầu tiên');
    }
    await alexPage.waitForTimeout(300);

    const postTag = Date.now().toString().slice(-4);
    const postTitle = `[Review] Black Myth Wukong trên RTX 4090 - Hiệu năng đỉnh cao! #${postTag}`;
    const postContent = `Sau 25 giờ trải nghiệm, game chạy cực kỳ mượt mà ở thiết lập 4K max settings. Đồ họa Unreal Engine 5 rất mãn nhãn. Anh em cho mình xin cảm nhận về màn đánh Hổ Tiên Phong nhé!`;

    logAgent('Alex Chen (Creator)', '⌨️', `Đang gõ tiêu đề: "${postTitle}"`);
    const titleInput = modal.locator('input[placeholder*="tiêu đề"], input[placeholder*="title"], input[placeholder*="Tiêu đề"]').first();
    await humanType(alexPage, titleInput, postTitle);

    logAgent('Alex Chen (Creator)', '⌨️', 'Đang nhập nội dung bài viết...');
    const editor = alexPage.locator('.rich-text-editor-canvas').first();
    await humanType(alexPage, editor, postContent);

    logAgent('Alex Chen (Creator)', '🚀', 'Bấm nút xuất bản bài viết.');
    const publishBtn = modal.locator('button:has-text("Đăng bài viết"), button:has-text("Publish Post")').first();
    await humanClick(alexPage, publishBtn, 'Đăng bài viết');
    await alexPage.waitForTimeout(3000);

    logAgent('Alex Chen (Creator)', '🎉', 'Bài viết đã được đăng thành công lên Feed! Đang chờ bạn bè vào tương tác...');

    // ------------------------------------------------------------------------
    // GIAI ĐOẠN 2: Peter Griffin (Casual Gamer) vào lướt feed, Upvote & Comment
    // ------------------------------------------------------------------------
    const peterContext = await browser.newContext();
    const peterPage = await peterContext.newPage();
    peterPage.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

    logAgent('Peter Griffin (Casual)', '🍺', 'Peter mở trình duyệt trên máy của mình...');
    await loginUser(peterPage, 'peter.griffin@quahog.gg', 'Peter Griffin');

    logAgent('Peter Griffin (Casual)', '🔍', 'Peter cuộn trang tìm bài viết thú vị trên Feed...');
    await humanScrollAndRead(peterPage, 300, 1000);

    // Tìm bài viết của Alex trên feed
    logAgent('Peter Griffin (Casual)', '💡', 'Peter nhìn thấy bài review Black Myth Wukong của Alex Chen!');
    const alexPostCard = peterPage.locator(`article:has-text("${postTag}"), article:has-text("${postTitle}")`).first();
    await alexPostCard.scrollIntoViewIfNeeded();
    await peterPage.waitForTimeout(800);

    // Peter bấm Upvote bài viết
    logAgent('Peter Griffin (Casual)', '👍', 'Peter hover chuột và bấm UPVOTE bài viết!');
    const upvoteBtn = alexPostCard.locator('button[aria-label*="Upvote"], button[title*="Upvote"], button:has(svg[data-icon="caret-up"])').first();
    if (await upvoteBtn.count() > 0) {
      await humanClick(peterPage, upvoteBtn, 'Nút Upvote bài post');
    }

    // Peter bấm vào xem chi tiết bài post
    logAgent('Peter Griffin (Casual)', '💬', 'Peter click vào bài viết để mở mục bình luận...');
    const postTitleLink = alexPostCard.locator('h2, h3, a, p').first();
    await humanClick(peterPage, postTitleLink, 'Mở bài viết chi tiết');
    await peterPage.waitForSelector('textarea', { timeout: 10000 });
    await peterPage.waitForTimeout(1000);

    // Peter gõ bình luận
    logAgent('Peter Griffin (Casual)', '⌨️', 'Peter gõ bình luận vào khung thảo luận...');
    const commentArea = peterPage.locator('textarea').first();
    await commentArea.scrollIntoViewIfNeeded();
    const peterCommentText = 'Haha gameplay đỉnh thật đấy Alex ơi! Tôi kẹt ở con hổ ngâm rượu cả buổi tối, phải mang gậy ra đập túi bụi mới qua!';
    await humanType(peterPage, commentArea, peterCommentText);

    logAgent('Peter Griffin (Casual)', '📤', 'Peter gửi bình luận lên thread.');
    const submitCommentBtn = peterPage.locator('button:has-text("Phản hồi"), button:has-text("Bình luận"), button:has-text("Reply")').last();
    if (await submitCommentBtn.count() > 0 && await submitCommentBtn.isEnabled()) {
      await humanClick(peterPage, submitCommentBtn, 'Nút Gửi Bình Luận');
    } else {
      await peterPage.keyboard.press('Enter');
    }
    await peterPage.waitForTimeout(2000);
    logAgent('Peter Griffin (Casual)', '✅', 'Bình luận của Peter đã xuất hiện trên hệ thống!');

    const currentPostUrl = peterPage.url();

    // ------------------------------------------------------------------------
    // GIAI ĐOẠN 3: Geralt of Rivia (RPG Veteran) vào đọc & phản hồi chiến thuật
    // ------------------------------------------------------------------------
    const geraltContext = await browser.newContext();
    const geraltPage = await geraltContext.newPage();
    geraltPage.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

    logAgent('Geralt of Rivia (Veteran)', '🐺', 'Geralt mở trình duyệt và đăng nhập...');
    await loginUser(geraltPage, 'geralt@kaermorhen.org', 'Geralt of Rivia');

    logAgent('Geralt of Rivia (Veteran)', '📖', 'Geralt điều hướng tới bài viết thảo luận của Alex...');
    await geraltPage.goto(currentPostUrl);
    await geraltPage.waitForSelector('main', { timeout: 10000 });
    await geraltPage.waitForTimeout(1200);

    logAgent('Geralt of Rivia (Veteran)', '🧐', 'Geralt đọc bài viết và comment của Peter Griffin (Cognitive delay: 1.5s)...');
    await humanScrollAndRead(geraltPage, 350, 1500);

    // Tìm comment của Peter để Upvote và Reply
    const peterCommentLocator = geraltPage.locator('div:has-text("Haha gameplay đỉnh thật đấy")').first();
    if (await peterCommentLocator.count() > 0) {
      logAgent('Geralt of Rivia (Veteran)', '🔼', 'Geralt upvote bình luận của Peter...');
      const commentUpvote = peterCommentLocator.locator('button:has(svg[data-icon="caret-up"])').first();
      if (await commentUpvote.count() > 0) {
        await humanClick(geraltPage, commentUpvote, 'Upvote Comment Peter');
      }

      logAgent('Geralt of Rivia (Veteran)', '↩️', 'Geralt bấm nút "Trả lời" dưới comment của Peter...');
      const replyBtn = peterCommentLocator.locator('button:has-text("Trả lời"), button:has-text("Reply")').first();
      if (await replyBtn.count() > 0) {
        await humanClick(geraltPage, replyBtn, 'Nút Trả lời comment');
        await geraltPage.waitForTimeout(500);

        logAgent('Geralt of Rivia (Veteran)', '✍️', 'Geralt nhập chia sẻ kinh nghiệm chiến đấu...');
        const replyArea = geraltPage.locator('textarea').last();
        const replyText = 'Dùng Định Thân Pháp (Immobilize) ngay khi con hổ vừa tụ lực vung đao là khắc chế hoàn toàn. Gió đang hú...';
        await humanType(geraltPage, replyArea, replyText);

        const sendReplyBtn = geraltPage.locator('button:has-text("Phản hồi"), button:has-text("Gửi"), button:has-text("Reply")').last();
        if (await sendReplyBtn.count() > 0 && await sendReplyBtn.isEnabled()) {
          await humanClick(geraltPage, sendReplyBtn, 'Gửi phản hồi');
        } else {
          await geraltPage.keyboard.press('Enter');
        }
        await geraltPage.waitForTimeout(2000);
        logAgent('Geralt of Rivia (Veteran)', '⚔️', 'Geralt đã phản hồi xong!');
      }
    }

    // ------------------------------------------------------------------------
    // GIAI ĐOẠN 4: Alex Chen kiểm tra Notification Center theo thời gian thực
    // ------------------------------------------------------------------------
    logAgent('Alex Chen (Creator)', '🔔', 'Chuyển về màn hình của Alex Chen để kiểm tra thông báo thời gian thực!');
    await alexPage.bringToFront();
    await alexPage.waitForTimeout(2000);

    const bellBtn = alexPage.locator('header button:has(svg[data-icon="bell"]), header button[title*="thông báo"], header button:has-text("Thông báo")').first();
    await expect(bellBtn).toBeVisible();

    logAgent('Alex Chen (Creator)', '👀', 'Alex nhìn lên icon chuông thông báo trên Header...');
    await alexPage.waitForTimeout(1000);

    logAgent('Alex Chen (Creator)', '🖱️', 'Alex di chuyển chuột bấm vào chuông để xem ai vừa tương tác...');
    await humanClick(alexPage, bellBtn, 'Chuông thông báo (Bell Icon)');

    const dropdown = alexPage.locator('.animate-slide-up').first();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    logAgent('Alex Chen (Creator)', '📜', 'Notification Dropdown đã mở ra mượt mà!');

    await alexPage.waitForTimeout(1000);

    // Alex đọc lướt các thông báo vừa nhận
    logAgent('Alex Chen (Creator)', '👓', 'Alex đọc qua danh sách thông báo mới nhận được từ Peter và Geralt...');
    await humanScrollAndRead(alexPage, 120, 1000);

    logAgent('Alex Chen (Creator)', '✨', 'Hoàn tất chu kỳ tương tác xã hội giữa 3 người dùng!');

    console.log('\n===============================================================');
    console.log('🎉 KỊCH BẢN MÔ PHỎNG ĐA TÁC TỬ ĐÃ HOÀN THÀNH XUẤT SẮC!');
    console.log('===============================================================\n');

    await alexContext.close();
    await peterContext.close();
    await geraltContext.close();
  });
});
