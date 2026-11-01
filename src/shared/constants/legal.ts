export interface LegalSection {
    id: string;
    title: string;
    content: string[];
}

export interface LegalDocument {
    title: string;
    lastUpdated: string;
    intro: string;
    sections: LegalSection[];
}

export const LEGAL_DOCS = {
    vi: {
        terms: {
            title: "Điều khoản dịch vụ",
            lastUpdated: "Cập nhật lần cuối: Tháng 10, 2026",
            intro: "Chào mừng bạn đến với Ludon - mạng xã hội và nền tảng kết nối game thủ. Khi truy cập hoặc tạo tài khoản trên Ludon, bạn đồng ý tuân thủ các điều khoản và quy định dưới đây nhằm xây dựng một cộng đồng game thủ văn minh và lành mạnh.",
            sections: [
                {
                    id: "acceptance",
                    title: "1. Chấp Thuận Điều Khoản",
                    content: [
                        "Bằng việc đăng ký tài khoản hoặc sử dụng dịch vụ của Ludon, bạn xác nhận đã đủ độ tuổi tối thiểu theo quy định pháp luật (từ 13 tuổi trở lên hoặc có sự đồng ý của người giám hộ hợp pháp) và chấp thuận toàn bộ các điều khoản này.",
                        "Nếu không đồng ý với bất kỳ điều khoản nào, vui lòng ngưng sử dụng dịch vụ của Ludon."
                    ],
                },
                {
                    id: "account",
                    title: "2. Tài Khoản & Bảo Mật",
                    content: [
                        "Bạn chịu trách nhiệm bảo mật thông tin đăng nhập, mật khẩu và mọi hoạt động diễn ra dưới tài khoản của bạn.",
                        "Mỗi người dùng chỉ nên sở hữu một tài khoản chính thức. Nghiêm cấm hành vi mạo danh người khác, chiếm đoạt tài khoản hoặc chia sẻ tài khoản cho bên thứ ba.",
                        "Nếu phát hiện bất kỳ dấu hiệu truy cập trái phép nào, hãy liên hệ ngay với đội ngũ quản trị để được hỗ trợ bảo vệ tài khoản."
                    ],
                },
                {
                    id: "conduct",
                    title: "3. Quy Tắc Ứng Xử Cộng Đồng",
                    content: [
                        "Tôn trọng cộng đồng: Không đăng tải nội dung thù địch, xúc phạm, phân biệt đối xử, quấy rối hoặc kích động bạo lực đối với các game thủ khác.",
                        "Công bằng trong game (Fair Play): Nghiêm cấm quảng bá, phát tán hoặc kinh doanh phần mềm gian lận (hack/cheat), mã độc hoặc các công cụ phá hoại trải nghiệm chơi game.",
                        "Bảo vệ thảo luận: Không spam, quảng cáo thương mại trái phép hoặc tung tin giả trong các bài đăng, phòng chat squad và nhóm cộng đồng."
                    ],
                },
                {
                    id: "ugc",
                    title: "4. Nội Dung Do Người Dùng Tạo (UGC)",
                    content: [
                        "Bạn giữ quyền sở hữu đối với các bài viết, bài đánh giá, hình ảnh và bình luận bạn đăng tải lên Ludon.",
                        "Khi chia sẻ công khai nội dung trên Ludon, bạn cấp cho chúng tôi quyền hiển thị, lưu trữ và định dạng lại nội dung đó trên hệ thống nền tảng để phục vụ hoạt động cộng đồng.",
                        "Ludon có quyền kiểm duyệt và gỡ bỏ các nội dung vi phạm bản quyền, vi phạm pháp luật hoặc quy chuẩn cộng đồng mà không cần thông báo trước."
                    ],
                },
                {
                    id: "termination",
                    title: "5. Tạm Dừng & Chấm Dứt Tài Khoản",
                    content: [
                        "Chúng tôi bảo lưu quyền tạm đình chỉ hoặc khóa vĩnh viễn tài khoản có hành vi gian lận, phá hoại hệ thống hoặc vi phạm nghiêm trọng quy chuẩn cộng đồng.",
                        "Bạn có quyền ngừng sử dụng hoặc yêu cầu xóa tài khoản bất cứ lúc nào thông qua trang Cài đặt tài khoản."
                    ],
                },
            ],
        },
        privacy: {
            title: "Chính sách bảo mật",
            lastUpdated: "Cập nhật lần cuối: Tháng 10, 2026",
            intro: "Ludon cam kết tôn trọng và bảo vệ quyền riêng tư cá nhân của game thủ. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin khi bạn tham gia vào mạng lưới cộng đồng của chúng tôi.",
            sections: [
                {
                    id: "collection",
                    title: "1. Thông Tin Thu Thập",
                    content: [
                        "Thông tin tài khoản: Địa chỉ email, tên hiển thị, tên người dùng (username), mật khẩu mã hóa và ảnh đại diện do bạn cung cấp.",
                        "Hoạt động game & cộng đồng: Các tựa game yêu thích, bài đăng, bình luận, trạng thái kết nối squad và danh sách bạn bè.",
                        "Dữ liệu kỹ thuật cơ bản: Địa chỉ IP, loại trình duyệt/thiết bị và cài đặt hiển thị (chế độ sáng/tối, ngôn ngữ) nhằm tối ưu trải nghiệm giao diện."
                    ],
                },
                {
                    id: "usage",
                    title: "2. Mục Đích Sử Dụng Dữ Liệu",
                    content: [
                        "Cung cấp và duy trì các tính năng cốt lõi: kết nối đồng đội (squad finder), chia sẻ bài viết, đánh giá game và thảo luận cộng đồng.",
                        "Bảo mật và an toàn hệ thống: xác thực danh tính, ngăn chặn bot, spam và hành vi gian lận.",
                        "Lưu trữ tùy chọn cá nhân: ghi nhớ giao diện Dark/Light mode và ngôn ngữ hiển thị ưa thích của bạn."
                    ],
                },
                {
                    id: "sharing",
                    title: "3. Cam Kết Không Bán Dữ Liệu",
                    content: [
                        "Ludon tuyệt đối không bán, trao đổi hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba vì mục đích tiếp thị.",
                        "Thông tin chỉ được chia sẻ với các nhà cung cấp hạ tầng đáng tin cậy (như máy chủ lưu trữ, dịch vụ xác thực email) để vận hành nền tảng một cách an toàn."
                    ],
                },
                {
                    id: "security",
                    title: "4. Bảo Mật Thông Tin",
                    content: [
                        "Mật khẩu của bạn được mã hóa an toàn bằng thuật toán mã hóa hiện đại trước khi lưu vào cơ sở dữ liệu.",
                        "Hệ thống sử dụng các giao thức bảo mật SSL/TLS để mã hóa đường truyền dữ liệu giữa trình duyệt của bạn và máy chủ."
                    ],
                },
                {
                    id: "rights",
                    title: "5. Quyền Lợi Của Game Thủ",
                    content: [
                        "Bạn có toàn quyền xem, chỉnh sửa thông tin hồ sơ và mật khẩu trong mục Cài đặt.",
                        "Bạn có quyền xuất dữ liệu cá nhân hoặc yêu cầu xóa hoàn toàn dữ liệu tài khoản khỏi hệ thống máy chủ của chúng tôi."
                    ],
                },
            ],
        },
    },
    en: {
        terms: {
            title: "Terms of Service",
            lastUpdated: "Last updated: October 2026",
            intro: "Welcome to Ludon — the next-generation gaming hub and community platform. By accessing or registering an account on Ludon, you agree to comply with and be bound by the following terms and conditions to maintain a respectful, safe, and fun gaming environment.",
            sections: [
                {
                    id: "acceptance",
                    title: "1. Acceptance of Terms",
                    content: [
                        "By creating an account or using any Ludon services, you certify that you meet the minimum legal age requirement (13 years of age or older, or with parental consent) and agree to be bound by these Terms.",
                        "If you disagree with any part of these terms, please discontinue using Ludon services immediately."
                    ],
                },
                {
                    id: "account",
                    title: "2. User Accounts & Security",
                    content: [
                        "You are solely responsible for safeguarding your login credentials and for all activities that occur under your account.",
                        "Each user should maintain one primary account. Impersonation, unauthorized account access, and credential sharing are strictly prohibited.",
                        "If you suspect unauthorized access or security breaches, notify our moderation team immediately."
                    ],
                },
                {
                    id: "conduct",
                    title: "3. Community Guidelines & Fair Play",
                    content: [
                        "Respect fellow gamers: Harassment, hate speech, bullying, toxicity, threats, and discrimination are strictly prohibited.",
                        "Fair play: Developing, distributing, or utilizing cheats, hacks, malicious exploits, or unauthorized automation scripts is grounds for immediate ban.",
                        "Constructive discourse: No spamming, phishing, unsolicited advertising, or disseminating malware across posts, squads, and comments."
                    ],
                },
                {
                    id: "ugc",
                    title: "4. User-Generated Content (UGC)",
                    content: [
                        "You retain intellectual property ownership of any posts, reviews, screenshots, and comments you create on Ludon.",
                        "By publishing content on Ludon, you grant us a worldwide, non-exclusive license to host, display, and distribute that content across our gaming network.",
                        "Ludon reserves the right to remove content that violates copyright laws, community guidelines, or platform security without prior notice."
                    ],
                },
                {
                    id: "termination",
                    title: "5. Account Termination",
                    content: [
                        "We reserve the right to suspend or terminate accounts that engage in persistent rule violations, cheating, or harassment.",
                        "You may terminate your account at any time through the Account Settings page."
                    ],
                },
            ],
        },
        privacy: {
            title: "Privacy Policy",
            lastUpdated: "Last updated: October 2026",
            intro: "Ludon values your privacy. This policy outlines how we collect, handle, protect, and process your information when you connect, interact, and play on our platform.",
            sections: [
                {
                    id: "collection",
                    title: "1. Information We Collect",
                    content: [
                        "Account details: Email address, username, display name, securely hashed password, and uploaded avatar.",
                        "Community activity: Bookmarked games, squad memberships, game reviews, posts, and public comments.",
                        "Technical data: IP address, device/browser specifications, and preference cookies (e.g. Dark/Light appearance, language choice) to maintain smooth operations."
                    ],
                },
                {
                    id: "usage",
                    title: "2. How We Use Data",
                    content: [
                        "To deliver core gaming services: squad matchmaking, post feed curation, game guides, and community discussions.",
                        "To protect platform integrity: user authentication, session security, fraud prevention, and bot deterrence.",
                        "To persist custom settings: theme preferences and localized language choices."
                    ],
                },
                {
                    id: "sharing",
                    title: "3. Data Sharing Commitment",
                    content: [
                        "We do not sell, rent, or trade your personal information with third-party advertisers or brokers.",
                        "Data is solely shared with trusted infrastructure providers (cloud hosting, database persistence, transactional email) strictly necessary to operate Ludon."
                    ],
                },
                {
                    id: "security",
                    title: "4. Data Security",
                    content: [
                        "All passwords are cryptographic salt-and-hashed before persistence. Session tokens are securely handled.",
                        "Industry-standard SSL/TLS encryption safeguards communication between your browser and our servers."
                    ],
                },
                {
                    id: "rights",
                    title: "5. Your Rights & Control",
                    content: [
                        "You can review, update, or modify your profile details and password at any time via Settings.",
                        "You can request an export of your personal data or permanent account erasure through our support channels."
                    ],
                },
            ],
        },
    },
} as const;

export type LegalDocType = "terms" | "privacy";
