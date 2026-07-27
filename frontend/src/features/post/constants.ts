import { faStar, faUsers, faFire } from "@fortawesome/free-solid-svg-icons";

export const POST_TAG_CLASSES = [
    "bg-tag-1/10 text-tag-1",
    "bg-tag-2/10 text-tag-2",
    "bg-tag-3/10 text-tag-3",
    "bg-tag-4/10 text-tag-4",
    "bg-tag-5/10 text-tag-5",
];

export const POST_BADGE_MAP = {
    foryou: { icon: faStar, label: "Recommended", classes: "text-tag-4 bg-tag-4/10 border border-tag-4/20" },
    following: { icon: faUsers, label: "Following", classes: "text-primary bg-primary-soft border border-primary/20" },
    hot: { icon: faFire, label: "Trending", classes: "text-accent-500 bg-accent-500/10 border border-accent-500/20" },
};
