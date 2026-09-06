import { create } from "zustand";
import {
    CS2_LOGO as cs2Logo,
    RAFT_LOGO as raftLogo,
    RDR2_LOGO as rdr2Logo,
    DEFAULT_AVATAR as avatarDefault
} from "@/shared/constants/images";
import { getCurrentAuthor } from "@/features/post/helpers/getCurrentAuthor";
import { type Squad, type SquadMember, type SquadStatus, type SquadState } from "../types";
import { INITIAL_SQUADS } from "../constants";

export * from "../types";

export const useSquadStore = create<SquadState>((set) => ({
    squads: INITIAL_SQUADS,
    activeTab: "explore",
    filterGame: "all",
    searchQuery: "",

    setActiveTab: (tab) => set({ activeTab: tab }),
    setFilterGame: (game) => set({ filterGame: game }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    addSquad: (newSquadData) => {
        const currentAuthor = getCurrentAuthor();
        const newSquad: Squad = {
            id: `squad-${Date.now()}`,
            name: newSquadData.name,
            game: newSquadData.game,
            gameLogo: newSquadData.game.includes("CS2") || newSquadData.game.includes("Counter") ? cs2Logo : newSquadData.game.includes("Raft") ? raftLogo : rdr2Logo,
            description: newSquadData.description,
            tags: newSquadData.tags.length > 0 ? newSquadData.tags : ["🤝 Tìm Đồng Đội", newSquadData.game],
            currentMembers: 1,
            maxMembers: newSquadData.maxMembers,
            voice: newSquadData.voice,
            isMySquad: true,
            roomCode: newSquadData.roomCode || `#SQUAD-${Math.floor(1000 + Math.random() * 9000)}`,
            discordUrl: newSquadData.discordUrl,
            createdAt: "Vừa xong",
            status: "recruiting",
            members: [
                {
                    id: `m-${Date.now()}`,
                    username: currentAuthor,
                    avatar: avatarDefault,
                    role: "Leader",
                    status: "online",
                    playtime: "Vừa tạo",
                },
            ],
        };

        set((state) => ({
            squads: [newSquad, ...state.squads],
            activeTab: "my-squads",
        }));
    },

    joinSquad: (squadId) => {
        const currentAuthor = getCurrentAuthor();

        set((state) => {
            const updatedSquads: Squad[] = state.squads.map((sq) => {
                if (sq.id !== squadId) return sq;
                if (sq.isMySquad || sq.currentMembers >= sq.maxMembers) return sq;

                const newMember: SquadMember = {
                    id: `m-${Date.now()}`,
                    username: currentAuthor,
                    avatar: avatarDefault,
                    role: "Member",
                    status: "online",
                    playtime: "Vừa tham gia",
                };

                const newCount = sq.currentMembers + 1;
                const newStatus: SquadStatus = newCount >= sq.maxMembers ? "full" : "recruiting";
                return {
                    ...sq,
                    isMySquad: true,
                    currentMembers: newCount,
                    status: newStatus,
                    members: [...sq.members, newMember],
                };
            });
            return { squads: updatedSquads };
        });
    },

    leaveSquad: (squadId) => {
        const currentAuthor = getCurrentAuthor();
        set((state) => {
            const updatedSquads: Squad[] = state.squads.map((sq) => {
                if (sq.id !== squadId || !sq.isMySquad) return sq;
                const filteredMembers = sq.members.filter((m) => m.username !== currentAuthor);
                const newCount = Math.max(0, sq.currentMembers - 1);
                const newStatus: SquadStatus = "recruiting";
                return {
                    ...sq,
                    isMySquad: false,
                    currentMembers: newCount,
                    status: newStatus,
                    members: filteredMembers,
                };
            });
            return { squads: updatedSquads };
        });
    },

    kickMember: (squadId, memberUsername) => {
        set((state) => {
            const updatedSquads: Squad[] = state.squads.map((sq) => {
                if (sq.id !== squadId) return sq;
                const filteredMembers = sq.members.filter((m) => m.username !== memberUsername);
                const newCount = Math.max(0, sq.currentMembers - 1);
                const newStatus: SquadStatus = "recruiting";
                return {
                    ...sq,
                    currentMembers: newCount,
                    status: newStatus,
                    members: filteredMembers,
                };
            });
            return { squads: updatedSquads };
        });
    },

    deleteSquad: (squadId) => {
        set((state) => ({
            squads: state.squads.filter((s) => s.id !== squadId),
        }));
    },

    toggleSquadStatus: (squadId) => {
        set((state) => {
            const updatedSquads: Squad[] = state.squads.map((sq) => {
                if (sq.id !== squadId) return sq;
                const newStatus: SquadStatus = sq.status === "recruiting" ? "full" : "recruiting";
                return {
                    ...sq,
                    status: newStatus,
                };
            });
            return { squads: updatedSquads };
        });
    },
}));
