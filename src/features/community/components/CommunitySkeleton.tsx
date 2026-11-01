import React from "react";

export const CommunityGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
            {Array.from({ length: count }).map((_, idx) => (
                <div
                    key={`comm-grid-skel-${idx}`}
                    className="w-full flex flex-col rounded-2xl bg-surface-inner/60 p-2.5 sm:p-3"
                >
                    {/* Inset Banner Skeleton */}
                    <div className="w-full aspect-[16/9] bg-white/[0.06] rounded-xl relative" />

                    {/* Content Skeleton */}
                    <div className="pt-2.5 px-0.5 flex flex-col justify-between gap-2.5 flex-1">
                        <div className="flex flex-col gap-1.5">
                            <div className="h-4 w-3/4 bg-white/[0.08] rounded-md" />
                            <div className="flex gap-2 pt-0.5">
                                <div className="h-3 w-14 bg-white/[0.06] rounded" />
                                <div className="h-3 w-12 bg-white/[0.05] rounded" />
                            </div>
                        </div>

                        <div className="pt-2 mt-auto flex items-center justify-between gap-2">
                            <div className="h-3 w-28 bg-white/[0.06] rounded-md" />
                            <div className="h-7 w-20 bg-white/[0.08] rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const CommunityListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
    return (
        <div className="flex flex-col gap-1.5">
            {Array.from({ length: count }).map((_, idx) => (
                <div
                    key={`comm-list-skel-${idx}`}
                    className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-inner/60"
                >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.06] shrink-0" />
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <div className="h-3.5 w-32 bg-white/[0.08] rounded-md" />
                            <div className="flex gap-2">
                                <div className="h-3 w-16 bg-white/[0.06] rounded" />
                                <div className="h-3 w-14 bg-white/[0.05] rounded" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden md:flex flex-col items-end gap-1">
                            <div className="h-3 w-20 bg-white/[0.06] rounded-md" />
                            <div className="h-2.5 w-14 bg-white/[0.04] rounded-md" />
                        </div>
                        <div className="h-7 w-20 bg-white/[0.08] rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
};
