import type { FriendEntry, FriendRequest } from "./types";

/**
 * Safely parse a friend item into FriendEntry
 */
export function extractFriendEntry(item: unknown, currentUserId?: string): FriendEntry | null {
    if (!item || typeof item !== "object") return null;
    const obj = item as Record<string, unknown>;

    let targetUser: Record<string, unknown> | null = null;
    const friendshipId = typeof obj.id === "string" ? obj.id : undefined;

    if (obj.user && typeof obj.user === "object") {
        targetUser = obj.user as Record<string, unknown>;
    } else if (obj.requester && typeof obj.requester === "object" && obj.requesterId && obj.requesterId !== currentUserId) {
        targetUser = obj.requester as Record<string, unknown>;
    } else if (obj.addressee && typeof obj.addressee === "object" && obj.addresseeId && obj.addresseeId !== currentUserId) {
        targetUser = obj.addressee as Record<string, unknown>;
    } else if (obj.addressee && typeof obj.addressee === "object") {
        targetUser = obj.addressee as Record<string, unknown>;
    } else if (obj.requester && typeof obj.requester === "object") {
        targetUser = obj.requester as Record<string, unknown>;
    } else if (obj.username || obj.name || obj.displayName) {
        targetUser = obj;
    }

    if (!targetUser) return null;

    const rawId = typeof targetUser.id === "string" ? targetUser.id : (typeof targetUser.userId === "string" ? targetUser.userId : friendshipId || "");
    const name = String(targetUser.displayName || targetUser.name || targetUser.username || "Gamer");
    const username = typeof targetUser.username === "string" ? targetUser.username : "";
    const handle = username ? `@${username.replace(/^@/, "")}` : `@${name.toLowerCase().replace(/\s+/g, "")}`;
    const avatar = (targetUser.avatarUrl || targetUser.avatar_url || targetUser.avatar) as string | undefined;
    const game = typeof targetUser.title === "string" ? targetUser.title : null;

    return {
        id: rawId,
        userId: typeof targetUser.id === "string" ? targetUser.id : undefined,
        friendshipId,
        name,
        handle,
        avatar,
        logo: avatar || null,
        game,
        status: "online",
        isFriend: true,
    };
}

/**
 * Safely parse a friend request into FriendRequest
 */
export function extractFriendRequest(item: unknown): FriendRequest | null {
    if (!item || typeof item !== "object") return null;
    const obj = item as Record<string, unknown>;
    const id = typeof obj.id === "string" ? obj.id : "";
    if (!id) return null;

    const userObj = (obj.requester || obj.addressee || obj.user || obj) as Record<string, unknown>;
    const name = String(userObj.displayName || userObj.name || userObj.username || "Người dùng");
    const username = typeof userObj.username === "string" ? userObj.username : "";
    const handle = username ? `@${username.replace(/^@/, "")}` : `@${name.toLowerCase().replace(/\s+/g, "")}`;
    const avatar = (userObj.avatarUrl || userObj.avatar_url || userObj.avatar) as string | undefined;
    const game = typeof userObj.title === "string" ? userObj.title : null;

    let time = "Gần đây";
    if (typeof obj.createdAt === "string") {
        try {
            const date = new Date(obj.createdAt);
            time = date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
        } catch {
            time = "Gần đây";
        }
    }

    return {
        id,
        userId: typeof userObj.id === "string" ? userObj.id : undefined,
        name,
        handle,
        avatar,
        logo: avatar || null,
        game,
        time,
    };
}
