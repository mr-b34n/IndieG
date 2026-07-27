import { type GameData } from "./types";

import cs2Logo from "../../assets/logos/cs2-logo.webp";
import rdr2Logo from "../../assets/logos/rdr2-logo.png";
import raftLogo from "../../assets/logos/raft-logo.png";

import cs2Bg from "../../assets/bgs/cs2_bg.jpg";
import raftBg from "../../assets/bgs/raft_bg.jpg";
import rdr2Bg from "../../assets/bgs/rdr_2_bg.jpg";
import gameIlluBg from "../../assets/bgs/game-illu-bg.webp";

export const INITIAL_GAMES: GameData[] = [
    {
        slug: "counter-strike-2",
        id: "cs2",
        aliases: ["cs2", "counter_strike_2", "counter-strike", "csgo"],
        name: "Counter Strike 2",
        tag: "Counter Strike 2",
        communityId: "cs2",
        developer: "Valve",
        publisher: "Valve",
        releaseDate: "Sep 27, 2023",
        platforms: ["PC", "Steam"],
        genre: ["Tactical FPS", "Esports", "Competitive", "Multiplayer"],
        ratingScore: 4.8,
        totalReviewsCount: 148200,
        sentiment: "Overwhelmingly Positive",
        sentimentVi: "Cực kỳ tích cực",
        activePlayers: 842150,
        logoUrl: cs2Logo,
        bannerUrl: cs2Bg,
        description: "For over two decades, Counter-Strike has offered an elite competitive experience, shaped by millions of players across the globe. And now the next chapter in the CS story begins. This is Counter-Strike 2. A free upgrade to CS:GO, Counter-Strike 2 is the largest technical leap in Counter-Strike’s history.",
        descriptionVi: "Trải qua hơn hai thập kỷ, Counter-Strike luôn mang đến trải nghiệm thi đấu đỉnh cao được định hình bởi hàng triệu game thủ toàn cầu. Counter-Strike 2 là bước nhảy vọt kỹ thuật lớn nhất trong lịch sử CS với hệ thống khói động Sub-tick, đồ họa Source 2 và âm thanh chân thực tối đa.",
        features: [
            "All-new Sub-Tick networking architecture for instant shot registration",
            "Dynamic Smoke Grenades that interact with lighting, gunfire, and explosions",
            "Overhauled Source 2 maps with realistic physics and rendering",
            "Redesigned UI and inventory item visual upgrades"
        ],
        featuresVi: [
            "Hệ thống Sub-Tick mới giúp ghi nhận phát bắn chính xác đến từng mili giây",
            "Lựu đạn khói động tương tác trực tiếp với ánh sáng, đầu đạn và vụ nổ",
            "Các bản đồ huyền thoại được làm lại toàn diện trên nền tảng Source 2",
            "Giao diện người dùng và kho đồ skin vũ khí được nâng cấp đồ họa tuyệt đẹp"
        ],
        screenshots: [
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1000&q=80"
        ],
        systemReqs: {
            minimum: {
                os: "Windows 10 (64-bit)",
                cpu: "4 hardware CPU threads - Intel Core i5 750 or higher",
                gpu: "NVIDIA GTX 1060 / AMD RX 580 with 4GB VRAM",
                ram: "8 GB RAM",
                storage: "85 GB available space"
            },
            recommended: {
                os: "Windows 11 (64-bit)",
                cpu: "Intel Core i7-9700 / AMD Ryzen 7 3700X",
                gpu: "NVIDIA RTX 3060 Ti / AMD Radeon RX 6700 XT",
                ram: "16 GB RAM",
                storage: "85 GB SSD space"
            }
        },
        guides: [
            {
                id: "guide-cs2-1",
                title: "10 Essential Mirage Smoke Lineups for 64/128 Sub-Tick",
                titleVi: "10 góc ném Smoke Mirage chuẩn xác nhất cho hệ thống Sub-Tick mới",
                author: "TacticalXeno",
                authorAvatar: cs2Logo,
                rank: "Global Elite / Rank S",
                category: "tactics",
                content: "To conquer Mirage in CS2, mastering A-Stairs, Jungle, and CT smokes is mandatory. Stand at the corner of T-spawn scaffolding, aim at the middle of the third wooden beam, and jump-throw for a perfect CT smoke...",
                contentVi: "Để làm chủ Mirage trong CS2, việc thuộc lòng các góc smoke A-Stairs, Jungle và CT là bắt buộc. Đứng tại góc giàn giáo T-spawn, kê tâm vào giữa thanh gỗ thứ ba và jump-throw để smoke rơi chuẩn vào CT...",
                likes: 342,
                views: 4520,
                date: "2 ngày trước"
            },
            {
                id: "guide-cs2-2",
                title: "Best Video & Audio Settings for Maximum FPS and Clarity",
                titleVi: "Tối ưu hóa cài đặt hình ảnh và âm thanh để đạt FPS cao và nhìn rõ địch",
                author: "ProGamer99",
                authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ProGamer99",
                rank: "Faceit Lvl 10",
                category: "general",
                content: "Disable NVIDIA Reflex latency boost if experiencing micro-stutters. Set Global Shadow Quality to High to spot enemy shadows around corners before they swing...",
                contentVi: "Tắt Reflex latency boost nếu máy bị giật lag nhẹ. Đặt Global Shadow Quality ở mức High để nhìn thấy bóng địch phản chiếu qua các góc tường trước khi họ lao ra...",
                likes: 189,
                views: 2910,
                date: "5 ngày trước"
            }
        ],
        reviews: [
            {
                id: "rev-cs2-1",
                author: "GamerX99",
                authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GamerX99",
                rating: 5,
                hoursPlayed: "1,420h",
                content: "Sub-tick feels amazing once you get used to it. The new smoke physics completely changed the tactical depth of competitive matches!",
                contentVi: "Hệ thống Sub-tick bắn cực kỳ đã tay khi đã quen. Lựu đạn khói mới thực sự làm thay đổi hoàn toàn chiều sâu chiến thuật trong các trận đấu rank!",
                date: "1 ngày trước",
                recommended: true,
                likes: 45
            },
            {
                id: "rev-cs2-2",
                author: "Alex_Dev",
                authorAvatar: rdr2Logo,
                rating: 4,
                hoursPlayed: "620h",
                content: "Graphics are breathtaking and skins pop under the new Source 2 lighting. Still waiting for Valve to add back some classic community game modes like Danger Zone.",
                contentVi: "Đồ họa đẹp choáng ngợp và skin vũ khí sáng rực dưới ánh sáng Source 2. Vẫn đang chờ Valve bổ sung lại một số chế độ chơi cộng đồng kinh điển như Danger Zone.",
                date: "4 ngày trước",
                recommended: true,
                likes: 28
            }
        ]
    },
    {
        slug: "red-dead-redemption-2",
        id: "rdr2",
        aliases: ["rdr2", "red_dead_redemption_2", "red-dead-2", "rdr"],
        name: "Red Dead Redemption 2",
        tag: "Red Dead Redemption 2",
        communityId: "rdr2",
        developer: "Rockstar Games",
        publisher: "Rockstar Games",
        releaseDate: "Oct 26, 2018",
        platforms: ["PC", "PS4", "PS5", "Xbox Series X"],
        genre: ["Open World", "Action Adventure", "Story Rich", "Western"],
        ratingScore: 4.9,
        totalReviewsCount: 385400,
        sentiment: "Overwhelmingly Positive",
        sentimentVi: "Cực kỳ tích cực",
        activePlayers: 48900,
        logoUrl: rdr2Logo,
        bannerUrl: rdr2Bg,
        description: "Winner of over 175 Game of the Year Awards and recipient of over 250 perfect scores, Red Dead Redemption 2 is an epic tale of honor and loyalty at the dawn of the modern age. America, 1899. Arthur Morgan and the Van der Linde gang are outlaws on the run.",
        descriptionVi: "Giành hơn 175 giải thưởng Game of the Year và 250 điểm tuyệt đối từ các chuyên trang đánh giá, Red Dead Redemption 2 là sử thi hùng tráng về danh dự và lòng trung thành tại nước Mỹ năm 1899. Arthur Morgan và băng đảng Van der Linde buộc phải chạy trốn băng qua triền núi hoang dã.",
        features: [
            "A living, breathing open world with over 200 species of animals and complex AI behaviors",
            "Deep character bonding with your horse, weapons cleaning, and campsite management",
            "Red Dead Online shared world multiplayer experience included",
            "Breathtaking dynamic weather and cinematic storytelling"
        ],
        featuresVi: [
            "Thế giới mở sống động như thật với hơn 200 loài động vật cùng tập tính AI phức tạp",
            "Hệ thống tương tác sâu sắc: gắn kết với chiến mã, lau chùi vũ khí và sinh hoạt tại trại",
            "Bao gồm trọn bộ chế độ chơi mạng thế giới mở Red Dead Online",
            "Hệ thống thời tiết thay đổi linh hoạt và cốt truyện điện ảnh lấy nước mắt người chơi"
        ],
        screenshots: [
            "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80"
        ],
        systemReqs: {
            minimum: {
                os: "Windows 10 - April 2018 Update (v1803)",
                cpu: "Intel Core i5-2500K / AMD FX-6300",
                gpu: "NVIDIA GeForce GTX 770 2GB / AMD Radeon R9 280 3GB",
                ram: "8 GB RAM",
                storage: "150 GB available space"
            },
            recommended: {
                os: "Windows 10 - April 2018 Update (v1803)",
                cpu: "Intel Core i7-4770K / AMD Ryzen 5 1500X",
                gpu: "NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 480 4GB",
                ram: "12 GB RAM",
                storage: "150 GB available space"
            }
        },
        guides: [
            {
                id: "guide-rdr2-1",
                title: "How to Find All Legendary Animals and Get Perfect Pelts",
                titleVi: "Bản đồ vị trí tất cả Thú Huyền Thoại và cách săn bộ da hoàn hảo (Perfect Pelt)",
                author: "GhostRider",
                authorAvatar: rdr2Logo,
                rank: "Master Hunter",
                category: "secrets",
                content: "Always use the Varmint Rifle or Bow with Small Game Arrows for birds and snakes. For Legendary beasts, weapon damage doesn't ruin the pelt quality, so bring your heaviest sniper rifle or shotguns...",
                contentVi: "Luôn dùng súng Varmint hoặc Cung tên nhỏ cho chim và rắn. Riêng với Thú Huyền Thoại, sát thương vũ khí không làm hỏng chất lượng da, vì vậy hãy mang theo khẩu súng tỉa hoặc shotgun mạnh nhất...",
                likes: 512,
                views: 8900,
                date: "1 tuần trước"
            }
        ],
        reviews: [
            {
                id: "rev-rdr2-1",
                author: "SunWukong",
                authorAvatar: raftLogo,
                rating: 5,
                hoursPlayed: "310h",
                content: "The greatest video game ever made. Arthur Morgan's character arc will stay with me for the rest of my life. Truly a masterpiece.",
                contentVi: "Tựa game vĩ đại nhất từng được tạo ra. Hành trình cảm xúc và sự thay đổi của Arthur Morgan sẽ khiến bạn nhớ mãi không quên. Một kiệt tác đích thực.",
                date: "3 ngày trước",
                recommended: true,
                likes: 120
            }
        ]
    },
    {
        slug: "raft",
        id: "raft",
        aliases: ["raft", "raft-game"],
        name: "Raft",
        tag: "Raft",
        communityId: "raft",
        developer: "Redbeet Interactive",
        publisher: "Axolot Games",
        releaseDate: "Jun 20, 2022",
        platforms: ["PC", "Steam"],
        genre: ["Survival", "Co-op", "Open World", "Crafting"],
        ratingScore: 4.7,
        totalReviewsCount: 112000,
        sentiment: "Very Positive",
        sentimentVi: "Rất tích cực",
        activePlayers: 14200,
        logoUrl: raftLogo,
        bannerUrl: raftBg,
        description: "By yourself or with friends, your mission is to survive an epic oceanic adventure across a perilous sea! Gather debris to survive, expand your raft and be wary of the dangers of the ocean! Trapped on a simple plastic raft, navigate vast waters and uncover the story of a flooded world.",
        descriptionVi: "Độc hành hoặc cùng hội bạn thân, nhiệm vụ của bạn là sinh tồn trong chuyến phiêu lưu kỳ thú trên đại dương nguy hiểm! Vớt rác trôi dạt để xây dựng cơi nới bè, chế tạo vũ khí và coi chừng những con cá mập trắng luôn rình rập dưới làn nước.",
        features: [
            "Multiplayer Co-op: Survive together in online squads of up to 8 players",
            "Crafting & Building: Transform your basic wooden raft into a multi-story floating fortress",
            "Research Table: Learn new crafting blueprints, automated engines, and navigation tools",
            "Island Exploration: Dock at mysterious story islands to uncover the lore of Utopia"
        ],
        featuresVi: [
            "Chế độ chơi mạng Co-op: Sinh tồn cùng hội bạn thân trong phòng lên đến 8 người chơi",
            "Chế tạo & Xây dựng: Biến chiếc bè gỗ đơn sơ thành pháo đài nổi nhiều tầng tiện nghi",
            "Bàn nghiên cứu: Mở khóa các công thức chế tạo động cơ tự động và hệ thống định vị",
            "Khám phá hòn đảo bí ẩn: Cập bến các hòn đảo cốt truyện để tìm ra bí mật về Utopia"
        ],
        screenshots: [
            "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80"
        ],
        systemReqs: {
            minimum: {
                os: "Windows 7 or later (64-bit)",
                cpu: "2.6 GHz Dual Core or similar",
                gpu: "GeForce GTX 500 series or similar",
                ram: "6 GB RAM",
                storage: "10 GB available space"
            },
            recommended: {
                os: "Windows 10 (64-bit)",
                cpu: "Intel Core i5 2.6GHz or AMD equivalent",
                gpu: "GeForce GTX 1050 series or AMD equivalent",
                ram: "8 GB RAM",
                storage: "10 GB available space"
            }
        },
        guides: [
            {
                id: "guide-raft-1",
                title: "Ultimate Shark Defense: How to Arm Your Raft Foundation",
                titleVi: "Bí kíp chống cá mập cắn bè 100%: Cách gia cố móng bằng kim loại tiết kiệm nhất",
                author: "NightOwl",
                authorAvatar: raftLogo,
                rank: "Sea Captain",
                category: "builds",
                content: "You don't need to armor every single tile inside your raft! Sharks only attack the outermost perimeter foundation tiles. Armor the outer ring first with metal ingots and nails to stop all shark attacks permanently...",
                contentVi: "Bạn không cần phải bọc giáp cho từng ô bè bên trong! Cá mập chỉ tấn công các ô móng ở viền ngoài cùng. Hãy ưu tiên bọc thép cho vòng ngoài bằng phôi sắt và đinh để chấm dứt vĩnh viễn cảnh cá mập cắn phá bè...",
                likes: 278,
                views: 5120,
                date: "3 ngày trước"
            }
        ],
        reviews: [
            {
                id: "rev-raft-1",
                author: "NeoCyber",
                authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NeoCyber",
                rating: 5,
                hoursPlayed: "145h",
                content: "The most relaxing yet chaotic co-op survival game to play with friends. Building a massive floating city while arguing about who forgot to feed the llama is priceless!",
                contentVi: "Tựa game sinh tồn co-op vừa thư giãn vừa hỗn loạn nhất để chơi cùng bạn bè. Cảnh xây dựng cả thành phố nổi trên biển trong khi cãi nhau xem ai quên cho lạc đà ăn thực sự vô giá!",
                date: "2 ngày trước",
                recommended: true,
                likes: 89
            }
        ]
    },
    {
        slug: "cyberpunk-2077",
        id: "cyberpunk",
        aliases: ["cyberpunk-2077", "cyberpunk", "cp2077"],
        name: "Cyberpunk 2077",
        tag: "Cyberpunk 2077",
        communityId: "cyberpunk",
        developer: "CD PROJEKT RED",
        publisher: "CD PROJEKT RED",
        releaseDate: "Dec 10, 2020",
        platforms: ["PC", "PS5", "Xbox Series X"],
        genre: ["Open World", "RPG", "Sci-Fi", "Action"],
        ratingScore: 4.6,
        totalReviewsCount: 654000,
        sentiment: "Very Positive",
        sentimentVi: "Rất tích cực",
        activePlayers: 42100,
        logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Cyberpunk&backgroundColor=ff0055",
        bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80",
        description: "Cyberpunk 2077 is an open-world, action-adventure RPG set in the dark future of Night City — a megalopolis obsessed with power, glamour, and ceaseless body modification. Step into the shoes of V, a cyberpunk mercenary taking on the most dangerous contracts.",
        descriptionVi: "Cyberpunk 2077 là tựa game hành động nhập vai thế giới mở lấy bối cảnh tương lai đen tối tại Night City — siêu đô thị cuồng loạn vì quyền lực, sự xa hoa và cường hóa cơ thể. Hóa thân thành V, lính đánh thuê cyberpunk nhận những hợp đồng sinh tử.",
        features: [
            "Overhauled Update 2.0 with revamped skill trees, cyberware system, and vehicle combat",
            "Phantom Liberty spy-thriller expansion featuring Idris Elba as Solomon Reed",
            "State-of-the-art Ray Tracing Overdrive and Path Tracing visual fidelity",
            "Immersive non-linear storytelling where your choices shape the fate of Night City"
        ],
        featuresVi: [
            "Bản cập nhật 2.0 làm lại toàn diện cây kỹ năng, hệ thống cấy ghép Cyberware và chiến đấu trên xe",
            "Bản mở rộng trinh thám Phantom Liberty với sự góp mặt của diễn viên Idris Elba",
            "Đỉnh cao đồ họa Ray Tracing Overdrive và Path Tracing chân thực đến từng ngọn đèn neon",
            "Cốt truyện phi tuyến tính sâu sắc nơi quyết định của bạn quyết định vận mệnh Night City"
        ],
        screenshots: [
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80"
        ],
        systemReqs: {
            minimum: {
                os: "Windows 10 (64-bit)",
                cpu: "Core i7-6700 or Ryzen 5 1600",
                gpu: "GeForce GTX 1060 6GB / Radeon RX 580 8GB",
                ram: "12 GB RAM",
                storage: "70 GB SSD space"
            },
            recommended: {
                os: "Windows 10 (64-bit)",
                cpu: "Core i7-12700 or Ryzen 7 7800X3D",
                gpu: "GeForce RTX 3080 / Radeon RX 6800 XT",
                ram: "16 GB RAM",
                storage: "70 GB NVMe SSD space"
            }
        },
        guides: [],
        reviews: []
    },
    {
        slug: "valorant",
        id: "valorant",
        aliases: ["valorant", "val"],
        name: "Valorant",
        tag: "Valorant",
        communityId: "valorant",
        developer: "Riot Games",
        publisher: "Riot Games",
        releaseDate: "Jun 2, 2020",
        platforms: ["PC"],
        genre: ["Tactical FPS", "Hero Shooter", "Esports", "Competitive"],
        ratingScore: 4.6,
        totalReviewsCount: 240000,
        sentiment: "Very Positive",
        sentimentVi: "Rất tích cực",
        activePlayers: 650000,
        logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Valorant&backgroundColor=ff4655",
        bannerUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1000&q=80",
        description: "Blend your style and experience on a global, competitive stage. You have 13 rounds to attack and defend your side using sharp gunplay and tactical abilities. And, with one life per-round, you'll need to think faster than your opponent if you want to survive.",
        descriptionVi: "Kết hợp lối chơi đấu súng chiến thuật chuẩn xác và các kỹ năng đặc trưng của từng Agent trên đấu trường cạnh tranh toàn cầu. Bạn có 13 vòng đấu để tấn công hoặc phòng thủ, cần tốc độ phản xạ và tư duy chiến thuật nhạy bén để giành chiến thắng.",
        features: [
            "Precise gunplay combined with unique Agent supernatural abilities",
            "Regular seasonal content updates, new maps, and Agents",
            "Vanguard industry-leading kernel-level anti-cheat system",
            "Thriving global esports ecosystem and regional ranking tiers"
        ],
        featuresVi: [
            "Đấu súng chiến thuật độ chính xác cao kết hợp bộ kỹ năng đặc sắc của các Agent",
            "Cập nhật nội dung liên tục theo mùa với bản đồ và Agent mới",
            "Hệ thống chống gian lận Vanguard cấp độ nhân (kernel) hàng đầu thế giới",
            "Hệ sinh thái thể thao điện tử VCT sôi động toàn cầu"
        ],
        screenshots: [
            "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80"
        ],
        systemReqs: {
            minimum: {
                os: "Windows 10 (64-bit)",
                cpu: "Intel Core 2 Duo E8400 / AMD Athlon 200GE",
                gpu: "Intel HD 4000 / Radeon R5 200",
                ram: "4 GB RAM",
                storage: "30 GB available space"
            },
            recommended: {
                os: "Windows 10/11 (64-bit)",
                cpu: "Intel i5-9400F 2.90GHz / AMD Ryzen 5 2600X",
                gpu: "GTX 1050 Ti / Radeon R7 370",
                ram: "8 GB RAM",
                storage: "30 GB SSD space"
            }
        },
        guides: [],
        reviews: []
    },
    {
        slug: "elden-ring",
        id: "eldenring",
        aliases: ["elden-ring", "eldenring"],
        name: "Elden Ring",
        tag: "Elden Ring",
        communityId: "eldenring",
        developer: "FromSoftware Inc.",
        publisher: "Bandai Namco Entertainment",
        releaseDate: "Feb 25, 2022",
        platforms: ["PC", "PS5", "Xbox Series X"],
        genre: ["Soulslike", "Action RPG", "Dark Fantasy", "Open World"],
        ratingScore: 4.9,
        totalReviewsCount: 620000,
        sentiment: "Overwhelmingly Positive",
        sentimentVi: "Cực kỳ tích cực",
        activePlayers: 54300,
        logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=EldenRing&backgroundColor=d4af37",
        bannerUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80",
        description: "THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between. Directed by Hidetaka Miyazaki and created in collaboration with George R. R. Martin.",
        descriptionVi: "SIÊU PHẨM HÀNH ĐỘNG NHẬP VAI FANTASY. Hãy trỗi dậy, hỡi Tarnished, và theo sự dẫn lối của ân sủng để đoạt lấy quyền năng Elden Ring, trở thành Elden Lord tại Lands Between. Tác phẩm do Hidetaka Miyazaki đạo diễn cùng đồng sáng tạo với nhà văn George R. R. Martin.",
        features: [
            "A vast seamless open world filled with breathtaking landscapes and complex dungeons",
            "Freedom to create your own playstyle from hundreds of weapons, spells, and Ashes of War",
            "Epic scale boss encounters requiring precision dodging and strategic mastery",
            "Shadow of the Erdtree expansion adding an entirely new dark realm to explore"
        ],
        featuresVi: [
            "Thế giới mở rộng lớn vô tận kết nối mượt mà với các hầm ngục và lâu đài hùng vĩ",
            "Tự do sáng tạo lối chơi với hàng trăm vũ khí, ma thuật và kỹ năng Ashes of War",
            "Những trận chiến boss quy mô sử thi đòi hỏi kỹ năng phản xạ và chiến thuật đỉnh cao",
            "Bản mở rộng Shadow of the Erdtree mang đến vùng đất bóng tối hoàn toàn mới"
        ],
        screenshots: [
            "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80"
        ],
        guides: [],
        reviews: []
    },
    {
        slug: "black-myth-wukong",
        id: "wukong",
        aliases: ["black-myth-wukong", "wukong", "black-myth", "bmw"],
        name: "Black Myth: Wukong",
        tag: "Black Myth: Wukong",
        communityId: "wukong",
        developer: "Game Science",
        publisher: "Game Science",
        releaseDate: "Aug 20, 2024",
        platforms: ["PC", "PS5"],
        genre: ["Action RPG", "Mythology", "Boss Rush", "Adventure"],
        ratingScore: 4.9,
        totalReviewsCount: 710000,
        sentiment: "Overwhelmingly Positive",
        sentimentVi: "Cực kỳ tích cực",
        activePlayers: 125000,
        logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Wukong&backgroundColor=ff8800",
        bannerUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
        description: "Black Myth: Wukong is an action RPG rooted in Chinese mythology. The story is based on Journey to the West, one of the Four Great Classical Novels of Chinese literature. You shall set out as the Destined One to venture into the challenges and marvels ahead.",
        descriptionVi: "Black Myth: Wukong là tựa game hành động nhập vai đỉnh cao đậm chất thần thoại phương Đông, lấy cảm hứng từ kiệt tác Tây Du Ký. Bạn sẽ hóa thân thành Người Được Chọn (The Destined One) dấn thân vào hành trình đối đầu các yêu vương hùng mạnh.",
        features: [
            "Stunning Unreal Engine 5 visual graphics with cinematic boss designs",
            "Master staff combat techniques and transform into various mythological creatures",
            "Explore rich chapters filled with hidden secrets, side bosses, and lore reveals",
            "Deep spellcasting and relic customization for tailored combat builds"
        ],
        featuresVi: [
            "Đồ họa Unreal Engine 5 tuyệt đỉnh với tạo hình boss và cảnh sắc hùng vĩ",
            "Làm chủ nghệ thuật múa gậy Như Ý và biến hóa thành các linh thú, yêu quái thần thoại",
            "Khám phá các chương cốt truyện phong phú với hàng loạt boss ẩn và bí mật sâu sắc",
            "Hệ thống phép thuật và pháp bảo đa dạng giúp tùy biến lối đánh chiến thuật"
        ],
        screenshots: [
            "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80"
        ],
        guides: [],
        reviews: []
    },
    {
        slug: "grand-theft-auto-v",
        id: "gtav",
        aliases: ["grand-theft-auto-v", "gtav", "gta-v", "gta-5", "gta-online"],
        name: "Grand Theft Auto V & Online",
        tag: "Grand Theft Auto V & Online",
        communityId: "gtav",
        developer: "Rockstar North",
        publisher: "Rockstar Games",
        releaseDate: "Apr 14, 2015",
        platforms: ["PC", "PS5", "Xbox Series X"],
        genre: ["Open World", "Action", "Multiplayer", "Sandbox"],
        ratingScore: 4.7,
        totalReviewsCount: 1520000,
        sentiment: "Very Positive",
        sentimentVi: "Rất tích cực",
        activePlayers: 135000,
        logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=GTAV&backgroundColor=22aa22",
        bannerUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
        description: "When a young street hustler, a retired bank robber and a terrifying psychopath find themselves entangled with some of the most frightening and deranged elements of the criminal underworld, the U.S. government and the entertainment industry, they must pull off a series of dangerous heists.",
        descriptionVi: "Khi một gã giang hồ đường phố, một tên cướp ngân hàng giải nghệ và một kẻ tâm thần quái đản bị cuốn vào những thế lực ngầm nguy hiểm nhất của thế giới tội phạm và chính phủ, họ buộc phải thực hiện những vụ cướp thế kỷ tại Los Santos.",
        features: [
            "Play across three distinct protagonists with unique special abilities in Story Mode",
            "GTA Online dynamic multiplayer universe supporting up to 30 players and FiveM roleplay servers",
            "Run criminal empires, heists, nightclub businesses, and underground street racing",
            "Hundreds of customizable vehicles, aircraft, weapons, and real estate properties"
        ],
        featuresVi: [
            "Trải nghiệm cốt truyện qua ba nhân vật chính độc đáo với kỹ năng đặc biệt riêng",
            "Thế giới mạng GTA Online và máy chủ nhập vai FiveM sôi động với hàng vạn game thủ",
            "Điều hành đế chế tội phạm, thực hiện các vụ Heist thế kỷ và đua xe ngầm dưới phố",
            "Hàng trăm dòng siêu xe, máy bay, vũ khí và biệt thự sang trọng để sở hữu"
        ],
        screenshots: [
            "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80"
        ],
        guides: [],
        reviews: []
    },
    {
        slug: "minecraft",
        id: "minecraft",
        aliases: ["minecraft", "mc", "minecraft-builders"],
        name: "Minecraft Builders & Redstone",
        tag: "Minecraft Builders & Redstone",
        communityId: "minecraft",
        developer: "Mojang Studios",
        publisher: "Xbox Game Studios",
        releaseDate: "Nov 18, 2011",
        platforms: ["PC", "PS5", "Xbox", "Mobile", "Switch"],
        genre: ["Sandbox", "Survival", "Crafting", "Open World"],
        ratingScore: 4.9,
        totalReviewsCount: 980000,
        sentiment: "Overwhelmingly Positive",
        sentimentVi: "Cực kỳ tích cực",
        activePlayers: 450000,
        logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Minecraft&backgroundColor=338833",
        bannerUrl: "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=1000&q=80",
        description: "Explore randomly generated worlds and build amazing things from the simplest of homes to the grandest of castles. Play in creative mode with unlimited resources or mine deep into the world in survival mode, crafting weapons and armor to fend off the dangerous mobs.",
        descriptionVi: "Khám phá thế giới khối vuông vô tận và xây dựng những công trình kỳ vĩ từ ngôi nhà gỗ ấm cúng đến lâu đài vĩ đại. Thỏa sức sáng tạo không giới hạn tài nguyên hoặc dấn thân sinh tồn, chế tạo vũ khí chống lại quái vật bóng đêm.",
        features: [
            "Infinite procedurally generated voxel worlds with biomes, caves, and dimensions",
            "Complex Redstone engineering for automated farms, computers, and contraptions",
            "Thriving modding community, custom shaders, texture packs, and multiplayer servers",
            "Cross-platform play connecting friends across PC, console, and mobile devices"
        ],
        featuresVi: [
            "Thế giới khối vuông sinh ngẫu nhiên vô tận với các hệ sinh thái và hang động đa dạng",
            "Kỹ thuật Redstone chuyên sâu cho phép xây dựng máy móc tự động và máy tính trong game",
            "Cộng đồng modding khổng lồ, shader đồ họa lung linh và hàng ngàn server minigame",
            "Chơi chéo nền tảng mượt mà giữa PC, máy chơi game Console và điện thoại di động"
        ],
        screenshots: [
            "https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1000&q=80"
        ],
        guides: [],
        reviews: []
    }
];

export const getGameBySlug = (slug: string): GameData => {
    if (!slug) return INITIAL_GAMES[0];
    const cleanSlug = slug.trim().toLowerCase();
    const found = INITIAL_GAMES.find(g => 
        g.slug === cleanSlug || 
        g.id === cleanSlug || 
        g.aliases?.includes(cleanSlug) ||
        g.tag.toLowerCase() === cleanSlug.replace(/-/g, " ")
    );
    if (found) return found;

    // Fallback generation for unknown game slugs so the page never 404s
    const titleName = cleanSlug
        .split("-")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    return {
        slug: cleanSlug,
        id: cleanSlug,
        name: titleName,
        tag: titleName,
        developer: "Indie / Community Studio",
        publisher: "Global Games",
        releaseDate: "2024",
        platforms: ["PC", "PS5", "Xbox Series X"],
        genre: ["Action", "Multiplayer", "Adventure"],
        ratingScore: 4.5,
        totalReviewsCount: 1250,
        sentiment: "Very Positive",
        sentimentVi: "Rất tích cực",
        activePlayers: 4520,
        logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanSlug}&backgroundColor=3b82f6`,
        bannerUrl: gameIlluBg,
        description: `Explore the vibrant universe of ${titleName}. Connect with thousands of active players, share tactical lineups, discover Easter eggs, and party up for competitive matches.`,
        descriptionVi: `Khám phá vũ trụ và thế giới sống động trong ${titleName}. Kết nối cùng hàng ngàn game thủ đang online, chia sẻ mẹo chơi, chiến thuật và tìm đồng đội leo rank mỗi ngày.`,
        features: [
            "Online Multiplayer & Co-op squads",
            "Competitive Ranked matchmakings",
            "Rich lore and secret collectibles"
        ],
        featuresVi: [
            "Chế độ chơi mạng Multiplayer & Co-op cùng đồng đội",
            "Hệ thống leo rank cạnh tranh khốc liệt",
            "Cốt truyện chuyên sâu và nhiều bí mật ẩn giấu"
        ],
        screenshots: [
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80"
        ],
        systemReqs: {
            minimum: {
                os: "Windows 10 64-bit",
                cpu: "Intel Core i5 / AMD Ryzen 5",
                gpu: "NVIDIA GTX 1060 / AMD RX 580",
                ram: "8 GB RAM",
                storage: "50 GB available space"
            },
            recommended: {
                os: "Windows 11 64-bit",
                cpu: "Intel Core i7 / AMD Ryzen 7",
                gpu: "NVIDIA RTX 3060 / AMD RX 6700 XT",
                ram: "16 GB RAM",
                storage: "50 GB SSD space"
            }
        },
        guides: [],
        reviews: []
    };
};
