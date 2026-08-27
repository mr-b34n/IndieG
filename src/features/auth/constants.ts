import { type PasswordStrengthConfig, type AuthUser } from "./types";

export const STRENGTH_LEVELS: Record<number, PasswordStrengthConfig> = {
    1: { label: "Weak", color: "text-red-600", bg: "bg-red-600" },
    2: { label: "Fair", color: "text-amber-500", bg: "bg-amber-500" },
    3: { label: "Good", color: "text-yellow-400", bg: "bg-yellow-400" },
    4: { label: "Strong", color: "text-emerald-500", bg: "bg-emerald-500" },
};

export const TEST_ACCOUNTS: Record<string, AuthUser> = {
    admin: {
        id: "usr_admin_001",
        email: "admin@indieg.com",
        username: "AdminPro (Quản Trị)",
        role: "admin",
        isVerified: true,
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    },
    verifiedUser: {
        id: "usr_verified_002",
        email: "user@indieg.com",
        username: "GamerBinhThuong",
        role: "user",
        isVerified: true,
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    },
    unverifiedUser: {
        id: "usr_unverified_003",
        email: "unverified@indieg.com",
        username: "UserChuaVerify",
        role: "user",
        isVerified: false,
        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250",
    },
};
