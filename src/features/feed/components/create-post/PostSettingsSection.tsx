import React, { useState } from "react";
import { AppIcon as FontAwesomeIcon } from "@/shared/components/ui/Icon";
import { CaretDown as faChevronDown } from "@phosphor-icons/react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { MiniToggle } from "./MiniToggle";

export interface PostSettingsSectionProps {
    allowComments: boolean;
    onAllowCommentsChange: (v: boolean) => void;
    pinned: boolean;
    onPinnedChange: (v: boolean) => void;
    isSpoiler: boolean;
    onSpoilerChange: (v: boolean) => void;
    isNsfw: boolean;
    onNsfwChange: (v: boolean) => void;
}

export const PostSettingsSection: React.FC<PostSettingsSectionProps> = ({
    allowComments,
    onAllowCommentsChange,
    pinned,
    onPinnedChange,
    isSpoiler,
    onSpoilerChange,
    isNsfw,
    onNsfwChange,
}) => {
    const { t, language } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const hasActiveModifiers = pinned || isSpoiler || isNsfw || !allowComments;

    return (
        <div className="pt-3 border-t border-white/[0.06] shrink-0">
            {/* Single-line lightweight trigger */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text transition-colors select-none cursor-pointer py-1"
                >
                    <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`text-[9px] text-text-faint transition-transform duration-150 ${
                            isOpen ? "rotate-180 text-primary" : ""
                        }`}
                    />
                    <span>{t('feed.postSettings', { defaultValue: 'Tùy chọn bài viết' })}</span>

                    {/* Subtle inline summary badges when collapsed */}
                    {hasActiveModifiers && !isOpen && (
                        <span className="flex items-center gap-1.5 ml-2">
                            {!allowComments && (
                                <span className="text-[10px] text-text-faint font-medium bg-white/[0.04] px-1.5 py-0.2 rounded">
                                    {language === "vi" ? "Tắt bình luận" : "Comments off"}
                                </span>
                            )}
                            {isSpoiler && (
                                <span className="text-[10px] text-amber-400 font-medium bg-amber-400/10 px-1.5 py-0.2 rounded">
                                    Spoiler
                                </span>
                            )}
                            {isNsfw && (
                                <span className="text-[10px] text-rose-400 font-medium bg-rose-400/10 px-1.5 py-0.2 rounded">
                                    18+ NSFW
                                </span>
                            )}
                            {pinned && (
                                <span className="text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.2 rounded">
                                    {language === "vi" ? "Ghim" : "Pinned"}
                                </span>
                            )}
                        </span>
                    )}
                </button>
            </div>

            {/* Expanded lightweight settings: No card backgrounds, no borders, order: Allow comments, Spoiler, NSFW, Pin post */}
            {isOpen && (
                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2.5 pb-1 animate-fade-in text-xs">
                    {/* 1. Allow comments */}
                    <div
                        className="flex items-center gap-2.5 cursor-pointer select-none"
                        onClick={() => onAllowCommentsChange(!allowComments)}
                    >
                        <span className="text-xs font-medium text-text-muted hover:text-text transition-colors">
                            {t('feed.allowComments', { defaultValue: 'Cho phép bình luận' })}
                        </span>
                        <MiniToggle
                            checked={allowComments}
                            onChange={onAllowCommentsChange}
                            ariaLabel={t('feed.allowComments', { defaultValue: 'Cho phép bình luận' })}
                        />
                    </div>

                    {/* 2. Spoiler */}
                    <div
                        className="flex items-center gap-2.5 cursor-pointer select-none"
                        onClick={() => onSpoilerChange(!isSpoiler)}
                    >
                        <span className="text-xs font-medium text-text-muted hover:text-text transition-colors">
                            {t('feed.warningSpoiler', { defaultValue: 'Cảnh báo Spoiler' })}
                        </span>
                        <MiniToggle
                            checked={isSpoiler}
                            onChange={onSpoilerChange}
                            ariaLabel={t('feed.warningSpoiler', { defaultValue: 'Cảnh báo Spoiler' })}
                        />
                    </div>

                    {/* 3. NSFW */}
                    <div
                        className="flex items-center gap-2.5 cursor-pointer select-none"
                        onClick={() => onNsfwChange(!isNsfw)}
                    >
                        <span className="text-xs font-medium text-text-muted hover:text-text transition-colors">
                            {t('feed.warningNsfw', { defaultValue: 'Cảnh báo 18+ (NSFW)' })}
                        </span>
                        <MiniToggle
                            checked={isNsfw}
                            onChange={onNsfwChange}
                            ariaLabel={t('feed.warningNsfw', { defaultValue: 'Cảnh báo 18+ (NSFW)' })}
                        />
                    </div>

                    {/* 4. Pin post */}
                    <div
                        className="flex items-center gap-2.5 cursor-pointer select-none"
                        onClick={() => onPinnedChange(!pinned)}
                    >
                        <span className="text-xs font-medium text-text-muted hover:text-text transition-colors">
                            {t('feed.pinPost', { defaultValue: 'Ghim bài viết' })}
                        </span>
                        <MiniToggle
                            checked={pinned}
                            onChange={onPinnedChange}
                            ariaLabel={t('feed.pinPost', { defaultValue: 'Ghim bài viết' })}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
