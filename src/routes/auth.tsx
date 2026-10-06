import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEye,
    faEyeSlash,
    faSpinner,
    faArrowLeft,
    faGamepad,
    faRightToBracket,
    faUserPlus,
    faExclamationTriangle,
    faPaperPlane,
    faLock,
    faChevronDown,
    faUserShield,
    faUserCheck,
    faDragon,
    faVideo,
    faCrosshairs,
    faUserXmark,
    faCheck,
    faBolt,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { useState, useRef, useEffect } from 'react';

import { STRENGTH_LEVELS, validatePassword, type PasswordValidationResult } from '../features/auth/helpers/passwordValidator';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useAuthStore, type AuthMode, TEST_ACCOUNTS } from '@/features/auth';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { authApi, profilesApi } from '@/shared/api';

// Account types available for selection
const ACCOUNT_TYPES = [
    {
        key: "admin",
        acc: TEST_ACCOUNTS.admin,
        typeLabel: "Quản trị viên (Admin)",
        badge: "Admin",
        badgeColor: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
        icon: faUserShield,
        iconColor: "text-rose-400",
        iconBg: "bg-rose-500/10",
        desc: "Toàn quyền hệ thống, kiểm duyệt và quản lý toàn bộ tính năng",
    },
    {
        key: "verifiedUser",
        acc: TEST_ACCOUNTS.verifiedUser,
        typeLabel: "Game thủ VIP (Founder)",
        badge: "Founder",
        badgeColor: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
        icon: faUserCheck,
        iconColor: "text-emerald-400",
        iconBg: "bg-emerald-500/10",
        desc: "Tài khoản VIP Founder, đã xác thực email, game library phong phú",
    },
    {
        key: "eldenLord",
        acc: TEST_ACCOUNTS.eldenLord,
        typeLabel: "Hardcore RPG Gamer",
        badge: "RPG Veteran",
        badgeColor: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
        icon: faDragon,
        iconColor: "text-cyan-400",
        iconBg: "bg-cyan-500/10",
        desc: "Game thủ Souls-like, nhiều thảo luận & hoạt động cộng đồng",
    },
    {
        key: "streamer",
        acc: TEST_ACCOUNTS.streamer,
        typeLabel: "Streamer & Creator",
        badge: "Streamer",
        badgeColor: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
        icon: faVideo,
        iconColor: "text-purple-400",
        iconBg: "bg-purple-500/10",
        desc: "Nhà sáng tạo nội dung, streamer được yêu thích trên nền tảng",
    },
    {
        key: "shadowHunter",
        acc: TEST_ACCOUNTS.shadowHunter,
        typeLabel: "Tuyển thủ FPS Pro",
        badge: "FPS Pro",
        badgeColor: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
        icon: faCrosshairs,
        iconColor: "text-blue-400",
        iconBg: "bg-blue-500/10",
        desc: "Đội trưởng CS2 Premier, tuyển thủ thi đấu bắn súng chiến thuật",
    },
    {
        key: "unverifiedUser",
        acc: TEST_ACCOUNTS.unverifiedUser,
        typeLabel: "Tân thủ (Chưa verify)",
        badge: "Chưa verify",
        badgeColor: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
        icon: faUserXmark,
        iconColor: "text-amber-400",
        iconBg: "bg-amber-500/10",
        desc: "Người chơi mới chưa xác thực email (dùng test cổng bảo vệ email)",
    },
];

const AuthPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const language = useThemeStore((state) => state.language);
    const toggleLanguage = useThemeStore((state) => state.toggleLanguage);
    const loginStoreAction = useAuthStore((state) => state.login);

    // Account Dropdown State
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const [selectedAccountKey, setSelectedAccountKey] = useState<string | null>(null);
    const accountMenuRef = useRef<HTMLDivElement>(null);

    // Close account dropdown when clicking outside or pressing Escape
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
                setIsAccountMenuOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsAccountMenuOpen(false);
            }
        };

        if (isAccountMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isAccountMenuOpen]);

    const getStrengthLabel = (score: number) => {
        switch (score) {
            case 1: return t('auth.pwdWeak', { defaultValue: 'Yếu' });
            case 2: return t('auth.pwdFair', { defaultValue: 'Trung bình' });
            case 3: return t('auth.pwdGood', { defaultValue: 'Khá' });
            case 4: return t('auth.pwdStrong', { defaultValue: 'Mạnh' });
            default: return t('auth.pwdWeak', { defaultValue: 'Yếu' });
        }
    };

    const [mode, setMode] = useState<AuthMode>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [isPasswordMatched, setIsPasswordMatched] = useState(true);

    // Error, Session Expired & Success Feedback states
    const [serverError, setServerError] = useState<string | null>(null);
    const [sessionExpired] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        const hasExpiredFlag =
            sessionStorage.getItem("indieg_session_expired") === "1" ||
            new URLSearchParams(window.location.search).get("expired") === "1";
        if (hasExpiredFlag) {
            sessionStorage.removeItem("indieg_session_expired");
            return true;
        }
        return false;
    });
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form inputs
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        otpCode: "",
    });

    const EMPTY_PASSWORD_STATE: PasswordValidationResult = {
        requirements: [],
        score: 0,
        isAllValid: false,
        strengthConfig: STRENGTH_LEVELS[1],
        isEmpty: true,
    };

    const [pwdState, setPwdState] = useState<PasswordValidationResult>(EMPTY_PASSWORD_STATE);

    const selectedAccount =
        ACCOUNT_TYPES.find((item) => item.key === selectedAccountKey) ||
        ACCOUNT_TYPES.find((item) => item.acc.email === formData.email);

    const handleSelectAccount = async (item: (typeof ACCOUNT_TYPES)[0]) => {
        const { acc } = item;
        if (!acc) return;
        setMode('login');
        setFormData({
            username: acc.username || "",
            email: acc.email || "",
            password: acc.password || "",
            confirmPassword: "",
            otpCode: "",
        });
        setSelectedAccountKey(item.key);
        setServerError(null);
        setSuccessMessage(`Đã chọn tài khoản: ${item.typeLabel} (${acc.username})`);
        setIsAccountMenuOpen(false);

        if (acc.password) {
            const result = await validatePassword(acc.password);
            setPwdState(result);
        }
    };

    const handleInstantLogin = (e: React.MouseEvent, acc: (typeof TEST_ACCOUNTS)[string]) => {
        e.stopPropagation();
        loginStoreAction(acc, `mock_token_${acc.id}`, `mock_refresh_${acc.id}`);
        setIsAccountMenuOpen(false);
        navigate({ to: "/" });
    };

    const switchMode = async (newMode: AuthMode) => {
        setMode(newMode);
        setServerError(null);
        setSuccessMessage(null);
        setFormData({
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            otpCode: "",
        });
        setIsShowPassword(false);
        const result = await validatePassword("");
        setPwdState(result);
        setIsPasswordMatched(true);
    };

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        setServerError(null);

        if (id === "password") {
            const result = await validatePassword(value);
            setPwdState(result);
        }

        if (id === "confirmPassword") {
            setIsPasswordMatched(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setServerError(null);
        setSuccessMessage(null);

        // --- LOGIN FLOW ---
        if (mode === 'login') {
            if (!formData.email.trim()) {
                setServerError(t('auth.errRequireEmailUsername', { defaultValue: 'Vui lòng nhập email hoặc tên đăng nhập.' }));
                return;
            }
            if (!formData.password) {
                setServerError(t('auth.errRequirePassword', { defaultValue: 'Vui lòng nhập mật khẩu.' }));
                return;
            }

            setIsLoading(true);
            try {
                let accessToken: string | undefined;
                let userProfile: Record<string, unknown> | null = null;

                try {
                    const res = await authApi.login({
                        email: formData.email.trim(),
                        password: formData.password,
                    });
                    const anyRes = res as unknown as Record<string, unknown>;
                    accessToken =
                        res.accessToken ||
                        res.token ||
                        (anyRes.access_token as string) ||
                        ((anyRes.data as Record<string, unknown>)?.accessToken as string) ||
                        ((anyRes.data as Record<string, unknown>)?.token as string);
                    userProfile =
                        (res.user as Record<string, unknown>) ||
                        ((anyRes.data as Record<string, unknown>)?.user as Record<string, unknown>) ||
                        (anyRes.userProfile as Record<string, unknown>) ||
                        (anyRes.data as Record<string, unknown>) ||
                        (res.id ? anyRes : null);

                    if (accessToken) {
                        try {
                            localStorage.setItem("indieg_access_token", accessToken);
                            localStorage.setItem("access_token", accessToken);
                            const me = await profilesApi.getMyProfile();
                            if (me && (me.id || me.username)) {
                                userProfile = me as unknown as Record<string, unknown>;
                            }
                        } catch {
                            // continue with existing response
                        }
                    }
                } catch (apiErr: unknown) {
                    const emailLower = formData.email.toLowerCase();
                    if (emailLower.includes("unverified") && formData.password !== "error") {
                        userProfile = TEST_ACCOUNTS.unverifiedUser as unknown as Record<string, unknown>;
                    } else {
                        throw apiErr;
                    }
                }

                const userObj = userProfile
                    ? {
                          id: (userProfile.id as string) || "usr_" + Math.random().toString(36).substring(2, 9),
                          email: (userProfile.email as string) || formData.email,
                          username: (userProfile.username as string) || (userProfile.name as string) || formData.email.split("@")[0] || "IndiePlayer",
                          name: (userProfile.name as string) || (userProfile.username as string) || formData.email.split("@")[0] || "IndiePlayer",
                          avatar_url: (userProfile.avatarUrl as string) || (userProfile.avatar_url as string),
                          avatarUrl: (userProfile.avatarUrl as string) || (userProfile.avatar_url as string),
                          role: ((userProfile.role as 'admin' | 'moderator' | 'user') || "user"),
                          isVerified: userProfile.isVerified === true || userProfile.isEmailVerified === true,
                      }
                    : {
                          id: "usr_" + Math.random().toString(36).substring(2, 9),
                          email: formData.email,
                          username: formData.email.split("@")[0] || "IndiePlayer",
                          name: formData.email.split("@")[0] || "IndiePlayer",
                          role: "user" as const,
                          isVerified: false,
                      };

                loginStoreAction(userObj, accessToken);
                setSuccessMessage(t('auth.msgLoginSuccess', { defaultValue: 'Đăng nhập thành công! Đang chuyển hướng...' }));
                setTimeout(() => {
                    navigate({ to: "/" });
                }, 600);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : t('auth.errSystemConnection', { defaultValue: 'Đã xảy ra lỗi kết nối hệ thống. Vui lòng thử lại.' });
                setServerError(message);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // --- REGISTER FLOW ---
        if (mode === 'register') {
            if (!formData.email.includes("@")) {
                setServerError(t('auth.errInvalidEmail', { defaultValue: 'Địa chỉ email không hợp lệ.' }));
                return;
            }

            const isPasswordValid = pwdState.requirements.every((req) => req.isMet);
            if (!isPasswordValid) {
                setServerError(t('auth.errPasswordWeak', { defaultValue: 'Mật khẩu chưa đạt đủ yêu cầu độ mạnh.' }));
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setIsPasswordMatched(false);
                setServerError(t('auth.errPasswordMatch', { defaultValue: 'Mật khẩu xác nhận không trùng khớp.' }));
                return;
            }

            setIsLoading(true);
            try {
                await authApi.register({
                    email: formData.email.trim(),
                    password: formData.password,
                });

                let accessToken: string | undefined;
                let userProfile: Record<string, unknown> | null = null;

                try {
                    const loginRes = await authApi.login({
                        email: formData.email.trim(),
                        password: formData.password,
                    });
                    accessToken = loginRes.accessToken || loginRes.token;
                    userProfile = (loginRes.user as Record<string, unknown>) || null;

                    if (accessToken) {
                        try {
                            localStorage.setItem("indieg_access_token", accessToken);
                            localStorage.setItem("access_token", accessToken);
                            const me = await profilesApi.getMyProfile();
                            if (me && me.id) {
                                userProfile = me as unknown as Record<string, unknown>;
                            }
                        } catch {
                            // continue with existing response
                        }
                    }
                } catch {
                    // Fallback to local session
                }

                const userObj = userProfile
                    ? {
                          id: (userProfile.id as string) || "usr_" + Math.random().toString(36).substring(2, 9),
                          email: (userProfile.email as string) || formData.email,
                          username: (userProfile.username as string) || (userProfile.name as string) || formData.email.split("@")[0] || "IndiePlayer",
                          name: (userProfile.name as string) || (userProfile.username as string) || formData.email.split("@")[0] || "IndiePlayer",
                          avatar_url: (userProfile.avatarUrl as string) || (userProfile.avatar_url as string),
                          avatarUrl: (userProfile.avatarUrl as string) || (userProfile.avatar_url as string),
                          role: ((userProfile.role as 'admin' | 'moderator' | 'user') || "user"),
                          isVerified: userProfile.isVerified === true || userProfile.isEmailVerified === true,
                      }
                    : {
                          id: "usr_" + Math.random().toString(36).substring(2, 9),
                          email: formData.email,
                          username: formData.email.split("@")[0] || "IndiePlayer",
                          name: formData.email.split("@")[0] || "IndiePlayer",
                          role: "user" as const,
                          isVerified: false,
                      };

                loginStoreAction(userObj, accessToken);
                setSuccessMessage(t('auth.msgRegisterSuccess', { defaultValue: 'Đăng ký thành công! Đang chuyển hướng...' }));
                setTimeout(() => {
                    navigate({ to: "/" });
                }, 600);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : t('auth.errRegisterFail', { defaultValue: 'Không thể tạo tài khoản lúc này. Thử lại sau.' });
                setServerError(message);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // --- FORGOT PASSWORD FLOW ---
        if (mode === 'forgot-password') {
            if (!formData.email.includes("@")) {
                setServerError(t('auth.errInvalidEmail', { defaultValue: 'Vui lòng nhập địa chỉ email hợp lệ.' }));
                return;
            }

            setIsLoading(true);
            try {
                await authApi.forgotPassword({
                    email: formData.email.trim(),
                });

                setSuccessMessage(t('auth.msgForgotSuccess', { email: formData.email, defaultValue: `Link & mã khôi phục mật khẩu đã gửi tới ${formData.email}. Hãy nhập mã bên dưới!` }));
                setTimeout(() => {
                    setMode('reset-password');
                }, 1200);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : t('auth.errSendResetFail', { defaultValue: 'Không thể gửi email khôi phục. Vui lòng thử lại.' });
                setServerError(message);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // --- VERIFY EMAIL FLOW ---
        if (mode === 'verify-email') {
            if (!formData.otpCode.trim()) {
                setServerError(t('auth.errOtpLength', { defaultValue: 'Vui lòng nhập mã xác thực token.' }));
                return;
            }

            setIsLoading(true);
            try {
                await authApi.verifyEmail(formData.otpCode.trim());

                setSuccessMessage(t('auth.msgVerifySuccess', { defaultValue: 'Xác thực email thành công! Tài khoản của bạn đã sẵn sàng.' }));
                const verifiedUser = {
                    id: "usr_v_" + Math.random().toString(36).substring(2, 9),
                    email: formData.email || "gamer@indieg.com",
                    username: formData.username || "VerifiedGamer",
                    isVerified: true,
                };
                loginStoreAction(verifiedUser);
                setTimeout(() => {
                    navigate({ to: "/" });
                }, 800);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : t('auth.errVerifyFail', { defaultValue: 'Xác thực thất bại. Vui lòng kiểm tra lại mã.' });
                setServerError(message);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // --- RESET PASSWORD FLOW ---
        if (mode === 'reset-password') {
            const isPasswordValid = pwdState.requirements.every((req) => req.isMet);
            if (!isPasswordValid) {
                setServerError(t('auth.errPasswordWeak', { defaultValue: 'Mật khẩu mới chưa đủ độ mạnh yêu cầu.' }));
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setIsPasswordMatched(false);
                setServerError(t('auth.errPasswordMatch', { defaultValue: 'Mật khẩu xác nhận không trùng khớp.' }));
                return;
            }

            setIsLoading(true);
            try {
                await authApi.resetPassword({
                    token: formData.otpCode.trim() || "token",
                    newPassword: formData.password,
                });

                setSuccessMessage(t('auth.msgResetSuccess', { defaultValue: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.' }));
                setTimeout(() => {
                    switchMode('login');
                }, 1200);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : t('auth.errResetFail', { defaultValue: 'Không thể đặt lại mật khẩu. Vui lòng thử lại.' });
                setServerError(message);
            } finally {
                setIsLoading(false);
            }
            return;
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-bg text-text flex flex-col justify-between overflow-x-hidden selection:bg-primary/20 selection:text-primary">
            {/* Subtle gaming atmospheric background pattern (faint, distraction-free) */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

            {/* Top Navigation Header */}
            <header className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
                {/* Brand Logo */}
                <button
                    onClick={() => navigate({ to: "/" })}
                    className="flex items-center gap-3 group cursor-pointer"
                >
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                        <FontAwesomeIcon icon={faGamepad} className="text-lg" />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-xl font-black tracking-tight text-primary leading-none">
                            IndieG
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-faint mt-0.5">
                            Gaming Community
                        </span>
                    </div>
                </button>

                {/* Right Controls */}
                <div className="flex items-center gap-2 sm:gap-3 bg-surface/40 backdrop-blur-md border border-border/40 p-1.5 rounded-full relative">
                    <button
                        onClick={() => navigate({ to: "/" })}
                        className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-hover/60 transition-colors cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                        <span className="hidden sm:inline">{t('common.home', { defaultValue: 'Trang chủ' })}</span>
                    </button>

                    <div className="w-px h-3.5 bg-border/40" />

                    <button
                        onClick={toggleLanguage}
                        title={t('common.switchLanguage', { defaultValue: 'Đổi ngôn ngữ' })}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                        {language.toUpperCase()}
                    </button>

                    <div className="w-px h-3.5 bg-border/40" />

                    {/* Account Type Selector Dropdown Menu (Replaces dark/light mode toggle) */}
                    <div className="relative" ref={accountMenuRef}>
                        <button
                            type="button"
                            onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                isAccountMenuOpen
                                    ? "bg-primary text-white shadow-md shadow-primary/25"
                                    : "text-text-muted hover:text-text hover:bg-surface-hover/60"
                            }`}
                            aria-expanded={isAccountMenuOpen}
                            aria-haspopup="true"
                            title="Chọn loại tài khoản để đăng nhập"
                        >
                            <FontAwesomeIcon icon={faUsers} className="text-xs" />
                            <span>{selectedAccount ? selectedAccount.badge : "Tài khoản"}</span>
                            <FontAwesomeIcon
                                icon={faChevronDown}
                                className={`text-[9px] transition-transform duration-200 ${
                                    isAccountMenuOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {/* Dropdown Menu - Drops Downwards */}
                        {isAccountMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-surface/95 backdrop-blur-2xl border border-border shadow-2xl p-2.5 z-50 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[80vh] overflow-y-auto">
                                <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/40">
                                    <div className="flex items-center gap-1.5">
                                        <FontAwesomeIcon icon={faUsers} className="text-primary text-xs" />
                                        <span className="text-xs font-bold text-text">Chọn loại tài khoản đăng nhập</span>
                                    </div>
                                    <span className="text-[10px] text-text-faint font-medium">
                                        {ACCOUNT_TYPES.length} tài khoản
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1.5 pt-1">
                                    {ACCOUNT_TYPES.map((item) => {
                                        const isSelected = selectedAccountKey === item.key || formData.email === item.acc.email;
                                        return (
                                            <div
                                                key={item.key}
                                                onClick={() => handleSelectAccount(item)}
                                                className={`group p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                                                    isSelected
                                                        ? "bg-primary/10 border-primary/40 ring-1 ring-primary/30"
                                                        : "bg-surface-hover/20 hover:bg-surface-hover/60 border-border/30 hover:border-border/60"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}>
                                                        <FontAwesomeIcon icon={item.icon} className="text-sm" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="text-xs font-bold text-text truncate">
                                                                {item.typeLabel}
                                                            </span>
                                                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                                                                {item.badge}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-text-faint truncate font-mono mt-0.5">
                                                            {item.acc.email}
                                                        </p>
                                                        <p className="text-[10px] text-text-muted/80 truncate mt-0.5">
                                                            {item.desc}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleInstantLogin(e, item.acc)}
                                                        title="Đăng nhập ngay (1-click)"
                                                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-primary hover:bg-primary-hover text-white transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <FontAwesomeIcon icon={faBolt} className="text-[9px]" />
                                                        <span className="hidden sm:inline">Vào ngay</span>
                                                    </button>
                                                    {isSelected && (
                                                        <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]">
                                                            <FontAwesomeIcon icon={faCheck} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="px-2 py-1.5 mt-1 border-t border-border/30 flex items-center justify-between text-[10px] text-text-faint">
                                    <span>💡 Bấm hàng để chọn & điền form, hoặc "Vào ngay" để đăng nhập</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area: Focused on Form */}
            <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex items-center justify-center">
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    
                    {/* LEFT SIDE: Brand Identity (Concise, no clutter, no feature cards) */}
                    <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>A place for gamers to find their people</span>
                        </div>

                        {/* Heading reduced by ~30% per feedback */}
                        <div className="flex flex-col gap-3 max-w-md">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-text leading-tight">
                                Find games.<br />
                                Find people.<br />
                                <span className="text-primary">Find your place.</span>
                            </h1>
                            <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                                {t('auth.heroSubtitle', { defaultValue: 'Nơi kết nối đồng đội, chia sẻ đam mê và tìm thấy cộng đồng game thủ của bạn.' })}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Clean Floating Dark Glass Auth Panel */}
                    <div className="lg:col-span-6 w-full max-w-md mx-auto">
                        <div className="relative rounded-2xl bg-surface/50 backdrop-blur-xl border border-border/40 p-6 sm:p-8 flex flex-col gap-5 shadow-xl">
                            
                            {/* Simple Navigation: Sign in | Create account */}
                            {(mode === 'login' || mode === 'register') ? (
                                <div className="flex items-center gap-3 border-b border-border/30 pb-3">
                                    <button
                                        type="button"
                                        onClick={() => switchMode('login')}
                                        className={`text-sm sm:text-base font-bold transition-all cursor-pointer relative pb-1 ${
                                            mode === 'login'
                                                ? "text-text after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                                                : "text-text-muted hover:text-text"
                                        }`}
                                    >
                                        {t('auth.tabLogin', { defaultValue: 'Đăng nhập' })}
                                    </button>
                                    <span className="text-border/60 text-xs font-light">/</span>
                                    <button
                                        type="button"
                                        onClick={() => switchMode('register')}
                                        className={`text-sm sm:text-base font-bold transition-all cursor-pointer relative pb-1 ${
                                            mode === 'register'
                                                ? "text-text after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                                                : "text-text-muted hover:text-text"
                                        }`}
                                    >
                                        {t('auth.tabRegister', { defaultValue: 'Tạo tài khoản' })}
                                    </button>
                                </div>
                            ) : (
                                <div className="border-b border-border/30 pb-3">
                                    <h2 className="text-base font-bold text-text">
                                        {mode === 'forgot-password' && t('auth.forgotPasswordTitle', { defaultValue: 'Khôi phục mật khẩu' })}
                                        {mode === 'verify-email' && t('auth.verifyEmailTitle', { defaultValue: 'Xác thực email' })}
                                        {mode === 'reset-password' && t('auth.resetPasswordTitle', { defaultValue: 'Đặt mật khẩu mới' })}
                                    </h2>
                                    <p className="text-xs text-text-muted mt-0.5">
                                        {mode === 'forgot-password' && t('auth.forgotPasswordSubtitle', { defaultValue: 'Nhập email để nhận mã khôi phục.' })}
                                        {mode === 'verify-email' && t('auth.verifyEmailSubtitle', { defaultValue: 'Nhập mã OTP 6 chữ số đã được gửi tới email.' })}
                                        {mode === 'reset-password' && t('auth.resetPasswordSubtitle', { defaultValue: 'Nhập mật khẩu mới an toàn.' })}
                                    </p>
                                </div>
                            )}

                            {/* Session Expired Alert */}
                            {sessionExpired && (
                                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs shrink-0" />
                                    <span>{t('auth.sessionExpiredDesc', { defaultValue: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' })}</span>
                                </div>
                            )}

                            {/* Error Alert */}
                            {serverError && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs shrink-0" />
                                    <span>{serverError}</span>
                                </div>
                            )}

                            {/* Success Alert */}
                            {successMessage && (
                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                                    <FontAwesomeIcon icon={faCircleCheck} className="text-xs shrink-0" />
                                    <span>{successMessage}</span>
                                </div>
                            )}

                            {/* Streamlined Auth Form */}
                            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

                                {/* Quick Account Type Selector Hint */}
                                {mode === 'login' && (
                                    <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-surface-hover/30 border border-border/30">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FontAwesomeIcon icon={faUsers} className="text-primary text-xs shrink-0" />
                                            <span className="text-[11px] text-text-muted truncate">
                                                {selectedAccount ? (
                                                    <>
                                                        Loại tài khoản: <strong className="text-text font-bold">{selectedAccount.typeLabel}</strong>
                                                    </>
                                                ) : (
                                                    "Tài khoản mẫu để test:"
                                                )}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                                            className="text-primary hover:text-primary-hover font-semibold text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                                        >
                                            <span>{selectedAccount ? "Đổi loại" : "Chọn tài khoản"}</span>
                                            <FontAwesomeIcon icon={faChevronDown} className="text-[9px]" />
                                        </button>
                                    </div>
                                )}

                                {/* Email Field */}
                                {(mode === 'login' || mode === 'register' || mode === 'forgot-password') && (
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="email" className="text-xs font-semibold text-text-muted">
                                            {t('auth.emailLabel', { defaultValue: 'Email' })}
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder={t('auth.emailPlaceholder', { defaultValue: 'gamer@indieg.local' })}
                                            disabled={isLoading}
                                            className="w-full h-10 px-3 rounded-xl bg-surface-hover/30 border border-border/40 focus:border-primary/80 focus:bg-surface-hover/60 focus:outline-none text-sm text-text placeholder:text-text-faint transition-all"
                                            required
                                        />
                                    </div>
                                )}

                                {/* Password Field */}
                                {(mode === 'login' || mode === 'register' || mode === 'reset-password') && (
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="password" className="text-xs font-semibold text-text-muted">
                                                {mode === 'reset-password' ? t('auth.newPasswordLabel', { defaultValue: 'Mật khẩu mới' }) : t('auth.passwordLabel', { defaultValue: 'Mật khẩu' })}
                                            </label>
                                            {mode === 'login' && (
                                                <button
                                                    type="button"
                                                    onClick={() => switchMode('forgot-password')}
                                                    className="text-xs text-text-muted hover:text-primary transition-colors cursor-pointer"
                                                >
                                                    {t('auth.forgotPasswordLink', { defaultValue: 'Quên mật khẩu?' })}
                                                </button>
                                            )}
                                        </div>

                                        <div className="relative flex items-center">
                                            <input
                                                id="password"
                                                type={isShowPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="••••••••"
                                                disabled={isLoading}
                                                className="w-full h-10 pl-3 pr-9 rounded-xl bg-surface-hover/30 border border-border/40 focus:border-primary/80 focus:bg-surface-hover/60 focus:outline-none text-sm text-text placeholder:text-text-faint transition-all"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setIsShowPassword(!isShowPassword)}
                                                className="absolute right-3 text-text-faint hover:text-text text-xs p-1 cursor-pointer"
                                            >
                                                <FontAwesomeIcon icon={isShowPassword ? faEye : faEyeSlash} />
                                            </button>
                                        </div>

                                        {/* Compact Password Strength Indicator (no heavy cards) */}
                                        {(mode === 'register' || mode === 'reset-password') && !pwdState.isEmpty && (
                                            <div className="flex items-center gap-2 pt-1">
                                                <div className="flex-1 grid grid-cols-4 gap-1 h-1">
                                                    {[1, 2, 3, 4].map((level) => (
                                                        <div
                                                            key={level}
                                                            className={`h-full rounded-full transition-all duration-300 ${
                                                                level <= pwdState.score ? pwdState.strengthConfig.bg : "bg-border/30"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className={`text-[11px] font-medium ${pwdState.strengthConfig.color}`}>
                                                    {getStrengthLabel(pwdState.score)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Confirm Password Field */}
                                {(mode === 'register' || mode === 'reset-password') && (
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="confirmPassword" className="text-xs font-semibold text-text-muted">
                                            {t('auth.confirmPasswordLabel', { defaultValue: 'Xác nhận mật khẩu' })}
                                        </label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="••••••••"
                                            disabled={isLoading}
                                            className={`w-full h-10 px-3 rounded-xl bg-surface-hover/30 border focus:outline-none text-sm text-text placeholder:text-text-faint transition-all ${
                                                isPasswordMatched
                                                    ? "border-border/40 focus:border-primary/80 focus:bg-surface-hover/60"
                                                    : "border-rose-500/80 bg-rose-500/10"
                                            }`}
                                            required
                                        />
                                        {!isPasswordMatched && (
                                            <p className="text-rose-400 text-xs font-medium">
                                                {t('auth.passwordMismatch', { defaultValue: 'Mật khẩu xác nhận không trùng khớp' })}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* OTP Field (Verify Email) */}
                                {mode === 'verify-email' && (
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="otpCode" className="text-xs font-semibold text-text-muted">
                                            {t('auth.otpCodeLabel', { defaultValue: 'Mã xác thực OTP' })}
                                        </label>
                                        <input
                                            id="otpCode"
                                            type="text"
                                            maxLength={6}
                                            value={formData.otpCode}
                                            onChange={handleInputChange}
                                            placeholder="123456"
                                            disabled={isLoading}
                                            className="w-full h-10 px-3 rounded-xl bg-surface-hover/30 border border-border/40 focus:border-primary/80 focus:outline-none text-center font-mono tracking-widest text-base font-bold text-text transition-all"
                                            required
                                        />
                                        <p className="text-[11px] text-text-faint text-center">
                                            {t('auth.otpDemoHint', { defaultValue: 'Mã thử nghiệm:' })} <span className="font-mono font-bold text-primary">123456</span>
                                        </p>
                                    </div>
                                )}

                                {/* Primary Action CTA */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-10 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
                                            <span>{t('auth.btnProcessing', { defaultValue: 'Đang xử lý...' })}</span>
                                        </>
                                    ) : mode === 'login' ? (
                                        <>
                                            <FontAwesomeIcon icon={faRightToBracket} className="text-xs" />
                                            <span>{t('auth.btnLoginNow', { defaultValue: 'Đăng nhập' })}</span>
                                        </>
                                    ) : mode === 'register' ? (
                                        <>
                                            <FontAwesomeIcon icon={faUserPlus} className="text-xs" />
                                            <span>{t('auth.btnRegisterNow', { defaultValue: 'Tạo tài khoản' })}</span>
                                        </>
                                    ) : mode === 'forgot-password' ? (
                                        <>
                                            <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
                                            <span>{t('auth.btnSendRecovery', { defaultValue: 'Gửi mã khôi phục' })}</span>
                                        </>
                                    ) : mode === 'verify-email' ? (
                                        <>
                                            <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
                                            <span>{t('auth.btnVerifyEmail', { defaultValue: 'Xác thực' })}</span>
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faLock} className="text-xs" />
                                            <span>{t('auth.btnSaveNewPassword', { defaultValue: 'Lưu mật khẩu mới' })}</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Secondary Navigation Links */}
                            <div className="text-center pt-1 text-xs text-text-muted">
                                {mode === 'login' ? (
                                    <span>
                                        {t('auth.noAccountPrompt', { defaultValue: 'Chưa có tài khoản?' })}{' '}
                                        <button
                                            type="button"
                                            onClick={() => switchMode('register')}
                                            className="text-primary hover:underline font-semibold cursor-pointer"
                                        >
                                            {t('auth.tabRegister', { defaultValue: 'Tạo tài khoản' })}
                                        </button>
                                    </span>
                                ) : mode === 'register' ? (
                                    <span>
                                        {t('auth.hasAccountPrompt', { defaultValue: 'Đã có tài khoản?' })}{' '}
                                        <button
                                            type="button"
                                            onClick={() => switchMode('login')}
                                            className="text-primary hover:underline font-semibold cursor-pointer"
                                        >
                                            {t('auth.tabLogin', { defaultValue: 'Đăng nhập' })}
                                        </button>
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => switchMode('login')}
                                        className="text-text-muted hover:text-text transition-colors cursor-pointer"
                                    >
                                        {t('auth.backToLogin', { defaultValue: '← Quay lại Đăng nhập' })}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Clean Minimal Footer */}
            <footer className="relative z-20 w-full border-t border-border/30 py-4 text-center text-xs text-text-faint">
                <p>{t('auth.footerRights', { defaultValue: '© 2026 IndieG Gaming Community. All rights reserved.' })}</p>
            </footer>
        </div>
    );
};

export const Route = createFileRoute('/auth')({
    beforeLoad: () => {
        const { user, mockLogin } = useAuthStore.getState();

        if (user || mockLogin) {
            throw redirect({
                to: '/',
                replace: true
            });
        }
    },
    component: AuthPage,
});
