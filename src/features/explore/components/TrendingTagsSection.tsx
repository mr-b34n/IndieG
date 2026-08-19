import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faFire } from "@fortawesome/free-solid-svg-icons";
import type { TrendingTag } from "../types";

interface TrendingTagsSectionProps {
    tags: TrendingTag[];
    onSelectTag?: (tag: string) => void;
}

export const TrendingTagsSection = ({ tags, onSelectTag }: TrendingTagsSectionProps) => {
    if (!tags.length) return null;

    return (
        <section className="w-full flex flex-col gap-2.5 select-none">
            {/* Header */}
            <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faArrowTrendUp} className="text-primary text-xs" />
                <span className="text-[11px] font-black uppercase tracking-wider text-text-faint">
                    TRENDING TOPICS & HASHTAGS
                </span>
            </div>

            {/* Text-only Trending Strip (No bulky pill backgrounds) */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-1">
                {tags.map((tag) => (
                    <button
                        key={tag.id}
                        type="button"
                        onClick={() => onSelectTag?.(tag.name)}
                        className="group flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer text-left"
                    >
                        {tag.isHot && (
                            <FontAwesomeIcon icon={faFire} className="text-[10px] text-orange-500 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-text-muted group-hover:text-primary font-mono tracking-wide">
                            {tag.name}
                        </span>
                        {tag.count && (
                            <span className="text-[10px] text-text-faint font-normal">
                                ({tag.count})
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </section>
    );
};
