import { type PasswordStrengthConfig, type AuthUser } from "./types";

export const STRENGTH_LEVELS: Record<number, PasswordStrengthConfig> = {
    1: { label: "Weak", color: "text-red-500", bg: "bg-red-500" },
    2: { label: "Fair", color: "text-amber-500", bg: "bg-amber-500" },
    3: { label: "Good", color: "text-yellow-400", bg: "bg-yellow-400" },
    4: { label: "Strong", color: "text-emerald-500", bg: "bg-emerald-500" },
};

export interface MockAccountCredential extends AuthUser {
    password?: string;
    description?: string;
}

/**
 * =========================================================================
 * DANH SÁCH TÀI KHOẢN MẪU ĐỂ ĐĂNG NHẬP (TEST ACCOUNTS)
 * =========================================================================
 * Bạn có thể sử dụng các tài khoản bên dưới để đăng nhập vào web app:
 * 
 * 1. Admin: admin@indieg.com (Mật khẩu: Admin123!)
 * 2. Pro Gamer: gamer@indieg.com (Mật khẩu: Gamer123!)
 * 3. Elden Lord: eldenlord@gmail.com (Mật khẩu: Souls123!)
 * 4. Streamer: streamer@indieg.com (Mật khẩu: Stream123!)
 * 5. FPS Pro: shadowhunter@fps.io (Mật khẩu: Shadow123!)
 * 6. Tân thủ (chưa verify email): unverified@indieg.com (Mật khẩu: User123!)
 */
export const TEST_ACCOUNTS: Record<string, MockAccountCredential> = {
    admin: {
        id: "usr_admin",
        email: "admin@indieg.com",
        username: "IndieAdmin",
        name: "IndieG Administrator",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieAdmin",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieAdmin",
        role: "admin",
        isVerified: true,
        password: "Admin123!",
        description: "Quản trị viên toàn quyền hệ thống (Full Admin)",
    },
    verifiedUser: {
        id: "user-me",
        email: "gamer@indieg.com",
        username: "IndieGamer",
        name: "Indie Gamer Pro",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieGamer",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=IndieGamer",
        role: "user",
        isVerified: true,
        password: "Gamer123!",
        description: "Game thủ VIP Founder, đã xác thực email",
    },
    eldenLord: {
        id: "user-1",
        email: "eldenlord@gmail.com",
        username: "EldenLord_VN",
        name: "EldenLord_VN",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=EldenLord",
        role: "user",
        isVerified: true,
        password: "Souls123!",
        description: "Game thủ Hardcore Souls-like & Elden Ring",
    },
    streamer: {
        id: "user-streamer",
        email: "streamer@indieg.com",
        username: "LunaStream",
        name: "Luna Valkyrie",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=LunaValkyrie",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=LunaValkyrie",
        role: "user",
        isVerified: true,
        password: "Stream123!",
        description: "Creator & Streamer cộng đồng IndieG",
    },
    shadowHunter: {
        id: "user-2",
        email: "shadowhunter@fps.io",
        username: "ShadowHunter",
        name: "ShadowHunter",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowHunter",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ShadowHunter",
        role: "user",
        isVerified: true,
        password: "Shadow123!",
        description: "Tuyển thủ FPS & Đội trưởng CS2 Premier",
    },
    unverifiedUser: {
        id: "usr_unverified",
        email: "unverified@indieg.com",
        username: "NewPlayer99",
        name: "New Player 99",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=NewPlayer",
        avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=NewPlayer",
        role: "user",
        isVerified: false,
        password: "User123!",
        description: "Tài khoản người chơi mới chưa xác thực email",
    },
};
