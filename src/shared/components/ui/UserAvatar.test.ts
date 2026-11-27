import { describe, it, expect } from "vitest";
import { getInitialLetter, isRealAvatarUrl, getAvatarTintClass } from "./avatarUtils";
import { DEFAULT_AVATAR } from "@/shared/constants/images";

describe("UserAvatar helpers", () => {
    it("extracts uppercase first character, stripping leading @ and handling Vietnamese characters", () => {
        expect(getInitialLetter("alice")).toBe("A");
        expect(getInitialLetter("@b34n")).toBe("B");
        expect(getInitialLetter("  đức anh")).toBe("Đ");
        expect(getInitialLetter("nguyễn văn a")).toBe("N");
        expect(getInitialLetter("")).toBe("?");
        expect(getInitialLetter(undefined)).toBe("?");
        expect(getInitialLetter("   ", "U")).toBe("U");
    });

    it("rejects empty strings, DEFAULT_AVATAR, and dicebear placeholders as non-real avatars", () => {
        expect(isRealAvatarUrl(undefined)).toBe(false);
        expect(isRealAvatarUrl(null)).toBe(false);
        expect(isRealAvatarUrl("")).toBe(false);
        expect(isRealAvatarUrl("   ")).toBe(false);
        expect(isRealAvatarUrl(DEFAULT_AVATAR)).toBe(false);
        expect(isRealAvatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=abc")).toBe(false);
        expect(isRealAvatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=user1")).toBe(false);
    });

    it("accepts real uploaded R2, external HTTPS, and local preview avatar URLs", () => {
        expect(isRealAvatarUrl("https://pub-123.r2.dev/avatars/u1.webp")).toBe(true);
        expect(isRealAvatarUrl("https://cdn.example.com/photo.png")).toBe(true);
        expect(isRealAvatarUrl("data:image/webp;base64,AAAA")).toBe(true);
        expect(isRealAvatarUrl("blob:http://localhost:3000/abc")).toBe(true);
    });

    it("returns deterministic tint classes for the same user name", () => {
        const a1 = getAvatarTintClass("Peter");
        const a2 = getAvatarTintClass("Peter");
        expect(a1).toBe(a2);
        expect(a1.length).toBeGreaterThan(0);
    });
});
