import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
    Envelope as Mail,
    Lock,
    Eye,
    EyeSlash as EyeOff,
    ArrowLeft,
    CheckCircle as CheckCircle2,
    WarningCircle as AlertCircle,
    Warning as AlertTriangle,
    GameController as Gamepad2,
    Key as KeyRound,
    PaperPlaneRight as Send,
    SignIn as LogIn,
    UserPlus,
    Sun,
    Moon,
    Monitor,
    Globe,
    ShieldCheck,
    Check,
} from '@phosphor-icons/react';

import { useThemeStore } from '@/shared/store/useThemeStore';
import { useAuthStore, type AuthMode, type AuthUser, PasswordRequirements, checkPasswordRequirements } from '@/features/auth';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { authApi, profilesApi } from '@/shared/api';
import { LegalModal } from '@/shared/components/legal/LegalModal';
import { type LegalDocType } from '@/shared/constants/legal';
import { LudonLogo, LudonLogoIcon } from '@/shared/components/logo/LudonLogo';
import { UserAvatar } from '@/shared/components/ui/UserAvatar';
import { usePageTransitionStore } from '@/shared/store/usePageTransitionStore';

// Feature toggle: set to true once Google/third-party OAuth credentials are ready
const ENABLE_OAUTH = false;

export const AuthPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const language = useThemeStore((state) => state.language);
    const toggleLanguage = useThemeStore((state) => state.toggleLanguage);
    const themeMode = useThemeStore((state) => state.mode);
    const setThemeMode = useThemeStore((state) => state.setThemeMode);
    const loginStoreAction = useAuthStore((state) => state.login);
    const startPageTransition = usePageTransitionStore((state) => state.startTransition);

    const [isExiting, setIsExiting] = useState(false);
    const [mode, setMode] = useState<AuthMode>('login');

    const authTitle =
        mode === 'register'
            ? t('authenticate.register', { defaultValue: 'Đăng ký' })
            : mode === 'forgot-password'
            ? t('auth.forgotPasswordTitle', { defaultValue: 'Khôi phục mật khẩu' })
            : mode === 'verify-email'
            ? t('auth.verifyEmailTitle', { defaultValue: 'Xác thực email' })
            : mode === 'reset-password'
            ? t('auth.resetPasswordTitle', { defaultValue: 'Đặt mật khẩu mới' })
            : t('authenticate.login', { defaultValue: 'Đăng nhập' });
    useDocumentTitle(authTitle);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState(0);
    const [spawnedUser, setSpawnedUser] = useState<AuthUser | null>(null);

    const startLoadingWithTransition = () => {
        setIsLoading(true);
        setLoadingPhase(0);
        setSpawnedUser(null);
    };

    const [isShowPassword, setIsShowPassword] = useState(false);
    const [isPasswordMatched, setIsPasswordMatched] = useState(true);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [legalModalOpen, setLegalModalOpen] = useState(false);
    const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType>('terms');

    // Dynamic supporting status message for Stage 2: Server Authentication & Data Loading
    useEffect(() => {
        if (!isLoading) {
            setLoadingPhase(0);
            return;
        }
        const t1 = setTimeout(() => setLoadingPhase(1), 1000);
        const t2 = setTimeout(() => setLoadingPhase(2), 2000);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [isLoading]);

    // Stage 1: Login Success – briefly display before entering application
    useEffect(() => {
        if (!spawnedUser) return;
        const timer = setTimeout(() => {
            setIsExiting(true);
            startPageTransition(() => {
                navigate({ to: '/' });
            });
        }, 1100);
        return () => clearTimeout(timer);
    }, [spawnedUser, navigate, startPageTransition]);

    const loadingStatusText =
        loadingPhase === 0
            ? (language === 'vi' ? 'Đang chuẩn bị không gian gaming của bạn...' : 'Preparing your gaming space...')
            : loadingPhase === 1
            ? (language === 'vi' ? 'Đang tải hồ sơ của bạn...' : 'Loading your profile...')
            : (language === 'vi' ? 'Đang đồng bộ thư viện game...' : 'Syncing game library...');

    const handleOpenLegal = (doc: LegalDocType) => {
        setActiveLegalDoc(doc);
        setLegalModalOpen(true);
    };

    // Feedback states
    const [serverError, setServerError] = useState<string | null>(null);
    const [sessionExpired] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        const hasExpiredFlag =
            sessionStorage.getItem('ludon_session_expired') === '1' ||
            sessionStorage.getItem('indieg_session_expired') === '1' ||
            new URLSearchParams(window.location.search).get('expired') === '1';
        if (hasExpiredFlag) {
            sessionStorage.removeItem('ludon_session_expired');
            sessionStorage.removeItem('indieg_session_expired');
            return true;
        }
        return false;
    });
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form inputs
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        otpCode: '',
    });

    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
        setServerError(null);
        setSuccessMessage(null);
        setSpawnedUser(null);
        setAgreeTerms(false);
        setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            otpCode: '',
        });
        setIsShowPassword(false);
        setIsPasswordMatched(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        setServerError(null);

        if (id === 'confirmPassword' || (id === 'password' && formData.confirmPassword)) {
            const otherVal = id === 'confirmPassword' ? formData.password : formData.confirmPassword;
            setIsPasswordMatched(value === otherVal);
        }
    };

    const handleCycleTheme = () => {
        if (themeMode === 'auto') {
            setThemeMode('dark');
        } else if (themeMode === 'dark') {
            setThemeMode('light');
        } else {
            setThemeMode('auto');
        }
    };

    const handleGoogleLogin = async () => {
        setServerError(null);
        setIsLoading(true);
        try {
            try {
                const res = await authApi.googleLogin({ credential: 'demo_google_credential' });
                const anyRes = res as unknown as Record<string, unknown>;
                const accessToken =
                    res.accessToken ||
                    res.token ||
                    (anyRes.access_token as string) ||
                    ((anyRes.data as Record<string, unknown>)?.accessToken as string);
                const refreshToken =
                    (res as { refreshToken?: string; refresh_token?: string }).refreshToken ||
                    (res as { refreshToken?: string; refresh_token?: string }).refresh_token ||
                    (anyRes.refreshToken as string);
                const userProfile =
                    (res.user as unknown as Record<string, unknown>) ||
                    ((anyRes.data as Record<string, unknown>)?.user as Record<string, unknown>) ||
                    null;

                if (accessToken) {
                    try {
                        localStorage.setItem('ludon_access_token', accessToken);
                        localStorage.setItem('indieg_access_token', accessToken);
                        localStorage.setItem('access_token', accessToken);
                        if (refreshToken) {
                            localStorage.setItem('ludon_refresh_token', refreshToken);
                            localStorage.setItem('indieg_refresh_token', refreshToken);
                            localStorage.setItem('refresh_token', refreshToken);
                        }
                    } catch {
                        // ignore storage errors
                    }
                }

                if (!accessToken || !userProfile) {
                    throw new Error(t('auth.errSystemConnection', { defaultValue: 'Không thể đăng nhập bằng Google lúc này. Vui lòng đăng nhập bằng Email & Mật khẩu.' }));
                }

                const userObj: AuthUser = {
                    id: String(userProfile.id),
                    email: String(userProfile.email || ''),
                    username: String(userProfile.username || userProfile.name || 'Gamer'),
                    name: String(userProfile.name || userProfile.username || 'Gamer'),
                    avatar_url: (userProfile.avatarUrl as string) || (userProfile.avatar_url as string),
                    avatarUrl: (userProfile.avatarUrl as string) || (userProfile.avatar_url as string),
                    role: ((userProfile.role as 'admin' | 'moderator' | 'user') || 'user'),
                    isVerified: true,
                };

                loginStoreAction(userObj, accessToken, refreshToken);
                setSpawnedUser(userObj as AuthUser);
                setSuccessMessage(t('auth.msgLoginSuccess', { defaultValue: 'Đăng nhập thành công! Đang chuyển hướng...' }));
                return;
            } catch (err: unknown) {
                const message =
                    err && typeof err === 'object' && 'message' in err
                        ? String((err as { message: unknown }).message)
                        : t('auth.errSystemConnection', { defaultValue: 'Đã xảy ra lỗi kết nối. Vui lòng thử lại.' });
                setServerError(message);
            }
        } finally {
            setIsLoading(false);
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

            startLoadingWithTransition();

            const emailName = formData.email.split('@')[0] || 'LudonPlayer';
            let userObj: AuthUser = {
                id: 'usr_' + Math.random().toString(36).substring(2, 9),
                email: formData.email,
                username: emailName,
                name: emailName,
                avatar_url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
                avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
                role: 'user' as const,
                isVerified: true,
            };

            // Allow the progress bar to gracefully decelerate to ~78% before resolving content
            const minDelay = new Promise((resolve) => setTimeout(resolve, 2800));

            try {
                let accessToken: string | undefined;
                let refreshToken: string | undefined;
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
                    refreshToken =
                        (res as { refreshToken?: string; refresh_token?: string }).refreshToken ||
                        (res as { refreshToken?: string; refresh_token?: string }).refresh_token ||
                        (anyRes.refreshToken as string) ||
                        (anyRes.refresh_token as string) ||
                        ((anyRes.data as Record<string, unknown>)?.refreshToken as string) ||
                        ((anyRes.data as Record<string, unknown>)?.refresh_token as string);
                    userProfile =
                        (res.user as unknown as Record<string, unknown>) ||
                        ((anyRes.data as Record<string, unknown>)?.user as Record<string, unknown>) ||
                        (anyRes.userProfile as Record<string, unknown>) ||
                        (anyRes.data as Record<string, unknown>) ||
                        (res.id ? anyRes : null);

                    if (accessToken) {
                        try {
                            localStorage.setItem('ludon_access_token', accessToken);
                            localStorage.setItem('indieg_access_token', accessToken);
                            localStorage.setItem('access_token', accessToken);
                            if (refreshToken) {
                                localStorage.setItem('ludon_refresh_token', refreshToken);
                                localStorage.setItem('indieg_refresh_token', refreshToken);
                                localStorage.setItem('refresh_token', refreshToken);
                            }
                            if (res.user?.username || (res.user as any)?.profile?.username) {
                                userProfile = ((res.user as any)?.profile || res.user) as unknown as Record<string, unknown>;
                            } else {
                                const me = await profilesApi.getMyProfile();
                                if (me && (me.id || me.username)) {
                                    userProfile = me as unknown as Record<string, unknown>;
                                }
                            }
                        } catch {
                            // continue with existing response
                        }
                    }

                    if (userProfile) {
                        userObj = {
                            id: (userProfile.id as string) || userObj.id,
                            email: (userProfile.email as string) || formData.email,
                            username: (userProfile.username as string) || (userProfile.name as string) || emailName,
                            name: (userProfile.name as string) || (userProfile.username as string) || emailName,
                            avatar_url: (userProfile.avatarUrl as string) || (userProfile.avatar_url as string) || userObj.avatar_url,
                            avatarUrl: (userProfile.avatarUrl as string) || (userProfile.avatar_url as string) || userObj.avatarUrl,
                            role: ((userProfile.role as 'admin' | 'moderator' | 'user') || 'user'),
                            isVerified: userProfile.isVerified === true || userProfile.isEmailVerified === true,
                        };
                        loginStoreAction(userObj, accessToken, refreshToken);
                    } else if (accessToken) {
                        loginStoreAction(userObj, accessToken, refreshToken);
                    }

                    await minDelay;
                    setIsLoading(false);
                    setSpawnedUser(userObj);
                } catch (err: unknown) {
                    const message =
                        err && typeof err === 'object' && 'message' in err
                            ? String((err as { message: unknown }).message)
                            : t('auth.errSystemConnection', { defaultValue: 'Đã xảy ra lỗi kết nối hệ thống. Vui lòng thử lại.' });
                    setServerError(message);
                    setIsLoading(false);
                }
            } catch (err: unknown) {
                const message =
                    err && typeof err === 'object' && 'message' in err
                        ? String((err as { message: unknown }).message)
                        : t('auth.errSystemConnection', { defaultValue: 'Đã xảy ra lỗi kết nối hệ thống. Vui lòng thử lại.' });
                setServerError(message);
                setIsLoading(false);
            }
            return;
        }

        // --- REGISTER FLOW ---
        if (mode === 'register') {
            if (!agreeTerms) {
                setServerError(t('auth.errMustAgreeTerms', { defaultValue: 'Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật để tạo tài khoản.' }));
                return;
            }

            if (!formData.email.includes('@')) {
                setServerError(t('auth.errInvalidEmail', { defaultValue: 'Địa chỉ email không hợp lệ.' }));
                return;
            }

            const pwdCheck = checkPasswordRequirements(formData.password);
            if (pwdCheck.isOverMax) {
                setServerError(t('auth.errPasswordMaxExceeded', { defaultValue: 'Mật khẩu không được vượt quá 72 ký tự.' }));
                return;
            }
            if (!pwdCheck.isValid) {
                setServerError(t('auth.errPasswordRequirements', { defaultValue: 'Mật khẩu cần ít nhất 8 ký tự, có chữ hoa, chữ thường và ký tự đặc biệt.' }));
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setIsPasswordMatched(false);
                setServerError(t('auth.errPasswordMatch', { defaultValue: 'Mật khẩu xác nhận không trùng khớp.' }));
                return;
            }

            startLoadingWithTransition();

            const emailName = formData.email.split('@')[0] || 'NewPlayer';
            let userObj: AuthUser = {
                id: 'usr_' + Math.random().toString(36).substring(2, 9),
                email: formData.email,
                username: emailName,
                name: emailName,
                avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                role: 'user' as const,
                isVerified: true,
            };

            const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));

            try {
                await authApi.register({
                    email: formData.email.trim(),
                    password: formData.password,
                });

                let accessToken: string | undefined;
                let refreshToken: string | undefined;
                let userProfile: Record<string, unknown> | null = null;

                try {
                    const loginRes = await authApi.login({
                        email: formData.email.trim(),
                        password: formData.password,
                    });
                    const anyLoginRes = loginRes as unknown as Record<string, unknown>;
                    accessToken =
                        loginRes.accessToken ||
                        loginRes.token ||
                        (anyLoginRes.access_token as string) ||
                        ((anyLoginRes.data as Record<string, unknown>)?.accessToken as string) ||
                        ((anyLoginRes.data as Record<string, unknown>)?.token as string);
                    refreshToken =
                        (loginRes as { refreshToken?: string; refresh_token?: string }).refreshToken ||
                        (loginRes as { refreshToken?: string; refresh_token?: string }).refresh_token ||
                        (anyLoginRes.refreshToken as string) ||
                        (anyLoginRes.refresh_token as string) ||
                        ((anyLoginRes.data as Record<string, unknown>)?.refreshToken as string) ||
                        ((anyLoginRes.data as Record<string, unknown>)?.refresh_token as string);
                    userProfile = (loginRes.user as unknown as Record<string, unknown>) || null;

                    if (accessToken) {
                        try {
                            localStorage.setItem('ludon_access_token', accessToken);
                            localStorage.setItem('indieg_access_token', accessToken);
                            localStorage.setItem('access_token', accessToken);
                            if (refreshToken) {
                                localStorage.setItem('ludon_refresh_token', refreshToken);
                                localStorage.setItem('indieg_refresh_token', refreshToken);
                                localStorage.setItem('refresh_token', refreshToken);
                            }
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

                if (userProfile) {
                    userObj = {
                        id: (userProfile.id as string) || userObj.id,
                        email: (userProfile.email as string) || formData.email,
                        username: (userProfile.username as string) || (userProfile.name as string) || emailName,
                        name: (userProfile.name as string) || (userProfile.username as string) || emailName,
                        avatar_url: (userProfile.avatarUrl as string) || (userProfile.avatar_url as string) || userObj.avatar_url,
                        avatarUrl: (userProfile.avatarUrl as string) || (userProfile.avatar_url as string) || userObj.avatarUrl,
                        role: ((userProfile.role as 'admin' | 'moderator' | 'user') || 'user'),
                        isVerified: userProfile.isVerified === true || userProfile.isEmailVerified === true,
                    };
                }

                if (accessToken) {
                    loginStoreAction(userObj, accessToken, refreshToken);
                    await minDelay;
                    setIsLoading(false);
                    setSpawnedUser(userObj);
                } else {
                    await minDelay;
                    setIsLoading(false);
                    setSuccessMessage(t('auth.msgRegisterSuccess', { defaultValue: 'Đăng ký thành công! Vui lòng đăng nhập.' }));
                    setTimeout(() => {
                        switchMode('login');
                    }, 1500);
                }
            } catch (err: unknown) {
                const message =
                    err && typeof err === 'object' && 'message' in err
                        ? String((err as { message: unknown }).message)
                        : t('auth.errRegisterFailed', { defaultValue: 'Đăng ký không thành công. Vui lòng thử lại.' });
                setServerError(message);
                setIsLoading(false);
            }
            return;
        }

        // --- FORGOT PASSWORD FLOW ---
        if (mode === 'forgot-password') {
            if (!formData.email.includes('@')) {
                setServerError(t('auth.errInvalidEmail', { defaultValue: 'Vui lòng nhập địa chỉ email hợp lệ.' }));
                return;
            }

            startLoadingWithTransition();
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
                setServerError(t('auth.errOtpLength', { defaultValue: 'Vui lòng nhập mã xác thực OTP.' }));
                return;
            }

            startLoadingWithTransition();
            const minDelay = new Promise((resolve) => setTimeout(resolve, 1500));
            try {
                await authApi.verifyEmail(formData.otpCode.trim());
                setSuccessMessage(t('auth.msgVerifySuccess', { defaultValue: 'Xác thực email thành công! Tài khoản của bạn đã sẵn sàng.' }));
                const verifiedUser = {
                    id: 'usr_v_' + Math.random().toString(36).substring(2, 9),
                    email: formData.email || 'gamer@ludon.com',
                    username: formData.username || 'VerifiedGamer',
                    isVerified: true,
                };
                loginStoreAction(verifiedUser);
                await minDelay;
                setIsLoading(false);
                setSpawnedUser(verifiedUser);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : t('auth.errVerifyFail', { defaultValue: 'Xác thực thất bại. Vui lòng kiểm tra lại mã.' });
                setServerError(message);
                setIsLoading(false);
            }
            return;
        }

        // --- RESET PASSWORD FLOW ---
        if (mode === 'reset-password') {
            const pwdCheck = checkPasswordRequirements(formData.password);
            if (pwdCheck.isOverMax) {
                setServerError(t('auth.errPasswordMaxExceeded', { defaultValue: 'Mật khẩu không được vượt quá 72 ký tự.' }));
                return;
            }
            if (!pwdCheck.isValid) {
                setServerError(t('auth.errPasswordRequirements', { defaultValue: 'Mật khẩu mới chưa đủ các yêu cầu bảo mật.' }));
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setIsPasswordMatched(false);
                setServerError(t('auth.errPasswordMatch', { defaultValue: 'Mật khẩu xác nhận không trùng khớp.' }));
                return;
            }

            startLoadingWithTransition();
            try {
                await authApi.resetPassword({
                    token: formData.otpCode.trim() || 'token',
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
        <div className="relative min-h-screen w-full bg-bg text-text flex flex-col justify-between selection:bg-primary/20 selection:text-primary overflow-x-hidden">
            {/* Subtle background texture matching design tokens without hardcoded colors */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.035] bg-[radial-gradient(var(--app-border-strong)_1px,transparent_1px)] [background-size:24px_24px]"
            />

            {/* Top Navigation Header */}
            <header
                className={`relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between transition-opacity duration-300 ${
                    isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
            >
                {/* Brand Logo */}
                <button
                    type="button"
                    onClick={() => navigate({ to: '/' })}
                    className="flex items-center gap-2.5 group cursor-pointer transition-opacity hover:opacity-90 outline-none"
                    title={t('common.home', { defaultValue: 'Trang chủ' })}
                >
                    <LudonLogo size="md" />
                </button>

                {/* Right Controls: Theme Mode, Language, Return Home */}
                <div className="flex items-center gap-1.5 p-1 rounded-full bg-surface-inner border border-border/60">
                    {/* Language Switch */}
                    <button
                        type="button"
                        onClick={toggleLanguage}
                        title={t('common.switchLanguage', { defaultValue: 'Đổi ngôn ngữ' })}
                        className="h-7 px-2 rounded-full flex items-center gap-1 text-xs font-bold text-text-muted hover:text-text hover:bg-surface transition-colors cursor-pointer"
                    >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{language.toUpperCase()}</span>
                    </button>

                    <div className="w-px h-3.5 bg-border/60" />

                    {/* Theme Mode Toggle */}
                    <button
                        type="button"
                        onClick={handleCycleTheme}
                        title={`${t('settings.general.appearance', { defaultValue: 'Giao diện' })}: ${themeMode}`}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-text hover:bg-surface transition-colors cursor-pointer"
                    >
                        {themeMode === 'dark' ? (
                            <Moon className="w-3.5 h-3.5" />
                        ) : themeMode === 'light' ? (
                            <Sun className="w-3.5 h-3.5" />
                        ) : (
                            <Monitor className="w-3.5 h-3.5" />
                        )}
                    </button>

                    <div className="w-px h-3.5 bg-border/60 hidden sm:block" />

                    {/* Back to Home Link */}
                    <button
                        type="button"
                        onClick={() => navigate({ to: '/' })}
                        title={t('common.home', { defaultValue: 'Trang chủ' })}
                        className="hidden sm:flex h-7 px-2.5 rounded-full items-center gap-1 text-xs font-medium text-text-muted hover:text-text hover:bg-surface transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>{t('common.home', { defaultValue: 'Trang chủ' })}</span>
                    </button>
                </div>
            </header>

            {/* Central Auth Surface */}
            <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex items-center justify-center">
                {spawnedUser ? (
                    /* ============================================================ */
                    /*  STAGE 1 – LOGIN SUCCESS                                     */
                    /* ============================================================ */
                    <div
                        className={`w-full max-w-md py-12 px-4 flex flex-col items-center text-center select-none transition-all duration-350 ease-out ${
                            isExiting
                                ? 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                                : 'opacity-100 scale-100 translate-y-0 animate-fade-in'
                        }`}
                    >
                        {/* Clean Avatar Treatment with Thin Brand Outline */}
                        <div className="relative mb-6">
                            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-primary/80 p-0.5 bg-surface shadow-sm">
                                <UserAvatar
                                    src={spawnedUser.avatar_url || spawnedUser.avatarUrl}
                                    name={spawnedUser.name || spawnedUser.username}
                                    className="w-full h-full select-none"
                                    textClassName="text-2xl font-sans"
                                />
                            </div>
                        </div>

                        {/* Welcoming Message */}
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
                            {mode === 'register'
                                ? (language === 'vi'
                                    ? `Chào mừng bạn đến với Ludon, ${spawnedUser.name || spawnedUser.username}`
                                    : `Welcome to Ludon, ${spawnedUser.name || spawnedUser.username}`)
                                : (language === 'vi'
                                    ? `Chào mừng trở lại, ${spawnedUser.name || spawnedUser.username}`
                                    : `Welcome back, ${spawnedUser.name || spawnedUser.username}`)}
                        </h2>

                        {/* Subtle Supporting Message */}
                        <p className="text-sm sm:text-base text-text-muted mt-2 font-sans">
                            {language === 'vi' ? 'Không gian gaming của bạn đã sẵn sàng.' : 'Your gaming space is ready.'}
                        </p>
                    </div>
                ) : isLoading ? (
                    /* ============================================================ */
                    /*  STAGE 2 – SERVER AUTHENTICATION & DATA LOADING             */
                    /* ============================================================ */
                    <div className="w-full max-w-md py-12 px-4 flex flex-col items-center text-center select-none animate-fade-in">
                        {/* Central Ludon Logo with subtle breathing pulse */}
                        <div className="relative mb-6 flex items-center justify-center">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 text-primary flex items-center justify-center animate-pulse">
                                <LudonLogoIcon />
                            </div>
                        </div>

                        {/* Concise Heading */}
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                            {language === 'vi' ? 'Đang kết nối Ludon' : 'Connecting to Ludon'}
                        </h2>

                        {/* Dynamic Supporting Status Text */}
                        <p className="text-sm text-text-muted mt-2 h-5 transition-opacity duration-300 font-sans">
                            {loadingStatusText}
                        </p>

                        {/* Single Subtle Loading Animation */}
                        <div className="w-36 sm:w-44 h-1 rounded-full bg-surface-inner border border-border/40 overflow-hidden mt-6 relative">
                            <div className="h-full bg-primary rounded-full animate-indeterminate-line" />
                        </div>
                    </div>
                ) : (
                    /* Regular Login/Register Form (No outline flash on submit) */
                    <div className="w-full max-w-[420px] sm:max-w-[440px] bg-surface border border-border/60 rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/20 flex flex-col gap-4 animate-fade-in relative overflow-hidden outline-none ring-0">
                        {/* Header: Modes Navigation or Step Title */}
                        {(mode === 'login' || mode === 'register') ? (
                            <div className="flex flex-col gap-3.5">
                                <div className="text-center">
                                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                                        {mode === 'login'
                                            ? t('auth.loginTitle', { defaultValue: 'Chào mừng trở lại' })
                                            : t('auth.registerTitle', { defaultValue: 'Tạo tài khoản Ludon' })}
                                    </h1>
                                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                                        {mode === 'login'
                                            ? t('auth.loginSubtitle', { defaultValue: 'Đăng nhập để kết nối cộng đồng & chiến game cùng squad.' })
                                            : t('auth.registerSubtitle', { defaultValue: 'Gia nhập nền tảng gaming hub thế hệ mới.' })}
                                    </p>
                                </div>

                                {/* Google OAuth (Temporarily hidden until OAuth backend is integrated) */}
                                {ENABLE_OAUTH && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleGoogleLogin}
                                            disabled={isLoading}
                                            className="w-full h-10 px-4 rounded-xl bg-surface-inner hover:bg-surface-hover border border-border/60 text-text transition-all flex items-center justify-center gap-2.5 text-xs font-semibold cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-50"
                                        >
                                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                                                <path
                                                    fill="#4285F4"
                                                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                                                />
                                                <path
                                                    fill="#34A853"
                                                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                                                />
                                                <path
                                                    fill="#FBBC05"
                                                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                                                />
                                                <path
                                                    fill="#EA4335"
                                                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                                                />
                                            </svg>
                                            <span>{t('auth.continueWithGoogle', { defaultValue: 'Tiếp tục với Google' })}</span>
                                        </button>

                                        {/* Divider */}
                                        <div className="relative flex items-center justify-center my-0.5">
                                            <div className="w-full border-t border-border/60" />
                                            <span className="absolute bg-surface px-2 text-[10px] uppercase font-bold text-text-faint tracking-wider">
                                                {t('common.or', { defaultValue: 'hoặc' })}
                                            </span>
                                        </div>
                                    </>
                                )}

                                {/* Segmented Control Tabs */}
                                <div className="grid grid-cols-2 p-1 bg-surface-inner rounded-xl border border-border/60">
                                    <button
                                        type="button"
                                        onClick={() => switchMode('login')}
                                        className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                            mode === 'login'
                                                ? 'bg-surface text-text shadow-xs'
                                                : 'text-text-muted hover:text-text'
                                        }`}
                                    >
                                        {t('auth.tabLogin', { defaultValue: 'Đăng nhập' })}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => switchMode('register')}
                                        className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                            mode === 'register'
                                                ? 'bg-surface text-text shadow-xs'
                                                : 'text-text-muted hover:text-text'
                                        }`}
                                    >
                                        {t('auth.tabRegister', { defaultValue: 'Tạo tài khoản' })}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => switchMode('login')}
                                    className="self-start inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors cursor-pointer mb-1"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    <span>{t('auth.backToLogin', { defaultValue: 'Quay lại đăng nhập' })}</span>
                                </button>

                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                                        {mode === 'forgot-password' && <KeyRound className="w-4 h-4" />}
                                        {mode === 'verify-email' && <ShieldCheck className="w-4 h-4" />}
                                        {mode === 'reset-password' && <Lock className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-bold text-text">
                                            {mode === 'forgot-password' && t('auth.forgotPasswordTitle', { defaultValue: 'Khôi phục mật khẩu' })}
                                            {mode === 'verify-email' && t('auth.verifyEmailTitle', { defaultValue: 'Xác thực email' })}
                                            {mode === 'reset-password' && t('auth.resetPasswordTitle', { defaultValue: 'Đặt mật khẩu mới' })}
                                        </h1>
                                        <p className="text-xs text-text-muted">
                                            {mode === 'forgot-password' && t('auth.forgotPasswordSubtitle', { defaultValue: 'Nhập email để nhận mã khôi phục.' })}
                                            {mode === 'verify-email' && t('auth.verifyEmailSubtitle', { defaultValue: 'Nhập mã OTP 6 chữ số đã gửi tới email.' })}
                                            {mode === 'reset-password' && t('auth.resetPasswordSubtitle', { defaultValue: 'Tạo mật khẩu mới bảo mật.' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Alerts */}
                        {sessionExpired && (
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-start gap-2.5 animate-fade-in">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{t('auth.sessionExpiredDesc', { defaultValue: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' })}</span>
                            </div>
                        )}

                        {serverError && (
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-start gap-2.5 animate-fade-in">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{serverError}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-start gap-2.5 animate-fade-in">
                                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {/* Auth Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                            {/* Email Field */}
                            {(mode === 'login' || mode === 'register' || mode === 'forgot-password') && (
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="email" className="text-xs font-semibold text-text-muted">
                                        {mode === 'login'
                                            ? t('auth.emailOrUsernameLabel', { defaultValue: 'Email hoặc Tên đăng nhập' })
                                            : t('auth.emailLabel', { defaultValue: 'Địa chỉ Email' })}
                                    </label>
                                    <div className="relative flex items-center">
                                        <Mail className="w-4 h-4 text-text-faint absolute left-3 pointer-events-none" />
                                        <input
                                            id="email"
                                            type={mode === 'login' ? 'text' : 'email'}
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder={
                                                mode === 'login'
                                                    ? t('auth.emailLoginPlaceholder', { defaultValue: 'gamer@ludon.com hoặc username' })
                                                    : t('auth.emailPlaceholder', { defaultValue: 'gamer@ludon.com' })
                                            }
                                            disabled={isLoading}
                                            autoComplete={mode === 'login' ? 'username' : 'email'}
                                            required
                                            className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-inner border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-sm text-text placeholder:text-text-faint transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Password Field */}
                            {(mode === 'login' || mode === 'register' || mode === 'reset-password') && (
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password" className="text-xs font-semibold text-text-muted">
                                            {mode === 'reset-password'
                                                ? t('auth.newPasswordLabel', { defaultValue: 'Mật khẩu mới' })
                                                : t('auth.passwordLabel', { defaultValue: 'Mật khẩu' })}
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
                                        <Lock className="w-4 h-4 text-text-faint absolute left-3 pointer-events-none" />
                                        <input
                                            id="password"
                                            type={isShowPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="••••••••"
                                            disabled={isLoading}
                                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                            required
                                            className="w-full h-10 pl-9 pr-10 rounded-xl bg-surface-inner border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-sm text-text placeholder:text-text-faint transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setIsShowPassword(!isShowPassword)}
                                            aria-label={
                                                isShowPassword
                                                    ? t('auth.hidePassword', { defaultValue: 'Ẩn mật khẩu' })
                                                    : t('auth.showPassword', { defaultValue: 'Hiển thị mật khẩu' })
                                            }
                                            className="absolute right-3 text-text-faint hover:text-text p-1 transition-colors cursor-pointer"
                                        >
                                            {isShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Password requirements */}
                                    {(mode === 'register' || mode === 'reset-password') && (
                                        <PasswordRequirements password={formData.password} />
                                    )}
                                </div>
                            )}

                            {/* Confirm Password Field */}
                            {(mode === 'register' || mode === 'reset-password') && (
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="confirmPassword" className="text-xs font-semibold text-text-muted">
                                            {t('auth.confirmPasswordLabel', { defaultValue: 'Xác nhận mật khẩu' })}
                                        </label>
                                        {formData.confirmPassword && (
                                            <span className={`text-[11px] font-medium flex items-center gap-1 ${
                                                isPasswordMatched ? 'text-emerald-500' : 'text-rose-500'
                                            }`}>
                                                {isPasswordMatched ? (
                                                    <>
                                                        <Check className="w-3 h-3" />
                                                        <span>{t('auth.passwordMatch', { defaultValue: 'Khớp' })}</span>
                                                    </>
                                                ) : (
                                                    <span>{t('auth.passwordMismatch', { defaultValue: 'Chưa khớp' })}</span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative flex items-center">
                                        <Lock className="w-4 h-4 text-text-faint absolute left-3 pointer-events-none" />
                                        <input
                                            id="confirmPassword"
                                            type={isShowPassword ? 'text' : 'password'}
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="••••••••"
                                            disabled={isLoading}
                                            autoComplete="new-password"
                                            required
                                            className={`w-full h-10 pl-9 pr-3 rounded-xl bg-surface-inner border outline-none text-sm text-text placeholder:text-text-faint transition-all ${
                                                isPasswordMatched || !formData.confirmPassword
                                                    ? 'border-border/60 focus:border-primary focus:ring-1 focus:ring-primary/30'
                                                    : 'border-rose-500/80 bg-rose-500/5 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
                                            }`}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* OTP Verification Code (Verify Email & Reset Password) */}
                            {mode === 'verify-email' && (
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="otpCode" className="text-xs font-semibold text-text-muted">
                                        {t('auth.otpCodeLabel', { defaultValue: 'Mã xác thực OTP (6 chữ số)' })}
                                    </label>
                                    <input
                                        id="otpCode"
                                        type="text"
                                        maxLength={6}
                                        value={formData.otpCode}
                                        onChange={handleInputChange}
                                        placeholder="123456"
                                        disabled={isLoading}
                                        autoComplete="one-time-code"
                                        required
                                        className="w-full h-12 rounded-xl bg-surface-inner border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-center font-mono tracking-[0.4em] text-lg font-bold text-text transition-all"
                                    />
                                </div>
                            )}

                            {/* Terms agreement checkbox (Sign up only) */}
                            {mode === 'register' && (
                                <div className="flex items-start gap-2 pt-0.5">
                                    <input
                                        id="agreeTerms"
                                        type="checkbox"
                                        checked={agreeTerms}
                                        onChange={(e) => {
                                            setAgreeTerms(e.target.checked);
                                            if (e.target.checked) setServerError(null);
                                        }}
                                        disabled={isLoading}
                                        className="w-4 h-4 mt-0.5 rounded border-border/80 bg-surface-inner accent-primary focus:ring-1 focus:ring-primary cursor-pointer shrink-0"
                                        required
                                    />
                                    <label htmlFor="agreeTerms" className="text-xs text-text-muted cursor-pointer leading-relaxed select-none">
                                        <span>{t('auth.agreeTermsPrefix', { defaultValue: 'Tôi đồng ý với' })}{' '}</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleOpenLegal('terms');
                                            }}
                                            className="text-primary hover:underline font-semibold cursor-pointer"
                                        >
                                            {t('auth.termsOfService', { defaultValue: 'Điều khoản dịch vụ' })}
                                        </button>
                                        <span>{' '}{t('common.andWord', { defaultValue: 'và' })}{' '}</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleOpenLegal('privacy');
                                            }}
                                            className="text-primary hover:underline font-semibold cursor-pointer"
                                        >
                                            {t('auth.privacyPolicy', { defaultValue: 'Chính sách bảo mật' })}
                                        </button>
                                        <span>{' '}{t('auth.ofLudon', { defaultValue: 'của Ludon.' })}</span>
                                    </label>
                                </div>
                            )}

                            {/* Submit Primary CTA */}
                            <button
                                type="submit"
                                disabled={isLoading || (mode === 'register' && !agreeTerms)}
                                className="relative overflow-hidden w-full h-11 rounded-xl active:scale-[0.99] text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50 outline-none focus:outline-none ring-0 focus:ring-0 bg-primary hover:bg-primary-hover shadow-primary/20"
                            >
                                {isLoading ? (
                                    <div className="relative w-full h-full flex items-center justify-center gap-2 overflow-hidden px-3">
                                        {/* Shimmer laser effect */}
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-button-shimmer" />
                                        <Gamepad2 className="w-4 h-4 animate-bounce text-white shrink-0" />
                                        <span className="text-xs font-semibold tracking-wide animate-fade-in truncate">
                                            {language === 'vi' ? 'Đang xử lý...' : 'Processing...'}
                                        </span>
                                    </div>
                                ) : mode === 'login' ? (
                                    <>
                                        <LogIn className="w-4 h-4" />
                                        <span>{t('auth.btnLoginNow', { defaultValue: 'Đăng nhập ngay' })}</span>
                                    </>
                                ) : mode === 'register' ? (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        <span>{t('auth.btnRegisterNow', { defaultValue: 'Tạo tài khoản' })}</span>
                                    </>
                                ) : mode === 'forgot-password' ? (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>{t('auth.btnSendRecovery', { defaultValue: 'Gửi mã khôi phục' })}</span>
                                    </>
                                ) : mode === 'verify-email' ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>{t('auth.btnVerifyEmail', { defaultValue: 'Xác thực ngay' })}</span>
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="w-4 h-4" />
                                        <span>{t('auth.btnSaveNewPassword', { defaultValue: 'Lưu mật khẩu mới' })}</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Secondary Navigation */}
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
                                    className="text-primary hover:underline font-semibold cursor-pointer"
                                >
                                    {t('auth.backToLogin', { defaultValue: 'Quay lại đăng nhập' })}
                                </button>
                            )}
                        </div>
                    </div>
            )}
            </main>

            {/* Clean Minimal Footer */}
            <footer
                className={`relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-center text-xs text-text-faint border-t border-border/40 transition-opacity duration-300 ${
                    isExiting ? 'opacity-0' : 'opacity-100'
                }`}
            >
                <p>{t('auth.footerRights', { defaultValue: '© 2026 Ludon Gaming Community. All rights reserved.' })}</p>
            </footer>

            {/* Terms of Service & Privacy Policy Modal */}
            <LegalModal
                isOpen={legalModalOpen}
                onClose={() => setLegalModalOpen(false)}
                docType={activeLegalDoc}
            />
        </div>
    );
};
