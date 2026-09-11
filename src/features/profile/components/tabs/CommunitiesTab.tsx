import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faShieldHalved, faSpinner } from "@fortawesome/free-solid-svg-icons";
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

    const displayItems = communities.length > 0
        ? communities.map((c) => ({
              id: c.id,
              name: c.name,
              icon: c.logo ? (
                  <img src={c.logo} alt={c.name} className="w-8 h-8 rounded-full object-cover border border-[#1A1F2A]" />
              ) : (
                  "🎮"
              ),
              members: c.members || c.membersCount || 0,
              tier: c.category || "Community",
          }))
        : reputations.map((rep) => ({
              id: rep.id,
              name: rep.name,
              icon: rep.icon,
              members: rep.postCount || 0,
              tier: rep.tier,
          }));

    return (
        <div className="flex flex-col gap-5 w-full animate-fade-in">
            <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faUsers} className="text-[#1688E8] text-sm" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">
                        {t("profile.joinedCommunities", { defaultValue: "Joined Communities" })}
                    </h3>
                </div>
                <span className="text-xs font-semibold text-[#8A8F98] px-3 py-1 rounded-[6px] bg-[#13161C]">
                    {displayItems.length} Communities
                </span>
            </div>

            {isLoading ? (
                <div className="w-full bg-[#0A0C0E] rounded-[14px] p-12 text-center flex flex-col items-center justify-center gap-3 border border-[#1A1F2A]/60">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#1688E8] text-xl" />
                    <span className="text-xs text-[#8A8F98]">
                        {t("common.loading", { defaultValue: "Đang tải danh sách cộng đồng..." })}
                    </span>
                </div>
            ) : displayItems.length === 0 ? (
                <div className="w-full bg-[#0A0C0E] rounded-[14px] p-10 text-center flex flex-col items-center justify-center gap-3 shadow-sm border border-[#1A1F2A]/60">
                    <div className="w-12 h-12 rounded-full bg-[#13161C] flex items-center justify-center text-[#5F697C] text-xl">
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <h4 className="text-sm font-bold text-[#F0F1F2]">{t("profile.empty.communitiesTitle")}</h4>
                    <p className="text-xs text-[#8D97AA] max-w-sm">{t("profile.empty.communitiesDesc")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {displayItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-4 rounded-[10px] bg-[#0A0C0E] hover:bg-[#13161C] transition-all shadow-sm border border-[#1A1F2A]/40"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-2xl shrink-0 flex items-center justify-center">{item.icon}</span>
                                <div className="flex flex-col min-w-0">
                                    <h4 className="font-bold text-[#F0F1F2] text-sm truncate">{item.name}</h4>
                                    <span className="text-[11px] text-[#8A8F98] truncate">
                                        {typeof item.members === "number" ? item.members.toLocaleString() : item.members} Members
                                    </span>
                                </div>
                            </div>

                            <span className="px-2 py-1 rounded-[6px] bg-[#13161C] text-[#24C58A] text-[11px] font-bold shrink-0 flex items-center gap-1">
                                <FontAwesomeIcon icon={faShieldHalved} className="text-[#E5A93D] text-[10px]" />
                                <span>{item.tier}</span>
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
