import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

export interface CategoryItem {
    id: string;
    titleVi: string;
    titleEn: string;
    descVi: string;
    descEn: string;
    threadsCount: string;
    icon: IconDefinition;
}

interface CommunityHubCategoriesProps {
    categories: CategoryItem[];
    activeCategory: string | null;
    onSelectCategory: (catId: string | null) => void;
    isVi: boolean;
}

export const CommunityHubCategories = ({
    categories,
    activeCategory,
    onSelectCategory,
    isVi,
}: CommunityHubCategoriesProps) => {
    return (
        <div className="w-full flex flex-col gap-3 select-none">
            {/* Section Title */}
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-faint">
                    CATEGORIES
                </span>
                {activeCategory && (
                    <button
                        type="button"
                        onClick={() => onSelectCategory(null)}
                        className="text-xs text-primary hover:underline cursor-pointer font-semibold"
                    >
                        {isVi ? "Tất cả danh mục" : "Show all"}
                    </button>
                )}
            </div>

            {/* Forum Index Style Grid (No Outer Box, Subtle Hover) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {categories.map((cat) => {
                    const isSelected = activeCategory === cat.id;
                    return (
                        <div
                            key={cat.id}
                            onClick={() => onSelectCategory(isSelected ? null : cat.id)}
                            className={`p-3 rounded-[4px] transition-colors cursor-pointer flex items-start gap-3 border ${
                                isSelected
                                    ? "bg-primary/10 border-primary/40 text-primary"
                                    : "bg-surface/50 border-transparent hover:bg-surface-hover hover:border-divider-primary/40 text-text"
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-[4px] flex items-center justify-center text-xs shrink-0 ${
                                isSelected ? "bg-primary text-white" : "bg-surface-inner text-text-muted"
                            }`}>
                                <FontAwesomeIcon icon={cat.icon} />
                            </div>

                            <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-xs uppercase tracking-tight truncate">
                                        {isVi ? cat.titleVi : cat.titleEn}
                                    </span>
                                    <span className="text-[10px] font-mono text-text-faint font-semibold shrink-0">
                                        {cat.threadsCount}
                                    </span>
                                </div>
                                <span className="text-[11px] text-text-muted leading-tight truncate mt-0.5">
                                    {isVi ? cat.descVi : cat.descEn}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
