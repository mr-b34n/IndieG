import React from 'react';
import {
    Bug,
    Sparkle as Sparkles,
    CheckCircle as CheckCircle2,
    WarningCircle as AlertCircle,
    CircleNotch as Loader2,
    PaperPlaneRight as Send,
    Clock,
} from '@phosphor-icons/react';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import type { FeedbackDto } from '@/shared/api/types';

interface FeedbackSettingsTabProps {
    feedbackType: "bug" | "idea";
    feedbackTitle: string;
    feedbackDescription: string;
    isSubmittingFeedback: boolean;
    isFeedbackSuccess: boolean;
    feedbackError?: string | null;
    myFeedbacks?: FeedbackDto[];
    isLoadingMyFeedbacks?: boolean;
    onFeedbackTypeChange: (type: "bug" | "idea") => void;
    onFeedbackTitleChange: (val: string) => void;
    onFeedbackDescriptionChange: (val: string) => void;
    onSubmitFeedback: (e: React.FormEvent) => void;
}

export function FeedbackSettingsTab({
    feedbackType,
    feedbackTitle,
    feedbackDescription,
    isSubmittingFeedback,
    isFeedbackSuccess,
    feedbackError,
    myFeedbacks = [],
    isLoadingMyFeedbacks = false,
    onFeedbackTypeChange,
    onFeedbackTitleChange,
    onFeedbackDescriptionChange,
    onSubmitFeedback,
}: FeedbackSettingsTabProps) {
    const { t } = useTranslation();

    const getStatusBadge = (status: FeedbackDto["status"]) => {
        switch (status) {
            case "resolved":
                return {
                    label: t('settings.feedback.statusResolved', { defaultValue: 'Đã xử lý' }),
                    className: 'bg-emerald-500/15 text-emerald-400',
                };
            case "reviewed":
                return {
                    label: t('settings.feedback.statusReviewed', { defaultValue: 'Đang xem xét' }),
                    className: 'bg-amber-500/15 text-amber-400',
                };
            default:
                return {
                    label: t('settings.feedback.statusOpen', { defaultValue: 'Đã tiếp nhận' }),
                    className: 'bg-primary/15 text-primary',
                };
        }
    };

    return (
        <div className="space-y-8 animate-tab-enter">
            {/* Success Notification */}
            {isFeedbackSuccess && (
                <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-3 animate-fade-in shadow-xs">
                    <CheckCircle2 className="size-5 shrink-0" />
                    <div>
                        <div className="font-bold">{t('settings.feedback.successHeader', { defaultValue: 'Gửi phản hồi thành công!' })}</div>
                        <div className="text-[11px] font-normal text-emerald-300 mt-0.5">
                            {t('settings.feedback.successMsg', { defaultValue: 'Cảm ơn bạn! Đội ngũ phát triển đã tiếp nhận và sẽ xem xét ý kiến của bạn.' })}
                        </div>
                    </div>
                </div>
            )}

            {/* Error Notification */}
            {feedbackError && (
                <div className="p-4 bg-rose-500/10 text-rose-400 rounded-2xl text-xs font-bold flex items-center gap-3 animate-fade-in shadow-xs">
                    <AlertCircle className="size-5 shrink-0" />
                    <span>{feedbackError}</span>
                </div>
            )}

            <form onSubmit={onSubmitFeedback} className="space-y-5 max-w-2xl">
                {/* Feedback Type Toggle */}
                <div className="space-y-2">
                    <label className="text-xs font-extrabold text-text uppercase tracking-wider block">
                        {t('settings.feedback.typeLabel', { defaultValue: 'Loại phản hồi' })}
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Bug */}
                        <button
                            type="button"
                            onClick={() => onFeedbackTypeChange("bug")}
                            className={cn(
                                "p-3.5 rounded-2xl text-left transition-all duration-150 cursor-pointer flex items-center gap-3.5 select-none",
                                feedbackType === "bug"
                                    ? "bg-surface-inner ring-2 ring-rose-500 text-rose-400 shadow-md shadow-rose-500/10"
                                    : "bg-surface-inner/80 hover:bg-surface-hover text-text-muted hover:text-text shadow-xs"
                            )}
                        >
                            <div
                                className={cn(
                                    "size-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
                                    feedbackType === "bug"
                                        ? "bg-rose-500 text-white"
                                        : "bg-surface text-text-muted"
                                )}
                            >
                                <Bug className="size-4.5" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-text">
                                    {t('settings.feedback.bugOption', { defaultValue: 'Báo lỗi kỹ thuật (Bug)' })}
                                </div>
                                <div className="text-[11px] text-text-muted mt-0.5 truncate">
                                    {t('settings.feedback.bugDesc', { defaultValue: 'Lỗi hiển thị, lỗi tính năng hoặc giật lag' })}
                                </div>
                            </div>
                        </button>

                        {/* Idea */}
                        <button
                            type="button"
                            onClick={() => onFeedbackTypeChange("idea")}
                            className={cn(
                                "p-3.5 rounded-2xl text-left transition-all duration-150 cursor-pointer flex items-center gap-3.5 select-none",
                                feedbackType === "idea"
                                    ? "bg-surface-inner ring-2 ring-primary text-primary shadow-md shadow-primary/10"
                                    : "bg-surface-inner/80 hover:bg-surface-hover text-text-muted hover:text-text shadow-xs"
                            )}
                        >
                            <div
                                className={cn(
                                    "size-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
                                    feedbackType === "idea"
                                        ? "bg-primary text-white"
                                        : "bg-surface text-text-muted"
                                )}
                            >
                                <Sparkles className="size-4.5" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-text">
                                    {t('settings.feedback.ideaOption', { defaultValue: 'Đóng góp ý tưởng (Idea)' })}
                                </div>
                                <div className="text-[11px] text-text-muted mt-0.5 truncate">
                                    {t('settings.feedback.ideaDesc', { defaultValue: 'Đề xuất tính năng mới, cải tiến trải nghiệm' })}
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-text uppercase tracking-wider block">
                        {t('settings.feedback.titleLabel', { defaultValue: 'Tiêu đề tóm tắt' })}
                    </label>
                    <input
                        type="text"
                        required
                        value={feedbackTitle}
                        onChange={(e) => onFeedbackTitleChange(e.target.value)}
                        placeholder={
                            feedbackType === "bug"
                                ? t('settings.feedback.bugPlaceholder', { defaultValue: 'Ví dụ: Lỗi không hiển thị nút lưu trong trang cài đặt...' })
                                : t('settings.feedback.ideaPlaceholder', { defaultValue: 'Ví dụ: Ý tưởng thêm tính năng hiển thị thời gian chơi game...' })
                        }
                        className="w-full bg-surface-inner rounded-xl px-4 py-2.5 text-xs text-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary shadow-xs transition-colors"
                    />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold text-text uppercase tracking-wider block">
                            {t('settings.feedback.contentLabel', { defaultValue: 'Nội dung chi tiết' })}
                        </label>
                        <span className="text-[11px] text-text-muted">
                            {t('settings.feedback.charCount', { count: feedbackDescription.length, defaultValue: `${feedbackDescription.length} ký tự` })}
                        </span>
                    </div>
                    <textarea
                        rows={5}
                        required
                        value={feedbackDescription}
                        onChange={(e) => onFeedbackDescriptionChange(e.target.value)}
                        placeholder={t('settings.feedback.contentPlaceholder', { defaultValue: 'Mô tả cụ thể các bước tái hiện lỗi hoặc chi tiết ý tưởng của bạn...' })}
                        className="w-full bg-surface-inner rounded-xl p-4 text-xs text-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary shadow-xs transition-colors resize-y leading-relaxed"
                    />
                </div>

                {/* Submit button */}
                <Button
                    type="submit"
                    disabled={isSubmittingFeedback || feedbackTitle.trim().length < 4 || feedbackDescription.trim().length < 10}
                    className="w-full sm:w-auto px-6 py-2.5 font-bold shadow-md shadow-primary/25 bg-primary hover:bg-primary-hover text-white"
                >
                    {isSubmittingFeedback ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            <span>{t('settings.feedback.submitting', { defaultValue: 'Đang gửi...' })}</span>
                        </>
                    ) : (
                        <>
                            <Send className="size-4" />
                            <span>{t('settings.feedback.submitBtn', { defaultValue: 'Gửi phản hồi đến BQT' })}</span>
                        </>
                    )}
                </Button>
            </form>

            {/* User's Submitted Feedback History */}
            {(isLoadingMyFeedbacks || myFeedbacks.length > 0) && (
                <div className="pt-6 border-t border-border/50 max-w-2xl space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-text">
                            {t('settings.feedback.historyTitle', { defaultValue: 'Phản hồi đã gửi của bạn' })} ({myFeedbacks.length})
                        </h3>
                        {isLoadingMyFeedbacks && <Loader2 className="size-3.5 animate-spin text-primary" />}
                    </div>

                    <div className="space-y-2.5">
                        {myFeedbacks.map((fb) => {
                            const badge = getStatusBadge(fb.status);
                            return (
                                <div
                                    key={fb.id}
                                    className="p-4 rounded-2xl bg-surface-inner space-y-1.5 shadow-xs"
                                >
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span
                                                className={cn(
                                                    "px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase shrink-0",
                                                    fb.type === "bug"
                                                        ? "bg-rose-500/15 text-rose-400"
                                                        : "bg-primary/15 text-primary"
                                                )}
                                            >
                                                {fb.type === "bug" ? "Bug" : "Idea"}
                                            </span>
                                            <span className="text-xs font-bold text-text truncate">
                                                {fb.title}
                                            </span>
                                        </div>

                                        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0", badge.className)}>
                                            {badge.label}
                                        </span>
                                    </div>

                                    <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                                        {fb.description}
                                    </p>

                                    {fb.adminNote && (
                                        <div className="mt-1.5 p-2.5 rounded-xl bg-surface text-[11px] text-text-muted">
                                            <span className="font-bold text-primary">BQT: </span>
                                            {fb.adminNote}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1 text-[10px] text-text-faint pt-0.5">
                                        <Clock className="size-3" />
                                        <span>{new Date(fb.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
