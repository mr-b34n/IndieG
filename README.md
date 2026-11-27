# 🎮 Ludon Frontend

![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript 6](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite 8](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TanStack Router](https://img.shields.io/badge/TanStack_Router-v1-FF4154?style=for-the-badge&logo=react&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-v5-43853D?style=for-the-badge&logo=react&logoColor=white)

Giao diện ứng dụng web cho nền tảng mạng xã hội & cộng đồng game thủ **Ludon**, xây dựng trên kiến trúc **Feature-Sliced** với React 19, TypeScript, TanStack Router/Query, Zustand và Tailwind CSS v4, tối ưu dung lượng bundle và RAM tiêu thụ trên trình duyệt.

---

## 📋 Danh Mục Tính Năng

### 1. Xác thực & Quản lý phiên (`auth`)
- Giao diện đăng nhập, đăng ký, kiểm tra độ mạnh mật khẩu theo tiêu chuẩn.
- Quy trình xác thực email (`/verify-email`), **xác nhận đổi email** (`/verify-email?mode=email-change&token=...`), banner nhắc xác thực cho tài khoản chưa kích hoạt (`UnverifiedBanner`, `VerifyNoticeModal`).
- Quên mật khẩu và đặt lại mật khẩu (`/reset-password`).
- Tự động giải mã hạn JWT, hàng đợi làm mới token đồng thời (concurrent refresh queue) và khử trùng lặp request trong API client trung tâm.

### 2. Bảng tin & Bài viết (`feed`, `post`)
- **Bảng tin tối ưu hiệu năng**: thanh chuyển nhanh cộng đồng (`CommunityDrawerModal`), sắp xếp bài viết (`Trending`, `Latest`), phân trang vô hạn (giới hạn trang trong bộ nhớ TanStack Query) và CSS `content-visibility: auto` cho danh sách bài viết dài.
- **Trình soạn thảo bài viết (`CreatePostModal` — lazy-loaded)**: hỗ trợ tiêu đề, định dạng Markdown, thẻ `#tag`, chọn cộng đồng, tùy chọn bật/tắt bình luận, tự động nén ảnh WebP bằng Canvas và tải trực tiếp lên Cloudflare R2.
- **Lưu nháp cục bộ theo tài khoản (`draftStorage.ts`)**: tự động lưu nháp bài viết và bình luận/phản hồi vào `localStorage` của trình duyệt theo từng `userId`.
- **Tương tác bài viết (`Post`, `CommentSection`)**: Upvote / Downvote (optimistic update), chia sẻ liên kết, đánh dấu (Bookmark), ghim / khóa bài viết, chỉnh sửa / xóa bài viết, xem ảnh toàn màn hình (`Lightbox`), bình luận lồng nhau đa cấp kèm **đính kèm ảnh tải lên R2** và **autocomplete `@mention` + liên kết `@username`** trong cả bài viết lẫn bình luận.

### 3. Diễn đàn Cộng đồng (`community`)
- Duyệt và tìm kiếm danh sách cộng đồng, tạo mới (`CreateCommunityModal`) và chỉnh sửa thông tin cộng đồng (`EditCommunityModal`).
- Trang chi tiết cộng đồng (`/community/$communityId`): nguồn cấp bài viết, mục bài ghim, thư viện media, danh sách thành viên và trang liên kết/giới thiệu.
- Phân hệ quản trị cộng đồng kết nối API thật: tổng quan (`CommunityManageOverview`), quản lý thành viên & duyệt đơn gia nhập (`CommunityManageMembers`), thăng cấp / gỡ quyền Moderator & kiểm duyệt kick/mute/ban (`CommunityManageModeration`), quản lý nội quy (`CommunityManageRules`), xử lý báo cáo (`CommunityManageReports`) và cài đặt cộng đồng (cập nhật Logo 1:1 & Cover 16:9 bằng `ImageCropperModal` lên R2) + chuyển quyền sở hữu / xóa cộng đồng (`CommunityManageSettings`).

### 4. Trung tâm Dữ liệu Game (`game`)
- Trang khám phá game (`/game`) với bộ lọc thể loại, game nổi bật, phổ biến, gần đây và đồng bộ tìm kiếm từ Steam.
- Trang chi tiết tựa game (`/game/$gameSlug`): tổng quan thông tin & cấu hình yêu cầu (`GameOverviewTab`), nhật ký cập nhật (`GamePatchNotesTab`) và thảo luận liên quan (`GameDiscussionsTab`).
- Quản lý tủ game cá nhân tích hợp ngay trên trang hồ sơ người dùng.

### 5. Hồ sơ Game thủ, Bạn bè, Đã lưu & Lưu bút (`profile`, `bookmark`)
- Trang hồ sơ cá nhân (`/profile/$userId`) với các tab: Tổng quan, Bài viết, Cộng đồng, Tủ game, Đã lưu (Bookmarks), Bạn bè và Lưu bút.
- Chỉnh sửa thông tin cá nhân (`EditProfileModal`), kiểm tra `@username` khả dụng theo thời gian thực và công cụ cắt ảnh đại diện / ảnh bìa (`ImageCropperModal`).
- **Avatar chữ cái đầu đồng bộ (`UserAvatar`)**: tự động hiển thị hình tròn chữ cái đầu (chuẩn Unicode tiếng Việt) ở mọi nơi trên web khi tài khoản chưa có avatar hoặc ảnh tải lỗi.
- **Rich Bio Editor**: soạn thảo tiểu sử đa phông chữ, căn lề, màu chữ và định dạng trực quan.
- **Gaming Gear Showcase**: cấu hình và trưng bày góc máy & thiết bị gaming.
- **Bạn bè & Lưu bút**: gửi / chấp nhận / từ chối / hủy kết bạn, chặn người dùng và viết / xóa lời nhắn lưu bút.

### 6. Tìm kiếm Toàn cục (`search`)
- Hộp tìm kiếm nhanh trên thanh điều hướng và trang kết quả chi tiết (`/search`) hỗ trợ lọc theo **Bài viết**, **Cộng đồng**, **Người dùng** và **Tựa game**.

### 7. Trung tâm Thông báo (`notification`)
- Nhận thông báo thời gian thực qua **Socket.IO** (`useNotificationSocket`, lazy-import chỉ khi đã đăng nhập) kèm cơ chế dự phòng polling (`useNotificationPolling`).
- Dropdown thông báo trực quan: hiển thị số chưa đọc, đánh dấu đã đọc từng mục hoặc tất cả và xóa thông báo.

### 8. Báo cáo Vi phạm (`report`)
- Hộp thoại báo cáo vi phạm (`ReportModal`) gửi trực tiếp tới Backend API kèm phản hồi trạng thái lỗi/thành công rõ ràng.

### 9. Cài đặt, Phản hồi, Giao diện, Đa ngôn ngữ & Phím tắt (`settings`, `shared`)
- Trang cài đặt (`/settings`) gồm **6 tab** đồng bộ 100% với Backend: Giao diện (`Light` / `Dark` / `System`) & Ngôn ngữ (**Tiếng Việt** / **English**, lazy-load gói `en`), Game yêu thích (`quickAccessSlugs` & `followedGameSlugs`), Tài khoản & Bảo mật (Xác thực email, **Đổi Email có xác thực**, Đổi mật khẩu, Quản lý phiên thiết bị, Tạm ngưng / Xóa tài khoản), Quyền riêng tư & Danh sách chặn, Thông báo, và **Báo lỗi & Đóng góp ý tưởng** (kết nối `FeedbackModule` kèm lịch sử phản hồi).
- Bảng tra cứu phím tắt toàn cục (`ShortcutsCheatsheetModal`) và hỗ trợ responsive Desktop / Tablet / Mobile.

### 10. Trực tuyến & Nhắn tin 1-1 (`messages`)
- Trang nhắn tin 2 cột (`/messages`) kết nối REST + Socket.IO realtime (`dm:new`, `dm:read`, `presence:update`), tìm kiếm người chơi để mở hội thoại mới, bộ đếm chưa đọc trên Header & LeftBar và tích hợp trạng thái online thật + nút nhắn nhanh tại `RightBar`.

### 11. Tìm đội / Squad LFG (`squad`)
- Trang Tìm đội (`/squad`): duyệt/lọc phòng theo game, khu vực, trạng thái; tạo phòng mới; tham gia, rời đội, kick thành viên, đóng/mở phòng và nhắn tin trực tiếp với đội trưởng.

### 12. Bảng điều khiển Quản trị (`admin`)
- Trang quản trị toàn cục (`/admin`, phân quyền `ADMIN`) với 5 tab: Báo cáo vi phạm, Phản hồi & Bug, Người dùng, Cộng đồng và Phát thông báo hệ thống.

### 13. Tính năng định hướng tương lai
> *Đánh giá & Cẩm nang Game (Reviews/Guides), Trang Khám phá & Sự kiện Cộng đồng, Huy hiệu & Thành tựu, OAuth2 & Bảo mật 2 lớp (2FA), Cổng Nhà phát triển.*

---

## 🛠️ Công Nghệ Sử Dụng

| Nhóm | Công nghệ / Thư viện |
| :--- | :--- |
| **Core** | React 19 (`^19.2.6`), TypeScript 6 (`^6.0.3`), Vite 8 (`^8.0.12`) |
| **Routing & Data** | TanStack Router v1 (`@tanstack/react-router`), TanStack Query v5 (`@tanstack/react-query`) |
| **State** | Zustand v5 (`zustand`) |
| **Styling & UI** | Tailwind CSS v4 (`@tailwindcss/vite`), `class-variance-authority`, `clsx`, `tailwind-merge` |
| **Icons & Fonts** | `@phosphor-icons/react` (Solid, kèm Vite plugin [phosphor-solid.ts](./vite/plugins/phosphor-solid.ts) cắt bỏ weight thừa), `@fontsource/*` (`cinzel`, `jetbrains-mono`, `merriweather`, `press-start-2p`, `unifrakturmaguntia`) |
| **Realtime** | Socket.IO Client (`socket.io-client` — lazy-loaded) |
| **Testing & Lint** | Vitest v5, Playwright, ESLint 10 |

---

## 📁 Cấu Trúc Thư Mục

```text
src/
├── assets/               # Logo và tài nguyên hình ảnh tĩnh (WebP tối ưu)
├── features/             # 14 module tính năng độc lập
│   ├── admin/            # Bảng điều khiển quản trị toàn cục (Reports, Feedback, Users, Communities, Announcements)
│   ├── auth/             # Đăng nhập, đăng ký, xác thực email, store auth
│   ├── bookmark/         # Danh sách bài viết đã lưu (tích hợp trong Profile)
│   ├── community/        # Cộng đồng, hub chi tiết và bộ quản trị cộng đồng
│   ├── feed/             # Bảng tin, trình soạn thảo bài viết
│   ├── game/             # Trung tâm dữ liệu game, patch notes, thảo luận
│   ├── messages/         # Nhắn tin 1-1 realtime & trạng thái Online (Presence store)
│   ├── notification/     # Thông báo realtime Socket.IO + polling
│   ├── post/             # Chi tiết bài viết, vote, bình luận, ảnh R2, @mention, nháp localStorage
│   ├── profile/          # Hồ sơ game thủ, rich bio, gear, bạn bè, lưu bút
│   ├── report/           # Gửi báo cáo vi phạm
│   ├── search/           # Tìm kiếm toàn cục
│   ├── settings/         # Cài đặt tài khoản, đổi email, phiên, giao diện, quyền riêng tư, phản hồi
│   └── squad/            # Tìm đội / Ghép phòng chơi game (LFG)
├── routes/               # File-based routing của TanStack Router
├── shared/               # Thành phần dùng chung toàn ứng dụng
│   ├── api/              # HTTP client, types, TanStack Query hooks
│   ├── components/       # Header, Sidebars, UserAvatar, Icon, BrandIcons, Modals
│   ├── config/           # Đọc biến môi trường
│   ├── hooks/            # Hotkeys, Theme, Translate, Debounce, Title
│   ├── lib/              # Cấu hình QueryClient (gcTime, maxPages)
│   ├── locales/          # Từ điển đa ngôn ngữ (vi.ts mặc định, en.ts lazy-load)
│   ├── services/         # Dịch vụ upload ảnh lên Cloudflare R2
│   ├── store/            # Theme, Toast, Sidebar, Shortcuts, PageTransition
│   └── utils/            # cn(), image-processor, overlayManager, formatTimeAgo
├── App.css               # Design tokens & cấu hình Tailwind CSS v4 (@theme)
├── App.tsx
└── main.tsx
```

---

## ⚙️ Biến Môi Trường

Sao chép file mẫu trước khi chạy:
```bash
cp .env.example .env
```

| Biến | Mô tả | Mặc định |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | URL gốc gọi Backend API (`/api` để proxy qua Vite dev server) | `/api` |
| `VITE_R2_PUBLIC_URL` | URL công khai của Cloudflare R2 / CDN hiển thị media | — |
| `VITE_MOCK_API` | Chế độ mock cục bộ khi phát triển độc lập (`true` / `false`) | `false` |

---

## 🚀 Hướng Dẫn Khởi Chạy & Kiểm Thử

```bash
# Cài đặt dependencies
pnpm install

# Chạy môi trường phát triển (http://localhost:3000)
pnpm dev

# Kiểm tra TypeScript & build production
pnpm build

# Xem trước bản build production
pnpm preview

# Kiểm tra lint
pnpm lint

# Chạy unit tests (Vitest)
pnpm test

# Chạy E2E tests (Playwright)
pnpm test:e2e
```
