import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarDay,
    faTowerBroadcast
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "@tanstack/react-router";
import type { EventItem } from "../types";

interface OngoingEventsSectionProps {
    events: EventItem[];
}

export const OngoingEventsSection = ({ events }: OngoingEventsSectionProps) => {
    const navigate = useNavigate();
    if (!events.length) return null;

    const mainEvent = events[0];
    const sideEvents = events.slice(1);

    return (
        <section className="w-full flex flex-col gap-4 select-none">
            {/* Section Header */}
            <div className="flex flex-col gap-1 pb-2 border-b border-divider-primary">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-black tracking-wider text-text uppercase flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarDay} className="text-primary text-xs" />
                        <span>ONGOING EVENTS</span>
                    </h2>
                </div>
                <p className="text-xs text-text-muted">
                    Tournaments, live streams, and community festivals happening now
                </p>
            </div>

            {/* Asymmetric Event Grid: 1 Large Lead Event + 2 Half-Width Events */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Main Featured Event (Col 7) */}
                <div
                    onClick={() => navigate({ to: "/community" })}
                    className="lg:col-span-7 relative h-[260px] sm:h-[300px] rounded-[6px] overflow-hidden group cursor-pointer border border-divider-primary bg-surface shadow-md"
                >
                    {/* Artwork Visual */}
                    <img
                        src={mainEvent.imageUrl}
                        alt={mainEvent.title}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
                    />

                    {/* Dark gradient for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* Overlay Event Details */}
                    <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-2">
                            {mainEvent.isLive ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-red-600/90 text-white text-[10px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                                    <FontAwesomeIcon icon={faTowerBroadcast} className="text-[9px]" />
                                    {mainEvent.statusText}
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 rounded-[4px] bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider">
                                    {mainEvent.statusText}
                                </span>
                            )}

                            <span className="text-xs font-mono font-bold text-gray-200 bg-black/50 px-2 py-0.5 rounded-[4px]">
                                {mainEvent.date}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1.5 max-w-lg">
                            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug group-hover:text-primary transition-colors">
                                {mainEvent.title}
                            </h3>
                            <p className="text-xs text-gray-200 line-clamp-2 font-normal leading-relaxed">
                                {mainEvent.subtitle}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                {mainEvent.tags.map((tag) => (
                                    <span key={tag} className="text-[10px] font-semibold text-gray-300 bg-white/10 px-2 py-0.5 rounded-[4px]">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2 Stacked / Grid Side Events (Col 5) */}
                <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                    {sideEvents.map((event) => (
                        <div
                            key={event.id}
                            onClick={() => navigate({ to: "/community" })}
                            className="relative h-[140px] rounded-[6px] overflow-hidden group cursor-pointer border border-divider-primary bg-surface shadow-sm"
                        >
                            <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                            <div className="absolute inset-0 p-3.5 sm:p-4 flex flex-col justify-between">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-black text-primary bg-black/60 px-2 py-0.5 rounded-[4px] uppercase tracking-wider">
                                        {event.statusText}
                                    </span>
                                    <span className="text-[10px] font-mono text-gray-300 bg-black/40 px-1.5 py-0.5 rounded-[4px]">
                                        {event.date}
                                    </span>
                                </div>

                                <div>
                                    <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-primary transition-colors truncate">
                                        {event.title}
                                    </h4>
                                    <p className="text-[11px] text-gray-200 line-clamp-1 mt-0.5 font-normal">
                                        {event.subtitle}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
