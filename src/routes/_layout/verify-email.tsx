import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faCheckCircle, faCircleXmark, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "@/features/auth";

export const Route = createFileRoute("/_layout/verify-email")({
    component: VerifyEmailRoutePage,
});

function VerifyEmailRoutePage() {
    const navigate = useNavigate();
    const searchParams = useSearch({ from: "/_layout/verify-email" }) as { token?: string };
    const { verifyEmail, user } = useAuthStore();

    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [errorMsg, setErrorMsg] = useState("");

    const token = searchParams.token || "tok_demo_verify_2026";

    useEffect(() => {
        let isMounted = true;
        const doVerify = async () => {
            if (!token) {
                if (isMounted) {
                    setStatus("error");
                    setErrorMsg("Không tìm thấy token xác thực trong liên kết.");
                }
                return;
            }

            const res = await verifyEmail(token);
            if (isMounted) {
                if (res.success) {
                    setStatus("success");
                } else {
                    setStatus("error");
                    setErrorMsg(res.error || "Token xác thực không hợp lệ hoặc đã hết hạn.");
                }
            }
        };

        doVerify();
        return () => {
            isMounted = false;
        };
    }, [token, verifyEmail]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0D111D] border border-[#20283A] rounded-[20px] p-8 shadow-2xl text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-[16px] bg-[rgba(255,165,0,0.08)] border border-[rgba(255,165,0,0.35)] text-[#FFB020] flex items-center justify-center text-3xl shadow-lg shadow-amber-500/10">
                    <FontAwesomeIcon icon={faShieldHalved} />
                </div>

                {status === "verifying" && (
                    <div className="space-y-2">
                        <h2 className="text-xl font-black text-[#F1F3F7] uppercase tracking-tight">
                            Đang xác minh email...
                        </h2>
                        <p className="text-xs text-[#8B93A7]">
                            Vui lòng chờ trong giây lát trong khi hệ thống kiểm tra token xác thực.
                        </p>
                        <div className="w-8 h-8 border-2 border-[#FFB020] border-t-transparent rounded-full animate-spin mx-auto pt-2" />
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="text-emerald-400 text-4xl">
                            <FontAwesomeIcon icon={faCheckCircle} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[#F1F3F7] uppercase tracking-tight">
                                Xác minh email thành công!
                            </h2>
                            <p className="text-xs text-[#8B93A7] mt-1">
                                Tài khoản <strong className="text-[#FFB020]">{user?.email || "của bạn"}</strong> đã được mở khóa đầy đủ quyền truy cập.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate({ to: "/" })}
                            className="w-full py-3 px-4 rounded-[12px] bg-[#FFB020] hover:bg-[#ffa500] text-black font-extrabold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                        >
                            <span>Về Trang Chủ</span>
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
                            <h2 className="text-xl font-black text-[#F1F3F7] uppercase tracking-tight">
                                Xác minh không thành công
                            </h2>
                            <p className="text-xs text-rose-300 mt-1">{errorMsg}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate({ to: "/" })}
                            className="w-full py-3 px-4 rounded-[12px] bg-[#121827] hover:bg-[#1A2130] text-[#F1F3F7] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-[#20283A]"
                        >
                            Quay lại Trang Chủ
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
