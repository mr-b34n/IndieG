import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { usePostsStore } from "../store/usePostsStore";
import { usePostVoteInteraction } from "../api/interaction-api";
import { type PostData } from "../types";

export interface UsePostVoteOptions {
    post: PostData;
    onEdit?: (id: string | number, data: Partial<PostData>) => void;
}

export function usePostVote({ post, onEdit }: UsePostVoteOptions) {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const isLoggedIn = !!user;
    const requireVerifiedEmail = useAuthStore((state) => state.requireVerifiedEmail);
    const voteMutation = usePostVoteInteraction(post.id);

    const [localVoteOverride, setLocalVoteOverride] = useState<{
        postId: string | number;
        voteType: number;
        upvotes: number;
        downvotes: number;
    } | null>(null);

    const currentVoteType = (localVoteOverride && String(localVoteOverride.postId) === String(post.id))
        ? localVoteOverride.voteType
        : (post.currentUserVoteType ?? 0);

    const upvoteCount = (localVoteOverride && String(localVoteOverride.postId) === String(post.id))
        ? localVoteOverride.upvotes
        : (post.upvotes ?? post.likes ?? 0);

    const downvoteCount = (localVoteOverride && String(localVoteOverride.postId) === String(post.id))
        ? localVoteOverride.downvotes
        : (post.downvotes ?? 0);

    const isLiked = currentVoteType === 1;
    const isDownvoted = currentVoteType === -1;
    const score = upvoteCount - downvoteCount;

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            navigate({ to: "/auth" });
            return;
        }
        if (!requireVerifiedEmail("upvote bài viết")) return;

        let nextUp: number;
        let nextDown = downvoteCount;
        let nextVoteType: number;

        if (isLiked) {
            nextUp = Math.max(0, upvoteCount - 1);
            nextVoteType = 0;
            voteMutation.mutate(null);
        } else {
            nextUp = upvoteCount + 1;
            if (isDownvoted) {
                nextDown = Math.max(0, downvoteCount - 1);
            }
            nextVoteType = 1;
            voteMutation.mutate(1);
        }

        setLocalVoteOverride({
            postId: post.id,
            voteType: nextVoteType,
            upvotes: nextUp,
            downvotes: nextDown,
        });

        const updates = {
            upvotes: nextUp,
            downvotes: nextDown,
            likes: nextUp,
            score: nextUp - nextDown,
            currentUserVoteType: nextVoteType,
        };

        usePostsStore.getState().updatePost(post.id, updates);
        if (onEdit) {
            onEdit(post.id, updates);
        }
    };

    const handleDownvote = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            navigate({ to: "/auth" });
            return;
        }
        if (!requireVerifiedEmail("downvote bài viết")) return;

        let nextUp = upvoteCount;
        let nextDown: number;
        let nextVoteType: number;

        if (isDownvoted) {
            nextDown = Math.max(0, downvoteCount - 1);
            nextVoteType = 0;
            voteMutation.mutate(null);
        } else {
            nextDown = downvoteCount + 1;
            if (isLiked) {
                nextUp = Math.max(0, upvoteCount - 1);
            }
            nextVoteType = -1;
            voteMutation.mutate(-1);
        }

        setLocalVoteOverride({
            postId: post.id,
            voteType: nextVoteType,
            upvotes: nextUp,
            downvotes: nextDown,
        });

        const updates = {
            upvotes: nextUp,
            downvotes: nextDown,
            likes: nextUp,
            score: nextUp - nextDown,
            currentUserVoteType: nextVoteType,
        };

        usePostsStore.getState().updatePost(post.id, updates);
        if (onEdit) {
            onEdit(post.id, updates);
        }
    };

    return {
        score,
        isLiked,
        isDownvoted,
        handleLike,
        handleDownvote,
    };
}
