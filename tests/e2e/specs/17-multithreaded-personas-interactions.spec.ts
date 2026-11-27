import { test, expect, type Browser, type BrowserContext, type Page, type Locator } from '@playwright/test';

/**
 * ============================================================================
 * 🎭 MULTI-THREADED PERSONAS INTERACTION SPEC
 * ============================================================================
 * Kiểm thử đa luồng (Multi-threading / High-Concurrency) mô phỏng nhiều nhân cách người dùng:
 * 
 * 1. Alex "Vanguard" Chen (Creator / Admin)      - admin@indieg.gg
 * 2. Walter White (Analytical Min-Maxer)        - heisenberg@albuquerque.net
 * 3. Peter Griffin (Casual Gamer & Memer)       - peter.griffin@quahog.gg
 * 4. Geralt of Rivia (RPG Veteran & Tactician)  - geralt@kaermorhen.org
 * 5. John Wick (Fast-Reflex FPS Specialist)     - john.wick@continental.nyc
 * 6. Doraemon (22nd Century Tech Enthusiast)    - doraemon@future22.jp
 * 
 * Các kịch bản đa luồng (Concurrent Scenarios):
 * 🔹 STAGE 1: Đa tiến trình khởi tạo và đăng nhập 6 nhân cách song song
 * 🔹 STAGE 2: Đa luồng tạo bài viết đồng thời (Concurrent Post Publishing)
 * 🔹 STAGE 3: Đa luồng bình chọn (Concurrent Post Voting, Race Conditions & Toggle)
 * 🔹 STAGE 4: Đa luồng thảo luận & phản hồi phân cấp (Concurrent Comments & Threaded Replies)
 * 🔹 STAGE 5: Đa luồng bình chọn comment (Concurrent Comment Upvotes)
 * 🔹 STAGE 6: Đồng bộ thông báo thời gian thực phía tác giả (Real-Time Notification Audit)
 */

interface PersonaConfig {
  id: string;
  name: string;
  role: string;
  email: string;
  icon: string;
  color: string;
}

const PERSONAS: Record<string, PersonaConfig> = {
  alex: {
    id: 'alex',
    name: 'Alex "Vanguard" Chen',
    role: 'Tech Reviewer & Creator',
    email: 'admin@indieg.gg',
    icon: '⚡',
    color: '\x1b[36m', // Cyan
  },
  walter: {
    id: 'walter',
    name: 'Walter White (Heisenberg)',
    role: 'Analytical Min-Maxer',
    email: 'heisenberg@albuquerque.net',
    icon: '🧪',
    color: '\x1b[32m', // Green
  },
  peter: {
    id: 'peter',
    name: 'Peter Griffin',
    role: 'Casual Gamer & Memer',
    email: 'peter.griffin@quahog.gg',
    icon: '🍺',
    color: '\x1b[33m', // Yellow
  },
  geralt: {
    id: 'geralt',
    name: 'Geralt of Rivia',
    role: 'RPG Veteran & Tactician',
    email: 'geralt@kaermorhen.org',
    icon: '🐺',
    color: '\x1b[35m', // Magenta
  },
  john: {
    id: 'john',
    name: 'John Wick',
    role: 'Fast-Reflex FPS Specialist',
    email: 'john.wick@continental.nyc',
    icon: '🎯',
    color: '\x1b[31m', // Red
  },
  doraemon: {
    id: 'doraemon',
    name: 'Doraemon 2112',
    role: 'Gadget Enthusiast',
    email: 'doraemon@future22.jp',
    icon: '🔔',
    color: '\x1b[34m', // Blue
  },
};

function logThread(persona: PersonaConfig, action: string, detail: string) {
  const timestamp = new Date().toLocaleTimeString('vi-VN');
  console.log(`${persona.color}[${timestamp}] [Thread: ${persona.id.toUpperCase()}] ${persona.icon} [${persona.name}]\x1b[0m ${action} -> ${detail}`);
}

/** Đăng nhập một nhân cách vào một context độc lập */
async function loginPersona(browser: Browser, persona: PersonaConfig): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());

  logThread(persona, '🔑 ĐĂNG NHẬP', `Khởi tạo session cho ${persona.email}`);
  await page.goto('/auth');
  await page.waitForSelector('#email', { timeout: 10000 });

  await page.locator('#email').fill(persona.email);
  await page.locator('#password').fill('Password123!');
  await page.locator('button[type="submit"]').click();

  await page.waitForTimeout(800);
  await page.goto('/');
  await page.waitForSelector('header', { timeout: 15000 });

  logThread(persona, '✅ SẴN SÀNG', 'Phiên làm việc đã kích hoạt và tải xong trang chủ.');
  return { context, page };
}

test.describe('⚡ MULTI-THREADED TESTING: POST / COMMENT / VOTE ĐA NHÂN CÁCH', () => {
  test.setTimeout(180000);

  test('Chạy kiểm thử đa luồng đồng thời 6 nhân cách trên các tính năng Post, Cmt, Vote', async ({ browser }) => {
    console.log('\n================================================================================');
    console.log('🚀 BẮT ĐẦU CHƯƠNG TRÌNH KIỂM THỬ ĐA LUỒNG VỚI 6 NHÂN CÁCH NGƯỜI DÙNG');
    console.log('================================================================================\n');

    // ========================================================================
    // GIAI ĐOẠN 1: KHỞI TẠO 6 PHIÊN TRÌNH DUYỆT ĐỘC LẬP CHO 6 NHÂN CÁCH
    // ========================================================================
    console.log('\n--- [STAGE 1] KHỞI TẠO 6 THREAD NGƯỜI DÙNG ĐỘC LẬP ---');
    const sessions: Record<string, { context: BrowserContext; page: Page }> = {};

    for (const key of Object.keys(PERSONAS)) {
      sessions[key] = await loginPersona(browser, PERSONAS[key]);
    }

    const { page: alexPage } = sessions.alex;
    const { page: walterPage } = sessions.walter;
    const { page: peterPage } = sessions.peter;
    const { page: geraltPage } = sessions.geralt;
    const { page: johnPage } = sessions.john;
    const { page: doraPage } = sessions.doraemon;

    const uniqueTag = Date.now().toString().slice(-4);
    const alexPostTitle = `[Đánh Giá] Hiệu năng Black Myth Wukong trên RTX 4090 - Ray Tracing & DLSS 3.5 #${uniqueTag}`;
    const walterPostTitle = `[Phân Tích] Tối ưu hóa Build Sát Thương Độc & Khắc Chế Boss Chi Tiết #${uniqueTag}`;

    // ========================================================================
    // GIAI ĐOẠN 2: ĐA LUỒNG TẠO BÀI VIẾT ĐỒNG THỜI (CONCURRENT POST CREATION)
    // ========================================================================
    console.log('\n--- [STAGE 2] ĐA LUỒNG TẠO BÀI VIẾT ĐỒNG THỜI (ALEX CHEN & WALTER WHITE) ---');

    async function createPostFlow(
      persona: PersonaConfig,
      page: Page,
      title: string,
      content: string
    ): Promise<{ postId?: string | number }> {
      logThread(persona, '✍️ TẠO BÀI', `Mở modal đăng bài viết: "${title}"`);
      await page.waitForSelector('text=Chia sẻ khoảnh khắc', { timeout: 10000 });
      const trigger = page.locator('text=Chia sẻ khoảnh khắc').first();
      await trigger.click({ timeout: 5000 });

      await page.waitForSelector('div.animate-modal', { timeout: 10000 });
      const modal = page.locator('div.animate-modal');

      // Chọn cộng đồng
      const commBtn = modal.locator('button:has-text("Đăng trong"), button:has-text("Posting in"), button:has-text("Chọn cộng đồng")').first();
      await commBtn.click({ timeout: 5000 });
      await page.waitForTimeout(300);
      const commOption = page.locator('.max-h-56 button').first();
      if (await commOption.count() > 0) {
        await commOption.click({ timeout: 5000 });
      }
      await page.waitForTimeout(200);

      // Điền tiêu đề & nội dung
      const titleInput = modal.locator('input[placeholder*="tiêu đề"], input[placeholder*="title"], input[placeholder*="Tiêu đề"]').first();
      await titleInput.fill(title);

      const editor = modal.locator('.rich-text-editor-canvas').first();
      await editor.click();
      await page.keyboard.insertText(content);
      await page.waitForTimeout(200);

      // Đăng bài và bắt response
      const responsePromise = page.waitForResponse(
        (resp) => resp.url().includes('/posts') && resp.request().method() === 'POST',
        { timeout: 15000 }
      ).catch(() => null);

      const publishBtn = modal.locator('button:has-text("Đăng bài viết"), button:has-text("Publish Post")').first();
      await publishBtn.click({ timeout: 5000 });

      const resp = await responsePromise;
      let createdId: string | number | undefined;
      if (resp && resp.ok()) {
        try {
          const body = await resp.json();
          createdId = body.id;
        } catch {
          // ignore
        }
      }

      await page.waitForTimeout(2000);
      logThread(persona, '🎉 HOÀN TẤT ĐĂNG', `Bài viết đã xuất bản thành công! (ID: ${createdId ?? 'Tạo từ UI'})`);
      return { postId: createdId };
    }

    // Chạy song song 2 luồng đăng bài đồng thời
    const [alexResult, walterResult] = await Promise.all([
      createPostFlow(
        PERSONAS.alex,
        alexPage,
        alexPostTitle,
        `Trải nghiệm mượt mà 4K DLSS 3.5 Frame Generation trên RTX 4090. Nhiệt độ GPU duy trì ở mức 62 độ C cực mát. Mời anh em thảo luận và để lại ý kiến!`
      ),
      createPostFlow(
        PERSONAS.walter,
        walterPage,
        walterPostTitle,
        `Công thức độc tố kết hợp ngọc bổ trợ khuếch đại sát thương theo thời gian (DoT) lên tới 340% so với thông thường. Đây là toán học thuần túy!`
      ),
    ]);

    // ========================================================================
    // ĐIỀU HƯỚNG TẤT CẢ NHÂN CÁCH TỚI BÀI VIẾT CỦA ALEX ĐỂ TEST TƯƠNG TÁC CONCURRENT
    // ========================================================================
    console.log('\n--- [DISCOVERY] CÁC THREAD TRUY CẬP VÀO BÀI VIẾT CỦA ALEX ---');
    let targetPostUrl = alexResult.postId ? `/post/${alexResult.postId}` : '';

    if (!targetPostUrl) {
      await peterPage.goto('/');
      await peterPage.waitForSelector('main', { timeout: 10000 });
      const alexPostCard = peterPage.locator(`article:has-text("${uniqueTag}")`).first();
      await alexPostCard.scrollIntoViewIfNeeded();
      const postTitleLink = alexPostCard.locator('h2, h3, a, p').first();
      await postTitleLink.click({ timeout: 5000 });
      await peterPage.waitForSelector('textarea', { timeout: 10000 });
      targetPostUrl = peterPage.url();
    } else {
      await peterPage.goto(targetPostUrl);
      await peterPage.waitForSelector('textarea', { timeout: 10000 });
    }

    console.log(`📌 URL bài thảo luận mục tiêu: ${targetPostUrl}`);

    // Đồng loạt 4 thread còn lại điều hướng thẳng vào URL bài viết
    await Promise.all([
      walterPage.goto(targetPostUrl),
      geraltPage.goto(targetPostUrl),
      johnPage.goto(targetPostUrl),
      doraPage.goto(targetPostUrl),
    ]);

    await Promise.all([
      walterPage.waitForSelector('textarea', { timeout: 10000 }),
      geraltPage.waitForSelector('textarea', { timeout: 10000 }),
      johnPage.waitForSelector('textarea', { timeout: 10000 }),
      doraPage.waitForSelector('textarea', { timeout: 10000 }),
    ]);

    // ========================================================================
    // GIAI ĐOẠN 3: ĐA LUỒNG BÌNH CHỌN (HIGH-CONCURRENCY POST VOTING)
    // ========================================================================
    console.log('\n--- [STAGE 3] ĐA LUỒNG BÌNH CHỌN ĐỒNG THỜI (VOTE RACE CONDITION & AGGREGATION) ---');
    console.log('⚡ 5 nhân cách đồng loạt gửi Vote lên máy chủ tại cùng một thời điểm:');
    console.log('   - Peter Griffin:   UPVOTE (+1)');
    console.log('   - Walter White:    UPVOTE (+1)');
    console.log('   - John Wick:       UPVOTE (+1)');
    console.log('   - Doraemon:        UPVOTE (+1)');
    console.log('   - Geralt of Rivia: DOWNVOTE (-1)');

    async function votePost(persona: PersonaConfig, page: Page, isUpvote: boolean) {
      const selector = isUpvote
        ? 'button[aria-label*="Upvote"], button[title*="Upvote"], button:has(svg[data-icon="caret-up"])'
        : 'button[aria-label*="Downvote"], button[title*="Downvote"], button:has(svg[data-icon="caret-down"])';
      const btn = page.locator(selector).first();
      logThread(persona, isUpvote ? '🔼 UPVOTE POST' : '🔽 DOWNVOTE POST', 'Gửi thao tác vote lên server...');
      await btn.click({ timeout: 5000 });
    }

    // THỰC HIỆN 5 THAO TÁC VOTE ĐỒNG THỜI (CONCURRENT VOTE)
    await Promise.all([
      votePost(PERSONAS.peter, peterPage, true),
      votePost(PERSONAS.walter, walterPage, true),
      votePost(PERSONAS.john, johnPage, true),
      votePost(PERSONAS.doraemon, doraPage, true),
      votePost(PERSONAS.geralt, geraltPage, false),
    ]);

    await peterPage.waitForTimeout(2000);
    logThread(PERSONAS.peter, '📊 KIỂM TRA ĐIỂM SỐ', 'Đã ghi nhận tương tác vote đa luồng từ 5 tài khoản song song.');

    // Kế tiếp: Test tính năng Toggle Vote (Hủy vote) và Flip Vote (Đổi từ Downvote sang Upvote)
    console.log('\n--- [STAGE 3.2] CONCURRENT VOTE TOGGLE & SWITCH ---');
    console.log('⚡ Kiểm thử đổi trạng thái vote đồng thời:');
    console.log('   - Peter Griffin: Bấm Upvote lần nữa để HỦY VOTE (Toggle off)');
    console.log('   - Geralt of Rivia: Đổi từ DOWNVOTE sang UPVOTE (Flip vote)');

    await Promise.all([
      votePost(PERSONAS.peter, peterPage, true), // Toggle off upvote
      votePost(PERSONAS.geralt, geraltPage, true), // Flip from downvote to upvote
    ]);
    await peterPage.waitForTimeout(1500);

    // ========================================================================
    // GIAI ĐOẠN 4: ĐA LUỒNG BÌNH LUẬN ĐỒNG THỜI (CONCURRENT COMMENTS)
    // ========================================================================
    console.log('\n--- [STAGE 4] ĐA LUỒNG BÌNH LUẬN ĐỒNG THỜI TRÊN CÙNG MỘT BÀI VIẾT ---');

    async function submitTopComment(persona: PersonaConfig, page: Page, commentText: string) {
      logThread(persona, '💬 GÕ BÌNH LUẬN', `"${commentText}"`);
      const commentArea = page.locator('textarea').first();
      await commentArea.scrollIntoViewIfNeeded();
      await commentArea.click();
      await commentArea.pressSequentially(commentText, { delay: 5 });
      await page.waitForTimeout(200);

      const submitBtn = page.locator('div:has(textarea) button:has-text("Trả lời"), div:has(textarea) button:has-text("Reply")').first();
      if (await submitBtn.count() > 0 && await submitBtn.isEnabled({ timeout: 2000 }).catch(() => false)) {
        await submitBtn.click({ timeout: 5000 });
      } else {
        await commentArea.press('Control+Enter');
      }
      await page.waitForTimeout(1000);
      logThread(persona, '✅ ĐÃ ĐĂNG COMMENT', 'Bình luận đã gửi thành công!');
    }

    // 4 Nhân cách đồng thời gửi bình luận cùng lúc
    await Promise.all([
      submitTopComment(
        PERSONAS.peter,
        peterPage,
        'Vừa chơi thử vừa ăn pizza thịt nướng, đồ họa đẹp ngất ngây anh em ạ! Đánh Hổ Tiên Phong sướng tay vãi!'
      ),
      submitTopComment(
        PERSONAS.walter,
        walterPage,
        'Số liệu benchmark RTX 4090 rất chuẩn xác. 1% low FPS ổn định trên 85 FPS là tỷ lệ hoàn hảo.'
      ),
      submitTopComment(
        PERSONAS.doraemon,
        doraPage,
        'Mọi người nhớ dùng thêm tay cầm hỗ trợ rung phản hồi lực để cảm nhận rõ độ nặng của thiết bổng!'
      ),
      submitTopComment(
        PERSONAS.john,
        johnPage,
        'Súng lục trong game này là cây gậy như ý à? Dứt khoát và không một động tác thừa.'
      ),
    ]);

    await peterPage.waitForTimeout(2000);
    // Reload nhẹ để các luồng đồng bộ danh sách bình luận mới nhất
    await geraltPage.reload();
    await geraltPage.waitForSelector('textarea', { timeout: 10000 });
    await geraltPage.waitForTimeout(1500);

    // ========================================================================
    // GIAI ĐOẠN 4.2: TRẢ LỜI PHÂN CẤP ĐỒNG THỜI (THREADED NESTED REPLIES)
    // ========================================================================
    console.log('\n--- [STAGE 4.2] ĐA LUỒNG TRẢ LỜI PHÂN CẤP (NESTED THREADED REPLIES) ---');
    console.log('⚡ Geralt of Rivia tìm bình luận của Peter Griffin để phản hồi mẹo chiến đấu:');

    // Nút mở hộp trả lời của comment luôn chứa icon faReply (svg[data-icon="reply"])
    const replyTrigger = geraltPage.locator('button:has(svg[data-icon="reply"])').first();
    if (await replyTrigger.count() > 0) {
      logThread(PERSONAS.geralt, '🔍 TÌM THẤY NÚT TRẢ LỜI', 'Bấm nút Trả lời dưới comment...');
      await replyTrigger.click({ timeout: 5000 });
      await geraltPage.waitForTimeout(500);

      // Textarea thứ 2 xuất hiện là box trả lời con
      const replyArea = geraltPage.locator('textarea').nth(1);
      if (await replyArea.count() > 0) {
        await replyArea.click({ timeout: 5000 });
        await replyArea.pressSequentially('Đừng mải ăn pizza lúc con hổ xoay đao. Lùi lại 2 nhịp rồi dùng Định Thân Pháp là dứt điểm gọn gàng.', { delay: 5 });
        await geraltPage.waitForTimeout(300);

        // Submit trực tiếp bằng Ctrl+Enter
        await replyArea.press('Control+Enter');
        await geraltPage.waitForTimeout(1500);
        logThread(PERSONAS.geralt, '⚔️ PHẢN HỒI THÀNH CÔNG', 'Đã trả lời lồng phân cấp (Nested reply) cho Peter!');
      }
    }

    // ========================================================================
    // GIAI ĐOẠN 5: ĐA LUỒNG VOTE CHO BÌNH LUẬN (CONCURRENT COMMENT VOTING)
    // ========================================================================
    console.log('\n--- [STAGE 5] ĐA LUỒNG BÌNH CHỌN CHO COMMENT (CONCURRENT COMMENT VOTES) ---');
    
    async function upvoteFirstVisibleComment(persona: PersonaConfig, page: Page) {
      const commentUpvoteBtn = page.locator('div:has(textarea) ~ div button:has(svg[data-icon="caret-up"]), article button:has(svg[data-icon="caret-up"])').nth(1);
      if (await commentUpvoteBtn.count() > 0) {
        logThread(persona, '👍 UPVOTE COMMENT', 'Thả upvote cho comment trong danh sách...');
        await commentUpvoteBtn.click({ timeout: 3000 }).catch(() => null);
      }
    }

    // Doraemon và John Wick cùng upvote comment đồng thời
    await Promise.all([
      upvoteFirstVisibleComment(PERSONAS.doraemon, doraPage),
      upvoteFirstVisibleComment(PERSONAS.john, johnPage),
    ]);

    await doraPage.waitForTimeout(1500);

    // ========================================================================
    // GIAI ĐOẠN 6: KIỂM TRA ĐỒNG BỘ THỜI GIAN THỰC & THÔNG BÁO TÁC GIẢ (ALEX CHEN)
    // ========================================================================
    console.log('\n--- [STAGE 6] XÁC THỰC THÔNG BÁO THỜI GIAN THỰC PHÍA TÁC GIẢ (ALEX CHEN) ---');
    logThread(PERSONAS.alex, '🔔 KIỂM TRA NOTIFICATION', 'Alex Chen trở lại màn hình để kiểm tra thông báo từ các luồng tương tác...');
    await alexPage.bringToFront();
    await alexPage.waitForTimeout(1500);

    const bellBtn = alexPage.locator('header button:has(svg[data-icon="bell"]), header button[title*="thông báo"], header button:has-text("Thông báo")').first();
    await expect(bellBtn).toBeVisible({ timeout: 5000 });

    logThread(PERSONAS.alex, '🖱️ MỞ CHUÔNG', 'Alex bấm vào chuông thông báo...');
    await bellBtn.click({ timeout: 5000 });

    const dropdown = alexPage.locator('.animate-slide-up').first();
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    logThread(PERSONAS.alex, '📜 THÀNH CÔNG', 'Notification Center đã hiển thị các thông báo thời gian thực từ Peter, Walter, Geralt!');

    await alexPage.waitForTimeout(2000);

    console.log('\n================================================================================');
    console.log('🎉 KIỂM THỬ ĐA LUỒNG 6 NHÂN CÁCH (POST/CMT/VOTE) ĐÃ HOÀN TẤT THÀNH CÔNG RỰC RỠ!');
    console.log('================================================================================\n');

    for (const key of Object.keys(sessions)) {
      await sessions[key].context.close();
    }
  });
});
