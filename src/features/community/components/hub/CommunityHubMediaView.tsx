import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHeart as faHeartRegular,
    faComment,
} from "@fortawesome/free-regular-svg-icons";
import {
    faHeart as faHeartSolid,
    faExpand,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";

export interface MediaItem {
    id: string;
    title: string;
    imageUrl: string;
    authorName: string;
    authorHandle: string;
    likesCount: number;
    repliesCount: number;
}

interface CommunityHubMediaViewProps {
    communityName: string;
    mediaItems: MediaItem[];
    onItemClick?: (id: string) => void;
    isVi: boolean;
}

export const CommunityHubMediaView = ({
    communityName,
    mediaItems,
    isVi,
}: CommunityHubMediaViewProps) => {
    const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);

    const [likes, setLikes] = useState<Record<string, { count: number; liked: boolean }>>({});

    const handleLike = (e: React.MouseEvent, item: MediaItem) => {
        e.stopPropagation();
        setLikes((prev) => {
            const current = prev[item.id] || { count: item.likesCount, liked: false };
            const liked = !current.liked;
            return {
                ...prev,
                [item.id]: {
                    count: liked ? current.count + 1 : Math.max(0, current.count - 1),
                    liked,
                },
            };
        });
    };

    return (
        <div className="w-full flex flex-col gap-4 select-none">
            <div className="flex items-center justify-between border-b border-divider-primary/60 pb-3">
                <div>
                    <h2 className="font-extrabold text-sm text-text uppercase tracking-tight">
                        {isVi ? `Thư Viện Media & Showcase ${communityName}` : `${communityName} Media & Showcase`}
                    </h2>
                    <p className="text-xs text-text-muted">
                        {isVi ? "Hình ảnh gameplay, căn cứ, fanart và highlights từ cộng đồng." : "Community screenshots, base builds, highlights and fan creations."}
                    </p>
                </div>
                <span className="text-xs font-mono font-bold text-text-muted">
                    {mediaItems.length} {isVi ? "hình ảnh" : "items"}
                </span>
            </div>

            {mediaItems.length === 0 ? (
                <div className="py-16 text-center text-xs text-text-muted font-mono bg-surface/30 rounded-[4px] border border-dashed border-divider-primary/60">
                    {isVi ? "Chưa có hình ảnh nào được tải lên." : "No media uploads found."}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {mediaItems.map((item) => {
                        const likeState = likes[item.id] || { count: item.likesCount, liked: false };
                        return (
                            <div
                                key={item.id}
                                onClick={() => setSelectedImage(item)}
                                className="group relative rounded-[4px] overflow-hidden bg-surface-inner border border-divider-primary/60 hover:border-primary/50 transition-all cursor-pointer flex flex-col"
                            >
                                <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5 justify-between text-white">
                                        <span className="text-xs font-bold truncate pr-2">{item.title}</span>
                                        <FontAwesomeIcon icon={faExpand} className="text-xs shrink-0" />
                                    </div>
                                </div>

                                <div className="p-2.5 flex items-center justify-between text-xs bg-surface/90">
                                    <span className="font-semibold text-text truncate max-w-[60%]">{item.authorHandle}</span>
                                    <div className="flex items-center gap-3 text-text-muted">
                                        <button
                                            type="button"
                                            onClick={(e) => handleLike(e, item)}
                                            className={`flex items-center gap-1 cursor-pointer transition-colors ${likeState.liked ? "text-rose-500 font-bold" : "hover:text-rose-500"}`}
                                        >
                                            <FontAwesomeIcon icon={likeState.liked ? faHeartSolid : faHeartRegular} className="text-[10px]" />
                                            <span className="font-mono text-[10px]">{likeState.count}</span>
                                        </button>
                                        <div className="flex items-center gap-1">
                                            <FontAwesomeIcon icon={faComment} className="text-[10px]" />
                                            <span className="font-mono text-[10px]">{item.repliesCount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Zoom */}
            {selectedImage && (
                <div
                    onClick={() => setSelectedImage(null)}
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-surface border border-divider-primary max-w-4xl w-full rounded-[4px] overflow-hidden flex flex-col shadow-2xl animate-scale-up"
                    >
                        <div className="flex items-center justify-between p-3 border-b border-divider-primary">
                            <span className="font-bold text-xs text-text">{selectedImage.title}</span>
                            <button
                                type="button"
                                onClick={() => setSelectedImage(null)}
                                className="text-text-muted hover:text-text cursor-pointer p-1"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>
                        <div className="bg-black/90 max-h-[75vh] flex items-center justify-center">
                            <img
                                src={selectedImage.imageUrl}
                                alt={selectedImage.title}
                                className="max-w-full max-h-[75vh] object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
