import { create } from "zustand";
import type { PostData } from "../components/Post";
import { ALL_POSTS } from "../mockPosts";

interface PostsState {
    posts: PostData[];
    addPost: (post: PostData) => void;
    updatePost: (
        id: string | number,
        updates: Pick<PostData, "title" | "content" | "images" | "files">
    ) => void;
    deletePost: (id: string | number) => void;
    getPostById: (id: string | number) => PostData | undefined;
}

export const usePostsStore = create<PostsState>((set, get) => ({
    posts: ALL_POSTS,

    addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),

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
