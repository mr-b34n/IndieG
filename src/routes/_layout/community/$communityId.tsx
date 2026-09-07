import { useState, useMemo } from 'react';
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronRight,
    faMagnifyingGlass,
    faXmark,
    faChevronDown,
    faComments,
    faBook,
    faHouse,
    faCircleQuestion,
    faImages,
} from '@fortawesome/free-solid-svg-icons';
import { useCommunitiesStore } from '@/features/community';
import { INITIAL_COMMUNITIES } from '@/features/community/constants';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useAuthStore } from '@/features/auth';
import { useCommunityDetailQuery, usePostsQuery, useCreatePostMutation, useProfilesListQuery, useCommunityMemberMeQuery } from '@/shared/api/useQueries';
import { mapCommunityDtoToCommunityData, extractPostList, type PostDto, type ProfileEntity } from '@/shared/api';
import type { CommunityData } from '@/features/community/types';

import { CommunityHubSidebar } from '@/features/community/components/hub/CommunityHubSidebar';
import { CommunityHubHeader } from '@/features/community/components/hub/CommunityHubHeader';
import {
    CommunityHubFeed,
    type CommunityFeedPost,
    type PostType,
} from '@/features/community/components/hub/CommunityHubFeed';
import { CommunityHubMembers } from '@/features/community/components/hub/CommunityHubMembers';
import { CommunityHubMediaView, type MediaItem } from '@/features/community/components/hub/CommunityHubMediaView';
import { CommunityHubEventsView } from '@/features/community/components/hub/CommunityHubEventsView';
import { CommunityHubAboutView } from '@/features/community/components/hub/CommunityHubAboutView';
import {
    CommunityHubRightRail,
    type ContributorItem,
    type UpcomingEventTimelineItem,
} from '@/features/community/components/hub/CommunityHubRightRail';
import { CreateThreadModal } from '@/features/community/components/hub/CreateThreadModal';
import type { CategoryItem } from '@/features/community/components/hub/CommunityHubCategories';

// Community Admin Management Views
import { CommunityManageOverview } from '@/features/community/components/hub/CommunityManageOverview';
import { CommunityManageModeration } from '@/features/community/components/hub/CommunityManageModeration';
import { CommunityManageReports } from '@/features/community/components/hub/CommunityManageReports';
import { CommunityManageMembers } from '@/features/community/components/hub/CommunityManageMembers';
import { CommunityManageRules } from '@/features/community/components/hub/CommunityManageRules';
import { CommunityManageSettings } from '@/features/community/components/hub/CommunityManageSettings';

export const Route = createFileRoute('/_layout/community/$communityId')({
    component: CommunityDetailPage,
});

function mapPostDtoToCommunityFeedPost(dto: PostDto): CommunityFeedPost {
    const rawType = (dto.tags?.find((t) => ["guide", "question", "showcase", "poll", "event"].includes(t)) || "discussion") as PostType;
    const upvotes = dto.upvotes ?? dto.likes ?? 0;
    const downvotes = dto.downvotes ?? 0;

    const authorName = dto.user?.name || dto.user?.displayName || dto.user?.username || (dto.authorId ? `User_${dto.authorId.slice(0, 5)}` : "Thành viên");
    const authorHandle = dto.user?.username ? `@${dto.user.username}` : dto.user?.name ? `@${dto.user.name}` : (dto.authorId ? `@user_${dto.authorId.slice(0, 5)}` : "@member");
    const authorAvatar = dto.user?.avatar || dto.user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(dto.user?.username || dto.user?.name || dto.authorId || dto.id)}`;

    return {
        id: String(dto.id),
        type: rawType,
        title: dto.title || "Bài viết",
        content: dto.content || "",
        authorName,
        authorHandle,
        authorAvatar,
        authorRank: "Member",
        isPinned: !!dto.pinned,
        createdAt: dto.createdAt ? new Date(dto.createdAt).toLocaleDateString("vi-VN") : "Vừa xong",
        repliesCount: dto.commentsCount ?? 0,
        viewsCount: 1,
        likesCount: upvotes,
        upvotes: upvotes,
        downvotes: downvotes,
        score: dto.score ?? (upvotes - downvotes),
        repostsCount: 0,
        isLiked: false,
        images: dto.images && dto.images.length > 0 ? dto.images : undefined,
        tags: dto.tags || [],
    };
}

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

    // TanStack Query for Community Detail & Posts & Profiles
    const { data: communityDto } = useCommunityDetailQuery(communityId);
    const { data: remotePostsData } = usePostsQuery({ communityId });
    const { data: profilesData } = useProfilesListQuery({ limit: 6 });
    const createPostMutation = useCreatePostMutation();

    const communities = useCommunitiesStore((state) => state.communities);
    const toggleJoin = useCommunitiesStore((state) => state.toggleJoin);

    // Fetch active community
    const community: CommunityData = useMemo(() => {
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
            category: "Gaming",
            tags: ["gaming", communityId],
            description: "Cộng đồng chính thức: trao đổi kinh nghiệm, mẹo chơi, thiết kế căn cứ và hoạt động nổi bật.",
            bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
            avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80",
            backdrop: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
            logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80",
            members: 1,
            onlineNow: 1,
            joined: true,
            featured: false,
            rules: [
                "Tôn trọng các thành viên khác trong cộng đồng",
                "Không đăng tải thông tin sai sự thật hoặc lừa đảo",
                "Đặt tiêu đề bài viết rõ ràng, đúng chủ đề",
                "Không quảng cáo thương mại hoặc spam liên kết",
            ],
        };
    }, [communityId, communities, communityDto]);

    // Active Navigation: home, discussions, guides, media, events, members, leaderboard, wiki, links, rules, about, manage-*
    const [activeNav, setActiveNav] = useState("home");
    const [activeFilter, setActiveFilter] = useState("all");
    const [sortMode, setSortMode] = useState<"hot" | "new" | "unanswered" | "top">("hot");
    const [searchQuery, setSearchQuery] = useState("");
    const [showCommunitySwitcher, setShowCommunitySwitcher] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Fetch current user membership in community
    const { data: meMembershipData } = useCommunityMemberMeQuery(community.id);

    // Derived Community Role State based on /members/me response
    const userRole = useMemo<"owner" | "moderator" | "member">( () => {
        if (!meMembershipData) return "member";
        const raw = meMembershipData as unknown as Record<string, unknown>;
        const obj = (raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)
            ? raw.data
            : Array.isArray(raw.data) && raw.data[0]
            ? raw.data[0]
            : raw) as Record<string, unknown>;
        const roleLower = String(obj.role || raw.role || "").toLowerCase();
        if (roleLower === "owner" || roleLower === "admin") return "owner";
        if (roleLower === "moderator" || roleLower === "mod") return "moderator";
        return "member";
    }, [meMembershipData]);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Categories definition for creation modal
    const categoriesData: CategoryItem[] = [
        {
            id: "general",
            titleVi: "Thảo luận chung",
            titleEn: "General Discussion",
            descVi: "Trò chuyện, hỏi đáp và trao đổi tự do",
            descEn: "General chat, Q&A, and discussions",
            threadsCount: "0",
            icon: faComments,
        },
        {
            id: "guides",
            titleVi: "Guides & Tips",
            titleEn: "Guides & Tips",
            descVi: "Chia sẻ bí quyết, mẹo sinh tồn & cẩm nang",
            descEn: "Survival secrets, guides & walkthroughs",
            threadsCount: "0",
            icon: faBook,
        },
        {
            id: "base",
            titleVi: "Base Building",
            titleEn: "Base Building",
            descVi: "Ý tưởng thiết kế căn cứ & trang trí",
            descEn: "Base design ideas and decoration",
            threadsCount: "0",
            icon: faHouse,
        },
        {
            id: "gameplay",
            titleVi: "Gameplay Help",
            titleEn: "Gameplay Help",
            descVi: "Giải đáp thắc mắc nhiệm vụ & lỗi game",
            descEn: "Quest help, troubleshooting, and gameplay Q&A",
            threadsCount: "0",
            icon: faCircleQuestion,
        },
        {
            id: "showcase",
            titleVi: "Showcase",
            titleEn: "Showcase",
            descVi: "Khoe thành quả, hình ảnh & video đẹp",
            descEn: "Share creations, screenshots & artwork",
            threadsCount: "0",
            icon: faImages,
        },
    ];

    // Contributors
    const contributorsData: ContributorItem[] = useMemo(() => {
        if (!profilesData) {
            return [];
        }
        const rawList = Array.isArray(profilesData)
            ? (profilesData as ProfileEntity[])
            : (profilesData as { items?: ProfileEntity[]; data?: ProfileEntity[] })?.items ||
              (profilesData as { data?: ProfileEntity[] })?.data ||
              [];
        return rawList.slice(0, 5).map((p, idx) => ({
            id: p.id || `c-${idx}`,
            name: p.displayName || p.username || "Thành viên",
            handle: `@${p.username || "member"}`,
            avatar: p.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username || idx}`,
            points: (idx + 1) * 100,
        }));
    }, [profilesData]);

    // Local user created posts
    const [userCreatedPosts, setUserCreatedPosts] = useState<CommunityFeedPost[]>([]);

    // API + Local posts
    const allFeedPosts = useMemo<CommunityFeedPost[]>(() => {
        const rawList = extractPostList(remotePostsData);
        const mappedRemote = rawList.map(mapPostDtoToCommunityFeedPost);

        if (mappedRemote.length > 0) {
            const merged = [...userCreatedPosts];
            mappedRemote.forEach((rem) => {
                if (!merged.some((p) => p.id === rem.id)) {
                    merged.push(rem);
                }
            });
            return merged;
        }

        return userCreatedPosts;
    }, [remotePostsData, userCreatedPosts]);

    // Upcoming Events extracted from real posts
    const upcomingEventsData: UpcomingEventTimelineItem[] = useMemo(() => {
        const eventPosts = allFeedPosts.filter((p) => p.type === "event");
        return eventPosts.map((ep, idx) => ({
            id: ep.id || `ev-${idx}`,
            title: ep.title,
            dateMonth: ep.createdAt || "UPCOMING",
            time: "20:00 GMT+7",
            attendees: ep.likesCount + 1,
        }));
    }, [allFeedPosts]);

    // Media Items for Media Gallery extracted from real posts
    const mediaGalleryData: MediaItem[] = useMemo(() => {
        const list: MediaItem[] = [];
        allFeedPosts.forEach((post) => {
            if (post.images && post.images.length > 0) {
                post.images.forEach((img, idx) => {
                    list.push({
                        id: `${post.id}-img-${idx}`,
                        title: post.title || "Media item",
                        imageUrl: img,
                        authorName: post.authorName,
                        authorHandle: post.authorHandle,
                        likesCount: post.likesCount,
                        repliesCount: post.repliesCount,
                    });
                });
            }
        });
        return list;
    }, [allFeedPosts]);

    // Handle post filtering & sorting
    const filteredFeedPosts = useMemo(() => {
        let result = [...allFeedPosts];

        // Nav-level filtering if navigating via sidebar
        if (activeNav === "discussions") {
            result = result.filter((p) => p.type === "discussion" || p.type === "question");
        } else if (activeNav === "guides") {
            result = result.filter((p) => p.type === "guide");
        } else if (activeNav === "media") {
            result = result.filter((p) => p.type === "showcase" || (p.images && p.images.length > 0));
        } else if (activeNav === "events") {
            result = result.filter((p) => p.type === "event");
        }

        // Sub-filter dropdown filtering (All, Discussion, Question, Guide, Showcase, Poll, Event)
        if (activeFilter !== "all") {
            result = result.filter((p) => p.type === activeFilter);
        }

        // Search Query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    p.authorName.toLowerCase().includes(q) ||
                    (p.content && p.content.toLowerCase().includes(q))
            );
        }

        // Sorting
        if (sortMode === "new") {
            // Newest
        } else if (sortMode === "top") {
            result.sort((a, b) => b.likesCount - a.likesCount);
        } else if (sortMode === "unanswered") {
            result.sort((a, b) => a.repliesCount - b.repliesCount);
        } else {
            // Hot: combined engagement
            result.sort((a, b) => (b.likesCount * 2 + b.repliesCount * 3) - (a.likesCount * 2 + a.repliesCount * 3));
        }

        return result;
    }, [allFeedPosts, activeNav, activeFilter, searchQuery, sortMode]);

    const requireVerifiedEmail = useAuthStore((state) => state.requireVerifiedEmail);

    // Handle Post Creation
    const handleCreatePost = async ({
        title,
        content,
        category,
        type = "discussion",
    }: {
        title: string;
        category: string;
        content: string;
        type?: PostType;
    }) => {
        if (!requireVerifiedEmail("đăng bài viết mới")) return;
        const newPost: CommunityFeedPost = {
            id: `post-${Date.now()}`,
            type,
            title,
            content,
            authorName: user?.username || "You",
            authorHandle: user?.username ? `@${user.username}` : "@current_user",
            authorAvatar: user?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser",
            authorRank: "Active Member",
            createdAt: "Just now",
            repliesCount: 0,
            viewsCount: 1,
            likesCount: 1,
            repostsCount: 0,
            isLiked: true,
            tags: [type, category].filter(Boolean),
        };
        setUserCreatedPosts((prev) => [newPost, ...prev]);

        try {
            await createPostMutation.mutateAsync({
                communityId,
                title,
                content,
                tags: [type, category].filter(Boolean),
            });
        } catch {
            // locally retained
        }
    };

    const handleNavChange = (navId: string) => {
        setActiveNav(navId);
        setActiveFilter("all");
    };

    const isManageView = activeNav.startsWith("manage-");
    const getManageBreadcrumbTitle = (nav: string) => {
        switch (nav) {
            case "manage-overview":
                return isVi ? "TỔNG QUAN" : "OVERVIEW";
            case "manage-moderation":
                return isVi ? "KIỂM DUYỆT" : "MODERATION";
            case "manage-reports":
                return isVi ? "BÁO CÁO" : "REPORTS";
            case "manage-members":
                return isVi ? "THÀNH VIÊN" : "MEMBERS";
            case "manage-rules":
                return isVi ? "QUY TẮC" : "RULES";
            case "manage-settings":
                return isVi ? "CÀI ĐẶT" : "SETTINGS";
            default:
                return "";
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-5 font-sans text-text animate-fade-in pb-16">
            {/* 1. TOP BREADCRUMB / SEARCH BAR / ROLE TOGGLE */}
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-divider-primary/40 pb-2.5 select-none">
                <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider flex-wrap">
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/community" })}
                        className="text-text-muted hover:text-text cursor-pointer transition-colors"
                    >
                        COMMUNITIES
                    </button>
                    <FontAwesomeIcon icon={faChevronRight} className="text-[8px] text-text-faint" />
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                if (isManageView) {
                                    handleNavChange("home");
                                } else {
                                    setShowCommunitySwitcher(!showCommunitySwitcher);
                                }
                            }}
                            className="text-primary hover:underline cursor-pointer flex items-center gap-1.5 uppercase font-bold"
                        >
                            <span>{community.name}</span>
                            {!isManageView && <FontAwesomeIcon icon={faChevronDown} className="text-[8px]" />}
                        </button>

                        {showCommunitySwitcher && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowCommunitySwitcher(false)}
                                />
                                <div className="absolute left-0 top-full mt-1.5 w-52 bg-surface border border-divider-primary rounded-[6px] shadow-2xl z-50 p-1 flex flex-col gap-0.5 max-h-60 overflow-y-auto">
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

                    {/* Manage Sub-Breadcrumb */}
                    {isManageView && (
                        <>
                            <FontAwesomeIcon icon={faChevronRight} className="text-[8px] text-text-faint" />
                            <button
                                type="button"
                                onClick={() => handleNavChange("manage-overview")}
                                className="text-text-muted hover:text-text cursor-pointer transition-colors"
                            >
                                MANAGE
                            </button>
                            <FontAwesomeIcon icon={faChevronRight} className="text-[8px] text-text-faint" />
                            <span className="text-primary uppercase font-bold">
                                {getManageBreadcrumbTitle(activeNav)}
                            </span>
                        </>
                    )}
                </div>

                {/* Right controls: Search Input */}
                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    {/* Search Input */}
                    <div className="relative w-36 sm:w-56">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint text-xs"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search in ${community.name}...`}
                            className="w-full h-7.5 pl-8 pr-7 bg-surface-inner hover:bg-surface-hover/60 focus:bg-surface border border-divider-primary/50 focus:border-primary rounded-[4px] text-xs font-medium text-text placeholder:text-text-faint focus:outline-none transition-colors"
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
            </div>

            {/* 2. 3-COLUMN DESKTOP LAYOUT (Left: 220px/64px, Center: 760-840px, Right: 260-280px) */}
            <div className="w-full flex flex-col md:flex-row items-start gap-6 lg:gap-8 min-w-0">
                {/* LEFT COLUMN: Persistent Navigation Sidebar */}
                <div
                    className={`shrink-0 transition-all duration-300 ${
                        isSidebarCollapsed ? "w-14" : "w-full md:w-[200px] lg:w-[220px]"
                    }`}
                >
                    <CommunityHubSidebar
                        activeNav={activeNav}
                        onNavChange={handleNavChange}
                        isCollapsed={isSidebarCollapsed}
                        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        isVi={isVi}
                        userRole={userRole}
                        pendingCount={0}
                        reportsCount={0}
                    />
                </div>

                {/* CENTER COLUMN: Main Content & Activity Feed */}
                <main className="flex-1 w-full min-w-0 max-w-[840px] flex flex-col gap-6">
                    {/* Compact Community Header */}
                    <CommunityHubHeader
                        name={community.name}
                        description={community.description}
                        coverUrl={community.backdrop || community.bannerUrl || community.logo}
                        iconUrl={community.logo || community.avatarUrl}
                        membersCount={community.members ?? 1}
                        onlineCount={community.onlineNow ?? 1}
                        isJoined={!!community.joined}
                        onToggleJoin={() => {
                            if (!requireVerifiedEmail("tham gia cộng đồng")) return;
                            toggleJoin(community.id);
                        }}
                        onStartDiscussion={() => {
                            if (!requireVerifiedEmail("tạo bài viết")) return;
                            setIsCreateModalOpen(true);
                        }}
                        isVi={isVi}
                        isLocked={community.isLocked}
                        announcement={community.announcement}
                        featured={community.featured}
                        userRole={userRole}
                        onManageClick={() => handleNavChange("manage-overview")}
                    />

                    {/* VIEW SWITCHER: Display content according to selected destination */}
                    {activeNav === "manage-overview" ? (
                        <CommunityManageOverview
                            communityId={community.id}
                            communityName={community.name}
                            totalMembers={community.members}
                            userRole={userRole}
                            isVi={isVi}
                            onNavigate={handleNavChange}
                        />
                    ) : activeNav === "manage-moderation" ? (
                        <CommunityManageModeration
                            communityId={community.id}
                            communityName={community.name}
                            initialTab="requests"
                            userRole={userRole}
                            isVi={isVi}
                            onNavigateRules={() => handleNavChange("manage-rules")}
                        />
                    ) : activeNav === "manage-reports" ? (
                        <CommunityManageReports
                            communityId={community.id}
                            communityName={community.name}
                            userRole={userRole}
                            isVi={isVi}
                            onNavigateRules={() => handleNavChange("manage-rules")}
                        />
                    ) : activeNav === "manage-members" ? (
                        <CommunityManageMembers
                            communityId={community.id}
                            communityName={community.name}
                            userRole={userRole}
                            isVi={isVi}
                        />
                    ) : activeNav === "manage-rules" ? (
                        <CommunityManageRules
                            communityId={community.id}
                            communityName={community.name}
                            userRole={userRole}
                            isVi={isVi}
                        />
                    ) : activeNav === "manage-settings" ? (
                        <CommunityManageSettings
                            communityId={community.id}
                            communityName={community.name}
                            communityDescription={community.description}
                            communitySlug={community.slug || community.id}
                            userRole={userRole}
                            isVi={isVi}
                        />
                    ) : activeNav === "members" || activeNav === "leaderboard" ? (
                        <CommunityHubMembers
                            communityId={community.id}
                            communityName={community.name}
                            contributors={contributorsData}
                            isVi={isVi}
                        />
                    ) : activeNav === "media" ? (
                        <CommunityHubMediaView
                            communityName={community.name}
                            mediaItems={mediaGalleryData}
                            isVi={isVi}
                        />
                    ) : activeNav === "events" ? (
                        <CommunityHubEventsView
                            communityName={community.name}
                            events={upcomingEventsData}
                            isVi={isVi}
                        />
                    ) : activeNav === "rules" || activeNav === "about" || activeNav === "wiki" || activeNav === "links" ? (
                        <CommunityHubAboutView
                            viewType={activeNav as "rules" | "about" | "wiki" | "links"}
                            communityName={community.name}
                            description={community.description}
                            isVi={isVi}
                        />
                    ) : (
                        /* Default: Activity Feed (Home, Discussions, Guides) */
                        <CommunityHubFeed
                            posts={filteredFeedPosts}
                            activeFilter={activeFilter}
                            onFilterChange={(filter) => setActiveFilter(filter)}
                            sortMode={sortMode}
                            onSortChange={(mode) => setSortMode(mode)}
                            onPostClick={(postId) => navigate({ to: `/post/${postId}` as string })}
                            communityId={community.id}
                            communityName={community.name}
                            isVi={isVi}
                        />
                    )}
                </main>

                {/* RIGHT COLUMN: Lightweight Contextual Rail */}
                <div className="w-full md:w-[240px] lg:w-[260px] shrink-0 hidden md:block">
                    <CommunityHubRightRail
                        communityName={community.name}
                        description={community.description}
                        membersCount={community.members ?? 1}
                        onlineCount={community.onlineNow ?? 1}
                        contributors={contributorsData}
                        nextEvent={upcomingEventsData[0]}
                        onNavigateNav={handleNavChange}
                        isVi={isVi}
                        userRole={userRole}
                        pendingCount={0}
                        reportsCount={0}
                        modsCount={1}
                    />
                </div>
            </div>

            {/* CREATE POST MODAL */}
            <CreateThreadModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                categories={categoriesData}
                onSubmit={handleCreatePost}
                communityName={community.name}
                isVi={isVi}
            />
        </div>
    );
}
