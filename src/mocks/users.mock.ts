import type { UserProfileDto } from "@/shared/api/types";

/**
 * =========================================================================
 * MOCK USERS & PROFILES DATA
 * =========================================================================
 * Dữ liệu người dùng và profile mẫu cho ứng dụng.
 * Bạn có thể tự thêm người dùng mới bằng cách thêm một object vào mảng MOCK_USERS bên dưới:
 *
 * {
 *   id: "user-new",
 *   username: "ten_dang_nhap",
 *   displayName: "Tên Hiển Thị",
 *   name: "Tên Hiển Thị",
 *   email: "email@example.com",
 *   avatar: "https://url_hinh_anh",
 *   avatarUrl: "https://url_hinh_anh",
 *   bio: "Mô tả bản thân...",
 *   level: 10,
 *   badge: "PRO GAMER",
 *   favoriteGame: "ELDEN RING",
 *   isOnline: true,
 * }
 */

export interface MockUserEntity extends UserProfileDto {
    id: string;
    username: string;
    displayName: string;
    name: string;
    email?: string;
    password?: string;
    avatar: string;
    avatarUrl: string;
    coverUrl?: string;
    bio: string;
    level?: number;
    badge?: string;
    game?: string;
    favoriteGame?: string;
    status?: "online" | "offline" | "in-game" | "banned" | "archived" | string;
    isOnline?: boolean;
    isFriend?: boolean;
    isBanned?: boolean;
    banReason?: string;
    bannedAt?: string;
    archived?: boolean;
    archivedAt?: string;
    followersCount?: number;
    followingCount?: number;
    postsCount?: number;
    friendsCount?: number;
    karma?: number;
    role?: string;
}

export const MOCK_CURRENT_USER: MockUserEntity = {
    id: "user-me",
    userId: "user-me",
    username: "IndieGamer",
    displayName: "Indie Gamer Pro",
    name: "Indie Gamer Pro",
    email: "gamer@indieg.com",
    password: "Gamer123!",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieGamer",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieGamer",
    coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/ss_ef98db5d5a4d877531a5567df082b0fb62d75c80.1920x1080.jpg",
    bio: "Đam mê game Indie, Hardcore RPG và bắn súng chiến thuật CS2. Luôn sẵn sàng lập squad leo rank!",
    level: 25,
    badge: "VIP FOUNDER",
    game: "Counter-Strike 2",
    favoriteGame: "Counter-Strike 2",
    status: "online",
    isOnline: true,
    isFriend: false,
    followersCount: 1420,
    followingCount: 380,
    postsCount: 28,
    friendsCount: 45,
    karma: 3500,
    role: "user",
    isVerified: true,
};

export const MOCK_ADMIN_USER: MockUserEntity = {
    id: "usr_admin",
    userId: "usr_admin",
    username: "IndieAdmin",
    displayName: "IndieG Administrator",
    name: "IndieG Administrator",
    email: "admin@indieg.com",
    password: "Admin123!",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieAdmin",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieAdmin",
    coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/ss_ef98db5d5a4d877531a5567df082b0fb62d75c80.1920x1080.jpg",
    bio: "Quản trị viên trưởng IndieG Gaming Community. Hỗ trợ sự kiện, kiểm duyệt nội dung và giải đấu Esports.",
    level: 99,
    badge: "SYSTEM ADMIN",
    game: "Counter-Strike 2",
    favoriteGame: "Counter-Strike 2",
    status: "online",
    isOnline: true,
    isFriend: false,
    followersCount: 15400,
    followingCount: 50,
    postsCount: 120,
    friendsCount: 200,
    karma: 50000,
    role: "admin",
    isVerified: true,
};

export const MOCK_UNVERIFIED_USER: MockUserEntity = {
    id: "usr_unverified",
    userId: "usr_unverified",
    username: "NewPlayer99",
    displayName: "New Player 99",
    name: "New Player 99",
    email: "unverified@indieg.com",
    password: "User123!",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=NewPlayer",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=NewPlayer",
    bio: "Game thủ mới tham gia IndieG, chưa xác thực địa chỉ email.",
    level: 1,
    badge: "NOVICE",
    game: "Raft",
    favoriteGame: "Raft",
    status: "online",
    isOnline: true,
    isFriend: false,
    followersCount: 5,
    followingCount: 12,
    postsCount: 1,
    friendsCount: 2,
    karma: 10,
    role: "user",
    isVerified: false,
};

export const MOCK_STREAMER_USER: MockUserEntity = {
    id: "user-streamer",
    userId: "user-streamer",
    username: "LunaStream",
    displayName: "Luna Valkyrie",
    name: "Luna Valkyrie",
    email: "streamer@indieg.com",
    password: "Stream123!",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=LunaValkyrie",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=LunaValkyrie",
    coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/ss_d1a8f5a69155c3186c65d1da90491fcfd43663d9.1920x1080.jpg",
    bio: "Creator & Streamer đam mê các dòng game Indie Co-op và Souls-like. Phát sóng định kỳ 20h hằng ngày!",
    level: 35,
    badge: "VERIFIED CREATOR",
    game: "Raft",
    favoriteGame: "Raft",
    status: "online",
    isOnline: true,
    isFriend: true,
    followersCount: 6800,
    followingCount: 150,
    postsCount: 88,
    friendsCount: 110,
    karma: 12000,
    role: "user",
    isVerified: true,
};

export const MOCK_USERS: MockUserEntity[] = [
    MOCK_CURRENT_USER,
    MOCK_ADMIN_USER,
    MOCK_UNVERIFIED_USER,
    MOCK_STREAMER_USER,
    {
        id: "user-1",
        userId: "user-1",
        username: "EldenLord_VN",
        displayName: "EldenLord_VN",
        name: "EldenLord_VN",
        email: "eldenlord@gmail.com",
        password: "Souls123!",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/ss_d1a8f5a69155c3186c65d1da90491fcfd43663d9.1920x1080.jpg",
        bio: "Chiến binh Tarnished rong ruổi The Lands Between. Chuyên gia hướng dẫn build và lore Souls-like.",
        level: 42,
        badge: "SOULS MASTER",
        game: "ELDEN RING",
        favoriteGame: "ELDEN RING",
        status: "in-game",
        isOnline: true,
        isFriend: true,
        followersCount: 2890,
        followingCount: 120,
        postsCount: 64,
        friendsCount: 92,
        karma: 8900,
        isVerified: true,
    },
    {
        id: "user-2",
        userId: "user-2",
        username: "ShadowHunter",
        displayName: "ShadowHunter",
        name: "ShadowHunter",
        email: "shadowhunter@fps.io",
        password: "Shadow123!",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowHunter",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowHunter",
        bio: "Tuyển thủ FPS chiến thuật & IGL. Top 1% CS2 Premier rating 22,000+.",
        level: 38,
        badge: "VERIFIED PRO",
        game: "Counter-Strike 2",
        favoriteGame: "Counter-Strike 2",
        status: "online",
        isOnline: true,
        isFriend: true,
        followersCount: 3500,
        followingCount: 210,
        postsCount: 45,
        friendsCount: 120,
        karma: 6400,
        isVerified: true,
    },
    {
        id: "user-3",
        userId: "user-3",
        username: "CyberSamurai",
        displayName: "CyberSamurai",
        name: "CyberSamurai",
        email: "cybersamurai@nightcity.net",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberSamurai",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberSamurai",
        bio: "Night City nomad. Nghiện ngắm đồ họa Ray Tracing Overdrive và modding game.",
        level: 19,
        badge: "NIGHT CITY LEGEND",
        game: "Cyberpunk 2077",
        favoriteGame: "Cyberpunk 2077",
        status: "online",
        isOnline: true,
        isFriend: false,
        followersCount: 890,
        followingCount: 340,
        postsCount: 15,
        friendsCount: 33,
        karma: 2100,
    },
    {
        id: "user-4",
        userId: "user-4",
        username: "PixelCraft",
        displayName: "PixelCraft",
        name: "PixelCraft",
        email: "pixelcraft@indiedev.com",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=PixelCraft",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=PixelCraft",
        bio: "Indie Game Developer. Làm game bằng Godot & Unity, yêu thích pixel art và game sinh tồn.",
        level: 22,
        badge: "CREATOR",
        game: "Raft",
        favoriteGame: "Raft",
        status: "offline",
        isOnline: false,
        isFriend: false,
        followersCount: 1250,
        followingCount: 95,
        postsCount: 32,
        friendsCount: 41,
        karma: 4300,
    },
    {
        id: "user-5",
        userId: "user-5",
        username: "RanniTheWitch",
        displayName: "Ranni The Witch",
        name: "Ranni The Witch",
        email: "ranni@stars.net",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Ranni",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Ranni",
        bio: "Kỷ nguyên của các vì sao (Age of Stars). Thích chia sẻ ảnh chụp gameplay và phân tích cốt truyện.",
        level: 30,
        badge: "LORE SCHOLAR",
        game: "ELDEN RING",
        favoriteGame: "ELDEN RING",
        status: "online",
        isOnline: true,
        isFriend: false,
        followersCount: 4100,
        followingCount: 88,
        postsCount: 50,
        friendsCount: 67,
        karma: 9200,
    },
    {
        id: "usr_banned_cheater",
        userId: "usr_banned_cheater",
        username: "viper_cheats",
        displayName: "ViperCS Hacks",
        name: "ViperCS Hacks",
        email: "cheater@hacks.net",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ViperCheats",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ViperCheats",
        bio: "[TÀI KHOẢN ĐÃ BỊ KHÓA] Vi phạm điều khoản dịch vụ IndieG: Sử dụng phần mềm can thiệp bộ nhớ (Cheat/Hack) trong game CS2 và phát tán liên kết độc hại.",
        level: 8,
        badge: "BANNED",
        game: "Counter-Strike 2",
        favoriteGame: "Counter-Strike 2",
        status: "banned",
        isOnline: false,
        isFriend: false,
        isBanned: true,
        banReason: "Gian lận phần mềm (Hack/Cheat) & phát tán công cụ can thiệp bộ nhớ CS2",
        bannedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        followersCount: 12,
        followingCount: 3,
        postsCount: 2,
        friendsCount: 0,
        karma: -350,
        role: "user",
    },
    {
        id: "usr_banned_toxic",
        userId: "usr_banned_toxic",
        username: "toxichunter99",
        displayName: "Toxic Hunter",
        name: "Toxic Hunter",
        email: "toxic99@flame.com",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ToxicHunter",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ToxicHunter",
        bio: "[TÀI KHOẢN ĐÃ BỊ KHÓA] Xúc phạm danh dự thành viên khác, quấy rối và phát ngôn thù địch liên tục trong các giải đấu cộng đồng.",
        level: 14,
        badge: "SUSPENDED",
        game: "Counter-Strike 2",
        favoriteGame: "Counter-Strike 2",
        status: "banned",
        isOnline: false,
        isFriend: false,
        isBanned: true,
        banReason: "Ngôn từ thù địch, xúc phạm thành viên nhiều lần và quấy rối giải đấu",
        bannedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        followersCount: 45,
        followingCount: 110,
        postsCount: 18,
        friendsCount: 5,
        karma: -120,
        role: "user",
    },
    {
        id: "usr_archived_veteran",
        userId: "usr_archived_veteran",
        username: "oldmaster_2016",
        displayName: "Old Master CS",
        name: "Old Master CS",
        email: "veteran@legend.vn",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=OldMaster",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=OldMaster",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/ss_ef98db5d5a4d877531a5567df082b0fb62d75c80.1920x1080.jpg",
        bio: "Hồ sơ đã được lưu trữ (Archived Account). Cựu đội trưởng team CS:GO vô địch giải đấu bán chuyên 2018. Đã giải nghệ khỏi thi đấu chuyên nghiệp.",
        level: 50,
        badge: "HALL OF FAME",
        game: "Counter-Strike 2",
        favoriteGame: "Counter-Strike 2",
        status: "archived",
        isOnline: false,
        isFriend: false,
        archived: true,
        archivedAt: "2025-12-31T23:59:59Z",
        followersCount: 18900,
        followingCount: 24,
        postsCount: 340,
        friendsCount: 180,
        karma: 42000,
        role: "user",
        isVerified: true,
    },
    {
        id: "usr_archived_inactive",
        userId: "usr_archived_inactive",
        username: "dormant_panda",
        displayName: "Dormant Panda",
        name: "Dormant Panda",
        email: "dormant@sleepy.io",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=DormantPanda",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=DormantPanda",
        bio: "Hồ sơ đã lưu trữ (Archived) theo nguyện vọng của chủ tài khoản. Tất cả thông báo và tương tác trực tiếp đã tạm dừng.",
        level: 12,
        badge: "RETIRED",
        game: "Raft",
        favoriteGame: "Raft",
        status: "archived",
        isOnline: false,
        isFriend: false,
        archived: true,
        archivedAt: "2026-03-15T08:00:00Z",
        followersCount: 210,
        followingCount: 45,
        postsCount: 14,
        friendsCount: 18,
        karma: 580,
        role: "user",
    },
];

export const getMockUserById = (id?: string | number): MockUserEntity => {
    const idStr = String(id || "");
    if (idStr === "me" || idStr === "user-me") return MOCK_CURRENT_USER;
    const found = MOCK_USERS.find((u) => String(u.id) === idStr || String(u.userId) === idStr);
    return found || MOCK_CURRENT_USER;
};

export interface MockGuestbookCommentItem {
    id: string;
    profileId: string;
    authorId: string;
    author: {
        id: string;
        username: string;
        displayName: string;
        name: string;
        avatarUrl: string;
        avatar: string;
    };
    authorName: string;
    authorUsername: string;
    authorAvatar: string;
    content: string;
    likes: number;
    createdAt: string;
    updatedAt: string;
}

export const MOCK_GUESTBOOK_COMMENTS: Record<string, MockGuestbookCommentItem[]> = {
    "user-me": [
        {
            id: "gb-me-1",
            profileId: "user-me",
            authorId: "user-1",
            author: {
                id: "user-1",
                username: "eldenlord",
                displayName: "EldenLord_VN",
                name: "EldenLord_VN",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
                avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
            },
            authorName: "EldenLord_VN",
            authorUsername: "eldenlord",
            authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
            content: "Chào người anh em! Khi nào rảnh làm ván Elden Ring co-op quẩy boss nhé!",
            likes: 6,
            createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        },
        {
            id: "gb-me-2",
            profileId: "user-me",
            authorId: "user-2",
            author: {
                id: "user-2",
                username: "shadowhunter",
                displayName: "ShadowHunter",
                name: "ShadowHunter",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowHunter",
                avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowHunter",
            },
            authorName: "ShadowHunter",
            authorUsername: "shadowhunter",
            authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowHunter",
            content: "Aim CS2 dạo này bén ghê, hôm nào vào làm trận Premier kéo rank 20k nhé bro!",
            likes: 4,
            createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        },
        {
            id: "gb-me-3",
            profileId: "user-me",
            authorId: "user-streamer",
            author: {
                id: "user-streamer",
                username: "LunaStream",
                displayName: "Luna Valkyrie",
                name: "Luna Valkyrie",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=LunaValkyrie",
                avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=LunaValkyrie",
            },
            authorName: "Luna Valkyrie",
            authorUsername: "LunaStream",
            authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=LunaValkyrie",
            content: "Ghé thăm tường nhà bạn! Chúc bạn có những giờ phút chơi game thật vui vẻ trên IndieG!",
            likes: 8,
            createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
        },
    ],
    "user-1": [
        {
            id: "gb-u1-1",
            profileId: "user-1",
            authorId: "user-me",
            author: {
                id: "user-me",
                username: "IndieGamer",
                displayName: "Indie Gamer Pro",
                name: "Indie Gamer Pro",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieGamer",
                avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieGamer",
            },
            authorName: "Indie Gamer Pro",
            authorUsername: "IndieGamer",
            authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieGamer",
            content: "Build Bleed của bác hướng dẫn đỉnh thực sự, nhờ thế mà mình vừa solo xong Radahn!",
            likes: 9,
            createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        },
        {
            id: "gb-u1-2",
            profileId: "user-1",
            authorId: "user-5",
            author: {
                id: "user-5",
                username: "RanniTheWitch",
                displayName: "Ranni The Witch",
                name: "Ranni The Witch",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Ranni",
                avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Ranni",
            },
            authorName: "Ranni The Witch",
            authorUsername: "RanniTheWitch",
            authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Ranni",
            content: "Chào vị Tân Vương Elden Lord tương lai, hãy tiếp tục lan tỏa tình yêu Souls-like nhé!",
            likes: 15,
            createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
        },
    ],
    "user-2": [
        {
            id: "gb-u2-1",
            profileId: "user-2",
            authorId: "usr_admin",
            author: {
                id: "usr_admin",
                username: "IndieAdmin",
                displayName: "IndieG Administrator",
                name: "IndieG Administrator",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieAdmin",
                avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieAdmin",
            },
            authorName: "IndieG Administrator",
            authorUsername: "IndieAdmin",
            authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieAdmin",
            content: "Chúc mừng bạn đã đạt rating 22k Premier! Sắp tới IndieG có giải đấu nội bộ, mời bạn tham gia làm đội trưởng nhé!",
            likes: 12,
            createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        },
    ],
};

export const getMockGuestbookCommentsByProfileId = (profileId?: string): MockGuestbookCommentItem[] => {
    const key = String(profileId || "user-me");
    if (key === "me" || key === "user-me") {
        return MOCK_GUESTBOOK_COMMENTS["user-me"] || [];
    }
    return MOCK_GUESTBOOK_COMMENTS[key] || MOCK_GUESTBOOK_COMMENTS["user-me"] || [];
};

export const addMockGuestbookComment = (profileId: string, comment: MockGuestbookCommentItem): void => {
    const key = profileId === "me" ? "user-me" : profileId;
    if (!MOCK_GUESTBOOK_COMMENTS[key]) {
        MOCK_GUESTBOOK_COMMENTS[key] = [];
    }
    MOCK_GUESTBOOK_COMMENTS[key].unshift(comment);
};

