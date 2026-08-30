import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faShieldHalved,
    faCircleInfo,
    faFileLines,
    faLink,
    faGlobe,
    faGamepad,
    faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";

interface CommunityHubAboutViewProps {
    viewType: "rules" | "about" | "wiki" | "links";
    communityName: string;
    description: string;
    isVi: boolean;
}

export const CommunityHubAboutView = ({
    viewType,
    communityName,
    description,
    isVi,
}: CommunityHubAboutViewProps) => {


    const rules = [
        {
            num: "01",
            titleVi: "Tôn trọng và lịch sự",
            titleEn: "Respect & Civility",
            descVi: "Không xúc phạm, quấy rối, phân biệt đối xử hoặc sử dụng ngôn từ kích động thù địch đối với bất kỳ thành viên nào.",
            descEn: "Treat everyone with respect. No harassment, hate speech, trolling, or toxic behavior.",
        },
        {
            num: "02",
            titleVi: "Đăng bài đúng chủ đề & danh mục",
            titleEn: "Post in Relevant Categories",
            descVi: "Hãy chọn đúng loại bài (Hỏi đáp, Hướng dẫn, Showcase...) và tránh spam nhiều bài liên tiếp có nội dung tương tự.",
            descEn: "Use appropriate tags and post types. Avoid repetitive spam and low-effort posts.",
        },
        {
            num: "03",
            titleVi: "Không chia sẻ hack, cheat & phần mềm độc hại",
            titleEn: "No Hacks, Cheats or Malware",
            descVi: "Nghiêm cấm chia sẻ phần mềm gian lận, hack tool, cracked game có kèm mã độc hoặc vi phạm điều khoản dịch vụ.",
            descEn: "Do not share cheats, piracy links, malware, or exploits.",
        },
        {
            num: "04",
            titleVi: "Cảnh báo Spoiler & nội dung 18+",
            titleEn: "Spoiler & NSFW Tags",
            descVi: "Sử dụng tag cảnh báo Spoiler cho cốt truyện mới và tuân thủ quy định độ tuổi của cộng đồng.",
            descEn: "Mark spoilers properly and adhere to community rating guidelines.",
        },
    ];

    const wikiArticles = [
        {
            title: isVi ? "Cẩm nang sinh tồn cơ bản cho người mới" : "Beginner's Survival Roadmap",
            category: "Getting Started",
            reads: "5.4k reads",
            updated: "2 days ago",
        },
        {
            title: isVi ? "Bảng công thức chế tạo & vật liệu nâng cao" : "Advanced Crafting & Recipes Matrix",
            category: "Databases",
            reads: "12.8k reads",
            updated: "1 week ago",
        },
        {
            title: isVi ? "Tối ưu hóa căn cứ & hệ sinh thái bè tự động" : "Automated Raft Automation & Irrigation",
            category: "Mechanics",
            reads: "8.1k reads",
            updated: "2 weeks ago",
        },
    ];

    const links = [
        {
            title: "Official Game Website",
            desc: "Trang chủ chính thức của nhà phát triển",
            url: "https://raft-game.com",
            icon: faGlobe,
        },
        {
            title: "Steam Community Hub",
            desc: "Trung tâm cộng đồng Steam & Workshop",
            url: "https://store.steampowered.com",
            icon: faGamepad,
        },
        {
            title: "Official Discord Server",
            desc: "Kênh Discord toàn cầu để tìm đồng đội",
            url: "https://discord.com",
            icon: faLink,
        },
    ];

    if (viewType === "rules") {
        return (
            <div className="w-full flex flex-col gap-5 select-none">
                <div className="flex items-center gap-3 border-b border-divider-primary/60 pb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">
                        <FontAwesomeIcon icon={faShieldHalved} />
                    </div>
                    <div>
                        <h2 className="font-extrabold text-sm text-text">{isVi ? `Nội Quy Cộng Đồng ${communityName}` : `${communityName} Community Rules`}</h2>
                        <p className="text-xs text-text-muted">{isVi ? "Mọi thành viên cần tuân thủ để xây dựng môi trường văn minh." : "Please respect and follow the guidelines below."}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {rules.map((r) => (
                        <div key={r.num} className="p-4 rounded-[4px] bg-surface/70 border border-divider-primary/60 flex items-start gap-4">
                            <span className="font-mono font-black text-primary text-base shrink-0 pt-0.5">{r.num}</span>
                            <div className="flex flex-col gap-1">
                                <h3 className="font-bold text-xs sm:text-sm text-text">{isVi ? r.titleVi : r.titleEn}</h3>
                                <p className="text-xs text-text-muted leading-relaxed">{isVi ? r.descVi : r.descEn}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (viewType === "wiki") {
        return (
            <div className="w-full flex flex-col gap-5 select-none">
                <div className="flex items-center gap-3 border-b border-divider-primary/60 pb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">
                        <FontAwesomeIcon icon={faFileLines} />
                    </div>
                    <div>
                        <h2 className="font-extrabold text-sm text-text">{isVi ? `Tài Liệu & Wiki ${communityName}` : `${communityName} Community Wiki`}</h2>
                        <p className="text-xs text-text-muted">{isVi ? "Tổng hợp tài liệu, hướng dẫn và cơ chế từ các thành viên gạo cội." : "Curated guides, game mechanics and data sheets."}</p>
                    </div>
                </div>

                <div className="flex flex-col divide-y divide-divider-primary/40">
                    {wikiArticles.map((article, idx) => (
                        <div key={idx} className="py-3.5 px-2 hover:bg-surface-hover/30 rounded-[4px] flex items-center justify-between gap-3 cursor-pointer">
                            <div className="flex items-center gap-3 min-w-0">
                                <FontAwesomeIcon icon={faFileLines} className="text-primary text-xs shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-xs sm:text-sm text-text hover:text-primary transition-colors truncate">{article.title}</span>
                                    <span className="text-[11px] font-mono text-text-muted">{article.category} · {article.reads}</span>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-text-faint shrink-0">{article.updated}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (viewType === "links") {
        return (
            <div className="w-full flex flex-col gap-5 select-none">
                <div className="flex items-center gap-3 border-b border-divider-primary/60 pb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">
                        <FontAwesomeIcon icon={faLink} />
                    </div>
                    <div>
                        <h2 className="font-extrabold text-sm text-text">{isVi ? "Liên Kết Quan Trọng" : "Official & Community Links"}</h2>
                        <p className="text-xs text-text-muted">{isVi ? "Các đường dẫn chính thức và kênh giao lưu hữu ích." : "Handy external links and useful resources."}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {links.map((link, idx) => (
                        <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3.5 rounded-[4px] bg-surface/70 border border-divider-primary/60 hover:border-primary/50 transition-all flex items-center justify-between gap-3 group"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-surface-inner flex items-center justify-center text-primary text-xs shrink-0">
                                    <FontAwesomeIcon icon={link.icon} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-xs text-text group-hover:text-primary transition-colors truncate">{link.title}</span>
                                    <span className="text-[11px] text-text-muted truncate">{link.desc}</span>
                                </div>
                            </div>
                            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs text-text-faint group-hover:text-primary transition-colors shrink-0" />
                        </a>
                    ))}
                </div>
            </div>
        );
    }

    // Default: About
    return (
        <div className="w-full flex flex-col gap-6 select-none">
            <div className="flex items-center gap-3 border-b border-divider-primary/60 pb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">
                    <FontAwesomeIcon icon={faCircleInfo} />
                </div>
                <div>
                    <h2 className="font-extrabold text-sm text-text">{isVi ? `Về Cộng Đồng ${communityName}` : `About ${communityName}`}</h2>
                    <p className="text-xs text-text-muted">{isVi ? "Thông tin giới thiệu, mục tiêu và đội ngũ phát triển." : "Community story, mission, and moderators."}</p>
                </div>
            </div>

            <div className="p-4 rounded-[4px] bg-surface/70 border border-divider-primary/60 space-y-3">
                <h3 className="font-bold text-xs text-primary uppercase tracking-wider font-mono">{isVi ? "GIỚI THIỆU CHUNG" : "MISSION & OVERVIEW"}</h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                    {description}
                </p>
                <p className="text-xs text-text-muted leading-relaxed">
                    {isVi
                        ? "Không gian dành riêng cho các game thủ trao đổi kinh nghiệm, chia sẻ các bản build sáng tạo, tìm đồng đội leo rank hoặc co-op, và tham gia các sự kiện giải đấu cộng đồng định kỳ."
                        : "A dedicated space for passionate players to exchange knowledge, share creative builds, find co-op teammates, and participate in community tournaments."}
                </p>
            </div>
        </div>
    );
};
