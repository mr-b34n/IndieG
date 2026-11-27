import React from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";

export const GameCardSkeleton: React.FC = () => {
    return (
        <div className="relative w-full flex flex-col rounded-xl bg-surface-inner/60 p-2.5 sm:p-3 animate-fade-in">
            {/* 1. Artwork Skeleton (16:9 Aspect Ratio) */}
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg">
                <Skeleton className="w-full h-full rounded-lg" />
                {/* Floating badge skeleton */}
                <div className="absolute top-2 right-2">
                    <Skeleton className="h-5 w-12 rounded-md" />
                </div>
            </div>

            {/* 2. Content Skeleton */}
            <div className="pt-2.5 px-0.5 flex flex-col justify-between flex-1 gap-2.5">
                <div className="flex flex-col gap-2">
                    {/* Developer & Year */}
                    <Skeleton className="h-3 w-28 rounded" />

                    {/* Title */}
                    <Skeleton className="h-4.5 w-3/4 rounded-md" />

                    {/* Tags */}
                    <div className="flex items-center gap-2 pt-0.5">
                        <Skeleton className="h-3 w-16 rounded" />
                        <Skeleton className="h-3 w-14 rounded" />
                    </div>

                    {/* Description 2 lines */}
                    <div className="flex flex-col gap-1.5 pt-1">
                        <Skeleton className="h-3 w-full rounded" />
                        <Skeleton className="h-3 w-4/5 rounded" />
                    </div>
                </div>

                {/* 3. Footer Skeleton */}
                <div className="pt-2 mt-auto flex items-center justify-between gap-2">
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-6 w-22 rounded-full" />
                </div>
            </div>
        </div>
    );
};

export const GameGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
    return (
        <div className="w-full pb-16 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {Array.from({ length: count }).map((_, idx) => (
                    <GameCardSkeleton key={`game-skel-${idx}`} />
                ))}
            </div>
        </div>
    );
};
