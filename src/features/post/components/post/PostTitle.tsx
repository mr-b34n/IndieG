import { memo } from "react";

export interface PostTitleProps {
    title?: string;
    isDetailView?: boolean;
    isSpoiler?: boolean;
    isNsfw?: boolean;
}

export const PostTitle = memo(({ title, isDetailView = false, isSpoiler = false, isNsfw = false }: PostTitleProps) => {
    if (!title) return null;

    return (
        <div className="flex items-start gap-2 mb-2 flex-wrap">
            {isNsfw && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0 self-center">
                    🔞 18+ NSFW
                </span>
            )}
            {isSpoiler && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0 self-center">
                    SPOILER
                </span>
            )}
            <h2
                className={`text-[18px] sm:text-[20px] font-bold text-text leading-snug tracking-tight break-words flex-1 min-w-0 ${
                    isDetailView ? "" : "line-clamp-2"
                }`}
            >
                {title}
            </h2>
        </div>
    );
});
