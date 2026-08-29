import { faCompass, faFire, faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { type CommunityData, type CommunityTabKey } from "./types";

export const TAG_CLASSES = [
    "bg-surface-hover/70 text-text-muted border border-border/50 hover:bg-surface-hover transition-colors",
];

export const BANNER_GRADIENTS = [
    "from-brand-500/60 via-brand-400/20 to-transparent",
    "from-accent-500/60 via-accent-400/20 to-transparent",
    "from-success-500/60 via-success-400/20 to-transparent",
    "from-tag-5/60 via-tag-5/20 to-transparent",
];

export const COMMUNITY_TABS: { key: CommunityTabKey; label: string; icon: typeof faCompass }[] = [
    { key: "discover", label: "Khám phá", icon: faCompass },
    { key: "trending", label: "Thịnh hành", icon: faFire },
    { key: "joined", label: "Đã tham gia", icon: faLayerGroup },
];

export const INITIAL_COMMUNITIES: CommunityData[] = [];

export const formatCompactNumber = (num: number): string => {
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + 'M';
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + 'k';
    }
    return num.toString();
};

