import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelopeCircleCheck, faRightToBracket, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "@/shared/store/useThemeStore";
import { AppModal } from "@/shared/components/ui/AppModal";

export const VerifyNoticeModal: React.FC = () => {
    const navigate = useNavigate();
    const isVerifyModalOpen = useAuthStore((state) => state.isVerifyModalOpen);
    const verifyModalMessage = useAuthStore((state) => state.verifyModalMessage);
    const closeVerifyModal = useAuthStore((state) => state.closeVerifyModal);
    const user = useAuthStore((state) => state.user);
    const language = useThemeStore((state) => state.language);
    const isVi = language === "vi";

    if (!isVerifyModalOpen) return null;

    const isLoginPrompt = !user;

    const handlePrimaryAction = () => {
        closeVerifyModal();
        if (isLoginPrompt) {
            navigate({ to: "/auth" });
        } else {
            navigate({ to: "/settings", search: { tab: "account" } as Record<string, unknown> });
        }
    };

    return (
        <AppModal
            isOpen={isVerifyModalOpen}
            onClose={closeVerifyModal}
            title={
                isLoginPrompt
                    ? isVi
                        ? "Yêu cầu đăng nhập"
                        : "Login Required"
                    : isVi
                    ? "Xác thực Email"
                    : "Email Verification"
            }
            icon={isLoginPrompt ? faRightToBracket : faEnvelopeCircleCheck}
            variant="security"
            maxWidth="md"
            footer={
                <div className="flex items-center justify-end gap-2.5 w-full">
                    <button
                        type="button"
                        onClick={closeVerifyModal}
                        className="px-3.5 py-1.5 rounded-[4px] text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-hover/60 border border-divider-primary/50 transition-colors cursor-pointer"
                    >
                        {isVi ? "Đóng" : "Close"}
                    </button>
                    <button
                        type="button"
                        onClick={handlePrimaryAction}
                        className="px-4 py-1.5 rounded-[4px] text-xs font-bold text-white bg-primary hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                    >
                        {isLoginPrompt
                            ? isVi
                                ? "Đăng nhập ngay"
                                : "Log In Now"
                            : isVi
                            ? "Xác thực ngay"
                            : "Verify Now"}
                    </button>
                </div>
            }
        >
            <div className="text-xs text-text-muted leading-relaxed py-1">
                <p>
                    {verifyModalMessage ||
                        (isLoginPrompt
                            ? isVi
                                ? "Vui lòng đăng nhập để thực hiện thao tác này."
                                : "Please log in to perform this action."
                            : isVi
                            ? "Tài khoản của bạn chưa được xác thực email. Vui lòng xác minh địa chỉ email để tiếp tục."
                            : "Your email address is not verified yet. Please verify your email to proceed.")}
                </p>
            </div>
        </AppModal>
    );
};
