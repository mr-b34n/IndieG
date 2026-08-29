import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export type ProfileStatus = "online" | "in-game" | "offline";
export type ProfileTab = "overview" | "games" | "posts" | "communities" | "achievements" | "friends" | "bookmarks" | "guestbook";

export interface Badge {
    id: string;
    title: string;
    desc: string;
    icon: IconDefinition;
    color: string;
    badgeText: string;
    earnedDate?: string;
    category?: string;
    rarity?: string;
    unlocked?: boolean;
}

export interface GearCategory {
    value: string;
    label: string;
    icon: IconDefinition;
    color: string;
}

export interface LibraryGame {
    id?: string | number;
    name: string;
    logo: string;
    hours: number;
    lastPlayed: string;
    achievements: number;
    totalAchievements: number;
    keyStat: string;
    rank: string;
    mvpCount: string;
    kdRatio: string;
    tagColor: string;
    skills?: { name: string; stars: number }[];
    ratingScore?: string;
    isFeatured?: boolean;
}

export interface FriendEntry {
    name: string;
    game: string | null;
    logo: string | null;
    status: ProfileStatus | "offline";
    isFriend: boolean;
}

export interface FriendRequest {
    id: string;
    name: string;
    game: string | null;
    logo: string | null;
    time: string;
}

export interface GuestbookComment {
    id: string;
    author: string;
    avatar: string;
    date: string;
    content: string;
    likes: number;
    isLiked: boolean;
}

export interface ProfileIdentity {
    name: string;
    username: string;
    bio: string;
    status: ProfileStatus;
    level?: number;
    currentXp?: number;
    maxXp?: number;
    titles?: string[];
    mainRoles?: string[];
    playstyles?: string[];
    usuallyPlays?: string[];
    accentColor?: string; // e.g. "from-cyan-500 to-blue-600"
}

export interface CommunityReputation {
    id: string;
    name: string;
    icon: string;
    tier: "Elite" | "Veteran" | "Regular" | "Member";
    color: string;
    postCount: number;
    upvotesCount: number;
}

export interface RecentActivityItem {
    id: string;
    type: "played" | "post" | "achievement" | "reply";
    title: string;
    subtitle?: string;
    timeAgo: string;
    upvotes?: number;
    icon?: string;
}
