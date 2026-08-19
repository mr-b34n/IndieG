import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faStar,
    faGamepad,
    faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "@tanstack/react-router";
import type { NewsItem } from "../types";

interface EditorialNewsSectionProps {
    items: NewsItem[];
}

export const EditorialNewsSection = ({ items }: EditorialNewsSectionProps) => {
    const navigate = useNavigate();
    if (!items.length) return null;

    const highlightItem = items.find((item) => item.isHighlight) || items[0];
    const secondaryItems = items.filter((item) => item.id !== highlightItem.id);

    return (
        <section className="w-full flex flex-col gap-4 select-none">
            {/* Section Header: Bold Uppercase + Subheading + Divider */}
            <div className="flex flex-col gap-1 pb-2 border-b border-divider-primary">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-black tracking-wider text-text uppercase flex items-center gap-2">
                        <span>NEWS & FEATURED</span>
                        <span className="text-primary text-xs font-normal">/</span>
                        <span className="text-xs font-bold text-rose-500 uppercase tracking-normal">VIETNAMESE INDIE SPOTLIGHT</span>
                    </h2>
                </div>
                <p className="text-xs text-text-muted">
                    Discover games and studio highlights developed by Vietnamese creators
                </p>
            </div>

            {/* Editorial Asymmetric Grid: 1 Large Hero Feature + 3 Compact Stories */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Large Main Feature (7 Cols on desktop) */}
                <div 
                    onClick={() => {
                        if (highlightItem.linkSlug) {
                            navigate({ to: `/game/${highlightItem.linkSlug}` });
                        } else {
                            navigate({ to: "/community" });
                        }
                    }}
                    className="lg:col-span-7 relative h-[280px] sm:h-[340px] rounded-[6px] overflow-hidden group cursor-pointer border border-divider-primary bg-surface shadow-md"
                >
                    <img 
                        src={highlightItem.imageUrl}
                        alt={highlightItem.title}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    
                    <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end">
                        <div className="flex flex-col gap-1.5 max-w-xl">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-black/60 px-2 py-0.5 rounded-[4px] border border-rose-500/30 flex items-center gap-1">
                                    <FontAwesomeIcon icon={faGamepad} className="text-[9px]" />
                                    {highlightItem.developer}
                                </span>
                                <span className="text-[10px] font-bold text-gray-300 bg-black/50 px-2 py-0.5 rounded-[4px]">
                                    {highlightItem.status}
                                </span>
                            </div>

                            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug group-hover:text-primary transition-colors">
                                {highlightItem.title}
                            </h3>

                            <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed font-normal">
                                {highlightItem.description}
                            </p>

                            <div className="flex items-center gap-3 pt-1">
                                <span className="text-xs font-bold text-primary flex items-center gap-1.5 group-hover:underline">
                                    <span>Read spotlight & discuss</span>
                                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Stories Column (5 Cols on desktop, 3 stacked editorial tiles) */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                    {secondaryItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => {
                                if (item.linkSlug) {
                                    navigate({ to: `/game/${item.linkSlug}` });
                                } else {
                                    navigate({ to: "/community" });
                                }
                            }}
                            className="flex items-center gap-3.5 p-2 rounded-[6px] hover:bg-surface-hover/60 transition-colors cursor-pointer border border-divider-primary/40 group"
                        >
                            {/* Thumbnail (4-6px radius) */}
                            <div className="relative w-24 sm:w-28 h-20 shrink-0 rounded-[4px] overflow-hidden bg-surface border border-divider-primary">
                                <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/20" />
                            </div>

                            {/* Story Info */}
                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider truncate">
                                        {item.developer}
                                    </span>
                                    {item.rating && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 shrink-0">
                                            <FontAwesomeIcon icon={faStar} className="text-[9px]" />
                                            {item.rating}
                                        </span>
                                    )}
                                </div>

                                <h4 className="text-xs sm:text-sm font-black text-text group-hover:text-primary transition-colors truncate">
                                    {item.title}
                                </h4>

                                <p className="text-[11px] text-text-muted line-clamp-1 leading-snug">
                                    {item.genre} · {item.date}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
