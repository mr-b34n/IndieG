/**
 * Central API Client for Ludon Backend Services
 * Configured via VITE_API_BASE_URL (e.g. http://localhost:3636)
 */

export const getApiBaseUrl = (): string => {
    if (typeof window !== "undefined") {
        const customUrl = localStorage.getItem("indieg_custom_api_url");
        if (customUrl && customUrl.trim()) {
            const trimmed = customUrl.trim().replace(/\/+$/, "");
            if (trimmed && trimmed !== "/" && trimmed !== "//") {
                return trimmed;
            }
        }
    }
    const envUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
    if (envUrl) {
        const trimmedEnv = envUrl.replace(/\/+$/, "");
        if (trimmedEnv && trimmedEnv !== "/" && trimmedEnv !== "//") {
            return trimmedEnv;
        }
    }
    return "http://localhost:3636";
};

/**
 * Flag điều khiển kết nối giữa Frontend và Backend API.
 */
export const isApiEnabled = (): boolean => true;

export const API_BASE_URL = getApiBaseUrl();

export type ApiQueryParams = Record<string, string | number | boolean | string[] | undefined | null> | Record<string, unknown> | object;

/**
 * Builds a clean, safe API URL guaranteed to avoid double slashes (//endpoint)
 */
export function buildSafeApiUrl(
    endpoint: string,
    params?: ApiQueryParams | null
): string {
    const rawBase = getApiBaseUrl().trim().replace(/\/+$/, "");
    const cleanEndpoint = endpoint.replace(/^\/+/, "").replace(/\/+/g, "/");
    const queryString = buildQueryString(params);

    let finalUrl: string;

    if (rawBase.startsWith("http://") || rawBase.startsWith("https://")) {
        const isHttps = rawBase.startsWith("https://");
        const protocol = isHttps ? "https://" : "http://";
        const hostAndPath = rawBase.slice(protocol.length);
        const combined = `${hostAndPath}/${cleanEndpoint}`.replace(/\/+/g, "/");
        finalUrl = `${protocol}${combined}${queryString}`;
    } else if (rawBase && rawBase !== "/" && rawBase !== "//") {
        const combined = `${rawBase}/${cleanEndpoint}`.replace(/\/+/g, "/");
        finalUrl = combined.startsWith("/") ? `${combined}${queryString}` : `/${combined}${queryString}`;
    } else {
        const combined = `/${cleanEndpoint}`.replace(/\/+/g, "/");
        finalUrl = `${combined}${queryString}`;
    }

    return finalUrl;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
    body?: BodyInit | Record<string, unknown> | object | null;
    params?: ApiQueryParams | null;
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

    try {
        // Dynamically import queryClient or clear caches safely
        localStorage.removeItem("indieg_access_token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("indieg_refresh_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("indieg_auth_user");
        localStorage.removeItem("user_custom_avatar");
        localStorage.removeItem("ludon_access_token");
        localStorage.removeItem("indieg_recent_communities");

        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && (k.startsWith("profile_hidden_sections_") || k.startsWith("indieg-") || k.startsWith("draft_") || k.startsWith("user_"))) {
                keysToRemove.push(k);
            }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
        // Ignore storage errors
    }

    sessionStorage.setItem("indieg_session_expired", "1");
    window.dispatchEvent(new CustomEvent("indieg:session-expired"));
    window.dispatchEvent(new CustomEvent("indieg:auth-cleared"));

    if (!window.location.pathname.startsWith("/auth")) {
        const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/auth?expired=1&redirect=${currentPath}`;
    }
}

/**
 * Extract expiration timestamp (seconds) from JWT token if available.
 */
export function getTokenExp(token?: string | null): number | null {
    if (!token) return null;
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const payloadStr = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
        const payload = JSON.parse(payloadStr) as { exp?: number };
        return typeof payload.exp === "number" ? payload.exp : null;
    } catch {
        return null;
    }
}

/**
 * Check if a token is expired. Supports JWT decoding with safety margin.
 */
export function isTokenExpired(token?: string | null, offsetSeconds = 30): boolean {
    if (!token) return true;
    const exp = getTokenExp(token);
    if (!exp) return false;
    return Date.now() >= (exp - offsetSeconds) * 1000;
}

let refreshPromise: Promise<string | null> | null = null;

/**
 * Call POST /auth/refresh to retrieve a fresh access token
 */
export async function performTokenRefresh(explicitRefreshToken?: string | null): Promise<string | null> {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            const refreshUrl = buildSafeApiUrl("auth/refresh");
            const savedRefreshToken =
                explicitRefreshToken ||
                (typeof window !== "undefined"
                    ? localStorage.getItem("indieg_refresh_token") || localStorage.getItem("refresh_token")
                    : null);
            const savedAccessToken =
                typeof window !== "undefined"
                    ? localStorage.getItem("indieg_access_token") || localStorage.getItem("access_token")
                    : null;

            const headers: Record<string, string> = {
                Accept: "application/json",
                "Content-Type": "application/json",
            };

            if (savedRefreshToken) {
                headers["x-refresh-token"] = savedRefreshToken;
                headers["Authorization"] = `Bearer ${savedRefreshToken}`;
            } else if (savedAccessToken) {
                headers["Authorization"] = `Bearer ${savedAccessToken}`;
            }

            const bodyPayload = savedRefreshToken
                ? JSON.stringify({
                      refreshToken: savedRefreshToken,
                      refresh_token: savedRefreshToken,
                      token: savedRefreshToken,
                  })
                : JSON.stringify({});

            const res = await fetch(refreshUrl, {
                method: "POST",
                headers,
                body: bodyPayload,
                credentials: "include",
            });

            if (!res.ok) {
                return null;
            }

            const rawData = (await res.json()) as Record<string, unknown>;
            const dataObj =
                typeof rawData.data === "object" && rawData.data !== null
                    ? (rawData.data as Record<string, unknown>)
                    : rawData;

            const newToken =
                (rawData.accessToken as string) ||
                (rawData.token as string) ||
                (rawData.access_token as string) ||
                (dataObj.accessToken as string) ||
                (dataObj.token as string) ||
                (dataObj.access_token as string);

            const newRefreshToken =
                (rawData.refreshToken as string) ||
                (rawData.refresh_token as string) ||
                (dataObj.refreshToken as string) ||
                (dataObj.refresh_token as string);

            if (newToken && typeof window !== "undefined") {
                localStorage.setItem("indieg_access_token", newToken);
                localStorage.setItem("access_token", newToken);
                if (newRefreshToken) {
                    localStorage.setItem("indieg_refresh_token", newRefreshToken);
                    localStorage.setItem("refresh_token", newRefreshToken);
                }
                window.dispatchEvent(
                    new CustomEvent("indieg:token-refreshed", {
                        detail: { accessToken: newToken, refreshToken: newRefreshToken },
                    })
                );
            }
            return newToken || null;
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
export function buildQueryString(params?: ApiQueryParams | null): string {
    if (!params) return "";
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
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

// In-flight GET request deduplication to prevent duplicate concurrent network requests
const inFlightGetRequests = new Map<string, Promise<unknown>>();

/**
 * Universal API Request Function
 */
export async function apiRequest<T = unknown>(
    endpoint: string,
    options: ApiRequestOptions = {}
): Promise<T> {
    const { params, body, headers: customHeaders, _retry, skipAuthRefresh, token: explicitToken, ...customOptions } = options;

    // Retrieve tokens from localStorage (supports both standard and app keys)
    let token =
        explicitToken ||
        (typeof window !== "undefined" &&
            (localStorage.getItem("indieg_access_token") || localStorage.getItem("access_token"))) ||
        null;

    const cleanEndpoint = endpoint.replace(/^\/+/, "").replace(/\/+/g, "/");
    const normalizedEndpoint = `/${cleanEndpoint}`;

    const isAuthEndpoint =
        normalizedEndpoint.includes("/auth/login") ||
        normalizedEndpoint.includes("/auth/register") ||
        normalizedEndpoint.includes("/auth/forgot-password") ||
        normalizedEndpoint.includes("/auth/reset-password") ||
        normalizedEndpoint.includes("/auth/verify-email") ||
        normalizedEndpoint.includes("/auth/resend-verification");

    const isRefreshEndpoint = normalizedEndpoint.includes("/auth/refresh");

    // Proactive refresh: if access token has already expired before request, refresh automatically
    if (!isAuthEndpoint && !isRefreshEndpoint && !_retry && !skipAuthRefresh && token && isTokenExpired(token)) {
        const refreshedToken = await performTokenRefresh();
        if (refreshedToken) {
            token = refreshedToken;
        }
    }

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

    const url = buildSafeApiUrl(endpoint, params);

    // If this is a GET/HEAD request and not a retry, deduplicate concurrent identical requests
    const dedupeKey = isGetOrHead && !_retry ? `${method}:${url}:${token || ""}` : null;
    if (dedupeKey && inFlightGetRequests.has(dedupeKey)) {
        return inFlightGetRequests.get(dedupeKey) as Promise<T>;
    }

    const executeRequest = async (): Promise<T> => {
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
                // If refresh endpoint itself failed with 401 or request was already retried:
                if (isRefreshEndpoint || _retry) {
                    handleSessionExpired();
                    throw new ApiError(errorMessage, response.status, errorData);
                }

                // Normal form endpoints (e.g. wrong password during login): do not refresh, return error
                if (isAuthEndpoint || skipAuthRefresh) {
                    throw new ApiError(errorMessage, response.status, errorData);
                }

                // If user has a real token or refresh token, attempt token refresh
                const savedRefreshToken =
                    typeof window !== "undefined"
                        ? localStorage.getItem("indieg_refresh_token") || localStorage.getItem("refresh_token")
                        : null;
                const activeToken =
                    token ||
                    (typeof window !== "undefined"
                        ? localStorage.getItem("indieg_access_token") || localStorage.getItem("access_token")
                        : null);

                if (activeToken || savedRefreshToken) {
                    const refreshedToken = await performTokenRefresh();

                    if (refreshedToken) {
                        const retriedHeaders = {
                            ...(customHeaders as Record<string, string>),
                            Authorization: `Bearer ${refreshedToken}`,
                        };
                        return apiRequest<T>(endpoint, {
                            ...options,
                            headers: retriedHeaders,
                            token: refreshedToken,
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
    };

    if (dedupeKey) {
        const promise = executeRequest().finally(() => {
            inFlightGetRequests.delete(dedupeKey);
        });
        inFlightGetRequests.set(dedupeKey, promise);
        return promise;
    }

    return executeRequest();
}
