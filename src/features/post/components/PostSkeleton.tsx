import React from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";

export const PostSkeleton: React.FC = () => {
    return (
        <div className="w-full flex flex-col p-4 sm:p-5 rounded-2xl bg-surface-inner/50 gap-3.5 animate-fade-in select-none">
            {/* Header: Avatar, Author, Community & Time */}
            <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-3.5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-44 rounded" />
                </div>
                <Skeleton className="h-6 w-6 rounded-md shrink-0" />
            </div>

            {/* Post Title */}
            <Skeleton className="h-5 w-4/5 rounded-md" />

            {/* Post Content Lines */}
            <div className="flex flex-col gap-2">
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-11/12 rounded" />
                <Skeleton className="h-3.5 w-3/4 rounded" />
            </div>

            {/* Optional Media Preview Skeleton */}
            <Skeleton className="w-full h-48 sm:h-64 rounded-xl" />

            {/* Footer Action Bar */}
            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                    {/* Vote pill */}
                    <Skeleton className="h-8 w-24 rounded-full" />
                    {/* Comment pill */}
                    <Skeleton className="h-8 w-20 rounded-full" />
                </div>
                {/* Share / Bookmark */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
        </div>
    );
};

export const FeedListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
    return (
        <div className="w-full flex flex-col gap-4 animate-fade-in">
            {Array.from({ length: count }).map((_, idx) => (
                <PostSkeleton key={`feed-skel-${idx}`} />
            ))}
        </div>
    );
};
