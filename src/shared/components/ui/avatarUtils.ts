import { DEFAULT_AVATAR } from "@/shared/constants/images";

const AVATAR_TINT_CLASSES = [
    "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
    "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    "bg-teal-500/15 text-teal-600 dark:text-teal-400",
] as const;

export function getInitialLetter(name?: string | null, fallback = "?"): string {
    if (!name || typeof name !== "string") return fallback;
    const cleaned = name.trim().replace(/^@+/, "").trim();
    if (!cleaned) return fallback;
    const first = Array.from(cleaned)[0];
    return first ? first.toLocaleUpperCase("vi-VN") : fallback;
}

export function isRealAvatarUrl(src?: string | null): src is string {
    if (!src || typeof src !== "string") return false;
    const trimmed = src.trim();
    if (!trimmed) return false;
    if (trimmed === DEFAULT_AVATAR) return false;
    if (trimmed.includes("api.dicebear.com")) return false;
    return true;
}

export function getAvatarTintClass(seed?: string | null): string {
    const key = (seed || "").trim().toLowerCase();
    if (!key) return "bg-primary/15 text-primary";
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = (hash * 31 + key.charCodeAt(i)) | 0;
    }
    return AVATAR_TINT_CLASSES[Math.abs(hash) % AVATAR_TINT_CLASSES.length];
}
