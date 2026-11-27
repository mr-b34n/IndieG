import { create } from "zustand";
import { type GameData } from "../types";
import { INITIAL_GAMES, getGameBySlug as fallbackGetGameBySlug } from "../constants";
import { usersApi } from "@/shared/api";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const FOLLOWED_KEY = "ludon_followed_games";
const LEGACY_FOLLOWED_KEY = "indieg_followed_games";

// Purge legacy full-catalog localStorage dump if present from older versions
if (typeof window !== "undefined") {
    try {
        window.localStorage.removeItem("ludon_games_data");
        window.localStorage.removeItem("indieg_games_data");
    } catch {
        // Ignore storage errors
    }
}

const loadFollowedSlugs = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
        const saved = localStorage.getItem(FOLLOWED_KEY) || localStorage.getItem(LEGACY_FOLLOWED_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch {
        // Fallback
    }
    return [];
};

const saveFollowedSlugs = (slugs: string[]) => {
    if (typeof window !== "undefined") {
        try {
            localStorage.setItem(FOLLOWED_KEY, JSON.stringify(slugs));
        } catch {
            // Ignore
        }
    }
};

const MAX_IN_MEMORY_GAMES = 60;

interface GameStoreState {
    games: GameData[];
    followedSlugs: string[];
    quickAccessSlugs: string[];
    
    getGameBySlug: (slug: string) => GameData;
    addGame: (game: GameData) => void;
    updateGame: (slug: string, updates: Partial<GameData>) => void;
    deleteGame: (slug: string) => void;

    toggleFollowGame: (slug: string) => void;
    setFollowedSlugs: (slugs: string[]) => void;
    setQuickAccessSlugs: (slugs: string[]) => void;
    isFollowing: (slug: string) => boolean;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
    games: INITIAL_GAMES,
    followedSlugs: loadFollowedSlugs(),
    quickAccessSlugs: [],

    getGameBySlug: (slug: string) => {
        if (!slug) return get().games[0] || INITIAL_GAMES[0];
        const cleanSlug = slug.trim().toLowerCase();
        const found = get().games.find(
            (g) =>
                g.slug === cleanSlug ||
                g.id === cleanSlug ||
                g.aliases?.includes(cleanSlug) ||
                g.tag?.toLowerCase() === cleanSlug.replace(/-/g, " ")
        );
        if (found) return found;
        return fallbackGetGameBySlug(cleanSlug);
    },

    addGame: (newGame: GameData) => {
        set((state) => {
            const exists = state.games.some((g) => g.slug === newGame.slug);
            const updated = exists
                ? state.games.map((g) => (g.slug === newGame.slug ? { ...g, ...newGame } : g))
                : [newGame, ...state.games].slice(0, MAX_IN_MEMORY_GAMES);
            return { games: updated };
        });
    },

    updateGame: (slug: string, updates: Partial<GameData>) => {
        const cleanSlug = slug.trim().toLowerCase();
        set((state) => {
            const updated = state.games.map((g) =>
                g.slug === cleanSlug || g.id === cleanSlug ? { ...g, ...updates } : g
            );
            return { games: updated };
        });
    },

    deleteGame: (slug: string) => {
        const cleanSlug = slug.trim().toLowerCase();
        set((state) => {
            const updated = state.games.filter((g) => g.slug !== cleanSlug && g.id !== cleanSlug);
            return { games: updated };
        });
    },

    toggleFollowGame: (slug: string) => {
        const cleanSlug = slug.toLowerCase();
        let nextSlugs: string[] = [];
        set((state) => {
            const exists = state.followedSlugs.includes(cleanSlug);
            const updated = exists
                ? state.followedSlugs.filter((s) => s !== cleanSlug)
                : [...state.followedSlugs, cleanSlug];
            nextSlugs = updated;
            saveFollowedSlugs(updated);
            return { followedSlugs: updated };
        });
        if (useAuthStore.getState().user) {
            void usersApi.updateSettings({ followedGameSlugs: nextSlugs }).catch(() => {
                // Keep optimistic local state if offline
            });
        }
    },

    setFollowedSlugs: (slugs: string[]) => {
        const normalized = Array.from(new Set(slugs.map((s) => s.trim().toLowerCase()).filter(Boolean)));
        saveFollowedSlugs(normalized);
        set({ followedSlugs: normalized });
    },

    setQuickAccessSlugs: (slugs: string[]) => {
        set({ quickAccessSlugs: slugs.slice(0, 4) });
    },

    isFollowing: (slug: string) => {
        return get().followedSlugs.includes(slug.toLowerCase());
    },
}));

