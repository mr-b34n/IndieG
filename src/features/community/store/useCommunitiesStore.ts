import { create } from "zustand";
import { type CommunitiesState, type CommunityData } from "../types";
import { INITIAL_COMMUNITIES } from "../constants";
import { communitiesApi, mapCommunityDtoToCommunityData, type CommunityDto, type CreateCommunityDto, type GetCommunitiesParams } from "@/shared/api";

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
    joinedCommunityIds: INITIAL_COMMUNITIES.filter((c) => c.joined).map((c) => String(c.id)),
    isLoading: false,
    error: null,

    syncJoinedCommunities: (items: unknown) => {
        const list = extractCommunityList(items);
        const joinedIds = new Set<string>();
        const mappedJoined: CommunityData[] = list.map((item) => {
            const base = mapCommunityDtoToCommunityData(item);
            joinedIds.add(String(base.id));
            return {
                ...base,
                joined: true,
            };
        });

        set((state) => {
            const existingMap = new Map(state.communities.map((c) => [String(c.id), c]));
            mappedJoined.forEach((item) => {
                const prev = existingMap.get(String(item.id));
                existingMap.set(String(item.id), {
                    ...prev,
                    ...item,
                    joined: true,
                });
            });

            const mergedList = Array.from(existingMap.values()).map((c) => ({
                ...c,
                joined: joinedIds.has(String(c.id)) ? true : c.joined,
            }));

            const allJoinedIds = Array.from(
                new Set([...state.joinedCommunityIds, ...Array.from(joinedIds)])
            );

            return {
                communities: mergedList,
                joinedCommunityIds: allJoinedIds,
            };
        });
    },

    mergeCommunities: (items: unknown, isJoinedList = false) => {
        const list = extractCommunityList(items);
        if (!Array.isArray(list) || list.length === 0) return;

        set((state) => {
            const joinedSet = new Set(state.joinedCommunityIds);
            if (isJoinedList) {
                list.forEach((item) => joinedSet.add(String(item.id)));
            }

            const existingMap = new Map(state.communities.map((c) => [String(c.id), c]));

            list.forEach((item) => {
                const base = mapCommunityDtoToCommunityData(item);
                const prev = existingMap.get(String(base.id));
                const isJoined =
                    isJoinedList ||
                    joinedSet.has(String(base.id)) ||
                    item.joined === true ||
                    item.isJoined === true ||
                    (prev?.joined ?? false);

                if (isJoined) {
                    joinedSet.add(String(base.id));
                }

                existingMap.set(String(base.id), {
                    ...prev,
                    ...base,
                    joined: isJoined,
                });
            });

            return {
                communities: Array.from(existingMap.values()),
                joinedCommunityIds: Array.from(joinedSet),
                isLoading: false,
            };
        });
    },

    fetchCommunities: async (params?: GetCommunitiesParams) => {
        set({ isLoading: true, error: null });
        try {
            const res = await communitiesApi.getAll(params || { limit: 9 });
            get().mergeCommunities(res, params?.type === "joined");
            set({ isLoading: false });
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : "Failed to load communities";
            set({ error: errorMsg, isLoading: false });
        }
    },

    toggleJoin: (id) => {
        const strId = String(id);
        const targetComm = get().communities.find((c) => String(c.id) === strId);
        const willBeJoined = targetComm ? !targetComm.joined : true;

        set((state) => {
            const nextJoinedSet = new Set(state.joinedCommunityIds);
            if (willBeJoined) {
                nextJoinedSet.add(strId);
            } else {
                nextJoinedSet.delete(strId);
            }

            const updatedCommunities = state.communities.map((c) => {
                if (String(c.id) === strId) {
                    return {
                        ...c,
                        joined: willBeJoined,
                        members: willBeJoined ? c.members + 1 : Math.max(0, c.members - 1),
                    };
                }
                return c;
            });

            return {
                communities: updatedCommunities,
                joinedCommunityIds: Array.from(nextJoinedSet),
            };
        });

        // Trigger backend join/leave API
        if (typeof id === "string" && !id.startsWith("comm_")) {
            if (willBeJoined) {
                communitiesApi.join(id).catch(() => {
                    // Handled gracefully in offline or dev preview
                });
            } else {
                communitiesApi.leave(id).catch(() => {
                    // Handled gracefully in offline or dev preview
                });
            }
        }
    },

    toggleJoinCommunity: (id) => get().toggleJoin(id),

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
