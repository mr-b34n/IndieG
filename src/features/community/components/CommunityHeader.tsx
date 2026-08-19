import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCircle } from "@fortawesome/free-solid-svg-icons";
import { formatCompactNumber } from "../constants";

interface CommunityHeaderProps {
    communityCount: number;
    totalOnline: number;
    totalMembers: number;
    canCreateCommunity: boolean;
    onCreateCommunity: () => void;
}

export const CommunityHeader = ({
    communityCount,
    totalOnline,
    totalMembers,
    canCreateCommunity,
    onCreateCommunity
}: CommunityHeaderProps) => {
    return (
        <div className="w-full flex flex-col gap-4 select-none pb-3 border-b border-divider-primary">
            {/* Top Row: Title + Primary Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text uppercase">
                        COMMUNITIES
                    </h1>
                    <p className="text-sm text-text-muted">
                        Find your games. Find your people.
                    </p>
                </div>

                {/* Primary Action Button (4-6px radius) */}
                {canCreateCommunity && (
                    <button
                        type="button"
                        onClick={onCreateCommunity}
                        className="self-start sm:self-center px-4 py-2 rounded-[4px] bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                        <span>Tạo cộng đồng</span>
                    </button>
                )}
            </div>

            {/* Typography-based Stats Strip (10-15% larger, no heavy bullet separators, wide spacing) */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs sm:text-[13px] font-mono font-bold tracking-wider pt-1">
                <div className="flex items-center gap-2 text-text">
                    <span className="text-primary font-black">
                        {String(communityCount).padStart(2, "0")}
                    </span>
                    <span className="text-text-muted uppercase text-xs font-sans tracking-wide">
                        COMMUNITIES
                    </span>
                </div>

                <div className="flex items-center gap-2 text-text">
                    <FontAwesomeIcon icon={faCircle} className="text-[7px] text-emerald-500 animate-pulse" />
                    <span className="text-emerald-500 font-black">
                        {formatCompactNumber(totalOnline).toUpperCase()}
                    </span>
                    <span className="text-text-muted uppercase text-xs font-sans tracking-wide">
                        ONLINE NOW
                    </span>
                </div>

                <div className="flex items-center gap-2 text-text">
                    <span className="text-text font-black">
                        {formatCompactNumber(totalMembers).toUpperCase()}
                    </span>
                    <span className="text-text-muted uppercase text-xs font-sans tracking-wide">
                        GAMERS JOINED
                    </span>
                </div>
            </div>
        </div>
    );
};
