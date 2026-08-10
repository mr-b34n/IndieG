import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faGear, faUser, faShieldHalved, faGlobe, faBug, faLightbulb, faCheckCircle, faArrowLeft, faBan, faGamepad, faCheck
} from '@fortawesome/free-solid-svg-icons';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { useGameStore } from '@/features/game';
import { INITIAL_GAMES } from '@/features/game/constants';

export const Route = createFileRoute('/_layout/settings/')({
    component: SettingsPage,
});

function SettingsPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState("general");
    const theme = useThemeStore((state) => state.theme);
    const toggleTheme = useThemeStore((state) => state.toggleTheme);
    const language = useThemeStore((state) => state.language);
    const toggleLanguage = useThemeStore((state) => state.toggleLanguage);

    const quickAccessSlugs = useGameStore((state) => state.quickAccessSlugs);
    const setQuickAccessSlugs = useGameStore((state) => state.setQuickAccessSlugs);
    const [tempSelectedSlugs, setTempSelectedSlugs] = useState<string[]>(quickAccessSlugs);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [changePwdState, setChangePwdState] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [changePwdLoading, setChangePwdLoading] = useState(false);
    const [changePwdError, setChangePwdError] = useState<string | null>(null);
    const [changePwdSuccess, setChangePwdSuccess] = useState<string | null>(null);

    const [feedbackType, setFeedbackType] = useState<"bug" | "feedback">("bug");
    const [feedbackTitle, setFeedbackTitle] = useState("");
    const [feedbackDescription, setFeedbackDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChangePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setChangePwdError(null);
        setChangePwdSuccess(null);

        if (!changePwdState.currentPassword) {
            setChangePwdError("Vui lòng nhập mật khẩu hiện tại.");
            return;
        }
        if (changePwdState.newPassword.length < 8) {
            setChangePwdError("Mật khẩu mới phải có ít nhất 8 ký tự.");
            return;
        }
        if (changePwdState.newPassword !== changePwdState.confirmPassword) {
            setChangePwdError("Mật khẩu xác nhận không trùng khớp.");
            return;
        }

        setChangePwdLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 800));
            setChangePwdSuccess("Đổi mật khẩu thành công! Mật khẩu mới của bạn đã có hiệu lực.");
            setChangePwdState({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch {
            setChangePwdError("Không thể cập nhật mật khẩu. Vui lòng thử lại.");
        } finally {
            setChangePwdLoading(false);
        }
    };


    const handleSubmitFeedback = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setFeedbackTitle("");
                setFeedbackDescription("");
            }, 3000);
        }, 1000);
    };

    const handleSaveQuickAccess = () => {
        setQuickAccessSlugs(tempSelectedSlugs);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => navigate({ to: "/" })}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-border text-text-muted hover:text-text hover:bg-surface-hover transition-colors shadow-sm cursor-pointer"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <h1 className="text-2xl font-bold text-text flex items-center gap-3">
                    <FontAwesomeIcon icon={faGear} />
                    {t('settings.title')}
                </h1>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Menu */}
                <div className="w-full md:w-72 shrink-0 flex flex-col gap-2">
                    {[
                        { id: "general", label: t('settings.tabs.general'), icon: faGlobe },
                        { id: "quickAccess", label: t('settings.tabs.quickAccess'), icon: faGamepad },
                        { id: "account", label: t('settings.tabs.account'), icon: faShieldHalved },
                        { id: "blocked", label: t('settings.tabs.blocked'), icon: faBan },
                        { id: "feedback", label: t('settings.tabs.feedback'), icon: faBug },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all text-left cursor-pointer ${
                                activeTab === tab.id
                                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                                    : "bg-surface border border-border text-text-muted hover:bg-surface-hover hover:text-text hover:border-border/80"
                            }`}
                        >
                            <FontAwesomeIcon icon={tab.icon} className={activeTab === tab.id ? "text-white" : "text-text-muted"} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
                        {activeTab === "general" && (
                            <div className="flex flex-col gap-8 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-text mb-4">{t('settings.general.appearance')}</h3>
                                    <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-background">
                                        <div>
                                            <p className="font-semibold text-text">{t('settings.general.darkMode')}</p>
                                            <p className="text-sm text-text-muted mt-1">{t('settings.general.darkModeDesc')}</p>
                                        </div>
                                        <button 
                                            onClick={toggleTheme}
                                            type="button"
                                            aria-label="Toggle theme"
                                            className={`relative w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center cursor-pointer ${
                                                theme === 'dark' 
                                                    ? 'bg-primary' 
                                                    : 'bg-neutral-300 hover:bg-neutral-400/80 dark:bg-neutral-700'
                                            }`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-300 ${
                                                theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                                            }`} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-bold text-text mb-4">{t('settings.general.language')}</h3>
                                    <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-background">
                                        <div>
                                            <p className="font-semibold text-text">{t('settings.general.languageLabel')}</p>
                                            <p className="text-sm text-text-muted mt-1">{t('settings.general.languageDesc')}</p>
                                        </div>
                                        <button 
                                            onClick={toggleLanguage}
                                            className="px-4 py-2 border border-border rounded-lg bg-surface-hover hover:bg-border text-sm font-bold text-text transition-colors cursor-pointer"
                                        >
                                            {t(`settings.general.${language}`)}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "quickAccess" && (
                            <div className="flex flex-col gap-6 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-text mb-2 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faGamepad} className="text-primary" />
                                        <span>{t('settings.quickAccess.title')}</span>
                                    </h3>
                                    <p className="text-text-muted text-sm mb-6">
                                        {t('settings.quickAccess.desc')}
                                    </p>
                                    {saveSuccess && (
                                        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in">
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                            <span>{t('settings.quickAccess.saveSuccess')}</span>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-3 mb-6">
                                        {INITIAL_GAMES.map((game) => {
                                            const isSelected = tempSelectedSlugs.includes(game.slug);
                                            const canSelect = isSelected || tempSelectedSlugs.length < 4;
                                            return (
                                                <div
                                                    key={game.slug}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setTempSelectedSlugs(tempSelectedSlugs.filter(s => s !== game.slug));
                                                        } else if (canSelect) {
                                                            setTempSelectedSlugs([...tempSelectedSlugs, game.slug]);
                                                        }
                                                    }}
                                                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                                                        isSelected
                                                            ? "bg-primary/10 border-primary/50 text-text font-bold shadow-sm"
                                                            : "bg-background border-border text-text-muted hover:border-border/80"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3.5 min-w-0">
                                                        <img src={game.logoUrl} alt={game.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-sm truncate text-text font-extrabold">{game.name}</span>
                                                            <span className="text-xs text-text-faint">{game.genre[0]} • {game.rating} ★</span>
                                                        </div>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${isSelected ? "bg-primary border-primary text-white" : "border-border bg-surface"}`}>
                                                        {isSelected && <FontAwesomeIcon icon={faCheck} className="text-xs" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        <p className="text-xs font-semibold text-text-muted">
                                            {t('settings.quickAccess.selectedCount', { count: tempSelectedSlugs.length.toString() })}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleSaveQuickAccess}
                                            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm cursor-pointer shadow-md transition-all"
                                        >
                                            {t('settings.quickAccess.saveBtn')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "account" && (
                            <div className="flex flex-col gap-6 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-text mb-2 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faUser} className="text-primary" />
                                        {t('settings.account.title')}
                                    </h3>
                                    <p className="text-text-muted text-sm mb-6">Quản lý bảo mật tài khoản và cập nhật mật khẩu của bạn.</p>
                                    
                                    {/* Change Password Form */}
                                    <form onSubmit={handleChangePasswordSubmit} className="p-5 border border-border rounded-2xl bg-surface/50 flex flex-col gap-4 shadow-xs">
                                        <div>
                                            <h4 className="font-extrabold text-sm text-text">{t('settings.account.changePassword')}</h4>
                                            <p className="text-xs text-text-muted mt-0.5">{t('settings.account.changePasswordDesc')}</p>
                                        </div>

                                        {changePwdError && (
                                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
                                                {changePwdError}
                                            </div>
                                        )}

                                        {changePwdSuccess && (
                                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center gap-2">
                                                <FontAwesomeIcon icon={faCheckCircle} />
                                                <span>{changePwdSuccess}</span>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-bold text-text-muted">Mật khẩu hiện tại</label>
                                                <input
                                                    type="password"
                                                    value={changePwdState.currentPassword}
                                                    onChange={(e) => setChangePwdState({ ...changePwdState, currentPassword: e.target.value })}
                                                    placeholder="••••••••"
                                                    disabled={changePwdLoading}
                                                    className="h-10 px-3 rounded-xl border border-border bg-bg text-sm text-text focus:outline-none focus:border-primary disabled:opacity-50 font-medium"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-bold text-text-muted">Mật khẩu mới</label>
                                                <input
                                                    type="password"
                                                    value={changePwdState.newPassword}
                                                    onChange={(e) => setChangePwdState({ ...changePwdState, newPassword: e.target.value })}
                                                    placeholder="Ít nhất 8 ký tự"
                                                    disabled={changePwdLoading}
                                                    className="h-10 px-3 rounded-xl border border-border bg-bg text-sm text-text focus:outline-none focus:border-primary disabled:opacity-50 font-medium"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-bold text-text-muted">Xác nhận mật khẩu mới</label>
                                                <input
                                                    type="password"
                                                    value={changePwdState.confirmPassword}
                                                    onChange={(e) => setChangePwdState({ ...changePwdState, confirmPassword: e.target.value })}
                                                    placeholder="••••••••"
                                                    disabled={changePwdLoading}
                                                    className="h-10 px-3 rounded-xl border border-border bg-bg text-sm text-text focus:outline-none focus:border-primary disabled:opacity-50 font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="submit"
                                                disabled={changePwdLoading}
                                                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                {changePwdLoading ? "Đang cập nhật..." : t('settings.account.updateBtn')}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                <div className="pt-6 border-t border-border">
                                    <h3 className="text-lg font-bold text-rose-500 mb-4">{t('settings.account.dangerZone')}</h3>
                                    <div className="flex items-center justify-between p-4 border border-rose-500/20 rounded-xl bg-rose-500/5">
                                        <div>
                                            <p className="font-semibold text-text">{t('settings.account.deleteAccount')}</p>
                                            <p className="text-sm text-text-muted mt-0.5">{t('settings.account.deleteAccountDesc')}</p>
                                        </div>
                                        <button className="px-4 py-2 bg-rose-500 text-white rounded-lg font-bold text-sm hover:bg-rose-600 transition-colors cursor-pointer">{t('settings.account.deleteAccount')}</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "blocked" && (
                            <div className="flex flex-col gap-6 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-text mb-2">{t('settings.blocked.title')}</h3>
                                    <p className="text-text-muted text-sm mb-6">{t('settings.blocked.desc')}</p>
                                    
                                    <div className="flex flex-col gap-3">
                                        {[
                                            { name: "ToxicGamer99", username: "@toxic99", reason: "Spam / Ngôn từ đả kích", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ToxicGamer99" },
                                            { name: "ScammerBot", username: "@scammer_xyz", reason: "Lừa đảo / Phishing", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ScammerBot" }
                                        ].map((blocked) => (
                                            <div key={blocked.username} className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                                                <div className="flex items-center gap-4">
                                                    <img src={blocked.avatar} alt={blocked.name} className="w-10 h-10 rounded-full object-cover grayscale opacity-60" />
                                                    <div className="flex flex-col">
                                                        <p className="font-bold text-text text-sm line-through opacity-80">{blocked.name}</p>
                                                        <p className="text-xs text-text-muted">{blocked.username}</p>
                                                    </div>
                                                </div>
                                                <button className="px-4 py-2 border border-border bg-surface-hover hover:bg-border text-text text-xs font-bold rounded-lg transition-colors cursor-pointer">
                                                    {t('settings.blocked.unblock')}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "feedback" && (
                            <div className="flex flex-col gap-6 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-text mb-2">{t('settings.feedback.title')}</h3>
                                    <p className="text-text-muted text-sm mb-6">{t('settings.feedback.subtitle')}</p>
                                    
                                    {isSuccess ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in bg-background rounded-xl border border-border">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-emerald-500 mb-4" />
                                            <h4 className="text-xl font-bold text-text mb-2">{t('settings.feedback.successTitle')}</h4>
                                            <p className="text-text-muted text-sm">
                                                {t('settings.feedback.successDesc')}
                                            </p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmitFeedback} className="flex flex-col gap-5">
                                            <div className="flex gap-4">
                                                <label className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${feedbackType === "bug" ? "border-rose-500 bg-rose-500/10" : "border-border bg-background hover:bg-surface-hover"}`}>
                                                    <input type="radio" name="feedbackType" value="bug" checked={feedbackType === "bug"} onChange={() => setFeedbackType("bug")} className="hidden" />
                                                    <FontAwesomeIcon icon={faBug} className={`text-2xl mb-2 ${feedbackType === "bug" ? "text-rose-500" : "text-text-muted"}`} />
                                                    <span className={`font-semibold ${feedbackType === "bug" ? "text-text" : "text-text-muted"}`}>{t('settings.feedback.bugReport')}</span>
                                                </label>
                                                <label className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${feedbackType === "feedback" ? "border-amber-500 bg-amber-500/10" : "border-border bg-background hover:bg-surface-hover"}`}>
                                                    <input type="radio" name="feedbackType" value="feedback" checked={feedbackType === "feedback"} onChange={() => setFeedbackType("feedback")} className="hidden" />
                                                    <FontAwesomeIcon icon={faLightbulb} className={`text-2xl mb-2 ${feedbackType === "feedback" ? "text-amber-500" : "text-text-muted"}`} />
                                                    <span className={`font-semibold ${feedbackType === "feedback" ? "text-text" : "text-text-muted"}`}>{t('settings.feedback.idea')}</span>
                                                </label>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-text mb-2">{t('settings.feedback.formTitle')}</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={feedbackTitle}
                                                    onChange={(e) => setFeedbackTitle(e.target.value)}
                                                    placeholder={feedbackType === "bug" ? t('settings.feedback.bugPlaceholder') : t('settings.feedback.ideaPlaceholder')}
                                                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-text placeholder-text-faint focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-text mb-2">{t('settings.feedback.descLabel')}</label>
                                                <textarea
                                                    required
                                                    value={feedbackDescription}
                                                    onChange={(e) => setFeedbackDescription(e.target.value)}
                                                    placeholder={feedbackType === "bug" ? t('settings.feedback.bugDescPlaceholder') : t('settings.feedback.ideaDescPlaceholder')}
                                                    className="w-full h-32 px-4 py-3 rounded-xl bg-background border border-border text-text placeholder-text-faint focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                                                ></textarea>
                                            </div>

                                            <div className="flex justify-end pt-2">
                                                <button
                                                    type="submit"
                                                    disabled={!feedbackTitle.trim() || !feedbackDescription.trim() || isSubmitting}
                                                    className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
                                                >
                                                    {isSubmitting ? t('settings.feedback.submitting') : t('settings.feedback.submitBtn')}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
