import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faUsers, 
    faShieldHalved, 
    faSpinner, 
    faSearch,
    faXmark,
    faCheck
} from "@fortawesome/free-solid-svg-icons";
import type { CommunityReputation } from "../../types";
import type { CommunityDto } from "@/shared/api/types";
import { DEFAULT_BG } from "@/shared/constants/images";
import { useTranslation, type TranslateFn } from "@/shared/hooks/useTranslate";

interface CommunitiesTabProps {
    reputations?: CommunityReputation[];
    communities?: CommunityDto[];
    isLoading?: boolean;
    t?: TranslateFn;
}

export const CommunitiesTab = ({ reputations = [], communities = [], isLoading = false, t: propT }: CommunitiesTabProps) => {
    const { t: hookT } = useTranslation();
    const t = propT || hookT;
    const navigate = useNavigate();
    
    const [searchQuery, setSearchQuery] = useState("");

    const displayItems = useMemo(() => {
        return communities.length > 0
            ? communities.map((c) => ({
                  id: c.id,
                  name: c.name,
                  icon: c.logo ? c.logo : "🎮",
                  banner: c.banner || DEFAULT_BG,
                  members: c.members || c.membersCount || 0,
                  online: Math.floor((c.members || c.membersCount || 100) * 0.15),
                  tier: c.category || "Community",
                  privacy: "PUBLIC",
                  role: (c as { role?: string }).role?.toUpperCase() === "ADMIN" ? "ADMIN" : "MEMBER",
              }))
            : reputations.map((rep) => ({
                  id: rep.id,
                  name: rep.name,
                  icon: rep.icon,
                  banner: DEFAULT_BG,
                  members: rep.postCount || 0,
                  online: Math.floor((rep.postCount || 100) * 0.15),
                  tier: rep.tier,
                  privacy: "PUBLIC",
                  role: "MEMBER"
              }));
    }, [communities, reputations]);

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return displayItems;
        const query = searchQuery.toLowerCase().trim();
        return displayItems.filter((item) =>
            item.name.toLowerCase().includes(query) ||
            item.tier.toLowerCase().includes(query)
        );
    }, [displayItems, searchQuery]);

    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in text-[#F0F1F2]">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} className="text-[#5F697C] text-xs" />
                </div>
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search joined communities..." 
                    className="w-full bg-[#13161C] border border-[#1A1F2A] rounded-[8px] pl-9 pr-8 py-2 text-xs text-[#F0F1F2] placeholder-[#5F697C] focus:outline-none focus:border-[#1688E8]/50 transition-colors"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#5F697C] hover:text-[#F0F1F2] cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-xs" />
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="w-full bg-[#0d1117] rounded-[12px] p-12 text-center flex flex-col items-center justify-center gap-3 border border-[#1A1F2A]/60">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#1688E8] text-xl" />
                    <span className="text-xs text-[#8A8F98]">Loading communities...</span>
                </div>
            ) : displayItems.length === 0 ? (
                <div className="w-full bg-[#0d1117] rounded-[12px] p-10 text-center flex flex-col items-center justify-center gap-3 border border-[#1A1F2A]/60 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                    <div className="w-12 h-12 rounded-full bg-[#13161C] flex items-center justify-center text-[#5F697C] text-xl">
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <h4 className="text-sm font-bold text-[#F0F1F2]">{t("profile.empty.communitiesTitle", { defaultValue: "No communities yet" })}</h4>
                    <p className="text-xs text-[#8D97AA] max-w-sm">{t("profile.empty.communitiesDesc", { defaultValue: "You haven't joined any communities. Explore and find your squad!" })}</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="w-full bg-[#0d1117] rounded-[12px] p-10 text-center flex flex-col items-center justify-center gap-3 border border-[#1A1F2A]/60">
                    <div className="w-12 h-12 rounded-full bg-[#13161C] flex items-center justify-center text-[#5F697C] text-xl">
                        <FontAwesomeIcon icon={faSearch} />
                    </div>
                    <h4 className="text-sm font-bold text-[#F0F1F2]">No communities found</h4>
                    <p className="text-xs text-[#8D97AA] max-w-sm">No communities matched "{searchQuery}". Try a different keyword.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => navigate({ to: "/community/$communityId", params: { communityId: String(item.id) } })}
                            className="flex flex-col rounded-[12px] bg-[#0d1117] border border-[#1A1F2A]/80 shadow-[0_4px_20px_rgba(0,0,0,0.15)] overflow-hidden group hover:border-[#1688E8]/40 hover:shadow-[0_0_15px_rgba(22,136,232,0.1)] transition-all duration-300 cursor-pointer"
                        >
                            {/* Top header mini-banner */}
                            <div 
                                className="h-16 w-full bg-cover bg-center relative"
                                style={{ backgroundImage: `url(${item.banner})` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1117] opacity-80" />
                                
                                {/* Badges top right */}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    {item.role === "ADMIN" && (
                                        <span className="px-1.5 py-0.5 rounded-[4px] bg-[#E5A93D]/20 text-[#E5A93D] text-[9px] font-bold border border-[#E5A93D]/30 backdrop-blur-sm">
                                            ADMIN
                                        </span>
                                    )}
                                    <span className="px-1.5 py-0.5 rounded-[4px] bg-[#13161C]/80 text-[#8A8F98] text-[9px] font-bold border border-[#1A1F2A] backdrop-blur-sm">
                                        {item.privacy}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 pt-0 relative flex flex-col flex-1">
                                {/* Avatar overlapping banner */}
                                <div className="w-12 h-12 rounded-[10px] bg-[#1A1F2A] border-2 border-[#0d1117] shadow-sm -mt-6 mb-2 flex items-center justify-center overflow-hidden z-10">
                                    {typeof item.icon === 'string' && item.icon.startsWith('http') ? (
                                        <img src={item.icon} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xl">{item.icon}</span>
                                    )}
                                </div>

                                {/* Center info */}
                                <div className="flex flex-col min-w-0 mb-4">
                                    <h4 className="font-bold text-[#F0F1F2] text-sm truncate group-hover:text-[#1688E8] transition-colors">
                                        {item.name}
                                    </h4>
                                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#8A8F98] mt-1">
                                        <span className="truncate">{typeof item.members === "number" ? item.members.toLocaleString() : item.members} Members</span>
                                        <span className="text-[#3A404C]">•</span>
                                        <span className="flex items-center gap-1 truncate">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#24C58A]" />
                                            {item.online.toLocaleString()} Online
                                        </span>
                                    </div>
                                </div>

                                {/* Bottom action button */}
                                <div className="mt-auto pt-3 border-t border-[#1A1F2A]/40 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-[#5F697C] flex items-center gap-1.5">
                                        <FontAwesomeIcon icon={faShieldHalved} className="text-[#5F697C]" />
                                        {item.tier.toUpperCase()}
                                    </span>
                                    
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate({ to: "/community/$communityId", params: { communityId: String(item.id) } });
                                        }}
                                        className="px-3 py-1.5 rounded-[6px] bg-[#1688E8]/10 text-[#1688E8] text-xs font-bold hover:bg-[#1688E8] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                        Joined
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

