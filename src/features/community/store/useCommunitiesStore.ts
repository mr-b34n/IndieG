import { create } from "zustand";
import { type CommunitiesState, type CommunityData } from "../types";
import { INITIAL_COMMUNITIES } from "../constants";
import {
    communitiesApi,
    communityMembersApi,
    mapCommunityDtoToCommunityData,
    extractCommunityList,
    isGenericTestCommunity,
    type CreateCommunityDto,
    type GetCommunitiesParams,
} from "@/shared/api";

export * from "../types";

export const useCommunitiesStore = create<CommunitiesState>((set, get) => ({
    communities: INITIAL_COMMUNITIES.filter((c) => !isGenericTestCommunity(c)),
    joinedCommunityIds: INITIAL_COMMUNITIES.filter((c) => c.joined && !isGenericTestCommunity(c)).map((c) => String(c.id)),
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

            const mergedList = Array.from(existingMap.values()).map((c) => {
                const isJoined = joinedIds.has(String(c.id)) || (c.slug ? joinedIds.has(String(c.slug).toLowerCase()) : false);
                return {
                    ...c,
                    joined: isJoined,
                };
            });

            return {
                communities: mergedList,
                joinedCommunityIds: Array.from(joinedIds),
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
                if (isGenericTestCommunity(item)) return;
                const base = mapCommunityDtoToCommunityData(item);
                if (isGenericTestCommunity(base)) return;
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
        const strId = String(id).toLowerCase();
        const targetComm = get().communities.find(
            (c) => String(c.id).toLowerCase() === strId || (c.slug && c.slug.toLowerCase() === strId)
        );
        const willBeJoined = targetComm ? !targetComm.joined : true;
        const commId = targetComm ? String(targetComm.id) : String(id);
        const commSlug = targetComm?.slug ? String(targetComm.slug).toLowerCase() : undefined;

        set((state) => {
            const nextJoinedSet = new Set(state.joinedCommunityIds.map((s) => String(s).toLowerCase()));
            const targetIdLower = commId.toLowerCase();
            if (willBeJoined) {
                nextJoinedSet.add(strId);
                nextJoinedSet.add(targetIdLower);
                if (commSlug) nextJoinedSet.add(commSlug);
            } else {
                nextJoinedSet.delete(strId);
                nextJoinedSet.delete(targetIdLower);
                if (commSlug) nextJoinedSet.delete(commSlug);
            }

            const updatedCommunities = state.communities.map((c) => {
                const isMatch =
                    String(c.id).toLowerCase() === strId ||
                    (c.slug && c.slug.toLowerCase() === strId) ||
                    String(c.id).toLowerCase() === targetIdLower;
                if (isMatch) {
                    const currentMembers = c.members ?? c.membersCount ?? 1;
                    const nextMembers = willBeJoined ? currentMembers + 1 : Math.max(0, currentMembers - 1);
                    return {
                        ...c,
                        joined: willBeJoined,
                        members: nextMembers,
                        membersCount: nextMembers,
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
        const apiTargetId = targetComm?.id || id;
        if (apiTargetId) {
            const apiCall = willBeJoined
                ? communityMembersApi.join(String(apiTargetId))
                : communityMembersApi.leave(String(apiTargetId));
            apiCall.catch(() => {
                // Handled gracefully in offline or dev preview
            });
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

if (typeof window !== "undefined") {
    window.addEventListener("indieg:auth-cleared", () => {
        useCommunitiesStore.setState({
            communities: INITIAL_COMMUNITIES.filter((c) => !isGenericTestCommunity(c)),
            joinedCommunityIds: INITIAL_COMMUNITIES.filter((c) => c.joined && !isGenericTestCommunity(c)).map((c) => String(c.id)),
            isLoading: false,
            error: null,
        });
    });
}
