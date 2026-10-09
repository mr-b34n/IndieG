import { create } from "zustand";

export interface PostActions {
    upvote: () => void;
    downvote: () => void;
    bookmark: () => void;
    pin: () => void;
}

interface FeedNavigationState {
    focusedPostId: string | number | null;
    postIds: (string | number)[];
    actionsMap: Record<string, PostActions>;

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
    actionsMap: {},

    setFocusedPostId: (id) => set({ focusedPostId: id }),

    registerPostIds: (ids) => {
        set({ postIds: ids });
        const current = get().focusedPostId;
        // If current focused post is not in list, leave it or reset if empty
        if (current && !ids.some((id) => String(id) === String(current))) {
            // Keep current or set to null
        }
    },

    registerPostActions: (id, actions) => {
        const key = String(id);
        set((state) => ({
            actionsMap: { ...state.actionsMap, [key]: actions },
        }));

        return () => {
            set((state) => {
                const next = { ...state.actionsMap };
                delete next[key];
                return { actionsMap: next };
            });
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
        const { focusedPostId, actionsMap } = get();
        if (!focusedPostId) return;
        actionsMap[String(focusedPostId)]?.upvote();
    },

    triggerDownvote: () => {
        const { focusedPostId, actionsMap } = get();
        if (!focusedPostId) return;
        actionsMap[String(focusedPostId)]?.downvote();
    },

    triggerBookmark: () => {
        const { focusedPostId, actionsMap } = get();
        if (!focusedPostId) return;
        actionsMap[String(focusedPostId)]?.bookmark();
    },

    triggerPin: () => {
        const { focusedPostId, actionsMap } = get();
        if (!focusedPostId) return;
        actionsMap[String(focusedPostId)]?.pin();
    },
}));
