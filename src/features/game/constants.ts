import { type GameData } from "./types";

import {
    GAME_ILLU_BG as gameIlluBg,
} from "@/shared/constants/images";

export const INITIAL_GAMES: GameData[] = [
    {
        slug: "counter-strike-2",
        id: "counter-strike-2",
        appid: 730,
        aliases: ["cs2", "counterstrike2"],
        name: "Counter-Strike 2",
        tag: "Tactical FPS",
        developer: "Valve",
        publisher: "Valve",
        releaseDate: "27 Tháng 9, 2023",
        platforms: ["PC", "Linux"],
        genre: ["Action", "Shooter", "Competitive", "FPS"],
        genres: ["Action", "Shooter", "Competitive", "FPS"],
        ratingScore: 9.2,
        totalReviewsCount: 3120,
        sentiment: "Very Positive",
        sentimentVi: "Rất tích cực",
        logoUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/capsule_616x353.jpg",
        bannerUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/header.jpg",
        communityId: "cs2-vietnam",
        steamUrl: "https://store.steampowered.com/app/730/CounterStrike_2/",
        description: "Huyền thoại bắn súng chiến thuật đỉnh cao của Valve với engine Source 2 và hệ thống sub-tick tân tiến.",
        descriptionVi: "Huyền thoại bắn súng chiến thuật đỉnh cao của Valve với engine Source 2 và hệ thống sub-tick tân tiến."
    },
    {
        slug: "elden-ring",
        id: "elden-ring",
        appid: 1245620,
        aliases: ["eldenring"],
        name: "ELDEN RING",
        tag: "Souls-like Action RPG",
        developer: "FromSoftware Inc.",
        publisher: "Bandai Namco Entertainment",
        releaseDate: "25 Tháng 2, 2022",
        platforms: ["PC", "PS5", "Xbox Series X"],
        genre: ["Action", "RPG", "Open World", "Souls-like"],
        genres: ["Action", "RPG", "Open World", "Souls-like"],
        ratingScore: 9.6,
        totalReviewsCount: 4500,
        sentiment: "Overwhelmingly Positive",
        sentimentVi: "Cực kỳ tích cực",
        logoUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/capsule_616x353.jpg",
        bannerUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
        communityId: "elden-ring-vietnam",
        steamUrl: "https://store.steampowered.com/app/1245620/ELDEN_RING/",
        description: "Siêu phẩm nhập vai hành động thế giới mở đạt giải Game of the Year của Hidetaka Miyazaki và George R.R. Martin.",
        descriptionVi: "Siêu phẩm nhập vai hành động thế giới mở đạt giải Game of the Year của Hidetaka Miyazaki và George R.R. Martin."
    },
    {
        slug: "black-myth-wukong",
        id: "black-myth-wukong",
        appid: 2358720,
        aliases: ["wukong", "bmw"],
        name: "Black Myth: Wukong",
        tag: "Action RPG",
        developer: "Game Science",
        publisher: "Game Science",
        releaseDate: "20 Tháng 8, 2024",
        platforms: ["PC", "PS5"],
        genre: ["Action", "RPG", "Adventure", "Mythology"],
        genres: ["Action", "RPG", "Adventure", "Mythology"],
        ratingScore: 9.5,
        totalReviewsCount: 2890,
        sentiment: "Overwhelmingly Positive",
        sentimentVi: "Cực kỳ tích cực",
        logoUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/capsule_616x353.jpg",
        bannerUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg",
        communityId: "black-myth-wukong-vn",
        steamUrl: "https://store.steampowered.com/app/2358720/Black_Myth_Wukong/",
        description: "Game nhập vai hành động đậm chất huyền thoại Tây Du Ký với đồ họa Unreal Engine 5 đỉnh cao thế giới.",
        descriptionVi: "Game nhập vai hành động đậm chất huyền thoại Tây Du Ký với đồ họa Unreal Engine 5 đỉnh cao thế giới."
    },
    {
        slug: "cyberpunk-2077",
        id: "cyberpunk-2077",
        appid: 1091500,
        aliases: ["cp2077", "cyberpunk"],
        name: "Cyberpunk 2077",
        tag: "Sci-Fi RPG",
        developer: "CD PROJEKT RED",
        publisher: "CD PROJEKT RED",
        releaseDate: "10 Tháng 12, 2020",
        platforms: ["PC", "PS5", "Xbox Series X"],
        genre: ["Action", "RPG", "Open World", "Sci-Fi"],
        genres: ["Action", "RPG", "Open World", "Sci-Fi"],
        ratingScore: 9.0,
        totalReviewsCount: 2450,
        sentiment: "Very Positive",
        sentimentVi: "Rất tích cực",
        logoUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/capsule_616x353.jpg",
        bannerUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
        steamUrl: "https://store.steampowered.com/app/1091500/Cyberpunk_2077/",
        description: "Khám phá thành phố tương lai Night City ngập tràn ánh đèn neon và công nghệ cấy ghép cơ thể nguy hiểm.",
        descriptionVi: "Khám phá thành phố tương lai Night City ngập tràn ánh đèn neon và công nghệ cấy ghép cơ thể nguy hiểm."
    },
    {
        slug: "grand-theft-auto-v",
        id: "grand-theft-auto-v",
        appid: 271590,
        aliases: ["gtav", "gta5"],
        name: "Grand Theft Auto V",
        tag: "Open World Action",
        developer: "Rockstar North",
        publisher: "Rockstar Games",
        releaseDate: "14 Tháng 4, 2015",
        platforms: ["PC", "PS5", "Xbox Series X"],
        genre: ["Action", "Open World", "Multiplayer"],
        genres: ["Action", "Open World", "Multiplayer"],
        ratingScore: 9.4,
        totalReviewsCount: 5200,
        sentiment: "Very Positive",
        sentimentVi: "Rất tích cực",
        logoUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/capsule_616x353.jpg",
        bannerUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg",
        steamUrl: "https://store.steampowered.com/app/271590/Grand_Theft_Auto_V/",
        description: "Bước vào thành phố Los Santos rực rỡ và đắm chìm vào thế giới ngầm đầy kịch tính cùng 3 nhân vật chính.",
        descriptionVi: "Bước vào thành phố Los Santos rực rỡ và đắm chìm vào thế giới ngầm đầy kịch tính cùng 3 nhân vật chính."
    },
    {
        slug: "raft",
        id: "raft",
        appid: 648800,
        aliases: ["raft"],
        name: "Raft",
        tag: "Co-op Ocean Survival",
        developer: "Redbeet Interactive",
        publisher: "Axolot Games",
        releaseDate: "20 Tháng 6, 2022",
        platforms: ["PC"],
        genre: ["Survival", "Co-op", "Open World", "Crafting"],
        genres: ["Survival", "Co-op", "Open World", "Crafting"],
        ratingScore: 8.9,
        totalReviewsCount: 1650,
        sentiment: "Very Positive",
        sentimentVi: "Rất tích cực",
        logoUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/648800/capsule_616x353.jpg",
        bannerUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/648800/header.jpg",
        communityId: "raft-vietnam",
        steamUrl: "https://store.steampowered.com/app/648800/Raft/",
        description: "Cùng bạn bè sinh tồn trên chiếc bè nhỏ giữa đại dương mênh mông, thu thập mảnh vỡ và mở rộng căn cứ.",
        descriptionVi: "Cùng bạn bè sinh tồn trên chiếc bè nhỏ giữa đại dương mênh mông, thu thập mảnh vỡ và mở rộng căn cứ."
    },
    {
        slug: "red-dead-redemption-2",
        id: "red-dead-redemption-2",
        appid: 1174180,
        aliases: ["rdr2", "reddead2"],
        name: "Red Dead Redemption 2",
        tag: "Epic Western",
        developer: "Rockstar Games",
        publisher: "Rockstar Games",
        releaseDate: "5 Tháng 12, 2019",
        platforms: ["PC", "PS5", "Xbox Series X"],
        genre: ["Action", "Adventure", "Open World", "Story-Rich"],
        genres: ["Action", "Adventure", "Open World", "Story-Rich"],
        ratingScore: 9.7,
        totalReviewsCount: 3900,
        sentiment: "Overwhelmingly Positive",
        sentimentVi: "Cực kỳ tích cực",
        logoUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/capsule_616x353.jpg",
        bannerUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg",
        steamUrl: "https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/",
        description: "Thiên anh hùng ca miền viễn Tây nước Mỹ đầy cảm xúc theo chân Arthur Morgan và băng đảng Van der Linde.",
        descriptionVi: "Thiên anh hùng ca miền viễn Tây nước Mỹ đầy cảm xúc theo chân Arthur Morgan và băng đảng Van der Linde."
    }
];

export const STEAM_URL_MAP: Record<string, string> = {
    "raft": "https://store.steampowered.com/app/648800/Raft/",
    "red-dead-redemption-2": "https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/",
    "rdr2": "https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/",
    "counter-strike-2": "https://store.steampowered.com/app/730/CounterStrike_2/",
    "cs2": "https://store.steampowered.com/app/730/CounterStrike_2/",
    "cyberpunk-2077": "https://store.steampowered.com/app/1091500/Cyberpunk_2077/",
    "elden-ring": "https://store.steampowered.com/app/1245620/ELDEN_RING/",
    "black-myth-wukong": "https://store.steampowered.com/app/2358720/Black_Myth_Wukong/",
    "grand-theft-auto-v": "https://store.steampowered.com/app/271590/Grand_Theft_Auto_V/",
    "gtav": "https://store.steampowered.com/app/271590/Grand_Theft_Auto_V/"
};

export const GAME_APPID_MAP: Record<string, number> = {
    "counter-strike-2": 730,
    "cs2": 730,
    "raft": 648800,
    "red-dead-redemption-2": 1174180,
    "rdr2": 1174180,
    "cyberpunk-2077": 1091500,
    "elden-ring": 1245620,
    "black-myth-wukong": 2358720,
    "grand-theft-auto-v": 271590,
    "gtav": 271590,
};

export const getGameBySlug = (slug: string): GameData => {
    const cleanSlug = (slug || "game").trim().toLowerCase();
    const resolvedAppid = GAME_APPID_MAP[cleanSlug] || (!Number.isNaN(Number(cleanSlug)) ? Number(cleanSlug) : undefined);
    const found = INITIAL_GAMES.find(g => 
        g.slug === cleanSlug || 
        g.id === cleanSlug || 
        g.aliases?.includes(cleanSlug) ||
        g.tag.toLowerCase() === cleanSlug.replace(/-/g, " ")
    );
    if (found) {
        return {
            ...found,
            appid: found.appid || resolvedAppid,
            steamUrl: found.steamUrl || STEAM_URL_MAP[found.slug.toLowerCase()] || STEAM_URL_MAP[found.communityId?.toLowerCase() || ""] || `https://store.steampowered.com/search/?term=${encodeURIComponent(found.name)}`
        };
    }

    // Fallback generation for unknown game slugs so the page never 404s
    const titleName = cleanSlug
        .split("-")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    return {
        slug: cleanSlug,
        id: cleanSlug,
        appid: resolvedAppid,
        name: titleName,
        tag: titleName,
        steamUrl: STEAM_URL_MAP[cleanSlug] || `https://store.steampowered.com/search/?term=${encodeURIComponent(titleName)}`,
        developer: "Indie / Community Studio",
        publisher: "Global Games",
        releaseDate: "2024",
        platforms: ["PC", "PS5", "Xbox Series X"],
        genre: ["Action", "Multiplayer", "Adventure"],
        ratingScore: undefined,
        totalReviewsCount: undefined,
        sentiment: undefined,
        sentimentVi: undefined,
        logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanSlug}&backgroundColor=3b82f6`,
        bannerUrl: gameIlluBg,
        description: `Explore the universe of ${titleName}.`,
        descriptionVi: `Khám phá thế giới trong ${titleName}.`,
        features: [],
        featuresVi: [],
        screenshots: [],
        systemReqs: undefined,
        guides: [],
        reviews: []
    };
};
