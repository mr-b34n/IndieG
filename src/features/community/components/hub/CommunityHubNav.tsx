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
        { id: "home", labelVi: "Home", labelEn: "Home" },
        { id: "discussions", labelVi: "Discussions", labelEn: "Discussions" },
        { id: "guides", labelVi: "Guides", labelEn: "Guides" },
        { id: "media", labelVi: "Media", labelEn: "Media" },
        { id: "events", labelVi: "Events", labelEn: "Events" },
        { id: "members", labelVi: "Members", labelEn: "Members" },
    ];

    return (
        <div className="w-full flex items-center gap-6 border-b border-divider-primary select-none pt-2 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onTabChange(tab.id)}
                        className={`relative pb-2.5 text-xs font-bold transition-colors cursor-pointer tracking-wider uppercase whitespace-nowrap ${
                            isActive ? "text-primary font-black" : "text-text-muted hover:text-text"
                        }`}
                    >
                        <span>{isVi ? tab.labelVi : tab.labelEn}</span>
                        {isActive && (
                            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

