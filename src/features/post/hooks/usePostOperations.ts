import React from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { postsApi } from "@/shared/api";
import { usePostsStore } from "../store/usePostsStore";
import { type PostData } from "../types";

export interface UsePostOperationsOptions {
    post: PostData;
    onDelete?: (id: string | number) => void;
    onEdit?: (id: string | number, data: Partial<PostData>) => void;
    setShowActionMenu: (show: boolean) => void;
    setShowEditModal: (show: boolean) => void;
}

export function usePostOperations({
    post,
    onDelete,
    onEdit,
    setShowActionMenu,
    setShowEditModal,
}: UsePostOperationsOptions) {
    const user = useAuthStore((state) => state.user);
    const isLoggedIn = !!user;
    const requireVerifiedEmail = useAuthStore((state) => state.requireVerifiedEmail);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!requireVerifiedEmail("xóa bài viết")) return;
        usePostsStore.getState().deletePost(post.id);
        onDelete?.(post.id);
        setShowActionMenu(false);
        try {
            await postsApi.deletePost(post.id);
        } catch {
            // Local deletion completed
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!requireVerifiedEmail("chỉnh sửa bài viết")) return;
        setShowActionMenu(false);
        setShowEditModal(true);
    };

    const handleSaveEdit = async (data: Partial<PostData>) => {
        if (!requireVerifiedEmail("chỉnh sửa bài viết")) return;

        const currentTags = post.tags || [];
        let updatedTags = data.tags !== undefined ? data.tags : [...currentTags];
        if (data.isSpoiler !== undefined) {
            updatedTags = data.isSpoiler
                ? [...updatedTags.filter((t) => t.toLowerCase() !== "spoiler"), "spoiler"]
                : updatedTags.filter((t) => t.toLowerCase() !== "spoiler");
        }
        if (data.isNsfw !== undefined) {
            updatedTags = data.isNsfw
                ? [...updatedTags.filter((t) => t.toLowerCase() !== "nsfw"), "nsfw"]
                : updatedTags.filter((t) => t.toLowerCase() !== "nsfw");
        }

        const updates: Partial<PostData> = {
            ...data,
            tags: updatedTags,
        };

        usePostsStore.getState().updatePost(post.id, updates);
        onEdit?.(post.id, updates);
        try {
            await postsApi.updatePost(post.id, {
                title: data.title,
                content: data.content,
                images: data.images,
                tags: updatedTags,
                gameTag: data.gameTag,
                ...(data.pinned !== undefined && user?.role === "admin" ? { pinned: data.pinned } : {}),
                allowComments: data.allowComments,
            });
        } catch {
            // Local state is already updated
        }
    };

    const handleToggleAllowComments = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!requireVerifiedEmail("cài đặt bình luận")) return;
        const nextAllowComments = post.allowComments === false;
        setShowActionMenu(false);
        const updates: Partial<PostData> = { allowComments: nextAllowComments };
        usePostsStore.getState().updatePost(post.id, updates);
        onEdit?.(post.id, updates);
        try {
            await postsApi.updatePost(post.id, {
                allowComments: nextAllowComments,
            });
        } catch {
            // Local state is already updated
        }
    };

    const handleToggleSpoiler = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!requireVerifiedEmail("cài đặt cảnh báo spoiler")) return;
        const nextSpoiler = !post.isSpoiler;
        setShowActionMenu(false);
        const currentTags = post.tags || [];
        const newTags = nextSpoiler
            ? [...currentTags.filter((t) => t.toLowerCase() !== "spoiler"), "spoiler"]
            : currentTags.filter((t) => t.toLowerCase() !== "spoiler");

        const updates: Partial<PostData> = { isSpoiler: nextSpoiler, tags: newTags };
        usePostsStore.getState().updatePost(post.id, updates);
        onEdit?.(post.id, updates);
        try {
            await postsApi.updatePost(post.id, { tags: newTags });
        } catch {
            // Local state is already updated
        }
    };

    const handleToggleNsfw = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!requireVerifiedEmail("cài đặt cảnh báo 18+ (NSFW)")) return;
        const nextNsfw = !post.isNsfw;
        setShowActionMenu(false);
        const currentTags = post.tags || [];
        const newTags = nextNsfw
            ? [...currentTags.filter((t) => t.toLowerCase() !== "nsfw"), "nsfw"]
            : currentTags.filter((t) => t.toLowerCase() !== "nsfw");

        const updates: Partial<PostData> = { isNsfw: nextNsfw, tags: newTags };
        usePostsStore.getState().updatePost(post.id, updates);
        onEdit?.(post.id, updates);
        try {
            await postsApi.updatePost(post.id, { tags: newTags });
        } catch {
            // Local state is already updated
        }
    };

    const handleTogglePin = async (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!isLoggedIn) return;
        if (!requireVerifiedEmail("ghim bài viết")) return;

        setShowActionMenu(false);
        const nextPinned = !post.pinned;
        const updates: Partial<PostData> = { pinned: nextPinned };
        usePostsStore.getState().updatePost(post.id, updates);
        onEdit?.(post.id, updates);
        try {
            await postsApi.updatePost(post.id, { pinned: nextPinned });
        } catch {
            // Local state is already updated
        }
    };

    return {
        handleDelete,
        handleEdit,
        handleSaveEdit,
        handleToggleAllowComments,
        handleToggleSpoiler,
        handleToggleNsfw,
        handleTogglePin,
    };
}
