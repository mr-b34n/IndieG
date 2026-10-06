import type { ReportDto, ReportHistoryItemDto, ResolveReportDto } from "@/shared/api/types";

/**
 * =========================================================================
 * MOCK REPORTS DATA
 * =========================================================================
 * Dữ liệu báo cáo vi phạm nội dung / người dùng mẫu và lịch sử xử lý kiểm duyệt.
 */

export const MOCK_REPORTS: ReportDto[] = [
    {
        id: "rep-101",
        targetType: "post",
        targetId: "post-1",
        postId: "post-1",
        reporterId: "user-3",
        status: "pending",
        reason: "Spam liên kết quảng cáo: Bài viết có dấu hiệu chèn link nhóm kéo rank cá cược bên ngoài.",
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        reporter: {
            id: "user-3",
            username: "cybersamurai",
            name: "CyberSamurai",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberSamurai",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberSamurai",
        },
        post: {
            id: "post-1",
            title: "Pha Clutch 1v4 nghẹt thở tại map Mirage Premier rank 20k Elo!",
            content: "Hôm qua vừa có pha clutch 1 cân 4 cứu cả trận đấu ở round 12-11...",
        },
    },
    {
        id: "rep-102",
        targetType: "comment",
        targetId: "cmt-bad-1",
        commentId: "cmt-bad-1",
        reporterId: "user-2",
        status: "in_review",
        reason: "Ngôn từ thù địch: Xúc phạm danh dự và lăng mạ người chơi khác trong bình luận.",
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        reporter: {
            id: "user-2",
            username: "shadowhunter",
            name: "ShadowHunter",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowHunter",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowHunter",
        },
        comment: {
            id: "cmt-bad-1",
            content: "Bắn gà thế này thì xóa game đi chứ lên rank 20k làm trò cười à!",
        },
    },
    {
        id: "rep-103",
        targetType: "post",
        targetId: "post-cheat-1",
        reporterId: "user-1",
        status: "resolved",
        moderationAction: "user_banned",
        reason: "Gian lận phần mềm (Hack/Cheat): Chia sẻ video hướng dẫn cài phần mềm can thiệp bộ nhớ game CS2.",
        moderatorNote: "Đã xác minh bằng chứng video vi phạm nghiêm trọng. Đã khóa tài khoản vĩnh viễn và gỡ bài viết.",
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        reporter: {
            id: "user-1",
            username: "eldenlord",
            name: "EldenLord_VN",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
        },
        post: {
            id: "post-cheat-1",
            title: "Bản mod hỗ trợ auto headshot cực nhẹ không bị phát hiện",
            content: "Chia sẻ file DLL can thiệp vào game CS2 không lo VAC ban...",
        },
    },
    {
        id: "rep-104",
        targetType: "comment",
        targetId: "cmt-scam-1",
        commentId: "cmt-scam-1",
        reporterId: "user-me",
        status: "resolved",
        moderationAction: "content_removed",
        reason: "Lừa đảo: Chèn link phishing giả mạo Steam nhận quà skin Dragon Lore miễn phí.",
        moderatorNote: "Đã xóa nội dung độc hại và chặn tên miền lừa đảo trên toàn bộ diễn đàn.",
        createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        reporter: {
            id: "user-me",
            username: "IndieGamer",
            name: "Indie Gamer Pro",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieGamer",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieGamer",
        },
        comment: {
            id: "cmt-scam-1",
            content: "Bấm vào link steam-community-free-skins.xyz để nhận quà skin nhé mọi người!",
        },
    },
    {
        id: "rep-105",
        targetType: "post",
        targetId: "post-4",
        postId: "post-4",
        reporterId: "user-4",
        status: "dismissed",
        moderationAction: "no_action",
        reason: "Bài viết sai chuyên mục: Đăng tìm bạn coop Raft trong cộng đồng Indie Games.",
        moderatorNote: "Cộng đồng Indie Games cho phép giao lưu tìm bạn chơi sinh tồn. Báo cáo không hợp lệ.",
        createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
        reporter: {
            id: "user-4",
            username: "pixelcraft",
            name: "PixelCraft",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=PixelCraft",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=PixelCraft",
        },
    },
    {
        id: "rep-106",
        targetType: "user",
        targetId: "usr_banned_cheater",
        reporterId: "user-2",
        status: "resolved",
        moderationAction: "user_banned",
        reason: "Tài khoản gian lận (Cheater): Bán tool can thiệp file CS2 và dịch vụ cày thuê rank Premier lừa đảo.",
        moderatorNote: "Đã kiểm duyệt log chat và demo: xác nhận đối tượng phát tán mã độc. Tài khoản đã bị khóa vĩnh viễn (status: banned).",
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        reporter: {
            id: "user-2",
            username: "shadowhunter",
            name: "ShadowHunter",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowHunter",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowHunter",
        },
        post: {
            id: "usr_banned_cheater",
            title: "Người dùng vi phạm: @viper_cheats (ViperCS Hacks)",
            content: "Đối tượng liên tục spam tin nhắn riêng tư mời chào mua tool gian lận.",
        },
    },
    {
        id: "rep-107",
        targetType: "user",
        targetId: "usr_banned_toxic",
        reporterId: "user-streamer",
        status: "resolved",
        moderationAction: "user_banned",
        reason: "Quấy rối và đe dọa thành viên: Spam xúc phạm người sáng tạo nội dung trong lúc livestream.",
        moderatorNote: "Tài khoản @toxichunter99 tái phạm lần thứ 4. Đã thi hành lệnh cấm tài khoản vĩnh viễn.",
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        reporter: {
            id: "user-streamer",
            username: "LunaStream",
            name: "Luna Valkyrie",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=LunaValkyrie",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=LunaValkyrie",
        },
        post: {
            id: "usr_banned_toxic",
            title: "Người dùng vi phạm: @toxichunter99 (Toxic Hunter)",
            content: "Liên tục bình luận thù địch, dọa dẫm và quấy rối thành viên trong buổi stream Raft.",
        },
    },
    {
        id: "rep-108",
        targetType: "post",
        targetId: "post-3",
        postId: "post-3",
        reporterId: "user-1",
        status: "pending",
        reason: "Cảnh báo bảo mật: File đính kèm nghi ngờ chứa mã độc trojan ngụy trang mod đồ họa Cyberpunk.",
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        reporter: {
            id: "user-1",
            username: "eldenlord",
            name: "EldenLord_VN",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
        },
        post: {
            id: "post-3",
            title: "Tối ưu hóa Cyberpunk 2077 Ray Tracing Overdrive mượt mà trên RTX 3060",
            content: "Chia sẻ file tinh chỉnh engine.ini giúp tăng 25% FPS...",
        },
    },
    {
        id: "rep-109",
        targetType: "comment",
        targetId: "cmt-trade-scam",
        commentId: "cmt-trade-scam",
        reporterId: "user-3",
        status: "pending",
        reason: "Giao dịch phi pháp: Rao bán tài khoản Steam và vật phẩm bằng tiền mặt (RMT cấm).",
        createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        reporter: {
            id: "user-3",
            username: "cybersamurai",
            name: "CyberSamurai",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberSamurai",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberSamurai",
        },
        comment: {
            id: "cmt-trade-scam",
            content: "Cần thanh lý gấp acc CS2 có dao Butterfly Doppler giá 5 triệu chuyển khoản trực tiếp liên hệ Zalo 09xx...",
        },
    },
    {
        id: "rep-110",
        targetType: "post",
        targetId: "post-nsfw-1",
        reporterId: "user-5",
        status: "resolved",
        moderationAction: "content_removed",
        reason: "Hình ảnh không phù hợp: Chia sẻ ảnh chụp mod 18+ không gắn thẻ cảnh báo trong cộng đồng Elden Ring.",
        moderatorNote: "Đã gỡ bài đăng và nhắc nhở thành viên về quy định gắn thẻ NSFW.",
        createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        reporter: {
            id: "user-5",
            username: "ranni_witch",
            name: "Ranni The Witch",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Ranni",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Ranni",
        },
        post: {
            id: "post-nsfw-1",
            title: "Tổng hợp mod trang phục tùy biến nhân vật trong Elden Ring",
            content: "Bộ sưu tập mod trang phục dành cho nữ Tarnished...",
        },
    },
];

export const MOCK_REPORT_HISTORY: Record<string, ReportHistoryItemDto[]> = {
    "rep-101": [
        {
            id: "hist-101-1",
            reportId: "rep-101",
            action: "report_created",
            status: "pending",
            createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        },
    ],
    "rep-102": [
        {
            id: "hist-102-1",
            reportId: "rep-102",
            action: "report_created",
            status: "pending",
            createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        },
        {
            id: "hist-102-2",
            reportId: "rep-102",
            action: "assigned_to_moderator",
            status: "in_review",
            moderatorId: "usr_admin",
            moderator: {
                id: "usr_admin",
                username: "IndieAdmin",
                name: "IndieG Administrator",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieAdmin",
            },
            moderatorNote: "Đang xem xét nhật ký chat và bình luận liên quan.",
            createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        },
    ],
    "rep-103": [
        {
            id: "hist-103-1",
            reportId: "rep-103",
            action: "report_created",
            status: "pending",
            createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        },
        {
            id: "hist-103-2",
            reportId: "rep-103",
            action: "user_banned",
            status: "resolved",
            moderatorId: "usr_admin",
            moderator: {
                id: "usr_admin",
                username: "IndieAdmin",
                name: "IndieG Administrator",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieAdmin",
            },
            moderatorNote: "Đã kiểm tra demo trận đấu, xác nhận gian lận và khóa tài khoản vĩnh viễn.",
            createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        },
    ],
    "rep-104": [
        {
            id: "hist-104-1",
            reportId: "rep-104",
            action: "report_created",
            status: "pending",
            createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        },
        {
            id: "hist-104-2",
            reportId: "rep-104",
            action: "content_removed",
            status: "resolved",
            moderatorId: "usr_admin",
            moderator: {
                id: "usr_admin",
                username: "IndieAdmin",
                name: "IndieG Administrator",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieAdmin",
            },
            moderatorNote: "Đã gỡ bỏ bình luận lừa đảo và kích hoạt bộ lọc từ khóa độc hại.",
            createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        },
    ],
    "rep-105": [
        {
            id: "hist-105-1",
            reportId: "rep-105",
            action: "report_created",
            status: "pending",
            createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        },
        {
            id: "hist-105-2",
            reportId: "rep-105",
            action: "dismissed",
            status: "dismissed",
            moderatorId: "usr_admin",
            moderator: {
                id: "usr_admin",
                username: "IndieAdmin",
                name: "IndieG Administrator",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieAdmin",
            },
            moderatorNote: "Báo cáo không chính xác. Nội dung bài viết tuân thủ đúng nội quy.",
            createdAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
        },
    ],
    "rep-106": [
        {
            id: "hist-106-1",
            reportId: "rep-106",
            action: "report_created",
            status: "pending",
            createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        },
        {
            id: "hist-106-2",
            reportId: "rep-106",
            action: "user_banned",
            status: "resolved",
            moderatorId: "usr_admin",
            moderator: {
                id: "usr_admin",
                username: "IndieAdmin",
                name: "IndieG Administrator",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieAdmin",
            },
            moderatorNote: "Khóa vĩnh viễn tài khoản @viper_cheats và cấm địa chỉ IP gian lận.",
            createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 3600 * 1000).toISOString(),
        },
    ],
    "rep-107": [
        {
            id: "hist-107-1",
            reportId: "rep-107",
            action: "report_created",
            status: "pending",
            createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        },
        {
            id: "hist-107-2",
            reportId: "rep-107",
            action: "user_banned",
            status: "resolved",
            moderatorId: "usr_admin",
            moderator: {
                id: "usr_admin",
                username: "IndieAdmin",
                name: "IndieG Administrator",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieAdmin",
            },
            moderatorNote: "Ban vĩnh viễn @toxichunter99 do vi phạm chính sách chống quấy rối.",
            createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 1800 * 1000).toISOString(),
        },
    ],
    "rep-108": [
        {
            id: "hist-108-1",
            reportId: "rep-108",
            action: "report_created",
            status: "pending",
            createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        },
    ],
    "rep-109": [
        {
            id: "hist-109-1",
            reportId: "rep-109",
            action: "report_created",
            status: "pending",
            createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        },
    ],
    "rep-110": [
        {
            id: "hist-110-1",
            reportId: "rep-110",
            action: "report_created",
            status: "pending",
            createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        },
        {
            id: "hist-110-2",
            reportId: "rep-110",
            action: "content_removed",
            status: "resolved",
            moderatorId: "usr_admin",
            moderator: {
                id: "usr_admin",
                username: "IndieAdmin",
                name: "IndieG Administrator",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieAdmin",
            },
            moderatorNote: "Đã gỡ bài viết không gắn nhãn 18+ và cảnh cáo tác giả.",
            createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        },
    ],
};

export const getMockReports = (): ReportDto[] => {
    return [...MOCK_REPORTS];
};

export const getMockReportById = (id: string): ReportDto => {
    return MOCK_REPORTS.find((r) => r.id === id) || MOCK_REPORTS[0];
};

export const getMockReportHistory = (reportId: string): ReportHistoryItemDto[] => {
    return MOCK_REPORT_HISTORY[reportId] || [];
};

export const addMockReport = (report: ReportDto): void => {
    MOCK_REPORTS.unshift(report);
    MOCK_REPORT_HISTORY[report.id] = [
        {
            id: `hist-${Date.now()}`,
            reportId: report.id,
            action: "report_created",
            status: report.status || "pending",
            createdAt: new Date().toISOString(),
        },
    ];
};

export const deleteMockReport = (id: string): void => {
    const idx = MOCK_REPORTS.findIndex((r) => r.id === id);
    if (idx !== -1) {
        MOCK_REPORTS.splice(idx, 1);
    }
};

export const resolveMockReport = (
    reportId: string,
    data: ResolveReportDto | string
): { success: boolean; message: string } => {
    const report = MOCK_REPORTS.find((r) => r.id === reportId);
    if (!report) {
        return { success: false, message: "Report not found" };
    }

    const note = typeof data === "string" ? data : (data.moderatorNote || "");
    const status = typeof data === "object" && data.status ? data.status : "resolved";

    report.status = status;
    report.moderatorNote = note;
    report.updatedAt = new Date().toISOString();

    if (!MOCK_REPORT_HISTORY[reportId]) {
        MOCK_REPORT_HISTORY[reportId] = [];
    }
    MOCK_REPORT_HISTORY[reportId].push({
        id: `hist-${Date.now()}`,
        reportId,
        action: status,
        status,
        moderatorId: "usr_admin",
        moderatorNote: note,
        moderator: {
            id: "usr_admin",
            username: "IndieAdmin",
            name: "IndieG Administrator",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieAdmin",
        },
        createdAt: new Date().toISOString(),
    });

    return { success: true, message: `Report ${status}` };
};
