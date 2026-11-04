import React, { useState, useMemo } from "react";
import { Calendar, MessageSquare, Clock, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useGamePatchNotesQuery } from "@/shared/api/useQueries";
import { mapGamePatchNoteDtoToGamePatchNote } from "@/shared/api/types";
import { type GamePatchNote, type GameData } from "../types";

interface GamePatchNotesTabProps {
    game: GameData;
    gameAppid: number;
}

export const GamePatchNotesTab: React.FC<GamePatchNotesTabProps> = ({ game, gameAppid }) => {
    const { lang } = useTranslation();
    const isVietnamese = lang === "vi";
    const navigate = useNavigate();

    const [selectedType, setSelectedType] = useState<string>("all");

    // Fetch patch notes from backend
    const { data: remotePatchNotesData, isLoading } = useGamePatchNotesQuery(
        gameAppid,
        {
            type: selectedType !== "all" ? (selectedType as any) : undefined,
            limit: 50,
        }
    );

    const patchNotes: GamePatchNote[] = useMemo(() => {
        const rawList = Array.isArray(remotePatchNotesData)
            ? remotePatchNotesData
            : (remotePatchNotesData as any)?.data || (remotePatchNotesData as any)?.items || [];

        if (rawList.length > 0) {
            return rawList.map((n: any) => mapGamePatchNoteDtoToGamePatchNote(n));
        }

        if (game.patchNotes && game.patchNotes.length > 0) {
            return game.patchNotes;
        }

        return [];
    }, [remotePatchNotesData, game.patchNotes]);

    const types = [
        { id: "all", label: isVietnamese ? "Tất cả" : "All" },
        { id: "major", label: isVietnamese ? "Bản lớn (Major)" : "Major" },
        { id: "patch", label: isVietnamese ? "Bản vá (Patch)" : "Patch" },
        { id: "hotfix", label: isVietnamese ? "Sửa nhanh (Hotfix)" : "Hotfix" },
        { id: "event", label: isVietnamese ? "Sự kiện" : "Event" },
    ];

    const getTypeBadgeStyle = (type: string) => {
        switch (type.toLowerCase()) {
            case "major":
                return "bg-primary/10 text-primary border-primary/25";
            case "patch":
                return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
            case "hotfix":
                return "bg-amber-500/10 text-amber-400 border-amber-500/25";
            case "event":
                return "bg-purple-500/10 text-purple-400 border-purple-500/25";
            default:
                return "bg-surface text-text-muted border-border/30";
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-text">
                        {isVietnamese ? "Bản cập nhật & Nhật ký vá lỗi" : "Updates & Patch Notes"}
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">
                        {isVietnamese
                            ? `Lịch sử cập nhật và các thay đổi của tựa game ${game.name}`
                            : `Update history, balance changes, and fixes for ${game.name}`}
                    </p>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {types.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setSelectedType(t.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                                selectedType === t.id
                                    ? "bg-surface-hover text-text font-semibold ring-1 ring-border/40 shadow-xs"
                                    : "text-text-muted hover:text-text hover:bg-surface/50"
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Patch Notes Timeline Layout */}
            {isLoading ? (
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-28 rounded-xl bg-surface/30 animate-pulse border border-border/10" />
                    ))}
                </div>
            ) : patchNotes.length > 0 ? (
                <div className="relative pl-6 sm:pl-8 border-l-2 border-border/30 space-y-6 my-2 ml-2 sm:ml-3">
                    {patchNotes.map((note) => {
                        const summaryText = isVietnamese ? (note.summaryVi || note.summary) : note.summary;
                        const titleText = isVietnamese ? (note.titleVi || note.title) : note.title;

                        return (
                            <article key={note.id} className="relative group">
                                {/* Timeline Indicator Dot */}
                                <span className="absolute -left-[31px] sm:-left-[39px] top-4 w-3.5 h-3.5 rounded-full bg-background border-2 border-primary ring-4 ring-background transition-transform group-hover:scale-125" />

                                {/* Card Surface */}
                                <div className="p-4 sm:p-5 rounded-xl bg-surface/30 hover:bg-surface/50 border border-border/20 hover:border-border/40 transition-all flex flex-col gap-3 shadow-xs">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-xs text-text px-2 py-0.5 rounded-md bg-surface border border-border/30 shadow-2xs">
                                                v{note.version}
                                            </span>
                                            <span
                                                className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${getTypeBadgeStyle(
                                                    note.type
                                                )}`}
                                            >
                                                {note.type}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                            <Calendar className="w-3.5 h-3.5 text-text-muted/70" />
                                            <span>{note.date}</span>
                                        </div>
                                    </div>

                                    {titleText && (
                                        <h3 className="text-base font-semibold text-text leading-snug group-hover:text-primary transition-colors">
                                            {titleText}
                                        </h3>
                                    )}

                                    {summaryText && (
                                        <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line font-normal">
                                            {summaryText}
                                        </p>
                                    )}

                                    {note.postId && (
                                        <div className="pt-2 border-t border-border/10 flex items-center justify-end">
                                            <button
                                                type="button"
                                                onClick={() => navigate({ to: "/post/$postId", params: { postId: String(note.postId) } })}
                                                className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                <span>
                                                    {isVietnamese ? "Xem bài thảo luận chi tiết" : "View discussion thread"}
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-border/30 rounded-2xl bg-surface/10 p-6">
                    <div className="w-12 h-12 rounded-full bg-surface/50 border border-border/30 flex items-center justify-center text-text-muted text-lg">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text">
                            {isVietnamese ? "Chưa có bản cập nhật nào" : "No patch notes recorded"}
                        </p>
                        <p className="text-xs text-text-muted max-w-sm mt-1">
                            {isVietnamese
                                ? "Hiện chưa có ghi chú bản vá nào được ghi nhận cho tựa game này."
                                : "No update notes recorded for this game yet."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
