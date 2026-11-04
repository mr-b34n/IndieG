import React, { useState } from "react";
import {
    Cpu,
    Monitor,
    MemoryStick,
    HardDrive,
    Layers,
    Sparkles,
    BookOpen,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { type GameData } from "../types";

interface GameOverviewTabProps {
    game: GameData;
    relatedGames?: GameData[];
}

export const GameOverviewTab: React.FC<GameOverviewTabProps> = ({
    game,
    relatedGames = [],
}) => {
    const { lang } = useTranslation();
    const isVietnamese = lang === "vi";
    const navigate = useNavigate();

    const [showFullDesc, setShowFullDesc] = useState(false);

    // Clean and prepare HTML string for aboutTheGame
    const rawAboutText = game.aboutTheGame || game.shortDescription || game.description || "";
    const shortDescText = game.shortDescription && game.shortDescription !== game.aboutTheGame
        ? game.shortDescription
        : null;

    return (
        <div className="flex flex-col gap-10 text-text">
            {/* 1. ABOUT THE GAME */}
            <section className="flex flex-col relative">
                <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold tracking-tight text-text">
                        {isVietnamese ? "Giới thiệu trò chơi" : "About the Game"}
                    </h2>
                </div>

                <div className="relative text-[15px] sm:text-base text-text-muted leading-relaxed">
                    {shortDescText && (
                        <div className="p-4 rounded-xl bg-surface border border-border/30 text-text/90 font-normal leading-relaxed mb-4 text-sm sm:text-base">
                            {shortDescText}
                        </div>
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
                        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none" />
                    )}
                </div>

                {rawAboutText.length > 500 && (
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => setShowFullDesc(!showFullDesc)}
                            className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                            <span>
                                {showFullDesc
                                    ? (isVietnamese ? "Thu gọn nội dung" : "Show less")
                                    : (isVietnamese ? "Đọc thêm toàn bộ" : "Read more")}
                            </span>
                        </button>
                    </div>
                )}
            </section>

            {/* 2. SYSTEM REQUIREMENTS */}
            {game.systemReqs && (game.systemReqs.minimum || game.systemReqs.recommended) && (
                <section className="flex flex-col gap-3 pt-2">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold tracking-tight text-text">
                            {isVietnamese ? "Cấu hình yêu cầu" : "System Requirements"}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Minimum Specs */}
                        {game.systemReqs.minimum && (
                            <div className="p-4 rounded-xl bg-surface/40 border border-border/30 flex flex-col gap-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                    <span>{isVietnamese ? "Cấu hình tối thiểu" : "Minimum Requirements"}</span>
                                </span>
                                <div className="flex flex-col divide-y divide-border/20 text-xs">
                                    {game.systemReqs.minimum.os && (
                                        <div className="py-2 flex items-start justify-between gap-3 first:pt-0">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <Monitor className="w-3.5 h-3.5 text-text-muted/60" />
                                                <span>OS</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.minimum.os}</span>
                                        </div>
                                    )}
                                    {game.systemReqs.minimum.cpu && (
                                        <div className="py-2 flex items-start justify-between gap-3">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <Cpu className="w-3.5 h-3.5 text-text-muted/60" />
                                                <span>CPU</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.minimum.cpu}</span>
                                        </div>
                                    )}
                                    {game.systemReqs.minimum.ram && (
                                        <div className="py-2 flex items-start justify-between gap-3">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <MemoryStick className="w-3.5 h-3.5 text-text-muted/60" />
                                                <span>RAM</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.minimum.ram}</span>
                                        </div>
                                    )}
                                    {game.systemReqs.minimum.gpu && (
                                        <div className="py-2 flex items-start justify-between gap-3">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <Layers className="w-3.5 h-3.5 text-text-muted/60" />
                                                <span>GPU</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.minimum.gpu}</span>
                                        </div>
                                    )}
                                    {game.systemReqs.minimum.storage && (
                                        <div className="py-2 flex items-start justify-between gap-3 last:pb-0">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <HardDrive className="w-3.5 h-3.5 text-text-muted/60" />
                                                <span>Storage</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.minimum.storage}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Recommended Specs */}
                        {game.systemReqs.recommended && (
                            <div className="p-4 rounded-xl bg-surface/40 border border-border/30 flex flex-col gap-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                    <span>{isVietnamese ? "Cấu hình khuyến nghị" : "Recommended Requirements"}</span>
                                </span>
                                <div className="flex flex-col divide-y divide-border/20 text-xs">
                                    {game.systemReqs.recommended.os && (
                                        <div className="py-2 flex items-start justify-between gap-3 first:pt-0">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <Monitor className="w-3.5 h-3.5 text-text-muted/60" />
                                                <span>OS</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.recommended.os}</span>
                                        </div>
                                    )}
                                    {game.systemReqs.recommended.cpu && (
                                        <div className="py-2 flex items-start justify-between gap-3">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <Cpu className="w-3.5 h-3.5 text-text-muted/60" />
                                                <span>CPU</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.recommended.cpu}</span>
                                        </div>
                                    )}
                                    {game.systemReqs.recommended.ram && (
                                        <div className="py-2 flex items-start justify-between gap-3">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <MemoryStick className="w-3.5 h-3.5 text-text-muted/60" />
                                                <span>RAM</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.recommended.ram}</span>
                                        </div>
                                    )}
                                    {game.systemReqs.recommended.gpu && (
                                        <div className="py-2 flex items-start justify-between gap-3">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <Layers className="w-3.5 h-3.5 text-text-muted/60" />
                                                <span>GPU</span>
                                            </span>
                                            <span className="text-text font-medium text-right">{game.systemReqs.recommended.gpu}</span>
                                        </div>
                                    )}
                                    {game.systemReqs.recommended.storage && (
                                        <div className="py-2 flex items-start justify-between gap-3 last:pb-0">
                                            <span className="text-text-muted flex items-center gap-1.5 shrink-0">
                                                <HardDrive className="w-3.5 h-3.5 text-text-muted/60" />
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

            {/* 3. SIMILAR GAMES */}
            {relatedGames && relatedGames.length > 0 && (
                <section className="flex flex-col gap-3 pt-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold tracking-tight text-text">
                            {isVietnamese ? "Trò chơi tương tự" : "Similar Games"}
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
                                    className="group cursor-pointer flex flex-col gap-2.5 transition-all duration-200 hover:-translate-y-1"
                                >
                                    <div className="w-full aspect-[460/215] rounded-xl overflow-hidden bg-surface relative ring-1 ring-border/30 group-hover:ring-primary/50 transition-all shadow-md">
                                        <img
                                            src={rg.capsuleImage || rg.headerImage || rg.background}
                                            alt={rg.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                        {rg.isFree && (
                                            <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-black/80 text-emerald-400 rounded-md border border-emerald-500/20">
                                                {isVietnamese ? "Miễn phí" : "Free"}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1 px-0.5">
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
        </div>
    );
};
