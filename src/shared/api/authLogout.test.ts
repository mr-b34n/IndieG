import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authApi } from "./index";

function createMemoryStorage(): Storage {
    const store = new Map<string, string>();
    return {
        get length() {
            return store.size;
        },
        clear() {
            store.clear();
        },
        getItem(key: string) {
            return store.has(key) ? store.get(key)! : null;
        },
        key(index: number) {
            return Array.from(store.keys())[index] ?? null;
        },
        removeItem(key: string) {
            store.delete(key);
        },
        setItem(key: string, value: string) {
            store.set(key, value);
        },
    };
}

describe("authApi.logout", () => {
    const fetchMock = vi.fn();
    const originalWindow = globalThis.window;
    const originalLocalStorage = globalThis.localStorage;
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
        const storage = createMemoryStorage();
        vi.stubGlobal("window", {
            location: { hostname: "localhost", pathname: "/", search: "" },
            setTimeout: globalThis.setTimeout.bind(globalThis),
            clearTimeout: globalThis.clearTimeout.bind(globalThis),
            dispatchEvent: vi.fn(),
        });
        vi.stubGlobal("localStorage", storage);
        fetchMock.mockReset();
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/json" }),
            text: async () => JSON.stringify({ message: "Log out successfully!" }),
            json: async () => ({ message: "Log out successfully!" }),
        });
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.stubGlobal("window", originalWindow);
        vi.stubGlobal("localStorage", originalLocalStorage);
        vi.stubGlobal("fetch", originalFetch);
    });

    it("sends stored refresh token via header and body when logging out without calling refresh first", async () => {
        // Expired JWT payload (exp in the past)
        const expiredPayload = btoa(JSON.stringify({ exp: 1_000_000 }));
        const expiredAccessToken = `hdr.${expiredPayload}.sig`;

        localStorage.setItem("ludon_access_token", expiredAccessToken);
        localStorage.setItem("ludon_refresh_token", "stored-refresh-token");

        const promise = authApi.logout();
        // Simulate auth store immediately clearing localStorage after kicking off logout
        localStorage.removeItem("ludon_access_token");
        localStorage.removeItem("ludon_refresh_token");

        await promise;

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
        expect(url).toContain("/auth/logout");
        const headers = init.headers as Record<string, string>;
        expect(headers["x-refresh-token"]).toBe("stored-refresh-token");
        expect(headers["Authorization"]).toBe(`Bearer ${expiredAccessToken}`);
        expect(JSON.parse(String(init.body))).toEqual({
            refreshToken: "stored-refresh-token",
        });
    });
});
