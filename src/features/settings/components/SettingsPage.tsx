import React, { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import {
    Palette,
    Gamepad2,
    Bell,
    Shield,
    ShieldCheck,
    MessageSquarePlus,
} from 'lucide-react';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useGameStore } from '@/features/game';
import { useAuthStore, checkPasswordRequirements } from '@/features/auth';
import { authApi, profilesApi, usersApi } from '@/shared/api';
import {
    useUserSessionsQuery,
    useRevokeSessionMutation,
    useRevokeAllSessionsMutation,
    useUserSettingsQuery,
    useUpdateUserSettingsMutation,
} from '@/shared/api/useQueries';
import type { UserSettingsTheme } from '@/shared/api/types';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import type { SettingsTab, BlockedUser, NavTabItem } from '../types';
import { VALID_SETTINGS_TABS } from '../types';
import { SettingsSidebar } from './SettingsSidebar';
import { GeneralSettingsTab } from './tabs/GeneralSettingsTab';
import { QuickAccessSettingsTab } from './tabs/QuickAccessSettingsTab';
import { PrivacySettingsTab } from './tabs/PrivacySettingsTab';
import { NotificationsSettingsTab } from './tabs/NotificationsSettingsTab';
import { AccountSettingsTab } from './tabs/AccountSettingsTab';
import { FeedbackSettingsTab } from './tabs/FeedbackSettingsTab';

export function SettingsPage() {
    const navigate = useNavigate();
    const searchParams = useSearch({ strict: false }) as { tab?: string };
    const { t } = useTranslation();
    useDocumentTitle(t('common.settings', { defaultValue: 'Cài đặt' }));

    const authStore = useAuthStore();
    const isLoggedIn = !!authStore.user;

    const rawTab = searchParams?.tab as string | undefined;

    // Map legacy tab URLs gracefully
    let resolvedTab: SettingsTab = "general";
    if (rawTab === "danger") {
        resolvedTab = "account";
    } else if (rawTab === "blocked") {
        resolvedTab = "privacy";
    } else if (rawTab && (VALID_SETTINGS_TABS as readonly string[]).includes(rawTab)) {
        resolvedTab = rawTab as SettingsTab;
    }

    const activeTab: SettingsTab =
        !authStore.loading && !isLoggedIn && resolvedTab !== "general" && resolvedTab !== "feedback"
            ? "general"
            : resolvedTab;

    const handleTabChange = (tab: SettingsTab) => {
        navigate({
            to: "/settings",
            search: { tab } as Record<string, unknown>,
            replace: true,
        });
    };

    const { data: remoteSessions, isLoading: sessionsLoading } = useUserSessionsQuery();
    const revokeSessionMutation = useRevokeSessionMutation();
    const revokeAllSessionsMutation = useRevokeAllSessionsMutation();
    const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
    const [isRevokingAll, setIsRevokingAll] = useState(false);

    const handleRevokeSession = async (sessionId: string) => {
        try {
            setRevokingSessionId(sessionId);
            await revokeSessionMutation.mutateAsync(sessionId);
        } catch (err) {
            console.error("Failed to revoke session:", err);
        } finally {
            setRevokingSessionId(null);
        }
    };

    const handleRevokeAllOtherSessions = async () => {
        if (!window.confirm(t('settings.account.confirmRevokeAll', { defaultValue: 'Bạn có chắc muốn thu hồi tất cả các phiên đăng nhập khác không?' }))) {
            return;
        }
        try {
            setIsRevokingAll(true);
            await revokeAllSessionsMutation.mutateAsync();
        } catch (err) {
            console.error("Failed to revoke all sessions:", err);
        } finally {
            setIsRevokingAll(false);
        }
    };

    const theme = useThemeStore((state) => state.theme);
    const themeMode = useThemeStore((state) => state.mode);
    const setThemeMode = useThemeStore((state) => state.setThemeMode);
    const language = useThemeStore((state) => state.language);
    const toggleLanguage = useThemeStore((state) => state.toggleLanguage);

    // Sync settings with Backend API (/users/me/settings)
    const { data: userSettings } = useUserSettingsQuery();
    const updateSettingsMutation = useUpdateUserSettingsMutation();

    // 1. Quick Access
    const quickAccessSlugs = useGameStore((state) => state.quickAccessSlugs);
    const setQuickAccessSlugs = useGameStore((state) => state.setQuickAccessSlugs);
    const [tempSelectedSlugs, setTempSelectedSlugs] = useState<string[]>(quickAccessSlugs);
    const [saveQuickAccessSuccess, setSaveQuickAccessSuccess] = useState(false);

    // 2. Privacy Settings (state derived with local overrides)
    const [localPrivacyOverrides, setLocalPrivacyOverrides] = useState<Partial<{
        profileVisibility: "public" | "friends" | "private";
        onlineStatus: boolean;
        gameLibraryVisibility: "public" | "friends" | "private";
    }>>({});

    const privacy = {
        profileVisibility: localPrivacyOverrides.profileVisibility ?? (userSettings?.privacy?.profileVisibility === "community" ? "friends" : (userSettings?.privacy?.profileVisibility || "public")) as "public" | "friends" | "private",
        onlineStatus: localPrivacyOverrides.onlineStatus ?? (userSettings?.privacy?.onlineStatus ?? true),
        gameLibraryVisibility: localPrivacyOverrides.gameLibraryVisibility ?? ("public" as const),
    };

    // 3. Notifications Settings (state derived with local overrides)
    const [localNotificationOverrides, setLocalNotificationOverrides] = useState<Partial<{
        comments: boolean;
        replies: boolean;
        likes: boolean;
        mentions: boolean;
        communityActivity: boolean;
    }>>({});

    const notifications = {
        comments: localNotificationOverrides.comments ?? (userSettings?.notifications?.comment ?? true),
        replies: localNotificationOverrides.replies ?? (userSettings?.notifications?.reply ?? true),
        likes: localNotificationOverrides.likes ?? true,
        mentions: localNotificationOverrides.mentions ?? (userSettings?.notifications?.mention ?? true),
        communityActivity: localNotificationOverrides.communityActivity ?? (userSettings?.notifications?.community ?? false),
    };

    // Sync remote theme/language to Zustand store on load
    useEffect(() => {
        if (!userSettings) return;

        if (userSettings.theme) {
            useThemeStore.getState().setThemeMode(userSettings.theme === 'system' ? 'auto' : userSettings.theme);
        }
        if (userSettings.language) {
            const currentLang = useThemeStore.getState().language;
            if (currentLang !== userSettings.language) {
                useThemeStore.getState().setLanguage(userSettings.language);
            }
        }
    }, [userSettings]);

    const handleUpdateTheme = (mode: 'auto' | 'dark' | 'light') => {
        setThemeMode(mode);
        const beTheme = mode === 'auto' ? 'system' : mode;
        updateSettingsMutation.mutate({ theme: beTheme as UserSettingsTheme });
    };

    const handleToggleLanguage = () => {
        const nextLang = language === 'vi' ? 'en' : 'vi';
        toggleLanguage();
        updateSettingsMutation.mutate({ language: nextLang });
    };

    const handleUpdatePrivacy = (newPrivacy: typeof privacy) => {
        setLocalPrivacyOverrides(newPrivacy);
        updateSettingsMutation.mutate({
            privacy: {
                profileVisibility: newPrivacy.profileVisibility === "friends" ? "community" : newPrivacy.profileVisibility,
                onlineStatus: newPrivacy.onlineStatus,
            },
        });
    };

    const handleUpdateNotifications = (newNotifications: typeof notifications) => {
        setLocalNotificationOverrides(newNotifications);
        updateSettingsMutation.mutate({
            notifications: {
                comment: newNotifications.comments,
                reply: newNotifications.replies,
                mention: newNotifications.mentions,
                community: newNotifications.communityActivity,
            },
        });
    };

    const isEmailVerified = authStore.user?.isVerified || false;
    const [emailPendingVerify, setEmailPendingVerify] = useState(false);
    const [isSendingVerifyEmail, setIsSendingVerifyEmail] = useState(false);
    const [isCheckingVerify, setIsCheckingVerify] = useState(false);
    const [customEmailOverride, setCustomEmailOverride] = useState<string | null>(null);
    const [newEmail, setNewEmail] = useState("");
    const [emailPasswordConfirm, setEmailPasswordConfirm] = useState("");
    const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
    const [emailErrorMsg, setEmailErrorMsg] = useState<string | null>(null);

    const displayEmail = customEmailOverride || authStore.user?.email || "";

    const [changePwdState, setChangePwdState] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [changePwdLoading, setChangePwdLoading] = useState(false);
    const [changePwdError, setChangePwdError] = useState<string | null>(null);
    const [changePwdSuccess, setChangePwdSuccess] = useState<string | null>(null);

    // Blocked Users (integrated into Privacy tab)
    const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

    // Feedback
    const [feedbackType, setFeedbackType] = useState<"bug" | "idea">("bug");
    const [feedbackTitle, setFeedbackTitle] = useState("");
    const [feedbackDescription, setFeedbackDescription] = useState("");
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [isFeedbackSuccess, setIsFeedbackSuccess] = useState(false);

    // Danger Zone Modals (integrated into Account tab)
    const [dangerModal, setDangerModal] = useState<{
        open: boolean;
        type: "deactivate" | "delete" | null;
        confirmText: string;
    }>({ open: false, type: null, confirmText: "" });
    const [dangerAlertMsg, setDangerAlertMsg] = useState<string | null>(null);

    const handleSaveQuickAccess = () => {
        setQuickAccessSlugs(tempSelectedSlugs);
        setSaveQuickAccessSuccess(true);
        setTimeout(() => setSaveQuickAccessSuccess(false), 2500);
    };

    const moveQuickAccessGame = (slug: string, direction: "up" | "down") => {
        const index = tempSelectedSlugs.indexOf(slug);
        if (index === -1) return;
        if (direction === "up" && index === 0) return;
        if (direction === "down" && index === tempSelectedSlugs.length - 1) return;

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        const newArr = [...tempSelectedSlugs];
        const temp = newArr[index];
        newArr[index] = newArr[targetIndex];
        newArr[targetIndex] = temp;
        setTempSelectedSlugs(newArr);
    };

    const handleChangePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setChangePwdError(null);
        setChangePwdSuccess(null);

        if (!changePwdState.currentPassword) {
            setChangePwdError(t('settings.account.pwdRequireCurrent', { defaultValue: 'Vui lòng nhập mật khẩu hiện tại!' }));
            return;
        }

        const pwdCheck = checkPasswordRequirements(changePwdState.newPassword);
        if (pwdCheck.isOverMax) {
            setChangePwdError(t('auth.errPasswordMaxExceeded', { defaultValue: 'Mật khẩu mới không được vượt quá 72 ký tự!' }));
            return;
        }
        if (!pwdCheck.isValid) {
            setChangePwdError(t('auth.errPasswordRequirements', { defaultValue: 'Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và ký tự đặc biệt!' }));
            return;
        }

        if (changePwdState.newPassword !== changePwdState.confirmPassword) {
            setChangePwdError(t('settings.account.pwdMatchError', { defaultValue: 'Mật khẩu xác nhận không trùng khớp!' }));
            return;
        }

        setChangePwdLoading(true);
        try {
            await usersApi.changePassword({
                oldPassword: changePwdState.currentPassword,
                newPassword: changePwdState.newPassword,
            });
            setChangePwdSuccess(t('settings.account.pwdSuccess', { defaultValue: 'Đổi mật khẩu thành công!' }));
            setChangePwdState({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('settings.account.pwdError', { defaultValue: 'Không thể cập nhật mật khẩu. Vui lòng thử lại.' });
            setChangePwdError(message);
        } finally {
            setChangePwdLoading(false);
        }
    };

    const handleChangeEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail.includes("@")) {
            setEmailSuccessMsg(t('settings.account.invalidEmailMsg', { defaultValue: 'Vui lòng nhập địa chỉ email hợp lệ!' }));
            return;
        }
        if (!emailPasswordConfirm) {
            setEmailSuccessMsg(t('settings.account.requireCurrentPasswordMsg', { defaultValue: 'Vui lòng nhập mật khẩu hiện tại để xác nhận đổi email!' }));
            return;
        }
        setCustomEmailOverride(newEmail);
        authStore.updateUser({ email: newEmail, isVerified: false });
        if (authStore.user?.isVerified) {
            authStore.toggleVerifyEmailStatus();
        }
        setNewEmail("");
        setEmailPasswordConfirm("");
        setEmailSuccessMsg(t('settings.account.updateEmailSuccessMsg', { defaultValue: 'Đã cập nhật email thành công! Vui lòng kiểm tra hòm thư để xác thực.' }));
        setTimeout(() => setEmailSuccessMsg(null), 4000);
    };

    const handleSendVerificationEmail = async () => {
        const emailToSend = (displayEmail || authStore.user?.email || "").trim();
        if (!emailToSend) {
            setEmailErrorMsg(t('settings.account.emailNotFound', { defaultValue: 'Không tìm thấy địa chỉ email.' }));
            return;
        }

        setIsSendingVerifyEmail(true);
        setEmailErrorMsg(null);
        setEmailSuccessMsg(null);

        try {
            const res = await authApi.resendVerification({ email: emailToSend });
            setEmailPendingVerify(true);
            setEmailSuccessMsg(
                res?.message ||
                t('settings.account.verifyEmailSentMsg', {
                    defaultValue: 'Đã gửi email xác thực! Vui lòng kiểm tra hộp thư của bạn.'
                })
            );
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('settings.account.sendVerificationFailed', { defaultValue: 'Không thể gửi email xác thực. Vui lòng thử lại sau.' });
            setEmailErrorMsg(message);
        } finally {
            setIsSendingVerifyEmail(false);
        }
    };

    const handleConfirmVerification = async () => {
        setIsCheckingVerify(true);
        setEmailErrorMsg(null);
        try {
            const profile = await profilesApi.getMyProfile();
            const verified = Boolean(profile?.isVerified || (profile as { isEmailVerified?: boolean })?.isEmailVerified);
            if (verified) {
                if (authStore.user) {
                    authStore.updateUser({ isVerified: true });
                }
                setEmailPendingVerify(false);
                setEmailSuccessMsg(t('settings.account.verifySuccessMsg', { defaultValue: 'Email của bạn đã được xác minh thành công!' }));
            } else {
                setEmailErrorMsg(t('settings.account.verifyNotConfirmedYet', { defaultValue: 'Tài khoản chưa được xác minh trên hệ thống. Vui lòng nhấp vào liên kết trong email trước.' }));
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('settings.account.verifyCheckFailed', { defaultValue: 'Không thể kiểm tra trạng thái xác minh.' });
            setEmailErrorMsg(message);
        } finally {
            setIsCheckingVerify(false);
        }
    };

    const handleUnblockUser = (userId: string) => {
        setBlockedUsers(blockedUsers.filter((u) => u.id !== userId));
    };

    const handleSubmitFeedback = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingFeedback(true);
        setTimeout(() => {
            setIsSubmittingFeedback(false);
            setIsFeedbackSuccess(true);
            setTimeout(() => {
                setIsFeedbackSuccess(false);
                setFeedbackTitle("");
                setFeedbackDescription("");
            }, 3000);
        }, 600);
    };

    const handleConfirmDangerAction = () => {
        if (dangerModal.type === "deactivate") {
            if (dangerModal.confirmText.trim().toUpperCase() !== "TAM NGUNG") {
                setDangerAlertMsg(t('settings.danger.deactivateMatchError', { defaultValue: 'Vui lòng gõ chính xác cụm từ "TAM NGUNG"!' }));
                return;
            }
            alert(t('settings.danger.deactivateSuccessAlert', { defaultValue: 'Tài khoản của bạn đã được tạm ngưng thành công.' }));
            setDangerModal({ open: false, type: null, confirmText: "" });
            setDangerAlertMsg(null);
        } else if (dangerModal.type === "delete") {
            if (dangerModal.confirmText.trim().toUpperCase() !== "XOA TAI KHOAN") {
                setDangerAlertMsg(t('settings.danger.deleteMatchError', { defaultValue: 'Vui lòng gõ chính xác cụm từ "XOA TAI KHOAN"!' }));
                return;
            }
            alert(t('settings.danger.deleteSuccessAlert', { defaultValue: 'Tài khoản của bạn đã được xóa vĩnh viễn.' }));
            setDangerModal({ open: false, type: null, confirmText: "" });
            setDangerAlertMsg(null);
        }
    };

    // Clean, focused 6-Tab navigation
    const allNavTabs: NavTabItem[] = [
        {
            id: "general",
            label: t('settings.tabs.general', { defaultValue: "Giao diện" }),
            icon: Palette,
            desc: t('settings.tabs.generalDesc', { defaultValue: "Chủ đề & Ngôn ngữ" }),
        },
        {
            id: "quickAccess",
            label: t('settings.tabs.quickAccess', { defaultValue: "Game yêu thích" }),
            icon: Gamepad2,
            desc: t('settings.tabs.quickAccessDesc', { defaultValue: "Lối tắt menu chính" }),
            badge: tempSelectedSlugs.length > 0 ? tempSelectedSlugs.length : undefined,
        },
        {
            id: "account",
            label: t('settings.tabs.account', { defaultValue: "Tài khoản & Bảo mật" }),
            icon: ShieldCheck,
            desc: t('settings.tabs.accountDesc', { defaultValue: "Mật khẩu, Email, Phiên làm việc" }),
        },
        {
            id: "privacy",
            label: t('settings.tabs.privacy', { defaultValue: "Quyền riêng tư" }),
            icon: Shield,
            desc: t('settings.tabs.privacyDesc', { defaultValue: "Hồ sơ, Trạng thái & Danh sách chặn" }),
            badge: blockedUsers.length > 0 ? blockedUsers.length : undefined,
        },
        {
            id: "notifications",
            label: t('settings.tabs.notifications', { defaultValue: "Thông báo" }),
            icon: Bell,
            desc: t('settings.tabs.notificationsDesc', { defaultValue: "Tương tác & Cộng đồng" }),
        },
        {
            id: "feedback",
            label: t('settings.tabs.feedback', { defaultValue: "Báo lỗi & Đóng góp" }),
            icon: MessageSquarePlus,
            desc: t('settings.tabs.feedbackDesc', { defaultValue: "Gửi ý kiến phản hồi" }),
        },
    ];

    const navTabs = isLoggedIn
        ? allNavTabs
        : allNavTabs.filter((tab) => tab.id === "general" || tab.id === "feedback");

    return (
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 text-text select-none animate-fade-in">
            {/* Top Page Header - Fixed in place when scrolling */}
            <div className="sticky top-0 z-20 bg-bg/95 backdrop-blur-sm -mt-4 sm:-mt-6 pt-4 sm:pt-6 pb-3">
                <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight">
                    {t('settings.headerTitle', { defaultValue: 'Cài đặt hệ thống' })}
                </h1>
            </div>

            {/* Main 2-Column Settings Layout */}
            <div className="flex flex-col lg:flex-row gap-6 items-start w-full min-w-0">
                {/* Left Navigation Sidebar */}
                <SettingsSidebar
                    tabs={navTabs}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />

                {/* Right Settings Content Surface */}
                <main className="flex-1 w-full min-w-0 bg-surface rounded-2xl p-5 sm:p-7 shadow-xl min-h-[520px]">
                    {activeTab === "general" && (
                        <GeneralSettingsTab
                            theme={theme}
                            themeMode={themeMode}
                            language={language}
                            onUpdateTheme={handleUpdateTheme}
                            onToggleLanguage={handleToggleLanguage}
                        />
                    )}

                    {activeTab === "quickAccess" && (
                        <QuickAccessSettingsTab
                            tempSelectedSlugs={tempSelectedSlugs}
                            saveQuickAccessSuccess={saveQuickAccessSuccess}
                            onSaveQuickAccess={handleSaveQuickAccess}
                            onMoveGame={moveQuickAccessGame}
                            onToggleSelectSlug={(slug) => {
                                if (tempSelectedSlugs.includes(slug)) {
                                    setTempSelectedSlugs(tempSelectedSlugs.filter((s) => s !== slug));
                                } else if (tempSelectedSlugs.length < 4) {
                                    setTempSelectedSlugs([...tempSelectedSlugs, slug]);
                                }
                            }}
                            onRemoveSlug={(slug) => setTempSelectedSlugs(tempSelectedSlugs.filter((s) => s !== slug))}
                        />
                    )}

                    {activeTab === "account" && (
                        <AccountSettingsTab
                            isEmailVerified={isEmailVerified}
                            emailPendingVerify={emailPendingVerify}
                            isSendingVerifyEmail={isSendingVerifyEmail}
                            isCheckingVerify={isCheckingVerify}
                            displayEmail={displayEmail}
                            authLoading={authStore.loading}
                            authUserId={authStore.user?.id}
                            emailSuccessMsg={emailSuccessMsg}
                            emailErrorMsg={emailErrorMsg}
                            newEmail={newEmail}
                            emailPasswordConfirm={emailPasswordConfirm}
                            onNewEmailChange={setNewEmail}
                            onEmailPasswordConfirmChange={setEmailPasswordConfirm}
                            onConfirmVerification={handleConfirmVerification}
                            onSendVerificationEmail={handleSendVerificationEmail}
                            onChangeEmailSubmit={handleChangeEmailSubmit}
                            changePwdState={changePwdState}
                            changePwdLoading={changePwdLoading}
                            changePwdError={changePwdError}
                            changePwdSuccess={changePwdSuccess}
                            onChangePwdStateChange={setChangePwdState}
                            onChangePasswordSubmit={handleChangePasswordSubmit}
                            remoteSessions={remoteSessions}
                            sessionsLoading={sessionsLoading}
                            revokingSessionId={revokingSessionId}
                            isRevokingAll={isRevokingAll}
                            onRevokeSession={handleRevokeSession}
                            onRevokeAllOtherSessions={handleRevokeAllOtherSessions}
                            dangerModal={dangerModal}
                            dangerAlertMsg={dangerAlertMsg}
                            onOpenDangerModal={(type) => setDangerModal({ open: true, type, confirmText: "" })}
                            onCloseDangerModal={() => {
                                setDangerModal({ open: false, type: null, confirmText: "" });
                                setDangerAlertMsg(null);
                            }}
                            onConfirmTextChange={(confirmText) => setDangerModal({ ...dangerModal, confirmText })}
                            onConfirmDangerAction={handleConfirmDangerAction}
                        />
                    )}

                    {activeTab === "privacy" && (
                        <PrivacySettingsTab
                            privacy={privacy}
                            onUpdatePrivacy={handleUpdatePrivacy}
                            blockedUsers={blockedUsers}
                            onUnblockUser={handleUnblockUser}
                        />
                    )}

                    {activeTab === "notifications" && (
                        <NotificationsSettingsTab
                            notifications={notifications}
                            onUpdateNotifications={handleUpdateNotifications}
                        />
                    )}

                    {activeTab === "feedback" && (
                        <FeedbackSettingsTab
                            feedbackType={feedbackType}
                            feedbackTitle={feedbackTitle}
                            feedbackDescription={feedbackDescription}
                            isSubmittingFeedback={isSubmittingFeedback}
                            isFeedbackSuccess={isFeedbackSuccess}
                            onFeedbackTypeChange={setFeedbackType}
                            onFeedbackTitleChange={setFeedbackTitle}
                            onFeedbackDescriptionChange={setFeedbackDescription}
                            onSubmitFeedback={handleSubmitFeedback}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
