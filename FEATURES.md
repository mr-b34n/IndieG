# 🎮 BẢNG TỔNG HỢP TOÀN BỘ TÍNH NĂNG DỰ ÁN INDIEG
> **IndieG** - Nền tảng Mạng xã hội, Diễn đàn Thảo luận & Trung tâm Khám phá Game Đỉnh cao.  
> Tài liệu này liệt kê chi tiết toàn bộ các tính năng của dự án theo phân cấp từ **Tổng quan hệ thống (Cấp cao)** đến **Từng module tính năng (Cấp trung)** và **Chi tiết nghiệp vụ / Tương tác vi mô (Cấp nhỏ)**.

---

## 🗺️ CÂY TỔNG QUAN TÍNH NĂNG (FEATURE MAP)

```text
IndieG Platform
├── 1. KIẾN TRÚC NỀN TẢNG & TRẢI NGHIỆM HỆ THỐNG (SYSTEM & CORE PLATFORM)
├── 2. XÁC THỰC, BẢO MẬT & PHÂN QUYỀN (AUTHENTICATION & IDENTITY)
├── 3. BẢNG TIN & NGUỒN CẤP DỮ LIỆU (FEED & SOCIAL STREAM)
├── 4. BÀI VIẾT & TRÌNH SOẠN THẢO ĐA PHƯƠNG TIỆN (POST & MEDIA EDITOR)
├── 5. BÌNH LUẬN ĐA CẤP & THẢO LUẬN LỒNG NHAU (THREADED COMMENTS)
├── 6. DIỄN ĐÀN CỘNG ĐỒNG TOÀN DIỆN (COMMUNITIES & COMMUNITY HUB)
│   ├── Khám phá & Tạo cộng đồng
│   ├── Không gian thảo luận đa chuyên mục
│   ├── Thư viện Media & Sự kiện / Giải đấu
│   ├── Trò chuyện trực tiếp (Live Chat Drawer)
│   └── Trung tâm kiểm duyệt & Quản trị cộng đồng (Admin/Mod Tools)
├── 7. GHÉP ĐỘI & TÌM BẠN CHƠI GAME (SQUAD & LFG - LOOKING FOR GROUP)
├── 8. TRUNG TÂM KHÁM PHÁ & TỦ GAME (GAME HUB & LIBRARY)
├── 9. TẠP CHÍ KHÁM PHÁ & VIETNAMESE INDIE SPOTLIGHT (EXPLORE & MAGAZINE)
├── 10. HỒ SƠ GAME THỦ & GÓC MÁY GAMING GEAR (GAMER PROFILE & BATTLESTATION)
│   ├── Nhận diện cá nhân & Hệ thống Danh hiệu / Huy hiệu (Badges)
│   ├── Bộ công cụ Soạn thảo Tiểu sử Độc quyền (Rich Bio Editor)
│   ├── Trưng bày cấu hình PC & Vũ khí Gaming Gear (10 danh mục)
│   ├── Tủ game, Thống kê Esports & Thành tựu
│   ├── Hệ thống Bạn bè (Friends System)
│   └── Sổ lưu bút trang cá nhân (Guestbook)
├── 11. TÌM KIẾM TOÀN CỤC & LỊCH SỬ TÌM KIẾM (GLOBAL SEARCH)
├── 12. TRUNG TÂM THÔNG BÁO THỜI GIAN THỰC (NOTIFICATION CENTER)
├── 13. QUẢN LÝ DẤU TRANG & LƯU TRỮ (BOOKMARKS)
├── 14. BÁO CÁO VI PHẠM & AN TOÀN NỀN TẢNG (REPORT SYSTEM)
├── 15. TRUNG TÂM CÀI ĐẶT TOÀN DIỆN (SETTINGS & PREFERENCES)
└── 16. CÔNG CỤ DÀNH CHO NHÀ PHÁT TRIỂN & TEST DỮ LIỆU (DEVELOPER & QA TOOLS)
```

---

## 🏗️ 1. KIẾN TRÚC NỀN TẢNG & TRẢI NGHIỆM HỆ THỐNG (SYSTEM & CORE PLATFORM)

### 1.1. Công nghệ Lõi
* **Framework & Routing**: React 19 kết hợp cùng TanStack Router (File-based type-safe routing) đảm bảo chuyển trang mượt mà không reload.
* **Quản lý Trạng thái (State Management)**: Zustand v5 phân tách theo từng feature slice, đồng bộ LocalStorage/SessionStorage.
* **Xử lý Bất đồng bộ & Data Fetching**: Tích hợp TanStack Query (React Query) với cơ chế cache, stale-while-revalidate và mutation tự động invalidate queries.
* **Design System**: Tailwind CSS v4 tối ưu dung lượng CSS, hỗ trợ CSS Variables cho chủ đề màu sắc gaming.

### 1.2. Trải nghiệm Giao diện & Đa ngôn ngữ (UI/UX & Localization)
* **Chế độ Giao diện Kép (Theme System)**:
  * Chế độ Tối (Dark Theme): Phong cách Cyberpunk / Dark Gaming sâu lắng, giảm mỏi mắt.
  * Chế độ Sáng (Light Theme): Tương phản cao, hiện đại và rõ nét.
  * Lưu trữ cấu hình theme tự động trong trình duyệt của người dùng.
* **Hỗ trợ Đa ngôn ngữ Hoàn chỉnh (i18n)**:
  * Hỗ trợ 2 ngôn ngữ: **Tiếng Việt 🇻🇳** và **English 🇬🇧**.
  * Chuyển đổi ngôn ngữ tức thì chỉ với 1 cú nhấp (giữ nguyên vị trí cuộn trang).
  * Việt hóa / Anh hóa 100% các nhãn giao diện, thông báo lỗi validation, tooltip và badge.
* **Thiết kế Thích ứng Toàn diện (Responsive 100%)**:
  * Desktop: Bố cục 3 cột kinh điển (Left Navigation - Main Feed/Content - Right Utility Rail).
  * Tablet: Thu gọn thanh bên thành dạng icon menu tối giản.
  * Mobile: Ẩn thanh bên, bổ sung Bottom Navigation Bar tiện lợi ngón tay cái.
* **Bộ xem ảnh Toàn màn hình (Lightbox & Media Viewer)**:
  * Nhấp xem phóng to bất kỳ hình ảnh nào trong bài viết, bình luận, góc máy gaming.
  * Hỗ trợ chuyển ảnh trước/sau (`←`/`→`) và phím tắt `Esc` để đóng.

### 1.3. Hệ thống Phím tắt Toàn diện (Keyboard Shortcuts & Power User Navigation)
* **Bảng tra cứu phím tắt toàn năng (Shortcuts Cheatsheet Modal)**:
  * Kích hoạt nhanh bằng phím `\` (Backslash).
  * Hiển thị bảng phím tắt phân chia rõ ràng theo 5 nhóm chức năng, hỗ trợ tìm kiếm/lọc phím tắt theo thời gian thực.
  * Tự động nhận diện hệ điều hành người dùng (hiển thị biểu tượng `⌘` trên macOS, `Ctrl` trên Windows/Linux).
  * Kích hoạt hoàn toàn độc quyền qua phím tắt (không nút icon thừa trên Header/Menu), chuẩn hóa trải nghiệm chuyên nghiệp cho game thủ.
* **Phím tắt Toàn cục (Global Shortcuts)**:
  * `/`: Mở thanh tìm kiếm toàn cục & Quick Search.
  * `Ctrl/Cmd + K`: Mở cửa sổ soạn thảo bài viết mới (Create Post Modal).
  * `Ctrl/Cmd + Enter`: Gửi bài viết / lưu bình luận / gửi trả lời / gửi tin nhắn chat trong Community Chat Drawer.
  * `Esc`: Quản lý đóng lớp giao diện thông minh theo thứ tự ưu tiên (Layered Overlay Stack: Cheatsheet $\rightarrow$ Lightbox $\rightarrow$ Report Modal $\rightarrow$ Create/Edit Modal $\rightarrow$ Drawer $\rightarrow$ Sidebars $\rightarrow$ Dropdowns $\rightarrow$ Quay lại trang trước).
  * `T`: Chuyển đổi nhanh Dark Mode / Light Mode (tự động bỏ qua khi đang gõ văn bản).
  * `L`: Đổi nhanh ngôn ngữ hiển thị Việt $\leftrightarrow$ Anh (tự động bỏ qua khi đang gõ văn bản).
* **Điều hướng nhanh kiểu chuỗi phím "G + Phím" (Go-To Two-Step Buffer)**:
  * Bộ đệm nhận diện thông minh (~600ms) kèm thanh thông báo nổi (GoToIndicator pill) trực quan.
  * `G → F`: Đi tới Feed (Trang chủ Bảng tin).
  * `G → C`: Đi tới Diễn đàn Cộng đồng (`/community`).
  * `G → S`: Đi tới Trung tâm Ghép đội / Squad LFG (`/squad`).
  * `G → G`: Đi tới Trung tâm Khám phá & Tủ Game (`/game`).
  * `G → E`: Đi tới Tạp chí Khám phá (`/explore`).
  * `G → P`: Đi tới Hồ sơ cá nhân người dùng hiện tại (`/profile/$id`).
  * `G → B`: Đi tới Quản lý Dấu trang (`/bookmark`).
  * `G → N`: Mở / đóng dropdown Trung tâm Thông báo.
  * `G → A`: Đi tới Cài đặt tài khoản (`/settings?tab=account`).
* **Phím tắt trong Bảng tin / Bài viết (Feed Navigation & Post Actions)**:
  * `J` / `K`: Cuộn xuống / cuộn lên giữa các bài viết kế tiếp với viền chỉ báo bài đang focus (Focus Ring).
  * `A` / `Z` hoặc `↑` / `↓`: Upvote / Downvote bài viết đang được focus.
  * `B`: Đánh dấu lưu / bỏ lưu (Bookmark) bài viết đang focus.
  * `P`: Ghim / Bỏ ghim bài viết (chỉ áp dụng nếu người dùng là tác giả bài viết hoặc Quản trị viên).
* **Phím tắt Trình xem ảnh (Lightbox & Media Viewer)**:
  * `←` / `→`: Chuyển qua lại giữa các hình ảnh trước / sau trong bộ sưu tập.
  * `Esc`: Đóng trình xem ảnh.
* **Thông báo & Chuyển Tab nhanh theo số thứ tự**:
  * `Shift + M`: Đánh dấu đã đọc tất cả thông báo trong nháy mắt.
  * `1` – `8`: Chuyển đổi tab nhanh chóng trong Cài đặt (1-8), Kết quả tìm kiếm (1-5), và Hồ sơ cá nhân (1-7).
* **Cơ chế Chống xung đột Bộ gõ (IME & Input Guard)**:
  * Hoàn toàn miễn nhiễm với xung đột gõ tiếng Việt Telex/VNI nhờ cơ chế chặn `event.isComposing` và `keyCode === 229`.
  * Tự động bỏ qua các phím tắt chữ đơn khi con trỏ đang nằm trong `input`, `textarea` hoặc thành phần `contenteditable`.

---

## 🔐 2. XÁC THỰC, BẢO MẬT & PHÂN QUYỀN (AUTHENTICATION & IDENTITY)

### 2.1. Đăng Nhập & Đăng Ký (Sign In & Sign Up)
* **Đăng nhập tiêu chuẩn**:
  * Đăng nhập bằng Email và Mật khẩu.
  * Kiểm tra tính hợp lệ của trường thông tin (Email định dạng chuẩn, mật khẩu không được rỗng).
  * Nút ẩn/hiện mật khẩu trực quan.
* **Đăng ký tài khoản mới**:
  * Khai báo: Họ tên đầy đủ, Tên người dùng (Username độc nhất), Email, Mật khẩu và Xác nhận mật khẩu.
  * Kiểm tra độ mạnh mật khẩu theo thời gian thực (**Password Strength Meter** bằng thư viện `zxcvbn`):
    * Đánh giá 4 mức độ: Yếu (Weak) $\rightarrow$ Trung bình (Fair) $\rightarrow$ Khá (Good) $\rightarrow$ Mạnh (Strong).
    * Phân tích trực quan tiêu chí: tối thiểu 8 ký tự, chữ hoa, chữ thường, chữ số và ký tự đặc biệt.
* **Đăng nhập Mạng xã hội (Social Login Integration)**:
  * Các nút tích hợp sẵn sàng liên kết tài khoản: Google, Discord, Steam.

### 2.2. Khôi Phục Mật Khẩu (Forgot & Reset Password)
* Luồng 3 bước bảo mật:
  1. Nhập email tài khoản yêu cầu khôi phục.
  2. Hệ thống gửi mã OTP xác nhận về hòm thư người dùng.
  3. Nhập OTP và thiết lập mật khẩu mới kèm xác nhận lại.

### 2.3. Xác Thực Email & Cổng Bảo Vệ (Email Verification & Guard System)
* **Trang xác minh email độc lập (`/verify-email?token=...`)**:
  * Tự động đọc mã token từ đường dẫn URL.
  * Hiển thị trạng thái đang xác minh (Spinner), kết quả thành công hoặc báo lỗi token hết hạn.
* **Băng thông báo tài khoản chưa xác thực (Unverified Banner)**:
  * Xuất hiện nổi bật trên đầu giao diện khi đăng nhập bằng tài khoản chưa xác minh email.
  * Nút "Xác thực ngay": Mở modal nhập mã OTP xác thực email trực tiếp mà không cần rời trang hiện tại.
* **Cổng bảo vệ thao tác (Action Guards)**:
  * Người dùng chưa xác thực email sẽ bị chặn kèm thông báo khi cố gắng thực hiện các thao tác cộng đồng (Đăng bài viết, gửi bình luận, chat trong group, tạo squad).

### 2.4. Quản Lý Phiên Đăng Nhập & Thiết Bị (Active Sessions)
* Liệt kê chi tiết các thiết bị đang đăng nhập tài khoản:
  * Biểu tượng phân biệt máy tính bàn / laptop và điện thoại thông minh.
  * Thông tin trình duyệt (Chrome, Safari, Firefox), hệ điều hành (Windows, macOS, Linux, iOS, Android).
  * Địa chỉ IP và vị trí tương đối.
  * Nhãn nhận diện **"Phiên hiện tại (Current Session)"**.
* Tính năng đăng xuất / thu hồi phiên từ xa (Revoke Session).

---

## 📰 3. BẢNG TIN & NGUỒN CẤP DỮ LIỆU (FEED & SOCIAL STREAM)

### 3.1. Các Thẻ Nguồn Cấp Thông Minh (Smart Feed Tabs)
* **Xu hướng (Trending)**: Tổng hợp các bài viết có lượng tương tác (Upvotes, Bình luận, Chia sẻ) cao nhất trong 24h qua.
* **Mới nhất (Latest)**: Hiển thị dòng thời gian bài viết theo thứ tự mới đăng gần nhất.
* **Thảo luận (Discussions)**: Lọc các chủ đề bàn luận chiến thuật, hỏi đáp kinh nghiệm chơi game.
* **Hướng dẫn (Guides)**: Bộ sưu tập các bài viết phân tích, cẩm nang, mẹo vượt màn và bí kíp leo rank.
* **Tin tức (News)**: Các bài viết cập nhật sự kiện, thông báo bản cập nhật giải đấu và ngành game.

### 3.2. Tiện Ích & Điều Hướng Nhanh Trên Bảng Tin
* **Thanh chuyển nhanh cộng đồng (Community Switcher Rail)**:
  * Thanh ray tiện ích nằm ngay trên đầu bảng tin hiển thị các cộng đồng người dùng đã tham gia.
  * Chuyển đổi nhanh dòng bài viết của từng cộng đồng mà không cần rời khỏi trang chủ.
* **Modal Khám phá Cộng đồng (Community Drawer Modal)**: Mở rộng danh sách tất cả cộng đồng để tham gia nhanh.
* **Banner Quảng bá Tựa Game Nổi bật (Game Promo Banner)**:
  * Hiển thị thông tin tựa game tâm điểm tuần/tháng.
  * Nút dẫn nhanh sang Game Hub và tham gia cộng đồng chính thức của tựa game đó.
* **Bộ sắp xếp nguồn cấp (Feed Sort Dropdown)**:
  * Sắp xếp theo: *Mới nhất (Newest)*, *Phổ biến nhất (Most Popular)*, *Nhiều bình luận nhất (Most Discussed)*.

---

## ✍️ 4. BÀI VIẾT & TRÌNH SOẠN THẢO ĐA PHƯƠNG TIỆN (POST & MEDIA EDITOR)

### 4.1. Hộp Tạo Bài Viết Mới (Create Post Box / Modal)
* **Tiêu đề bài viết**: Bắt buộc nhập tiêu đề với ràng buộc tối thiểu 6 ký tự và tối đa 200 ký tự.
* **Khung soạn thảo nội dung phong phú (Rich Text & Markdown)**:
  * Hỗ trợ định dạng in đậm, in nghiêng, danh sách gạch đầu dòng, khối trích dẫn và khối code.
  * Tính năng nhắc tên người dùng (`@username mention`) tự động nhận diện.
* **Gắn thẻ & Danh mục**:
  * Chọn cộng đồng đăng tải (Community Selector Dropdown).
  * Chọn thẻ tựa game liên kết (`gameTag` - ví dụ: CS2, Elden Ring, Raft, Black Myth: Wukong).
  * Chọn thể loại bài viết: *Discussion*, *Guide*, *Question*, *Showcase/Media*, *Event*, *Poll*.
* **Đính kèm Đa phương tiện (Attachment Picker)**:
  * Tải lên hình ảnh (hỗ trợ nhiều ảnh cùng lúc, xem trước và xóa ảnh).
  * Đính kèm video hoặc liên kết clip gameplay.
  * Tải tệp tin tài liệu / mod file đính kèm.
  * Tích hợp tìm kiếm ảnh động (GIF Picker).
  * Bộ chọn biểu tượng cảm xúc trực quan (**Emoji Picker**).
* **Thiết lập Bài viết**:
  * Bật/tắt cho phép bình luận (`allowComments`).
  * Lưu bản nháp tự động (Drafts Store): Không sợ mất nội dung khi lỡ tắt trình duyệt.

### 4.2. Trang Chi Tiết Bài Viết (`/post/$postId`) & Tương Tác
* **Trang hiển thị bài viết chuyên sâu**:
  * Layout tập trung, tối ưu đọc bài viết dài.
  * Nút "Quay lại" thông minh (lưu lịch sử duyệt) và hỗ trợ phím tắt `Esc` để thoát nhanh.
* **Tương tác cốt lõi**:
  * **Hệ thống Đánh giá Điểm (Upvote / Downvote)**: Cho phép bình chọn tích cực hoặc tiêu cực với thuật toán tính điểm thực.
  * **Thả Tim / Like**: Bộ đếm cảm xúc trực quan.
  * **Chia sẻ (Share)**: Tự động copy đường dẫn bài viết vào Clipboard kèm thông báo Toast.
  * **Lưu bài viết (Bookmark)**: Thêm bài viết vào danh mục Dấu trang cá nhân chỉ với 1 click.
  * **Ghim bài viết (Pin Post)**: Tác giả hoặc Quản trị viên có thể ghim bài viết quan trọng lên đầu cộng đồng.
  * **Chỉnh sửa bài viết (Edit Post Modal)**: Cập nhật lại tiêu đề, nội dung, hình ảnh, thẻ tag.
  * **Xóa bài viết**: Hộp thoại cảnh báo xác nhận trước khi xóa vĩnh viễn.
  * **Báo cáo bài viết**: Mở form báo cáo vi phạm nội dung lên Ban quản trị.

---

## 💬 5. BÌNH LUẬN ĐA CẤP & THẢO LUẬN LỒNG NHAU (THREADED COMMENTS)

### 5.1. Cấu Trúc Bình Luận Phân Cấp (Multi-level Nested Replies)
* Phản hồi trực tiếp vào bài viết chính (Cấp 1 - Root Comment).
* Trả lời lồng nhau vào bất kỳ bình luận nào khác (Cấp 2, Cấp 3... - Nested Threaded Replies) giúp cuộc trò chuyện không bị loãng.
* Thu gọn / Mở rộng cây phản hồi để dễ theo dõi các cuộc tranh luận dài.

### 5.2. Soạn Thảo & Đính Kèm Trong Bình Luận
* **Kiểm tra độ dài & Ràng buộc hợp lệ (Validation Guards)**:
  * Ràng buộc tối thiểu 6 ký tự (hoặc có đính kèm ảnh minh họa).
  * Giới hạn tối đa 1.000 ký tự với thanh đếm số lượng ký tự trực tiếp.
  * Cảnh báo lỗi đa ngôn ngữ thân thiện khi chưa đủ độ dài.
* **Đính kèm hình ảnh**:
  * Tải lên ảnh minh họa trong bình luận.
  * Xem trước ảnh, hỗ trợ công cụ cắt ảnh hoặc gỡ bỏ ảnh trước khi gửi.
* **Chèn Emoji**: Bộ chọn biểu tượng cảm xúc trực quan ngay tại ô nhập liệu.

### 5.3. Tính Năng Nâng Cao Dành Cho Bình Luận
* **Ghim bình luận (Pin Comment)**: Chủ bài viết có quyền ghim bình luận hữu ích/đúng trọng tâm nhất lên vị trí đầu tiên.
* **Sắp xếp bình luận**:
  * *Bình luận hàng đầu (Top Comments)*: Ưu tiên bình luận có nhiều lượt tán thành nhất.
  * *Mới nhất (Newest First)*: Cập nhật các phản hồi vừa gửi.
* **Tương tác trên từng bình luận**: Upvote/Like, Phản hồi, Chỉnh sửa nội dung, Xóa bình luận, Báo cáo vi phạm.

---

## 🌐 6. DIỄN ĐÀN CỘNG ĐỒNG TOÀN DIỆN (COMMUNITIES & COMMUNITY HUB)

### 6.1. Trang Khám Phá & Danh Sách Cộng Đồng (`/community`)
* **Phân loại theo Thể loại Game (Categories)**: FPS, MOBA, RPG, Souls-like, Indie Games, Esports, Sinh tồn, Mobile, Console...
* **Tìm kiếm cộng đồng**: Lọc theo từ khóa tên hoặc mô tả cộng đồng.
* **Thẻ cộng đồng thông minh (Community Card)**:
  * Hiển thị ảnh bìa, avatar, tên nhóm, thể loại và số lượng thành viên hoạt động.
  * Tích hợp thẻ chip liên kết tựa game (`CommunityGameTile`): Nhấp vào chip game sẽ chuyển hướng ngay đến Game Hub của trò chơi đó.
  * Nút "Tham gia / Rời cộng đồng" (Join / Leave) trực tiếp từ danh sách.

### 6.2. Tạo Cộng Đồng Mới (Create Community Modal)
* Thiết lập tên cộng đồng (tối thiểu 3 ký tự).
* Tự động tạo định danh URL (Slug generator).
* Mô tả mục tiêu & định hướng cộng đồng (tối thiểu 6 ký tự).
* Chọn danh mục chính (Category) và chế độ riêng tư (Công khai / Riêng tư).
* Tải lên Avatar và Ảnh bìa đại diện nhóm.

### 6.3. Trang Chi Tiết Trung Tâm Cộng Đồng (`/community/$communityId`)
* **Thanh Header & Nhận diện Đẳng cấp**:
  * Banner nghệ thuật điện ảnh, huy hiệu xác minh chính thức.
  * Nút trạng thái "Tham gia / Đã tham gia".
  * **Nút CTA nổi bật "Trang Game IndieG"** (icon Gamepad): Điều hướng thẳng sang trang Game Detail của trò chơi tương ứng.
* **Thanh Điều Hướng Breadcrumb Thông Minh**:
  * Hiển thị cấp bậc điều hướng: `Trang chủ > Cộng đồng > {Tên cộng đồng}`.
  * Tích hợp huy hiệu nhận diện game liên kết: `• [🎮 GAME: {Tên Game}]` (Click để chuyển nhanh sang Game Page).
* **Thanh Tiện Ích Bên Phải (Right Rail)**:
  * **Widget "INDIEG GAME HUB"**: Thẻ game nổi bật bên cột phải hiển thị ảnh bìa, điểm rating (VD: 4.9/5), nhà phát triển, số người đang chơi và nút "XEM TRANG GAME TRÊN INDIEG →".
  * **Top Contributors**: Bảng vinh danh những thành viên đóng góp nhiều bài viết và nhận nhiều upvote nhất tuần/tháng.
  * **Upcoming Events Timeline**: Dòng thời gian thông báo các giải đấu, buổi offline sắp diễn ra.
  * **Community Links**: Danh mục các liên kết chính thức của cộng đồng (Discord, Server Game, Website, Steam Group).
* **Các Tab Nội Dung Chuyên Biệt**:
  * **Tab Nguồn Cấp (Feed)**: Dòng bài viết riêng biệt của cộng đồng với các bộ lọc con: *Tất cả*, *Thảo luận (Discussion)*, *Hướng dẫn (Guide)*, *Hỏi đáp (Question)*, *Ảnh/Video (Media)*, *Bình chọn (Poll)*, *Sự kiện (Event)* kèm thanh tìm kiếm bài viết nội bộ.
  * **Tab Thành Viên (Members)**: Phân loại theo ban quản trị (Admins, Mods), thành viên tích cực, ngày tham gia và cấp bậc.
  * **Tab Media (Thư viện Ảnh & Clip)**: Hiển thị bộ sưu tập ảnh screenshot gameplay chất lượng cao (Media Gallery Grid) trích xuất từ tất cả các bài viết trong cộng đồng. Hover để xem tác giả, lượt like và bình luận.
  * **Tab Sự Kiện (Events)**: Danh sách các giải đấu cộng đồng, minigame kèm thông tin ngày giờ, tổng giá trị giải thưởng và số lượng đội đăng ký.
  * **Tab Giới Thiệu (About)**: Mô tả chi tiết sứ mệnh cộng đồng, danh sách Nội quy chính thức (Rules), và Card liên kết game IndieG chính thức (Official Game Page Card).
* **Cửa Sổ Trò Chuyện Trực Tiếp (Community Chat Drawer)**:
  * Khung Live Chat nằm ở góc phải màn hình.
  * Thành viên đang trực tuyến có thể gửi tin nhắn trao đổi nhanh mà không cần tạo bài viết.
  * Tích hợp kiểm tra tài khoản đã xác thực email trước khi chat.

### 6.4. Bảng Điều Khiển Quản Trị Cộng Đồng (Admin & Mod Management Hub)
*Dành riêng cho Trưởng nhóm (Admin) và Kiểm duyệt viên (Moderator):*
* **Tổng quan (Manage Overview)**: Biểu đồ thống kê số lượng thành viên gia nhập mới, lưu lượng bài viết và mức độ tương tác theo tuần/tháng.
* **Hàng đợi Kiểm duyệt (Moderation Queue)**: Xem xét phê duyệt các bài viết hoặc bình luận bị người dùng gắn cờ hoặc kích hoạt bộ lọc tự động.
* **Báo cáo Nội bộ (Community Reports)**: Danh sách các tố cáo vi phạm do thành viên gửi; Quản trị viên có thể chọn Xóa nội dung vi phạm, Cảnh cáo người dùng hoặc Bác bỏ báo cáo.
* **Quản lý Thành viên (Manage Members)**:
  * Tìm kiếm thành viên theo username.
  * Thăng cấp/Hạ cấp vai trò: Member $\leftrightarrow$ Moderator $\leftrightarrow$ Co-Admin.
  * Kích khỏi cộng đồng (Kick) hoặc Cấm vĩnh viễn (Ban Member).
* **Soạn thảo Nội quy (Manage Rules)**: Tạo, chỉnh sửa hoặc xóa các điều khoản nội quy hiển thị tại tab About.
* **Cài đặt Cộng đồng (Manage Settings)**: Đổi tên, avatar, ảnh bìa, mô tả, từ khóa thẻ tag và tùy chỉnh chế độ phê duyệt bài viết trước khi đăng.

---

## ⚔️ 7. GHÉP ĐỘI & TÌM BẠN CHƠI GAME (SQUAD & LFG - LOOKING FOR GROUP)

### 7.1. Sảnh Tìm Kiếm Tổ Đội Thông Minh (`/squad`)
* **Bộ lọc Đa tiêu chí**:
  * Lọc theo Tựa Game yêu thích: CS2, Valorant, Liên Minh Huyền Thoại, PUBG, GTA V, Apex Legends, Dota 2, Rainbow Six Siege...
  * Lọc theo Bậc Rank yêu cầu: Đồng, Bạc, Vàng, Bạch Kim, Kim Cương, Cao Thủ / Thách Đấu / Premier Rating.
  * Lọc theo Vai trò tuyển dụng (Role): Sniper, Duelist, Support, Tanker, IGL (In-game Leader), Entry Fragger, Flex.
  * Lọc theo Kênh Voice Chat: *Discord Required*, *In-game Voice*, *Optional*, *No Mic*.
  * Lọc theo Trạng thái: *Đang tuyển (Recruiting)*, *Đã đủ người (Full)*, *Đang thi đấu (In-game)*.
  * Tìm kiếm theo từ khóa phòng chơi.
* **Tab Điều hướng**: Chuyển đổi giữa "Khám phá phòng (Explore Squads)" và "Phòng của tôi (My Squads)".

### 7.2. Thẻ Hiển Thị Phòng Chơi (Squad Card)
* Hiển thị tên phòng, logo game, mô tả mục tiêu (leo rank tryhard hay tấu hài giải trí).
* Thẻ tags phân loại chế độ chơi.
* Bộ đếm sĩ số thời gian thực (Ví dụ: `3/5 thành viên`).
* Danh sách avatar các thành viên trong phòng kèm biểu tượng Vương miện dành cho Trưởng phòng (Leader).
* Trạng thái hoạt động của từng thành viên: Online, Đang trong trận (In-game), Offline.
* Hiển thị Mã phòng (Room Code) để copy nhanh vào game.
* Nút kết nối nhanh kênh đàm thoại Discord Voice trực tiếp.

### 7.3. Tạo & Quản Lý Phòng Squad
* **Tạo phòng Squad mới (Create Squad Modal)**:
  * Đặt tên phòng, chọn tựa game, viết mô tả ngắn.
  * Chọn số lượng thành viên cần tuyển (từ 2 đến 10 người).
  * Quy định yêu cầu Voice Chat.
  * Nhập mã phòng hoặc link kênh Discord Voice.
* **Quyền hạn của Trưởng phòng**:
  * Kích thành viên không phù hợp khỏi phòng (Kick member).
  * Bật/Tắt trạng thái phòng (Đang tuyển $\leftrightarrow$ Tạm khóa phòng).
  * Giải tán / Xóa phòng Squad khi kết thúc buổi chơi.

---

## 🕹️ 8. TRUNG TÂM KHÁM PHÁ & TỦ GAME (GAME HUB & LIBRARY)

### 8.1. Trang Chi Tiết Tựa Game Chuyên Sâu (`/game/$gameSlug`)
* **Hồ Sơ Toàn Diện Tựa Game**:
  * Tên game, Studio phát triển (Developer), Nhà phát hành (Publisher), Ngày phát hành chính thức.
  * Nền tảng hỗ trợ: PC (Windows/Mac/Linux), PlayStation, Xbox, Nintendo Switch.
  * Danh mục thể loại (Action, RPG, FPS, Souls-like, Indie...).
  * Điểm số đánh giá trung bình từ game thủ (Rating Score) và Tổng số lượt đánh giá.
  * Đánh giá chung (Sentiment: Cực kỳ tích cực, Rất tích cực, Tích cực, Trái chiều).
  * Thống kê lượng người chơi đang trực tuyến trong thời gian thực (Active Players).
* **Nút Lối Tắt & Liên Kết Hai Chiều (Bidirectional Linking)**:
  * Nút mở trực tiếp trang cửa hàng Steam (`steamUrl`).
  * **Nút CTA "Tham gia Cộng đồng" (Join Community)**: Tự động nhận diện và chuyển hướng ngược về đúng trang Community Hub tương ứng trên IndieG (Ví dụ: từ `/game/cyberpunk-2077` $\rightarrow$ `/community/cyberpunk-2077-vn`).

### 8.2. Yêu Cầu Cấu Hình Hệ Thống (System Requirements)
* Phân chia rõ ràng 2 bảng thông số kỹ thuật:
  * **Cấu hình Tối thiểu (Minimum Specs)**: Hệ điều hành (OS), Vi xử lý (CPU), Card đồ họa (GPU), Dung lượng RAM, Dung lượng ổ cứng (Storage).
  * **Cấu hình Đề nghị (Recommended Specs)**: Hệ điều hành (OS), Vi xử lý (CPU), Card đồ họa (GPU), Dung lượng RAM, Dung lượng ổ cứng (Storage).

### 8.3. Nhật Ký Cập Nhật & Bản Vá (Patch Notes & Updates)
* Theo dõi lịch sử phát triển của game qua các phiên bản.
* Phân loại huy hiệu bản cập nhật: *Major Update (Bản mở rộng lớn)*, *Patch (Bản vá)*, *Hotfix (Sửa lỗi khẩn cấp)*, *Event (Sự kiện)*.
* Tóm tắt các thay đổi về cân bằng chỉ số, vũ khí, bản đồ, sửa lỗi kèm liên kết bài thảo luận chi tiết nếu có.

### 8.4. Cẩm Nang Hướng Dẫn & Đánh Giá Từ Game Thủ (Guides & Reviews)
* **Cẩm nang Game Guides**: Phân loại theo *Chiến thuật (Tactics)*, *Xây dựng nhân vật (Builds)*, *Bí mật & Trứng phục sinh (Secrets)*, *Kinh nghiệm chung*.
* **Đánh giá Người chơi (Player Reviews)**:
  * Chấm điểm sao (1 đến 5 sao).
  * Hiển thị số giờ chơi thực tế của người đánh giá.
  * Nhãn xác nhận Khuyên chơi (Recommended) hoặc Không khuyên chơi.
  * Nút Like bài đánh giá hữu ích.

---

## 🌟 9. TẠP CHÍ KHÁM PHÁ & VIETNAMESE INDIE SPOTLIGHT (EXPLORE & MAGAZINE)

### 9.1. Tạp Chí Game Điện Ảnh (Hero Magazine)
* Banner Slider khổ lớn phong cách tạp chí game quốc tế.
* Giới thiệu các siêu phẩm game đình đám kèm tóm tắt nội dung, điểm số đánh giá và lối tắt truy cập nhanh.

### 9.2. Tiêu Điểm Game Indie Việt Nam (Vietnamese Indie Spotlight)
* Khu vực độc quyền nhằm tôn vinh và hỗ trợ các nhà phát triển game độc lập tại Việt Nam.
* Giới thiệu các dự án nổi bật: Thần Trùng (The Death), Hoa, Cỏ Máu (Blood Field), Brother Rabbit...
* Thông tin studio, thể loại, tình trạng phát hành và nút ủng hộ nhà làm game nước nhà.

### 9.3. Tin Tức Biên Tập & Sự Kiện (Editorial News & Events)
* **Editorial News Section**: Cập nhật các bản tin nóng hổi, thông tin giải đấu thể thao điện tử, phỏng vấn nhà phát triển và góc nhìn chuyên sâu.
* **Ongoing Events Section**: Lịch trình các giải đấu eSports và lễ hội game đang diễn ra.

### 9.4. Bộ Sưu Tập Khoảnh Khắc Game Thủ (Viral Masonry Gallery)
* Bố cục lưới so le (Masonry Grid phong cách Pinterest) trưng bày các hình ảnh chụp trong game (In-game Screenshots) sắc nét và góc máy gaming đẹp mắt nhất do cộng đồng chia sẻ.

### 9.5. Thẻ Xu Hướng Thịnh Hành (Trending Tags)
* Danh sách các từ khóa hashtag đang được game thủ thảo luận nhiều nhất trên hệ thống.

---

## 👤 10. HỒ SƠ GAME THỦ & GÓC MÁY GAMING GEAR (GAMER PROFILE & BATTLESTATION)

### 10.1. Nhận Diện Cá Nhân & Bộ Khung Avatar (Identity & Badges)
* **Ảnh đại diện & Ảnh bìa**:
  * Hỗ trợ tải lên ảnh cá nhân và công cụ cắt ảnh tỷ lệ vuông chuyên nghiệp (**ImageCropperModal**).
  * Ảnh bìa phong cách Cyberpunk / Gaming tùy biến.
* **Cấp độ Game thủ (Gamer Level & XP)**:
  * Hiển thị Level người chơi kèm thanh tiến trình kinh nghiệm (XP Bar).
* **Trạng thái Hoạt động Thời gian thực (Live Presence Status)**:
  * Chuyển đổi giữa: *Trực tuyến (Online)*, *Đang chơi game (In-game kèm tên tựa game đang chơi)*, *Ngoại tuyến (Offline)*.
* **Bộ Sưu Tập Huy Hiệu Danh Dự (Badge Selector Modal)**:
  * Danh mục huy hiệu phong phú:
    * 🏆 `CLUTCH GOD` (FPS King)
    * 🛡️ `TACTICAL LEADER` (Đội trưởng chiến thuật)
    * 🔥 `VETERAN OUTLAW` (Chiến binh thế giới mở)
    * ★ `FOUNDER` (Thành viên sáng lập)
    * 🛠 `MASTER ARCHITECT` (Bậc thầy sinh tồn)
    * 🦉 `NIGHT OWL` (Cú đêm cộng đồng)
  * Huy hiệu đi kèm màu viền hào quang phát sáng xung quanh avatar.
* **Liên kết Mạng xã hội & Nền tảng Game**:
  * Kết nối tài khoản: Discord, Steam, Riot Games, Epic Games, Twitch, YouTube.

### 10.2. Bộ Công Cụ Soạn Thảo Tiểu Sử Độc Quyền (Rich Bio Editor & Renderer)
* Hệ thống soạn thảo Bio chuyên biệt cho phép người dùng tùy biến giới thiệu phong cách thi đấu, câu danh ngôn yêu thích, vai trò chính trong game và danh hiệu cá nhân.

### 10.3. Trưng Bày Vũ Khí Gaming & Góc Máy (Battlestation & Gaming Gear Showcase)
* Cho phép game thủ khai báo và phô diễn cấu hình phần cứng thực tế qua **10 danh mục trang thiết bị**:
  1. **CPU (Bộ vi xử lý)**
  2. **GPU (Card đồ họa)**
  3. **Monitor (Màn hình gaming)**
  4. **Mouse (Chuột thi đấu)**
  5. **Keyboard (Bàn phím cơ & switch)**
  6. **Headphones (Tai nghe gaming)**
  7. **Microphone (Mic thu âm / stream)**
  8. **Mousepad (Lót chuột / pad kính)**
  9. **Audio / DAC (Soundcard chuyên dụng)**
  10. **Controller / Thiết bị khác (Tay cầm console, sim gear)**

### 10.4. Các Thẻ Chuyên Biệt Trong Trang Cá Nhân
* **Tab Tổng quan (Overview)**: Tổng hợp hoạt động gần đây (Recent Activities: vừa chơi game, vừa đăng bài, đạt thành tựu), huy hiệu danh dự, góc máy gear.
* **Tab Tủ Game (Games / Library)**: Danh sách game đang sở hữu, tổng số giờ chơi, Tỷ lệ Thắng (Winrate), Chỉ số K/D, Số trận đạt MVP, danh sách kỹ năng sở trường.
* **Tab Bài viết (Posts)**: Bộ sưu tập toàn bộ các bài đăng do người dùng sáng tạo trên nền tảng.
* **Tab Cộng đồng (Communities)**: Danh sách cộng đồng đã tham gia kèm cấp bậc uy tín đạt được (Elite, Veteran, Regular, Member).
* **Tab Thành tựu (Achievements)**: Toàn bộ cúp và giải thưởng đạt được trong game và qua các hoạt động đóng góp cho IndieG.
* **Tab Bạn bè (Friends System)**:
  * Xem danh sách bạn bè, trạng thái online và game bạn bè đang chơi.
  * Quản lý danh sách lời mời kết bạn đang chờ (Pending Requests): Chấp nhận hoặc Từ chối.
  * Thao tác: Gửi lời mời kết bạn, Hủy kết bạn, Chặn người dùng (Block).
* **Tab Sổ Lưu Bút Trang Cá Nhân (Guestbook)**:
  * Không gian để bạn bè ghé thăm để lại lời chúc mừng, lời nhắn thân mật (GG, bạn bắn hay lắm!).
  * Ràng buộc kiểm tra độ dài tối thiểu khi viết lưu bút.
  * Tương tác: Thích lời nhắn, Xóa lời nhắn lưu bút (dành cho chủ profile hoặc tác giả lời nhắn).

---

## 🔍 11. TÌM KIẾM TOÀN CỤC & LỊCH SỬ TÌM KIẾM (GLOBAL SEARCH)

### 11.1. Hộp Thoại Tìm Kiếm Nhanh Tại Header (Instant Search)
* Nhập từ khóa để nhận gợi ý tức thì mà không cần chuyển trang.
* Tìm kiếm xuyên suốt toàn bộ nền tảng.

### 11.2. Trang Kết Quả Tìm Kiếm Chuyên Sâu (`/search`)
* Phân loại kết quả tìm kiếm theo **6 bộ lọc danh mục**:
  1. **Tất cả (All Results)**
  2. **Bài viết (Posts)**: Khớp theo tiêu đề, nội dung và thẻ tags.
  3. **Cộng đồng (Communities)**: Khớp theo tên nhóm và chủ đề.
  4. **Người dùng (Users)**: Tìm theo tên hiển thị và username `@handle`.
  5. **Trò chơi (Games)**: Tìm theo tên game và thể loại.
  6. **Tổ đội (Squads)**: Tìm theo tên phòng và mục tiêu tuyển thành viên.

### 11.3. Lịch Sử Tìm Kiếm Gần Đây (Recent Searches)
* Lưu trữ tự động các từ khóa tìm kiếm gần nhất trong LocalStorage.
* Hiển thị danh sách truy cập nhanh khi nhấp vào ô tìm kiếm.
* Hỗ trợ xóa từng từ khóa hoặc Xóa sạch toàn bộ lịch sử tìm kiếm chỉ với 1 thao tác.

---

## 🔔 12. TRUNG TÂM THÔNG BÁO THỜI GIAN THỰC (NOTIFICATION CENTER)

### 12.1. Nhận Diện & Cơ Chế Thông Báo (Polling & Events)
* Tích hợp hook theo dõi thông báo định kỳ (`useNotificationPolling`).
* Biểu tượng chuông thông báo trên Header kèm huy hiệu chấm đỏ hiển thị số lượng thông báo chưa đọc.

### 12.2. Phân Loại Thông Báo Chi Tiết
* **Tương tác**: Có người Like bài viết, Bình luận bài viết, hoặc Trả lời bình luận của bạn.
* **Đề cập (@Mentions)**: Có người nhắc tên bạn trong bài đăng hoặc phòng thảo luận.
* **Bạn bè & Tổ đội**: Lời mời kết bạn mới, lời mời gia nhập phòng Squad leo rank.
* **Hệ thống**: Thông báo nâng cấp tính năng, bảo trì, hoặc thông báo xử lý báo cáo vi phạm.

### 12.3. Thao Tác Thông Báo
* Bộ lọc hiển thị: *Tất cả*, *Chưa đọc*, *Tương tác*, *Hệ thống*.
* Nút "Đánh dấu tất cả là đã đọc (Mark all as read)".
* Nhấp vào thông báo sẽ tự động chuyển hướng chính xác đến vị trí bài viết/bình luận/profile liên quan.

---

## 📌 13. QUẢN LÝ DẤU TRANG & LƯU TRỮ (BOOKMARKS)

### 13.1. Thao Tác Lưu Trữ Nhanh
* Nhấp biểu tượng Bookmark trên bất kỳ bài viết nào để lưu lại đọc sau.
* Tự động đồng bộ vào kho dữ liệu cá nhân.

### 13.2. Trang Quản Lý Dấu Trang (`/bookmark`)
* Duyệt danh sách toàn bộ các cẩm nang, bí kíp, bài viết hay đã đánh dấu.
* Tích hợp thanh tìm kiếm bài viết nội bộ trong kho lưu trữ.
* Phân loại bài viết theo thể loại thẻ tags.
* Hủy lưu trữ (Remove Bookmark) nhanh chóng ngay trên danh sách.

---

## 🛡️ 14. BÁO CÁO VI PHẠM & AN TOÀN NỀN TẢNG (REPORT SYSTEM)

### 14.1. Form Báo Cáo Vi Phạm Đa Đối Tượng (`ReportModal`)
* Hỗ trợ gửi báo cáo tố cáo: **Bài viết**, **Bình luận**, hoặc **Người dùng vi phạm**.

### 14.2. Danh Mục Lý Do Vi Phạm Chi Tiết
* *Spam / Quảng cáo rác / Lừa đảo*.
* *Ngôn từ thù ghét, xúc phạm danh dự*.
* *Quấy rối, bắt nạt trực tuyến*.
* *Nội dung nhạy cảm, bạo lực, phản cảm*.
* *Vi phạm bản quyền sở hữu trí tuệ*.
* *Lý do khác*.

### 14.3. Ràng Buộc Xác Thực Báo Cáo
* Yêu cầu nhập nội dung mô tả chi tiết lý do tố cáo kèm kiểm tra độ dài tối thiểu để tránh tình trạng spam báo cáo giả mạo.
* Thông báo xác nhận sau khi gửi tố cáo thành công lên Ban quản trị.

---

## ⚙️ 15. TRUNG TÂM CÀI ĐẶT TOÀN DIỆN (SETTINGS & PREFERENCES - `/settings`)

Trang cài đặt phân chia thành **8 phân hệ chuyên biệt**:

### 15.1. Cài Đặt Chung (General Tab)
* **Giao diện**: Lựa chọn Chế độ Tối (Dark) hoặc Chế độ Sáng (Light).
* **Ngôn ngữ hệ thống**: Lựa chọn Tiếng Việt hoặc English.

### 15.2. Lối Tắt Nhanh (Quick Access Tab)
* Cho phép người dùng tùy chọn danh sách các tựa game yêu thích nhất.
* Ghim các icon trò chơi này trực tiếp lên thanh Sidebar bên trái để mở nhanh Game Hub bất cứ lúc nào.

### 15.3. Quyền Riêng Tư (Privacy Tab)
* **Quyền hiển thị Hồ sơ**: *Công khai (Public)*, *Chỉ bạn bè (Friends only)*, hoặc *Riêng tư (Private)*.
* **Trạng thái trực tuyến**: Bật/Tắt hiển thị trạng thái Online cho người khác thấy.
* **Quyền hiển thị Tủ game & Góc máy Gear**: Ẩn/Hiện thông tin giờ chơi và linh kiện phần cứng đối với khách vãng lai.

### 15.4. Tùy Chỉnh Thông Báo (Notifications Tab)
* Bật / Tắt riêng lẻ từng loại thông báo:
  * Khi có người bình luận vào bài viết của bạn.
  * Khi có người trả lời bình luận của bạn.
  * Khi có người bấm thích (Like) nội dung của bạn.
  * Khi có người nhắc tên (@Mention) bạn.
  * Thông báo hoạt động mới từ các cộng đồng đã tham gia.

### 15.5. Tài Khoản & Bảo Mật (Account Tab)
* Xem trạng thái tài khoản (Đã xác minh / Chưa xác minh email).
* Gửi mã OTP xác minh email ngay trong phần cài đặt.
* Đổi địa chỉ email tài khoản mới an toàn.
* Đổi mật khẩu tài khoản (yêu cầu mật khẩu cũ và xác thực mật khẩu mới).
* **Quản lý phiên đăng nhập (Active Sessions)**: Xem chi tiết các thiết bị đăng nhập và thu hồi phiên từ xa.

### 15.6. Danh Sách Đã Chặn (Blocked Users Tab)
* Hiển thị danh sách tất cả người dùng mà bạn đã chặn.
* Xem ảnh đại diện, tên, thời gian chặn và lý do chặn.
* Nút **Bỏ chặn (Unblock)** tức thì.

### 15.7. Đóng Góp Ý Kiến & Báo Lỗi (Feedback & Bug Report Tab)
* Cho phép game thủ gửi phản hồi trực tiếp đến đội ngũ phát triển:
  * *Báo lỗi hệ thống (Bug Report)*
  * *Đề xuất tính năng mới (Feature Suggestion)*
  * *Ý kiến đóng góp chung (General Feedback)*

### 15.8. Vùng Nguy Hiểm (Danger Zone Tab)
* **Đăng xuất khỏi tất cả các thiết bị**: Hủy tất cả các phiên đăng nhập khác ngoại trừ phiên hiện tại.
* **Xóa tài khoản vĩnh viễn (Delete Account)**: Quy trình xác nhận nhiều bước kèm cảnh báo mất toàn bộ dữ liệu bài viết, tủ game và danh hiệu không thể khôi phục.

---

## 🛠️ 16. CÔNG CỤ DÀNH CHO NHÀ PHÁT TRIỂN & TEST DỮ LIỆU (DEVELOPER & QA TOOLS)

### 16.1. Chuyển Đổi Nhanh Tài Khoản Giả Lập (Mock Account Switcher)
* Menu tiện ích xuất hiện trên thanh Header cho phép chuyển đổi tức thì giữa **6 tài khoản kiểm thử đại diện cho các vai trò khác nhau**:
  1. **Quản trị viên (Admin)**: Đầy đủ quyền hệ thống, kiểm duyệt và quản trị.
  2. **Game thủ VIP (Founder)**: Tài khoản VIP sáng lập, đã verify email, sở hữu tủ game phong phú.
  3. **Hardcore RPG Gamer**: Game thủ chuyên trị dòng Souls-like, nhiều thảo luận cộng đồng.
  4. **Streamer & Creator**: Nhà sáng tạo nội dung, streamer được yêu thích.
  5. **Tuyển thủ FPS Pro**: Đội trưởng Premier CS2, tuyển thủ chiến thuật.
  6. **Tân thủ (Unverified User)**: Tài khoản mới chưa xác thực email (dùng để kiểm thử cổng chặn quyền hạn).

### 16.2. Dữ Liệu Kiểm Thử Toàn Diện (Comprehensive Mock Test Data)
* Bộ dữ liệu mẫu bài viết bao quát đầy đủ các loại: Discussion, Guide, Media, Event, Question.
* Tích hợp dữ liệu kiểm thử liên kết hai chiều giữa Community và Game Hub cho các tựa game lớn: CS2, Elden Ring, Black Myth: Wukong, Cyberpunk 2077, Raft...
* Route phát triển dành riêng: `/_authenticated/developer`.

---

## 📊 TỔNG KẾT QUY MÔ TÍNH NĂNG DỰ ÁN

| Phân hệ / Module | Số lượng màn hình & Modal chính | Các tính năng cốt lõi | Mức độ hoàn thiện |
| :--- | :--- | :--- | :--- |
| **Hệ thống & Giao diện** | 3 layouts chính (Root, App Layout, Auth) | Dark/Light Mode, Song ngữ Việt-Anh, Responsive, Lightbox | 100% |
| **Xác thực & Bảo mật** | 4 forms (Login, Register, Forgot, OTP) + 1 Route Verify | zxcvbn password meter, Verify email OTP, Active sessions | 100% |
| **Bảng tin & Bài viết** | Feed view, Create Box, Edit Modal, Detail Route | Markdown editor, Upvote/Downvote, Tagging, Pin, Drafts | 100% |
| **Bình luận đa cấp** | Comment section, Reply box, Image uploader | Nested replies, Pin comment, Image preview, Top/Newest | 100% |
| **Diễn đàn Cộng đồng** | Community list, Create modal, Hub detail, Mod Hub | 5 tabs nội dung, Liên kết 2 chiều Game Hub, Live Chat, Mod tools | 100% |
| **Ghép đội (Squad/LFG)** | Squad explore, Create squad modal, My squads | Lọc Rank/Game/Voice, Quản lý thành viên, Discord voice | 100% |
| **Game Hub & Library** | Game detail, System specs, Patch notes, Guides | Cấu hình máy, Sentiment, Lịch sử update, Reviews | 100% |
| **Tạp chí & Khám phá** | Explore page, Vietnam Spotlight, Viral Gallery | Hero magazine, Vinh danh Indie Việt, Editorial news | 100% |
| **Hồ sơ & Gaming Gear** | Profile page, 7 tabs, Cropper, Badge modal, Bio editor | 10 loại Gear, Avatar frames, Guestbook, Friends system | 100% |
| **Tìm kiếm & Bộ sưu tập** | Global search, Dropdown search, Bookmark page | Lọc 6 danh mục, LocalStorage recent searches, Quản lý dấu trang | 100% |
| **Thông báo & Báo cáo** | Dropdown notify, Report modal | Polling thời gian thực, Phân loại tương tác, Tố cáo vi phạm | 100% |
| **Cài đặt hệ thống** | 8 tabs Settings | Theme, Quick access, Privacy, Active sessions, Blocked, Feedback | 100% |
