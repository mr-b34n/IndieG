import { useState, useId } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import {
    Key as KeyRound,
    Lock,
    Eye,
    EyeSlash as EyeOff,
    CheckCircle as CheckCircle2,
    XCircle,
    ArrowRight,
    CircleNotch as Loader2,
    ShieldCheck,
    Warning as AlertTriangle,
} from "@phosphor-icons/react";
import { authApi } from "@/shared/api";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";

export interface ResetPasswordSearch {
    token?: string;
}

export const Route = createFileRoute("/reset-password")({
    validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
        token: typeof search.token === "string" ? search.token.trim() : undefined,
    }),
    component: ResetPasswordRoutePage,
});

function ResetPasswordRoutePage() {
    const navigate = useNavigate();
    const search = useSearch({ from: "/reset-password" }) as ResetPasswordSearch;
    const token = search.token;

    const { language } = useTranslation();
    const isVi = language === "vi";
    useDocumentTitle(isVi ? "Đặt lại mật khẩu — Ludon" : "Reset Password — Ludon");

    const newPasswordId = useId();
    const confirmPasswordId = useId();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Password validation rules
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumberOrSymbol = /[\d\W_]/.test(password);
    const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumberOrSymbol;
    const isMatch = password.length > 0 && password === confirmPassword;
    const canSubmit = Boolean(token) && isPasswordValid && isMatch && !isLoading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            setErrorMessage(
                isVi
                    ? "Mã token xác thực không tồn tại hoặc đã hết hạn."
                    : "Reset token is missing or has expired."
            );
            return;
        }

        if (!isPasswordValid) {
            setErrorMessage(
                isVi
                    ? "Mật khẩu chưa đáp ứng đầy đủ các tiêu chuẩn bảo mật."
                    : "Password does not meet all security requirements."
            );
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage(
                isVi
                    ? "Mật khẩu xác nhận không trùng khớp."
                    : "Passwords do not match."
            );
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            await authApi.resetPassword({
                token,
                newPassword: password,
            });

            setIsSuccess(true);
            setTimeout(() => {
                navigate({ to: "/auth" });
            }, 2500);
        } catch (err: unknown) {
            const serverMsg =
                err && typeof err === "object" && "message" in err
                    ? String((err as { message: unknown }).message)
                    : isVi
                    ? "Không thể đặt lại mật khẩu. Vui lòng kiểm tra lại liên kết hoặc thử lại sau."
                    : "Failed to reset password. Please verify the link or try again later.";
            setErrorMessage(serverMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-bg text-text flex flex-col justify-center items-center px-4 py-12 selection:bg-primary/20 selection:text-primary">
            {/* Background Texture */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.035] bg-[radial-gradient(var(--app-border-strong)_1px,transparent_1px)] [background-size:24px_24px]"
            />

            <div className="relative w-full max-w-md mx-auto">
                {/* Header Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-4 shadow-lg shadow-primary/5">
                        <KeyRound className="w-7 h-7" aria-hidden="true" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
                        {isVi ? "Đặt Lại Mật Khẩu" : "Reset Password"}
                    </h1>
                    <p className="mt-2 text-sm text-text-muted">
                        {isVi
                            ? "Tạo mật khẩu mới an toàn để bảo vệ tài khoản Ludon của bạn"
                            : "Create a secure new password for your Ludon account"}
                    </p>
                </div>

                {/* Card Container */}
                <div className="w-full bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
                    {/* Missing Token Banner */}
                    {!token && (
                        <div
                            role="alert"
                            className="flex flex-col items-center text-center p-4 rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-500 gap-3 mb-6"
                        >
                            <AlertTriangle className="w-8 h-8 text-accent-500" aria-hidden="true" />
                            <div>
                                <p className="font-semibold text-sm">
                                    {isVi ? "Liên kết không hợp lệ" : "Invalid Reset Link"}
                                </p>
                                <p className="text-xs text-text-muted mt-1">
                                    {isVi
                                        ? "Không tìm thấy token xác thực trong đường dẫn của bạn hoặc liên kết đã hết hiệu lực."
                                        : "No reset token was found in your URL or the link has expired."}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate({ to: "/auth" })}
                                className="mt-2 inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border text-text transition-colors cursor-pointer"
                            >
                                <span>{isVi ? "Quay lại trang Đăng nhập" : "Return to Login"}</span>
                                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                        </div>
                    )}

                    {/* Success State */}
                    {isSuccess ? (
                        <div
                            role="status"
                            aria-live="polite"
                            className="flex flex-col items-center text-center py-6 gap-3 animate-fade-in"
                        >
                            <div className="w-16 h-16 rounded-full bg-success-500/10 border border-success-500/20 text-success-500 flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10" aria-hidden="true" />
                            </div>
                            <h2 className="text-lg font-bold text-text">
                                {isVi ? "Mật khẩu đã được cập nhật!" : "Password Reset Successfully!"}
                            </h2>
                            <p className="text-xs text-text-muted max-w-xs">
                                {isVi
                                    ? "Mật khẩu của bạn đã được thay đổi an toàn. Hệ thống đang chuyển hướng bạn về trang Đăng nhập..."
                                    : "Your password has been securely updated. Redirecting you to the login page..."}
                            </p>
                            <button
                                type="button"
                                onClick={() => navigate({ to: "/auth" })}
                                className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline cursor-pointer"
                            >
                                <span>{isVi ? "Đăng nhập ngay bây giờ" : "Log in right now"}</span>
                                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                        </div>
                    ) : (
                        /* Reset Form */
                        token && (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                {errorMessage && (
                                    <div
                                        role="alert"
                                        className="p-3 text-xs rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-500 flex items-center gap-2.5"
                                    >
                                        <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                {/* New Password Field */}
                                <div className="flex flex-col gap-1.5">
                                    <label
                                        htmlFor={newPasswordId}
                                        className="text-xs font-medium text-text-muted"
                                    >
                                        {isVi ? "Mật khẩu mới" : "New password"}
                                    </label>
                                    <div className="relative flex items-center">
                                        <Lock
                                            className="w-4 h-4 text-text-faint absolute left-3.5 pointer-events-none"
                                            aria-hidden="true"
                                        />
                                        <input
                                            id={newPasswordId}
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={isVi ? "Nhập mật khẩu mới..." : "Enter new password..."}
                                            autoComplete="new-password"
                                            required
                                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-inner border border-border text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            className="absolute right-3.5 text-text-faint hover:text-text transition-colors cursor-pointer"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" aria-hidden="true" />
                                            ) : (
                                                <Eye className="w-4 h-4" aria-hidden="true" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Criteria Indicator */}
                                <div
                                    aria-label={isVi ? "Tiêu chí bảo mật mật khẩu" : "Password requirements"}
                                    className="p-3 rounded-xl bg-surface-inner/60 border border-border/60 text-xs flex flex-col gap-1.5"
                                >
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-3.5 h-3.5 text-text-faint" aria-hidden="true" />
                                        <span className="font-medium text-text-muted">
                                            {isVi ? "Yêu cầu mật khẩu:" : "Password requirements:"}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                                        <span
                                            className={`flex items-center gap-1.5 ${
                                                hasMinLength ? "text-success-500 font-medium" : "text-text-faint"
                                            }`}
                                        >
                                            <span className="text-xs">{hasMinLength ? "✓" : "○"}</span>
                                            {isVi ? "Ít nhất 8 ký tự" : "At least 8 chars"}
                                        </span>
                                        <span
                                            className={`flex items-center gap-1.5 ${
                                                hasUpper ? "text-success-500 font-medium" : "text-text-faint"
                                            }`}
                                        >
                                            <span className="text-xs">{hasUpper ? "✓" : "○"}</span>
                                            {isVi ? "1 chữ hoa (A-Z)" : "1 uppercase (A-Z)"}
                                        </span>
                                        <span
                                            className={`flex items-center gap-1.5 ${
                                                hasLower ? "text-success-500 font-medium" : "text-text-faint"
                                            }`}
                                        >
                                            <span className="text-xs">{hasLower ? "✓" : "○"}</span>
                                            {isVi ? "1 chữ thường (a-z)" : "1 lowercase (a-z)"}
                                        </span>
                                        <span
                                            className={`flex items-center gap-1.5 ${
                                                hasNumberOrSymbol ? "text-success-500 font-medium" : "text-text-faint"
                                            }`}
                                        >
                                            <span className="text-xs">{hasNumberOrSymbol ? "✓" : "○"}</span>
                                            {isVi ? "Chữ số hoặc ký tự" : "Number or symbol"}
                                        </span>
                                    </div>
                                </div>

                                {/* Confirm Password Field */}
                                <div className="flex flex-col gap-1.5">
                                    <label
                                        htmlFor={confirmPasswordId}
                                        className="text-xs font-medium text-text-muted"
                                    >
                                        {isVi ? "Xác nhận mật khẩu mới" : "Confirm new password"}
                                    </label>
                                    <div className="relative flex items-center">
                                        <Lock
                                            className="w-4 h-4 text-text-faint absolute left-3.5 pointer-events-none"
                                            aria-hidden="true"
                                        />
                                        <input
                                            id={confirmPasswordId}
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder={isVi ? "Nhập lại mật khẩu mới..." : "Re-enter new password..."}
                                            autoComplete="new-password"
                                            required
                                            className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-inner border text-sm text-text placeholder:text-text-faint focus:outline-none transition-all ${
                                                confirmPassword && !isMatch
                                                    ? "border-accent-500 focus:ring-1 focus:ring-accent-500"
                                                    : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            className="absolute right-3.5 text-text-faint hover:text-text transition-colors cursor-pointer"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="w-4 h-4" aria-hidden="true" />
                                            ) : (
                                                <Eye className="w-4 h-4" aria-hidden="true" />
                                            )}
                                        </button>
                                    </div>
                                    {confirmPassword && !isMatch && (
                                        <span className="text-[11px] text-accent-500 mt-0.5">
                                            {isVi
                                                ? "Mật khẩu xác nhận không trùng khớp."
                                                : "Passwords do not match."}
                                        </span>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="mt-2 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                            <span>{isVi ? "Đang xử lý..." : "Updating password..."}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{isVi ? "Cập nhật mật khẩu" : "Update Password"}</span>
                                            <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )
                    )}
                </div>

                {/* Footer Nav */}
                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/auth" })}
                        className="text-xs text-text-muted hover:text-text transition-colors cursor-pointer"
                    >
                        {isVi ? "← Quay lại đăng nhập" : "← Back to login"}
                    </button>
                </div>
            </div>
        </div>
    );
}
