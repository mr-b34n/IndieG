export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface PostDraftData {
    title: string;
    content: string;
    tags: string[];
    communityId: string | number | null;
    allowComments: boolean;
    pinned: boolean;
    isSpoiler: boolean;
    isNsfw: boolean;
    updatedAt: number;
}

export interface CommentDraftData {
    content: string;
    updatedAt: number;
}

function resolveStorage(storage?: Storage): Storage | null {
    if (storage) return storage;
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage;
    } catch {
        return null;
    }
}

function normalizeKeyPart(value?: string | number | null): string {
    if (value === undefined || value === null) return "";
    return String(value).trim();
}

export function getPostDraftKey(userId: string | number): string {
    return `draft_post_${normalizeKeyPart(userId)}`;
}

export function getCommentDraftKey(userId: string | number, postId: string | number): string {
    return `draft_comment_${normalizeKeyPart(userId)}_${normalizeKeyPart(postId)}`;
}

export function getReplyDraftKey(
    userId: string | number,
    postId: string | number,
    parentCommentId: string | number
): string {
    return `draft_reply_${normalizeKeyPart(userId)}_${normalizeKeyPart(postId)}_${normalizeKeyPart(parentCommentId)}`;
}

export function hasPostDraftContent(draft: Pick<PostDraftData, "title" | "content" | "tags">): boolean {
    return Boolean(
        draft.title.trim().length > 0 ||
        draft.content.trim().length > 0 ||
        (Array.isArray(draft.tags) && draft.tags.length > 0)
    );
}

export function savePostDraft(
    userId: string | number | undefined | null,
    draft: Omit<PostDraftData, "updatedAt">,
    storage?: Storage
): void {
    const uid = normalizeKeyPart(userId);
    const store = resolveStorage(storage);
    if (!uid || !store) return;

    const key = getPostDraftKey(uid);
    try {
        if (!hasPostDraftContent(draft)) {
            store.removeItem(key);
            return;
        }
        const payload: PostDraftData = {
            ...draft,
            updatedAt: Date.now(),
        };
        store.setItem(key, JSON.stringify(payload));
    } catch {
        // Ignore storage quota or privacy mode errors
    }
}

export function loadPostDraft(
    userId: string | number | undefined | null,
    storage?: Storage
): PostDraftData | null {
    const uid = normalizeKeyPart(userId);
    const store = resolveStorage(storage);
    if (!uid || !store) return null;

    const key = getPostDraftKey(uid);
    try {
        const raw = store.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<PostDraftData>;
        if (
            !parsed ||
            typeof parsed !== "object" ||
            typeof parsed.updatedAt !== "number" ||
            Date.now() - parsed.updatedAt > DRAFT_TTL_MS
        ) {
            store.removeItem(key);
            return null;
        }
        return {
            title: typeof parsed.title === "string" ? parsed.title : "",
            content: typeof parsed.content === "string" ? parsed.content : "",
            tags: Array.isArray(parsed.tags) ? parsed.tags.filter((t): t is string => typeof t === "string") : [],
            communityId:
                typeof parsed.communityId === "string" || typeof parsed.communityId === "number"
                    ? parsed.communityId
                    : null,
            allowComments: typeof parsed.allowComments === "boolean" ? parsed.allowComments : true,
            pinned: typeof parsed.pinned === "boolean" ? parsed.pinned : false,
            isSpoiler: typeof parsed.isSpoiler === "boolean" ? parsed.isSpoiler : false,
            isNsfw: typeof parsed.isNsfw === "boolean" ? parsed.isNsfw : false,
            updatedAt: parsed.updatedAt,
        };
    } catch {
        try {
            store.removeItem(key);
        } catch {
            // ignore
        }
        return null;
    }
}

export function clearPostDraft(
    userId: string | number | undefined | null,
    storage?: Storage
): void {
    const uid = normalizeKeyPart(userId);
    const store = resolveStorage(storage);
    if (!uid || !store) return;

    try {
        store.removeItem(getPostDraftKey(uid));
    } catch {
        // ignore
    }
}

export function saveCommentDraft(
    userId: string | number | undefined | null,
    postId: string | number | undefined | null,
    content: string,
    parentCommentId?: string | number | null,
    storage?: Storage
): void {
    const uid = normalizeKeyPart(userId);
    const pid = normalizeKeyPart(postId);
    const store = resolveStorage(storage);
    if (!uid || !pid || !store) return;

    const parentId = normalizeKeyPart(parentCommentId);
    const key = parentId
        ? getReplyDraftKey(uid, pid, parentId)
        : getCommentDraftKey(uid, pid);

    try {
        if (!content.trim()) {
            store.removeItem(key);
            return;
        }
        const payload: CommentDraftData = {
            content,
            updatedAt: Date.now(),
        };
        store.setItem(key, JSON.stringify(payload));
    } catch {
        // Ignore storage quota or privacy mode errors
    }
}

export function loadCommentDraft(
    userId: string | number | undefined | null,
    postId: string | number | undefined | null,
    parentCommentId?: string | number | null,
    storage?: Storage
): string {
    const uid = normalizeKeyPart(userId);
    const pid = normalizeKeyPart(postId);
    const store = resolveStorage(storage);
    if (!uid || !pid || !store) return "";

    const parentId = normalizeKeyPart(parentCommentId);
    const key = parentId
        ? getReplyDraftKey(uid, pid, parentId)
        : getCommentDraftKey(uid, pid);

    try {
        const raw = store.getItem(key);
        if (!raw) return "";
        const parsed = JSON.parse(raw) as Partial<CommentDraftData>;
        if (
            !parsed ||
            typeof parsed !== "object" ||
            typeof parsed.content !== "string" ||
            typeof parsed.updatedAt !== "number" ||
            Date.now() - parsed.updatedAt > DRAFT_TTL_MS
        ) {
            store.removeItem(key);
            return "";
        }
        return parsed.content;
    } catch {
        try {
            store.removeItem(key);
        } catch {
            // ignore
        }
        return "";
    }
}

export function clearCommentDraft(
    userId: string | number | undefined | null,
    postId: string | number | undefined | null,
    parentCommentId?: string | number | null,
    storage?: Storage
): void {
    const uid = normalizeKeyPart(userId);
    const pid = normalizeKeyPart(postId);
    const store = resolveStorage(storage);
    if (!uid || !pid || !store) return;

    const parentId = normalizeKeyPart(parentCommentId);
    const key = parentId
        ? getReplyDraftKey(uid, pid, parentId)
        : getCommentDraftKey(uid, pid);

    try {
        store.removeItem(key);
    } catch {
        // ignore
    }
}

export function clearUserDrafts(
    userId: string | number | undefined | null,
    storage?: Storage
): void {
    const uid = normalizeKeyPart(userId);
    const store = resolveStorage(storage);
    if (!uid || !store) return;

    const postKey = getPostDraftKey(uid);
    const commentPrefix = `draft_comment_${uid}_`;
    const replyPrefix = `draft_reply_${uid}_`;

    try {
        const keysToDelete: string[] = [];
        for (let i = 0; i < store.length; i++) {
            const k = store.key(i);
            if (k && (k === postKey || k.startsWith(commentPrefix) || k.startsWith(replyPrefix))) {
                keysToDelete.push(k);
            }
        }
        keysToDelete.forEach((k) => store.removeItem(k));
    } catch {
        // ignore
    }
}
