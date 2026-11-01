import { create } from "zustand";
import { type PostsState } from "../types";
export const usePostsStore = create<PostsState>((set, get) => ({
    posts: [],

    addPost: (post) =>
        set((state) => {
            const exists = state.posts.some((p) => String(p.id) === String(post.id));
            if (exists) {
                return {
                    posts: state.posts.map((p) =>
                        String(p.id) === String(post.id) ? { ...p, ...post } : p
                    ),
                };
            }
            return { posts: [post, ...state.posts] };
        }),

    updatePost: (id, updates) =>
        set((state) => ({
            posts: state.posts.map((p) =>
                p.id.toString() === id.toString() ? { ...p, ...updates } : p
            ),
        })),

    deletePost: (id) =>
        set((state) => ({
            posts: state.posts.filter((p) => p.id.toString() !== id.toString()),
        })),

    getPostById: (id) =>
        get().posts.find((p) => p.id.toString() === id.toString()),
}));

if (typeof window !== "undefined") {
    window.addEventListener("indieg:auth-cleared", () => {
        usePostsStore.setState({ posts: [] });
    });
}
