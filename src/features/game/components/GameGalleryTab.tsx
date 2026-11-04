import React, { useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Images,
} from "lucide-react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { Lightbox } from "@/shared/components/ui/Lightbox";
import { type GameData, type GameScreenshotItem } from "../types";

interface GameGalleryTabProps {
    game: GameData;
}

export const GameGalleryTab: React.FC<GameGalleryTabProps> = ({ game }) => {
    const { lang } = useTranslation();
    const isVietnamese = lang === "vi";

    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

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

    if (!hasMedia) {
        return (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-border/30 rounded-2xl bg-surface/10 p-6">
                <Images className="w-10 h-10 text-text-muted" />
                <p className="text-sm font-semibold text-text">
                    {isVietnamese ? "Chưa có hình ảnh nào" : "No images available"}
                </p>
                <p className="text-xs text-text-muted">
                    {isVietnamese ? "Hình ảnh và gameplay của tựa game này đang được cập nhật." : "Screenshots and gameplay for this game will be available soon."}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Screenshots & Media Section Only (Grid list removed as requested) */}
            <section className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Images className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-bold tracking-tight text-text">
                            {isVietnamese ? "Hình ảnh & Gameplay" : "Screenshots & Media Gallery"}
                        </h2>
                    </div>
                    <span className="text-xs font-mono text-text-muted font-medium bg-surface px-2.5 py-1 rounded-md border border-border/30">
                        {selectedMediaIndex + 1} / {screenshotItems.length}
                    </span>
                </div>

                {/* Main Cinema Viewport */}
                <div
                    className="w-full aspect-video bg-black rounded-xl overflow-hidden cursor-pointer relative group border border-border/40 shadow-xl"
                    onClick={() => setLightboxIndex(selectedMediaIndex)}
                >
                    <img
                        src={activeMedia.full}
                        alt={`Screenshot ${selectedMediaIndex + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                    />

                    {/* Top-Left Counter Overlay */}
                    <div className="absolute top-3.5 left-3.5 bg-black/75 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-md font-mono pointer-events-none border border-white/10">
                        {selectedMediaIndex + 1} / {screenshotItems.length}
                    </div>

                    {/* Fullscreen Expand Overlay Button */}
                    <div className="absolute bottom-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 hover:bg-black text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/15">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>{isVietnamese ? "Xem toàn màn hình" : "View full size"}</span>
                    </div>

                    {/* Prev & Next Controls */}
                    {screenshotItems.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={handlePrevMedia}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white/10"
                                title={isVietnamese ? "Ảnh trước" : "Previous"}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={handleNextMedia}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white/10"
                                title={isVietnamese ? "Ảnh sau" : "Next"}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>

                {/* Thumbnail Filmstrip with Custom Styled Horizontal Scrollbar */}
                <div className="flex gap-2.5 custom-scrollbar-x pb-3.5 pt-1 snap-x">
                    {screenshotItems.map((item, idx) => (
                        <button
                            key={item.id ?? idx}
                            type="button"
                            onClick={() => setSelectedMediaIndex(idx)}
                            className={`relative w-28 sm:w-36 aspect-video shrink-0 rounded-lg overflow-hidden snap-start cursor-pointer transition-all border ${
                                selectedMediaIndex === idx
                                    ? "ring-2 ring-primary border-primary opacity-100 shadow-md"
                                    : "border-border/30 opacity-60 hover:opacity-100 hover:border-border/60"
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

            {/* Full-Size Screenshot Lightbox */}
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
