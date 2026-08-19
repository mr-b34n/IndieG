import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faComments, faArrowUpRightFromSquare, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import type { CommunityReputation } from "../../types";
import type { TranslateFn } from "@/shared/hooks/useTranslate";

interface CommunitiesTabProps {
    reputations: CommunityReputation[];
    t: TranslateFn;
}

export const CommunitiesTab = ({ reputations }: CommunitiesTabProps) => {
    return (
        <div className="flex flex-col gap-5 w-full animate-fade-in">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faUsers} className="text-cyan-400 text-lg" />
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-text">Joined Communities</h3>
                        <p className="text-xs text-text-faint font-semibold">Danh sách cộng đồng & cấp độ uy tín trên IndieG</p>
                    </div>
                </div>
                <span className="text-xs font-black text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                    {reputations.length} Active Communities
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reputations.map((rep) => (
                    <div
                        key={rep.id}
                        className={`flex flex-col gap-3 p-5 rounded-2xl bg-gradient-to-br ${rep.color} border shadow-sm hover:scale-[1.01] transition-all`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{rep.icon}</span>
                                <div className="flex flex-col">
                                    <h4 className="font-black text-text text-base">{rep.name}</h4>
                                    <span className="text-xs font-bold text-text-faint">Joined Community</span>
                                </div>
                            </div>

                            <span className="px-3 py-1 rounded-xl bg-surface/80 border border-border/50 text-xs font-black flex items-center gap-1.5 shadow-xs">
                                <FontAwesomeIcon icon={faShieldHalved} className="text-amber-400" />
                                <span>{rep.tier}</span>
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/30 text-xs">
                            <div className="flex items-center gap-2 text-text font-bold">
                                <FontAwesomeIcon icon={faComments} className="text-text-faint" />
                                <span>{rep.postCount} Bài viết</span>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                <span>▲</span>
                                <span>{rep.upvotesCount} Upvotes</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="mt-1 w-full py-2 rounded-xl bg-surface/60 hover:bg-surface text-text font-bold text-xs flex items-center justify-center gap-1.5 border border-border/40 transition-colors cursor-pointer"
                        >
                            <span>Ghé thăm cộng đồng</span>
                            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px] opacity-70" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
