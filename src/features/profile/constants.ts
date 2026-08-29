import {
    faGamepad, faCrown, faShieldHalved, faTrophy, faFire, faClock, faMedal,
    faDesktop, faHeadphones, faMicrochip, faComputerMouse, faKeyboard,
    faMicrophone, faLayerGroup, faVolumeHigh, faTv,
} from "@fortawesome/free-solid-svg-icons";
import {
    CS2_BG as cs2Bg,
} from "@/shared/constants/images";
import type {
    Badge, GearCategory, LibraryGame, FriendEntry, FriendRequest,
    GuestbookComment, ProfileIdentity, ProfileStatus, CommunityReputation, RecentActivityItem,
} from "./types";
import type { TranslateFn } from "@/shared/hooks/useTranslate";

export const DEFAULT_COVER = cs2Bg;

/** Badge catalogue. Titles/descriptions are translated at call time via getBadgeCatalogue(t). */
export const getBadgeCatalogue = (t: TranslateFn): Badge[] => [
    { id: "clutch", title: t("profile.badges.clutchTitle"), desc: t("profile.badges.clutchDesc"), icon: faTrophy, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30", badgeText: "🏆 CLUTCH GOD", earnedDate: "18/06/2026", category: "FPS", unlocked: true },
    { id: "leader", title: t("profile.badges.leaderTitle"), desc: t("profile.badges.leaderDesc"), icon: faShieldHalved, color: "text-primary bg-primary/10 border-primary/30", badgeText: "🛡️ TACTICAL LEADER", earnedDate: "05/05/2026", category: "Competitive", unlocked: true },
    { id: "outlaw", title: t("profile.badges.outlawTitle"), desc: t("profile.badges.outlawDesc"), icon: faFire, color: "text-rose-400 bg-rose-400/10 border-rose-400/30", badgeText: "🔥 VETERAN OUTLAW", earnedDate: "12/04/2026", category: "Open World", unlocked: true },
    { id: "founder", title: t("profile.badges.founderTitle"), desc: t("profile.badges.founderDesc"), icon: faCrown, color: "text-amber-400 bg-amber-400/10 border-amber-400/30", badgeText: "★ FOUNDER", earnedDate: "01/01/2026", category: "Platform", unlocked: true },
    { id: "shark", title: t("profile.badges.sharkTitle"), desc: t("profile.badges.sharkDesc"), icon: faMedal, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30", badgeText: "🛠 MASTER ARCHITECT", earnedDate: "20/03/2026", category: "Survival", unlocked: true },
    { id: "nightowl", title: t("profile.badges.nightOwlTitle"), desc: t("profile.badges.nightOwlDesc"), icon: faClock, color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/30", badgeText: "🦉 NIGHT OWL", earnedDate: "14/02/2026", category: "Community", unlocked: true },
];

export const GEAR_CATEGORIES: GearCategory[] = [
    { value: "CPU", label: "CPU (Vi xử lý)", icon: faMicrochip, color: "text-sky-400" },
    { value: "GPU", label: "GPU (Card đồ họa)", icon: faTv, color: "text-emerald-400" },
    { value: "Monitor", label: "Monitor (Màn hình)", icon: faDesktop, color: "text-amber-400" },
    { value: "Mouse", label: "Mouse (Chuột gaming)", icon: faComputerMouse, color: "text-rose-400" },
    { value: "Keyboard", label: "Keyboard (Bàn phím)", icon: faKeyboard, color: "text-purple-400" },
    { value: "Headphones", label: "Headphones (Tai nghe)", icon: faHeadphones, color: "text-cyan-400" },
    { value: "Microphone", label: "Microphone (Mic thu âm)", icon: faMicrophone, color: "text-teal-300" },
    { value: "Mousepad", label: "Mousepad (Lót chuột)", icon: faLayerGroup, color: "text-indigo-400" },
    { value: "Audio / DAC", label: "Audio / Soundcard", icon: faVolumeHigh, color: "text-pink-400" },
    { value: "Controller / Other", label: "Controller / Thiết bị khác", icon: faGamepad, color: "text-amber-300" },
];

export const DEFAULT_GEAR: Record<string, string> = {
    CPU: "Intel Core i9-14900K @ 5.8GHz",
    GPU: "NVIDIA GeForce RTX 4090 24GB GDDR6X",
    Monitor: 'ROG Swift 360Hz OLED 27" (1440p 0.03ms)',
    Mouse: "Logitech G Pro X Superlight 2 (800 DPI)",
    Keyboard: "Wooting 60HE+ Custom",
    Headphones: "HyperX Cloud III Wireless",
    Microphone: "Shure SM7B + GoXLR Mini",
    Mousepad: "Artisan Zero FX Soft XL",
};

export const LIBRARY_GAMES: LibraryGame[] = [];

export const COMMUNITY_REPUTATIONS: CommunityReputation[] = [];

export const RECENT_ACTIVITIES: RecentActivityItem[] = [];

export const INITIAL_FRIENDS: FriendEntry[] = [];

export const INITIAL_FRIEND_REQUESTS: FriendRequest[] = [];

export const INITIAL_GUESTBOOK: GuestbookComment[] = [];

export const FRIEND_PROFILES: Record<string, ProfileIdentity> = {};

export const DEFAULT_STRANGER_STATUS: ProfileStatus = "online";
