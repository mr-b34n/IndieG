
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faAward, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import type { Badge } from "../types";
import type { TranslateFn } from "@/shared/hooks/useTranslate";

interface BadgeSelectorModalProps {
    badges: Badge[];
    selectedBadgeId: string;
    onSelect: (id: string) => void;
    onClose: () => void;
    t: TranslateFn;
}

export const BadgeSelectorModal = ({ badges, selectedBadgeId, onSelect, onClose, t }: BadgeSelectorModalProps) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-surface border border-border rounded-[16px] p-6 max-w-2xl w-full flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center justify-between pb-1">
                <div>
                    <h4 className="text-lg font-black text-text flex items-center gap-2">
                        <FontAwesomeIcon icon={faAward} className="text-gold-400" />
                        <span>{t("profile.equippedBadgeTitle")}</span>
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">{t("profile.selectBadgeDesc")}</p>
                </div>
                <button onClick={onClose} className="text-text-muted hover:text-text cursor-pointer p-1" aria-label="Đóng">
                    <FontAwesomeIcon icon={faXmark} className="text-lg" />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto p-1">
                {badges.map((b) => {
                    const isSelected = b.id === selectedBadgeId;
                    return (
                        <div
                            key={b.id}
                            onClick={() => onSelect(b.id)}
                            className={`p-4 rounded-[12px] transition-all cursor-pointer flex items-start gap-3.5 relative ${
                                isSelected
                                    ? "bg-primary text-white shadow-lg scale-[1.02]"
                                    : "bg-surface-inner hover:bg-surface-hover text-text-muted border border-border/60"
                            }`}
                        >
                            <div className={`w-11 h-11 rounded-[8px] flex items-center justify-center text-lg shrink-0 ${b.color}`}>
                                <FontAwesomeIcon icon={b.icon} />
                            </div>
                            <div className="flex flex-col gap-1 min-w-0 pr-6">
                                <span className={`text-[11px] font-black uppercase tracking-wider ${isSelected ? "text-white/90" : "text-primary"}`}>{b.badgeText}</span>
                                <h5 className={`font-black text-sm ${isSelected ? "text-white" : "text-text"}`}>{b.title}</h5>
                                <p className={`text-xs leading-relaxed line-clamp-2 ${isSelected ? "text-white/80" : "text-text-muted"}`}>{b.desc}</p>
                            </div>
                            {isSelected && (
                                <span className="absolute top-3 right-3 text-white text-base" title="Đang trang bị">
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-text-faint">{t("profile.allBadgesUnlocked")}</span>
                <button onClick={onClose} className="px-5 py-2.5 rounded-[8px] bg-surface-inner hover:bg-surface-hover text-text font-bold text-xs transition-colors cursor-pointer border border-border/60">
                    {t("profile.close")}
                </button>
            </div>
        </div>
    </div>
);
