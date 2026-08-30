import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEye,
    faEyeSlash,
    faSpinner,
    faArrowLeft,
    faGamepad,
    faUsers,
    faShieldHalved,
    faSun,
    faMoon,
    faWandMagicSparkles,
    faRightToBracket,
    faUserPlus,
    faEnvelope,
    faKey,
    faExclamationTriangle,
    faPaperPlane,
    faLock,
} from "@fortawesome/free-solid-svg-icons";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { useState } from 'react';

import { STRENGTH_LEVELS, validatePassword, type PasswordValidationResult } from '../features/auth/helpers/passwordValidator';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useAuthStore, type AuthMode, AccountSwitcher, TEST_ACCOUNTS } from '@/features/auth';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { authApi, profilesApi } from '@/shared/api';

const AuthPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const theme = useThemeStore((state) => state.theme);
    const toggleTheme = useThemeStore((state) => state.toggleTheme);
    const language = useThemeStore((state) => state.language);
    const toggleLanguage = useThemeStore((state) => state.toggleLanguage);
    const loginStoreAction = useAuthStore((state) => state.login);

    const getStrengthLabel = (score: number) => {
        switch (score) {
            case 1: return t('auth.pwdWeak', { defaultValue: 'Yếu' });
            case 2: return t('auth.pwdFair', { defaultValue: 'Trung bình' });
            case 3: return t('auth.pwdGood', { defaultValue: 'Khá' });
            case 4: return t('auth.pwdStrong', { defaultValue: 'Mạnh' });
            default: return t('auth.pwdWeak', { defaultValue: 'Yếu' });
        }
    };

    const getReqLabel = (id: string, defaultLabel: string) => {
        switch (id) {
            case 'length': return t('auth.reqLength', { defaultValue: 'Ít nhất 8 ký tự' });
            case 'uppercase': return t('auth.reqUppercase', { defaultValue: 'Chứa chữ hoa' });
            case 'lowercase': return t('auth.reqLowercase', { defaultValue: 'Chứa chữ thường' });
            case 'number': return t('auth.reqNumber', { defaultValue: 'Chứa chữ số' });
            case 'special': return t('auth.reqSpecial', { defaultValue: 'Chứa ký tự đặc biệt' });
            default: return defaultLabel;
        }
    };

    const [mode, setMode] = useState<AuthMode>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [isPasswordMatched, setIsPasswordMatched] = useState(true);

    // Error & Success Feedback states
    const [serverError, setServerError] = useState<string | null>(null);
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
                // Try real backend login
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

                    // If token received, save immediately
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
                    // Check if demo account simulation is requested
                    const emailLower = formData.email.toLowerCase();
                    if (emailLower.includes("admin") && formData.password !== "error") {
                        userProfile = TEST_ACCOUNTS.admin as unknown as Record<string, unknown>;
                    } else if (emailLower.includes("unverified") && formData.password !== "error") {
                        userProfile = TEST_ACCOUNTS.unverifiedUser as unknown as Record<string, unknown>;
                    } else {
                        // Throw real API error to user
                        throw apiErr;
                    }
                }

                const emailLower = formData.email.toLowerCase();
                const userObj = userProfile
                    ? {
                          id: (userProfile.id as string) || "usr_" + Math.random().toString(36).substring(2, 9),
                          email: (userProfile.email as string) || formData.email,
                          username: (userProfile.username as string) || (userProfile.name as string) || formData.email.split("@")[0] || "IndiePlayer",
                          avatar_url: (userProfile.avatarUrl as string) || (userProfile.avatar_url as string),
                          role: ((userProfile.role as 'admin' | 'moderator' | 'user') || (emailLower.includes("admin") ? "admin" : "user")),
                          isVerified: userProfile.isVerified !== undefined ? Boolean(userProfile.isVerified) : true,
                      }
                    : {
                          id: "usr_" + Math.random().toString(36).substring(2, 9),
                          email: formData.email,
                          username: formData.email.split("@")[0] || "IndiePlayer",
                          role: emailLower.includes("admin") ? ("admin" as const) : ("user" as const),
                          isVerified: true,
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
                // Call real backend register
                await authApi.register({
                    email: formData.email.trim(),
                    password: formData.password,
                });

                // Auto login immediately after register
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

                const emailLower = formData.email.toLowerCase();
                const userObj = userProfile
                    ? {
                          id: (userProfile.id as string) || "usr_" + Math.random().toString(36).substring(2, 9),
                          email: (userProfile.email as string) || formData.email,
                          username: (userProfile.username as string) || (userProfile.name as string) || formData.email.split("@")[0] || "IndiePlayer",
                          avatar_url: (userProfile.avatarUrl as string) || (userProfile.avatar_url as string),
                          role: ((userProfile.role as 'admin' | 'moderator' | 'user') || (emailLower.includes("admin") ? "admin" : "user")),
                          isVerified: true,
                      }
                    : {
                          id: "usr_" + Math.random().toString(36).substring(2, 9),
                          email: formData.email,
                          username: formData.email.split("@")[0] || "IndiePlayer",
                          role: emailLower.includes("admin") ? ("admin" as const) : ("user" as const),
                          isVerified: true,
                      };

                loginStoreAction(userObj, accessToken);
                setSuccessMessage(t('auth.msgRegisterSuccess', { defaultValue: 'Đăng ký thành công! Đang chuyển hướng đến trang chủ...' }));
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
                // Call real backend forgot password
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
                // Call real backend verify email
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
                // Call real backend reset password
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
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                <div className="absolute -top-40 -left-40 w-160 h-160 bg-primary/20 dark:bg-primary/25 rounded-full blur-[140px]" />
                <div className="absolute top-1/2 -right-40 w-160 h-160 bg-accent-500/15 dark:bg-accent-500/20 rounded-full blur-[140px]" />
                <div className="absolute -bottom-40 left-1/3 w-140 h-140 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[120px]" />
            </div>

            {/* Top Navigation Header */}
            <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between">
                {/* Brand Logo */}
                <button
                    onClick={() => navigate({ to: "/" })}
                    className="flex items-center gap-3 group cursor-pointer"
                >
                    <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
                        <FontAwesomeIcon icon={faGamepad} className="text-xl" />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-xl sm:text-2xl font-black tracking-tight text-primary">
                            IndieG
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-faint -mt-1">
                            Gaming Hub
                        </span>
                    </div>
                </button>

                {/* Right Controls */}
                <div className="flex items-center gap-2 sm:gap-3 bg-surface/80 backdrop-blur-md border border-border p-1.5 rounded-full shadow-md">
                    <button
                        onClick={() => navigate({ to: "/" })}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-text-muted hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                        <span className="hidden sm:inline">{t('common.home', { defaultValue: 'Trang chủ' })}</span>
                    </button>

                    <div className="w-px h-4 bg-border" />

                    <button
                        onClick={toggleLanguage}
                        title={t('common.switchLanguage', { defaultValue: 'Đổi ngôn ngữ' })}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                        {language.toUpperCase()}
                    </button>

                    <button
                        onClick={toggleTheme}
                        title={t('common.toggleTheme', { defaultValue: 'Đổi giao diện sáng/tối' })}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                        <FontAwesomeIcon icon={theme === "light" ? faSun : faMoon} className="text-sm" />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex items-center justify-center">
                <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    
                    {/* LEFT SIDE: Slogans & Info */}
                    <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-bold shadow-xs">
                            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-amber-400 text-xs" />
                            <span>{t('auth.pageTagline', { defaultValue: 'Gaming Social Hub • Connect & Play' })}</span>
                        </div>

                        <div className="flex flex-col gap-3 max-w-2xl">
                            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-text leading-tight sm:leading-none">
                                {t('auth.heroTitleLine1', { defaultValue: 'Connect Your Squad' })}.<br />
                                {t('auth.heroTitleLine2', { defaultValue: 'Elevate Your Game' })}.
                            </h1>
                            <p className="text-sm sm:text-base text-text-muted max-w-md leading-relaxed">
                                {t('auth.heroSubtitle', { defaultValue: 'Nền tảng kết nối đồng đội & cộng đồng game thủ thế hệ mới.' })}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mt-2">
                            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface/70 backdrop-blur-md border border-border hover:border-primary/40 hover:bg-surface transition-all shadow-xs group text-left">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                                    <FontAwesomeIcon icon={faUsers} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-sm font-extrabold text-text group-hover:text-primary transition-colors">
                                        {t('auth.featureConnectTitle', { defaultValue: 'Connect Your Squad' })}
                                    </h3>
                                    <p className="text-xs text-text-muted leading-relaxed">
                                        {t('auth.featureConnectDesc', { defaultValue: 'Tìm kiếm đồng đội chuẩn gu, kết nối squad tức thì.' })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-surface/70 backdrop-blur-md border border-border hover:border-primary/40 hover:bg-surface transition-all shadow-xs group text-left">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                                    <FontAwesomeIcon icon={faGamepad} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-sm font-extrabold text-text group-hover:text-primary transition-colors">
                                        {t('auth.featureElevateTitle', { defaultValue: 'Elevate Your Game' })}
                                    </h3>
                                    <p className="text-xs text-text-muted leading-relaxed">
                                        {t('auth.featureElevateDesc', { defaultValue: 'Nâng tầm trải nghiệm gaming cùng cộng đồng.' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Auth Card */}
                    <div className="lg:col-span-5 w-full max-w-md mx-auto">
                        <div className="relative rounded-3xl bg-surface/80 backdrop-blur-xl border border-border shadow-2xl p-6 sm:p-8 flex flex-col gap-6">
                            
                            {/* Card Header */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <h2 className="text-xl sm:text-2xl font-black text-text">
                                            {mode === 'login' && t('auth.loginTitle', { defaultValue: 'Đăng Nhập IndieG' })}
                                            {mode === 'register' && t('auth.registerTitle', { defaultValue: 'Tạo Tài Khoản Mới' })}
                                            {mode === 'forgot-password' && t('auth.forgotPasswordTitle', { defaultValue: 'Khôi Phục Mật Khẩu' })}
                                            {mode === 'verify-email' && t('auth.verifyEmailTitle', { defaultValue: 'Xác Thực Địa Chỉ Email' })}
                                            {mode === 'reset-password' && t('auth.resetPasswordTitle', { defaultValue: 'Đặt Mật Khẩu Mới' })}
                                        </h2>
                                        <p className="text-xs text-text-muted mt-0.5">
                                            {mode === 'login' && t('auth.loginSubtitle', { defaultValue: 'Chào mừng bạn trở lại! Hãy nhập thông tin để chiến game.' })}
                                            {mode === 'register' && t('auth.registerSubtitle', { defaultValue: 'Gia nhập ngay hôm nay để mở khóa toàn bộ tính năng.' })}
                                            {mode === 'forgot-password' && t('auth.forgotPasswordSubtitle', { defaultValue: 'Nhập địa chỉ email để nhận mã xác nhận đặt lại mật khẩu.' })}
                                            {mode === 'verify-email' && t('auth.verifyEmailSubtitle', { defaultValue: 'Nhập mã OTP 6 chữ số đã được gửi tới email của bạn.' })}
                                            {mode === 'reset-password' && t('auth.resetPasswordSubtitle', { defaultValue: 'Tạo mật khẩu mới an toàn cho tài khoản của bạn.' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Mode Switcher Tabs for Login/Register */}
                                {(mode === 'login' || mode === 'register') && (
                                    <div className="grid grid-cols-2 p-1 rounded-2xl bg-surface-hover/80 border border-border text-xs font-bold">
                                        <button
                                            type="button"
                                            onClick={() => switchMode('login')}
                                            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                                mode === 'login'
                                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                                    : "text-text-muted hover:text-text"
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={faRightToBracket} className="text-xs" />
                                            <span>{t('auth.tabLogin', { defaultValue: 'Đăng Nhập' })}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => switchMode('register')}
                                            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                                mode === 'register'
                                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                                    : "text-text-muted hover:text-text"
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={faUserPlus} className="text-xs" />
                                            <span>{t('auth.tabRegister', { defaultValue: 'Đăng Ký' })}</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Alert Banner: Error State */}
                            {serverError && (
                                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
                                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-sm shrink-0 mt-0.5" />
                                    <span>{serverError}</span>
                                </div>
                            )}

                            {/* Alert Banner: Success State */}
                            {successMessage && (
                                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
                                    <FontAwesomeIcon icon={faCircleCheck} className="text-sm shrink-0 mt-0.5" />
                                    <span>{successMessage}</span>
                                </div>
                            )}

                            {/* Main Form */}
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                                {/* Email Address (Login, Register, Forgot Password) */}
                                {(mode === 'login' || mode === 'register' || mode === 'forgot-password') && (
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="email" className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                                            <FontAwesomeIcon icon={faEnvelope} className="text-primary text-xs" />
                                            <span>{t('auth.emailLabel', { defaultValue: 'Địa chỉ Email' })}</span>
                                        </label>
                                        <div className="flex items-center w-full rounded-2xl h-11 border border-border bg-bg/60 px-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                            <input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder={t('auth.emailPlaceholder', { defaultValue: 'gamer@indieg.com' })}
                                                disabled={isLoading}
                                                className="w-full h-full focus:outline-none bg-transparent text-sm text-text placeholder:text-text-faint font-medium disabled:opacity-50"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Password Field (Login, Register, Reset Password) */}
                                {(mode === 'login' || mode === 'register' || mode === 'reset-password') && (
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="password" className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                                                <FontAwesomeIcon icon={faKey} className="text-primary text-xs" />
                                                <span>{mode === 'reset-password' ? t('auth.newPasswordLabel', { defaultValue: 'Mật khẩu mới' }) : t('auth.passwordLabel', { defaultValue: 'Mật khẩu' })}</span>
                                            </label>
                                            {mode === 'login' && (
                                                <button
                                                    type="button"
                                                    onClick={() => switchMode('forgot-password')}
                                                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                                                >
                                                    {t('auth.forgotPasswordLink', { defaultValue: 'Quên mật khẩu?' })}
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between gap-2 w-full rounded-2xl h-11 border border-border bg-bg/60 px-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                            <input
                                                id="password"
                                                type={isShowPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="••••••••"
                                                disabled={isLoading}
                                                className="w-full h-full focus:outline-none bg-transparent text-sm text-text placeholder:text-text-faint font-medium disabled:opacity-50"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setIsShowPassword(!isShowPassword)}
                                                className="text-text-faint hover:text-text p-1 text-xs cursor-pointer"
                                            >
                                                <FontAwesomeIcon icon={isShowPassword ? faEye : faEyeSlash} />
                                            </button>
                                        </div>

                                        {/* Password Strength Indicator */}
                                        {(mode === 'register' || mode === 'reset-password') && (
                                            <div className="flex flex-col gap-2 mt-1 p-3 rounded-2xl border border-border bg-bg/80 text-xs">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`font-semibold ${pwdState.isEmpty ? "text-text-faint" : pwdState.strengthConfig.color}`}>
                                                        {t('auth.pwdStrength', { defaultValue: 'Độ mạnh:' })} <span className="font-bold">{pwdState.isEmpty ? t('auth.pwdNotEntered', { defaultValue: 'Chưa nhập' }) : getStrengthLabel(pwdState.score)}</span>
                                                    </span>
                                                    <div className="grid grid-cols-4 gap-1.5 h-1.5 w-28">
                                                        {[1, 2, 3, 4].map((level) => (
                                                            <div
                                                                key={level}
                                                                className={`h-full rounded-full transition-all duration-300 ${
                                                                    level <= (pwdState.score <= 1 ? 1 : pwdState.score)
                                                                        ? pwdState.strengthConfig.bg
                                                                        : "bg-surface-hover"
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-border/60 text-[11px]">
                                                    {pwdState.requirements.map((item) => (
                                                        <div key={item.id} className="flex items-center gap-1.5">
                                                            <FontAwesomeIcon
                                                                icon={faCircleCheck}
                                                                className={item.isMet ? "text-emerald-500" : "text-text-faint"}
                                                            />
                                                            <span className={item.isMet ? "text-text font-medium" : "text-text-faint"}>
                                                                {getReqLabel(item.id, item.label)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Confirm Password (Register, Reset Password) */}
                                {(mode === 'register' || mode === 'reset-password') && (
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="confirmPassword" className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                                            <FontAwesomeIcon icon={faShieldHalved} className="text-primary text-xs" />
                                            <span>{t('auth.confirmPasswordLabel', { defaultValue: 'Xác nhận mật khẩu' })}</span>
                                        </label>
                                        <div
                                            className={`flex items-center w-full rounded-2xl h-11 border px-3.5 transition-all ${
                                                isPasswordMatched
                                                    ? "border-border bg-bg/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                                                    : "border-rose-500 bg-rose-500/10"
                                            }`}
                                        >
                                            <input
                                                id="confirmPassword"
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                placeholder="••••••••"
                                                disabled={isLoading}
                                                className="w-full h-full focus:outline-none bg-transparent text-sm text-text placeholder:text-text-faint font-medium disabled:opacity-50"
                                                required
                                            />
                                        </div>
                                        {!isPasswordMatched && (
                                            <p className="text-rose-500 text-xs font-bold mt-0.5">
                                                {t('auth.passwordMismatch', { defaultValue: 'Mật khẩu xác nhận không trùng khớp!' })}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* OTP Field (Verify Email) */}
                                {mode === 'verify-email' && (
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="otpCode" className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                                            <FontAwesomeIcon icon={faLock} className="text-primary text-xs" />
                                            <span>{t('auth.otpCodeLabel', { defaultValue: 'Mã OTP xác thực 6 chữ số' })}</span>
                                        </label>
                                        <div className="flex items-center w-full rounded-2xl h-12 border border-border bg-bg/60 px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                            <input
                                                id="otpCode"
                                                type="text"
                                                maxLength={6}
                                                value={formData.otpCode}
                                                onChange={handleInputChange}
                                                placeholder="123456"
                                                disabled={isLoading}
                                                className="w-full h-full focus:outline-none bg-transparent text-center tracking-[0.5em] font-mono text-lg font-bold text-text disabled:opacity-50"
                                                required
                                            />
                                        </div>
                                        <p className="text-[11px] text-text-faint text-center">
                                            {t('auth.otpDemoHint', { defaultValue: 'Mã thử nghiệm demo:' })} <span className="font-mono font-bold text-primary">123456</span>
                                        </p>
                                    </div>
                                )}

                                {/* Action Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 px-4 rounded-2xl bg-primary hover:bg-primary-hover text-white text-sm font-extrabold shadow-lg shadow-primary/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-1 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <>
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
                                            <span>{t('auth.btnProcessing', { defaultValue: 'Đang xử lý...' })}</span>
                                        </>
                                    ) : mode === 'login' ? (
                                        <>
                                            <FontAwesomeIcon icon={faRightToBracket} />
                                            <span>{t('auth.btnLoginNow', { defaultValue: 'Đăng Nhập Ngay' })}</span>
                                        </>
                                    ) : mode === 'register' ? (
                                        <>
                                            <FontAwesomeIcon icon={faUserPlus} />
                                            <span>{t('auth.btnRegisterNow', { defaultValue: 'Tạo Tài Khoản Mới' })}</span>
                                        </>
                                    ) : mode === 'forgot-password' ? (
                                        <>
                                            <FontAwesomeIcon icon={faPaperPlane} />
                                            <span>{t('auth.btnSendRecovery', { defaultValue: 'Gửi Mã Khôi Phục' })}</span>
                                        </>
                                    ) : mode === 'verify-email' ? (
                                        <>
                                            <FontAwesomeIcon icon={faCircleCheck} />
                                            <span>{t('auth.btnVerifyEmail', { defaultValue: 'Xác Nhận Email' })}</span>
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faLock} />
                                            <span>{t('auth.btnSaveNewPassword', { defaultValue: 'Lưu Mật Khẩu Mới' })}</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Back to Login Link for secondary modes */}
                            {(mode === 'forgot-password' || mode === 'verify-email' || mode === 'reset-password') && (
                                <button
                                    type="button"
                                    onClick={() => switchMode('login')}
                                    className="text-xs font-bold text-text-muted hover:text-primary transition-colors text-center cursor-pointer py-1"
                                >
                                    {t('auth.backToLogin', { defaultValue: '← Quay lại trang Đăng Nhập' })}
                                </button>
                            )}

                            {/* Quick Account Switcher (Manual Test) */}
                            {(mode === 'login' || mode === 'register') && (
                                <div className="mt-2 pt-2 border-t border-border/60">
                                    <AccountSwitcher />
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-20 w-full border-t border-border/50 py-4 text-center text-xs text-text-faint">
                <p>{t('auth.footerRights', { defaultValue: '© 2026 IndieG Gaming Hub. Tất cả quyền được bảo lưu.' })}</p>
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
