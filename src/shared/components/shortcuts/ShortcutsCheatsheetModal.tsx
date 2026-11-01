import { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faKeyboard,
    faXmark,
    faCompass,
    faGlobe,
    faNewspaper,
    faImages,
    faBell,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useShortcutsStore } from "@/shared/store/useShortcutsStore";
import { isMacSystem, formatKeyCap } from "@/shared/hooks/useHotkeys";
import { useRegisterOverlay } from "@/shared/utils/overlayManager";

interface ShortcutDef {
    keys: string[][]; // Alternative combos or sequence
    descriptionVi: string;
    descriptionEn: string;
    badge?: string;
    isSequence?: boolean;
}

interface ShortcutGroup {
    id: string;
    icon: typeof faKeyboard;
    titleVi: string;
    titleEn: string;
    items: ShortcutDef[];
}

export const ShortcutsCheatsheetModal = () => {
    const { language } = useTranslation();
    const isVi = language === "vi";
    const isMac = isMacSystem();

    const isCheatsheetOpen = useShortcutsStore((state) => state.isCheatsheetOpen);
    const closeCheatsheet = useShortcutsStore((state) => state.closeCheatsheet);

    useRegisterOverlay({
        id: "shortcuts-cheatsheet-modal",
        isOpen: isCheatsheetOpen,
        onClose: closeCheatsheet,
        priority: 200,
    });

    const groups: ShortcutGroup[] = useMemo(() => [
        {
            id: "global",
            icon: faGlobe,
            titleVi: "Phím tắt Toàn cục (Global)",
            titleEn: "Global Shortcuts",
            items: [
                {
                    keys: [["\\"]],
                    descriptionVi: "Mở / Đóng bảng phím tắt này",
                    descriptionEn: "Toggle shortcuts cheatsheet",
                },
                {
                    keys: [["/"]],
                    descriptionVi: "Tìm kiếm nhanh (Focus Search)",
                    descriptionEn: "Quick search / Focus Search",
                },
                {
                    keys: [["Mod", "K"]],
                    descriptionVi: "Mở hộp thoại Tạo bài viết mới",
                    descriptionEn: "Open Create Post modal",
                },
                {
                    keys: [["Mod", "Enter"]],
                    descriptionVi: "Gửi / Đăng bài (Post, Comment, Chat)",
                    descriptionEn: "Submit / Send (Post, Comment, Chat)",
                },
                {
                    keys: [["Esc"]],
                    descriptionVi: "Đóng modal, dropdown, menu",
                    descriptionEn: "Close modal, dropdown, menu",
                },
                {
                    keys: [["T"]],
                    descriptionVi: "Chuyển giao diện Sáng / Tối (Theme)",
                    descriptionEn: "Toggle Dark / Light Theme",
                },
                {
                    keys: [["L"]],
                    descriptionVi: "Đổi ngôn ngữ (Tiếng Việt ↔ English)",
                    descriptionEn: "Toggle Language (VI ↔ EN)",
                },
            ],
        },
        {
            id: "goto",
            icon: faCompass,
            titleVi: "Điều hướng nhanh (Go-to: G + Phím)",
            titleEn: "Quick Navigation (Go-to: G + Key)",
            items: [
                {
                    keys: [["G", "F"]],
                    descriptionVi: "Bảng tin Trang chủ (/)",
                    descriptionEn: "Home Feed (/)",
                    isSequence: true,
                },
                {
                    keys: [["G", "C"]],
                    descriptionVi: "Cộng đồng (/community)",
                    descriptionEn: "Community hub",
                    isSequence: true,
                },
                {
                    keys: [["G", "G"]],
                    descriptionVi: "Game Hub / Thư viện trò chơi",
                    descriptionEn: "Game Hub / Library",
                    isSequence: true,
                },
                {
                    keys: [["G", "P"]],
                    descriptionVi: "Hồ sơ cá nhân (/profile)",
                    descriptionEn: "My Profile",
                    isSequence: true,
                },
                {
                    keys: [["G", "B"]],
                    descriptionVi: "Bài viết đã lưu (/bookmark)",
                    descriptionEn: "Bookmarks",
                    isSequence: true,
                },
                {
                    keys: [["G", "N"]],
                    descriptionVi: "Trung tâm thông báo",
                    descriptionEn: "Notification center",
                    isSequence: true,
                },
                {
                    keys: [["G", "A"]],
                    descriptionVi: "Cài đặt → Tài khoản & Bảo mật",
                    descriptionEn: "Settings → Account & Security",
                    isSequence: true,
                },
            ],
        },
        {
            id: "feed",
            icon: faNewspaper,
            titleVi: "Feed & Bài viết",
            titleEn: "Feed & Post Navigation",
            items: [
                {
                    keys: [["J"], ["K"]],
                    descriptionVi: "Cuộn xuống / lên bài viết kế tiếp",
                    descriptionEn: "Navigate next / previous post",
                },
                {
                    keys: [["A"], ["ArrowUp"]],
                    descriptionVi: "Upvote bài viết đang chọn",
                    descriptionEn: "Upvote active post",
                },
                {
                    keys: [["Z"], ["ArrowDown"]],
                    descriptionVi: "Downvote bài viết đang chọn",
                    descriptionEn: "Downvote active post",
                },
                {
                    keys: [["P"]],
                    descriptionVi: "Ghim / Bỏ ghim bài viết",
                    descriptionEn: "Pin / Unpin post",
                },
                {
                    keys: [["B"]],
                    descriptionVi: "Lưu / Bỏ lưu vào Dấu trang",
                    descriptionEn: "Bookmark / Unbookmark active post",
                },
            ],
        },
        {
            id: "media",
            icon: faImages,
            titleVi: "Xem ảnh & Media",
            titleEn: "Media & Viewer",
            items: [
                {
                    keys: [["ArrowLeft"], ["ArrowRight"]],
                    descriptionVi: "Xem ảnh trước / ảnh kế tiếp",
                    descriptionEn: "Previous / Next image",
                },
                {
                    keys: [["Esc"]],
                    descriptionVi: "Đóng cửa sổ xem ảnh",
                    descriptionEn: "Close media viewer",
                },
            ],
        },
        {
            id: "notifications-tabs",
            icon: faBell,
            titleVi: "Thông báo & Tabs",
            titleEn: "Notifications & Tabs",
            items: [
                {
                    keys: [["Shift", "M"]],
                    descriptionVi: "Đánh dấu tất cả thông báo đã đọc",
                    descriptionEn: "Mark all notifications as read",
                },
                {
                    keys: [["1"], ["2"], ["3"], ["4"], ["5"], ["6"]],
                    descriptionVi: "Chuyển tab nhanh (Search, Settings, Profile)",
                    descriptionEn: "Quick tab switcher (Search, Settings, Profile)",
                },
            ],
        },
    ], []);

    if (!isCheatsheetOpen) return null;

    const renderKeycap = (key: string) => {
        const label = formatKeyCap(key, isMac);
        return (
            <kbd
                key={key}
                className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-mono font-bold bg-surface-hover/90 text-text border border-border/80 rounded shadow-xs select-none"
            >
                {label}
            </kbd>
        );
    };

    const renderCombos = (item: ShortcutDef) => {
        if (item.isSequence) {
            return (
                <div className="flex items-center gap-1 shrink-0">
                    {renderKeycap(item.keys[0][0])}
                    <span className="text-[10px] text-text-faint font-semibold mx-0.5">{isVi ? "sau đó" : "then"}</span>
                    {renderKeycap(item.keys[0][1])}
                </div>
            );
        }

        return (
            <div className="flex flex-wrap items-center gap-1 shrink-0 justify-end">
                {item.keys.map((combo, comboIdx) => (
                    <div key={comboIdx} className="flex items-center gap-1">
                        {comboIdx > 0 && <span className="text-text-faint text-[10px] mx-0.5">/</span>}
                        {combo.map((key, keyIdx) => (
                            <span key={keyIdx} className="inline-flex items-center gap-0.5">
                                {keyIdx > 0 && <span className="text-text-muted text-[10px]">+</span>}
                                {renderKeycap(key)}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    // Split groups into 2 balanced columns
    const col1Groups = groups.filter((g) => g.id === "global" || g.id === "feed");
    const col2Groups = groups.filter((g) => g.id === "goto" || g.id === "media" || g.id === "notifications-tabs");

    const renderGroup = (group: ShortcutGroup) => (
        <div key={group.id} className="space-y-2">
            <div className="flex items-center gap-2 pb-1.5 border-b border-border/50">
                <FontAwesomeIcon icon={group.icon} className="text-primary text-xs" />
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-text-faint">
                    {isVi ? group.titleVi : group.titleEn}
                </h3>
            </div>

            <div className="divide-y divide-border/25">
                {group.items.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between gap-3 py-2 px-1 hover:bg-surface-inner/60 rounded-md transition-colors"
                    >
                        <span className="text-xs text-text-muted hover:text-text font-medium leading-tight">
                            {isVi ? item.descriptionVi : item.descriptionEn}
                        </span>
                        {renderCombos(item)}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 select-none animate-fade-in">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
                onClick={closeCheatsheet}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-4xl max-h-[85vh] bg-surface border border-border/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-scale-up">
                {/* Header (Clean, no search input) */}
                <div className="px-6 py-4 border-b border-border bg-surface-inner flex items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center text-base shrink-0">
                            <FontAwesomeIcon icon={faKeyboard} />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-black text-text leading-tight">
                                {isVi ? "Bảng Phím Tắt Hệ Thống" : "Keyboard Shortcuts Cheatsheet"}
                            </h2>
                            <p className="text-xs text-text-muted">
                                {isVi
                                    ? `Đang dùng hệ điều hành ${isMac ? "macOS (⌘ Cmd)" : "Windows / Linux (Ctrl)"}`
                                    : `Detected ${isMac ? "macOS (⌘ Cmd)" : "Windows / Linux (Ctrl)"}`}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={closeCheatsheet}
                        className="w-8 h-8 rounded-lg bg-surface hover:bg-surface-hover text-text-muted hover:text-text flex items-center justify-center transition-colors cursor-pointer"
                        title={isVi ? "Đóng (Esc)" : "Close (Esc)"}
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-sm" />
                    </button>
                </div>

                {/* Body: 2-Column Responsive Layout */}
                <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Column 1: Global + Feed */}
                        <div className="space-y-6">
                            {col1Groups.map(renderGroup)}
                        </div>

                        {/* Column 2: Go-to + Media + Tabs */}
                        <div className="space-y-6">
                            {col2Groups.map(renderGroup)}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-border bg-surface-inner flex items-center justify-between text-[11px] text-text-muted shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>
                            {isVi
                                ? "Mẹo: Nhấn Esc hoặc \\ bất kỳ lúc nào để đóng bảng này"
                                : "Tip: Press Esc or \\ anytime to close this cheatsheet"}
                        </span>
                    </div>
                    <span className="font-mono text-text-faint text-[10px]">Ludon Shortcuts</span>
                </div>
            </div>
        </div>
    );
};
