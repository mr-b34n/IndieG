export type CommunityTabKey = "discover" | "trending" | "joined";

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

export interface CommunitiesState {
    communities: CommunityData[];
    toggleJoin: (id: string | number) => void;
    getCommunityById: (id: string | number) => CommunityData | undefined;
    addCommunity: (community: CommunityData) => void;
}
