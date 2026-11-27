import { create } from "zustand";

export interface PostActions {
    upvote: () => void;
    downvote: () => void;
    bookmark: () => void;
    pin: () => void;
}

// Non-reactive registry so mounting/unmounting <Post /> cards never triggers global Zustand re-renders
const actionsRegistry = new Map<string, PostActions>();

interface FeedNavigationState {
    focusedPostId: string | number | null;
    postIds: (string | number)[];

    setFocusedPostId: (id: string | number | null) => void;
    registerPostIds: (ids: (string | number)[]) => void;
    registerPostActions: (id: string | number, actions: PostActions) => () => void;

    focusNext: () => void;
    focusPrev: () => void;

    triggerUpvote: () => void;
    triggerDownvote: () => void;
    triggerBookmark: () => void;
    triggerPin: () => void;
}

export const useFeedNavigationStore = create<FeedNavigationState>((set, get) => ({
    focusedPostId: null,
    postIds: [],

    setFocusedPostId: (id) => set({ focusedPostId: id }),

    registerPostIds: (ids) => {
        set({ postIds: ids });
    },

    registerPostActions: (id, actions) => {
        const key = String(id);
        actionsRegistry.set(key, actions);

        return () => {
            if (actionsRegistry.get(key) === actions) {
                actionsRegistry.delete(key);
            }
        };
    },

    focusNext: () => {
        const { postIds, focusedPostId } = get();
        if (postIds.length === 0) return;

        let nextId: string | number;
        if (!focusedPostId) {
            nextId = postIds[0];
        } else {
            const idx = postIds.findIndex((id) => String(id) === String(focusedPostId));
            if (idx === -1 || idx >= postIds.length - 1) {
                nextId = postIds[postIds.length - 1];
            } else {
                nextId = postIds[idx + 1];
            }
        }

        set({ focusedPostId: nextId });
        const el = document.getElementById(`post-article-${nextId}`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    },

    focusPrev: () => {
        const { postIds, focusedPostId } = get();
        if (postIds.length === 0) return;

        let prevId: string | number;
        if (!focusedPostId) {
            prevId = postIds[0];
        } else {
            const idx = postIds.findIndex((id) => String(id) === String(focusedPostId));
            if (idx <= 0) {
                prevId = postIds[0];
            } else {
                prevId = postIds[idx - 1];
            }
        }

        set({ focusedPostId: prevId });
        const el = document.getElementById(`post-article-${prevId}`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    },

    triggerUpvote: () => {
        const { focusedPostId } = get();
        if (!focusedPostId) return;
        actionsRegistry.get(String(focusedPostId))?.upvote();
    },

    triggerDownvote: () => {
        const { focusedPostId } = get();
        if (!focusedPostId) return;
        actionsRegistry.get(String(focusedPostId))?.downvote();
    },

    triggerBookmark: () => {
        const { focusedPostId } = get();
        if (!focusedPostId) return;
        actionsRegistry.get(String(focusedPostId))?.bookmark();
    },

    triggerPin: () => {
        const { focusedPostId } = get();
        if (!focusedPostId) return;
        actionsRegistry.get(String(focusedPostId))?.pin();
    },
}));

if (typeof window !== "undefined") {
    const handleAuthCleared = () => {
        actionsRegistry.clear();
        useFeedNavigationStore.setState({ focusedPostId: null, postIds: [] });
    };
    window.addEventListener("ludon:auth-cleared", handleAuthCleared);
    window.addEventListener("indieg:auth-cleared", handleAuthCleared);
}
