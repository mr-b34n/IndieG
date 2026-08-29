import { create } from "zustand";
import { type CommunitiesState, type CommunityData } from "../types";
import { INITIAL_COMMUNITIES } from "../constants";
import { notificationApi } from "@/features/notification";
import { communitiesApi, mapCommunityDtoToCommunityData, type CommunityDto, type CreateCommunityDto } from "@/shared/api";

export * from "../types";

function extractCommunityList(res: unknown): CommunityDto[] {
    if (!res) return [];
    if (Array.isArray(res)) return res as CommunityDto[];
    if (typeof res === "object") {
        const obj = res as Record<string, unknown>;
        if (Array.isArray(obj.items)) return obj.items as CommunityDto[];
        if (Array.isArray(obj.data)) return obj.data as CommunityDto[];
        if (Array.isArray(obj.communities)) return obj.communities as CommunityDto[];
    }
    return [];
}

export const useCommunitiesStore = create<CommunitiesState>((set, get) => ({
    communities: INITIAL_COMMUNITIES,
    isLoading: false,
    error: null,

    fetchCommunities: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await communitiesApi.getAll();
            const list = extractCommunityList(res);
            
            if (Array.isArray(list)) {
                if (list.length > 0) {
                    const mappedList: CommunityData[] = list.map((item) => ({
                        ...mapCommunityDtoToCommunityData(item),
                        // Preserve local joined state if available
                        joined: get().communities.find((c) => String(c.id) === String(item.id))?.joined ?? false,
                    }));
                    set({ communities: mappedList, isLoading: false });
                } else {
                    // Empty list returned from backend
                    set({ communities: [], isLoading: false });
                }
            } else {
                set({ isLoading: false });
            }
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : "Failed to load communities";
            // In case of error (e.g. backend offline), keep existing data
            set({ error: errorMsg, isLoading: false });
        }
    },

    toggleJoin: (id) => {
        const targetComm = get().communities.find((c) => c.id === id);
        const newJoinedState = targetComm ? !targetComm.joined : true;

        set((state) => ({
            communities: state.communities.map((c) =>
                c.id === id
                    ? {
                          ...c,
                          joined: !c.joined,
                          members: c.joined ? Math.max(0, c.members - 1) : c.members + 1,
                      }
                    : c
            ),
        }));

        if (targetComm) {
            void notificationApi.createNotification({
                type: "community",
                referenceId: String(id),
                title: "Thành viên Cộng đồng",
                message: newJoinedState
                    ? `Bạn đã gia nhập cộng đồng "${targetComm.name}"`
                    : `Bạn đã rời khỏi cộng đồng "${targetComm.name}"`,
                link: `/community/${id}`,
                avatarUrl: targetComm.logo,
            });
        }
    },

    getCommunityById: (id) => get().communities.find((c) => String(c.id) === String(id)),

    addCommunity: (community) =>
        set((state) => ({ communities: [community, ...state.communities] })),

    createCommunity: async (dto: CreateCommunityDto) => {
        try {
            const res = await communitiesApi.create(dto);
            if (res && res.id) {
                const newComm: CommunityData = {
                    ...mapCommunityDtoToCommunityData(res),
                    joined: true,
                };
                set((state) => ({ communities: [newComm, ...state.communities] }));
                return newComm;
            }
        } catch {
            // Local fallback handled by caller
        }
        return null;
    },

    updateCommunity: (id, data) => {
        set((state) => ({
            communities: state.communities.map((c) =>
                String(c.id) === String(id) ? { ...c, ...data } : c
            ),
        }));
        // Fire and forget backend update if not local-only id
        if (typeof id === "string" && !id.startsWith("comm_")) {
            void communitiesApi.update(id, {
                name: data.name,
                logo: data.logo,
                backdrop: data.backdrop,
                category: data.category,
                description: data.description,
                tags: data.tags,
                featured: data.featured,
            }).catch(() => {
                // Keep local changes
            });
        }
    },

    deleteCommunity: (id) => {
        set((state) => ({
            communities: state.communities.filter((c) => String(c.id) !== String(id)),
        }));
        if (typeof id === "string" && !id.startsWith("comm_")) {
            void communitiesApi.delete(id).catch(() => {
                // Keep local state
            });
        }
    },
}));
