export type GameTabType = "overview" | "guides" | "reviews" | "updates" | "discussions";

export interface GameGuide {
    id: string;
    title: string;
    titleVi?: string;
    author: string;
    authorAvatar: string;
    authorUsername?: string;
    authorId?: string;
    rank?: string;
    category: "tactics" | "builds" | "secrets" | "general";
    content: string;
    contentVi?: string;
    likes: number;
    views: number;
    date: string;
}

export interface GameReview {
    id: string;
    author: string;
    authorAvatar: string;
    authorUsername?: string;
    authorId?: string;
    rating: number; // 1 to 10
    hoursPlayed?: string;
    content: string;
    contentVi?: string;
    date: string;
    recommended: boolean;
    likes: number;
}

export interface GameSystemReqs {
    minimum?: {
        os?: string;
        cpu?: string;
        gpu?: string;
        ram?: string;
        storage?: string;
    };
    recommended?: {
        os?: string;
        cpu?: string;
        gpu?: string;
        ram?: string;
        storage?: string;
    };
}

export interface GamePatchNote {
    id: string;
    version: string;
    title?: string;
    titleVi?: string;
    date: string;
    summary?: string;
    summaryVi?: string;
    type: "major" | "patch" | "hotfix" | "event";
    postId?: number;
}

export interface GameScreenshotItem {
    id: number | string;
    thumbnail: string;
    full: string;
}

export interface GameCategoryItem {
    id: number | string;
    description: string;
}

export interface GameData {
    slug: string;
    appid?: number;
    id?: string;
    aliases?: string[];
    name: string;
    tag?: string;
    type?: string;
    communityId?: string;
    steamUrl?: string;
    steamAvailable?: boolean;
    developer?: string;
    developers?: string[];
    publisher?: string;
    publishers?: string[];
    releaseDate?: string;
    releaseDateComingSoon?: boolean;
    platforms?: string[];
    genre?: string[];
    genres?: string[];
    categories?: GameCategoryItem[];
    isFree?: boolean;
    recommendationsCount?: number;
    metacriticScore?: number;
    metacriticUrl?: string;
    achievementsCount?: number;
    headerImage?: string;
    capsuleImage?: string;
    backgroundImage?: string;
    background?: string;
    backgroundRaw?: string;
    logoUrl?: string;
    bannerUrl?: string;
    capsuleUrl?: string;
    shortDescription?: string;
    description?: string;
    descriptionVi?: string;
    aboutTheGame?: string;
    features?: string[];
    screenshots: string[];
    screenshotItems?: GameScreenshotItem[];
    systemReqs?: GameSystemReqs;
    guides?: GameGuide[];
    reviews?: GameReview[];
    patchNotes?: GamePatchNote[];
    ratingScore?: number;
    totalReviewsCount?: number;
    sentiment?: string;
    sentimentVi?: string;
}
