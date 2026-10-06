import { create } from "zustand";

interface CreatePostModalStore {
    isOpen: boolean;
    defaultCommunityId: string | number | null;
    openCreatePost: (communityId?: string | number | null) => void;
    closeCreatePost: () => void;
}

export const useCreatePostModalStore = create<CreatePostModalStore>((set) => ({
    isOpen: false,
    defaultCommunityId: null,
    openCreatePost: (communityId = null) => set({ isOpen: true, defaultCommunityId: communityId }),
    closeCreatePost: () => set({ isOpen: false, defaultCommunityId: null }),
}));
