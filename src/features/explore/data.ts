import type { FeaturedStory, NewsItem, EventItem, ViralMediaTile, TrendingTag } from "./types";

export const FEATURED_STORIES: FeaturedStory[] = [
    {
        id: "feat-1",
        title: "RED DEAD REDEMPTION 2",
        slug: "red-dead-redemption-2",
        category: "EDITORIAL SPOTLIGHT",
        genres: ["Open World", "Story", "Community"],
        artworkUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&auto=format&fit=crop",
        description: "A new discussion is brewing around the ultimate frontier. Join over 42,000 outlaws sharing custom virtual photography, lore breakdowns, and immersive roleplay mods.",
        activePlayers: "68,400 online",
        rating: "4.95",
        communityName: "Outlaws of Van der Linde",
        communityMembers: "42.8k members"
    },
    {
        id: "feat-2",
        title: "CYBERPUNK 2077: PHANTOM LIBERTY",
        slug: "cyberpunk-2077",
        category: "NIGHT CITY CHRONICLES",
        genres: ["Sci-Fi RPG", "Ray Tracing", "Espionage"],
        artworkUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1600&auto=format&fit=crop",
        description: "The definitive spy-thriller expansion. Discover Dogtown's deep district secrets, optimized path-tracing configurations, and high-tier cyberware loadouts curated by the community.",
        activePlayers: "45,200 online",
        rating: "4.90",
        communityName: "Night City Netrunners",
        communityMembers: "58.1k members"
    },
    {
        id: "feat-3",
        title: "BLACK MYTH: WUKONG",
        slug: "black-myth-wukong",
        category: "MYTHIC ACTION",
        genres: ["Action RPG", "UE5", "Mythology"],
        artworkUrl: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=1600&auto=format&fit=crop",
        description: "Destined Ones confront ancient legends in breathtaking Unreal Engine 5 visuals. Explore boss walkthroughs, spell combination guides, and martial lore discussions.",
        activePlayers: "112,000 online",
        rating: "4.92",
        communityName: "The Destined Ones",
        communityMembers: "74.5k members"
    },
    {
        id: "feat-4",
        title: "ELDEN RING: SHADOW OF THE ERDTREE",
        slug: "elden-ring",
        category: "REALM OF SHADOW",
        genres: ["Soulsborne", "Dark Fantasy", "Masterpiece"],
        artworkUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop",
        description: "Step into the Land of Shadow. Share talisman synergies, obscure NPC questlines, and strategies for overcoming the fiercest challenges in gaming history.",
        activePlayers: "94,300 online",
        rating: "4.98",
        communityName: "Tarnished Round Table",
        communityMembers: "91.2k members"
    }
];

export const VIETNAMESE_NEWS_ITEMS: NewsItem[] = [
    {
        id: "vn-1",
        title: "7554: Điện Biên Phủ Remastered",
        developer: "Emobi Games",
        genre: "Bắn Súng Lịch Sử Việt Nam",
        status: "Bản Nâng Cấp HD",
        rating: "4.8",
        date: "Phiên Bản Kỷ Niệm",
        description: "Hào hùng trận chiến lịch sử Điện Biên Phủ lừng lẫy năm châu. Tái hiện tinh thần quả cảm và tái cấu trúc hệ thống ánh sáng hiện đại trên nền tảng đồ họa nâng cấp.",
        imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
        tags: ["Bắn Súng Lịch Sử", "Điện Biên Phủ", "Hào Hùng"],
        isHighlight: true
    },
    {
        id: "vn-2",
        title: "Thần Trùng (The Death)",
        developer: "DUT Studio",
        genre: "Kinh Dị Tâm Linh",
        status: "Mới Cập Nhật 2026",
        rating: "4.9",
        date: "Cập nhật v2.4",
        description: "Trải nghiệm không gian Hà Nội thập niên 90 âm u kỳ bí với những truyền thuyết đô thị Việt Nam gây sốt làng game quốc tế.",
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop",
        tags: ["Kinh Dị Việt", "Hà Nội 1990s", "DUT Studio"],
        linkSlug: "than-trung"
    },
    {
        id: "vn-3",
        title: "Hoa (Ghibli Style Indie)",
        developer: "Skrollcat Studio",
        genre: "Phiêu Lưu Nghệ Thuật",
        status: "Đoạt Giải Quốc Tế",
        rating: "4.95",
        date: "Bản 4K Enhanced",
        description: "Tuyệt phẩm indie Việt Nam với đồ họa vẽ tay thủ công đẹp ảo diệu phong cách Ghibli và âm hưởng piano thư giãn sâu lắng.",
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
        tags: ["Vẽ Tay Ghibli", "Thư Giãn", "Indie Tuyệt Đẹp"],
        linkSlug: "hoa"
    },
    {
        id: "vn-4",
        title: "Thần Điện - Huyền Thoại Việt",
        developer: "Cỏ Mềm Team",
        genre: "Nhập Vai Thần Thoại",
        status: "Sắp Ra Mắt Q4/2026",
        rating: "4.85",
        date: "Sắp Ra Mắt",
        description: "Hành trình tái hiện truyền thuyết Sơn Tinh Thủy Tinh & các vị thần sử Việt bằng công nghệ đồ họa Unreal Engine 5 đột phá.",
        imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop",
        tags: ["Unreal Engine 5", "Sơn Tinh Thủy Tinh", "Sử Việt"]
    }
];

export const ONGOING_EVENTS: EventItem[] = [
    {
        id: "ev-1",
        title: "SUMMER GAME FEST 2026",
        subtitle: "The global showcase for world premieres, exclusive gameplay reveals, and live creator co-streams.",
        date: "Jun 18 — 25, 2026",
        statusText: "LIVE NOW · DROPS ENABLED",
        isLive: true,
        imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
        tags: ["World Premieres", "Exclusive Drops", "Live Broadcast"]
    },
    {
        id: "ev-2",
        title: "CS2 MAJOR CHAMPIONSHIP",
        subtitle: "Quarter-finals starting tonight. The top 8 squads clash for regional supremacy and the prestige trophy.",
        date: "Today, 19:00 GMT+7",
        statusText: "QUARTER-FINALS",
        isLive: false,
        imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
        tags: ["Esports", "Tournament", "$1.25M Pool"]
    },
    {
        id: "ev-3",
        title: "STEAM NEXT FEST",
        subtitle: "Play hundreds of free indie demos, chat directly with developers, and discover your next gaming obsession.",
        date: "Active this week",
        statusText: "FREE DEMOS",
        isLive: false,
        imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=800&auto=format&fit=crop",
        tags: ["800+ Demos", "Dev Q&A", "Indie Festival"]
    }
];

export const TRENDING_TAGS: TrendingTag[] = [
    { id: "t1", name: "#VIETNAMCHAMPIONS", count: "18.4k posts", isHot: true },
    { id: "t2", name: "#SUMMERGAMEFEST", count: "42.1k posts", isHot: true },
    { id: "t3", name: "#CS2MAJOR", count: "65.9k posts", isHot: true },
    { id: "t4", name: "#ELDENRINGDLC", count: "89.3k posts" },
    { id: "t5", name: "#INDIEGEMS", count: "24.7k posts" },
    { id: "t6", name: "#FGC", count: "12.8k posts" },
    { id: "t7", name: "#GTA6TRAILER", count: "120k posts", isHot: true },
    { id: "t8", name: "#SPEEDRUN", count: "9.5k posts" }
];

export const VIRAL_TILES: ViralMediaTile[] = [
    {
        id: "viral-1",
        author: "NeoMatrix",
        authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NeoMatrix",
        title: "I finally beat Malenia after 342 tries. Here's the winning parry sequence.",
        contentType: "DISCUSSION",
        imageUrl: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=800&auto=format&fit=crop",
        likes: "24.5K",
        commentsCount: "842",
        gameTag: "Elden Ring",
        colSpan: "lg:col-span-2 lg:row-span-2",
        aspectRatio: "aspect-[4/3] lg:aspect-auto"
    },
    {
        id: "viral-2",
        author: "CozyGamerGirl",
        authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CozyGamerGirl",
        title: "My Stardew Valley farm — Year 5 complete aesthetic layout 🌻",
        contentType: "SCREENSHOT",
        imageUrl: "https://images.unsplash.com/photo-1593305841991-0537e6916730?q=80&w=800&auto=format&fit=crop",
        likes: "12.3K",
        commentsCount: "198",
        gameTag: "Stardew Valley",
        colSpan: "lg:col-span-1 lg:row-span-1",
        aspectRatio: "aspect-[4/3]"
    },
    {
        id: "viral-3",
        author: "TechReviewer",
        authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TechReviewer",
        title: "RTX 6090 Architectural Leaks — Dual 16-pin connectors & thermal die analysis.",
        contentType: "NEWS",
        imageUrl: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=800&auto=format&fit=crop",
        likes: "8.2K",
        commentsCount: "412",
        gameTag: "Hardware",
        colSpan: "lg:col-span-1 lg:row-span-1",
        aspectRatio: "aspect-[4/3]"
    },
    {
        id: "viral-4",
        author: "IndieDev101",
        authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=IndieDev101",
        title: "Just released our first Vietnamese indie RPG on Steam! Ask me anything.",
        contentType: "DISCUSSION",
        imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
        likes: "45.1K",
        commentsCount: "1.2K",
        gameTag: "Indie Spotlight",
        colSpan: "lg:col-span-2 lg:row-span-1",
        aspectRatio: "aspect-[16/9] lg:aspect-auto"
    },
    {
        id: "viral-5",
        author: "EsportsGod",
        authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=EsportsGod",
        title: "The nastiest 1v4 Desert Eagle flick clutch in CS2 Premier history.",
        contentType: "VIDEO",
        videoDuration: "0:34",
        imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
        likes: "150K",
        commentsCount: "1.4K",
        gameTag: "CS2",
        colSpan: "lg:col-span-1 lg:row-span-2",
        aspectRatio: "aspect-[3/4] lg:aspect-auto"
    },
    {
        id: "viral-6",
        author: "MemeLord",
        authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MemeLord",
        title: "When the boss goes to phase 2 with an orchestral choir but you have zero estus left.",
        contentType: "MEME",
        imageUrl: "https://images.unsplash.com/photo-1563223126-7c9c0b116fb8?q=80&w=800&auto=format&fit=crop",
        likes: "88.4K",
        commentsCount: "630",
        gameTag: "Gaming Humor",
        colSpan: "lg:col-span-2 lg:row-span-1",
        aspectRatio: "aspect-[16/9] lg:aspect-auto"
    }
];
