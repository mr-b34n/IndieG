import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserShield,
    faUserCheck,
    faUserXmark,
    faDragon,
    faVideo,
    faCrosshairs,
    faKey,
    faArrowRightToBracket,
    faPenToSquare,
    faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../store/useAuthStore";
import { TEST_ACCOUNTS, type MockAccountCredential } from "../constants";

interface AccountSwitcherProps {
    compact?: boolean;
    onFill?: (email: string, password?: string) => void;
}

export const AccountSwitcher: React.FC<AccountSwitcherProps> = ({ onFill }) => {
    const { user, login } = useAuthStore();
    const navigate = useNavigate();
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const accountsList: Array<{
        key: string;
        acc: MockAccountCredential;
        icon: typeof faUserShield;
        color: string;
        badgeColor: string;
        roleTag: string;
    }> = [
        {
            key: "admin",
            acc: TEST_ACCOUNTS.admin,
            icon: faUserShield,
            color: "text-rose-400 bg-rose-500/10 border-rose-500/25 hover:border-rose-500/50",
            badgeColor: "text-rose-400 bg-rose-500/20",
            roleTag: "Admin",
        },
        {
            key: "verifiedUser",
            acc: TEST_ACCOUNTS.verifiedUser,
            icon: faUserCheck,
            color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25 hover:border-emerald-500/50",
            badgeColor: "text-emerald-400 bg-emerald-500/20",
            roleTag: "Founder",
        },
        {
            key: "eldenLord",
            acc: TEST_ACCOUNTS.eldenLord,
            icon: faDragon,
            color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25 hover:border-cyan-500/50",
            badgeColor: "text-cyan-400 bg-cyan-500/20",
            roleTag: "Hardcore RPG",
        },
        {
            key: "streamer",
            acc: TEST_ACCOUNTS.streamer,
            icon: faVideo,
            color: "text-purple-400 bg-purple-500/10 border-purple-500/25 hover:border-purple-500/50",
            badgeColor: "text-purple-400 bg-purple-500/20",
            roleTag: "Streamer",
        },
        {
            key: "shadowHunter",
            acc: TEST_ACCOUNTS.shadowHunter,
            icon: faCrosshairs,
            color: "text-blue-400 bg-blue-500/10 border-blue-500/25 hover:border-blue-500/50",
            badgeColor: "text-blue-400 bg-blue-500/20",
            roleTag: "FPS Pro",
        },
        {
            key: "unverifiedUser",
            acc: TEST_ACCOUNTS.unverifiedUser,
            icon: faUserXmark,
            color: "text-amber-400 bg-amber-500/10 border-amber-500/25 hover:border-amber-500/50",
            badgeColor: "text-amber-400 bg-amber-500/20",
            roleTag: "Chưa verify",
        },
    ];

    const handleOneClickLogin = (acc: MockAccountCredential) => {
        login(acc, `mock_token_${acc.id}`, `mock_refresh_${acc.id}`);
        if (typeof window !== "undefined" && window.location.pathname.startsWith("/auth")) {
            navigate({ to: "/" });
        }
    };

    const handleFillForm = (acc: MockAccountCredential) => {
        if (onFill && acc.email) {
            onFill(acc.email, acc.password);
            setCopiedKey(acc.id);
            setTimeout(() => setCopiedKey(null), 1500);
        } else {
            handleOneClickLogin(acc);
        }
    };

    return (
        <div className="flex flex-col gap-2.5 p-3 rounded-2xl bg-surface/20 border border-border/20 text-text backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2 border-b border-border/15 pb-2">
                <span className="font-bold text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faArrowRightToBracket} className="text-primary text-xs" />
                    <span>Tài Khoản Mẫu Để Đăng Nhập (Test Accounts)</span>
                </span>
                {user && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-hover/60 border border-border/30 text-text-muted">
                        Đang đăng nhập: <strong className="text-primary font-bold">{user.username}</strong>
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {accountsList.map(({ key, acc, icon, color, badgeColor, roleTag }) => {
                    if (!acc) return null;
                    const isCurrent = user?.id === acc.id || user?.email === acc.email;
                    const isFilled = copiedKey === acc.id;

                    return (
                        <div
                            key={key}
                            className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${color} ${
                                isCurrent ? "ring-2 ring-primary/40 font-bold" : "opacity-90 hover:opacity-100"
                            }`}
                        >
                            <div className="flex items-start gap-2.5">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${badgeColor}`}>
                                    <FontAwesomeIcon icon={icon} className="text-sm" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                        <p className="font-bold text-xs truncate">{acc.name || acc.username}</p>
                                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface/50 border border-border/30 text-text-muted">
                                            {roleTag}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-text-faint truncate font-mono mt-0.5">{acc.email}</p>
                                    <p className="text-[10px] text-text-muted truncate flex items-center gap-1 mt-0.5">
                                        <FontAwesomeIcon icon={faKey} className="text-[8px] opacity-60" />
                                        <span className="font-mono font-semibold">{acc.password}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Dual action buttons: Điền form or 1-Click login */}
                            <div className="flex items-center gap-1.5 pt-1 border-t border-border/15">
                                <button
                                    type="button"
                                    onClick={() => handleFillForm(acc)}
                                    title="Điền email và mật khẩu vào form đăng nhập"
                                    className="flex-1 py-1 px-2 rounded-lg bg-surface-hover/40 hover:bg-surface-hover/80 text-[10px] font-semibold text-text-muted hover:text-text transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={isFilled ? faCheck : faPenToSquare} className="text-[9px]" />
                                    <span>{isFilled ? "Đã điền!" : "Điền form"}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleOneClickLogin(acc)}
                                    title="Đăng nhập ngay lập tức với tài khoản này"
                                    className="flex-1 py-1 px-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm shadow-primary/20"
                                >
                                    <FontAwesomeIcon icon={faArrowRightToBracket} className="text-[9px]" />
                                    <span>Vào ngay</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <p className="text-[10px] text-text-faint text-center pt-0.5">
                💡 Bạn có thể bấm <strong className="text-text-muted">Điền form</strong> để kiểm tra form đăng nhập hoặc bấm <strong className="text-primary">Vào ngay</strong> để đăng nhập 1-click tức thì.
            </p>
        </div>
    );
};
