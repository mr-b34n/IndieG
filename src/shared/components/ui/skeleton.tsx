import React from "react";
import { cn } from "@/shared/utils/cn";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
    return (
        <div
            className={cn("skeleton-fb rounded-md", className)}
            aria-hidden="true"
            {...props}
        />
    );
};
