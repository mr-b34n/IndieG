/**
 * Type-safe Environment Validation for Ludon
 * Zero-dependency validation enforcing configuration contracts across Dev, Preview, and Production.
 */
export interface AppEnv {
    MODE: string;
    DEV: boolean;
    PROD: boolean;
    VITE_API_BASE_URL: string;
    VITE_R2_PUBLIC_URL?: string;
    VITE_ENABLE_MOCK_FALLBACK: boolean;
}

function parseBool(val: unknown, fallback: boolean): boolean {
    if (val === undefined || val === null || val === "") return fallback;
    if (typeof val === "boolean") return val;
    const str = String(val).trim().toLowerCase();
    return str === "true" || str === "1";
}

function parseOptionalUrl(val: unknown): string | undefined {
    if (typeof val !== "string" || !val.trim()) return undefined;
    try {
        new URL(val);
        return val;
    } catch {
        return undefined;
    }
}

export const env: AppEnv = {
    MODE: typeof import.meta.env.MODE === "string" ? import.meta.env.MODE : "development",
    DEV: Boolean(import.meta.env.DEV ?? true),
    PROD: Boolean(import.meta.env.PROD ?? false),
    VITE_API_BASE_URL:
        typeof import.meta.env.VITE_API_BASE_URL === "string"
            ? import.meta.env.VITE_API_BASE_URL
            : "",
    VITE_R2_PUBLIC_URL: parseOptionalUrl(import.meta.env.VITE_R2_PUBLIC_URL),
    VITE_ENABLE_MOCK_FALLBACK: parseBool(import.meta.env.VITE_ENABLE_MOCK_FALLBACK, true),
};
