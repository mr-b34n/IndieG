/**
 * Central API Client for IndieG Backend Services
 * Configured via VITE_API_BASE_URL (e.g. http://localhost:3636)
 */

const getBaseUrl = (): string => {
    const rawUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3636";
    // Remove trailing slash if present
    return rawUrl.replace(/\/+$/, "");
};

export const API_BASE_URL = getBaseUrl();

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
    body?: BodyInit | Record<string, unknown> | null;
    params?: Record<string, string | number | boolean | string[] | undefined | null>;
    _retry?: boolean;
    skipAuthRefresh?: boolean;
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

let refreshPromise: Promise<string | null> | null = null;

/**
 * Call POST /auth/refresh to retrieve a fresh access token
 */
async function performTokenRefresh(): Promise<string | null> {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            const refreshUrl = `${API_BASE_URL}/auth/refresh`;
            const savedRefreshToken =
                typeof window !== "undefined" ? localStorage.getItem("indieg_refresh_token") : null;

            const res = await fetch(refreshUrl, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    ...(savedRefreshToken ? { "x-refresh-token": savedRefreshToken } : {}),
                },
                body: savedRefreshToken ? JSON.stringify({ refreshToken: savedRefreshToken }) : undefined,
                credentials: "include",
            });

            if (!res.ok) {
                return null;
            }

            const data = (await res.json()) as Record<string, unknown>;
            const rawData = (data.data as Record<string, unknown>) || data;
            const newToken =
                (data.accessToken as string) ||
                (data.token as string) ||
                (rawData.accessToken as string) ||
                (rawData.token as string) ||
                (rawData.access_token as string);

            if (newToken && typeof newToken === "string") {
                if (typeof window !== "undefined") {
                    localStorage.setItem("indieg_access_token", newToken);
                    localStorage.setItem("access_token", newToken);
                    const newRefreshToken = (data.refreshToken as string) || (rawData.refreshToken as string);
                    if (newRefreshToken) {
                        localStorage.setItem("indieg_refresh_token", newRefreshToken);
                    }
                    window.dispatchEvent(
                        new CustomEvent("indieg:token-refreshed", { detail: { accessToken: newToken } })
                    );
                }
                return newToken;
            }
            return null;
        } catch {
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

/**
 * Serializes query parameters into URL search string.
 * Handles arrays as repeated query params (e.g. tags=a&tags=b).
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
    return token === "mock_guest";
}

/**
 * Universal API Request Function
 */
export async function apiRequest<T = unknown>(
    endpoint: string,
    options: ApiRequestOptions = {}
): Promise<T> {
    const { params, body, headers: customHeaders, _retry, skipAuthRefresh, ...customOptions } = options;

    // Retrieve tokens from localStorage (supports both standard and app keys)
    const token =
        (typeof window !== "undefined" &&
            (localStorage.getItem("indieg_access_token") || localStorage.getItem("access_token"))) ||
        null;

    const headers: Record<string, string> = {
        Accept: "application/json",
        ...(customHeaders as Record<string, string>),
    };

    const method = (customOptions.method || "GET").toUpperCase();
    const isGetOrHead = method === "GET" || method === "HEAD";

    let serializedBody: BodyInit | null = null;

    if (!isGetOrHead && body !== undefined && body !== null) {
        if (
            typeof body === "string" ||
            body instanceof FormData ||
            body instanceof Blob ||
            body instanceof ArrayBuffer
        ) {
            serializedBody = body;
        } else {
            headers["Content-Type"] = "application/json";
            serializedBody = JSON.stringify(body);
        }
    }

    if (token && !headers["Authorization"] && !headers["authorization"]) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const queryString = buildQueryString(params);
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${normalizedEndpoint}${queryString}`;

    const response = await fetch(url, {
        ...customOptions,
        headers,
        body: serializedBody,
        credentials: "include", // Supports refresh_token cookies
    });

    if (!response.ok) {
        let errorData: Record<string, unknown> | null = null;
        let errorMessage = `Request failed with status ${response.status} (${response.statusText})`;

        try {
            const text = await response.text();
            if (text) {
                try {
                    errorData = JSON.parse(text) as Record<string, unknown>;
                    errorMessage =
                        (typeof errorData.message === "string" && errorData.message) ||
                        (typeof errorData.error === "string" && errorData.error) ||
                        (Array.isArray(errorData.errors) ? errorData.errors.join(", ") : text);
                } catch {
                    errorMessage = text;
                }
            }
        } catch {
            // Keep default message
        }

        // Handle 401 Unauthorized token refresh & expiration flow
        if (response.status === 401) {
            const isAuthEndpoint =
                normalizedEndpoint.includes("/auth/login") ||
                normalizedEndpoint.includes("/auth/register") ||
                normalizedEndpoint.includes("/auth/forgot-password") ||
                normalizedEndpoint.includes("/auth/reset-password") ||
                normalizedEndpoint.includes("/auth/verify-email") ||
                normalizedEndpoint.includes("/auth/resend-verification");

            const isRefreshEndpoint = normalizedEndpoint.includes("/auth/refresh");

            // If refresh endpoint itself failed with 401 or request was already retried:
            if (isRefreshEndpoint || _retry) {
                handleSessionExpired();
                throw new ApiError(errorMessage, response.status, errorData);
            }

            // Normal form endpoints (e.g. wrong password during login): do not refresh, return error
            if (isAuthEndpoint || skipAuthRefresh) {
                throw new ApiError(errorMessage, response.status, errorData);
            }

            // If user has a real token, attempt token refresh
            const currentToken =
                typeof window !== "undefined"
                    ? localStorage.getItem("indieg_access_token") || localStorage.getItem("access_token")
                    : null;

            if (currentToken && !isMockToken(currentToken) && !currentToken.startsWith("mock_")) {
                const refreshedToken = await performTokenRefresh();

                if (refreshedToken) {
                    const retriedHeaders = {
                        ...(customHeaders as Record<string, string>),
                        Authorization: `Bearer ${refreshedToken}`,
                    };
                    return apiRequest<T>(endpoint, {
                        ...options,
                        headers: retriedHeaders,
                        _retry: true,
                    });
                } else {
                    // Refresh token also failed/expired -> redirect to login with session expired alert
                    handleSessionExpired();
                    throw new ApiError(errorMessage, response.status, errorData);
                }
            }
        }

        throw new ApiError(errorMessage, response.status, errorData);
    }

    // Handle 204 No Content or empty bodies
    if (response.status === 204) {
        return {} as T;
    }

    const text = await response.text();
    if (!text) {
        return {} as T;
    }

    try {
        return JSON.parse(text) as T;
    } catch {
        return text as unknown as T;
    }
}
