import { create } from "zustand";

interface BookmarksState {
    bookmarkedIds: (string | number)[];
    isBookmarked: (id: string | number) => boolean;
    toggleBookmark: (id: string | number) => void;
    addBookmark: (id: string | number) => void;
    removeBookmark: (id: string | number) => void;
}

export const useBookmarksStore = create<BookmarksState>((set, get) => ({
    bookmarkedIds: [],

    isBookmarked: (id) =>
        get().bookmarkedIds.some((b) => b.toString() === id.toString()),

    toggleBookmark: (id) =>
        set((state) => {
            const exists = state.bookmarkedIds.some((b) => b.toString() === id.toString());
            return {
                bookmarkedIds: exists
                    ? state.bookmarkedIds.filter((b) => b.toString() !== id.toString())
                    : [id, ...state.bookmarkedIds],
            };
        }),

    addBookmark: (id) =>
        set((state) =>
            state.bookmarkedIds.some((b) => b.toString() === id.toString())
                ? state
                : { bookmarkedIds: [id, ...state.bookmarkedIds] }
        ),

    removeBookmark: (id) =>
        set((state) => ({
            bookmarkedIds: state.bookmarkedIds.filter((b) => b.toString() !== id.toString()),
        })),
}));