import { useState, useEffect, useRef } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faCheckCircle, faCircleXmark, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "@/features/auth";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";

export const Route = createFileRoute("/_layout/verify-email")({
    component: VerifyEmailRoutePage,
});

function VerifyEmailRoutePage() {
    const navigate = useNavigate();
    const searchParams = useSearch({ from: "/_layout/verify-email" }) as { token?: string };
    const { verifyEmail, user } = useAuthStore();
    const { t, language } = useTranslation();
    useDocumentTitle(t("auth.verifyEmailTitle", { defaultValue: "Xác minh email" }));
    const isVi = language === "vi";

    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [errorMsg, setErrorMsg] = useState("");

    const token = searchParams.token?.trim();
    const isMountedRef = useRef(true);
    const requestedTokenRef = useRef<string | null>(null);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setErrorMsg(t("auth.verifyEmailTokenNotFound", { defaultValue: "Không tìm thấy token xác thực trong liên kết." }));
            return;
        }

        // If the current logged-in user is already verified
        if (user?.isVerified) {
            setStatus("success");
            return;
        }

        // Prevent duplicate verification calls for the same token (e.g. React 18 StrictMode in dev)
        if (requestedTokenRef.current === token) {
            return;
        }
        requestedTokenRef.current = token;

        const doVerify = async () => {
            const res = await verifyEmail(token);
            if (!isMountedRef.current) return;

            if (res.success) {
                setStatus("success");
            } else {
                // If user in store is already marked as verified, treat as success
                const currentUser = useAuthStore.getState().user;
                if (currentUser?.isVerified) {
                    setStatus("success");
                } else {
                    setStatus("error");
                    setErrorMsg(res.error || t("auth.verifyEmailInvalidToken", { defaultValue: "Token xác thực không hợp lệ hoặc đã hết hạn." }));
                }
            }
        };

        void doVerify();
    }, [token, verifyEmail, user?.isVerified, t]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-2xl text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/10">
                    <FontAwesomeIcon icon={faShieldHalved} />
                </div>

                {status === "verifying" && (
                    <div className="space-y-2">
                        <h2 className="text-xl font-black text-text uppercase tracking-tight">
                            {t("auth.verifyEmailPageTitle", { defaultValue: "Đang xác minh email..." })}
                        </h2>
                        <p className="text-xs text-text-muted">
                            {t("auth.verifyEmailPageSubtitle", { defaultValue: "Vui lòng chờ trong giây lát trong khi hệ thống kiểm tra token xác thực." })}
                        </p>
                        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto pt-2" />
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="text-emerald-400 text-4xl">
                            <FontAwesomeIcon icon={faCheckCircle} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-text uppercase tracking-tight">
                                {t("auth.verifyEmailSuccessTitle", { defaultValue: "Xác minh email thành công!" })}
                            </h2>
                            <p className="text-xs text-text-muted mt-1">
                                {isVi ? (
                                    <>Tài khoản <strong className="text-amber-400">{user?.email || "của bạn"}</strong> đã được mở khóa đầy đủ quyền truy cập.</>
                                ) : (
                                    <>Account <strong className="text-amber-400">{user?.email || "yours"}</strong> has been unlocked with full access.</>
                                )}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate({ to: "/" })}
                            className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                        >
                            <span>{t("auth.verifyEmailBackHome", { defaultValue: "Về Trang Chủ" })}</span>
                            <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                    </div>
                )}

                {status === "error" && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="text-rose-400 text-4xl">
                            <FontAwesomeIcon icon={faCircleXmark} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-text uppercase tracking-tight">
                                {t("auth.verifyEmailFailedTitle", { defaultValue: "Xác minh không thành công" })}
                            </h2>
                            <p className="text-xs text-rose-300 mt-1">{errorMsg}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate({ to: "/" })}
                            className="w-full py-3 px-4 rounded-xl bg-surface-inner hover:bg-surface-hover text-text font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-border"
                        >
                            {t("common.home", { defaultValue: "Trang chủ" })}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
