import React, { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { getInitialLetter, isRealAvatarUrl, getAvatarTintClass } from "./avatarUtils";

export { getInitialLetter, isRealAvatarUrl, getAvatarTintClass };

export interface UserAvatarProps {
    src?: string | null;
    name?: string | null;
    alt?: string;
    className?: string;
    textClassName?: string;
    loading?: "lazy" | "eager";
    onClick?: React.MouseEventHandler<HTMLElement>;
}

/**
 * Unified user avatar across the entire app.
 * Automatically renders a circular initial badge whenever a user has no avatar,
 * only a legacy placeholder URL, or when the image fails to load.
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
    src,
    name,
    alt,
    className = "w-9 h-9",
    textClassName = "text-xs",
    loading = "lazy",
    onClick,
}) => {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const displayName = name || alt || "";
    const showImage = isRealAvatarUrl(src) && failedSrc !== src;

    if (showImage) {
        return (
            <img
                src={src}
                alt={alt || displayName || "User"}
                loading={loading}
                decoding="async"
                onClick={onClick}
                onError={() => setFailedSrc(src)}
                className={cn("rounded-full object-cover shrink-0", className)}
            />
        );
    }

    return (
        <div
            role="img"
            aria-label={alt || displayName || "User"}
            onClick={onClick}
            className={cn(
                "rounded-full shrink-0 inline-flex items-center justify-center font-bold uppercase select-none",
                getAvatarTintClass(displayName),
                className,
                textClassName
            )}
        >
            {getInitialLetter(displayName)}
        </div>
    );
};
