import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faUsers, 
    faShieldHalved, 
    faSpinner, 
    faSearch,
    faCaretDown,
    faCrown,
    faBullhorn,
    faCheck
} from "@fortawesome/free-solid-svg-icons";
import type { CommunityReputation } from "../../types";
import type { CommunityDto } from "@/shared/api/types";
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
    
    const [filter, setFilter] = useState<"All" | "Public" | "Private">("All");

    const displayItems = communities.length > 0
        ? communities.map((c) => ({
              id: c.id,
              name: c.name,
              icon: c.logo ? c.logo : "🎮",
              banner: c.banner || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=200", // Placeholder gaming banner
              members: c.members || c.membersCount || 0,
              online: Math.floor((c.members || c.membersCount || 100) * 0.15), // Mock online count
              tier: c.category || "Community",
              privacy: Math.random() > 0.3 ? "PUBLIC" : "PRIVATE",
              role: Math.random() > 0.9 ? "ADMIN" : "MEMBER",
          }))
        : reputations.map((rep) => ({
              id: rep.id,
              name: rep.name,
              icon: rep.icon,
              banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=200",
              members: rep.postCount || 0,
              online: Math.floor((rep.postCount || 100) * 0.15),
              tier: rep.tier,
              privacy: "PUBLIC",
              role: "MEMBER"
          }));

    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in text-[#F0F1F2]">
            
            {/* ── Section Controls & Toolbar ─────────────────────────────── */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-[#1A1F2A]/60 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[8px] bg-[#1688E8]/10 flex items-center justify-center border border-[#1688E8]/20">
                        <FontAwesomeIcon icon={faUsers} className="text-[#1688E8] text-sm" />
                    </div>
                    <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#F0F1F2]">
                        JOINED COMMUNITIES
                    </h3>
                    <span className="text-xs font-bold text-[#8A8F98] px-2.5 py-1 rounded-[6px] bg-[#13161C] ml-2 border border-[#1A1F2A]">
                        {displayItems.length} Communities
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faSearch} className="text-[#5F697C] text-xs" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search joined communities..." 
                            className="w-full bg-[#13161C] border border-[#1A1F2A] rounded-[8px] pl-9 pr-3 py-2 text-xs text-[#F0F1F2] placeholder-[#5F697C] focus:outline-none focus:border-[#1688E8]/50 transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Segmented Filter */}
                        <div className="flex p-0.5 bg-[#13161C] rounded-[8px] border border-[#1A1F2A]">
                            {["All", "Public", "Private"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f as any)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-[6px] transition-all ${
                                        filter === f 
                                            ? "bg-[#252C3A] text-white shadow-sm" 
                                            : "text-[#8A8F98] hover:text-[#F0F1F2] hover:bg-[#1A1F2A]/50"
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* Sort Dropdown */}
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#13161C] border border-[#1A1F2A] rounded-[8px] text-xs font-bold text-[#8A8F98] hover:text-[#F0F1F2] hover:bg-[#1A1F2A]/50 transition-colors whitespace-nowrap">
                            Sort by: Active
                            <FontAwesomeIcon icon={faCaretDown} />
                        </button>
                    </div>
                </div>
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
            ) : (
                <div className="flex flex-col gap-6">
                    {/* ── Featured / Pinned Community Section ─────────────────────────────── */}
                    <div className="relative overflow-hidden rounded-[12px] bg-[#12151c] border border-[#E5A93D]/30 shadow-[0_0_20px_rgba(229,169,61,0.05)] group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/90 to-transparent z-10" />
                        <div 
                            className="absolute inset-y-0 right-0 w-2/3 bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700" 
                            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200")' }}
                        />
                        
                        <div className="relative z-20 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-[14px] bg-[#1A1F2A] border-2 border-[#E5A93D] overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(229,169,61,0.2)]">
                                        <span className="text-3xl">👑</span>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-[#0d1117] border border-[#E5A93D] flex items-center justify-center text-[#E5A93D] text-[10px]">
                                        <FontAwesomeIcon icon={faCrown} />
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-lg font-extrabold text-[#F0F1F2] tracking-tight">IndieG Official Hub</h4>
                                        <span className="px-2 py-0.5 rounded-[4px] bg-[#E5A93D]/10 text-[#E5A93D] text-[10px] font-extrabold border border-[#E5A93D]/30 flex items-center gap-1">
                                            <FontAwesomeIcon icon={faCrown} className="text-[9px]" />
                                            ADMIN / OWNER
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 text-xs font-semibold text-[#8A8F98]">
                                        <span className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-[#24C58A]" />
                                            1,240 Online
                                        </span>
                                        <span className="text-[#4A505C]">•</span>
                                        <span>25.4k Members</span>
                                    </div>

                                    <div className="mt-1 flex items-center gap-2 text-[11px] text-[#A0A5B0] bg-[#1A1F2A]/50 px-3 py-1.5 rounded-[6px] border border-[#242A36]">
                                        <FontAwesomeIcon icon={faBullhorn} className="text-[#1688E8]" />
                                        <span className="truncate max-w-[200px] sm:max-w-md">Announcing the new Summer Game Jam 2026! Registration is now open...</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button className="w-full sm:w-auto px-5 py-2.5 rounded-[8px] bg-gradient-to-r from-[#1688E8] to-[#1474C6] text-white text-xs font-bold hover:shadow-[0_0_15px_rgba(22,136,232,0.3)] transition-all flex items-center justify-center gap-2">
                                Manage Community
                            </button>
                        </div>
                    </div>

                    {/* ── Community Grid Layout ─────────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {displayItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col rounded-[12px] bg-[#0d1117] border border-[#1A1F2A]/80 shadow-[0_4px_20px_rgba(0,0,0,0.15)] overflow-hidden group hover:border-[#1688E8]/40 hover:shadow-[0_0_15px_rgba(22,136,232,0.1)] transition-all duration-300"
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
                                        
                                        <button className="px-3 py-1.5 rounded-[6px] bg-[#1688E8]/10 text-[#1688E8] text-xs font-bold hover:bg-[#1688E8] hover:text-white transition-colors flex items-center gap-1.5">
                                            <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                            Joined
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
