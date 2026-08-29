import { useState, useMemo } from 'react';
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faComments,
    faCircleQuestion,
    faBook,
    faImages,
    faHouse,
    faChevronRight,
    faMagnifyingGlass,
    faXmark,
    faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { useCommunitiesStore } from '@/features/community';
import { INITIAL_COMMUNITIES } from '@/features/community/constants';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useAuthStore } from '@/features/auth';
import { useCommunityDetailQuery } from '@/shared/api/useQueries';
import { mapCommunityDtoToCommunityData } from '@/shared/api';


import { CommunityHubSidebar } from '@/features/community/components/hub/CommunityHubSidebar';
import { CommunityHubHeader } from '@/features/community/components/hub/CommunityHubHeader';
import { CommunityHubNav } from '@/features/community/components/hub/CommunityHubNav';
import {
    CommunityHubCategories,
    type CategoryItem,
} from '@/features/community/components/hub/CommunityHubCategories';
import {
    CommunityHubPinned,
    type PinnedThreadItem,
} from '@/features/community/components/hub/CommunityHubPinned';
import {
    CommunityHubDiscussions,
    type DiscussionThread,
} from '@/features/community/components/hub/CommunityHubDiscussions';
import {
    CommunityHubRightRail,
    type ContributorItem,
    type UpcomingEventTimelineItem,
} from '@/features/community/components/hub/CommunityHubRightRail';
import { CommunityChatDrawer } from '@/features/community/components/hub/CommunityChatDrawer';
import { CreateThreadModal } from '@/features/community/components/hub/CreateThreadModal';
import { AdminCommunityControllerModal } from '@/features/community';

export const Route = createFileRoute('/_layout/community/$communityId')({
    component: CommunityDetailPage,
});

export function CommunityDetailPage() {
    let communityId = "raft";
    try {
        const params = useParams({ strict: false });
        if (params && params.communityId) {
            communityId = params.communityId;
        }
    } catch {
        communityId = "raft";
    }

    const navigate = useNavigate();
    const language = useThemeStore((state) => state.language);
    const isVi = language === "vi";

    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.role === "admin";

    // TanStack Query for Community Detail
    const { data: communityDto } = useCommunityDetailQuery(communityId);

    const communities = useCommunitiesStore((state) => state.communities);
    const toggleJoin = useCommunitiesStore((state) => state.toggleJoin);

    // Fetch active community
    const community = useMemo(() => {
        const found = communities.find(
            (c) => c.id === communityId || c.slug === communityId || c.id.toString() === communityId
        );
        if (found) return found;
        if (communityDto) {
            return mapCommunityDtoToCommunityData(communityDto);
        }
        const initialFound = INITIAL_COMMUNITIES.find(
            (c) => c.id === communityId || c.slug === communityId
        );
        if (initialFound) return initialFound;
        return {
            id: communityId,
            name: communityId.charAt(0).toUpperCase() + communityId.slice(1),
            slug: communityId,
            description: "Cộng đồng chính thức dành cho game thủ: trao đổi kinh nghiệm, mẹo chơi, thiết kế và tin tức mới nhất.",
            bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
            avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80",
            backdrop: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
            logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80",
            members: 24540,
            onlineNow: 416,
            joined: true,
            featured: true,
            rules: [
                "Tôn trọng các thành viên khác trong cộng đồng",
                "Không đăng tải thông tin sai sự thật hoặc lừa đảo",
                "Đặt tiêu đề bài viết rõ ràng, đúng danh mục",
                "Không quảng cáo thương mại hoặc spam link bẩn",
            ],
        };
    }, [communityId, communities, communityDto]);


    // UI States
    const [activeSidebarNav, setActiveSidebarNav] = useState("all");
    const [activeSubTab, setActiveSubTab] = useState("overview");
    const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
    const [sortMode, setSortMode] = useState<"hot" | "new" | "unanswered" | "top">("hot");
    const [searchQuery, setSearchQuery] = useState("");
    const [showCommunitySwitcher, setShowCommunitySwitcher] = useState(false);

    // Modals & Drawers
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isAdminControllerOpen, setIsAdminControllerOpen] = useState(false);

    // Categories definition
    const categoriesData: CategoryItem[] = [
        {
            id: "general",
            titleVi: "Thảo luận chung",
            titleEn: "General Discussion",
            descVi: "Trò chuyện, hỏi đáp và trao đổi tự do",
            descEn: "General chat, Q&A, and discussions",
            threadsCount: "1.2K",
            icon: faComments,
        },
        {
            id: "guides",
            titleVi: "Guides & Tips",
            titleEn: "Guides & Tips",
            descVi: "Chia sẻ bí quyết, mẹo sinh tồn & cẩm nang",
            descEn: "Survival secrets, guides & walkthroughs",
            threadsCount: "850",
            icon: faBook,
        },
        {
            id: "base",
            titleVi: "Base Building",
            titleEn: "Base Building",
            descVi: "Ý tưởng thiết kế căn cứ & trang trí",
            descEn: "Base design ideas and decoration",
            threadsCount: "620",
            icon: faHouse,
        },
        {
            id: "gameplay",
            titleVi: "Gameplay Help",
            titleEn: "Gameplay Help",
            descVi: "Giải đáp thắc mắc nhiệm vụ & lỗi game",
            descEn: "Quest help, troubleshooting, and gameplay Q&A",
            threadsCount: "980",
            icon: faCircleQuestion,
        },
        {
            id: "showcase",
            titleVi: "Showcase",
            titleEn: "Showcase",
            descVi: "Khoe thành quả, hình ảnh & video đẹp",
            descEn: "Share creations, screenshots & artwork",
            threadsCount: "430",
            icon: faImages,
        },
    ];

    // Pinned Threads
    const pinnedThreadsData: PinnedThreadItem[] = [];

    // Recent Discussions
    const [recentThreads, setRecentThreads] = useState<DiscussionThread[]>([]);

    // Contributors
    const contributorsData: ContributorItem[] = [];

    // Upcoming Events
    const upcomingEventsData: UpcomingEventTimelineItem[] = [];

    // Filtered Discussions
    const filteredThreads = useMemo(() => {
        let result = [...recentThreads];

        if (activeCategoryFilter) {
            result = result.filter((t) => t.category === activeCategoryFilter);
        }

        if (activeSidebarNav !== "all" && activeSidebarNav !== "overview") {
            if (activeSidebarNav === "qa") result = result.filter((t) => t.category === "gameplay");
            if (activeSidebarNav === "guides") result = result.filter((t) => t.category === "guides");
            if (activeSidebarNav === "showcase") result = result.filter((t) => t.category === "showcase");
        }

        if (activeSubTab !== "overview" && activeSubTab !== "discussions") {
            if (activeSubTab === "guides") result = result.filter((t) => t.category === "guides");
            if (activeSubTab === "showcase") result = result.filter((t) => t.category === "showcase");
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (t) => t.title.toLowerCase().includes(q) || t.authorName.toLowerCase().includes(q)
            );
        }

        if (sortMode === "new") {
            result.reverse();
        } else if (sortMode === "top") {
            result.sort((a, b) => b.viewsCount - a.viewsCount);
        } else if (sortMode === "unanswered") {
            result.sort((a, b) => a.repliesCount - b.repliesCount);
        }

        return result;
    }, [recentThreads, activeCategoryFilter, activeSidebarNav, activeSubTab, searchQuery, sortMode]);

    const requireVerifiedEmail = useAuthStore((state) => state.requireVerifiedEmail);

    // Handle Discussion Creation
    const handleCreateThread = ({
        title,
        category,
    }: {
        title: string;
        category: string;
        content: string;
    }) => {
        if (!requireVerifiedEmail("tạo thảo luận mới")) return;
        const catObj = categoriesData.find((c) => c.id === category);
        const newThread: DiscussionThread = {
            id: `th-new-${Date.now()}`,
            title,
            category,
            categoryLabel: catObj ? (isVi ? catObj.titleVi : catObj.titleEn) : "Discussion",
            authorName: "You",
            authorHandle: "@current_user",
            authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser",
            repliesCount: 0,
            viewsCount: 1,
            likesCount: 1,
            createdAt: "Just now",
        };
        setRecentThreads([newThread, ...recentThreads]);
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 font-sans text-text animate-fade-in pb-16">
            {/* 1. TOP BREADCRUMB / CONTEXT BAR (Maintains IndieG Identity) */}
            <div className="w-full flex items-center justify-between gap-4 border-b border-divider-primary/60 pb-3 select-none">
                <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider">
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/community" })}
                        className="text-text-muted hover:text-text cursor-pointer transition-colors"
                    >
                        COMMUNITIES
                    </button>
                    <FontAwesomeIcon icon={faChevronRight} className="text-[9px] text-text-faint" />
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowCommunitySwitcher(!showCommunitySwitcher)}
                            className="text-primary hover:underline cursor-pointer flex items-center gap-1.5 uppercase font-black"
                        >
                            <span>{community.name}</span>
                            <FontAwesomeIcon icon={faChevronDown} className="text-[8px]" />
                        </button>

                        {showCommunitySwitcher && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowCommunitySwitcher(false)}
                                />
                                <div className="absolute left-0 top-full mt-1.5 w-52 bg-surface border border-divider-primary rounded-[4px] shadow-2xl z-50 p-1 flex flex-col gap-0.5 max-h-60 overflow-y-auto">
                                    {INITIAL_COMMUNITIES.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => {
                                                navigate({
                                                    to: "/community/$communityId",
                                                    params: { communityId: c.id },
                                                });
                                                setShowCommunitySwitcher(false);
                                            }}
                                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs font-semibold text-left transition-colors cursor-pointer ${
                                                c.id === community.id
                                                    ? "bg-primary/10 text-primary font-bold"
                                                    : "text-text-muted hover:text-text hover:bg-surface-hover/60"
                                            }`}
                                        >
                                            <img
                                                src={c.logo}
                                                alt={c.name}
                                                className="w-4 h-4 rounded-[2px] object-cover"
                                            />
                                            <span className="truncate">{c.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right: Inline Search Bar */}
                <div className="relative w-48 sm:w-64">
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint text-xs"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search in ${community.name}...`}
                        className="w-full h-8 pl-8 pr-7 bg-surface hover:bg-surface-hover/60 focus:bg-surface border border-divider-primary/60 focus:border-primary rounded-[4px] text-xs font-semibold text-text placeholder:text-text-faint focus:outline-none transition-colors"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-faint hover:text-text cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faXmark} className="text-xs" />
                        </button>
                    )}
                </div>
            </div>

            {/* 2. 3-COLUMN INFORMATION ARCHITECTURE: 220px | minmax(0, 1fr) | 260px */}
            <div className="w-full flex flex-col lg:flex-row items-start gap-8 min-w-0">
                {/* LEFT COLUMN: Community Navigation Rail (220px) */}
                <div className="w-full lg:w-[220px] shrink-0">
                    <CommunityHubSidebar
                        communityName={community.name}
                        activeNav={activeSidebarNav}
                        onNavChange={(navId) => {
                            setActiveSidebarNav(navId);
                            setActiveCategoryFilter(null);
                        }}
                        isVi={isVi}
                    />
                </div>

                {/* CENTER COLUMN: Community Content (Header, Sub-Nav, Categories, Pinned, Discussions) */}
                <div className="flex-1 w-full min-w-0 flex flex-col gap-6">
                    {/* Header + Editorial Artwork */}
                    <CommunityHubHeader
                        name={community.name}
                        description={community.description}
                        coverUrl={community.backdrop || community.bannerUrl || community.logo}
                        iconUrl={community.logo || community.avatarUrl}
                        membersCount={community.members || 24540}
                        onlineCount={community.onlineNow || 416}
                        isJoined={!!community.joined}
                        onToggleJoin={() => {
                            if (!requireVerifiedEmail("tham gia cộng đồng")) return;
                            toggleJoin(community.id);
                        }}
                        onStartDiscussion={() => {
                            if (!requireVerifiedEmail("đăng bài thảo luận")) return;
                            setIsCreateModalOpen(true);
                        }}
                        isVi={isVi}
                        isAdmin={isAdmin}
                        onOpenAdminController={() => setIsAdminControllerOpen(true)}
                        isLocked={community.isLocked}
                        autoApprovePosts={community.autoApprovePosts}
                        announcement={community.announcement}
                        featured={community.featured}
                        isNsfw={community.isNsfw}
                    />

                    {/* Sub-navigation Under Header (Overview · Discussions · Guides · Showcase · Events) */}
                    <CommunityHubNav
                        activeTab={activeSubTab}
                        onTabChange={(tab) => {
                            setActiveSubTab(tab);
                            setActiveCategoryFilter(null);
                        }}
                        isVi={isVi}
                    />

                    {/* Categories Section (Index style, no outer box) */}
                    <CommunityHubCategories
                        categories={categoriesData}
                        activeCategory={activeCategoryFilter}
                        onSelectCategory={(catId) => setActiveCategoryFilter(catId)}
                        isVi={isVi}
                    />

                    {/* Pinned Threads (Clean list, no outer box) */}
                    <CommunityHubPinned
                        pinnedThreads={pinnedThreadsData}
                        onThreadClick={(id) => navigate({ to: `/post/${id}` as string })}
                        isVi={isVi}
                    />

                    {/* Recent Discussions (Post consistency: Avatar, Title, Engagement, Dividers) */}
                    <CommunityHubDiscussions
                        threads={filteredThreads}
                        sortMode={sortMode}
                        onSortChange={(mode) => setSortMode(mode)}
                        onThreadClick={(id) => navigate({ to: `/post/${id}` as string })}
                        isVi={isVi}
                    />
                </div>

                {/* RIGHT COLUMN: About & Social Hub Rail (260px) */}
                <div className="w-full lg:w-[260px] shrink-0">
                    <CommunityHubRightRail
                        communityName={community.name}
                        description={community.description}
                        onlineCount={community.onlineNow || 416}
                        contributors={contributorsData}
                        events={upcomingEventsData}
                        onOpenChat={() => setIsChatOpen(true)}
                        isVi={isVi}
                    />
                </div>
            </div>

            {/* CREATE DISCUSSION MODAL */}
            <CreateThreadModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                categories={categoriesData}
                onSubmit={handleCreateThread}
                communityName={community.name}
                isVi={isVi}
            />

            {/* REALTIME CHAT DRAWER */}
            <CommunityChatDrawer
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                communityName={community.name}
                isVi={isVi}
            />

            {/* ADMIN COMMUNITY CONTROLLER MODAL */}
            {isAdminControllerOpen && (
                <AdminCommunityControllerModal
                    community={community}
                    onClose={() => setIsAdminControllerOpen(false)}
                />
            )}
        </div>
    );
}
