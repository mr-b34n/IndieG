/**
 * Central API Client for IndieG Frontend (Standalone Mock Mode)
 * Toàn bộ network request gọi tới Backend đã được loại bỏ để phục vụ phát triển độc lập.
 */

export const getApiBaseUrl = (): string => {
    return "http://localhost:3636";
};

/**
 * Flag điều khiển kết nối giữa Frontend và Backend API.
 * Luôn trả về false ở chế độ Standalone Mock Mode.
 */
export const isApiEnabled = (): boolean => false;

export const API_BASE_URL = getApiBaseUrl();

/**
 * Builds an API URL (giữ lại cho tương thích DTO và helper)
 */
export function buildSafeApiUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | string[] | undefined | null>
): string {
    const rawBase = getApiBaseUrl().trim().replace(/\/+$/, "");
    const cleanEndpoint = endpoint.replace(/^\/+/, "").replace(/\/+/g, "/");
    const queryString = buildQueryString(params);
    return `${rawBase}/${cleanEndpoint}${queryString}`;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
    body?: BodyInit | Record<string, unknown> | null;
    params?: Record<string, string | number | boolean | string[] | undefined | null>;
    _retry?: boolean;
    skipAuthRefresh?: boolean;
    token?: string;
}

export class ApiError extends Error {
    status: number;
    data: unknown;

    constructor(message: string, status: number, data?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

/**
 * Handle session expiration: clear local tokens and redirect to login
 */
export function handleSessionExpired(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem("indieg_access_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("indieg_refresh_token");
    localStorage.removeItem("indieg_auth_user");
    localStorage.removeItem("indieg_mock_login");

    sessionStorage.setItem("indieg_session_expired", "1");
    window.dispatchEvent(new CustomEvent("indieg:session-expired"));

    if (!window.location.pathname.startsWith("/auth")) {
        const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/auth?expired=1&redirect=${currentPath}`;
    }
}

/**
 * Serializes query parameters into URL search string.
 */
export function buildQueryString(params?: Record<string, string | number | boolean | string[] | undefined | null>): string {
    if (!params) return "";
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === "") continue;
        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item !== undefined && item !== null) {
                    searchParams.append(key, String(item));
                }
            });
        } else {
            searchParams.append(key, String(value));
        }
    }

    const qs = searchParams.toString();
    return qs ? `?${qs}` : "";
}

export function isMockToken(token?: string | null): boolean {
    if (!token) return true;
    return token === "mock_guest" || token.startsWith("mock_");
}

/**
 * Universal Mock API Request Function
 * Không thực hiện network call tới BE, đảm bảo FE chạy độc lập 100% với Mock Data.
 */
export async function apiRequest<T = unknown>(
    endpoint: string,
    _options: ApiRequestOptions = {}
): Promise<T> {
    console.info(`[Standalone Mock Mode] Bypassed network request to: ${endpoint}`);
    return {} as T;
}
