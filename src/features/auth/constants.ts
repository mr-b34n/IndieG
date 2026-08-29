import { type PasswordStrengthConfig, type AuthUser } from "./types";

export const STRENGTH_LEVELS: Record<number, PasswordStrengthConfig> = {
    1: { label: "Weak", color: "text-red-600", bg: "bg-red-600" },
    2: { label: "Fair", color: "text-amber-500", bg: "bg-amber-500" },
    3: { label: "Good", color: "text-yellow-400", bg: "bg-yellow-400" },
    4: { label: "Strong", color: "text-emerald-500", bg: "bg-emerald-500" },
};

export const TEST_ACCOUNTS: Record<string, AuthUser> = {};
