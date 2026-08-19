import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faCheck,
    faCircle,
    faPen,
} from "@fortawesome/free-solid-svg-icons";
import { formatCompactNumber } from "../../constants";

interface CommunityHubHeaderProps {
    name: string;
    description: string;
    coverUrl: string;
    iconUrl: string;
    membersCount: number;
    onlineCount: number;
    isJoined: boolean;
    onToggleJoin: () => void;
    onStartDiscussion: () => void;
    isVi: boolean;
    accentHex?: string;
}

export const CommunityHubHeader = ({
    name,
    description,
    coverUrl,
    iconUrl,
    membersCount,
    onlineCount,
    isJoined,
    onToggleJoin,
    onStartDiscussion,
    isVi,
}: CommunityHubHeaderProps) => {
    return (
        <div className="w-full flex flex-col gap-4 select-none">
            {/* 1. Cover Artwork Banner (Editorial Finish, minimal overlay) */}
            <div className="relative w-full h-44 sm:h-52 bg-surface-inner rounded-[4px] overflow-hidden border border-divider-primary/60">
                <img
                    src={coverUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* 2. Identity Row (Icon + Name + Description + Stats + Actions) */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
                {/* Left: Icon & Info */}
                <div className="flex items-start gap-4">
                    <img
                        src={iconUrl}
                        alt={name}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-[4px] object-cover bg-surface border border-divider-primary shrink-0 shadow-xs"
                    />

                    <div className="flex flex-col gap-1 min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text uppercase">
                            {name}
                        </h1>
                        <p className="text-xs text-text-muted leading-relaxed max-w-xl">
                            {description || `Official community hub for ${name} discussions, guides & showcases.`}
                        </p>

                        <div className="flex items-center gap-3 text-xs font-mono font-bold tracking-wide pt-1">
                            <span className="text-text">
                                {formatCompactNumber(membersCount).toUpperCase()}{" "}
                                <span className="text-text-muted font-sans font-medium text-[11px]">members</span>
                            </span>
                            <span className="text-divider-primary font-normal">·</span>
                            <span className="flex items-center gap-1.5 text-emerald-500">
                                <FontAwesomeIcon icon={faCircle} className="text-[6px] animate-pulse" />
                                {formatCompactNumber(onlineCount).toUpperCase()}{" "}
                                <span className="text-text-muted font-sans font-medium text-[11px]">online</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                        type="button"
                        onClick={onToggleJoin}
                        className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            isJoined
                                ? "bg-surface-hover text-emerald-500 border border-emerald-500/30 hover:bg-surface-hover/80"
                                : "bg-primary hover:bg-primary/90 text-white shadow-xs"
                        }`}
                    >
                        {isJoined ? (
                            <>
                                <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                <span>{isVi ? "JOINED" : "JOINED"}</span>
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                                <span>{isVi ? "JOIN →" : "JOIN →"}</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={onStartDiscussion}
                        className="px-3.5 py-1.5 rounded-[4px] bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                        <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                        <span>{isVi ? "Đăng bài" : "Start Discussion"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
