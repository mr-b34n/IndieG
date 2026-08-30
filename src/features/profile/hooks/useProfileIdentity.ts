import { useState, useMemo } from "react";
import type { ProfileIdentity } from "../types";
import type { UserProfileDto } from "@/shared/api/types";

interface UseProfileIdentityArgs {
    userId: string;
    isOwnProfile: boolean;
    currentAuthor: string;
    remoteProfile?: UserProfileDto | null;
}

/**
 * Resolves display identity (name/username/bio/status) for the profile being viewed,
 * and keeps local editable copies in sync whenever the viewed profile or remote data changes.
 */
export function useProfileIdentity({ userId, isOwnProfile, currentAuthor, remoteProfile }: UseProfileIdentityArgs) {
    const initial = useMemo<ProfileIdentity>(() => {
        if (isOwnProfile) {
            return {
                name: remoteProfile?.name || remoteProfile?.username || currentAuthor,
                username: remoteProfile?.username
                    ? `@${remoteProfile.username}`
                    : `@${currentAuthor.toLowerCase().replace(/\s+/g, "_")}`,
                bio: remoteProfile?.bio || "",
                status: "online",
                avatarUrl: remoteProfile?.avatarUrl,
                coverUrl: remoteProfile?.coverUrl,
                createdAt: remoteProfile?.createdAt,
            };
        }
        return {
            name: remoteProfile?.name || remoteProfile?.username || userId?.replace(/^@/, "") || "Gamer",
            username: remoteProfile?.username
                ? `@${remoteProfile.username}`
                : (userId?.startsWith("@") ? userId : `@${userId || "gamer"}`),
            bio: remoteProfile?.bio || "",
            status: "online",
            avatarUrl: remoteProfile?.avatarUrl,
            coverUrl: remoteProfile?.coverUrl,
            createdAt: remoteProfile?.createdAt,
        };
    }, [userId, isOwnProfile, currentAuthor, remoteProfile]);

    const [prevInitial, setPrevInitial] = useState<ProfileIdentity>(initial);
    const [identity, setIdentity] = useState<ProfileIdentity>(initial);

    if (initial !== prevInitial) {
        setPrevInitial(initial);
        setIdentity(initial);
    }

    return { identity, setIdentity };
}
