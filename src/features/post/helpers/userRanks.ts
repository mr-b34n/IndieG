import {
    faSeedling,
    faShieldHalved,
    faMedal,
    faBolt,
    faTrophy,
    faCrown,
    faGem,
    faDragon,
    type IconDefinition
} from "@fortawesome/free-solid-svg-icons";

export type UserRank = "rookie" | "veteran" | "pro" | "elite" | "master" | "grandmaster" | "legend" | "immortal";

export interface UserRankConfig {
    id: UserRank;
    label: string;
    labelVi: string;
    labelEn: string;
    icon: IconDefinition;
    classes: string; // Badge/pill classes for posts and comments
    textColor: string; // Text classes for tagging/mentions without background color
    borderColor: string; // Subtle border accent
    isVerifiedExpert?: boolean; // Admin/Dev approved knowledge rank
}

export const RANK_CONFIG: Record<UserRank, UserRankConfig> = {
    rookie: {
        id: "rookie",
        label: "Thành viên mới",
        labelVi: "Thành viên mới",
        labelEn: "Rookie Member",
        icon: faSeedling,
        classes: "bg-amber-700/90 text-white shadow-sm border border-amber-600/40",
        textColor: "text-amber-700 dark:text-amber-500 font-bold",
        borderColor: "border-amber-600/40",
        isVerifiedExpert: false,
    },
    veteran: {
        id: "veteran",
        label: "Thành viên tích cực",
        labelVi: "Thành viên tích cực",
        labelEn: "Active Veteran",
        icon: faShieldHalved,
        classes: "bg-slate-600/90 text-white shadow-sm border border-slate-500/40",
        textColor: "text-slate-600 dark:text-slate-300 font-bold",
        borderColor: "border-slate-500/40",
        isVerifiedExpert: false,
    },
    pro: {
        id: "pro",
        label: "Người chia sẻ hữu ích",
        labelVi: "Người chia sẻ hữu ích",
        labelEn: "Helpful Contributor",
        icon: faMedal,
        classes: "bg-emerald-600/90 text-white shadow-sm border border-emerald-500/40",
        textColor: "text-emerald-600 dark:text-emerald-400 font-bold",
        borderColor: "border-emerald-500/40",
        isVerifiedExpert: false,
    },
    elite: {
        id: "elite",
        label: "Cây viết tâm huyết",
        labelVi: "Cây viết tâm huyết",
        labelEn: "Dedicated Writer",
        icon: faBolt,
        classes: "bg-blue-600/90 text-white shadow-sm border border-blue-500/40",
        textColor: "text-blue-600 dark:text-blue-400 font-bold",
        borderColor: "border-blue-500/40",
        isVerifiedExpert: false,
    },
    master: {
        id: "master",
        label: "Chuyên gia giải đáp",
        labelVi: "Chuyên gia giải đáp",
        labelEn: "QA Expert",
        icon: faTrophy,
        classes: "bg-indigo-600/90 text-white shadow-sm border border-indigo-500/40",
        textColor: "text-indigo-600 dark:text-indigo-400 font-bold",
        borderColor: "border-indigo-500/40",
        isVerifiedExpert: true,
    },
    grandmaster: {
        id: "grandmaster",
        label: "Học giả uyên bác",
        labelVi: "Học giả uyên bác",
        labelEn: "Scholarly Master",
        icon: faCrown,
        classes: "bg-purple-600/90 text-white shadow-sm border border-purple-500/40",
        textColor: "text-purple-600 dark:text-purple-400 font-bold",
        borderColor: "border-purple-500/40",
        isVerifiedExpert: true,
    },
    legend: {
        id: "legend",
        label: "Bách khoa toàn thư",
        labelVi: "Bách khoa toàn thư",
        labelEn: "Living Encyclopedia",
        icon: faGem,
        classes: "bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold shadow-md border border-yellow-300/50",
        textColor: "text-amber-600 dark:text-yellow-400 font-extrabold tracking-wide",
        borderColor: "border-yellow-400/50",
        isVerifiedExpert: true,
    },
    immortal: {
        id: "immortal",
        label: "Cố vấn đặc quyền",
        labelVi: "Cố vấn đặc quyền",
        labelEn: "Privileged Advisor",
        icon: faDragon,
        classes: "bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 text-white font-extrabold shadow-md border border-rose-400/50",
        textColor: "text-rose-600 dark:text-rose-400 font-extrabold tracking-wide",
        borderColor: "border-rose-400/50",
        isVerifiedExpert: true,
    },
};

const KNOWN_USER_RANKS: Record<string, UserRank> = {
    "User123": "pro",
    "GhostRider": "grandmaster",
    "TacticalGamer": "master",
    "NightOwl": "elite",
    "ProSniper": "legend",
    "MapMaker": "grandmaster",
    "ViperKing": "pro",
    "TarnishedOne": "rookie",
    "CyberSamurai": "immortal",
    "SunWukong": "legend",
    "LosSantosBro": "veteran",
    "RedstoneMaster": "grandmaster",
    "ProGamer99": "immortal",
    "DevCreator": "grandmaster",
    "ChillVibes": "pro",
    "PixelQueen": "legend",
    "Alex_Dev": "master",
    "Elena_V": "elite",
    "GamerMaster": "grandmaster",
    "RetroKing": "veteran",
    "Shouko_Pro": "immortal",
    "NeoCyber": "pro",
    "GamerX99": "rookie",
    "PlayerOne": "immortal",
    "IndieGamer": "legend",
    "You": "immortal",
};

const ALL_RANKS_ORDER: UserRank[] = [
    "rookie",
    "veteran",
    "pro",
    "elite",
    "master",
    "grandmaster",
    "legend",
    "immortal",
];

export const getUserRank = (usernameInput?: unknown): UserRank => {
    if (usernameInput === undefined || usernameInput === null) return "rookie";
    let candidateStr: string;
    if (typeof usernameInput === "string") {
        candidateStr = usernameInput;
    } else if (typeof usernameInput === "number") {
        candidateStr = String(usernameInput);
    } else if (typeof usernameInput === "object") {
        const obj = usernameInput as { rank?: unknown; username?: unknown; name?: unknown; level?: unknown };
        candidateStr = String(obj.rank || obj.username || obj.name || obj.level || "");
    } else {
        candidateStr = String(usernameInput);
    }
    if (!candidateStr || candidateStr === "undefined" || candidateStr === "null") return "rookie";
    const cleanName = candidateStr.replace(/^@/, "").trim();
    if (RANK_CONFIG[cleanName.toLowerCase() as UserRank]) {
        return cleanName.toLowerCase() as UserRank;
    }
    if (KNOWN_USER_RANKS[cleanName]) {
        return KNOWN_USER_RANKS[cleanName];
    }
    const foundKey = Object.keys(KNOWN_USER_RANKS).find(
        (key) => key.toLowerCase() === cleanName.toLowerCase()
    );
    if (foundKey) {
        return KNOWN_USER_RANKS[foundKey];
    }
    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) {
        hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % ALL_RANKS_ORDER.length;
    return ALL_RANKS_ORDER[idx];
};

export const getUserRankConfig = (usernameInput?: unknown): UserRankConfig => {
    const rankKey = getUserRank(usernameInput);
    return RANK_CONFIG[rankKey] || RANK_CONFIG.rookie;
};

export const getRankLabel = (rank: UserRankConfig | UserRank | string | number | unknown, tOrLang?: string | ((key: string) => string)): string => {
    const config = typeof rank === 'object' && rank !== null && 'id' in rank ? (rank as UserRankConfig) : getUserRankConfig(rank);
    if (typeof tOrLang === 'function') {
        return tOrLang(`ranks.${config.id}`);
    }
    if (tOrLang === 'en') return config.labelEn;
    return config.labelVi || config.label;
};

