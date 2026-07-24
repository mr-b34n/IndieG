

import avatarGame from "../../assets/logos/raft-logo.png";
import raftImg from "../../assets/logos/raft-logo.png";
import butterflyEmeraldImg from "../../assets/mock-data/butterfly-emarald.webp";
import dust2Img from "../../assets/mock-data/dust2_back_plat_s2.jpg";
import figuresImg from "../../assets/mock-data/figures.jpeg";
import type { PostData } from "./components/Post";

export const ALL_POSTS: PostData[] = [
    {
        id: 1,
        author: "User123",
        authorAvatar: avatarGame,
        authorRank: "pro",
        gameTag: "Raft",
        timeAgo: "2 giờ trước",
        title: "Setup base ngoài khơi cực chill sau 40 ngày sinh tồn",
        content:
            "Cuối cùng cũng build xong base 3 tầng, có cả khu trồng trọt và bẫy cá tự động. " +
            "Ai đang chơi Raft chia sẻ layout của mọi người xem nào!",
        images: [raftImg, dust2Img],
        tags: ["Raft", "Basebuilding", "Survival"],
        likes: 24,
        comments: 8,
        tab: "foryou",
    },
    {
        id: 2,
        author: "GhostRider",
        authorAvatar: avatarGame,
        authorRank: "rookie",
        gameTag: "RDR 2",
        timeAgo: "5 giờ trước",
        title: "Bản mod đồ hoạ 4K mới ra, chạy siêu mượt",
        content:
            "Vừa test bản mod textures mới cho RDR2, cải thiện chất lượng ánh sáng ban đêm " +
            "đáng kể mà FPS không giảm nhiều. Để link ở comment.",
        tags: ["RDR2", "Mods", "Graphics"],
        likes: 56,
        comments: 19,
        tab: "following",
    },
    {
        id: 3,
        author: "TacticalGamer",
        authorAvatar: avatarGame,
        authorRank: "master",
        gameTag: "CS 2",
        timeAgo: "1 ngày trước",
        title: "Tips aim training cho người mới lên Premier",
        content:
            "Chia sẻ routine warm-up 15 phút mỗi ngày giúp mình cải thiện aim rõ rệt sau 2 tuần. " +
            "Không cần app ngoài, chỉ cần deathmatch đúng cách.",
        images: [figuresImg, butterflyEmeraldImg, dust2Img],
        tags: ["CS2", "Tips", "Aim"],
        likes: 132,
        comments: 41,
        tab: "foryou",
    },
    {
        id: 4,
        author: "NightOwl",
        authorAvatar: avatarGame,
        authorRank: "pro",
        gameTag: "Raft",
        timeAgo: "30 phút trước",
        title: "Base raft của squad mình sau 2 tuần chơi cùng nhau",
        content:
            "Cả squad 4 người cùng grind mỗi tối, giờ có base khổng lồ với đầy đủ tiện nghi. " +
            "Recommend mode coop cho mọi người!",
        images: [raftImg, raftImg, raftImg, raftImg, raftImg],
        tags: ["Raft", "Coop", "Squad"],
        likes: 89,
        comments: 27,
        tab: "following",
    },
    {
        id: 5,
        author: "ProSniper",
        authorAvatar: avatarGame,
        authorRank: "legend",
        gameTag: "CS 2",
        timeAgo: "3 giờ trước",
        title: "AWP no-scope highlight reel — 20 kills in one match",
        content:
            "Vừa có một trận siêu đỉnh với AWP, chia sẻ clip highlight cho mọi người xem. " +
            "Tất cả đều là no-scope, không có cheat!",
        images: [butterflyEmeraldImg],
        tags: ["CS2", "Highlight", "AWP"],
        likes: 340,
        comments: 88,
        tab: "hot",
    },
    {
        id: 6,
        author: "MapMaker",
        authorAvatar: avatarGame,
        authorRank: "master",
        gameTag: "CS 2",
        timeAgo: "12 giờ trước",
        title: "Custom map mới: Ancient 2.0 — cải tiến toàn bộ layout",
        content:
            "Mất 3 tháng để build map này, thêm nhiều angle mới, rotate ngắn hơn và " +
            "smoke lineups cực đẹp. Workshop link trong comment.",
        images: [dust2Img],
        tags: ["CS2", "Custom", "Workshop"],
        likes: 512,
        comments: 143,
        tab: "hot",
    },
];
