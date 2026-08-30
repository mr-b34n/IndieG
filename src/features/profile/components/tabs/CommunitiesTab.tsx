import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faComments, faArrowUpRightFromSquare, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
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
                    <FontAwesomeIcon icon={faUsers} className="text-[#1688E8] text-base" />
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F1F2]">Joined Communities</h3>
                        <p className="text-xs text-[#9A9DA3]">Danh sách cộng đồng & cấp độ uy tín trên IndieG</p>
                    </div>
                </div>
                <span className="text-xs font-semibold text-[#F0F1F2] px-3 py-1 rounded-[6px] bg-[#13161C]">
                    {reputations.length} Active Communities
                </span>
            </div>

            {reputations.length === 0 ? (
                <div className="w-full bg-[#0A0C0E] rounded-[14px] p-10 text-center flex flex-col items-center justify-center gap-3 shadow-sm border border-[#13161C]">
                    <div className="w-14 h-14 rounded-full bg-[#13161C] flex items-center justify-center text-[#5F697C] text-2xl">
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <h4 className="text-sm font-bold text-[#F0F1F2]">{t("profile.empty.communitiesTitle")}</h4>
                    <p className="text-xs text-[#8D97AA] max-w-sm">{t("profile.empty.communitiesDesc")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {reputations.map((rep) => (
                        <div
                            key={rep.id}
                            className="flex flex-col gap-3.5 p-5 rounded-[12px] bg-[#0A0C0E] hover:bg-[#13161C] shadow-sm transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{rep.icon}</span>
                                    <div className="flex flex-col">
                                        <h4 className="font-bold text-[#F0F1F2] text-base">{rep.name}</h4>
                                        <span className="text-xs text-[#9A9DA3]">{t("profile.empty.joinedCommunity")}</span>
                                    </div>
                                </div>

                                <span className="px-2.5 py-1 rounded-[6px] bg-[#13161C] text-[#24C58A] text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                                    <FontAwesomeIcon icon={faShieldHalved} className="text-[#E5A93D]" />
                                    <span>{rep.tier}</span>
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs bg-[#13161C] p-3 rounded-[8px]">
                                <div className="flex items-center gap-2 text-[#9A9DA3] font-medium">
                                    <FontAwesomeIcon icon={faComments} className="text-[#8A8F98]" />
                                    <span>{rep.postCount} Bài viết</span>
                                </div>
                                <div className="flex items-center gap-2 text-[#24C58A] font-semibold">
                                    <span>▲</span>
                                    <span>{rep.upvotesCount} Upvotes</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="mt-1 w-full py-2 rounded-[6px] bg-[#13161C] hover:bg-[#181C24] text-[#F0F1F2] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            >
                                <span>{t("profile.empty.visitCommunity")}</span>
                                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px] text-[#8A8F98]" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
