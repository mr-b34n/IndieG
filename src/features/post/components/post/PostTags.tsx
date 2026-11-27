import React, { memo } from "react";

export interface PostTagsProps {
    tags?: string[];
    onTagClick?: (tag: string, e: React.MouseEvent) => void;
}

export const PostTags = memo(({ tags, onTagClick }: PostTagsProps) => {
    if (!tags || tags.length === 0) return null;

    const displayTags = tags.slice(0, 5);

    return (
        <div className="flex flex-row gap-2 flex-wrap mb-4">
            {displayTags.map((tag, idx) => (
                <span
                    key={`${tag}-${idx}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onTagClick?.(tag, e);
                    }}
                    className="text-xs text-primary font-medium hover:underline cursor-pointer"
                >
                    #{tag.replace(/^#/, '')}
                </span>
            ))}
        </div>
    );
});
