import type { NotificationDto } from "@/shared/api/types";

/**
 * =========================================================================
 * MOCK NOTIFICATIONS DATA
 * =========================================================================
 * Danh sách thông báo mẫu cho ứng dụng.
 */

export const MOCK_NOTIFICATIONS: NotificationDto[] = [
    {
        id: "notif-1",
        userId: "user-me",
        title: "Lượt thích mới",
        message: "EldenLord_VN đã thích bài viết của bạn trong Red Dead Redemption 2 VN.",
        type: "like",
        read: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        link: "/post/post-5",
    },
    {
        id: "notif-2",
        userId: "user-me",
        title: "Bình luận mới",
        message: "ShadowHunter đã trả lời bình luận của bạn trong Counter-Strike 2 Vietnam.",
        type: "comment",
        read: false,
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        link: "/post/post-1",
    },
    {
        id: "notif-3",
        userId: "user-me",
        title: "Lời mời kết bạn",
        message: "CyberSamurai đã gửi cho bạn một lời mời kết bạn.",
        type: "friend_request",
        read: false,
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        link: "/profile/user-3",
    },
    {
        id: "notif-4",
        userId: "user-me",
        title: "Lời nhắn tường nhà",
        message: "Luna Valkyrie đã để lại một lời nhắn trên sổ lưu bút của bạn.",
        type: "comment",
        read: true,
        createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        link: "/profile/user-me",
    },
    {
        id: "notif-5",
        userId: "user-me",
        title: "Thành tựu mới",
        message: "Chúc mừng bạn đã đạt huy hiệu 'Nhà Thám Hiểm' khi tham gia 5 cộng đồng game!",
        type: "system",
        read: true,
        createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        link: "/profile/user-me",
    },
    {
        id: "notif-6",
        userId: "user-me",
        title: "Thông báo hệ thống",
        message: "Chào mừng bạn đến với mạng xã hội game IndieG! Hãy khám phá các cộng đồng game yêu thích.",
        type: "system",
        read: true,
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        link: "/community",
    },
];
