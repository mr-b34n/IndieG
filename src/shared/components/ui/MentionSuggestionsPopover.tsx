import React, { useEffect, useState } from "react";
import { CircleNotch, At } from "@phosphor-icons/react";
import { profilesApi } from "@/shared/api";
import type { UserProfileDto } from "@/shared/api/types";
import { UserAvatar } from "./UserAvatar";

export interface MentionCandidate {
    id: string;
    username: string;
    name: string;
    avatarUrl?: string;
}

const candidateCache = new Map<string, { items: MentionCandidate[]; ts: number }>();
const CACHE_TTL_MS = 60_000;

function mapProfileToCandidate(p: UserProfileDto): MentionCandidate | null {
    const username = (p.username || "").trim().replace(/^@+/, "");
    if (!username) return null;
    return {
        id: p.id,
        username,
        name: p.name || p.displayName || username,
        avatarUrl: p.avatarUrl || p.avatar || p.customAvatar || undefined,
    };
}

export function useMentionCandidates(query: string | null) {
    const [candidates, setCandidates] = useState<MentionCandidate[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query === null) {
            setCandidates([]);
            setLoading(false);
            return;
        }

        const normalized = query.trim().toLowerCase();
        const cached = candidateCache.get(normalized);
        if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
            setCandidates(cached.items);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);

        const timer = window.setTimeout(async () => {
            try {
                const rawList =
                    normalized.length > 0
                        ? await profilesApi.search(normalized, 1, 6)
                        : await profilesApi.getAll({ page: 1, limit: 6 });

                if (cancelled) return;
                const mapped = (Array.isArray(rawList) ? rawList : [])
                    .map(mapProfileToCandidate)
                    .filter((item): item is MentionCandidate => item !== null)
                    .slice(0, 6);

                candidateCache.set(normalized, { items: mapped, ts: Date.now() });
                setCandidates(mapped);
            } catch {
                if (!cancelled) setCandidates([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, normalized.length > 0 ? 180 : 60);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [query]);

    return { candidates, loading };
}

interface MentionSuggestionsPopoverProps {
    query: string | null;
    candidates: MentionCandidate[];
    loading: boolean;
    activeIndex: number;
    onSelect: (candidate: MentionCandidate) => void;
    onHoverIndex?: (index: number) => void;
    position?: "above" | "below";
    className?: string;
}

export const MentionSuggestionsPopover: React.FC<MentionSuggestionsPopoverProps> = ({
    query,
    candidates,
    loading,
    activeIndex,
    onSelect,
    onHoverIndex,
    position = "above",
    className = "",
}) => {
    if (query === null) return null;
    if (!loading && candidates.length === 0) return null;

    const posClass =
        position === "above"
            ? "bottom-full mb-1.5 left-0"
            : "top-full mt-1.5 left-0";

    return (
        <div
            className={`absolute ${posClass} z-[120] w-64 sm:w-72 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-fade-in ${className}`}
            role="listbox"
            aria-label="Gợi ý gắn thẻ người dùng"
        >
            <div className="px-3 py-1.5 border-b border-border/60 bg-surface-hover/50 flex items-center justify-between text-[11px] font-bold text-text-muted">
                <span className="flex items-center gap-1.5">
                    <At className="size-3.5 text-primary" />
                    <span>Gắn thẻ thành viên</span>
                </span>
                {loading && <CircleNotch className="size-3 animate-spin text-primary" />}
            </div>

            <div className="max-h-56 overflow-y-auto py-1">
                {candidates.map((item, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                onSelect(item);
                            }}
                            onMouseEnter={() => onHoverIndex?.(idx)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer ${
                                isActive
                                    ? "bg-primary/15 text-text"
                                    : "hover:bg-surface-hover text-text"
                            }`}
                        >
                            <UserAvatar
                                src={item.avatarUrl}
                                name={item.name}
                                className="w-7 h-7 shrink-0"
                                textClassName="text-[11px]"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-text truncate">
                                    {item.name}
                                </div>
                                <div className="text-[11px] text-primary font-semibold truncate">
                                    @{item.username}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
