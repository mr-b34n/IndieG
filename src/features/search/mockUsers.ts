import { MOCK_USERS as MOCK_USERS_RAW } from "@/mocks/users.mock";
import { type SearchUser } from "./types";

export const MOCK_USERS: SearchUser[] = MOCK_USERS_RAW.map((u) => ({
    id: u.id,
    name: u.displayName || u.name,
    username: u.username.startsWith("@") ? u.username : `@${u.username}`,
    avatar: u.avatar || u.avatarUrl,
    avatarUrl: u.avatarUrl || u.avatar,
    bio: u.bio,
    status: (u.status as "online" | "offline" | "in-game") || "online",
    isOnline: !!u.isOnline,
    game: u.game || u.favoriteGame,
    favoriteGame: u.favoriteGame || u.game,
    badge: u.badge,
    isFriend: !!u.isFriend,
}));
