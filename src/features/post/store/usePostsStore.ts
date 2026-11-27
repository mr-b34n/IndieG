import { create } from "zustand";
import { type PostData, type PostsState } from "../types";

const MAX_LOCAL_POSTS = 60;
const MAX_POST_OVERRIDES = 120;

function trimOverrides(
    map: Record<string, Partial<PostData>>
): Record<string, Partial<PostData>> {
    const keys = Object.keys(map);
    if (keys.length <= MAX_POST_OVERRIDES) return map;
    const trimmed: Record<string, Partial<PostData>> = {};
    for (const k of keys.slice(keys.length - MAX_POST_OVERRIDES)) {
        trimmed[k] = map[k];
    }
    return trimmed;
}

export const usePostsStore = create<PostsState>((set, get) => ({
    posts: [],
    overrides: {},

    addPost: (post) =>
        set((state) => {
            const key = String(post.id);
            const exists = state.posts.some((p) => String(p.id) === key);
            if (exists) {
                return {
                    posts: state.posts.map((p) =>
                        String(p.id) === key ? { ...p, ...post } : p
                    ),
                };
            }
            return { posts: [post, ...state.posts].slice(0, MAX_LOCAL_POSTS) };
        }),

    updatePost: (id, updates) =>
        set((state) => {
            const key = String(id);
            const nextOverrides = trimOverrides({
                ...state.overrides,
                [key]: { ...(state.overrides[key] || {}), ...updates },
            });
            const hasInPosts = state.posts.some((p) => String(p.id) === key);
            return {
                overrides: nextOverrides,
                posts: hasInPosts
                    ? state.posts.map((p) => (String(p.id) === key ? { ...p, ...updates } : p))
                    : state.posts,
            };
        }),

    deletePost: (id) =>
        set((state) => {
            const key = String(id);
            const nextOverrides = { ...state.overrides };
            delete nextOverrides[key];
            return {
                overrides: nextOverrides,
                posts: state.posts.filter((p) => String(p.id) !== key),
            };
        }),

    getPostById: (id) => {
        const key = String(id);
        const found = get().posts.find((p) => String(p.id) === key);
        if (!found) return undefined;
        const patch = get().overrides[key];
        return patch ? { ...found, ...patch } : found;
    },
}));

if (typeof window !== "undefined") {
    const handleAuthCleared = () => {
        usePostsStore.setState({ posts: [], overrides: {} });
    };
    window.addEventListener("ludon:auth-cleared", handleAuthCleared);
    window.addEventListener("indieg:auth-cleared", handleAuthCleared);
}
