import { useMemo, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faUsers,
    faCircle,
    faPlus,
    faFire,
    faInbox,
    faShieldHalved,
    faScroll,
    faGamepad,
    faExternalLink,
    faCrown,
    faMessage,
    faSearch,
    faChevronDown,
    faSignOutAlt,
    faListUl,
    faUserCheck,
} from '@fortawesome/free-solid-svg-icons';

import { DEFAULT_AVATAR as avatarGame } from '@/shared/constants/images';
import { useTheme } from '@/shared/hooks/useTheme';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { INITIAL_GAMES } from '@/features/game/constants';
import { getCurrentAuthor, prepareAttachmentsForSave, usePostsStore, type PostData, Post } from '@/features/post';
import { useAuthStore } from '@/features/auth';
import { useCommunitiesStore, formatCompactNumber } from '@/features/community';
import { useSquadStore } from '@/features/squad/store/useSquadStore';
import { CreatePostBox, type CreatePostPayload } from '@/features/feed';

export const Route = createFileRoute('/_layout/community/$communityId')({
    validateSearch: (search: Record<string, unknown>): { tab?: string } => {
        return {
            tab: (search.tab as string) || undefined,
        };
    },
    component: CommunityDetail,
});

function CommunityDetail() {
    useTheme("Community");
    const { t } = useTranslation();

    const { communityId } = Route.useParams();
    const navigate = useNavigate();

    const communities = useCommunitiesStore((state) => state.communities);
    const toggleJoin = useCommunitiesStore((state) => state.toggleJoin);

    const posts = usePostsStore((state) => state.posts);
    const addPost = usePostsStore((state) => state.addPost);
    const updatePost = usePostsStore((state) => state.updatePost);
    const deletePost = usePostsStore((state) => state.deletePost);

    const squads = useSquadStore((state) => state.squads);

    const user = useAuthStore((state) => state.user);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;

    const [hiddenAuthors, setHiddenAuthors] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [showJoinMenu, setShowJoinMenu] = useState(false);

    const currentAuthor = getCurrentAuthor();

    const community = communities.find((c) => c.id.toString() === communityId);

    const communityPosts = useMemo(() => {
        if (!community) return [];
        let list = posts.filter((p) => p.gameTag === community.name && !hiddenAuthors.includes(p.author));
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
        }
        return list;
    }, [posts, community, hiddenAuthors, searchQuery]);

    // Active recruitment squads for this game
    const relevantSquads = useMemo(() => {
        if (!community) return [];
        return squads.filter((s) =>
            s.game.toLowerCase().includes(community.name.toLowerCase()) ||
            community.name.toLowerCase().includes(s.game.toLowerCase())
        );
    }, [squads, community]);

    if (!community) {
        return (
            <div className="flex flex-col items-center justify-center w-full min-h-[60vh] bg-bg text-text">
                <p className="text-lg font-bold">Community not found</p>
                <button
                    onClick={() => navigate({ to: '/community' })}
                    className="mt-4 px-4 py-2 bg-primary text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                    Return to Communities
                </button>
            </div>
        );
    }

    const game = INITIAL_GAMES.find(g => g.communityId === community.id || g.id === community.id || g.slug === community.id);

    const handleCreatePost = async ({ title, content, attachments, tags }: CreatePostPayload) => {
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
            tags: [community.name, ...tags],
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
        <main className="flex-1 min-w-0 pb-16">
            <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 flex flex-col gap-5 animate-fade-in">

                {/* Top Navigation Bar */}
                <div className="w-full flex items-center justify-between py-1 relative z-20">
                    <button
                        onClick={() => navigate({ to: '/community' })}
                        className="
                            flex items-center gap-2.5 px-4 py-2 rounded-xl
                            bg-surface hover:bg-surface-hover border border-border/80 hover:border-primary/50
                            text-text font-extrabold text-xs tracking-wide
                            transition-all cursor-pointer shadow-sm
                        "
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-primary" />
                        <span>Communities</span>
                        <span className="text-text-faint">/</span>
                        <span className="text-text truncate max-w-[250px]">{community.name}</span>
                    </button>
                </div>

                {/* HERO GAMING BANNER HEADER */}
                <div className="relative w-full rounded-3xl border border-border/80 bg-surface shadow-lg group">
                    {/* Panoramic Backdrop */}
                    <div className="relative h-44 sm:h-64 md:h-72 w-full overflow-hidden bg-surface-hover rounded-t-3xl">
                        <img
                            src={game?.bannerUrl || community.backdrop || community.logo}
                            alt={`${community.name} backdrop`}
                            className="w-full h-full object-cover object-center opacity-90"
                        />
                        {/* Gradient Overlays */}
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-surface via-surface/30 to-transparent" />
                        <div className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-surface/40 via-transparent to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                            {community.featured && (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-md">
                                    <FontAwesomeIcon icon={faFire} className="text-[10px]" />
                                    Featured Hub
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Game Profile Bar Overlay */}
                    <div className="relative z-10 px-5 sm:px-8 pb-6 -mt-12 sm:-mt-16 flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            {/* Logo & Main Info */}
                            <div className="flex items-end gap-4">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="font-extrabold text-2xl sm:text-3xl text-text tracking-tight">
                                            {community.name}
                                        </h1>
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/15 text-primary border border-primary/30">
                                            {t('community.officialHub')}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl leading-relaxed font-medium">
                                        {community.description}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                                {game && (
                                    <button
                                        type="button"
                                        onClick={() => navigate({ to: `/game/${game.slug}` })}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-surface-hover hover:bg-border/80 text-text border border-border shadow-xs transition-all cursor-pointer hover:scale-102 active:scale-98"
                                    >
                                        <FontAwesomeIcon icon={faGamepad} className="text-primary" />
                                        <span>{t('game.gamePage')}</span>
                                        <FontAwesomeIcon icon={faExternalLink} className="text-[10px] opacity-60 ml-0.5" />
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => navigate({ to: "/squad" })}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-xs transition-all cursor-pointer hover:scale-102 active:scale-98"
                                >
                                    <FontAwesomeIcon icon={faUsers} />
                                    <span>{t('squad.findSquad')}</span>
                                    {relevantSquads.length > 0 && (
                                        <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                                            {relevantSquads.length}
                                        </span>
                                    )}
                                </button>

                                {community.joined ? (
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowJoinMenu(!showJoinMenu)}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase transition-all duration-200 cursor-pointer shadow-md bg-surface-hover text-emerald-500 hover:text-emerald-400 border border-emerald-500/30"
                                        >
                                            <FontAwesomeIcon icon={faUserCheck} className="text-xs" />
                                            <span>{t('community.joined')}</span>
                                            <FontAwesomeIcon icon={faChevronDown} className="text-[10px] ml-1" />
                                        </button>
                                        
                                        {showJoinMenu && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setShowJoinMenu(false)} />
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-fade-in-up">
                                                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-text hover:bg-surface-hover transition-colors text-left font-bold cursor-pointer">
                                                        <FontAwesomeIcon icon={faListUl} className="w-4 text-primary" />
                                                        {t('community.memberList')}
                                                    </button>
                                                    <button onClick={() => { toggleJoin(community.id); setShowJoinMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-rose-500 hover:bg-surface-hover transition-colors text-left font-bold cursor-pointer">
                                                        <FontAwesomeIcon icon={faSignOutAlt} className="w-4" />
                                                        {t('community.leaveCommunity')}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            if (!isLoggedIn) {
                                                navigate({ to: "/auth" });
                                                return;
                                            }
                                            toggleJoin(community.id);
                                        }}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase transition-all duration-200 cursor-pointer shadow-md bg-primary text-white hover:bg-primary-hover shadow-primary/25 active:scale-95"
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                        <span>{t('community.join')}</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats Bar */}
                        <div className="flex items-center gap-6 pt-3 border-t border-border/60 text-xs font-bold text-text-muted overflow-x-auto no-scrollbar">
                            <div className="flex items-center gap-2 shrink-0">
                                <FontAwesomeIcon icon={faUsers} className="text-primary text-sm" />
                                <span className="text-text font-extrabold">{formatCompactNumber(community.members)}</span>
                                <span className="text-text-faint">{t('community.members')}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <FontAwesomeIcon icon={faCircle} className="text-emerald-500 text-[8px]" />
                                <span className="text-text font-extrabold">{formatCompactNumber(community.onlineNow)}</span>
                                <span className="text-text-faint">{t('community.onlineLabel')}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <FontAwesomeIcon icon={faMessage} className="text-amber-500 text-xs" />
                                <span className="text-text font-extrabold">{communityPosts.length}</span>
                                <span className="text-text-faint">{t('community.posts')}</span>
                            </div>
                            <div className="flex-1 min-w-0" />
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                    showSearch ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-surface-hover/80 text-text-muted hover:text-text hover:bg-surface border border-border/60"
                                }`}
                                title="Tìm kiếm"
                            >
                                <FontAwesomeIcon icon={faSearch} className="text-[13px]" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2-COLUMN GAMING HUB GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* MAIN FEED COLUMN (LEFT) */}
                    <div className="lg:col-span-8 flex flex-col gap-4">

                        {/* Animated Collapsible Search Bar */}
                        <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${showSearch ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"}`}>
                            <div className="min-h-0 overflow-hidden">
                                <div className="w-full bg-surface/90 backdrop-blur-md border border-border/80 rounded-2xl p-1.5 shadow-md flex items-center gap-2 mb-2">
                                    <div className="w-10 h-10 flex items-center justify-center text-primary/70 shrink-0">
                                        <FontAwesomeIcon icon={faSearch} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={t('community.searchPlaceholder')}
                                        className="w-full h-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-text placeholder:text-text-faint font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Create Post Box */}
                        {isLoggedIn && (
                            <CreatePostBox 
                                onPost={handleCreatePost} 
                                defaultCommunityId={community.id}
                                hideCommunitySelector={true}
                            />
                        )}

                        {/* Post Feed List */}
                        {communityPosts.length > 0 ? (
                            <div className="flex flex-col gap-4">
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
                                w-full flex flex-col items-center justify-center gap-3 p-12
                                bg-surface/90 backdrop-blur-md border border-border/80 rounded-2xl
                                text-text-muted text-sm shadow-2xs text-center
                            ">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl">
                                    <FontAwesomeIcon icon={faInbox} />
                                </div>
                                <div>
                                    <p className="font-extrabold text-base text-text">Chưa có bài viết nào ở mục này</p>
                                    <p className="text-text-faint text-xs mt-1">Hãy là người đầu tiên đăng bài thảo luận trong cộng đồng {community.name}!</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDEBAR (GAMING WIDGETS) */}
                    <div className="lg:col-span-4 flex flex-col gap-5">

                        {/* Widget 1: Rules & Admin Team */}
                        <div className="bg-surface/90 backdrop-blur-md border border-border/80 rounded-2xl p-4 shadow-2xs flex flex-col gap-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                                <FontAwesomeIcon icon={faScroll} className="text-primary" />
                                <h3 className="font-extrabold text-sm text-text">{t('community.rulesAndAdmin')}</h3>
                            </div>

                            {/* Admins list */}
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faCrown} className="text-amber-500 text-[10px]" />
                                    {t('community.adminsAndMods')}
                                </span>
                                <div className="p-2.5 rounded-xl bg-surface-hover/50 border border-border/40 flex flex-col gap-1.5 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-text font-bold">@ghostrider</span>
                                        <span className="bg-amber-500/15 text-amber-500 px-2 py-0.5 rounded-md text-[10px] font-black border border-amber-500/30">ADMIN</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-text font-bold">@tactical_xeno</span>
                                        <span className="bg-primary/15 text-primary px-2 py-0.5 rounded-md text-[10px] font-black border border-primary/30">MOD</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rules list */}
                            <div className="flex flex-col gap-2 mt-1">
                                <span className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-500 text-[10px]" />
                                    {t('community.rulesOfConduct')}
                                </span>
                                <ol className="list-decimal list-inside space-y-1.5 text-xs text-text-muted p-3 rounded-xl bg-surface-hover/50 border border-border/40 leading-relaxed font-medium">
                                    <li>{t('community.rule1')}</li>
                                    <li>{t('community.rule2')}</li>
                                    <li>{t('community.rule3')}</li>
                                    <li>{t('community.rule4')}</li>
                                </ol>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </main>
    );
}
