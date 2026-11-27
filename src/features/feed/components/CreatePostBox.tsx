import React, { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useCommunitiesStore } from "@/features/community";
import { useCreatePostModalStore } from "@/features/feed/store/useCreatePostModalStore";
import { getCurrentAuthor } from "@/features/post";
import { UserAvatar } from "@/shared/components/ui/UserAvatar";
import {
    type CreatePostModalProps,
    type CreatePostPayload,
    CommunitySelector,
    FormattingToolbar,
} from "./create-post";

export type { CreatePostPayload, CreatePostModalProps };
export { CommunitySelector, FormattingToolbar };

/* =========================================================================
   CREATE POST BOX (FEED BANNER TRIGGER)
   ========================================================================= */
interface CreatePostBoxProps {
    onPostCreated?: (payload: CreatePostPayload) => void;
    defaultCommunityId?: number | string | null;
    hideCommunitySelector?: boolean;
    hideCommunity?: boolean;
    initialTitle?: string;
    initialContent?: string;
}

export const CreatePostBox = ({
    defaultCommunityId = null,
    hideCommunity = false,
}: CreatePostBoxProps) => {
    const { language } = useTranslation();
    const user = useAuthStore((s) => s.user);
    const customAvatar = useAuthStore((s) => s.customAvatar);
    const displayName = user?.name || user?.username || getCurrentAuthor();
    const avatarUrl =
        user?.avatarUrl ||
        user?.avatar_url ||
        customAvatar ||
        (user?.user_metadata?.avatar_url as string | undefined) ||
        "";

    const communities = useCommunitiesStore((s) => s.communities);
    const openCreatePost = useCreatePostModalStore((s) => s.openCreatePost);
    const navigate = useNavigate();

    const handleAvatarClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const profileTarget = user?.username
            ? `@${user.username.replace(/^@+/, "")}`
            : user?.id
            ? user.id
            : "me";
        navigate({ to: "/profile/$userId", params: { userId: profileTarget } });
    };

    const activeFilteredCommunity = useMemo(() => {
        if (!defaultCommunityId) return null;
        return communities.find((c) => String(c.id) === String(defaultCommunityId)) || null;
    }, [communities, defaultCommunityId]);

    const dynamicPlaceholder = useMemo(() => {
        if (activeFilteredCommunity && !hideCommunity) {
            return language === "vi"
                ? `Chia sẻ với ${activeFilteredCommunity.name}...`
                : `Share with ${activeFilteredCommunity.name}...`;
        }
        return language === "vi"
            ? "Chia sẻ khoảnh khắc, góc nhìn hoặc khám phá mới..."
            : "Share a moment, thought, or discovery...";
    }, [activeFilteredCommunity, hideCommunity, language]);

    return (
        <div id="create-post" className="w-full pb-2">
            {/* Feed Quick Trigger Bar */}
            <div className="w-full flex items-center gap-3">
                {/* User Avatar (outside box, navigates to user profile) */}
                <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="relative shrink-0 rounded-full outline-none focus:outline-none transition-transform active:scale-95 cursor-pointer"
                    title={displayName}
                    aria-label={displayName}
                >
                    <UserAvatar
                        src={avatarUrl}
                        name={displayName}
                        className="w-9 h-9 sm:w-10 sm:h-10"
                        textClassName="text-xs sm:text-sm"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-bg" />
                </button>

                {/* Capsule / Pill Box */}
                <div
                    onClick={() => openCreatePost(defaultCommunityId)}
                    className="flex-1 flex items-center gap-3 px-4 py-2 sm:py-2.5 rounded-full bg-surface-hover hover:bg-surface-active transition-all cursor-pointer group shadow-xs min-w-0"
                >
                    <div className="flex flex-col justify-center min-w-0 flex-1 pl-1">
                        <span className="text-xs sm:text-sm text-text-muted group-hover:text-text transition-colors truncate">
                            {dynamicPlaceholder}
                        </span>
                        {activeFilteredCommunity && !hideCommunity && (
                            <span className="text-[11px] text-primary font-bold truncate mt-0.5 flex items-center gap-1.5">
                                {activeFilteredCommunity.logo ? (
                                    <img
                                        src={activeFilteredCommunity.logo}
                                        alt=""
                                        className="w-3.5 h-3.5 rounded object-cover"
                                    />
                                ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                )}
                                <span>{activeFilteredCommunity.name}</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
