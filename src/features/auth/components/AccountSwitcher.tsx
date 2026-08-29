import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserShield,
    faUserCheck,
    faUserXmark,
    faRightLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "../store/useAuthStore";
import { TEST_ACCOUNTS } from "../constants";

export const AccountSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
    const { user, login } = useAuthStore();

    if (Object.keys(TEST_ACCOUNTS).length === 0) {
        return null;
    }

    return (
        <div className={`flex flex-col gap-2.5 p-3.5 bg-surface border border-border/80 rounded-xl text-text shadow-sm ${compact ? 'text-xs' : ''}`}>
            <div className="flex items-center justify-between gap-2 border-b border-divider-primary pb-2">
                <span className="font-black text-xs uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faRightLeft} className="text-primary text-xs" />
                    <span>Tài Khoản Thử Nghiệm (Test Manual)</span>
                </span>
                {user && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-hover border border-border text-text-muted">
                        Đang đăng nhập: <strong className="text-primary font-bold">{user.username}</strong>
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                {/* 1. ADMIN */}
                <button
                    type="button"
                    onClick={() => login(TEST_ACCOUNTS.admin)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        user?.id === TEST_ACCOUNTS.admin.id
                            ? "bg-rose-500/15 border-rose-500 text-rose-400 font-bold shadow-xs"
                            : "bg-surface-hover/80 border-border/60 text-text-muted hover:border-rose-500/50 hover:text-text hover:bg-surface-hover"
                    }`}
                >
                    <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-bold">
                        <FontAwesomeIcon icon={faUserShield} className="text-xs" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-extrabold text-xs truncate text-rose-400">1. Admin</p>
                        <p className="text-[10px] text-text-faint truncate font-mono">admin@indieg.com</p>
                        <p className="text-[10px] text-emerald-400/90 font-semibold truncate">Full Quyền + Verified</p>
                    </div>
                </button>

                {/* 2. USER BÌNH THƯỜNG */}
                <button
                    type="button"
                    onClick={() => login(TEST_ACCOUNTS.verifiedUser)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        user?.id === TEST_ACCOUNTS.verifiedUser.id
                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold shadow-xs"
                            : "bg-surface-hover/80 border-border/60 text-text-muted hover:border-emerald-500/50 hover:text-text hover:bg-surface-hover"
                    }`}
                >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                        <FontAwesomeIcon icon={faUserCheck} className="text-xs" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-extrabold text-xs truncate text-emerald-400">2. User Bình Thường</p>
                        <p className="text-[10px] text-text-faint truncate font-mono">user@indieg.com</p>
                        <p className="text-[10px] text-emerald-400/90 font-semibold truncate">Email Đã Verified</p>
                    </div>
                </button>

                {/* 3. USER CHƯA VERIFY */}
                <button
                    type="button"
                    onClick={() => login(TEST_ACCOUNTS.unverifiedUser)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        user?.id === TEST_ACCOUNTS.unverifiedUser.id
                            ? "bg-amber-500/15 border-amber-500 text-amber-400 font-bold shadow-xs"
                            : "bg-surface-hover/80 border-border/60 text-text-muted hover:border-amber-500/50 hover:text-text hover:bg-surface-hover"
                    }`}
                >
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold">
                        <FontAwesomeIcon icon={faUserXmark} className="text-xs" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-extrabold text-xs truncate text-amber-400">3. User Chưa Verify</p>
                        <p className="text-[10px] text-text-faint truncate font-mono">unverified@indieg.com</p>
                        <p className="text-[10px] text-amber-300/90 font-semibold truncate">Bị Giới Hạn Quyền</p>
                    </div>
                </button>
            </div>
        </div>
    );
};
