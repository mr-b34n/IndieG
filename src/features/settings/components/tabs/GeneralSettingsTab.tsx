import {
    Monitor,
    Moon,
    Sun,
    CheckCircle2,
} from 'lucide-react';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { cn } from '@/shared/utils/cn';

interface GeneralSettingsTabProps {
    theme: string;
    themeMode: 'auto' | 'dark' | 'light';
    language: string;
    onUpdateTheme: (mode: 'auto' | 'dark' | 'light') => void;
    onToggleLanguage: () => void;
}

export function GeneralSettingsTab({
    theme,
    themeMode,
    language,
    onUpdateTheme,
    onToggleLanguage,
}: GeneralSettingsTabProps) {
    const { t } = useTranslation();

    const themeOptions = [
        {
            id: 'auto' as const,
            label: t('settings.general.autoMode', { defaultValue: 'Tự động' }),
            shortDesc: `${t('settings.general.autoModeShortDesc', { defaultValue: 'Đồng bộ thiết bị' })} (${theme === 'dark' ? 'Dark' : 'Light'})`,
            icon: Monitor,
            preview: (
                <div className="w-full h-22 rounded-xl overflow-hidden flex shadow-md relative select-none">
                    <div className="w-1/2 h-full bg-[#050607] p-2.5 flex flex-col justify-between">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <div className="w-8 h-1.5 rounded-full bg-primary/40" />
                        </div>
                        <div className="space-y-1.5 p-1 rounded bg-[#121518]">
                            <div className="w-full h-1.5 rounded-full bg-white/30" />
                            <div className="w-2/3 h-1.5 rounded-full bg-white/15" />
                        </div>
                    </div>
                    <div className="w-1/2 h-full bg-[#F1F5F9] p-2.5 flex flex-col justify-between border-l border-slate-300">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <div className="w-8 h-1.5 rounded-full bg-primary" />
                        </div>
                        <div className="space-y-1.5 p-1 rounded bg-white shadow-xs">
                            <div className="w-full h-1.5 rounded-full bg-slate-500" />
                            <div className="w-2/3 h-1.5 rounded-full bg-slate-400" />
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: 'dark' as const,
            label: t('settings.general.darkMode', { defaultValue: 'Chế độ tối (Dark)' }),
            shortDesc: t('settings.general.darkModeShortDesc', { defaultValue: 'Bảo vệ mắt, tối ưu ban đêm' }),
            icon: Moon,
            preview: (
                <div className="w-full h-22 rounded-xl overflow-hidden bg-[#000000] p-2.5 flex flex-col justify-between shadow-md select-none">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <div className="w-10 h-1.5 rounded-full bg-primary/50" />
                        </div>
                        <span className="size-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20" />
                    </div>
                    <div className="space-y-1.5 p-2 rounded-lg bg-[#121518]">
                        <div className="w-full h-1.5 rounded-full bg-white/40" />
                        <div className="w-3/5 h-1.5 rounded-full bg-primary/40" />
                    </div>
                </div>
            ),
        },
        {
            id: 'light' as const,
            label: t('settings.general.lightMode', { defaultValue: 'Chế độ sáng (Light)' }),
            shortDesc: t('settings.general.lightModeShortDesc', { defaultValue: 'Giao diện truyền thống ban ngày' }),
            icon: Sun,
            preview: (
                <div className="w-full h-22 rounded-xl overflow-hidden bg-[#F8FAFC] p-2.5 flex flex-col justify-between shadow-md select-none border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#0076db]" />
                            <div className="w-10 h-1.5 rounded-full bg-[#0076db]" />
                        </div>
                        <span className="size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-600/20" />
                    </div>
                    <div className="space-y-1.5 p-2 rounded-lg bg-white shadow-xs">
                        <div className="w-full h-1.5 rounded-full bg-slate-700" />
                        <div className="w-3/5 h-1.5 rounded-full bg-primary/40" />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-8 animate-tab-enter">
            {/* Theme Section */}
            <div className="space-y-3.5">
                <div>
                    <h3 className="text-xs font-extrabold text-text uppercase tracking-wider">
                        {t('settings.general.appearance', { defaultValue: 'Chủ đề giao diện' })}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                        {t('settings.general.appearanceDesc', { defaultValue: 'Chọn chế độ màu sắc phù hợp với môi trường ánh sáng và thói quen của bạn.' })}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {themeOptions.map((opt) => {
                        const isSelected = themeMode === opt.id;
                        const Icon = opt.icon;

                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => onUpdateTheme(opt.id)}
                                className={cn(
                                    "p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative select-none group",
                                    isSelected
                                        ? "bg-surface-inner ring-2 ring-primary text-text shadow-lg shadow-primary/10"
                                        : "bg-surface-inner/80 hover:bg-surface-hover text-text-muted hover:text-text shadow-sm"
                                )}
                            >
                                {opt.preview}

                                <div className="space-y-1 w-full pt-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Icon className={cn("size-4", isSelected ? "text-primary" : "text-text-muted")} />
                                            <span className={cn("text-xs font-bold", isSelected ? "text-text" : "text-text-muted group-hover:text-text")}>
                                                {opt.label}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <CheckCircle2 className="size-4 text-primary shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-[11px] text-text-muted leading-relaxed">
                                        {opt.shortDesc}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Language Section */}
            <div className="space-y-3.5">
                <div>
                    <h3 className="text-xs font-extrabold text-text uppercase tracking-wider">
                        {t('settings.general.languageLabel', { defaultValue: 'Ngôn ngữ hiển thị' })}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                        {t('settings.general.languageDesc', { defaultValue: 'Lựa chọn ngôn ngữ sử dụng xuyên suốt toàn bộ nền tảng Ludon.' })}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Vietnamese */}
                    <button
                        type="button"
                        onClick={() => {
                            if (language !== 'vi') onToggleLanguage();
                        }}
                        className={cn(
                            "p-4 rounded-2xl flex items-center justify-between transition-all duration-150 cursor-pointer text-left select-none",
                            language === 'vi'
                                ? "bg-surface-inner ring-2 ring-primary text-text shadow-lg shadow-primary/10"
                                : "bg-surface-inner/80 hover:bg-surface-hover text-text-muted hover:text-text shadow-sm"
                        )}
                    >
                        <div className="flex items-center gap-3.5 min-w-0">
                            <span className="text-2xl drop-shadow-xs">🇻🇳</span>
                            <div className="min-w-0">
                                <div className={cn("text-xs font-bold", language === 'vi' ? "text-text" : "text-text-muted")}>
                                    {t('settings.general.langVi', { defaultValue: 'Tiếng Việt' })}
                                </div>
                                <div className="text-[11px] text-text-muted mt-0.5">
                                    {t('settings.general.langViDesc', { defaultValue: 'Vietnamese (Mặc định)' })}
                                </div>
                            </div>
                        </div>

                        {language === 'vi' ? (
                            <CheckCircle2 className="size-5 text-primary shrink-0" />
                        ) : (
                            <span className="text-[11px] font-semibold text-text-muted px-2.5 py-1 rounded-lg bg-surface hover:text-text">
                                {t('settings.general.selectLang', { defaultValue: 'Chọn' })}
                            </span>
                        )}
                    </button>

                    {/* English */}
                    <button
                        type="button"
                        onClick={() => {
                            if (language !== 'en') onToggleLanguage();
                        }}
                        className={cn(
                            "p-4 rounded-2xl flex items-center justify-between transition-all duration-150 cursor-pointer text-left select-none",
                            language === 'en'
                                ? "bg-surface-inner ring-2 ring-primary text-text shadow-lg shadow-primary/10"
                                : "bg-surface-inner/80 hover:bg-surface-hover text-text-muted hover:text-text shadow-sm"
                        )}
                    >
                        <div className="flex items-center gap-3.5 min-w-0">
                            <span className="text-2xl drop-shadow-xs">🇺🇸</span>
                            <div className="min-w-0">
                                <div className={cn("text-xs font-bold", language === 'en' ? "text-text" : "text-text-muted")}>
                                    {t('settings.general.langEn', { defaultValue: 'English' })}
                                </div>
                                <div className="text-[11px] text-text-muted mt-0.5">
                                    {t('settings.general.langEnDesc', { defaultValue: 'English (Quốc tế)' })}
                                </div>
                            </div>
                        </div>

                        {language === 'en' ? (
                            <CheckCircle2 className="size-5 text-primary shrink-0" />
                        ) : (
                            <span className="text-[11px] font-semibold text-text-muted px-2.5 py-1 rounded-lg bg-surface hover:text-text">
                                {t('settings.general.selectLang', { defaultValue: 'Chọn' })}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
