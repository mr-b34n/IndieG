import { useMemo, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faUsers,
    faCircle,
    faCheck,
    faPlus,
    faFire,
    faInbox,
    faChevronDown,
    faChevronUp,
    faShieldHalved,
    faScroll,
    faGamepad,
} from '@fortawesome/free-solid-svg-icons';

import { DEFAULT_AVATAR as avatarGame } from '@/shared/constants/images';
import { useTheme } from '@/shared/hooks/useTheme';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { INITIAL_GAMES } from '@/features/game/constants';
import { AttachmentPicker, getCurrentAuthor, prepareAttachmentsForSave, revokeAttachmentUrls, usePostsStore, type EditableAttachment, type PostData, Post } from '@/features/post';
import { useAuthStore } from '@/features/auth';
import { useCommunitiesStore, formatCompactNumber } from '@/features/community';

export const Route = createFileRoute('/_layout/community/$communityId')({
    validateSearch: (search: Record<string, unknown>): { tab?: string } => {
        return {
            tab: (search.tab as string) || undefined,
        };
    },
    component: CommunityDetail,
})

const THREAD_TABS = [
    { id: "all", label: "🌐 Tất cả chủ đề" },
    { id: "💡 Thảo Luận & Guide", label: "💡 Thảo Luận & Guide" },
    { id: "📢 Thông Báo NPH", label: "📢 Thông Báo NPH" },
    { id: "📢 Thông Báo & Event", label: "📢 Thông Báo & Event" },
    { id: "📸 Showcase / Media", label: "📸 Showcase / Media" },
    { id: "❓ Hỏi Đáp (Q&A)", label: "❓ Hỏi Đáp (Q&A)" },
];

interface CreateCommunityPostPayload {
    title: string;
    content: string;
    attachments: EditableAttachment[];
    selectedTag: string;
}

const CreateCommunityPostBox = ({
    communityName,
    onPost,
}: {
    communityName: string;
    onPost: (data: CreateCommunityPostPayload) => Promise<void>;
}) => {
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [attachments, setAttachments] = useState<EditableAttachment[]>([]);
    const [selectedTag, setSelectedTag] = useState<string>("💡 Thảo Luận & Guide");
    const [expanded, setExpanded] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    const isActive = expanded || content.trim().length > 0 || attachments.length > 0 || title.trim().length > 0;
    const canPost = content.trim().length > 0 && !isPosting;
    const avatarUrl =
        user?.user_metadata?.avatar_url ??
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

    const handlePost = async () => {
        if (!canPost) return;

        setIsPosting(true);
        try {
            await onPost({ title: title.trim(), content: content.trim(), attachments, selectedTag });
            revokeAttachmentUrls(attachments);
            setTitle("");
            setContent("");
            setAttachments([]);
            setExpanded(false);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div
            className="
                w-full p-3.5
                bg-surface/95 backdrop-blur-md
                rounded-2xl
                shadow-[0_12px_35px_-5px_rgba(0,0,0,0.14),0_4px_15px_-5px_rgba(0,0,0,0.08)]
                dark:shadow-[0_12px_35px_-5px_rgba(0,0,0,0.45),0_4px_15px_-5px_rgba(0,0,0,0.25)]
                transition-all duration-300 ease-out
            "
        >
            <div className="flex gap-2.5 items-start">
                <img
                    src={avatarUrl}
                    alt="User"
                    className={`w-9 h-9 rounded-full object-cover ring-1 ring-border shrink-0 transition-all duration-200 ease-out ${isActive ? "" : "self-center"
                        }`}
                />
                <div className="flex flex-col gap-1.5 w-full min-w-0">
                    <div
                        className={`grid transition-[grid-template-rows,opacity,margin] duration-200 ease-out ${isActive
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0 -mb-1.5 pointer-events-none"
                            }`}
                        aria-hidden={!isActive}
                    >
                        <div className={`min-h-0 ${isActive ? "overflow-visible" : "overflow-hidden"}`}>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Post title (optional)"
                                tabIndex={isActive ? 0 : -1}
                                className="w-full h-9 px-3 bg-surface-hover border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-text placeholder:text-text-faint"
                            />
                        </div>
                    </div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onFocus={() => setExpanded(true)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
                        }}
                        placeholder={`Share something with ${communityName}...`}
                        rows={1}
                        className={`w-full px-3 py-2 bg-surface-hover border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-[min-height,border-color,box-shadow] duration-200 ease-out text-text placeholder:text-text-faint resize-none leading-snug ${isActive ? "min-h-19" : "min-h-9"
                            }`}
                    />

                    {isActive && (
                        <div className="flex items-center gap-1.5 py-1 overflow-x-auto no-scrollbar">
                            <span className="text-xs font-bold text-text-muted shrink-0 mr-1">{t('community.topic')}</span>
                            {THREAD_TABS.filter((t) => t.id !== "all").map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setSelectedTag(tab.id)}
                                    className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        selectedTag === tab.id
                                            ? "bg-primary/20 text-primary border border-primary/40 font-bold"
                                            : "bg-surface text-text-muted border border-border/60 hover:text-text hover:border-border"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <AttachmentPicker
                        attachments={attachments}
                        onChange={setAttachments}
                        showToolbar={isActive}
                        compactToolbar
                        className="gap-1.5"
                        toolbarTrailing={
                            <button
                                type="button"
                                onClick={handlePost}
                                disabled={!canPost}
                                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${canPost
                                    ? "bg-primary text-white hover:bg-primary-hover shadow-[0_2px_10px_rgba(124,77,255,0.35)]"
                                    : "bg-surface-hover text-text-faint cursor-not-allowed"
                                    }`}
                            >
                                {isPosting ? "Posting..." : "Post"}
                            </button>
                        }
                    />
                </div>
            </div>
        </div>
    );
};

function CommunityDetail() {
    useTheme("Community");
    const { t, lang } = useTranslation();

    const { communityId } = Route.useParams();
    const navigate = useNavigate();

    const communities = useCommunitiesStore((state) => state.communities);
    const toggleJoin = useCommunitiesStore((state) => state.toggleJoin);

    const posts = usePostsStore((state) => state.posts);
    const addPost = usePostsStore((state) => state.addPost);
    const updatePost = usePostsStore((state) => state.updatePost);
    const deletePost = usePostsStore((state) => state.deletePost);

    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;

    const { tab } = Route.useSearch();
    const [hiddenAuthors, setHiddenAuthors] = useState<string[]>([]);
    const activeThread = tab || "all";

    const [showRules, setShowRules] = useState(false);
    const currentAuthor = getCurrentAuthor();

    const community = communities.find((c) => c.id.toString() === communityId);

    const communityPosts = useMemo(() => {
        if (!community) return [];
        let list = posts.filter((p) => p.gameTag === community.name && !hiddenAuthors.includes(p.author));
        if (activeThread !== "all") {
            list = list.filter((p) => p.tags?.includes(activeThread));
        }
        return list;
    }, [posts, community, hiddenAuthors, activeThread]);

    if (!community) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-screen bg-bg text-text">
                <p>Community not found</p>
                <button onClick={() => navigate({ to: '/community' })} className="mt-4 text-primary underline">Go back</button>
            </div>
        );
    }

    const game = INITIAL_GAMES.find(g => g.communityId === community.id || g.id === community.id || g.slug === community.id);

    const handleCreatePost = async ({ title, content, attachments, selectedTag }: CreateCommunityPostPayload) => {
        const { images, files } = await prepareAttachmentsForSave(attachments);

        const newPost: PostData = {
            id: Date.now(),
            author: currentAuthor,
            authorAvatar: avatarGame,
            gameTag: community.name,
            timeAgo: t('feed.justNow'),
            title: title || content.slice(0, 80) + (content.length > 80 ? "..." : ""),
            content,
            images: images.length > 0 ? images : undefined,
            files: files.length > 0 ? files : undefined,
            tags: [selectedTag, community.name],
            likes: 0,
            comments: 0,
        };
        addPost(newPost);
    };

    const handleEditPost = (id: string | number, data: Partial<PostData>) => {
        updatePost(id, {
            ...data,
            title: data.title || (data.content ? data.content.slice(0, 80) + (data.content.length > 80 ? "..." : "") : ""),
        });
    };

    const handleUnfollowAuthor = (author: string) => {
        setHiddenAuthors((prev) => [...prev, author]);
    };

    return (


        <main className="flex-1 min-w-0">
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 pb-12 animate-fade-in">

                <div className="w-full flex flex-row items-center gap-3 mb-2 px-1">
                    <button
                        onClick={() => navigate({ to: '/community' })}
                        className="
                                    w-10 h-10 flex items-center justify-center rounded-full
                                    bg-surface/50 backdrop-blur-sm border border-border/50
                                    text-text-muted hover:bg-surface hover:text-text hover:border-border
                                    shadow-sm
                                    transition-all duration-200
                                ">
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <span className="text-sm font-bold text-text-muted tracking-wide uppercase">Community</span>
                </div>

                <div className="relative w-full rounded-3xl overflow-hidden border border-border bg-surface shadow-md mb-2">
                    {/* Backdrop Image with Gradients fading smoothly down into the card, just like GameDetail */}
                    <div className="absolute inset-0 h-72 sm:h-96 w-full overflow-hidden pointer-events-none">
                        <img
                            src={game?.bannerUrl || community.backdrop || community.logo}
                            alt={`${community.name} backdrop`}
                            className="w-full h-full object-cover object-top sm:object-center transform hover:scale-105 transition-transform duration-700 opacity-95"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/90 to-transparent" />
                        <div className="absolute inset-0 bg-linear-to-r from-surface/90 via-surface/40 to-transparent" />
                    </div>

                    {/* Spacer to show off the banner artwork cleanly without overlapping issues */}
                    <div className="h-32 sm:h-44 w-full relative z-10">
                        {community.featured && (
                            <span className="absolute top-4 right-4 flex flex-row items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-500 text-white shadow-md">
                                <FontAwesomeIcon icon={faFire} className="text-[10px]" />
                                Featured
                            </span>
                        )}
                    </div>

                    {/* Content Overlay */}
                    <div className="relative z-10 flex flex-col px-5 sm:px-8 pb-6 pt-0">
                        <div className="flex flex-row items-end justify-between flex-wrap gap-4">
                            
                            <img
                                src={community.logo}
                                alt={community.name}
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-surface bg-surface shadow-xl shrink-0"
                            />
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                {game && (
                                    <button
                                        type="button"
                                        onClick={() => navigate({ to: `/game/${game.slug}` })}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-primary/15 hover:bg-primary text-primary hover:text-white transition-all shadow-sm border border-primary/30 cursor-pointer"
                                        title="Đến trang Game"
                                    >
                                        <FontAwesomeIcon icon={faGamepad} />
                                        <span>Trang Game</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => navigate({ to: "/squad" })}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-surface-hover hover:bg-border/80 text-text border border-border shadow-sm transition-all cursor-pointer"
                                    title="Tìm Tổ Đội"
                                >
                                    <FontAwesomeIcon icon={faUsers} className="text-brand-400" />
                                    <span>{lang === "vi" ? "Tìm Tổ Đội" : "Find Squad"}</span>
                                </button>
                                <button
                                    onClick={() => toggleJoin(community.id)}
                                    className={`flex flex-row items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-colors duration-150 cursor-pointer ${community.joined
                                        ? "bg-surface-hover text-text-muted hover:bg-accent-500/10 hover:text-accent-500"
                                        : "bg-primary text-white hover:bg-primary-hover shadow-[0_2px_10px_rgba(0,170,255,0.3)]"
                                        }`}
                                >
                                    <FontAwesomeIcon icon={community.joined ? faCheck : faPlus} className="text-xs" />
                                    {community.joined ? "Joined" : "Join"}
                                </button>
                            </div>
                        </div>

                            <div className="flex flex-col mt-3 gap-0.5">
                                <p className="font-bold text-xl text-text">
                                    {community.name}
                                </p>
                                <p className="text-xs font-semibold uppercase tracking-wide text-text-faint">
                                    {community.category}
                                </p>
                            </div>

                            <p className="text-sm text-text-muted mt-2 leading-snug">
                                {community.description}
                            </p>

                            <div className="flex flex-row items-center gap-4 mt-3 text-[13px] text-text-faint">
                                <span className="flex flex-row items-center gap-1.5">
                                    <FontAwesomeIcon icon={faUsers} className="text-xs" />
                                    {formatCompactNumber(community.members)} members
                                </span>
                                <span className="flex flex-row items-center gap-1.5 text-success-500 font-medium">
                                    <FontAwesomeIcon icon={faCircle} className="text-[6px]" />
                                    {formatCompactNumber(community.onlineNow)} online
                                </span>
                            </div>

                            {/* Rules */}
                            <div className="mt-4 pt-4 border-t border-border">
                                <button
                                    onClick={() => setShowRules(!showRules)}
                                    className="w-full flex items-center justify-between text-sm font-bold text-text hover:text-primary transition-colors cursor-pointer"
                                >
                                    <span className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faScroll} className="text-primary" />
                                        Nội quy & Quản trị viên
                                    </span>
                                    <FontAwesomeIcon icon={showRules ? faChevronUp : faChevronDown} className="text-xs" />
                                </button>
                                {showRules && (
                                    <div className="mt-3 flex flex-col gap-3 animate-fade-in text-sm text-text-muted">
                                        <div className="bg-surface-hover/50 rounded-xl p-3 border border-border/50">
                                            <h4 className="font-semibold text-text mb-2 flex items-center gap-2">
                                                <FontAwesomeIcon icon={faShieldHalved} className="text-amber-500" />
                                                Quản trị viên (Admins/Mods)
                                            </h4>
                                            <div className="flex flex-col gap-1.5 text-[13px]">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-text font-medium">@ghostrider</span>
                                                    <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[10px] font-bold">ADMIN</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-text font-medium">@tactical_xeno</span>
                                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">MOD</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-surface-hover/50 rounded-xl p-3 border border-border/50">
                                            <h4 className="font-semibold text-text mb-2">Quy tắc ứng xử</h4>
                                            <ol className="list-decimal list-inside space-y-1.5 text-[13px]">
                                                <li>Tôn trọng mọi thành viên, không toxic hoặc xúc phạm cá nhân.</li>
                                                <li>Không spam hoặc đăng nội dung không liên quan đến game/cộng đồng này.</li>
                                                <li>Gắn thẻ spoiler cho những bài viết tiết lộ nội dung quan trọng (cốt truyện, kết thúc).</li>
                                                <li>Nội dung 18+ (NSFW) bị cấm nghiêm ngặt.</li>
                                            </ol>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                </div>

                {/* Threads */}
                <div className="w-full bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-2.5 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {THREAD_TABS.map((tab) => {
                        const count = tab.id === "all"
                            ? posts.filter((p) => p.gameTag === community.name && !hiddenAuthors.includes(p.author)).length
                            : posts.filter((p) => p.gameTag === community.name && !hiddenAuthors.includes(p.author) && p.tags?.includes(tab.id)).length;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => navigate({ search: { tab: tab.id === "all" ? undefined : tab.id } })}
                                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    activeThread === tab.id
                                        ? "bg-primary text-white shadow-md shadow-primary/25"
                                        : "bg-surface-hover text-text-muted hover:bg-border hover:text-text border border-border/50"
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                    activeThread === tab.id ? "bg-white/20 text-white font-extrabold" : "bg-border text-text-faint font-semibold"
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {isLoggedIn && (
                    <CreateCommunityPostBox communityName={community.name} onPost={handleCreatePost} />
                )}

                {communityPosts.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {communityPosts.map((post) => (
                            <Post
                                key={post.id}
                                post={post}
                                isOwner={post.author === currentAuthor}
                                onDelete={deletePost}
                                onEdit={handleEditPost}
                                onUnfollowAuthor={handleUnfollowAuthor}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="
                                    w-full flex flex-col items-center justify-center gap-2 p-10
                                    bg-surface/90 backdrop-blur-md border border-border rounded-2xl
                                    text-text-muted text-sm
                                ">
                        <FontAwesomeIcon icon={faInbox} className="text-2xl text-text-faint mb-1" />
                        <p className="font-semibold text-text">No posts here yet</p>
                        <p className="text-text-faint text-center">Be the first to post in {community.name}.</p>
                    </div>
                )}
            </div>
        </main>

    )
}