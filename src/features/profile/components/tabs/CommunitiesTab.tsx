import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import type { CommunityReputation } from "../../types";
import { useTranslation, type TranslateFn } from "@/shared/hooks/useTranslate";

interface CommunitiesTabProps {
    reputations: CommunityReputation[];
    t?: TranslateFn;
}

export const CommunitiesTab = ({ reputations, t: propT }: CommunitiesTabProps) => {
    const { t: hookT } = useTranslation();
    const t = propT || hookT;

    return (
        <div className="flex flex-col gap-5 w-full animate-fade-in">
            <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faUsers} className="text-[#1688E8] text-sm" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Joined Communities</h3>
                </div>
                <span className="text-xs font-semibold text-[#8A8F98] px-3 py-1 rounded-[6px] bg-[#13161C]">
                    {reputations.length} Communities
                </span>
            </div>

            {reputations.length === 0 ? (
                <div className="w-full bg-[#0A0C0E] rounded-[14px] p-10 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-[#13161C] flex items-center justify-center text-[#5F697C] text-xl">
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <h4 className="text-sm font-bold text-[#F0F1F2]">{t("profile.empty.communitiesTitle")}</h4>
                    <p className="text-xs text-[#8D97AA] max-w-sm">{t("profile.empty.communitiesDesc")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {reputations.map((rep) => (
                        <div
                            key={rep.id}
                            className="flex items-center justify-between p-4 rounded-[10px] bg-[#0A0C0E] hover:bg-[#13161C] transition-all shadow-sm"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-2xl shrink-0">{rep.icon}</span>
                                <div className="flex flex-col min-w-0">
                                    <h4 className="font-bold text-[#F0F1F2] text-sm truncate">{rep.name}</h4>
                                    <span className="text-[11px] text-[#8A8F98] truncate">{rep.members?.toLocaleString() || "12.4k"} Members</span>
                                </div>
                            </div>

                            <span className="px-2 py-1 rounded-[6px] bg-[#13161C] text-[#24C58A] text-[11px] font-bold shrink-0 flex items-center gap-1">
                                <FontAwesomeIcon icon={faShieldHalved} className="text-[#E5A93D] text-[10px]" />
                                <span>{rep.tier}</span>
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
