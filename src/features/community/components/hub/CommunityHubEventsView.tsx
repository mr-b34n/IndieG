import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClock,
    faUsers,
    faCheck,
} from "@fortawesome/free-solid-svg-icons";
import type { UpcomingEventTimelineItem } from "./CommunityHubRightRail";

interface CommunityHubEventsViewProps {
    communityName: string;
    events: UpcomingEventTimelineItem[];
    isVi: boolean;
}

export const CommunityHubEventsView = ({
    communityName,
    events,
    isVi,
}: CommunityHubEventsViewProps) => {
    const [attending, setAttending] = useState<Record<string, boolean>>({});

    const handleToggleAttend = (id: string) => {
        setAttending((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <div className="w-full flex flex-col gap-4 select-none">
            <div className="flex items-center justify-between border-b border-divider-primary/60 pb-3">
                <div>
                    <h2 className="font-extrabold text-sm text-text uppercase tracking-tight">
                        {isVi ? `Sự Kiện & Giải Đấu ${communityName}` : `${communityName} Community Events`}
                    </h2>
                    <p className="text-xs text-text-muted">
                        {isVi ? "Các buổi giao lưu, custom game và giải đấu định kỳ." : "Upcoming tournaments, play sessions, and community watch parties."}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {events.map((ev) => {
                    const isJoined = attending[ev.id];
                    const count = ev.attendees + (isJoined ? 1 : 0);
                    return (
                        <div
                            key={ev.id}
                            className="p-4 rounded-[4px] bg-surface/70 border border-divider-primary/60 hover:border-primary/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div className="flex items-start gap-3.5 min-w-0">
                                <div className="px-3 py-2 rounded-[4px] bg-surface-inner border border-divider-primary/60 text-center font-mono shrink-0">
                                    <span className="text-xs font-black text-primary block leading-tight uppercase">
                                        {ev.dateMonth.split(" ")[0]}
                                    </span>
                                    <span className="text-sm font-black text-text block leading-tight">
                                        {ev.dateMonth.split(" ")[1] || "20"}
                                    </span>
                                </div>

                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="px-1.5 py-0.2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-mono font-bold uppercase">
                                            {isVi ? "SẮP DIỄN RA" : "UPCOMING"}
                                        </span>
                                    </div>
                                    <h3 className="font-extrabold text-sm sm:text-base text-text hover:text-primary transition-colors leading-snug mt-1">
                                        {ev.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-text-muted font-mono mt-1 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                                            <span>{ev.time}</span>
                                        </span>
                                        <span>·</span>
                                        <span className="flex items-center gap-1">
                                            <FontAwesomeIcon icon={faUsers} className="text-[10px]" />
                                            <span>{count} {isVi ? "người tham gia" : "attending"}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleToggleAttend(ev.id)}
                                className={`px-4 py-2 rounded-[4px] font-bold text-xs cursor-pointer transition-all shrink-0 flex items-center justify-center gap-2 ${
                                    isJoined
                                        ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 font-black"
                                        : "bg-primary hover:bg-primary/90 text-white shadow-xs"
                                }`}
                            >
                                {isJoined ? (
                                    <>
                                        <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                        <span>{isVi ? "Đã đăng ký" : "Attending"}</span>
                                    </>
                                ) : (
                                    <span>{isVi ? "Tham gia sự kiện" : "RSVP Event"}</span>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
