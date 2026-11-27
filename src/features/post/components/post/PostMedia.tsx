import React, { memo } from "react";
import { AppIcon as FontAwesomeIcon } from "@/shared/components/ui/Icon";
import { EyeSlash as faEyeSlash, File as faFile, DownloadSimple as faDownload } from "@phosphor-icons/react";
import { formatFileSize } from "../../helpers/postAttachmentLimits";
import { type PostFileAttachment } from "../../types";

const ImageGallery = memo(({
    images,
    onImageClick,
}: {
    images: string[];
    onImageClick: (index: number) => void;
}) => {
    if (!images || images.length === 0) return null;

    const count = images.length;

    if (count === 1) {
        return (
            <img
                src={images[0]}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full max-h-[520px] object-cover rounded-[8px] cursor-pointer hover:opacity-95 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation();
                    onImageClick(0);
                }}
            />
        );
    }

    if (count === 2) {
        return (
            <div className="grid grid-cols-2 gap-2 aspect-4/3 sm:aspect-video rounded-[8px] overflow-hidden">
                <img
                    src={images[0]}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(0);
                    }}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                />
                <img
                    src={images[1]}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(1);
                    }}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                />
            </div>
        );
    }

    if (count === 3) {
        return (
            <div className="grid grid-cols-2 gap-2 aspect-4/3 sm:aspect-video rounded-[8px] overflow-hidden">
                <img
                    src={images[0]}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(0);
                    }}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                />
                <div className="flex flex-col gap-2 h-full min-h-0">
                    <img
                        src={images[1]}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onClick={(e) => {
                            e.stopPropagation();
                            onImageClick(1);
                        }}
                        className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity"
                    />
                    <img
                        src={images[2]}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onClick={(e) => {
                            e.stopPropagation();
                            onImageClick(2);
                        }}
                        className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-2 aspect-4/3 sm:aspect-video rounded-[8px] overflow-hidden">
            <div className="flex flex-col gap-2 h-full min-h-0">
                <img
                    src={images[0]}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(0);
                    }}
                    className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity"
                />
                <img
                    src={images[1]}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(1);
                    }}
                    className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity"
                />
            </div>
            <div className="flex flex-col gap-2 h-full min-h-0">
                <img
                    src={images[2]}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(2);
                    }}
                    className="w-full flex-1 object-cover min-h-0 cursor-pointer hover:opacity-95 transition-opacity"
                />
                <div
                    className="relative w-full flex-1 min-h-0 cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(3);
                    }}
                >
                    <img src={images[3]} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    {count > 4 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white text-xl font-bold">+{count - 4}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

const FileAttachments = memo(({ files }: { files: PostFileAttachment[] }) => {
    if (!files || files.length === 0) return null;

    return (
        <div className="flex flex-col gap-1.5">
            {files.map((file) => (
                <a
                    key={file.id}
                    href={file.url}
                    download={file.name}
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-row items-center gap-2.5 px-3 py-2 rounded-[8px] bg-surface-hover/60 hover:bg-surface-hover transition-colors"
                >
                    <FontAwesomeIcon icon={faFile} className="text-primary text-sm shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text truncate">{file.name}</p>
                        {file.size > 0 && (
                            <p className="text-[10px] text-text-faint">{formatFileSize(file.size)}</p>
                        )}
                    </div>
                    <FontAwesomeIcon icon={faDownload} className="text-text-faint text-xs shrink-0" />
                </a>
            ))}
        </div>
    );
});

export interface PostMediaProps {
    images?: string[];
    files?: PostFileAttachment[];
    isSpoiler?: boolean;
    isNsfw?: boolean;
    isRevealed: boolean;
    onRevealWarning: (e: React.MouseEvent) => void;
    onImageClick: (index: number) => void;
    t: (key: string, options?: Record<string, unknown>) => string;
}

export const PostMedia = memo(({
    images,
    files,
    isSpoiler = false,
    isNsfw = false,
    isRevealed,
    onRevealWarning,
    onImageClick,
    t,
}: PostMediaProps) => {
    const hasImages = images && images.length > 0;
    const hasFiles = files && files.length > 0;

    if (!hasImages && !hasFiles) return null;

    const hasWarning = isSpoiler || isNsfw;

    return (
        <div className="mb-3 relative">
            {hasWarning && !isRevealed && (
                <div
                    onClick={onRevealWarning}
                    className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-lg rounded-[8px] cursor-pointer hover:bg-black/70 transition-colors p-4 text-center"
                >
                    {isNsfw ? (
                        <div className="px-3.5 py-2 bg-black/90 border border-rose-500/50 rounded-lg text-white text-xs font-bold flex items-center gap-2 shadow-2xl animate-fade-in">
                            <span className="text-rose-400 font-black tracking-wide">🔞 18+ NSFW</span>
                            <span className="text-white/40">·</span>
                            <span>{t('post.clickToViewNsfw', { defaultValue: 'Nội dung 18+ nhạy cảm · Nhấn để xem' })}</span>
                        </div>
                    ) : (
                        <div className="px-3.5 py-2 bg-black/90 border border-amber-500/50 rounded-lg text-white text-xs font-bold flex items-center gap-2 shadow-2xl animate-fade-in">
                            <FontAwesomeIcon icon={faEyeSlash} className="text-amber-400" />
                            <span>{t('post.clickToViewSpoiler', { defaultValue: 'Cảnh báo Spoiler · Nhấn để xem nội dung' })}</span>
                        </div>
                    )}
                </div>
            )}

            <div className={hasWarning && !isRevealed ? "blur-2xl select-none pointer-events-none" : "transition-all duration-300"}>
                {hasImages && (
                    <ImageGallery images={images} onImageClick={onImageClick} />
                )}
                {hasFiles && (
                    <div className={hasImages ? "mt-2.5" : ""}>
                        <FileAttachments files={files} />
                    </div>
                )}
            </div>
        </div>
    );
});
