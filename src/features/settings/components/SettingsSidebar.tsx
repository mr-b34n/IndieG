import { ChevronRight } from 'lucide-react';
import type { NavTabItem, SettingsTab } from '../types';
import { cn } from '@/shared/utils/cn';

export type { NavTabItem };

interface SettingsSidebarProps {
    tabs: NavTabItem[];
    activeTab: SettingsTab;
    onTabChange: (tab: SettingsTab) => void;
}

export function SettingsSidebar({
    tabs,
    activeTab,
    onTabChange,
}: SettingsSidebarProps) {
    return (
        <>
            {/* Mobile / Tablet: Smooth Horizontal Pill Scrollbar */}
            <nav
                aria-label="Settings mobile navigation"
                className="lg:hidden w-full overflow-x-auto scrollbar-none pb-2 -mx-2 px-2 flex items-center gap-1.5"
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-2 cursor-pointer shrink-0 select-none",
                                isActive
                                    ? "bg-primary text-white shadow-md shadow-primary/25"
                                    : "bg-surface-inner hover:bg-surface-hover text-text-muted hover:text-text"
                            )}
                        >
                            <Icon className={cn("size-3.5 shrink-0", isActive ? "text-white" : "text-text-muted")} />
                            <span>{tab.label}</span>
                            {tab.badge !== undefined && (
                                <span
                                    className={cn(
                                        "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                                        isActive
                                            ? "bg-white/25 text-white"
                                            : "bg-surface text-text-faint"
                                    )}
                                >
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Desktop: Borderless, Flat, Segmented 6-Tab Navigation List */}
            <aside
                aria-label="Settings desktop navigation"
                className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 select-none sticky top-20 space-y-1"
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer text-left group select-none",
                                isActive
                                    ? "bg-surface text-text font-bold shadow-sm"
                                    : "text-text-muted hover:text-text hover:bg-surface/80"
                            )}
                        >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div
                                    className={cn(
                                        "size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                        isActive
                                            ? "bg-primary text-white shadow-sm shadow-primary/30"
                                            : "bg-surface-inner text-text-muted group-hover:text-text group-hover:bg-surface-hover"
                                    )}
                                >
                                    <Icon className="size-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div
                                        className={cn(
                                            "text-xs font-bold tracking-tight truncate leading-tight",
                                            isActive
                                                ? "text-text"
                                                : "text-text-muted group-hover:text-text"
                                        )}
                                    >
                                        {tab.label}
                                    </div>
                                    <div className="text-[10px] text-text-faint truncate mt-0.5 leading-tight">
                                        {tab.desc}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                {tab.badge !== undefined && (
                                    <span
                                        className={cn(
                                            "px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none",
                                            isActive
                                                ? "bg-primary/20 text-primary"
                                                : "bg-surface-inner text-text-faint"
                                        )}
                                    >
                                        {tab.badge}
                                    </span>
                                )}

                                <ChevronRight
                                    className={cn(
                                        "size-3.5 transition-transform duration-150",
                                        isActive
                                            ? "text-primary"
                                            : "text-text-faint/40 group-hover:text-text-muted group-hover:translate-x-0.5"
                                    )}
                                />
                            </div>
                        </button>
                    );
                })}
            </aside>
        </>
    );
}
