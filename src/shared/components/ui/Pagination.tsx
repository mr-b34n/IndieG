import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from '@/shared/hooks/useTranslate';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    itemsPerPage?: number;
    className?: string;
    showSummary?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
    className = '',
    showSummary = true,
}) => {
    const { t } = useTranslation();

    if (totalPages <= 1) return null;

    // Generate page numbers array with smart ellipsis
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                end = 4;
            } else if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
            }

            if (start > 2) {
                pages.push('...');
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) {
                pages.push('...');
            }

            pages.push(totalPages);
        }

        return pages;
    };

    const startItem = itemsPerPage && totalItems ? (currentPage - 1) * itemsPerPage + 1 : undefined;
    const endItem = itemsPerPage && totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : undefined;

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-divider-primary select-none ${className}`}>
            {/* Info Summary */}
            {showSummary && totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
                <div className="text-xs text-text-muted font-mono font-medium">
                    Showing <span className="text-text font-bold">{startItem}–{endItem}</span> of <span className="text-text font-bold">{totalItems}</span>
                </div>
            ) : (
                <div className="text-xs text-text-muted font-mono font-medium">
                    {t('pagination.pageSummary', { page: currentPage, totalPages })}
                </div>
            )}

            {/* Editorial Pagination Controls */}
            <div className="flex items-center gap-1.5 text-xs font-semibold">
                {/* Prev Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1.5 rounded-[4px] flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-text hover:bg-surface-hover/70 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
                    <span>Previous</span>
                </button>

                {/* Number Buttons */}
                <div className="flex items-center gap-1">
                    {getPageNumbers().map((p, idx) => {
                        if (typeof p === 'string') {
                            return (
                                <span key={`ellipsis-${idx}`} className="w-7 h-7 flex items-center justify-center text-xs text-text-faint font-mono">
                                    •••
                                </span>
                            );
                        }

                        const isCurrent = p === currentPage;

                        return (
                            <button
                                key={`page-${p}`}
                                type="button"
                                onClick={() => onPageChange(p)}
                                className={`w-7 h-7 rounded-[4px] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center font-mono ${
                                    isCurrent
                                        ? 'bg-primary text-white font-black'
                                        : 'text-text-muted hover:text-text hover:bg-surface-hover/70'
                                }`}
                            >
                                {p}
                            </button>
                        );
                    })}
                </div>

                {/* Next Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1.5 rounded-[4px] flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-text hover:bg-surface-hover/70 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                    <span>Next</span>
                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                </button>
            </div>
        </div>
    );
};
