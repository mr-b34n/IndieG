# 🎮 IndieG - Nền Tảng Mạng Xã Hội, Thảo Luận & Khám Phá Game Đỉnh Cao

![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TanStack Router](https://img.shields.io/badge/TanStack_Router-v1-FF4154?style=for-the-badge&logo=react&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-v5-43853D?style=for-the-badge&logo=react&logoColor=white)

**IndieG** là một nền tảng mạng xã hội và trung tâm kết nối cộng đồng game thủ hiện đại, kết hợp giữa phong cách mạng xã hội (Social Feed) và diễn đàn game chuyên sâu (Gaming Hub). Ứng dụng mang đến trải nghiệm toàn diện cho game thủ: từ thảo luận chiến thuật, chia sẻ khoảnh khắc, tìm kiếm tổ đội leo rank (LFG - Looking For Group), khám phá kho game & nhà phát triển indie Việt Nam, đến việc phô diễn cá tính chiến binh và góc máy **Gaming Gear** cực chất.

---

## 🌟 Tổng Quan Các Tính Năng Chi Tiết

### 📰 1. Bảng Tin & Đăng Bài Viết (Feed & Create Post)
* **Trình soạn thảo bài viết đa năng (Rich Post Editor)**:
  * Đặt tiêu đề bài viết (tối thiểu 6 ký tự, tối đa 200 ký tự).
  * Hỗ trợ định dạng văn bản, cú pháp Markdown và gắn thẻ `@tag` người dùng.
  * Đính kèm đa phương tiện: Hình ảnh, Video, Tệp tin, GIF và bộ chọn biểu tượng cảm xúc (Emoji Picker).
  * Lựa chọn đăng tải theo từng **Cộng đồng (Community Selector)** cụ thể.
  * Thiết lập quyền riêng tư: Công khai, Thành viên, hoặc Tắt bình luận.
* **Bộ lọc nguồn cấp bài viết (Smart Feed Tabs)**:
  * **Xu hướng (Trending)**: Các bài viết nhận nhiều tương tác nhất.
  * **Mới nhất (Latest)**: Cập nhật bài viết theo thứ tự thời gian thực.
  * **Thảo luận (Discussions)**: Chủ đề hỏi đáp, chia sẻ ý kiến.
  * **Hướng dẫn (Guides)**: Bài viết kinh nghiệm, mẹo chơi game.
  * **Tin tức (News)**: Thông tin sự kiện và cập nhật ngành game.
* **Tương tác bài viết**:
  * Like / Thả tim, Chia sẻ (Copy link bài viết), Đánh dấu (Bookmark).
  * Ghim bài viết quan trọng (Pin Post) dành cho tác giả.
  * Chỉnh sửa bài viết (Edit Post Modal) và Xóa bài viết.
  * Báo cáo vi phạm bài viết với lý do cụ thể.

---

### 💬 2. Hệ Thống Bình Luận Phân Cấp (Threaded Comments & Replies)
* **Bình luận lồng nhau đa cấp (Multi-level Nested Replies)**: Trả lời trực tiếp vào bình luận chính hoặc phản hồi của người khác.
* **Đính kèm hình ảnh trong bình luận**: Hỗ trợ tải lên ảnh minh họa kèm tính năng cắt/xem trước trực quan.
* **Tính năng dành cho chủ bài viết**: Ghim bình luận tâm đắc lên đầu (Pin Comment).
* **Kiểm tra độ dài nội dung (Validation Guards)**:
  * Ràng buộc độ dài tối thiểu 6 ký tự (hoặc có đính kèm ảnh) và tối đa 1000 ký tự.
  * Cảnh báo trực quan bằng biểu tượng cảnh báo và thông báo lỗi đa ngôn ngữ.
* **Sắp xếp bình luận**: Lựa chọn hiển thị theo **Bình luận hàng đầu (Top comments)** hoặc **Mới nhất (Newest first)**.
* **Chỉnh sửa & Xóa bình luận**: Cập nhật nhanh chóng nội dung đã đăng.

---

### 🌐 3. Diễn Đàn Cộng Đồng (Communities Hub)
* **Khám phá theo danh mục**: FPS, MOBA, RPG, Indie Games, Esports, Console, Mobile...
* **Tạo cộng đồng mới (Create Community Modal)**:
  * Tùy chọn tên cộng đồng (tối thiểu 3 ký tự) và mô tả mục tiêu (tối thiểu 6 ký tự).
  * Chọn biểu tượng/preset huy hiệu đặc trưng và ảnh bìa cộng đồng.
* **Trang chi tiết cộng đồng**:
  * Hiển thị thông tin banner, số lượng thành viên, nội quy cộng đồng.
  * Nút Tham gia / Rời cộng đồng (Join/Leave).
  * Nguồn cấp bài viết riêng biệt dành riêng cho từng cộng đồng.
  * Danh sách quản trị viên và thành viên tích cực.

---

### ⚔️ 4. Ghép Đội & Tìm Bạn Chơi Game (Squad & LFG - Looking For Group)
* **Sảnh tìm kiếm Squad thông minh**:
  * Lọc theo tựa game yêu thích (CS2, Valorant, Liên Minh Huyền Thoại, PUBG, GTA V, Apex Legends...).
  * Lọc theo **Bậc Rank**: Đồng, Bạc, Vàng, Bạch Kim, Kim Cương, Cao Thủ / Thách Đấu.
  * Lọc theo **Vai trò (Role)**: Sniper, Duelist, Support, Tanker, IGL, Entry Fragger.
  * Lọc theo **Chế độ chơi**: Tryhard leo rank nghiêm túc, Casual giải trí, Custom phòng.
* **Tạo phòng Squad mới**:
  * Tùy chỉnh số lượng thành viên cần tuyển, cấp bậc yêu cầu, ngôn ngữ giao tiếp.
  * Đặt link kênh Voice Chat (Discord / In-game voice).
* **Phòng chờ Squad trực tiếp**: Quản lý thành viên trong phòng, trạng thái sẵn sàng (Ready check) và kết nối nhanh.

---

### 🕹️ 5. Trung Tâm Khám Phá & Tủ Game (Game Hub & Library)
* **Khám phá game & Spotlight Indie Việt**:
  * Khu vực **Vietnamese Indie Spotlight**: Giới thiệu và tôn vinh các tựa game và studio sáng tạo đến từ Việt Nam.
  * Xem danh sách game thịnh hành, game mới ra mắt.
* **Chi tiết tựa game chuyên sâu**:
  * Tổng quan, nhà phát hành, ngày phát hành, thể loại, đánh giá từ người chơi.
  * **Yêu cầu cấu hình hệ thống**: Chi tiết Cấu hình tối thiểu (Minimum Specs) và Cấu hình đề nghị (Recommended Specs).
  * **Nhật ký cập nhật & Patch Notes**: Lịch sử phiên bản, thông báo bản vá lỗi (Hotfix), sự kiện (Event), bản cập nhật lớn (Major Update).
  * **Hướng dẫn & Thảo luận**: Các bài viết chia sẻ bí kíp, mẹo vượt ải cho từng tựa game.
  * **Danh sách Thành tựu (Achievements)**: Bộ sưu tập cúp và huy hiệu trong game.

---

### 👤 6. Hồ Sơ Game Thủ Cá Nhân Hóa (Gamer Profile & Battlestation)
* **Bộ nhận diện cá nhân (Identity & Badges)**:
  * Ảnh đại diện tùy chỉnh (hỗ trợ công cụ Crop ảnh chuyên nghiệp).
  * Ảnh bìa điện ảnh (Cinematic Cover Banner) phong cách Cyberpunk/Gaming.
  * Danh hiệu & Thẻ khung Avatar (Badges Selector & Frame).
  * Tiểu sử cá nhân, Điểm uy tín cộng đồng (Reputation Score), Ngày tham gia, Khu vực/Server.
  * Liên kết tài khoản mạng xã hội & gaming: Discord, Steam, Riot Games, Epic Games, Twitch, YouTube.
* **🖥️ Battlestation & Gaming Gear Showcase (Góc máy & Vũ khí gaming)**:
  * Trưng bày cấu hình PC & phụ kiện thực tế: **CPU, GPU, Màn hình, Chuột, Bàn phím cơ, Lót chuột, Tai nghe, DAC/Soundcard**.
* **📊 Thống kê E-Sports & Tủ game cá nhân**:
  * Số giờ chơi, Tỷ lệ thắng (Win Rate), Chỉ số K/D, Tỷ lệ MVP.
  * Danh sách game đang chơi và thành tích đạt được.
* **📖 Sổ Lưu Bút Trang Cá Nhân (Guestbook)**:
  * Bạn bè và người ghé thăm có thể để lại lời nhắn, lời chúc mừng hoặc nhận xét thân thiện (GG).
  * Tích hợp kiểm tra độ dài tối thiểu và các thao tác tương tác (Thích, Xóa lời nhắn).
* **🤝 Quản lý Bạn bè (Friends System)**:
  * Gửi lời mời kết bạn, danh sách lời mời đang chờ (Pending Requests).
  * Chấp nhận, từ chối, hủy kết bạn và chặn người dùng (Block User) dễ dàng.

---

### 🔍 7. Tìm Kiếm Toàn Cục (Global Search)
* **Hộp thoại tìm kiếm tức thì**:
  * Tìm kiếm tổng hợp theo từ khóa xuyên suốt Bài viết, Cộng đồng, Người dùng, Tựa game và Squad.
  * Lọc kết quả theo danh mục rõ ràng.
  * Lưu lại lịch sử tìm kiếm gần đây để truy cập nhanh.

---

### 🔔 8. Trung Tâm Thông Báo Thời Gian Thực (Notification Center)
* Nhận thông báo tức thì khi:
  * Có người tương tác (Thích, Bình luận, Trả lời bình luận của bạn).
  * Có người nhắc tên bạn trong bài viết hoặc bình luận (`@username`).
  * Nhận được lời mời kết bạn hoặc lời mời tham gia Squad.
  * Thông báo hệ thống và sự kiện cộng đồng.
* Bộ lọc thông báo (Tất cả, Đề cập, Tương tác, Hệ thống) và tính năng Đánh dấu đã đọc tất cả.

---

### 📌 9. Bộ Sưu Tập Lưu Trữ (Bookmarks)
* Quản lý danh sách các bài viết, cẩm nang, mẹo chơi game đã lưu.
* Tìm kiếm và phân loại nhanh các bài viết đã bookmark.

---

### 🛡️ 10. Báo Cáo Vi Phạm & An Toàn Cộng Đồng (Report System)
* Báo cáo nội dung bài viết, bình luận hoặc người dùng có hành vi không phù hợp.
* Danh mục lý do vi phạm chi tiết: Spam/Quảng cáo, Ngôn từ thù ghét, Quấy rối/Bắt nạt, Nội dung nhạy cảm, Vi phạm bản quyền, Khác.
* Nhập mô tả chi tiết kèm kiểm tra độ dài tối thiểu để ban quản trị xử lý chính xác.

---

### ⚙️ 11. Cài Đặt Tài Khoản & Bảo Mật (Account Settings)
* **Tài khoản & Xác thực Email (Email Verification)**:
  * Trạng thái tài khoản (Đã xác thực / Chưa xác thực).
  * Gửi mã OTP xác thực email, đổi mật khẩu và đổi địa chỉ email an toàn.
  * Quản lý các phiên đăng nhập thiết bị (Active Sessions).
* **Tùy chỉnh Thông báo**: Bật/tắt thông báo cho từng loại hoạt động (Bình luận, Lượt thích, Tag, Squad).
* **Quyền riêng tư & Hiển thị**: Ẩn/hiện tủ game, góc máy gaming gear và nhận tin nhắn.

---

### 🌗 12. Giao Diện Người Dùng & Đa Ngôn Ngữ (UI/UX & Localization)
* **Hỗ trợ 2 ngôn ngữ hoàn chỉnh**: Chuyển đổi linh hoạt giữa **Tiếng Việt 🇻🇳** và **English 🇬🇧** với đầy đủ bản dịch trên toàn bộ giao diện và thông báo lỗi.
* **Chế độ Sáng / Tối (Dark & Light Theme)**: Tối ưu màu sắc chuẩn gaming, sắc sảo và dịu mắt.
* **Responsive 100%**: Hoạt động mượt mà trên mọi kích thước màn hình từ Desktop, Tablet đến Smartphone.
* **[DEV] Mock Auth Switcher**: Tích hợp công cụ chuyển đổi nhanh tài khoản giả lập ngay trên Header để thuận tiện kiểm thử toàn bộ tính năng.

---

## 🛠️ Công Nghệ & Thư Viện Sử Dụng

| Lớp kiến trúc | Công nghệ / Thư viện | Mô tả |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Phiên bản React mới nhất với hiệu năng tối ưu |
| **Ngôn ngữ** | [TypeScript 5](https://www.typescriptlang.org/) | Đảm bảo tính chặt chẽ về kiểu dữ liệu (Type-safe) |
| **Build Tool** | [Vite 8](https://vitejs.dev/) | Trình đóng gói hiện đại, tốc độ khởi động và HMR cực nhanh |
| **Routing** | [TanStack Router v1](https://tanstack.com/router) | Hệ thống định tuyến kiểu dữ liệu an toàn, file-based routing |
| **State Management** | [Zustand v5](https://zustand-demo.pmnd.rs/) | Quản lý state toàn cục nhẹ nhàng (Auth, Feed, Theme, i18n, Notification...) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Framework tiện ích CSS thế hệ mới tích hợp trực tiếp qua Vite |
| **Iconography** | [FontAwesome Icons v7](https://fontawesome.com/) | Hệ thống biểu tượng phong phú, chuẩn nét |
| **Utilities** | `emoji-picker-react`, `zxcvbn`, `date-fns` | Bộ chọn Emoji, đánh giá mật khẩu, định dạng thời gian |

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
src/
├── app/                  # Khởi tạo App & cấu hình Router
├── assets/               # Hình ảnh, logo, tài nguyên tĩnh
├── features/             # Các mô-đun tính năng độc lập
│   ├── auth/             # Xác thực, đăng nhập/đăng ký, quản lý phiên
│   ├── bookmark/         # Quản lý bài viết đã lưu
│   ├── community/        # Diễn đàn cộng đồng, tạo & quản lý group
│   ├── explore/          # Trang khám phá, tin tức & Spotlight Indie
│   ├── feed/             # Nguồn cấp bài viết, khung tạo bài viết
│   ├── game/             # Tủ game, chi tiết game, patch notes
│   ├── notification/     # Trung tâm thông báo
│   ├── post/             # Chi tiết bài viết, tương tác, bình luận
│   ├── profile/          # Trang cá nhân, Gaming Gear, bạn bè, lưu bút
│   ├── report/           # Hệ thống báo cáo vi phạm nội dung
│   ├── search/           # Tìm kiếm toàn cục
│   └── squad/            # Tìm tổ đội leo rank (LFG)
├── routes/               # Các trang và router file-based của TanStack Router
├── shared/               # Component dùng chung, Layout, Hooks, Locales (i18n)
│   ├── components/       # Header, Sidebar, BottomNav, Modal base...
│   ├── hooks/            # useTranslate, useTheme, useDebounce...
│   └── locales/          # File đa ngôn ngữ (vi.ts, en.ts)
└── types/                # Global TypeScript definitions
```

---

## 🚀 Hướng Dẫn Khởi Chạy

### 1. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 2. Chạy môi trường phát triển (Development)
```bash
npm run dev
```
Mở trình duyệt và truy cập vào: **`http://localhost:3000`**

### 3. Đóng gói cho Production
```bash
npm run build
npm run preview
```

---

*Phát triển với trọn vẹn đam mê dành cho cộng đồng Game Thủ Việt Nam & Quốc Tế 🎮.*

