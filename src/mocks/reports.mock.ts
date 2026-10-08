import type { ReportDto, ReportHistoryItemDto, ResolveReportDto } from "@/shared/api/types";

/**
 * =========================================================================
 * MOCK REPORTS DATA (PROFESSIONAL GAMING COMMUNITY MODERATION)
 * =========================================================================
 * Dữ liệu báo cáo kiểm duyệt chuẩn mực, chuyên nghiệp, sạch sẽ và gắn liền với
 * từng cộng đồng game cụ thể.
 */

export const MOCK_REPORTS: ReportDto[] = [
    {
        id: "rep-101",
        targetType: "post",
        targetId: "post-1",
        postId: "post-1",
        communityId: "cs2-vietnam",
        communityName: "Counter-Strike 2 Vietnam",
        reporterId: "user-3",
        status: "pending",
        reason: "Quảng bá máy chủ ngoài: Bài viết tuyển đội Premier có kèm liên kết máy chủ Discord riêng chưa qua đăng ký xác minh cộng đồng.",
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
            title: "Pha Clutch 1v4 nghẹt thở tại map Mirage Premier 20k ELO",
            content: "Hôm qua vừa có pha clutch 1 cân 4 cứu cả trận đấu ở round 12-11. Quả smoke ninja defuse vào CT spawn khiến cả đối thủ bắn mù mờ...",
        },
    },
    {
        id: "rep-102",
        targetType: "comment",
        targetId: "cmt-bad-1",
        commentId: "cmt-bad-1",
        communityId: "cs2-vietnam",
        communityName: "Counter-Strike 2 Vietnam",
        reporterId: "user-2",
        status: "in_review",
        reason: "Ngôn từ thiếu xây dựng: Bình luận công kích cá nhân và mỉa mai lối chơi của thành viên khác trong bài phân tích kinh tế MR12.",
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
            content: "Kê tâm thế này thì bắn làm sao lên nổi 20k Elo, nên vào map bot tập lại trước khi viết bài hướng dẫn.",
        },
    },
    {
        id: "rep-103",
        targetType: "post",
        targetId: "post-3",
        postId: "post-3",
        communityId: "elden-ring-vietnam",
        communityName: "Elden Ring Vietnam",
        reporterId: "user-5",
        status: "resolved",
        moderationAction: "content_restored",
        reason: "Chưa gắn thẻ Cảnh báo Spoilers: Tiết lộ chi tiết điểm yếu của trùm ẩn trong DLC Shadow of the Erdtree mà không dùng thẻ ẩn nội dung.",
        moderatorNote: "Điều hành viên đã hỗ trợ tác giả bổ sung nhãn [Spoiler Alert] và mở lại hiển thị bài viết bình thường.",
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        reporter: {
            id: "user-5",
            username: "ranni_witch",
            name: "Ranni The Witch",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Ranni",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Ranni",
        },
        post: {
            id: "post-3",
            title: "Tại sao cơ chế Stagger và Poise trong Elden Ring lại hấp dẫn hơn Dark Souls 3?",
            content: "Sau hàng trăm giờ cày cuốc cả DS3 lẫn Elden Ring (đặc biệt sau DLC Shadow of the Erdtree), mình nhận ra hệ thống Poise ngầm tạo ra nhịp độ đối kháng hồi hộp...",
        },
    },
    {
        id: "rep-104",
        targetType: "post",
        targetId: "post-5",
        postId: "post-5",
        communityId: "black-myth-wukong-vn",
        communityName: "Black Myth: Wukong Vietnam",
        reporterId: "user-1",
        status: "resolved",
        moderationAction: "no_action",
        reason: "Đăng sai danh mục: Hướng dẫn tìm kiếm Tinh Phách nhưng gắn nhãn Sự kiện thay vì Cẩm nang qua ải.",
        moderatorNote: "Điều hành viên đã điều chỉnh bài viết về đúng danh mục Hướng dẫn & Bí kíp qua ải.",
        createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        reporter: {
            id: "user-1",
            username: "eldenlord",
            name: "EldenLord_VN",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
        },
        post: {
            id: "post-5",
            title: "Cách đánh boss Tiểu Hoàng Long không mất giọt máu nào",
            content: "Chiến thuật giữ khoảng cách và dùng Biến hình Thạch Viên kết hợp Định Thân Thuật chuẩn từng nhịp...",
        },
    },
    {
        id: "rep-105",
        targetType: "post",
        targetId: "post-11",
        postId: "post-11",
        communityId: "cyberpunk-2077-vn",
        communityName: "Cyberpunk 2077 Vietnam",
        reporterId: "user-me",
        status: "pending",
        reason: "Bản mod chưa đính kèm link tác giả: Chia sẻ tinh chỉnh cấu hình đồ họa nhưng thiếu ghi nguồn tác giả gốc trên NexusMods.",
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        reporter: {
            id: "user-me",
            username: "IndieGamer",
            name: "Indie Gamer Pro",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieGamer",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieGamer",
        },
        post: {
            id: "post-11",
            title: "Tối ưu hóa Cyberpunk 2077 Ray Tracing Overdrive mượt mà trên RTX 3060",
            content: "Chia sẻ file tinh chỉnh engine.ini giúp tăng 25% FPS khi bật Path Tracing mà không làm mờ hình ảnh...",
        },
    },
    {
        id: "rep-106",
        targetType: "post",
        targetId: "post-12",
        postId: "post-12",
        communityId: "indie-games-vietnam",
        communityName: "Indie Games Vietnam",
        reporterId: "user-4",
        status: "resolved",
        moderationAction: "content_removed",
        reason: "Đăng trùng lặp: Thành viên tạo liên tiếp 3 bài tìm bạn coop sinh tồn bè Raft trong vòng 10 phút.",
        moderatorNote: "Đã gỡ bài đăng trùng lặp và nhắc nhở thành viên sử dụng bài viết ghim Tìm đồng đội hàng tuần.",
        createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
        reporter: {
            id: "user-4",
            username: "pixelcraft",
            name: "PixelCraft",
            avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=PixelCraft",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=PixelCraft",
        },
        post: {
            id: "post-12",
            title: "Tìm 2 bạn chơi Raft mượt mà cuối tuần này",
            content: "Mình mới mở world mới, cần 2 bạn voice Discord sinh tồn mở rộng bè...",
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
            moderatorNote: "Đang xem xét ngữ cảnh đoạn tranh luận trong bài viết.",
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
            action: "content_restored",
            status: "resolved",
            moderatorId: "usr_admin",
            moderator: {
                id: "usr_admin",
                username: "IndieAdmin",
                name: "IndieG Administrator",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieAdmin",
            },
            moderatorNote: "Đã bổ sung thẻ cảnh báo spoiler và khôi phục bài viết.",
            createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        },
    ],
    "rep-104": [
        {
            id: "hist-104-1",
            reportId: "rep-104",
            action: "report_created",
            status: "pending",
            createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        },
        {
            id: "hist-104-2",
            reportId: "rep-104",
            action: "no_action",
            status: "resolved",
            moderatorId: "usr_admin",
            moderator: {
                id: "usr_admin",
                username: "IndieAdmin",
                name: "IndieG Administrator",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieAdmin",
            },
            moderatorNote: "Đã chuyển bài viết về đúng chuyên mục.",
            createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        },
    ],
    "rep-105": [
        {
            id: "hist-105-1",
            reportId: "rep-105",
            action: "report_created",
            status: "pending",
            createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        },
    ],
    "rep-106": [
        {
            id: "hist-106-1",
            reportId: "rep-106",
            action: "report_created",
            status: "pending",
            createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        },
        {
            id: "hist-106-2",
            reportId: "rep-106",
            action: "content_removed",
            status: "resolved",
            moderatorId: "usr_admin",
            moderator: {
                id: "usr_admin",
                username: "IndieAdmin",
                name: "IndieG Administrator",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieAdmin",
            },
            moderatorNote: "Đã gỡ bài đăng trùng lặp và nhắc nhở thành viên.",
            createdAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
        },
    ],
};

export const getMockReports = (params?: { communityId?: string; status?: string }): ReportDto[] => {
    let list = [...MOCK_REPORTS];
    if (params?.communityId) {
        list = list.filter((r) => !r.communityId || r.communityId === params.communityId);
    }
    if (params?.status) {
        list = list.filter((r) => r.status === params.status);
    }
    return list;
};

export const getMockReportById = (id: string): ReportDto | undefined => {
    return MOCK_REPORTS.find((r) => r.id === id);
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
