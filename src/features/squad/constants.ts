import { type Squad, type SquadVoiceType } from "./types";

export const GAME_OPTIONS = [
    "Counter Strike 2",
    "Valorant",
    "League of Legends",
    "Dota 2",
    "Apex Legends",
    "PUBG",
    "Genshin Impact",
    "Minecraft",
    "Grand Theft Auto V",
    "Elden Ring",
    "Raft",
    "Red Dead Redemption 2",
    "Cyberpunk 2077",
    "Khác...",
];

export const GAME_FILTERS = [
    "all",
    ...GAME_OPTIONS.filter((g) => g !== "Khác..."),
];

export const QUICK_TAGS = [
    "🤝 Tìm Đồng Đội",
    "No Toxic",
    "Try Hard",
    "Chill",
    "Coop",
    "Ranked",
    "Hardcore",
    "Equal Pay",
    "Newbie Friendly",
    "Voice Required",
];

export const VOICE_OPTIONS: { value: SquadVoiceType; label: string }[] = [
    { value: "Discord Required", label: "🎧 Bắt buộc có Mic Discord" },
    { value: "In-game Voice", label: "🎙️ Voice chat trong game" },
    { value: "Optional", label: "👌 Có mic hay không đều được" },
    { value: "No Mic", label: "🔇 Chỉ chat text / No Mic" },
];

export const INITIAL_SQUADS: Squad[] = [];
