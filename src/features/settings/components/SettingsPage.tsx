import React, { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import {
    Palette,
    GameController as Gamepad2,
    Bell,
    Shield,
    ShieldCheck,
    ChatCircleDots,
} from '@phosphor-icons/react';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useGameStore } from '@/features/game';
import { useAuthStore, checkPasswordRequirements } from '@/features/auth';
import { authApi, feedbackApi, profilesApi, usersApi } from '@/shared/api';
import { queryClient } from '@/shared/lib/queryClient';
import {
    QUERY_KEYS,
    useUserSessionsQuery,
    useRevokeSessionMutation,
    useRevokeAllSessionsMutation,
    useUserSettingsQuery,
    useUpdateUserSettingsMutation,
    useBlockedUsersQuery,
    useUnblockTargetUserMutation,
} from '@/shared/api/useQueries';
import type { FeedbackDto, UserSettingsTheme } from '@/shared/api/types';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import type { SettingsTab, BlockedUser, NavTabItem } from '../types';
import { VALID_SETTINGS_TABS } from '../types';
import { isDangerConfirmationValid } from '../utils/danger-modal-utils';
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

    const user = useAuthStore((state) => state.user);
    const authLoading = useAuthStore((state) => state.loading);
    const logout = useAuthStore((state) => state.logout);
    const updateUser = useAuthStore((state) => state.updateUser);
    const isLoggedIn = !!user;

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
        !authLoading && !isLoggedIn && resolvedTab !== "general" && resolvedTab !== "feedback"
            ? "general"
            : resolvedTab;

    const handleTabChange = (tab: SettingsTab) => {
        navigate({
            to: "/settings",
            search: { tab } as Record<string, unknown>,
            replace: true,
        });
    };

    const { data: remoteSessions, isLoading: sessionsLoading } = useUserSessionsQuery(
        undefined,
        { enabled: activeTab === "account" }
    );
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
        allowMessages: boolean;
        allowMentions: boolean;
    }>>({});

    const privacy = {
        profileVisibility: localPrivacyOverrides.profileVisibility ?? (userSettings?.privacy?.profileVisibility === "community" ? "friends" : (userSettings?.privacy?.profileVisibility || "public")) as "public" | "friends" | "private",
        onlineStatus: localPrivacyOverrides.onlineStatus ?? (userSettings?.privacy?.onlineStatus ?? true),
        gameLibraryVisibility: localPrivacyOverrides.gameLibraryVisibility ?? ("public" as const),
        allowMessages: localPrivacyOverrides.allowMessages ?? (userSettings?.privacy?.allowMessages ?? true),
        allowMentions: localPrivacyOverrides.allowMentions ?? (userSettings?.privacy?.allowMentions ?? true),
    };

    // 3. Notifications Settings (state derived with local overrides)
    const [localNotificationOverrides, setLocalNotificationOverrides] = useState<Partial<{
        comments: boolean;
        replies: boolean;
        likes: boolean;
        mentions: boolean;
        communityActivity: boolean;
        email: boolean;
        push: boolean;
    }>>({});

    const notifications = {
        comments: localNotificationOverrides.comments ?? (userSettings?.notifications?.comment ?? true),
        replies: localNotificationOverrides.replies ?? (userSettings?.notifications?.reply ?? true),
        likes: localNotificationOverrides.likes ?? (userSettings?.notifications?.like ?? true),
        mentions: localNotificationOverrides.mentions ?? (userSettings?.notifications?.mention ?? true),
        communityActivity: localNotificationOverrides.communityActivity ?? (userSettings?.notifications?.community ?? false),
        email: localNotificationOverrides.email ?? (userSettings?.notifications?.email ?? true),
        push: localNotificationOverrides.push ?? (userSettings?.notifications?.push ?? true),
    };

    // Sync remote theme/language/quickAccessSlugs to Zustand store on load
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
        if (userSettings.quickAccessSlugs && Array.isArray(userSettings.quickAccessSlugs) && userSettings.quickAccessSlugs.length > 0) {
            const currentSlugs = useGameStore.getState().quickAccessSlugs;
            if (JSON.stringify(currentSlugs) !== JSON.stringify(userSettings.quickAccessSlugs)) {
                setQuickAccessSlugs(userSettings.quickAccessSlugs);
                setTempSelectedSlugs(userSettings.quickAccessSlugs);
            }
        }
    }, [userSettings, setQuickAccessSlugs]);

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

    const handleUpdatePrivacy = (newPrivacy: {
        profileVisibility: "public" | "friends" | "private";
        onlineStatus: boolean;
        gameLibraryVisibility: "public" | "friends" | "private";
        allowMessages?: boolean;
        allowMentions?: boolean;
    }) => {
        const merged = {
            ...privacy,
            ...newPrivacy,
            allowMessages: newPrivacy.allowMessages ?? privacy.allowMessages,
            allowMentions: newPrivacy.allowMentions ?? privacy.allowMentions,
        };
        setLocalPrivacyOverrides(merged);
        updateSettingsMutation.mutate({
            privacy: {
                profileVisibility: merged.profileVisibility === "friends" ? "community" : merged.profileVisibility,
                onlineStatus: merged.onlineStatus,
                allowMessages: merged.allowMessages,
                allowMentions: merged.allowMentions,
            },
        });
    };

    const handleUpdateNotifications = (newNotifications: {
        comments: boolean;
        replies: boolean;
        likes: boolean;
        mentions: boolean;
        communityActivity: boolean;
        email?: boolean;
        push?: boolean;
    }) => {
        const merged = {
            ...notifications,
            ...newNotifications,
            email: newNotifications.email ?? notifications.email,
            push: newNotifications.push ?? notifications.push,
        };
        setLocalNotificationOverrides(merged);
        updateSettingsMutation.mutate({
            notifications: {
                comment: merged.comments,
                reply: merged.replies,
                like: merged.likes,
                mention: merged.mentions,
                community: merged.communityActivity,
                email: merged.email,
                push: merged.push,
            },
        });
    };

    const isEmailVerified = user?.isVerified || false;
    const [emailPendingVerify, setEmailPendingVerify] = useState(false);
    const [isSendingVerifyEmail, setIsSendingVerifyEmail] = useState(false);
    const [isCheckingVerify, setIsCheckingVerify] = useState(false);
    const [pendingNewEmail, setPendingNewEmail] = useState<string | null>(null);
    const [isChangingEmail, setIsChangingEmail] = useState(false);
    const [isCancellingEmailChange, setIsCancellingEmailChange] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [emailPasswordConfirm, setEmailPasswordConfirm] = useState("");
    const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
    const [emailErrorMsg, setEmailErrorMsg] = useState<string | null>(null);

    const displayEmail = user?.email || "";

    // Load pendingEmail status from /auth/me when entering Account tab
    useEffect(() => {
        if (!isLoggedIn || activeTab !== "account") return;
        let cancelled = false;
        authApi
            .me()
            .then((me) => {
                if (cancelled) return;
                const pending = (me as unknown as { pendingEmail?: string | null })?.pendingEmail;
                setPendingNewEmail(pending || null);
            })
            .catch(() => {
                // Non-critical
            });
        return () => {
            cancelled = true;
        };
    }, [isLoggedIn, activeTab]);

    const [changePwdState, setChangePwdState] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [changePwdLoading, setChangePwdLoading] = useState(false);
    const [changePwdError, setChangePwdError] = useState<string | null>(null);
    const [changePwdSuccess, setChangePwdSuccess] = useState<string | null>(null);

    // Blocked Users (integrated into Privacy tab via real API)
    const { data: rawBlockedData } = useBlockedUsersQuery(isLoggedIn);
    const unblockMutation = useUnblockTargetUserMutation();

    const blockedUsers: BlockedUser[] = React.useMemo(() => {
        if (!rawBlockedData || !Array.isArray(rawBlockedData)) return [];
        return rawBlockedData.map((item) => {
            const target = item.blockedUser || item.user;
            const targetId = target?.id || item.addresseeId || item.id;
            const name = target?.displayName || target?.name || target?.username || 'Người dùng';
            const username = target?.username || 'unknown';
            const avatar = target?.avatarUrl || target?.avatar || "";
            return {
                id: targetId,
                name,
                username,
                avatar,
                blockedAt: item.createdAt || new Date().toISOString(),
                reason: '',
            };
        });
    }, [rawBlockedData]);

    // Feedback
    const [feedbackType, setFeedbackType] = useState<"bug" | "idea">("bug");
    const [feedbackTitle, setFeedbackTitle] = useState("");
    const [feedbackDescription, setFeedbackDescription] = useState("");
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [isFeedbackSuccess, setIsFeedbackSuccess] = useState(false);
    const [feedbackError, setFeedbackError] = useState<string | null>(null);
    const [myFeedbacks, setMyFeedbacks] = useState<FeedbackDto[]>([]);
    const [isLoadingMyFeedbacks, setIsLoadingMyFeedbacks] = useState(false);

    useEffect(() => {
        if (!isLoggedIn || activeTab !== "feedback") return;
        let cancelled = false;
        setIsLoadingMyFeedbacks(true);
        feedbackApi
            .getMine({ page: 1, limit: 20 })
            .then((res) => {
                if (!cancelled && Array.isArray(res?.data)) {
                    setMyFeedbacks(res.data);
                }
            })
            .catch(() => {
                // Non-critical
            })
            .finally(() => {
                if (!cancelled) setIsLoadingMyFeedbacks(false);
            });
        return () => {
            cancelled = true;
        };
    }, [isLoggedIn, activeTab]);

    // Danger Zone Modals (integrated into Account tab)
    const [dangerModal, setDangerModal] = useState<{
        open: boolean;
        type: "deactivate" | "delete" | null;
        confirmText: string;
    }>({ open: false, type: null, confirmText: "" });
    const [dangerAlertMsg, setDangerAlertMsg] = useState<string | null>(null);

    const handleSaveQuickAccess = () => {
        setQuickAccessSlugs(tempSelectedSlugs);
        updateSettingsMutation.mutate({ quickAccessSlugs: tempSelectedSlugs });
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

    const handleChangeEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailErrorMsg(null);
        setEmailSuccessMsg(null);

        const trimmedEmail = newEmail.trim().toLowerCase();
        if (!trimmedEmail || !trimmedEmail.includes("@")) {
            setEmailErrorMsg(t('settings.account.invalidEmailMsg', { defaultValue: 'Vui lòng nhập địa chỉ email hợp lệ!' }));
            return;
        }
        if (!emailPasswordConfirm) {
            setEmailErrorMsg(t('settings.account.requireCurrentPasswordMsg', { defaultValue: 'Vui lòng nhập mật khẩu hiện tại để xác nhận đổi email!' }));
            return;
        }

        setIsChangingEmail(true);
        try {
            const res = await authApi.requestEmailChange({
                newEmail: trimmedEmail,
                currentPassword: emailPasswordConfirm,
            });
            setPendingNewEmail(res?.pendingEmail || trimmedEmail);
            setNewEmail("");
            setEmailPasswordConfirm("");
            setEmailSuccessMsg(
                t('settings.account.updateEmailSuccessMsg', {
                    defaultValue: 'Đã gửi liên kết xác nhận đến email mới! Vui lòng kiểm tra hộp thư để hoàn tất thay đổi.',
                })
            );
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : t('settings.account.updateEmailErrorMsg', { defaultValue: 'Không thể yêu cầu đổi email. Vui lòng kiểm tra lại mật khẩu hoặc địa chỉ email.' });
            setEmailErrorMsg(message);
        } finally {
            setIsChangingEmail(false);
        }
    };

    const handleCancelEmailChange = async () => {
        setIsCancellingEmailChange(true);
        setEmailErrorMsg(null);
        setEmailSuccessMsg(null);
        try {
            await authApi.cancelEmailChange();
            setPendingNewEmail(null);
            setEmailSuccessMsg(
                t('settings.account.cancelEmailChangeSuccess', { defaultValue: 'Đã hủy yêu cầu đổi địa chỉ email.' })
            );
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : t('settings.account.cancelEmailChangeError', { defaultValue: 'Không thể hủy yêu cầu đổi email.' });
            setEmailErrorMsg(message);
        } finally {
            setIsCancellingEmailChange(false);
        }
    };

    const handleSendVerificationEmail = async () => {
        const emailToSend = (displayEmail || user?.email || "").trim();
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
            if (profile) {
                queryClient.setQueryData(QUERY_KEYS.myProfile, profile);
            }
            const verified = Boolean(profile?.isVerified || (profile as { isEmailVerified?: boolean })?.isEmailVerified);
            if (verified) {
                if (user) {
                    updateUser({ isVerified: true });
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

    const handleUnblockUser = async (userId: string) => {
        try {
            await unblockMutation.mutateAsync(userId);
        } catch (err) {
            console.error("Failed to unblock user:", err);
        }
    };

    const handleSubmitFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedbackError(null);
        setIsFeedbackSuccess(false);

        const title = feedbackTitle.trim();
        const description = feedbackDescription.trim();
        if (title.length < 4) {
            setFeedbackError(t('settings.feedback.titleTooShort', { defaultValue: 'Tiêu đề cần ít nhất 4 ký tự.' }));
            return;
        }
        if (description.length < 10) {
            setFeedbackError(t('settings.feedback.descTooShort', { defaultValue: 'Nội dung mô tả cần ít nhất 10 ký tự.' }));
            return;
        }

        setIsSubmittingFeedback(true);
        try {
            const created = await feedbackApi.create({
                type: feedbackType,
                title,
                description,
            });
            setIsFeedbackSuccess(true);
            setFeedbackTitle("");
            setFeedbackDescription("");
            if (isLoggedIn && created) {
                setMyFeedbacks((prev) => [created, ...prev]);
            }
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : t('settings.feedback.submitError', { defaultValue: 'Không thể gửi phản hồi lúc này. Vui lòng thử lại sau.' });
            setFeedbackError(message);
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    const [, setDangerLoading] = useState(false);

    const handleConfirmDangerAction = async () => {
        if (dangerModal.type === "deactivate") {
            if (!isDangerConfirmationValid("deactivate", dangerModal.confirmText)) {
                setDangerAlertMsg(t('settings.danger.deactivateMatchError', { defaultValue: 'Vui lòng gõ chính xác cụm từ "TAM NGUNG" hoặc "DEACTIVATE"!' }));
                return;
            }
            try {
                setDangerLoading(true);
                await profilesApi.toggleArchived(true);
                setDangerModal({ open: false, type: null, confirmText: "" });
                setDangerAlertMsg(null);
                await logout();
                navigate({ to: "/auth" });
            } catch (err: unknown) {
                setDangerAlertMsg((err as { message?: string })?.message || "Không thể tạm ngưng tài khoản. Vui lòng thử lại.");
            } finally {
                setDangerLoading(false);
            }
        } else if (dangerModal.type === "delete") {
            if (!isDangerConfirmationValid("delete", dangerModal.confirmText)) {
                setDangerAlertMsg(t('settings.danger.deleteMatchError', { defaultValue: 'Vui lòng gõ chính xác cụm từ "XOA TAI KHOAN" hoặc "DELETE ACCOUNT"!' }));
                return;
            }
            try {
                setDangerLoading(true);
                await profilesApi.deleteMe();
                setDangerModal({ open: false, type: null, confirmText: "" });
                setDangerAlertMsg(null);
                await logout();
                navigate({ to: "/auth" });
            } catch (err: unknown) {
                setDangerAlertMsg((err as { message?: string })?.message || "Không thể xóa tài khoản. Vui lòng thử lại.");
            } finally {
                setDangerLoading(false);
            }
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
            icon: ChatCircleDots,
            desc: t('settings.tabs.feedbackDesc', { defaultValue: "Gửi lỗi hoặc ý tưởng cải tiến" }),
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
                            authLoading={authLoading}
                            authUserId={user?.id}
                            emailSuccessMsg={emailSuccessMsg}
                            emailErrorMsg={emailErrorMsg}
                            pendingNewEmail={pendingNewEmail}
                            isChangingEmail={isChangingEmail}
                            isCancellingEmailChange={isCancellingEmailChange}
                            newEmail={newEmail}
                            emailPasswordConfirm={emailPasswordConfirm}
                            onNewEmailChange={setNewEmail}
                            onEmailPasswordConfirmChange={setEmailPasswordConfirm}
                            onConfirmVerification={handleConfirmVerification}
                            onSendVerificationEmail={handleSendVerificationEmail}
                            onChangeEmailSubmit={handleChangeEmailSubmit}
                            onCancelEmailChange={handleCancelEmailChange}
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
                            feedbackError={feedbackError}
                            myFeedbacks={myFeedbacks}
                            isLoadingMyFeedbacks={isLoadingMyFeedbacks}
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
