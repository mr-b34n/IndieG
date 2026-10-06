interface CommunityHubNavProps {
    activeTab: string;
    onTabChange: (tabId: string) => void;
    isVi: boolean;
    accentColor?: string;
}

export const CommunityHubNav = ({
    activeTab,
    onTabChange,
    isVi,
}: CommunityHubNavProps) => {
    const tabs = [
        { id: "home", labelVi: "Trang chủ", labelEn: "Home" },
        { id: "discussions", labelVi: "Thảo luận", labelEn: "Discussions" },
        { id: "guides", labelVi: "Hướng dẫn", labelEn: "Guides" },
        { id: "media", labelVi: "Media", labelEn: "Media" },
        { id: "events", labelVi: "Sự kiện", labelEn: "Events" },
        { id: "members", labelVi: "Thành viên", labelEn: "Members" },
        { id: "rules", labelVi: "Quy tắc", labelEn: "Rules" },
        { id: "links", labelVi: "Liên kết", labelEn: "Links" },
    ];

    return (
        <div className="w-full flex items-center gap-5 sm:gap-7 border-b border-border/60 select-none pt-2 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onTabChange(tab.id)}
                        className={`relative pb-2.5 text-xs font-bold transition-colors cursor-pointer tracking-wider uppercase whitespace-nowrap ${
                            isActive ? "text-primary" : "text-text-muted hover:text-text"
                        }`}
                    >
                        <span>{isVi ? tab.labelVi : tab.labelEn}</span>
                        {isActive && (
                            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-sm" />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

