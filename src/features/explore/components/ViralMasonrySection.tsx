import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFire,
    faHeart,
    faPlay,
    faComment,
    faImage,
    faMessage,
    faNewspaper,
    faFaceLaughSquint
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "@tanstack/react-router";
import type { ViralMediaTile } from "../types";

interface ViralMasonrySectionProps {
    tiles: ViralMediaTile[];
}

const getContentTypeMeta = (type: ViralMediaTile["contentType"]) => {
    switch (type) {
        case "DISCUSSION":
            return { label: "DISCUSSION", icon: faMessage, color: "text-blue-400" };
        case "VIDEO":
            return { label: "VIDEO", icon: faPlay, color: "text-purple-400" };
        case "SCREENSHOT":
            return { label: "SCREENSHOT", icon: faImage, color: "text-emerald-400" };
        case "NEWS":
            return { label: "NEWS", icon: faNewspaper, color: "text-amber-400" };
        case "MEME":
            return { label: "MEME", icon: faFaceLaughSquint, color: "text-rose-400" };
        default:
            return { label: "POST", icon: faMessage, color: "text-text-muted" };
    }
};

export const ViralMasonrySection = ({ tiles }: ViralMasonrySectionProps) => {
    const navigate = useNavigate();
    if (!tiles.length) return null;

    return (
        <section className="w-full flex flex-col gap-4 select-none">
            {/* Section Header */}
            <div className="flex flex-col gap-1 pb-2 border-b border-divider-primary">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-black tracking-wider text-text uppercase flex items-center gap-2">
                        <FontAwesomeIcon icon={faFire} className="text-orange-500 text-xs" />
                        <span>VIRAL NOW</span>
                    </h2>
                </div>
                <p className="text-xs text-text-muted">
                    What's capturing the community's attention right now
                </p>
            </div>

            {/* Asymmetric Masonry Grid of Media Tiles (4-6px radius, no box wrapping) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[220px]">
                {tiles.map((tile) => {
                    const meta = getContentTypeMeta(tile.contentType);

                    return (
                        <div
                            key={tile.id}
                            onClick={() => navigate({ to: "/post/1" })}
                            className={`relative rounded-[6px] overflow-hidden group cursor-pointer border border-divider-primary bg-surface shadow-md ${
                                tile.colSpan || "col-span-1 row-span-1"
                            }`}
                        >
                            {/* Background Image / Media Artwork */}
                            <img
                                src={tile.imageUrl}
                                alt={tile.title}
                                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                            />

                            {/* Contrast Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60 pointer-events-none" />

                            {/* Top Bar: Content Type Badge + Author + Likes */}
                            <div className="absolute top-0 left-0 right-0 p-3 sm:p-3.5 flex items-center justify-between gap-2 z-10">
                                {/* Content Type Tag (e.g. DISCUSSION, VIDEO, SCREENSHOT) */}
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-black/70 backdrop-blur-xs border border-white/10">
                                    <FontAwesomeIcon icon={meta.icon} className={`text-[9px] ${meta.color}`} />
                                    <span className="text-[10px] font-black tracking-wider uppercase text-white/90">
                                        {meta.label}
                                    </span>
                                </div>

                                {/* Author & Stats */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-semibold text-gray-300 bg-black/60 px-2 py-0.5 rounded-[4px] hidden sm:inline-block">
                                        @{tile.author}
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] font-black text-rose-400 bg-black/70 px-2 py-0.5 rounded-[4px] border border-rose-500/20">
                                        <FontAwesomeIcon icon={faHeart} className="text-[9px]" />
                                        {tile.likes}
                                    </span>
                                </div>
                            </div>

                            {/* Center Play Button for Videos */}
                            {tile.contentType === "VIDEO" && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                    <div className="w-11 h-11 rounded-[6px] bg-black/65 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-primary transition-all duration-300 shadow-xl">
                                        <FontAwesomeIcon icon={faPlay} className="text-xs ml-0.5" />
                                    </div>
                                </div>
                            )}

                            {/* Bottom Title & Game Tag Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-4 z-10 flex flex-col gap-1">
                                {tile.gameTag && (
                                    <span className="text-[10px] font-bold text-primary-300 uppercase tracking-wide">
                                        {tile.gameTag}
                                    </span>
                                )}
                                <h3 className="text-xs sm:text-sm font-black text-white leading-snug group-hover:text-primary transition-colors line-clamp-2 drop-shadow-sm">
                                    {tile.title}
                                </h3>

                                <div className="flex items-center justify-between text-[10px] text-gray-300 font-medium pt-0.5">
                                    <span className="sm:hidden text-gray-300">
                                        @{tile.author}
                                    </span>
                                    {tile.commentsCount && (
                                        <span className="flex items-center gap-1 text-gray-300">
                                            <FontAwesomeIcon icon={faComment} className="text-[9px]" />
                                            {tile.commentsCount}
                                        </span>
                                    )}
                                    {tile.videoDuration && (
                                        <span className="font-mono text-gray-300 bg-black/60 px-1 rounded">
                                            {tile.videoDuration}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
