export type CommunityTabKey = "discover" | "trending" | "joined";

export interface CommunityMember {
    username: string;
    displayName: string;
    avatar?: string;
    role: "owner" | "admin" | "mod" | "member";
    joinedAt: string;
}

export interface CommunityData {
    id: string | number;
    name: string;
    logo: string;
    backdrop: string;
    category: string;
    description: string;
    members: number;
    membersCount?: number;
    onlineNow: number;
    onlineCount?: number;
    game?: string | { name: string; slug?: string; id?: string | number };
    gameSlug?: string;
    tags: string[];
    joined: boolean;
    featured?: boolean;
    isLocked?: boolean;
    autoApprovePosts?: boolean;
    announcement?: string;
    isNsfw?: boolean;
    owner?: string;
    admins?: string[];
    mods?: string[];
    rules?: string[];
    memberList?: CommunityMember[];
}

export interface CommunitiesState {
    communities: CommunityData[];
    isLoading: boolean;
    error: string | null;
    fetchCommunities: () => Promise<void>;
    toggleJoin: (id: string | number) => void;
    toggleJoinCommunity: (id: string | number) => void;
    getCommunityById: (id: string | number) => CommunityData | undefined;
    addCommunity: (community: CommunityData) => void;
    createCommunity?: (dto: { name: string; category?: string; description?: string; logo?: string; backdrop?: string; tags?: string[] }) => Promise<CommunityData | null>;
    updateCommunity: (id: string | number, data: Partial<CommunityData>) => void;
    deleteCommunity: (id: string | number) => void;
}
