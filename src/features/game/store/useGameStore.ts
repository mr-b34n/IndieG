import { create } from "zustand";
import { type GameGuide, type GameReview } from "../types";

interface GameStoreState {
    followedSlugs: string[];
    customGuides: Record<string, GameGuide[]>; // slug -> guides
    customReviews: Record<string, GameReview[]>; // slug -> reviews
    toggleFollowGame: (slug: string) => void;
    isFollowing: (slug: string) => boolean;
    addGuide: (slug: string, guide: Omit<GameGuide, "id" | "date" | "likes" | "views">) => void;
    addReview: (slug: string, review: Omit<GameReview, "id" | "date" | "likes">) => void;
    likeGuide: (slug: string, guideId: string) => void;
    likeReview: (slug: string, reviewId: string) => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
    followedSlugs: ["counter-strike-2", "raft", "red-dead-redemption-2", "grand-theft-auto-v", "elden-ring"],
    customGuides: {},
    customReviews: {},

    toggleFollowGame: (slug: string) => {
        const cleanSlug = slug.toLowerCase();
        set((state) => {
            const exists = state.followedSlugs.includes(cleanSlug);
            return {
                followedSlugs: exists
                    ? state.followedSlugs.filter((s) => s !== cleanSlug)
                    : [...state.followedSlugs, cleanSlug],
            };
        });
    },

    isFollowing: (slug: string) => {
        return get().followedSlugs.includes(slug.toLowerCase());
    },

    addGuide: (slug, guide) => {
        const cleanSlug = slug.toLowerCase();
        const newGuide: GameGuide = {
            ...guide,
            id: `guide-custom-${Date.now()}`,
            likes: 1,
            views: 1,
            date: "Vừa xong",
        };
        set((state) => ({
            customGuides: {
                ...state.customGuides,
                [cleanSlug]: [newGuide, ...(state.customGuides[cleanSlug] || [])],
            },
        }));
    },

    addReview: (slug, review) => {
        const cleanSlug = slug.toLowerCase();
        const newReview: GameReview = {
            ...review,
            id: `rev-custom-${Date.now()}`,
            likes: 1,
            date: "Vừa xong",
        };
        set((state) => ({
            customReviews: {
                ...state.customReviews,
                [cleanSlug]: [newReview, ...(state.customReviews[cleanSlug] || [])],
            },
        }));
    },

    likeGuide: (slug, guideId) => {
        const cleanSlug = slug.toLowerCase();
        set((state) => {
            const list = state.customGuides[cleanSlug] || [];
            const updated = list.map((g) => (g.id === guideId ? { ...g, likes: g.likes + 1 } : g));
            return {
                customGuides: {
                    ...state.customGuides,
                    [cleanSlug]: updated,
                },
            };
        });
    },

    likeReview: (slug, reviewId) => {
        const cleanSlug = slug.toLowerCase();
        set((state) => {
            const list = state.customReviews[cleanSlug] || [];
            const updated = list.map((r) => (r.id === reviewId ? { ...r, likes: r.likes + 1 } : r));
            return {
                customReviews: {
                    ...state.customReviews,
                    [cleanSlug]: updated,
                },
            };
        });
    },
}));
