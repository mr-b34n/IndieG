import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type DraftsState } from "../types";

export * from "../types";

export const useDraftsStore = create<DraftsState>()(
    persist(
        (set) => ({
            drafts: [
                {
                    id: "draft-sample-1",
                    title: "Kinh nghiệm leo rank thần tốc trong game Indie",
                    content: "Hôm nay mình muốn chia sẻ một vài tips nho nhỏ khi build đội hình #IndieG #Tips...",
                    privacy: "public",
                    allowComments: true,
                    pinned: false,
                    communityId: 1,
                    updatedAt: "10 phút trước",
                },
            ],

            saveDraft: (draftData) => {
                const id = draftData.id || `draft-${Date.now()}`;
                const now = new Date();
                const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")} - ${now.getDate()}/${now.getMonth() + 1}`;
                
                set((state) => {
                    const existingIndex = state.drafts.findIndex((d) => d.id === id);
                    if (existingIndex >= 0) {
                        const updatedDrafts = [...state.drafts];
                        updatedDrafts[existingIndex] = {
                            ...updatedDrafts[existingIndex],
                            ...draftData,
                            id,
                            updatedAt: timeStr,
                        };
                        return { drafts: updatedDrafts };
                    } else {
                        const newDraft: PostDraft = {
                            ...draftData,
                            id,
                            updatedAt: timeStr,
                        };
                        return { drafts: [newDraft, ...state.drafts] };
                    }
                });
                return id;
            },

            deleteDraft: (id) => {
                set((state) => ({
                    drafts: state.drafts.filter((d) => d.id !== id),
                }));
            },

            clearDrafts: () => set({ drafts: [] }),
        }),
        {
            name: "indieg-post-drafts-v1",
        }
    )
);
