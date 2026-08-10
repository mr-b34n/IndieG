import { create } from "zustand";
import { type CommunitiesState } from "../types";
import { INITIAL_COMMUNITIES } from "../constants";

export * from "../types";

export const useCommunitiesStore = create<CommunitiesState>((set, get) => ({
    communities: INITIAL_COMMUNITIES,
    toggleJoin: (id) =>
        set((state) => ({
            communities: state.communities.map((c) =>
                c.id === id
                    ? {
                          ...c,
                          joined: !c.joined,
                          members: c.joined ? c.members - 1 : c.members + 1,
                      }
                    : c
            ),
        })),
    getCommunityById: (id) => get().communities.find((c) => c.id === id),
    addCommunity: (community) =>
        set((state) => ({ communities: [community, ...state.communities] })),
    updateCommunity: (id, data) =>
        set((state) => ({
            communities: state.communities.map((c) =>
                c.id === id ? { ...c, ...data } : c
            ),
        })),
    deleteCommunity: (id) =>
        set((state) => ({
            communities: state.communities.filter((c) => c.id !== id),
        })),
}));
