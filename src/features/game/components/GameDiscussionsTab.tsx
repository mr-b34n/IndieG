import React from "react";
import { ArrowRight, Plus, MessageSquare } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { Post } from "@/features/post";
import { type GameData } from "../types";

interface GameDiscussionsTabProps {
    game: GameData;
    posts: any[];
    communityId?: string | number | null;
    onViewCommunityFeed?: () => void;
}

export const GameDiscussionsTab: React.FC<GameDiscussionsTabProps> = ({
    game,
    posts,
    communityId,
    onViewCommunityFeed,
}) => {
    const { lang } = useTranslation();
    const isVietnamese = lang === "vi";
    const navigate = useNavigate();

    const targetCommId = communityId || game.communityId;

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-text">
                        {isVietnamese ? "Thảo luận cộng đồng" : "Community Discussions"}
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">
                        {isVietnamese
                            ? `Các bài viết, chia sẻ kinh nghiệm và thảo luận từ cộng đồng game thủ ${game.name}`
                            : `Posts, shared experiences, and discussions about ${game.name}`}
                    </p>
                </div>

                {targetCommId && onViewCommunityFeed && (
                    <button
                        type="button"
                        onClick={onViewCommunityFeed}
                        className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-surface/50 border border-border/30 hover:border-border/60"
                    >
                        <span>{isVietnamese ? "Diễn đàn cộng đồng" : "Community Hub"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Posts list */}
            {posts.length > 0 ? (
                <div className="flex flex-col">
                    {posts.map((post, index) => (
                        <div key={post.id} className="flex flex-col">
                            {index > 0 && <div className="w-full h-px bg-divider-primary my-1" />}
                            <Post post={post} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-border/30 rounded-2xl bg-surface/10 p-6">
                    <div className="w-12 h-12 rounded-full bg-surface/50 border border-border/30 flex items-center justify-center text-text-muted text-lg">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text">
                            {isVietnamese ? "Chưa có bài thảo luận nào" : "No discussions yet"}
                        </p>
                        <p className="text-xs text-text-muted max-w-sm mt-1">
                            {isVietnamese
                                ? "Hãy là người đầu tiên chia sẻ cảm nghĩ hoặc đặt câu hỏi về tựa game này."
                                : "Be the first to share your thoughts or start a topic about this game."}
                        </p>
                    </div>
                    {targetCommId && (
                        <button
                            type="button"
                            onClick={() => navigate({ to: "/community/$communityId", params: { communityId: String(targetCommId) } })}
                            className="mt-2 px-4 py-2 rounded-xl font-semibold bg-primary text-white hover:bg-primary-hover transition-all text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isVietnamese ? "Đăng bài trong cộng đồng" : "Post in Community"}</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
