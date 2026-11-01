import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronLeft,
    faChevronRight,
    faExpand,
    faMicrochip,
    faDesktop,
    faMemory,
    faHdd,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { Lightbox } from "@/shared/components/ui/Lightbox";
import { type GameData, type GameScreenshotItem, type GameTabType } from "../types";

interface GameOverviewTabProps {
    game: GameData;
    relatedPosts?: any[];
    relatedGuides?: any[];
    relatedGames?: GameData[];
    onViewCommunity?: () => void;
    onNavigateToTab?: (tab: GameTabType) => void;
}

export const GameOverviewTab: React.FC<GameOverviewTabProps> = ({
    game,
    relatedGames = [],
}) => {
    const { lang } = useTranslation();
    const isVietnamese = lang === "vi";
    const navigate = useNavigate();

    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [showFullDesc, setShowFullDesc] = useState(false);

    // Resolve structured screenshot items (thumbnail vs full)
    const screenshotItems: GameScreenshotItem[] =
        game.screenshotItems && game.screenshotItems.length > 0
            ? game.screenshotItems
            : (game.screenshots || []).map((s, idx) => ({ id: idx, thumbnail: s, full: s }));

    const hasMedia = screenshotItems.length > 0;
    const activeMedia = screenshotItems[selectedMediaIndex] || screenshotItems[0];
    const fullImagesList = screenshotItems.map((item) => item.full);

    const handlePrevMedia = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedMediaIndex((prev) => (prev === 0 ? screenshotItems.length - 1 : prev - 1));
    };

    const handleNextMedia = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedMediaIndex((prev) => (prev === screenshotItems.length - 1 ? 0 : prev + 1));
    };

    // Clean and prepare HTML string for aboutTheGame
    const rawAboutText = game.aboutTheGame || game.shortDescription || game.description || "";
    const shortDescText = game.shortDescription && game.shortDescription !== game.aboutTheGame
        ? game.shortDescription
        : null;

    return (
        <div className="flex flex-col gap-10 text-text">
            {/* 1. GAME INTRODUCTION (Redesigned with quote mark in top-right corner) */}
            <section className="flex flex-col relative">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold tracking-tight text-text">
                        {isVietnamese ? "Giới thiệu trò chơi" : "About the Game"}
                    </h2>
                    <span className="text-3xl sm:text-4xl font-serif text-text-muted/30 select-none leading-none pointer-events-none">
                        “
                    </span>
                </div>

                <div className="relative text-[15px] sm:text-base text-text-muted leading-relaxed">
                    {shortDescText && (
                        <p className="text-sm sm:text-base text-text/90 font-normal leading-relaxed mb-4 italic">
                            {shortDescText}
                        </p>
                    )}

                    <div
                        className={`prose prose-invert max-w-none text-text-muted font-normal leading-relaxed break-words [&_h2]:text-text [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2.5 [&_h3]:text-text [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_ul]:space-y-1.5 [&_li]:my-1 [&_p]:my-3 [&_strong]:text-text [&_strong]:font-semibold [&_br]:leading-relaxed ${
                            !showFullDesc && rawAboutText.length > 500 ? "max-h-[300px] overflow-hidden" : ""
                        }`}
                        dangerouslySetInnerHTML={{
                            __html: rawAboutText || (isVietnamese ? "Đang cập nhật thông tin giới thiệu." : "No description available."),
                        }}
                    />
                    {!showFullDesc && rawAboutText.length > 500 && (
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                    )}
                </div>

                {rawAboutText.length > 500 && (
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => setShowFullDesc(!showFullDesc)}
                            className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
                        >
                            {showFullDesc
                                ? (isVietnamese ? "Thu gọn" : "Show less")
                                : (isVietnamese ? "Đọc thêm" : "Read more")}
                        </button>
                    </div>
                )}
            </section>

            {/* 2. SCREENSHOTS & GAMEPLAY GALLERY (Restrained radius & effect, outline on focus) */}
            {hasMedia && (
                <section className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight text-text">
                            {isVietnamese ? "Hình ảnh & Gameplay" : "Screenshots & Gameplay"}
                        </h2>
                        <span className="text-xs font-mono text-text-muted font-medium bg-surface/60 px-2 py-0.5 rounded border border-border/20">
                            {selectedMediaIndex + 1} / {screenshotItems.length}
                        </span>
                    </div>

                    {/* Image Viewport (Restrained radius, no heavy effect) */}
                    <div
                        className="w-full aspect-video bg-black rounded overflow-hidden cursor-pointer relative group border border-border/20"
                        onClick={() => setLightboxIndex(selectedMediaIndex)}
                    >
                        <img
                            src={activeMedia.full}
                            alt={`Screenshot ${selectedMediaIndex + 1}`}
                            className="w-full h-full object-cover"
                        />

                        {/* Top-Left Image Counter Overlay */}
                        <div className="absolute top-3 left-3 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded font-mono pointer-events-none">
                            {selectedMediaIndex + 1} / {screenshotItems.length}
                        </div>

                        {/* Expand Button Overlay */}
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 hover:bg-black text-white text-xs px-2.5 py-1 rounded flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faExpand} className="text-xs" />
                            <span>{isVietnamese ? "Xem toàn màn hình" : "View full size"}</span>
                        </div>

                        {/* Previous & Next Navigation Controls */}
                        {screenshotItems.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={handlePrevMedia}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90 cursor-pointer"
                                    title={isVietnamese ? "Ảnh trước" : "Previous"}
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextMedia}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90 cursor-pointer"
                                    title={isVietnamese ? "Ảnh sau" : "Next"}
                                >
                                    <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Horizontal Thumbnail Strip (Outline when selected/focused, restrained radius) */}
                    <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin snap-x">
                        {screenshotItems.map((item, idx) => (
                            <button
                                key={item.id ?? idx}
                                type="button"
                                onClick={() => setSelectedMediaIndex(idx)}
                                className={`relative w-28 sm:w-36 aspect-video shrink-0 rounded overflow-hidden snap-start cursor-pointer transition-all ${
                                    selectedMediaIndex === idx
                                        ? "outline outline-2 outline-primary outline-offset-1 opacity-100"
                                        : "opacity-60 hover:opacity-100"
                                }`}
                            >
                                <img
                                    src={item.thumbnail}
                                    className="w-full h-full object-cover"
                                    alt={`Thumbnail ${idx + 1}`}
                                    loading="lazy"
                                />
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* 3. SYSTEM REQUIREMENTS (if available) */}
            {game.systemReqs && (game.systemReqs.minimum || game.systemReqs.recommended) && (
                <section className="flex flex-col gap-3 pt-2">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-text">
                            {isVietnamese ? "Cấu hình yêu cầu" : "System Requirements"}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {game.systemReqs.minimum && (
                            <div className="p-4 rounded-md bg-surface/35 border border-border/20 flex flex-col gap-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <span>{isVietnamese ? "Cấu hình tối thiểu" : "Minimum Requirements"}</span>
                                </span>
                                <div className="flex flex-col divide-y divide-border/15 text-xs">
                                    {game.systemReqs.minimum.os && (
                                        <div className="py-2 flex items-start justify-between gap-3 first:pt-0">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <FontAwesomeIcon icon={faDesktop} className="text-[10px] text-text-muted/60" />
                                                <span>OS</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.minimum.os}</span>
                                        </div>
                                    )}
                                    {game.systemReqs.minimum.cpu && (
                                        <div className="py-2 flex items-start justify-between gap-3">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <FontAwesomeIcon icon={faMicrochip} className="text-[10px] text-text-muted/60" />
                                                <span>CPU</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.minimum.cpu}</span>
                                        </div>
                                    )}
                                    {game.systemReqs.minimum.ram && (
                                        <div className="py-2 flex items-start justify-between gap-3">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <FontAwesomeIcon icon={faMemory} className="text-[10px] text-text-muted/60" />
                                                <span>RAM</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.minimum.ram}</span>
                                        </div>
                                    )}
                                    {game.systemReqs.minimum.gpu && (
                                        <div className="py-2 flex items-start justify-between gap-3">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <FontAwesomeIcon icon={faDesktop} className="text-[10px] text-text-muted/60" />
                                                <span>GPU</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.minimum.gpu}</span>
                                        </div>
                                    )}
                                    {game.systemReqs.minimum.storage && (
                                        <div className="py-2 flex items-start justify-between gap-3 last:pb-0">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <FontAwesomeIcon icon={faHdd} className="text-[10px] text-text-muted/60" />
                                                <span>Storage</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.minimum.storage}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {game.systemReqs.recommended && (
                            <div className="p-4 rounded-md bg-surface/35 border border-border/20 flex flex-col gap-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span>{isVietnamese ? "Cấu hình khuyến nghị" : "Recommended Requirements"}</span>
                                </span>
                                <div className="flex flex-col divide-y divide-border/15 text-xs">
                                    {game.systemReqs.recommended.os && (
                                        <div className="py-2 flex items-start justify-between gap-3 first:pt-0">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <FontAwesomeIcon icon={faDesktop} className="text-[10px] text-text-muted/60" />
                                                <span>OS</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.recommended.os}</span>
                                        </div>
                                    )}
                                    {game.systemReqs.recommended.cpu && (
                                        <div className="py-2 flex items-start justify-between gap-3">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <FontAwesomeIcon icon={faMicrochip} className="text-[10px] text-text-muted/60" />
                                                <span>CPU</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.recommended.cpu}</span>
                                        </div>
                                    )}
                                    {game.systemReqs.recommended.ram && (
                                        <div className="py-2 flex items-start justify-between gap-3">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <FontAwesomeIcon icon={faMemory} className="text-[10px] text-text-muted/60" />
                                                <span>RAM</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.recommended.ram}</span>
                                        </div>
                                    )}
                                    {game.systemReqs.recommended.gpu && (
                                        <div className="py-2 flex items-start justify-between gap-3">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <FontAwesomeIcon icon={faDesktop} className="text-[10px] text-text-muted/60" />
                                                <span>GPU</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.recommended.gpu}</span>
                                        </div>
                                    )}
                                    {game.systemReqs.recommended.storage && (
                                        <div className="py-2 flex items-start justify-between gap-3 last:pb-0">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <FontAwesomeIcon icon={faHdd} className="text-[10px] text-text-muted/60" />
                                                <span>Storage</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.recommended.storage}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* 4. RELATED GAMES (only when available) */}
            {relatedGames && relatedGames.length > 0 && (
                <section className="flex flex-col gap-3 pt-2">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-text">
                            {isVietnamese ? "Trò chơi tương tự" : "Related Games"}
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {relatedGames.map((rg) => {
                            const targetSlug = rg.slug || (rg.appid ? String(rg.appid) : "");
                            return (
                                <div
                                    key={rg.appid || rg.slug}
                                    onClick={() => {
                                        if (targetSlug) {
                                            navigate({ to: "/game/$gameSlug", params: { gameSlug: targetSlug } });
                                        }
                                    }}
                                    className="group cursor-pointer flex flex-col gap-2 transition-transform"
                                >
                                    <div className="w-full aspect-[460/215] rounded overflow-hidden bg-surface relative ring-1 ring-border/20">
                                        <img
                                            src={rg.capsuleImage || rg.headerImage || rg.background}
                                            alt={rg.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                        {rg.isFree && (
                                            <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-black/80 text-emerald-400 rounded">
                                                {isVietnamese ? "Miễn phí" : "Free"}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-0.5 px-0.5">
                                        <h4 className="text-sm font-semibold text-text group-hover:text-primary transition-colors line-clamp-1">
                                            {rg.name}
                                        </h4>
                                        {rg.genres && rg.genres.length > 0 && (
                                            <span className="text-[11px] text-text-muted line-clamp-1">
                                                {rg.genres.slice(0, 2).join(" · ")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Lightbox for Full-Size Screenshot Viewing */}
            {lightboxIndex !== null && fullImagesList.length > 0 && (
                <Lightbox
                    images={fullImagesList}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </div>
    );
};
