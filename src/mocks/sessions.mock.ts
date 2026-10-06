import type { UserSessionDto } from "@/shared/api/types";

/**
 * =========================================================================
 * MOCK USER SESSIONS DATA
 * =========================================================================
 * Danh sách các phiên đăng nhập mẫu trên nhiều thiết bị và địa điểm khác nhau.
 */

export const MOCK_USER_SESSIONS: UserSessionDto[] = [
    {
        id: "session-current",
        user_id: "user-me",
        userAgent: "Chrome 128.0 (Windows 11 Pro 64-bit / Desktop PC)",
        ip_address: "113.161.45.12 (TP. Hồ Chí Minh, VN)",
        token_hash: "hash_current_chrome_desktop",
        token_version: 1,
        created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    },
    {
        id: "session-macbook",
        user_id: "user-me",
        userAgent: "Safari 18.0 (MacBook Pro M3 Max / macOS Sonoma)",
        ip_address: "14.232.180.88 (Hà Nội, VN)",
        token_hash: "hash_macbook_safari_laptop",
        token_version: 1,
        created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 29 * 24 * 3600 * 1000).toISOString(),
    },
    {
        id: "session-iphone",
        user_id: "user-me",
        userAgent: "IndieG Mobile App 2.4 (iPhone 15 Pro / iOS 18.1)",
        ip_address: "42.114.78.20 (Đà Nẵng, VN)",
        token_hash: "hash_iphone_mobile_app",
        token_version: 1,
        created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 28 * 24 * 3600 * 1000).toISOString(),
    },
    {
        id: "session-steam-deck",
        user_id: "user-me",
        userAgent: "Valve Steam Client (Steam Deck OLED / SteamOS 3.5)",
        ip_address: "113.161.45.12 (TP. Hồ Chí Minh, VN)",
        token_hash: "hash_steamdeck_console",
        token_version: 1,
        created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 27 * 24 * 3600 * 1000).toISOString(),
    },
    {
        id: "session-rog-ally",
        user_id: "user-me",
        userAgent: "Edge 128.0 (ASUS ROG Ally Z1 Extreme / Handheld)",
        ip_address: "115.79.130.45 (Cần Thơ, VN)",
        token_hash: "hash_rog_ally_handheld",
        token_version: 1,
        created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 26 * 24 * 3600 * 1000).toISOString(),
    },
    {
        id: "session-ipad",
        user_id: "user-me",
        userAgent: "Safari Mobile (iPad Air M2 / iPadOS 18.0)",
        ip_address: "27.68.99.110 (Hải Phòng, VN)",
        token_hash: "hash_ipad_tablet",
        token_version: 1,
        created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 24 * 24 * 3600 * 1000).toISOString(),
    },
    {
        id: "session-thinkpad-work",
        user_id: "user-me",
        userAgent: "Firefox 130.0 Developer Edition (ThinkPad X1 / Ubuntu 24.04)",
        ip_address: "118.69.190.22 (Huế, VN)",
        token_hash: "hash_thinkpad_linux",
        token_version: 1,
        created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 23 * 24 * 3600 * 1000).toISOString(),
    },
    {
        id: "session-cyber-cafe",
        user_id: "user-me",
        userAgent: "Firefox 129.0 (CyberCore Gaming Center / Máy VIP 08)",
        ip_address: "27.72.102.15 (TP. Hồ Chí Minh, VN)",
        token_hash: "hash_cybercafe_revoked",
        token_version: 1,
        created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
        expires_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        revoked_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    },
    {
        id: "session-suspicious-ip",
        user_id: "user-me",
        userAgent: "Tor Browser 13.5 (Unknown OS / Anonymous Proxy)",
        ip_address: "185.220.101.5 (Moscow, Russia - Cảnh báo bảo mật)",
        token_hash: "hash_suspicious_flagged",
        token_version: 1,
        created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
        expires_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
        revoked_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    },
    {
        id: "session-old-phone",
        user_id: "user-me",
        userAgent: "IndieG Mobile 1.8 (iPhone 12 Pro Max / iOS 17.5)",
        ip_address: "113.161.45.12 (TP. Hồ Chí Minh, VN)",
        token_hash: "hash_old_iphone_revoked",
        token_version: 1,
        created_at: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
        expires_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
        revoked_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    },
];

export const getMockSessions = (): UserSessionDto[] => {
    return [...MOCK_USER_SESSIONS];
};

export const revokeMockSession = (sessionId: string): void => {
    const found = MOCK_USER_SESSIONS.find((s) => s.id === sessionId);
    if (found) {
        found.revoked_at = new Date().toISOString();
    }
};

export const revokeAllMockSessions = (): void => {
    MOCK_USER_SESSIONS.forEach((s) => {
        if (s.id !== "session-current") {
            s.revoked_at = new Date().toISOString();
        }
    });
};
