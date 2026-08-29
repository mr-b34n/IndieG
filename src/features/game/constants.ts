import { type GameData } from "./types";

import {
    GAME_ILLU_BG as gameIlluBg,
    CS2_SCREENSHOTS,
} from "@/shared/constants/images";

export const INITIAL_GAMES: GameData[] = [];

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

export const getGameBySlug = (slug: string): GameData => {
    const cleanSlug = (slug || "game").trim().toLowerCase();
    const found = INITIAL_GAMES.find(g => 
        g.slug === cleanSlug || 
        g.id === cleanSlug || 
        g.aliases?.includes(cleanSlug) ||
        g.tag.toLowerCase() === cleanSlug.replace(/-/g, " ")
    );
    if (found) {
        return {
            ...found,
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
        name: titleName,
        tag: titleName,
        steamUrl: STEAM_URL_MAP[cleanSlug] || `https://store.steampowered.com/search/?term=${encodeURIComponent(titleName)}`,
        developer: "Indie / Community Studio",
        publisher: "Global Games",
        releaseDate: "2024",
        platforms: ["PC", "PS5", "Xbox Series X"],
        genre: ["Action", "Multiplayer", "Adventure"],
        ratingScore: 4.5,
        totalReviewsCount: 0,
        sentiment: "Very Positive",
        sentimentVi: "Rất tích cực",
        activePlayers: 0,
        logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanSlug}&backgroundColor=3b82f6`,
        bannerUrl: gameIlluBg,
        description: `Explore the universe of ${titleName}.`,
        descriptionVi: `Khám phá thế giới trong ${titleName}.`,
        features: [
            "Online Multiplayer & Co-op squads",
            "Competitive Ranked matchmakings",
            "Rich lore and secret collectibles"
        ],
        featuresVi: [
            "Chế độ chơi mạng Multiplayer & Co-op cùng đồng đội",
            "Hệ thống leo rank cạnh tranh khốc liệt",
            "Cốt truyện chuyên sâu và nhiều bí mật ẩn giấu"
        ],
        screenshots: CS2_SCREENSHOTS,
        systemReqs: {
            minimum: {
                os: "Windows 10 64-bit",
                cpu: "Intel Core i5 / AMD Ryzen 5",
                gpu: "NVIDIA GTX 1060 / AMD RX 580",
                ram: "8 GB RAM",
                storage: "50 GB available space"
            },
            recommended: {
                os: "Windows 11 64-bit",
                cpu: "Intel Core i7 / AMD Ryzen 7",
                gpu: "NVIDIA RTX 3060 / AMD RX 6700 XT",
                ram: "16 GB RAM",
                storage: "50 GB SSD space"
            }
        },
        guides: [],
        reviews: []
    };
};
