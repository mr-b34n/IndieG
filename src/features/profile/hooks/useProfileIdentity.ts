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
        const resolvedAvatarUrl =
            remoteProfile?.avatarUrl ||
            (remoteProfile as Record<string, unknown> | null)?.avatar_url as string | undefined ||
            (remoteProfile as Record<string, unknown> | null)?.avatar as string | undefined;

        const resolvedCoverUrl =
            remoteProfile?.coverUrl ||
            (remoteProfile as Record<string, unknown> | null)?.cover_url as string | undefined ||
            (remoteProfile as Record<string, unknown> | null)?.cover as string | undefined;

        const resolvedBio = typeof remoteProfile?.bio === "object" && remoteProfile?.bio !== null
            ? JSON.stringify(remoteProfile.bio)
            : (remoteProfile?.bio as string) || "";

        if (isOwnProfile) {
            return {
                name: remoteProfile?.name || remoteProfile?.username || currentAuthor,
                username: remoteProfile?.username
                    ? `@${remoteProfile.username}`
                    : `@${currentAuthor}`,
                bio: resolvedBio,
                status: "online",
                rank: remoteProfile?.rank ?? null,
                avatarUrl: resolvedAvatarUrl,
                coverUrl: resolvedCoverUrl,
                createdAt: remoteProfile?.createdAt,
            };
        }
        return {
            name: remoteProfile?.name || remoteProfile?.username || userId?.replace(/^@/, "") || "Gamer",
            username: remoteProfile?.username
                ? `@${remoteProfile.username}`
                : (userId?.startsWith("@") ? userId : `@${userId || "gamer"}`),
            bio: resolvedBio,
            status: "online",
            avatarUrl: resolvedAvatarUrl,
            coverUrl: resolvedCoverUrl,
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
