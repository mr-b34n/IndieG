import { create } from "zustand";

import cs2Logo from "../../../assets/logos/cs2-logo.webp";
import rdr2Logo from "../../../assets/logos/rdr2-logo.png";
import raftLogo from "../../../assets/logos/raft-logo.png";

import cs2Bg from "../../../assets/bgs/cs2_bg.jpg";
import raftBg from "../../../assets/bgs/raft_bg.jpg";
import rdr2Bg from "../../../assets/bgs/rdr_2_bg.jpg";

export interface CommunityData {
    id: string | number;
    name: string;
    logo: string;
    backdrop: string;
    category: string;
    description: string;
    members: number;
    onlineNow: number;
    tags: string[];
    joined: boolean;
    featured?: boolean;
}

interface CommunitiesState {
    communities: CommunityData[];
    toggleJoin: (id: string | number) => void;
    getCommunityById: (id: string | number) => CommunityData | undefined;
    addCommunity: (community: CommunityData) => void;
}

export const useCommunitiesStore = create<CommunitiesState>((set, get) => ({
    // Mỗi tựa game chỉ có đúng 1 community — bên trong community đó là nơi
    // chứa các thread bình thường (không tạo community theo chủ đề/topic).
    communities: [
        {
            id: "raft",
            name: "Raft",
            logo: raftLogo,
            backdrop: raftBg,
            category: "Survival",
            description:
                "Cộng đồng chính thức của Raft: mẹo sinh tồn, base build, farming route và ý tưởng thiết kế trên biển.",
            members: 24540,
            onlineNow: 416,
            tags: ["raft", "survival", "coop"],
            joined: true,
            featured: true,
        },
        {
            id: "cs2",
            name: "Counter Strike 2",
            logo: cs2Logo,
            backdrop: cs2Bg,
            category: "FPS",
            description:
                "Cộng đồng chính thức của CS2: chiến thuật, patch notes, tuyển quân và highlight clip.",
            members: 76190,
            onlineNow: 1614,
            tags: ["cs2", "esports", "fps"],
            joined: false,
            featured: true,
        },
        {
            id: "rdr2",
            name: "Red Dead Redemption 2",
            logo: rdr2Logo,
            backdrop: rdr2Bg,
            category: "Open World",
            description:
                "Cộng đồng chính thức của Red Dead Redemption 2: ảnh đẹp, build nhân vật và chuyện miền viễn Tây.",
            members: 9750,
            onlineNow: 128,
            tags: ["rdr2", "openworld", "story"],
            joined: false,
        },
    ],
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
}));