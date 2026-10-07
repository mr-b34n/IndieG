import type { UserProfileDto } from "@/shared/api/types";

/**
 * =========================================================================
 * MOCK USERS & PROFILES DATA
 * =========================================================================
 * Dữ liệu người dùng và profile mẫu phong phú cho IndieG Gaming Platform.
 */

export interface MockUserEntity extends UserProfileDto {
    id: string;
    userId: string;
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
    discordTag?: string;
    steamProfile?: string;
    twitchUrl?: string;
    youtubeUrl?: string;
    location?: string;
    joinedAt?: string;
    battlestation?: {
        cpu?: string;
        gpu?: string;
        ram?: string;
        storage?: string;
        monitor?: string;
        mouse?: string;
        keyboard?: string;
        headset?: string;
        mousepad?: string;
        chair?: string;
    };
    esportsStats?: {
        hoursPlayed?: number;
        winRate?: number;
        kda?: number;
        mvpRate?: number;
        topRank?: string;
    };
    achievements?: { id: string; name: string; description: string; icon: string; earnedAt: string }[];
}

// =========================================================================
// MAIN ACCOUNTS (used as DEV auth switcher accounts)
// =========================================================================

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
    bio: "Đam mê game Indie & Hardcore RPG. Mê tìm bạn lập squad leo rank CS2 Premier. Cày ngày cày đêm vì niềm vui gaming thuần túy!",
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
    discordTag: "IndieGamer#7412",
    steamProfile: "https://steamcommunity.com/id/indiegamervn",
    twitchUrl: "https://twitch.tv/indiegamervn",
    location: "TP. Hồ Chí Minh, Việt Nam",
    joinedAt: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString(),
    battlestation: {
        cpu: "Intel Core i9-14900KF",
        gpu: "NVIDIA GeForce RTX 4080 Super 16GB",
        ram: "Corsair Dominator 64GB DDR5 6000MHz",
        storage: "Samsung 990 Pro 2TB NVMe SSD",
        monitor: "ASUS ROG Swift Pro PG248QP 360Hz 24.1\" FHD",
        mouse: "Logitech G Pro X Superlight 2 DEX",
        keyboard: "Ducky One 3 Mini RGB (Cherry MX Speed Silver)",
        headset: "Beyerdynamic MMX 300 Pro",
        mousepad: "Artisan FX Zero (XL Soft)",
        chair: "Herman Miller Embody Gaming",
    },
    esportsStats: {
        hoursPlayed: 2840,
        winRate: 58.4,
        kda: 1.32,
        mvpRate: 24.1,
        topRank: "Master (19,850 ELO)",
    },
    achievements: [
        { id: "ach-1", name: "VIP Founder", description: "Tham gia IndieG ngay từ ngày đầu ra mắt", icon: "🏆", earnedAt: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString() },
        { id: "ach-2", name: "Squad Leader", description: "Tạo và dẫn dắt 10 trận đấu Squad thành công", icon: "⚔️", earnedAt: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString() },
        { id: "ach-3", name: "Community Builder", description: "Đã tạo 1 cộng đồng đạt 1,000 thành viên", icon: "🌐", earnedAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString() },
    ],
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
    coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/ss_796601d9d67faf53486eeb26d0724347cea67ddc.1920x1080.jpg",
    bio: "Quản trị viên trưởng IndieG Gaming Community. Tổ chức sự kiện, kiểm duyệt nội dung và vận hành các giải đấu Esports nội bộ.",
    level: 99,
    badge: "SYSTEM ADMIN",
    game: "Counter-Strike 2",
    favoriteGame: "Counter-Strike 2",
    status: "online",
    isOnline: true,
    isFriend: false,
    followersCount: 15400,
    followingCount: 50,
    postsCount: 320,
    friendsCount: 200,
    karma: 50000,
    role: "admin",
    isVerified: true,
    discordTag: "IndieG Admin#0001",
    location: "Hà Nội, Việt Nam",
    joinedAt: new Date(Date.now() - 730 * 24 * 3600 * 1000).toISOString(),
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
    bio: "Game thủ mới tham gia IndieG, đang khám phá các cộng đồng game. Email chưa được xác thực.",
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
    location: "Đà Nẵng, Việt Nam",
    joinedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
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
    bio: "Content Creator & Full-time Streamer. Mê game Indie Co-op và Souls-like. Phát sóng định kỳ 20:00 - 01:00 hằng ngày. Theo dõi để không bỏ lỡ stream nhé!",
    level: 35,
    badge: "VERIFIED CREATOR",
    game: "Hollow Knight: Silksong",
    favoriteGame: "Hollow Knight: Silksong",
    status: "online",
    isOnline: true,
    isFriend: true,
    followersCount: 8200,
    followingCount: 180,
    postsCount: 142,
    friendsCount: 130,
    karma: 18500,
    role: "user",
    isVerified: true,
    discordTag: "LunaStream#9527",
    twitchUrl: "https://twitch.tv/lunavalkyrie",
    youtubeUrl: "https://youtube.com/@lunavalkyrie",
    location: "Hà Nội, Việt Nam",
    joinedAt: new Date(Date.now() - 500 * 24 * 3600 * 1000).toISOString(),
    battlestation: {
        cpu: "AMD Ryzen 9 7950X3D",
        gpu: "NVIDIA GeForce RTX 4090 24GB",
        ram: "G.Skill Trident Z5 RGB 64GB DDR5 6400MHz",
        storage: "WD Black SN850X 4TB NVMe SSD",
        monitor: "LG 27GP950-B 4K 160Hz 27\" Nano IPS",
        mouse: "Razer DeathAdder V3 HyperSpeed",
        keyboard: "Anne Pro 2 RGB (Gateron Brown Optical)",
        headset: "SteelSeries Arctis Nova Pro Wireless",
        mousepad: "HyperX Fury S Pro XL",
        chair: "Secretlab TITAN Evo 2022 Series",
    },
    esportsStats: {
        hoursPlayed: 4200,
        winRate: 62.8,
        kda: 1.85,
        mvpRate: 31.4,
        topRank: "Master (21,200 ELO CS2)",
    },
};

// =========================================================================
// COMMUNITY USERS
// =========================================================================

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
        email: "eldenlord@soulsborne.vn",
        password: "Souls123!",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/capsule_616x353.jpg",
        bio: "Chiến binh Tarnished rong ruổi The Lands Between. Chuyên gia hướng dẫn build, lore phân tích và chiến thuật Souls-like cho người mới. 🏆 Platinum ELDEN RING + DLC Shadow of the Erdtree.",
        level: 42,
        badge: "SOULS MASTER",
        game: "ELDEN RING",
        favoriteGame: "ELDEN RING",
        status: "in-game",
        isOnline: true,
        isFriend: true,
        followersCount: 4320,
        followingCount: 145,
        postsCount: 98,
        friendsCount: 112,
        karma: 12800,
        role: "user",
        isVerified: true,
        discordTag: "EldenLord#1337",
        steamProfile: "https://steamcommunity.com/id/eldenlordvn",
        location: "Hà Nội, Việt Nam",
        joinedAt: new Date(Date.now() - 600 * 24 * 3600 * 1000).toISOString(),
        battlestation: {
            cpu: "AMD Ryzen 9 7900X",
            gpu: "NVIDIA GeForce RTX 4070 Ti Super 16GB",
            ram: "Corsair Vengeance RGB 32GB DDR5 5600MHz",
            storage: "Samsung 980 Pro 2TB NVMe SSD",
            monitor: "Samsung Odyssey G7 27\" 240Hz 1440p Curved",
            mouse: "Razer Viper Ultimate Wireless",
            keyboard: "Keychron Q1 Pro (Gateron G Pro Red)",
            headset: "HyperX Cloud III Wireless",
            mousepad: "SteelSeries QcK Prism XL",
            chair: "DXRacer Formula Series Classic (Black/Blue)",
        },
        esportsStats: {
            hoursPlayed: 3800,
            winRate: 0,
            kda: 0,
            mvpRate: 0,
            topRank: "Tarnished Grandmaster (NG+7)",
        },
    },
    {
        id: "user-2",
        userId: "user-2",
        username: "ShadowHunter",
        displayName: "ShadowHunter",
        name: "ShadowHunter",
        email: "shadowhunter@fps.pro",
        password: "Shadow123!",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowHunter",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowHunter",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/ss_ef98db5d5a4d877531a5567df082b0fb62d75c80.1920x1080.jpg",
        bio: "Ex-tuyển thủ FPS bán chuyên | IGL chuyên nghiệp | CS2 Premier 22,000+ ELO | Top 1% Global. Sẵn sàng duo queue và chia sẻ lineup Nades miễn phí.",
        level: 38,
        badge: "VERIFIED PRO",
        game: "Counter-Strike 2",
        favoriteGame: "Counter-Strike 2",
        status: "in-game",
        isOnline: true,
        isFriend: true,
        followersCount: 5800,
        followingCount: 240,
        postsCount: 67,
        friendsCount: 155,
        karma: 9600,
        role: "user",
        isVerified: true,
        discordTag: "ShadowHunter#4201",
        steamProfile: "https://steamcommunity.com/id/shadowhuntervn",
        location: "TP. Hồ Chí Minh, Việt Nam",
        joinedAt: new Date(Date.now() - 720 * 24 * 3600 * 1000).toISOString(),
        battlestation: {
            cpu: "Intel Core i7-14700K",
            gpu: "NVIDIA GeForce RTX 4070 Super 12GB",
            ram: "G.Skill Ripjaws V 32GB DDR5 6000MHz",
            storage: "Crucial T700 2TB NVMe Gen5 SSD",
            monitor: "ASUS ROG Swift Pro PG248QP 540Hz 24.1\" FHD",
            mouse: "Logitech G Pro X Superlight 2 (White)",
            keyboard: "Wooting 60HE (Lekker Linear 45)",
            headset: "Sennheiser HD 560S + Antlion ModMic Wireless",
            mousepad: "Artisan Hien (XL Mid)",
            chair: "Herman Miller Aeron Size C",
        },
        esportsStats: {
            hoursPlayed: 5200,
            winRate: 63.7,
            kda: 1.54,
            mvpRate: 28.9,
            topRank: "Global Elite / 22,100 Premier ELO",
        },
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
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/ss_c56cbb0eb0c50d4f1fe17dbd8a1f73602d338f07.1920x1080.jpg",
        bio: "Night City Nomad. Nghiện ngắm đồ họa Ray Tracing Overdrive, modding Cyberpunk 2077 và khám phá build Netrunner. V đường phố thuần chủng.",
        level: 19,
        badge: "NIGHT CITY LEGEND",
        game: "Cyberpunk 2077",
        favoriteGame: "Cyberpunk 2077",
        status: "online",
        isOnline: true,
        isFriend: false,
        followersCount: 1240,
        followingCount: 380,
        postsCount: 24,
        friendsCount: 42,
        karma: 3100,
        isVerified: false,
        location: "Đà Nẵng, Việt Nam",
        joinedAt: new Date(Date.now() - 200 * 24 * 3600 * 1000).toISOString(),
        battlestation: {
            cpu: "Intel Core i9-13900K",
            gpu: "NVIDIA GeForce RTX 4090 24GB Founders Edition",
            ram: "Corsair Dominator Platinum 64GB DDR5 6200MHz",
            storage: "Samsung 990 Pro 4TB NVMe SSD",
            monitor: "LG OLED 27GR95QE 27\" 1440p 240Hz OLED",
            mouse: "Razer Basilisk V3 Pro",
            keyboard: "Ducky One 3 Daybreak TKL (Cherry MX Blue)",
            headset: "Audeze Maxwell Wireless",
            mousepad: "Logitech G840 XL",
            chair: "Maxnomic Pro Chief Gaming Chair",
        },
    },
    {
        id: "user-4",
        userId: "user-4",
        username: "PixelCraft",
        displayName: "PixelCraft",
        name: "PixelCraft",
        email: "pixelcraft@indiedev.vn",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=PixelCraft",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=PixelCraft",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/648800/capsule_616x353.jpg",
        bio: "Indie Game Developer 🎮 | Làm game bằng Godot 4 & Unity 6. Yêu thích pixel art, roguelikes và game sinh tồn. Đang phát triển tựa game sinh tồn đầu tiên của mình!",
        level: 22,
        badge: "INDIE CREATOR",
        game: "Raft",
        favoriteGame: "Raft",
        status: "offline",
        isOnline: false,
        isFriend: false,
        followersCount: 2100,
        followingCount: 110,
        postsCount: 48,
        friendsCount: 56,
        karma: 6200,
        isVerified: true,
        twitchUrl: "https://twitch.tv/pixelcraftvn",
        youtubeUrl: "https://youtube.com/@pixelcraftvn",
        location: "Hải Phòng, Việt Nam",
        joinedAt: new Date(Date.now() - 400 * 24 * 3600 * 1000).toISOString(),
        battlestation: {
            cpu: "AMD Ryzen 7 7800X3D",
            gpu: "AMD Radeon RX 7900 XTX 24GB",
            ram: "Kingston Fury Beast 32GB DDR5 5200MHz",
            storage: "Seagate FireCuda 530 2TB NVMe SSD",
            monitor: "Samsung Odyssey G5 34\" UWQHD 165Hz Curved",
            mouse: "SteelSeries Rival 650 Wireless",
            keyboard: "Nuphy Air75 V2 (Wisteria Low-Profile)",
            headset: "EPOS H3PRO Hybrid",
            mousepad: "IQUNIX Skylar RGB (XL)",
        },
    },
    {
        id: "user-5",
        userId: "user-5",
        username: "RanniTheWitch",
        displayName: "Ranni The Witch",
        name: "Ranni The Witch",
        email: "ranni@ageofdarkstars.net",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Ranni",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Ranni",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/ss_49969dd4ae47a3219ee944ab8b958c2be653f545.1920x1080.jpg",
        bio: "Đệ nhất học sĩ Kỷ nguyên Các Vì Sao 🌙 | Thích chia sẻ ảnh chụp gameplay đẹp và phân tích lore sâu về các tựa game FromSoftware. Spellblade & Frost build enthusiast.",
        level: 30,
        badge: "LORE SCHOLAR",
        game: "ELDEN RING",
        favoriteGame: "ELDEN RING",
        status: "online",
        isOnline: true,
        isFriend: false,
        followersCount: 5600,
        followingCount: 92,
        postsCount: 74,
        friendsCount: 88,
        karma: 13400,
        isVerified: true,
        steamProfile: "https://steamcommunity.com/id/rannivn",
        location: "Cần Thơ, Việt Nam",
        joinedAt: new Date(Date.now() - 450 * 24 * 3600 * 1000).toISOString(),
    },
    {
        id: "user-6",
        userId: "user-6",
        username: "ApexPredator_VN",
        displayName: "Apex Predator VN",
        name: "Apex Predator VN",
        email: "apex@battle.gg",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ApexPredator",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ApexPredator",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1172470/capsule_616x353.jpg",
        bio: "Apex Legends Predator S20. Main: Pathfinder & Wraith. Chuyên Movement Tech: Bunny Hop, Superglide, Mantle Jump. Tìm duo/trio team dành cho ALGS mùa mới!",
        level: 28,
        badge: "APEX PREDATOR",
        game: "Apex Legends",
        favoriteGame: "Apex Legends",
        status: "in-game",
        isOnline: true,
        isFriend: true,
        followersCount: 3100,
        followingCount: 220,
        postsCount: 52,
        friendsCount: 78,
        karma: 7400,
        isVerified: true,
        discordTag: "ApexPredator_VN#2024",
        location: "TP. Hồ Chí Minh, Việt Nam",
        joinedAt: new Date(Date.now() - 300 * 24 * 3600 * 1000).toISOString(),
        esportsStats: {
            hoursPlayed: 3100,
            winRate: 12.4,
            kda: 4.82,
            mvpRate: 38.6,
            topRank: "Apex Predator (13,200 RP)",
        },
    },
    {
        id: "user-7",
        userId: "user-7",
        username: "GenshinArchon",
        displayName: "Genshin Archon",
        name: "Genshin Archon",
        email: "archon@teyvat.world",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=GenshinArchon",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=GenshinArchon",
        coverUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&auto=format&fit=crop&q=80",
        bio: "Nhà Lữ Hành AR60 | Collector toàn nhân vật & vũ khí 5 sao | Chuyên La Hoàn 36 sao mỗi tháng. Chia sẻ team comp tối ưu, artifact builds và pull history.",
        level: 16,
        badge: "AR60 ARCHON",
        game: "Genshin Impact",
        favoriteGame: "Genshin Impact",
        status: "online",
        isOnline: true,
        isFriend: false,
        followersCount: 2800,
        followingCount: 165,
        postsCount: 41,
        friendsCount: 64,
        karma: 5200,
        isVerified: true,
        location: "Hà Nội, Việt Nam",
        joinedAt: new Date(Date.now() - 250 * 24 * 3600 * 1000).toISOString(),
    },
    {
        id: "user-8",
        userId: "user-8",
        username: "WukongDestined",
        displayName: "Wukong Destined One",
        name: "Wukong Destined One",
        email: "destined@journey.west",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=WukongDestined",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=WukongDestined",
        coverUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/capsule_616x353.jpg",
        bio: "Đã hoàn thành 81 Kiếp Nạn trên NG+3 | Collector toàn Cuill/Loại/Khung | Nghiện speedrun và challenge run không nhận thưởng. Cộng đồng Thiên Mệnh Nhân Việt Nam đây!",
        level: 33,
        badge: "CELESTIAL KING",
        game: "Black Myth: Wukong",
        favoriteGame: "Black Myth: Wukong",
        status: "online",
        isOnline: true,
        isFriend: false,
        followersCount: 3800,
        followingCount: 200,
        postsCount: 56,
        friendsCount: 95,
        karma: 8900,
        isVerified: true,
        steamProfile: "https://steamcommunity.com/id/wukongdestined",
        location: "Huế, Việt Nam",
        joinedAt: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString(),
    },
    // ========== Special Accounts ==========
    {
        id: "usr_banned_cheater",
        userId: "usr_banned_cheater",
        username: "viper_cheats",
        displayName: "ViperCS Hacks",
        name: "ViperCS Hacks",
        email: "cheater@hacks.net",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ViperCheats",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ViperCheats",
        bio: "[TÀI KHOẢN ĐÃ BỊ KHÓA] Vi phạm điều khoản dịch vụ IndieG: Sử dụng phần mềm can thiệp bộ nhớ (Cheat/Hack) trong CS2 và phát tán công cụ hack.",
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
        bio: "[TÀI KHOẢN ĐÃ BỊ KHÓA] Xúc phạm danh dự thành viên khác, quấy rối và phát ngôn thù địch liên tục trong các sự kiện cộng đồng và giải đấu.",
        level: 14,
        badge: "SUSPENDED",
        game: "Counter-Strike 2",
        favoriteGame: "Counter-Strike 2",
        status: "banned",
        isOnline: false,
        isFriend: false,
        isBanned: true,
        banReason: "Ngôn từ thù địch, xúc phạm thành viên nhiều lần và quấy rối giải đấu nội bộ",
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
        bio: "Hồ sơ đã được lưu trữ (Archived). Cựu đội trưởng team CS:GO vô địch giải đấu bán chuyên khu vực miền Bắc năm 2018-2019. Đã giải nghệ khỏi thi đấu chuyên nghiệp.",
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

// =========================================================================
// GUESTBOOK DATA
// =========================================================================

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
                username: "EldenLord_VN",
                displayName: "EldenLord_VN",
                name: "EldenLord_VN",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
                avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
            },
            authorName: "EldenLord_VN",
            authorUsername: "EldenLord_VN",
            authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
            content: "GG bro! Tối nay mình duo CS2 Premier không? Rating 20k thì leo thêm lên Ascendant được rồi đấy!",
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
                username: "ShadowHunter",
                displayName: "ShadowHunter",
                name: "ShadowHunter",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowHunter",
                avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowHunter",
            },
            authorName: "ShadowHunter",
            authorUsername: "ShadowHunter",
            authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowHunter",
            content: "Aim CS2 dạo này bén ghê bro! Clip clutch 1v4 Mirage hôm trước xem mà mê luôn. Premier 20k đang chờ!",
            likes: 9,
            createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
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
            content: "Ghé thăm tường nhà người chơi IndieG huyền thoại! Chúc bro sớm 22k Premier ELO nhé! ✨🎮",
            likes: 12,
            createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
        },
        {
            id: "gb-me-4",
            profileId: "user-me",
            authorId: "user-6",
            author: {
                id: "user-6",
                username: "ApexPredator_VN",
                displayName: "Apex Predator VN",
                name: "Apex Predator VN",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ApexPredator",
                avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ApexPredator",
            },
            authorName: "Apex Predator VN",
            authorUsername: "ApexPredator_VN",
            authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ApexPredator",
            content: "Thử Apex Legends chưa bro? Di chuyển chuẩn thì pro FPS như bro học movement tech cực nhanh đấy!",
            likes: 4,
            createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
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
            content: "Build Bleed Arcane của bác hướng dẫn đỉnh thực sự! Nhờ thế mình vừa solo Radahn trong 2 lần thử thôi. Cảm ơn bác nhiều!",
            likes: 11,
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
            content: "Chào vị Tân Vương Elden Lord tương lai! Hãy tiếp tục lan tỏa tình yêu Souls-like ra khắp cộng đồng game Việt Nam nhé! 🌙",
            likes: 18,
            createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
        },
        {
            id: "gb-u1-3",
            profileId: "user-1",
            authorId: "user-8",
            author: {
                id: "user-8",
                username: "WukongDestined",
                displayName: "Wukong Destined One",
                name: "Wukong Destined One",
                avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=WukongDestined",
                avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=WukongDestined",
            },
            authorName: "Wukong Destined One",
            authorUsername: "WukongDestined",
            authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=WukongDestined",
            content: "Anh ơi anh có thử Black Myth: Wukong chưa? Combat hệ đánh boss kiểu Souls-like cực kỳ hay, chắc anh sẽ mê!",
            likes: 7,
            createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
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
            content: "Chúc mừng bạn đã đạt 22k Premier ELO! IndieG đang tổ chức giải đấu nội bộ tháng 10, mình muốn mời bạn làm đội trưởng một team nhé!",
            likes: 15,
            createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        },
        {
            id: "gb-u2-2",
            profileId: "user-2",
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
            content: "Lineup smoke Mirage của bác chuẩn chỉnh quá! Mình áp dụng thử trận tối qua và pass A site trơn tru không sót tên CT nào!",
            likes: 8,
            createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
        },
    ],
    "user-streamer": [
        {
            id: "gb-str-1",
            profileId: "user-streamer",
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
            content: "Stream Hollow Knight tối qua đỉnh thật chị ơi! Nhìn chị đánh Nightmare King Grimm mà hồi hộp cùng, suýt nữa solo xong rồi!",
            likes: 22,
            createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        },
        {
            id: "gb-str-2",
            profileId: "user-streamer",
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
            content: "Xem stream mỗi tối là liều thuốc giải stress sau ngày làm việc mệt mỏi! Cảm ơn chị đã luôn mang năng lượng tích cực cho cộng đồng game VN 💜",
            likes: 31,
            createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
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
