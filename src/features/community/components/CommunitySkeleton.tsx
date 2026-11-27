import React from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";

export const CommunityGridSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 animate-fade-in">
            {Array.from({ length: count }).map((_, idx) => (
                <div
                    key={`comm-grid-skel-${idx}`}
                    className="w-full flex flex-col rounded-2xl bg-surface-inner/60 p-2.5 sm:p-3"
                >
                    {/* Inset Banner Skeleton */}
                    <Skeleton className="w-full aspect-[16/9] rounded-xl relative" />

                    {/* Content Skeleton */}
                    <div className="pt-2.5 px-0.5 flex flex-col justify-between gap-2.5 flex-1">
                        <div className="flex flex-col gap-1.5">
                            <Skeleton className="h-4 w-3/4 rounded-md" />
                            <div className="flex gap-2 pt-0.5">
                                <Skeleton className="h-3 w-16 rounded" />
                                <Skeleton className="h-3 w-12 rounded" />
                            </div>
                        </div>

                        <div className="pt-2 mt-auto flex items-center justify-between gap-2">
                            <Skeleton className="h-3 w-28 rounded-md" />
                            <Skeleton className="h-7 w-20 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const CommunityListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
    return (
        <div className="flex flex-col gap-1.5 animate-fade-in">
            {Array.from({ length: count }).map((_, idx) => (
                <div
                    key={`comm-list-skel-${idx}`}
                    className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-inner/60"
                >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <Skeleton className="h-3.5 w-32 rounded-md" />
                            <div className="flex gap-2">
                                <Skeleton className="h-3 w-16 rounded" />
                                <Skeleton className="h-3 w-14 rounded" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden md:flex flex-col items-end gap-1">
                            <Skeleton className="h-3 w-20 rounded-md" />
                            <Skeleton className="h-2.5 w-14 rounded-md" />
                        </div>
                        <Skeleton className="h-7 w-20 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
};
