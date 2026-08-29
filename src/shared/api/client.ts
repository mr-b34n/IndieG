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

/**
 * Universal API Request Function
 */
export async function apiRequest<T = unknown>(
    endpoint: string,
    options: ApiRequestOptions = {}
): Promise<T> {
    const { params, body, headers: customHeaders, ...customOptions } = options;

    // Retrieve tokens from localStorage (supports both standard and app keys)
    const token =
        (typeof window !== "undefined" &&
            (localStorage.getItem("indieg_access_token") || localStorage.getItem("access_token"))) ||
        null;

    const headers: Record<string, string> = {
        Accept: "application/json",
        ...(customHeaders as Record<string, string>),
    };

    let serializedBody: BodyInit | null = null;

    if (body !== undefined && body !== null) {
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
