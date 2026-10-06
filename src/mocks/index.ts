/**
 * =========================================================================
 * INDIEG MOCK DATA REPOSITORY
 * =========================================================================
 * Thư mục trung tâm chứa toàn bộ Mock Data mẫu cho ứng dụng.
 * Bạn có thể mở các file trong thư mục này để tự bổ sung thêm dữ liệu:
 *
 * - posts.mock.ts: Bài viết (feed), hình ảnh, tags, bình luận, vote.
 * - communities.mock.ts: Cộng đồng game, thành viên, banner, quy định.
 * - games.mock.ts: Danh sách game, hướng dẫn (guides), đánh giá (reviews), patch notes.
 * - users.mock.ts: Người dùng mẫu, hồ sơ (profile), cấp độ, badge.
 * - notifications.mock.ts: Thông báo (thích, bình luận, kết bạn).
 * - bookmarks.mock.ts: Bài viết đã lưu.
 */

export * from "./users.mock";
export * from "./communities.mock";
export * from "./games.mock";
export * from "./posts.mock";
export * from "./notifications.mock";
export * from "./bookmarks.mock";
export * from "./sessions.mock";
export * from "./reports.mock";
