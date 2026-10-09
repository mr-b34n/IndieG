import { useShortcutsStore } from "@/shared/store/useShortcutsStore";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass } from "@fortawesome/free-solid-svg-icons";

const DESTINATIONS = [
    { key: "F", vi: "Feed", en: "Feed" },
    { key: "C", vi: "Cộng đồng", en: "Community" },
    { key: "S", vi: "Squad", en: "Squad" },
    { key: "G", vi: "Game", en: "Game" },
    { key: "E", vi: "Khám phá", en: "Explore" },
    { key: "P", vi: "Hồ sơ", en: "Profile" },
    { key: "B", vi: "Dấu trang", en: "Bookmark" },
    { key: "N", vi: "Thông báo", en: "Notif" },
    { key: "A", vi: "Cài đặt", en: "Account" },
];

export const GoToIndicator = () => {
    const activeSequence = useShortcutsStore((state) => state.activeSequence);
    const { language } = useTranslation();
    const isVi = language === "vi";

    if (!activeSequence) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] pointer-events-none animate-slide-up select-none">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-surface/95 border border-primary/40 shadow-2xl backdrop-blur-md text-text">
                <div className="flex items-center gap-1.5 font-bold text-xs text-primary">
                    <FontAwesomeIcon icon={faCompass} className="animate-spin text-sm" style={{ animationDuration: '3s' }} />
                    <span className="uppercase font-mono">G + ...</span>
                </div>
                <div className="h-4 w-px bg-border/60" />
                <div className="flex items-center gap-2 overflow-x-auto text-xs">
                    {DESTINATIONS.map((dest) => (
                        <div key={dest.key} className="flex items-center gap-1 shrink-0">
                            <kbd className="px-1.5 py-0.5 rounded bg-surface-inner border border-border/80 font-mono font-bold text-[10px] text-primary">
                                {dest.key}
                            </kbd>
                            <span className="text-[11px] text-text-muted font-medium">
                                {isVi ? dest.vi : dest.en}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
