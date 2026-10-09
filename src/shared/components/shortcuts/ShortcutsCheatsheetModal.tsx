import { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faKeyboard,
    faXmark,
    faMagnifyingGlass,
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
    const [searchQuery, setSearchQuery] = useState("");

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
                    descriptionVi: "Mở bảng phím tắt này (Cheatsheet)",
                    descriptionEn: "Open shortcuts cheatsheet",
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
                    descriptionVi: "Gửi / Đăng bài (Bài viết, Bình luận, Reply, Chat)",
                    descriptionEn: "Submit / Send (Post, Comment, Reply, Chat)",
                },
                {
                    keys: [["Esc"]],
                    descriptionVi: "Đóng modal, dropdown, lightbox theo thứ tự",
                    descriptionEn: "Close modal, dropdown, lightbox by layer",
                },
                {
                    keys: [["T"]],
                    descriptionVi: "Chuyển đổi giao diện Sáng / Tối (Dark / Light Theme)",
                    descriptionEn: "Toggle Dark / Light Theme",
                },
                {
                    keys: [["L"]],
                    descriptionVi: "Chuyển đổi ngôn ngữ Tiếng Việt ↔ English",
                    descriptionEn: "Toggle Language (Vietnamese ↔ English)",
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
                    descriptionVi: "Trang chủ / Nguồn cấp bài viết (Feed)",
                    descriptionEn: "Home / Feed page",
                    isSequence: true,
                },
                {
                    keys: [["G", "C"]],
                    descriptionVi: "Cộng đồng (/community)",
                    descriptionEn: "Community hub",
                    isSequence: true,
                },
                {
                    keys: [["G", "S"]],
                    descriptionVi: "Squad / Tìm đội chơi (/squad)",
                    descriptionEn: "Squads / LFG",
                    isSequence: true,
                },
                {
                    keys: [["G", "G"]],
                    descriptionVi: "Game Hub / Thư viện trò chơi",
                    descriptionEn: "Game Hub / Library",
                    isSequence: true,
                },
                {
                    keys: [["G", "E"]],
                    descriptionVi: "Khám phá / Tạp chí (/explore)",
                    descriptionEn: "Explore / Magazine",
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
                    descriptionVi: "Cài đặt → Tài khoản (Settings → Account)",
                    descriptionEn: "Settings → Account",
                    isSequence: true,
                },
            ],
        },
        {
            id: "feed",
            icon: faNewspaper,
            titleVi: "Phím tắt trong Feed & Bài viết",
            titleEn: "Feed & Post Navigation",
            items: [
                {
                    keys: [["J"], ["K"]],
                    descriptionVi: "Cuộn xuống / lên bài viết kế tiếp (Reddit style)",
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
                    descriptionVi: "Ghim / Bỏ ghim bài viết (Tác giả / Admin)",
                    descriptionEn: "Pin / Unpin post (Author / Admin)",
                },
                {
                    keys: [["B"]],
                    descriptionVi: "Lưu / Bỏ lưu bài viết vào Dấu trang",
                    descriptionEn: "Bookmark / Unbookmark active post",
                },
            ],
        },
        {
            id: "media",
            icon: faImages,
            titleVi: "Trong Lightbox & Xem ảnh",
            titleEn: "Lightbox & Media Viewer",
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
            titleVi: "Thông báo & Chuyển Tab",
            titleEn: "Notifications & Tab Switching",
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

    const filteredGroups = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return groups;

        return groups
            .map((group) => {
                const matchedItems = group.items.filter((item) => {
                    const desc = isVi ? item.descriptionVi : item.descriptionEn;
                    const altDesc = isVi ? item.descriptionEn : item.descriptionVi;
                    const inDesc = desc.toLowerCase().includes(query) || altDesc.toLowerCase().includes(query);
                    const inKeys = item.keys.some((combo) =>
                        combo.some((k) => k.toLowerCase().includes(query))
                    );
                    return inDesc || inKeys;
                });
                return { ...group, items: matchedItems };
            })
            .filter((g) => g.items.length > 0);
    }, [groups, searchQuery, isVi]);

    if (!isCheatsheetOpen) return null;

    const renderKeycap = (key: string) => {
        const label = formatKeyCap(key, isMac);
        return (
            <kbd
                key={key}
                className="inline-flex items-center justify-center min-w-[26px] h-7 px-2 text-[12px] font-mono font-bold bg-surface-hover/80 text-text border border-border/80 rounded-[6px] shadow-xs select-none"
            >
                {label}
            </kbd>
        );
    };

    const renderCombos = (item: ShortcutDef) => {
        if (item.isSequence) {
            return (
                <div className="flex items-center gap-1.5 shrink-0">
                    {renderKeycap(item.keys[0][0])}
                    <span className="text-[11px] text-text-muted font-bold">{isVi ? "sau đó" : "then"}</span>
                    {renderKeycap(item.keys[0][1])}
                </div>
            );
        }

        return (
            <div className="flex flex-wrap items-center gap-1.5 shrink-0 justify-end">
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

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 select-none animate-fade-in">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
                onClick={closeCheatsheet}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-3xl max-h-[85vh] bg-surface border border-border/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 animate-scale-up">
                {/* Header */}
                <div className="px-5 py-4 border-b border-border bg-surface-inner flex items-center justify-between gap-4 shrink-0">
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

                {/* Search Bar */}
                <div className="px-5 py-3 border-b border-border/60 bg-surface/50 shrink-0">
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint text-xs pointer-events-none"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={isVi ? "Tìm kiếm phím tắt..." : "Search shortcuts..."}
                            className="w-full bg-surface-inner border border-border/70 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary transition-colors"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text text-xs cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Body / List */}
                <div className="p-5 overflow-y-auto space-y-6 flex-1 text-sm scrollbar-thin">
                    {filteredGroups.length === 0 ? (
                        <div className="py-12 text-center text-text-muted text-xs">
                            {isVi ? "Không tìm thấy phím tắt phù hợp" : "No shortcuts matched your search"}
                        </div>
                    ) : (
                        filteredGroups.map((group) => (
                            <div key={group.id} className="space-y-2.5">
                                <div className="flex items-center gap-2 pb-1.5 border-b border-border/40">
                                    <FontAwesomeIcon icon={group.icon} className="text-primary text-xs" />
                                    <h3 className="font-bold text-xs uppercase tracking-wider text-text-faint">
                                        {isVi ? group.titleVi : group.titleEn}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    {group.items.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-surface-inner/60 hover:bg-surface-inner border border-border/40 hover:border-border/80 transition-all"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-xs sm:text-[13px] text-text font-medium">
                                                    {isVi ? item.descriptionVi : item.descriptionEn}
                                                </span>
                                            </div>
                                            {renderCombos(item)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Hint */}
                <div className="px-5 py-3 border-t border-border bg-surface-inner flex items-center justify-between text-[11px] text-text-muted shrink-0">
                    <span>
                        {isVi
                            ? "Mẹo: Nhấn Esc bất kỳ lúc nào để đóng bảng này"
                            : "Tip: Press Esc anytime to close this cheatsheet"}
                    </span>
                    <span className="font-mono text-text-faint">IndieG Keyboard System</span>
                </div>
            </div>
        </div>
    );
};
