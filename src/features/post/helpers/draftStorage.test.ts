import { describe, it, expect, beforeEach } from "vitest";
import {
    DRAFT_TTL_MS,
    getPostDraftKey,
    getCommentDraftKey,
    getReplyDraftKey,
    savePostDraft,
    loadPostDraft,
    clearPostDraft,
    saveCommentDraft,
    loadCommentDraft,
    clearCommentDraft,
    clearUserDrafts,
    type PostDraftData,
} from "./draftStorage";

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
            store.set(key, String(value));
        },
    };
}

describe("draftStorage (per-user localStorage drafts)", () => {
    let storage: Storage;

    beforeEach(() => {
        storage = createMemoryStorage();
    });

    it("generates user-scoped draft_* keys so logout cleanup removes them automatically", () => {
        expect(getPostDraftKey("u1")).toBe("draft_post_u1");
        expect(getCommentDraftKey("u1", "post-42")).toBe("draft_comment_u1_post-42");
        expect(getReplyDraftKey("u1", "post-42", "cmt-9")).toBe("draft_reply_u1_post-42_cmt-9");
    });

    it("saves, loads, isolates per user, and clears post drafts", () => {
        const draftA: Omit<PostDraftData, "updatedAt"> = {
            title: "Build guide",
            content: "Some markdown content",
            tags: ["rpg"],
            communityId: "comm-1",
            allowComments: true,
            pinned: false,
            isSpoiler: true,
            isNsfw: false,
        };

        savePostDraft("user-a", draftA, storage);
        expect(loadPostDraft("user-b", storage)).toBeNull();

        const loaded = loadPostDraft("user-a", storage);
        expect(loaded).not.toBeNull();
        expect(loaded?.title).toBe("Build guide");
        expect(loaded?.content).toBe("Some markdown content");
        expect(loaded?.tags).toEqual(["rpg"]);
        expect(loaded?.isSpoiler).toBe(true);

        clearPostDraft("user-a", storage);
        expect(loadPostDraft("user-a", storage)).toBeNull();
    });

    it("removes post draft automatically when all content fields are empty", () => {
        savePostDraft(
            "user-a",
            {
                title: "Temp",
                content: "",
                tags: [],
                communityId: null,
                allowComments: true,
                pinned: false,
                isSpoiler: false,
                isNsfw: false,
            },
            storage
        );
        expect(loadPostDraft("user-a", storage)).not.toBeNull();

        savePostDraft(
            "user-a",
            {
                title: "   ",
                content: "  ",
                tags: [],
                communityId: "comm-1",
                allowComments: true,
                pinned: false,
                isSpoiler: false,
                isNsfw: false,
            },
            storage
        );
        expect(loadPostDraft("user-a", storage)).toBeNull();
    });

    it("expires stale post drafts and handles corrupted JSON gracefully", () => {
        const key = getPostDraftKey("user-a");
        storage.setItem(
            key,
            JSON.stringify({
                title: "Old",
                content: "Expired",
                tags: [],
                communityId: null,
                allowComments: true,
                pinned: false,
                isSpoiler: false,
                isNsfw: false,
                updatedAt: Date.now() - DRAFT_TTL_MS - 1000,
            })
        );
        expect(loadPostDraft("user-a", storage)).toBeNull();
        expect(storage.getItem(key)).toBeNull();

        storage.setItem(key, "{invalid-json");
        expect(loadPostDraft("user-a", storage)).toBeNull();
        expect(storage.getItem(key)).toBeNull();
    });

    it("saves, loads, and clears per-user comment and reply drafts independently", () => {
        saveCommentDraft("user-a", "post-1", "Main comment draft", undefined, storage);
        saveCommentDraft("user-a", "post-1", "Reply draft to cmt 7", "cmt-7", storage);
        saveCommentDraft("user-b", "post-1", "User B draft", undefined, storage);

        expect(loadCommentDraft("user-a", "post-1", undefined, storage)).toBe("Main comment draft");
        expect(loadCommentDraft("user-a", "post-1", "cmt-7", storage)).toBe("Reply draft to cmt 7");
        expect(loadCommentDraft("user-b", "post-1", undefined, storage)).toBe("User B draft");
        expect(loadCommentDraft("user-a", "post-2", undefined, storage)).toBe("");

        // Empty content clears the draft
        saveCommentDraft("user-a", "post-1", "   ", undefined, storage);
        expect(loadCommentDraft("user-a", "post-1", undefined, storage)).toBe("");

        clearCommentDraft("user-a", "post-1", "cmt-7", storage);
        expect(loadCommentDraft("user-a", "post-1", "cmt-7", storage)).toBe("");
    });

    it("clears all drafts for a specific user without touching other users", () => {
        savePostDraft(
            "user-a",
            {
                title: "A",
                content: "Body",
                tags: [],
                communityId: null,
                allowComments: true,
                pinned: false,
                isSpoiler: false,
                isNsfw: false,
            },
            storage
        );
        saveCommentDraft("user-a", "post-1", "Comment A", undefined, storage);
        saveCommentDraft("user-a", "post-1", "Reply A", "cmt-2", storage);
        saveCommentDraft("user-b", "post-1", "Comment B", undefined, storage);

        clearUserDrafts("user-a", storage);

        expect(loadPostDraft("user-a", storage)).toBeNull();
        expect(loadCommentDraft("user-a", "post-1", undefined, storage)).toBe("");
        expect(loadCommentDraft("user-a", "post-1", "cmt-2", storage)).toBe("");
        expect(loadCommentDraft("user-b", "post-1", undefined, storage)).toBe("Comment B");
    });

    it("no-ops safely when userId is missing", () => {
        saveCommentDraft(undefined, "post-1", "Ghost draft", undefined, storage);
        expect(loadCommentDraft(undefined, "post-1", undefined, storage)).toBe("");
        expect(storage.length).toBe(0);
    });
});
