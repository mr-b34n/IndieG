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
import { useCommunityDetailQuery } from '@/shared/api/useQueries';
import { mapCommunityDtoToCommunityData } from '@/shared/api';
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
import { AdminCommunityControllerModal } from '@/features/community';
import type { CategoryItem } from '@/features/community/components/hub/CommunityHubCategories';

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
            members: 24540,
            onlineNow: 416,
            joined: true,
            featured: true,
            rules: [
                "Tôn trọng các thành viên khác trong cộng đồng",
                "Không đăng tải thông tin sai sự thật hoặc lừa đảo",
                "Đặt tiêu đề bài viết rõ ràng, đúng chủ đề",
                "Không quảng cáo thương mại hoặc spam liên kết",
            ],
        };
    }, [communityId, communities, communityDto]);

    // Active Navigation: home, discussions, guides, media, events, members, leaderboard, wiki, links, rules, about
    const [activeNav, setActiveNav] = useState("home");
    const [activeFilter, setActiveFilter] = useState("all");
    const [sortMode, setSortMode] = useState<"hot" | "new" | "unanswered" | "top">("hot");
    const [searchQuery, setSearchQuery] = useState("");
    const [showCommunitySwitcher, setShowCommunitySwitcher] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAdminControllerOpen, setIsAdminControllerOpen] = useState(false);

    // Categories definition for creation modal
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

    // Contributors
    const contributorsData: ContributorItem[] = [
        {
            id: "c-1",
            name: "Hải Đăng",
            handle: "@haidang_craft",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
            points: 2450,
        },
        {
            id: "c-2",
            name: "Minh Quân",
            handle: "@shark_hunter99",
            avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
            points: 1820,
        },
        {
            id: "c-3",
            name: "Thùy Trang",
            handle: "@raft_architect",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
            points: 1240,
        },
        {
            id: "c-4",
            name: "Tuấn Kiệt",
            handle: "@tuan_kiet_dota",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            points: 980,
        },
    ];

    // Upcoming Events
    const upcomingEventsData: UpcomingEventTimelineItem[] = [
        {
            id: "ev-1",
            title: isVi ? "Giải đấu Custom 5v5 - Tranh tài vô địch" : "Community Farm Tour & Showcase",
            dateMonth: "MAR 22",
            time: "20:00 GMT+7",
            attendees: 38,
        },
    ];

    // Media Items for Media Gallery
    const mediaGalleryData: MediaItem[] = [
        {
            id: "med-1",
            title: "Căn cứ bè gỗ 3 tầng phong cách Nhật Bản",
            imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
            authorName: "Thùy Trang",
            authorHandle: "@raft_architect",
            likesCount: 142,
            repliesCount: 28,
        },
        {
            id: "med-2",
            title: "Trận chiến diệt boss cá mập trắng thành công",
            imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
            authorName: "Minh Quân",
            authorHandle: "@shark_hunter99",
            likesCount: 98,
            repliesCount: 14,
        },
        {
            id: "med-3",
            title: "Thiết kế phòng điều khiển tàu hiện đại với pin năng lượng mặt trời",
            imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
            authorName: "Hải Đăng",
            authorHandle: "@haidang_craft",
            likesCount: 184,
            repliesCount: 35,
        },
    ];

    // Rich initial community feed posts
    const [feedPosts, setFeedPosts] = useState<CommunityFeedPost[]>([
        {
            id: "post-1",
            type: "guide",
            title: isVi
                ? "Tổng hợp mẹo sinh tồn 100 ngày đầu & cách tối ưu hóa thu hoạch nước ngọt"
                : "Comprehensive 100-Day Survival Guide & Infinite Fresh Water Setup",
            content: isVi
                ? "Chia sẻ chi tiết kinh nghiệm từ việc chế tạo máy lọc nước nâng cao, bố trí lưới bắt rác tự động đến cách đối phó với cá mập mà không tốn nhiều tài nguyên kim loại quý..."
                : "Step-by-step breakdown on automating purifier grids, collection nets placement, and preserving metal ingots during early-game shark encounters...",
            authorName: "Hải Đăng",
            authorHandle: "@haidang_craft",
            authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
            authorRank: "Legendary Pioneer",
            isPinned: true,
            createdAt: "3h",
            repliesCount: 42,
            viewsCount: 1850,
            likesCount: 215,
            repostsCount: 18,
            isLiked: false,
            tags: ["survival", "guide", "automation"],
        },
        {
            id: "post-2",
            type: "showcase",
            title: isVi
                ? "Showcase căn cứ bè nổi 3 tầng đầy đủ trang bị sau 60 giờ cày cuốc"
                : "Base Showcase: 3-Story Autonomous Floating Sanctuary after 60 Hours",
            content: isVi
                ? "Cuối cùng cũng hoàn thiện khu vườn sinh thái trên tầng thượng và hệ thống pin năng lượng mặt trời. Mời mọi người vào đánh giá và góp ý thêm góc thư giãn nhé!"
                : "Finished the rooftop botanical garden and solar array. Welcome any tips on aesthetic decoration and fuel pipe routing!",
            images: [
                "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
            ],
            authorName: "Thùy Trang",
            authorHandle: "@raft_architect",
            authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
            authorRank: "Master Architect",
            createdAt: "5h",
            repliesCount: 19,
            viewsCount: 940,
            likesCount: 128,
            repostsCount: 12,
            isLiked: true,
            tags: ["showcase", "architecture"],
        },
        {
            id: "post-3",
            type: "poll",
            title: isVi
                ? "Bình chọn: Bạn muốn bản cập nhật kế tiếp tập trung vào tính năng nào nhất?"
                : "Which major feature should the developers prioritize next?",
            content: isVi
                ? "Các nhà phát triển đang lắng nghe ý kiến cộng đồng trên roadmap. Hãy bình chọn tính năng bạn mong chờ nhất!"
                : "The dev team is reviewing feedback for the upcoming season. Cast your vote below!",
            pollOptions: [
                { id: "opt-1", label: isVi ? "Thêm quần xã sinh vật đảo tuyết & núi lửa" : "New Arctic & Volcanic Island Biomes", votes: 84 },
                { id: "opt-2", label: isVi ? "Chế độ Multiplayer 8 người & voice chat 3D" : "8-Player Co-op & Proximity Voice Chat", votes: 122 },
                { id: "opt-3", label: isVi ? "Tự động hóa hệ thống máy bay không người lái" : "Drone Automation & Advanced Wiring", votes: 45 },
                { id: "opt-4", label: isVi ? "Thêm boss quái vật biển sâu khổng lồ" : "Deep Sea Giant Leviathan Bosses", votes: 97 },
            ],
            userVotedPollId: "opt-2",
            authorName: "Minh Quân",
            authorHandle: "@shark_hunter99",
            authorAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
            authorRank: "Community Mod",
            createdAt: "1d",
            repliesCount: 65,
            viewsCount: 2310,
            likesCount: 310,
            repostsCount: 24,
        },
        {
            id: "post-4",
            type: "question",
            title: isVi
                ? "Làm cách nào để chống cá mập cắn bè hiệu quả khi chưa có giáp sắt bảo vệ góc?"
                : "How to effectively protect outer foundations from shark bites before reinforced armor?",
            content: isVi
                ? "Mình mới tới hòn đảo lớn đầu tiên, cá mập cứ cắn nát các góc bè làm rơi rương đồ. Mọi người có mẹo dùng mồi cá hay vũ khí nào xử lý nhanh không?"
                : "Arrived at the first large island, but the shark keeps chewing through my outer wooden foundations. Any bait crafting tricks or early spearing tips?",
            authorName: "Tuấn Kiệt",
            authorHandle: "@tuan_kiet_dota",
            authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
            createdAt: "1d",
            repliesCount: 24,
            viewsCount: 610,
            likesCount: 45,
            repostsCount: 4,
            tags: ["question", "gameplay"],
        },
        {
            id: "post-5",
            type: "event",
            title: isVi
                ? "Giải đấu cộng đồng: Thử thách sinh tồn Hardcore 5v5 diễn ra vào thứ Bảy"
                : "Weekend Community Challenge: 5v5 Hardcore Speedrun Tournament",
            content: isVi
                ? "Đăng ký tham gia ngay để nhận huy hiệu độc quyền và phần quà từ ban quản trị. Thời gian bắt đầu: 20:00 Thứ Bảy tuần này."
                : "Register your team for our weekly community tournament. Exclusive badges and prizes for the winning survival squad!",
            authorName: "Hải Đăng",
            authorHandle: "@haidang_craft",
            authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
            authorRank: "Admin",
            createdAt: "2d",
            repliesCount: 31,
            viewsCount: 1420,
            likesCount: 156,
            repostsCount: 9,
            eventDate: "MAR 22",
            eventTime: "20:00 GMT+7",
            eventLocation: "Custom Tournament Lobby",
        },
    ]);

    // Handle post filtering & sorting
    const filteredFeedPosts = useMemo(() => {
        let result = [...feedPosts];

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
    }, [feedPosts, activeNav, activeFilter, searchQuery, sortMode]);

    const requireVerifiedEmail = useAuthStore((state) => state.requireVerifiedEmail);

    // Handle Post Creation
    const handleCreatePost = ({
        title,
        content,
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
        };
        setFeedPosts([newPost, ...feedPosts]);
    };

    const handleNavChange = (navId: string) => {
        setActiveNav(navId);
        setActiveFilter("all");
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-5 font-sans text-text animate-fade-in pb-16">
            {/* 1. TOP BREADCRUMB / SEARCH BAR */}
            <div className="w-full flex items-center justify-between gap-4 border-b border-divider-primary/40 pb-2.5 select-none">
                <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider">
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
                            onClick={() => setShowCommunitySwitcher(!showCommunitySwitcher)}
                            className="text-primary hover:underline cursor-pointer flex items-center gap-1.5 uppercase font-bold"
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
                </div>

                {/* Right: Search Input */}
                <div className="relative w-44 sm:w-60">
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
                        membersCount={community.members || 24540}
                        onlineCount={community.onlineNow || 416}
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
                        isAdmin={isAdmin}
                        onOpenAdminController={() => setIsAdminControllerOpen(true)}
                        isLocked={community.isLocked}
                        announcement={community.announcement}
                        featured={community.featured}
                    />

                    {/* VIEW SWITCHER: Display content according to selected destination */}
                    {activeNav === "members" || activeNav === "leaderboard" ? (
                        <CommunityHubMembers
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
                            isVi={isVi}
                        />
                    )}
                </main>

                {/* RIGHT COLUMN: Lightweight Contextual Rail */}
                <div className="w-full md:w-[240px] lg:w-[260px] shrink-0 hidden md:block">
                    <CommunityHubRightRail
                        communityName={community.name}
                        description={community.description}
                        membersCount={community.members || 24540}
                        onlineCount={community.onlineNow || 416}
                        contributors={contributorsData}
                        nextEvent={upcomingEventsData[0]}
                        onNavigateNav={handleNavChange}
                        isVi={isVi}
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

            {/* ADMIN CONTROLLER MODAL */}
            {isAdminControllerOpen && (
                <AdminCommunityControllerModal
                    community={community}
                    onClose={() => setIsAdminControllerOpen(false)}
                />
            )}
        </div>
    );
}
