import { create } from "zustand";
import { type DraftsState, type PostDraft } from "../types";

export * from "../types";

// Remove any legacy persisted drafts from previous versions
try {
    if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem("indieg-post-drafts-v1");
    }
} catch {
    // Ignore storage errors in restricted environments
}

export const useDraftsStore = create<DraftsState>()((set) => ({
    drafts: [],

    saveDraft: (draftData) => {
        const id = "latest-draft";
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")} - ${now.getDate()}/${now.getMonth() + 1}`;
        
        const newDraft: PostDraft = {
            ...draftData,
            id,
            updatedAt: timeStr,
        };
        set({ drafts: [newDraft] });
        return id;
    },

    deleteDraft: (id) => {
        set((state) => ({
            drafts: state.drafts.filter((d) => d.id !== id),
        }));
    },

    clearDrafts: () => set({ drafts: [] }),
}));

if (typeof window !== "undefined") {
    window.addEventListener("indieg:auth-cleared", () => {
        useDraftsStore.setState({ drafts: [] });
    });
}
