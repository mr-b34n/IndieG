import React, { useState, useMemo } from 'react';
import {
    CheckCircle2,
    AlertCircle,
    Clock,
    Mail,
    KeyRound,
    Laptop,
    Smartphone,
    Tablet,
    Globe,
    Eye,
    EyeOff,
    Copy,
    Check,
    Loader2,
    LogOut,
    AlertTriangle,
    UserMinus,
    Trash2,
    ShieldAlert,
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faApple,
    faWindows,
    faLinux,
    faAndroid,
} from '@fortawesome/free-brands-svg-icons';
import { PasswordRequirements } from '@/features/auth';
import type { UserSessionDto, UserSessionsResponseDto } from '@/shared/api/types';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { Button } from '@/shared/components/ui/button';
import { AppModal } from '@/shared/components/ui/AppModal';
import { cn } from '@/shared/utils/cn';
import {
    parseSessionDeviceInfo,
    formatSessionDateTime,
    formatSessionDateOnly,
    getCurrentSessionTokenId,
} from '../../utils/session-utils';

interface DangerModalState {
    open: boolean;
    type: "deactivate" | "delete" | null;
    confirmText: string;
}

interface AccountSettingsTabProps {
    isEmailVerified: boolean;
    emailPendingVerify: boolean;
    isSendingVerifyEmail: boolean;
    isCheckingVerify: boolean;
    displayEmail: string;
    authLoading: boolean;
    authUserId?: string;
    emailSuccessMsg: string | null;
    emailErrorMsg: string | null;
    newEmail: string;
    emailPasswordConfirm: string;
    onNewEmailChange: (val: string) => void;
    onEmailPasswordConfirmChange: (val: string) => void;
    onConfirmVerification: () => void;
    onSendVerificationEmail: () => void;
    onChangeEmailSubmit: (e: React.FormEvent) => void;
    changePwdState: { currentPassword: string; newPassword: string; confirmPassword: string };
    changePwdLoading: boolean;
    changePwdError: string | null;
    changePwdSuccess: string | null;
    onChangePwdStateChange: (state: { currentPassword: string; newPassword: string; confirmPassword: string }) => void;
    onChangePasswordSubmit: (e: React.FormEvent) => void;
    remoteSessions: UserSessionDto[] | UserSessionsResponseDto | { data?: UserSessionDto[] } | undefined;
    sessionsLoading: boolean;
    revokingSessionId: string | null;
    isRevokingAll: boolean;
    onRevokeSession: (sessionId: string) => void;
    onRevokeAllOtherSessions: () => void;
    // Danger Zone integration
    dangerModal: DangerModalState;
    dangerAlertMsg: string | null;
    onOpenDangerModal: (type: "deactivate" | "delete") => void;
    onCloseDangerModal: () => void;
    onConfirmTextChange: (text: string) => void;
    onConfirmDangerAction: () => void;
}

function SessionDeviceIcon({
    os,
    device,
    deviceType,
    isMobile,
    className,
}: {
    os?: string;
    device?: string;
    deviceType?: string;
    isMobile?: boolean;
    className?: string;
}) {
    const osLower = (os || '').toLowerCase();
    const devLower = (device || deviceType || '').toLowerCase();

    // 1. Android
    if (osLower.includes('android') || devLower.includes('android')) {
        return <FontAwesomeIcon icon={faAndroid} className={className} />;
    }

    // 2. iPhone / iPad / iOS
    if (
        osLower.includes('iphone') ||
        devLower.includes('iphone') ||
        osLower === 'ios' ||
        osLower.includes('ipad') ||
        devLower.includes('ipad')
    ) {
        return <FontAwesomeIcon icon={faApple} className={className} />;
    }

    // 3. macOS / Apple desktop
    if (osLower.includes('mac') || devLower.includes('mac') || osLower.includes('apple')) {
        return <FontAwesomeIcon icon={faApple} className={className} />;
    }

    // 4. Windows
    if (osLower.includes('windows') || osLower.includes('win') || devLower.includes('windows')) {
        return <FontAwesomeIcon icon={faWindows} className={className} />;
    }

    // 5. Linux / Ubuntu / SteamOS
    if (
        osLower.includes('linux') ||
        osLower.includes('ubuntu') ||
        osLower.includes('steamos') ||
        devLower.includes('linux')
    ) {
        return <FontAwesomeIcon icon={faLinux} className={className} />;
    }

    // 6. Generic Tablet
    if (devLower === 'tablet' || devLower.includes('tablet') || osLower.includes('tablet')) {
        return <Tablet className={className} />;
    }

    // 7. Generic Mobile
    if (devLower === 'mobile' || devLower.includes('mobile') || isMobile) {
        return <Smartphone className={className} />;
    }

    // 8. Generic Browser / Desktop fallback
    if (devLower === 'browser') {
        return <Globe className={className} />;
    }
    return <Laptop className={className} />;
}

export function AccountSettingsTab({
    isEmailVerified,
    emailPendingVerify,
    isSendingVerifyEmail,
    isCheckingVerify,
    displayEmail,
    authLoading,
    authUserId,
    emailSuccessMsg,
    emailErrorMsg,
    newEmail,
    emailPasswordConfirm,
    onNewEmailChange,
    onEmailPasswordConfirmChange,
    onConfirmVerification,
    onSendVerificationEmail,
    onChangeEmailSubmit,
    changePwdState,
    changePwdLoading,
    changePwdError,
    changePwdSuccess,
    onChangePwdStateChange,
    onChangePasswordSubmit,
    remoteSessions,
    sessionsLoading,
    revokingSessionId,
    isRevokingAll,
    onRevokeSession,
    onRevokeAllOtherSessions,
    dangerModal,
    dangerAlertMsg,
    onOpenDangerModal,
    onCloseDangerModal,
    onConfirmTextChange,
    onConfirmDangerAction,
}: AccountSettingsTabProps) {
    const { t } = useTranslation();
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [mountTime] = useState(() => Date.now());

    // Password visibility state
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);

    const isDeactivate = dangerModal.type === "deactivate";
    const requiredPhrase = isDeactivate ? "TAM NGUNG" : "XOA TAI KHOAN";
    const isPhraseValid = dangerModal.confirmText.trim().toUpperCase() === requiredPhrase;

    const handleCopyEmail = () => {
        if (!displayEmail) return;
        navigator.clipboard.writeText(displayEmail);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    // Memoize and process only active session data
    const {
        currentSession,
        currentInfo,
        activeOtherSessions,
        totalActiveSessionsCount,
    } = useMemo(() => {
        const currentTokenId = getCurrentSessionTokenId();
        const rawSessions: UserSessionDto[] = Array.isArray(remoteSessions)
            ? remoteSessions
            : remoteSessions && typeof remoteSessions === 'object'
            ? [
                  ...(Array.isArray((remoteSessions as UserSessionsResponseDto).active)
                      ? (remoteSessions as UserSessionsResponseDto).active!
                      : []),
                  ...(Array.isArray((remoteSessions as UserSessionsResponseDto).history)
                      ? (remoteSessions as UserSessionsResponseDto).history!
                      : []),
                  ...(Array.isArray((remoteSessions as { data?: UserSessionDto[] }).data)
                      ? (remoteSessions as { data?: UserSessionDto[] }).data!
                      : []),
              ]
            : [];

        const currentSessionIdx = rawSessions.findIndex(
            (s) => s.isCurrent || (currentTokenId && s.id === currentTokenId)
        );

        const localCurrentSession: UserSessionDto = {
            id: currentTokenId || 'session-current',
            user_id: authUserId || 'me',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Current Browser',
            ip_address: '127.0.0.1',
            created_at: new Date().toISOString(),
            isCurrent: true,
        };

        let currSession: UserSessionDto;
        let othSessions: UserSessionDto[];

        if (currentSessionIdx !== -1) {
            currSession = { ...rawSessions[currentSessionIdx], isCurrent: true };
            othSessions = rawSessions.filter((_, idx) => idx !== currentSessionIdx);
        } else if (rawSessions.length > 0) {
            const firstActiveIdx = rawSessions.findIndex((s) => !s.revoked_at && !s.isRevoked);
            const chosenIdx = firstActiveIdx !== -1 ? firstActiveIdx : 0;
            currSession = { ...rawSessions[chosenIdx], isCurrent: true };
            othSessions = rawSessions.filter((_, idx) => idx !== chosenIdx);
        } else {
            currSession = localCurrentSession;
            othSessions = [];
        }

        const currInfo = parseSessionDeviceInfo(currSession);

        const activeSessions = othSessions.filter((s) => {
            const isRevoked = Boolean(s.revoked_at || s.isRevoked);
            const isExpired = s.expires_at ? new Date(s.expires_at).getTime() <= mountTime : false;
            return !isRevoked && !isExpired;
        });

        return {
            currentSession: currSession,
            currentInfo: currInfo,
            activeOtherSessions: activeSessions,
            totalActiveSessionsCount: (currSession ? 1 : 0) + activeSessions.length,
        };
    }, [remoteSessions, authUserId, mountTime]);

    const hasActiveOtherSessions = activeOtherSessions.length > 0;
    const currentIp = currentSession.ip_address || currentSession.ip;
    const currentSignedIn = formatSessionDateTime(currentSession.created_at || currentSession.lastActive);
    const currentExpires = currentSession.expires_at ? formatSessionDateTime(currentSession.expires_at) : null;

    return (
        <div className="space-y-8 animate-tab-enter">
            {/* Email Global Messages */}
            {emailSuccessMsg && (
                <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-fade-in shadow-xs">
                    <CheckCircle2 className="size-4.5 shrink-0" />
                    <span>{emailSuccessMsg}</span>
                </div>
            )}

            {emailErrorMsg && (
                <div className="p-4 bg-rose-500/10 text-rose-400 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-fade-in shadow-xs">
                    <AlertCircle className="size-4.5 shrink-0" />
                    <span>{emailErrorMsg}</span>
                </div>
            )}

            {/* Email & Password Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 1. Email Management Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-surface-inner flex flex-col justify-between space-y-4 shadow-sm">
                    <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Mail className="size-4 text-primary" />
                                <span className="text-xs font-extrabold uppercase tracking-wider text-text">
                                    {t('settings.account.emailCardTitle', { defaultValue: 'Email tài khoản' })}
                                </span>
                            </div>

                            <span
                                className={cn(
                                    "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1.5",
                                    isEmailVerified
                                        ? "bg-emerald-500/15 text-emerald-400"
                                        : emailPendingVerify
                                        ? "bg-amber-500/15 text-amber-400"
                                        : "bg-rose-500/15 text-rose-400"
                                )}
                            >
                                {isEmailVerified ? (
                                    <>
                                        <CheckCircle2 className="size-3" />
                                        <span>{t('settings.account.verified', { defaultValue: 'Đã xác minh' })}</span>
                                    </>
                                ) : emailPendingVerify ? (
                                    <>
                                        <Clock className="size-3" />
                                        <span>{t('settings.account.pendingVerify', { defaultValue: 'Chờ xác nhận' })}</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="size-3" />
                                        <span>{t('settings.account.unverified', { defaultValue: 'Chưa xác minh' })}</span>
                                    </>
                                )}
                            </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-surface flex items-center justify-between gap-3 shadow-xs">
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-text truncate">
                                    {displayEmail || (authLoading ? (
                                        <span className="text-text-muted font-normal italic">{t('common.loading', { defaultValue: 'Đang tải...' })}</span>
                                    ) : (
                                        <span className="text-text-muted font-normal italic">{t('settings.account.noEmail', { defaultValue: 'Chưa cập nhật' })}</span>
                                    ))}
                                </div>
                            </div>

                            {displayEmail && (
                                <button
                                    type="button"
                                    onClick={handleCopyEmail}
                                    title={t('settings.account.copyEmail', { defaultValue: 'Sao chép địa chỉ email' })}
                                    className="size-7 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text cursor-pointer flex items-center justify-center transition-colors"
                                >
                                    {copiedEmail ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                                </button>
                            )}
                        </div>

                        {/* Unverified Action Notice */}
                        {!isEmailVerified && (
                            <div className="p-3.5 rounded-xl bg-amber-500/[0.08] space-y-2.5">
                                <p className="text-[11px] text-amber-300 leading-relaxed font-medium">
                                    {emailPendingVerify
                                        ? t('settings.account.pendingVerifyNotice', {
                                              defaultValue: 'Đã gửi email xác thực. Vui lòng kiểm tra hộp thư của bạn để hoàn tất kích hoạt tài khoản.',
                                          })
                                        : t('settings.account.unverifiedNotice', {
                                              defaultValue: 'Vui lòng xác minh hòm thư để bảo vệ tài khoản và mở khóa đầy đủ tính năng thảo luận.',
                                          })}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-2">
                                    {emailPendingVerify ? (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={onConfirmVerification}
                                                disabled={isCheckingVerify}
                                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-xs"
                                            >
                                                {isCheckingVerify && <Loader2 className="size-3.5 animate-spin" />}
                                                <span>{t('settings.account.confirmVerifiedBtn', { defaultValue: 'Tôi đã xác minh' })}</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={onSendVerificationEmail}
                                                disabled={isSendingVerifyEmail}
                                                className="flex-1 bg-surface text-amber-300 hover:text-amber-200"
                                            >
                                                {isSendingVerifyEmail && <Loader2 className="size-3.5 animate-spin" />}
                                                <span>{t('settings.account.resendVerificationEmail', { defaultValue: 'Gửi lại email' })}</span>
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={onSendVerificationEmail}
                                            disabled={isSendingVerifyEmail}
                                            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs"
                                        >
                                            {isSendingVerifyEmail && <Loader2 className="size-3.5 animate-spin" />}
                                            <span>{t('settings.account.sendVerificationEmail', { defaultValue: 'Gửi email xác thực' })}</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Change Email Directly Visible Form */}
                    <form onSubmit={onChangeEmailSubmit} className="space-y-3 pt-2 border-t border-border/50">
                        <div className="text-xs font-bold text-text-muted">
                            {t('settings.account.changeEmailTitle', { defaultValue: 'Đổi địa chỉ Email' })}
                        </div>

                        <div className="space-y-2.5">
                            <div>
                                <label className="text-[11px] font-semibold text-text-muted block mb-1">
                                    {t('settings.account.newEmailLabel', { defaultValue: 'Email mới' })}
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={newEmail}
                                    onChange={(e) => onNewEmailChange(e.target.value)}
                                    placeholder={t('settings.account.newEmailPlaceholder', { defaultValue: 'Nhập email mới...' })}
                                    className="w-full bg-surface rounded-xl px-3.5 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-text-muted block mb-1">
                                    {t('settings.account.confirmCurrentPasswordLabel', { defaultValue: 'Mật khẩu hiện tại để xác nhận' })}
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={emailPasswordConfirm}
                                    onChange={(e) => onEmailPasswordConfirmChange(e.target.value)}
                                    placeholder={t('settings.account.currentPasswordPlaceholder', { defaultValue: 'Mật khẩu hiện tại...' })}
                                    className="w-full bg-surface rounded-xl px-3.5 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="sm"
                            disabled={!newEmail.trim() || !emailPasswordConfirm}
                            className="w-full mt-1 bg-primary hover:bg-primary-hover text-white font-bold shadow-md shadow-primary/20"
                        >
                            {t('settings.account.updateEmailBtn', { defaultValue: 'Cập nhật Email' })}
                        </Button>
                    </form>
                </div>

                {/* 2. Password Management Card */}
                <div className="p-5 sm:p-6 rounded-2xl bg-surface-inner flex flex-col justify-between space-y-4 shadow-sm">
                    <form onSubmit={onChangePasswordSubmit} className="space-y-3.5 flex flex-col h-full justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <KeyRound className="size-4 text-primary" />
                                <span className="text-xs font-extrabold uppercase tracking-wider text-text">
                                    {t('settings.account.changePasswordTitle', { defaultValue: 'Đổi mật khẩu' })}
                                </span>
                            </div>

                            {changePwdError && (
                                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-bold flex items-center gap-2">
                                    <AlertCircle className="size-4 shrink-0" />
                                    <span>{changePwdError}</span>
                                </div>
                            )}

                            {changePwdSuccess && (
                                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2">
                                    <CheckCircle2 className="size-4 shrink-0" />
                                    <span>{changePwdSuccess}</span>
                                </div>
                            )}

                            <div className="space-y-2.5">
                                {/* Current Password */}
                                <div>
                                    <label className="text-[11px] font-semibold text-text-muted block mb-1">
                                        {t('settings.account.currentPasswordLabel', { defaultValue: 'Mật khẩu hiện tại' })}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPwd ? "text" : "password"}
                                            required
                                            value={changePwdState.currentPassword}
                                            onChange={(e) =>
                                                onChangePwdStateChange({
                                                    ...changePwdState,
                                                    currentPassword: e.target.value,
                                                })
                                            }
                                            placeholder={t('settings.account.currentPasswordPlaceholder', { defaultValue: 'Nhập mật khẩu hiện tại...' })}
                                            className="w-full bg-surface rounded-xl pl-3.5 pr-9 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
                                        >
                                            {showCurrentPwd ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="text-[11px] font-semibold text-text-muted block mb-1">
                                        {t('settings.account.newPasswordLabel', { defaultValue: 'Mật khẩu mới' })}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPwd ? "text" : "password"}
                                            required
                                            value={changePwdState.newPassword}
                                            onChange={(e) =>
                                                onChangePwdStateChange({
                                                    ...changePwdState,
                                                    newPassword: e.target.value,
                                                })
                                            }
                                            placeholder={t('settings.account.newPasswordPlaceholder', { defaultValue: 'Mật khẩu mới...' })}
                                            className="w-full bg-surface rounded-xl pl-3.5 pr-9 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPwd(!showNewPwd)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
                                        >
                                            {showNewPwd ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                        </button>
                                    </div>
                                    <PasswordRequirements password={changePwdState.newPassword} className="mt-2" />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="text-[11px] font-semibold text-text-muted block mb-1">
                                        {t('settings.account.confirmNewPasswordLabel', { defaultValue: 'Xác nhận mật khẩu mới' })}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPwd ? "text" : "password"}
                                            required
                                            value={changePwdState.confirmPassword}
                                            onChange={(e) =>
                                                onChangePwdStateChange({
                                                    ...changePwdState,
                                                    confirmPassword: e.target.value,
                                                })
                                            }
                                            placeholder={t('settings.account.confirmPasswordPlaceholder', { defaultValue: 'Xác nhận lại mật khẩu mới...' })}
                                            className="w-full bg-surface rounded-xl pl-3.5 pr-9 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text cursor-pointer"
                                        >
                                            {showConfirmPwd ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="sm"
                            disabled={changePwdLoading}
                            className="w-full mt-3 bg-primary hover:bg-primary-hover text-white font-bold shadow-md shadow-primary/20"
                        >
                            {changePwdLoading ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    <span>{t('settings.account.pwdProcessing', { defaultValue: 'Đang xử lý...' })}</span>
                                </>
                            ) : (
                                <span>{t('settings.account.updatePasswordBtn', { defaultValue: 'Cập nhật Mật khẩu' })}</span>
                            )}
                        </Button>
                    </form>
                </div>
            </div>

            {/* 3. Active Sessions Management Section (Cleaned, no expired logs) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface-inner space-y-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <Laptop className="size-4 text-primary" />
                        <span className="text-xs font-extrabold uppercase tracking-wider text-text">
                            {t('settings.account.activeSessions', { defaultValue: 'Thiết bị & Phiên làm việc' })}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface text-text-muted">
                            {t('settings.account.activeCount', { count: totalActiveSessionsCount, defaultValue: `${totalActiveSessionsCount} đang hoạt động` })}
                        </span>
                    </div>

                    {hasActiveOtherSessions && (
                        <Button
                            variant="destructive"
                            size="xs"
                            disabled={isRevokingAll}
                            onClick={onRevokeAllOtherSessions}
                            className="gap-1.5 font-bold"
                        >
                            {isRevokingAll ? <Loader2 className="size-3 animate-spin" /> : <LogOut className="size-3" />}
                            <span>{t('settings.account.revokeAllOtherSessions', { defaultValue: 'Thu hồi tất cả phiên khác' })}</span>
                        </Button>
                    )}
                </div>

                {sessionsLoading ? (
                    <div className="p-8 text-center text-xs text-text-muted space-y-2">
                        <Loader2 className="size-5 animate-spin text-primary mx-auto" />
                        <p>{t('common.loading', { defaultValue: 'Đang tải thông tin phiên...' })}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Current Device Highlight */}
                        <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent space-y-2 shadow-xs">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="size-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
                                        <SessionDeviceIcon os={currentInfo.os} device={currentInfo.device} deviceType={currentInfo.deviceType} isMobile={currentInfo.isMobile} className="size-4.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-text truncate">
                                                {currentInfo.name}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 shrink-0">
                                                {t('settings.account.currentBadge', { defaultValue: 'Thiết bị này' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>{t('settings.account.runningSession', { defaultValue: 'Đang hoạt động' })}</span>
                                </div>
                            </div>

                            <div className="text-[11px] text-text-muted flex items-center gap-x-2 gap-y-1 flex-wrap pt-1">
                                {currentIp && <span>IP: <strong className="text-text">{currentIp}</strong></span>}
                                {currentIp && currentSignedIn && <span>·</span>}
                                {currentSignedIn && (
                                    <span>{t('settings.account.signedInAt', { defaultValue: 'Đăng nhập lúc' })} {currentSignedIn}</span>
                                )}
                                {currentExpires && (
                                    <>
                                        <span>·</span>
                                        <span>{t('settings.account.expiresAt', { defaultValue: 'Hết hạn' })} {currentExpires}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Other Active Sessions */}
                        <div className="space-y-2 pt-1">
                            <div className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">
                                {t('settings.account.otherSessionsTitle', { defaultValue: 'Các phiên đăng nhập khác' })} ({activeOtherSessions.length})
                            </div>

                            {activeOtherSessions.length > 0 ? (
                                <div className="space-y-2">
                                    {activeOtherSessions.map((session) => {
                                        const info = parseSessionDeviceInfo(session);
                                        const isRevoking = revokingSessionId === session.id;
                                        const ip = session.ip_address || session.ip;
                                        const lastActiveDate = session.lastActive
                                            ? formatSessionDateOnly(session.lastActive)
                                            : session.created_at
                                            ? formatSessionDateOnly(session.created_at)
                                            : null;

                                        return (
                                            <div
                                                key={session.id}
                                                className="p-3.5 rounded-xl bg-surface hover:bg-surface-hover flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-xs"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="size-8 rounded-lg bg-surface-inner text-text-muted flex items-center justify-center shrink-0">
                                                        <SessionDeviceIcon os={info.os} device={info.device} deviceType={info.deviceType} isMobile={info.isMobile} className="size-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-bold text-text truncate">
                                                            {info.name}
                                                        </div>
                                                        <div className="text-[11px] text-text-muted flex items-center gap-1.5 flex-wrap">
                                                            {ip && <span>IP: {ip}</span>}
                                                            {ip && lastActiveDate && <span>·</span>}
                                                            {lastActiveDate && (
                                                                <span>
                                                                    {session.lastActive
                                                                        ? `${t('settings.account.lastActiveAt', { defaultValue: 'Hoạt động gần nhất' })} ${lastActiveDate}`
                                                                        : `${t('settings.account.signedInAt', { defaultValue: 'Đăng nhập lúc' })} ${lastActiveDate}`}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-end sm:self-center">
                                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                                                        <span className="size-1.5 rounded-full bg-emerald-400" />
                                                        <span>{t('settings.account.active', { defaultValue: 'Hoạt động' })}</span>
                                                    </span>

                                                    <Button
                                                        variant="destructive"
                                                        size="xs"
                                                        disabled={isRevoking}
                                                        onClick={() => onRevokeSession(session.id)}
                                                        className="font-bold"
                                                    >
                                                        {isRevoking && <Loader2 className="size-3 animate-spin" />}
                                                        <span>{t('settings.account.revokeSession', { defaultValue: 'Thu hồi' })}</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-xs text-text-muted bg-surface/50 rounded-xl">
                                    {t('settings.account.noSessions', { defaultValue: 'Không có phiên đăng nhập nào khác trên thiết bị lạ.' })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 4. Danger Zone Section - Seamlessly integrated at the footer of Account */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface-inner space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-rose-500" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-rose-500">
                        {t('settings.danger.title', { defaultValue: 'Vùng nguy hiểm' })}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Deactivate */}
                    <div className="p-4 rounded-xl bg-surface flex flex-col justify-between space-y-3 shadow-xs">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                                <UserMinus className="size-4" />
                                <span>{t('settings.danger.deactivateTitle', { defaultValue: 'Tạm ngưng tài khoản' })}</span>
                            </div>
                            <p className="text-[11px] text-text-muted leading-relaxed">
                                {t('settings.danger.deactivateDesc', {
                                    defaultValue: 'Ẩn toàn bộ hồ sơ và hoạt động của bạn. Kích hoạt lại bất kỳ lúc nào bằng cách đăng nhập lại.',
                                })}
                            </p>
                        </div>

                        <Button
                            size="sm"
                            onClick={() => onOpenDangerModal("deactivate")}
                            className="w-full bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold transition-colors"
                        >
                            {t('settings.danger.deactivateBtn', { defaultValue: 'Tạm ngưng tài khoản' })}
                        </Button>
                    </div>

                    {/* Delete */}
                    <div className="p-4 rounded-xl bg-surface flex flex-col justify-between space-y-3 shadow-xs">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                                <Trash2 className="size-4" />
                                <span>{t('settings.danger.deleteTitle', { defaultValue: 'Xóa tài khoản vĩnh viễn' })}</span>
                            </div>
                            <p className="text-[11px] text-text-muted leading-relaxed">
                                {t('settings.danger.deleteDesc', {
                                    defaultValue: 'Xóa toàn bộ hồ sơ, dữ liệu cá nhân vĩnh viễn. Hành động này không thể hoàn tác.',
                                })}
                            </p>
                        </div>

                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onOpenDangerModal("delete")}
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/30"
                        >
                            {t('settings.danger.deleteBtn', { defaultValue: 'Xóa vĩnh viễn tài khoản' })}
                        </Button>
                    </div>
                </div>
            </div>

            {/* DANGER CONFIRMATION MODAL */}
            <AppModal
                isOpen={dangerModal.open}
                onClose={onCloseDangerModal}
                title={
                    isDeactivate
                        ? t('settings.danger.deactivateModalTitle', { defaultValue: 'Xác nhận Tạm ngưng tài khoản' })
                        : t('settings.danger.deleteModalTitle', { defaultValue: 'Xác nhận Xóa tài khoản vĩnh viễn' })
                }
                subtitle={
                    isDeactivate
                        ? t('settings.account.dangerDeactivateSub', { defaultValue: 'Hành động tạm ngưng hoạt động của tài khoản' })
                        : t('settings.account.dangerDeleteSub', { defaultValue: 'CẢNH BÁO: Hành động này KHÔNG THỂ KHÔI PHỤC' })
                }
                variant="danger"
                maxWidth="md"
                footer={
                    <div className="flex items-center justify-end gap-2.5 w-full">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={onCloseDangerModal}
                            className="bg-surface-inner hover:bg-surface-hover text-text font-bold"
                        >
                            {t('common.cancel', { defaultValue: 'Hủy bỏ' })}
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            disabled={!isPhraseValid}
                            onClick={onConfirmDangerAction}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/30"
                        >
                            {isDeactivate
                                ? t('settings.danger.deactivateBtn', { defaultValue: 'Tạm ngưng tài khoản' })
                                : t('settings.danger.deleteBtn', { defaultValue: 'Xóa vĩnh viễn' })}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4 py-1">
                    <div className="p-4 rounded-xl bg-rose-500/10 flex items-start gap-3">
                        <ShieldAlert className="size-5 text-rose-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-rose-200 leading-relaxed font-medium">
                            {isDeactivate
                                ? t('settings.account.dangerDeactivateWarning', {
                                      defaultValue: 'Sau khi tạm ngưng, tài khoản của bạn sẽ bị ẩn khỏi mọi tìm kiếm và trang công khai cho tới khi bạn đăng nhập lại.',
                                  })
                                : t('settings.account.dangerDeleteWarning', {
                                      defaultValue: 'Toàn bộ dữ liệu của bạn sẽ bị xóa vĩnh viễn khỏi máy chủ. Bạn sẽ mất toàn bộ tiến trình game, bạn bè và bài viết.',
                                  })}
                        </div>
                    </div>

                    {dangerAlertMsg && (
                        <div className="p-3 rounded-lg bg-rose-500/15 text-rose-400 text-xs font-bold">
                            {dangerAlertMsg}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text block">
                            {isDeactivate
                                ? t('settings.danger.deactivatePrompt', { defaultValue: 'Vui lòng gõ "TAM NGUNG" vào ô bên dưới để xác nhận:' })
                                : t('settings.danger.deletePrompt', { defaultValue: 'Vui lòng gõ "XOA TAI KHOAN" vào ô bên dưới để xác nhận:' })}
                        </label>
                        <input
                            type="text"
                            value={dangerModal.confirmText}
                            onChange={(e) => onConfirmTextChange(e.target.value)}
                            placeholder={requiredPhrase}
                            className="w-full bg-surface-inner rounded-xl p-3 text-xs font-mono font-bold tracking-widest text-center text-text uppercase focus:outline-none focus:ring-1 focus:ring-rose-500 shadow-xs"
                        />
                    </div>
                </div>
            </AppModal>
        </div>
    );
}
