import { useTranslation } from "@/shared/hooks/useTranslate";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowUp,
    faArrowDown,
    faPenToSquare,
    faTrashCan,
    faPlus,
    faCheck,
    faXmark,
    faCircleCheck,
    faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

export interface CommunityRule {
    id: string;
    title: string;
    description: string;
}

interface CommunityManageRulesProps {
    communityName: string;
    isVi: boolean;
}

export const CommunityManageRules = ({
    communityName,
    isVi,
}: CommunityManageRulesProps) => {
    const { t } = useTranslation();
    const [rules, setRules] = useState<CommunityRule[]>([
        {
            id: "rule-1",
            title: t('hub.communitymanagerules_170'),
            description: t('hub.communitymanagerules_171'),
        },
        {
            id: "rule-2",
            title: t('hub.communitymanagerules_172'),
            description: t('hub.communitymanagerules_173'),
        },
        {
            id: "rule-3",
            title: t('hub.communitymanagerules_174'),
            description: t('hub.communitymanagerules_175'),
        },
        {
            id: "rule-4",
            title: t('hub.communitymanagerules_176'),
            description: t('hub.communitymanagerules_177'),
        },
        {
            id: "rule-5",
            title: t('hub.communitymanagerules_178'),
            description: t('hub.communitymanagerules_179'),
        },
    ]);

    // Inline edit state
    const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");

    // Inline add state
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Reorder Handlers
    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        setRules((prev) => {
            const copy = [...prev];
            const temp = copy[index - 1];
            copy[index - 1] = copy[index];
            copy[index] = temp;
            return copy;
        });
        showToast(t('hub.communitymanagerules_180'));
    };

    const handleMoveDown = (index: number) => {
        if (index === rules.length - 1) return;
        setRules((prev) => {
            const copy = [...prev];
            const temp = copy[index + 1];
            copy[index + 1] = copy[index];
            copy[index] = temp;
            return copy;
        });
        showToast(t('hub.communitymanagerules_181'));
    };

    // Edit Handlers
    const startEditing = (rule: CommunityRule) => {
        setEditingRuleId(rule.id);
        setEditTitle(rule.title);
        setEditDescription(rule.description);
        setIsAddingNew(false);
    };

    const saveEditing = (id: string) => {
        if (!editTitle.trim()) return;
        setRules((prev) =>
            prev.map((r) =>
                r.id === id
                    ? { ...r, title: editTitle.trim(), description: editDescription.trim() }
                    : r
            )
        );
        setEditingRuleId(null);
        showToast(t('hub.communitymanagerules_182'));
    };

    const cancelEditing = () => {
        setEditingRuleId(null);
    };

    // Delete Handler
    const handleDeleteRule = (id: string, title: string) => {
        if (!window.confirm(isVi ? `Xác nhận xóa quy tắc: "${title}"?` : `Delete rule: "${title}"?`)) {
            return;
        }
        setRules((prev) => prev.filter((r) => r.id !== id));
        showToast(t('hub.communitymanagerules_183'));
    };

    // Add Handler
    const handleAddRule = () => {
        if (!newTitle.trim()) return;
        const newRuleItem: CommunityRule = {
            id: `rule-${Date.now()}`,
            title: newTitle.trim(),
            description: newDescription.trim(),
        };
        setRules((prev) => [...prev, newRuleItem]);
        setNewTitle("");
        setNewDescription("");
        setIsAddingNew(false);
        showToast(t('hub.communitymanagerules_184'));
    };

    return (
        <div className="w-full flex flex-col gap-5 animate-fade-in text-text select-none">
            {/* Toast Feedback */}
            {toastMessage && (
                <div className="p-3 bg-primary/10 border border-primary/40 rounded-[6px] text-xs font-semibold text-primary flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCircleCheck} className="text-sm" />
                        <span>{toastMessage}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setToastMessage(null)}
                        className="text-text-muted hover:text-text cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-divider-primary/40">
                <div>
                    <h2 className="text-base sm:text-lg font-mono font-bold tracking-wider text-text uppercase">
                        COMMUNITY RULES
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">
                        {isVi
                            ? `Quy định tiêu chuẩn tham gia và hành vi thảo luận cho cộng đồng ${communityName}.`
                            : `Define participation standards and conduct rules for ${communityName}.`}
                    </p>
                </div>

                {!isAddingNew && (
                    <button
                        type="button"
                        onClick={() => {
                            setIsAddingNew(true);
                            setEditingRuleId(null);
                        }}
                        className="px-3 py-1.5 rounded-[4px] bg-primary hover:bg-primary/90 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-xs" />
                        <span>{t('hub.communitymanagerules_185')}</span>
                    </button>
                )}
            </div>

            {/* ORDERED RULES LIST (Inline Editing, Reorder Up/Down, Delete) */}
            <div className="flex flex-col gap-3">
                {rules.map((rule, idx) => {
                    const ruleNumber = String(idx + 1).padStart(2, "0");
                    const isEditing = editingRuleId === rule.id;

                    return (
                        <div
                            key={rule.id}
                            className={`p-4 rounded-[6px] border transition-all ${
                                isEditing
                                    ? "bg-surface border-primary/60 shadow-lg"
                                    : "bg-surface-inner/60 hover:bg-surface-inner/90 border-divider-primary/50"
                            }`}
                        >
                            {isEditing ? (
                                /* INLINE EDITING FORM */
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm font-bold text-primary">
                                            {ruleNumber}
                                        </span>
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            placeholder={t('hub.communitymanagerules_186')}
                                            className="flex-1 h-8 px-3 rounded-[4px] bg-surface-inner border border-divider-primary text-xs font-bold text-text focus:outline-none focus:border-primary"
                                        />
                                    </div>

                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        rows={2}
                                        placeholder={t('hub.communitymanagerules_187')}
                                        className="w-full p-2.5 rounded-[4px] bg-surface-inner border border-divider-primary text-xs text-text-muted focus:outline-none focus:border-primary resize-none"
                                    />

                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={cancelEditing}
                                            className="px-3 py-1.5 rounded-[4px] bg-surface-inner hover:bg-surface-hover text-xs font-semibold text-text-muted cursor-pointer"
                                        >
                                            {t('hub.communitymanagerules_188')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => saveEditing(rule.id)}
                                            className="px-3.5 py-1.5 rounded-[4px] bg-primary hover:bg-primary/90 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                            <span>{t('hub.communitymanagerules_189')}</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* NORMAL VIEW OF RULE ROW */
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3.5 min-w-0">
                                        <span className="font-mono text-base font-black text-primary/80 shrink-0 select-none">
                                            {ruleNumber}
                                        </span>
                                        <div className="flex flex-col min-w-0">
                                            <h4 className="text-xs sm:text-sm font-bold text-text">
                                                {rule.title}
                                            </h4>
                                            {rule.description && (
                                                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                                                    {rule.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions: Up, Down, Edit, Delete */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            disabled={idx === 0}
                                            onClick={() => handleMoveUp(idx)}
                                            title={t('hub.communitymanagerules_190')}
                                            className="w-7 h-7 rounded hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed text-text-faint hover:text-text flex items-center justify-center transition-colors cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faArrowUp} className="text-xs" />
                                        </button>

                                        <button
                                            type="button"
                                            disabled={idx === rules.length - 1}
                                            onClick={() => handleMoveDown(idx)}
                                            title={t('hub.communitymanagerules_191')}
                                            className="w-7 h-7 rounded hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed text-text-faint hover:text-text flex items-center justify-center transition-colors cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faArrowDown} className="text-xs" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => startEditing(rule)}
                                            title={t('hub.communitymanagerules_192')}
                                            className="w-7 h-7 rounded hover:bg-surface-hover text-text-faint hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteRule(rule.id, rule.title)}
                                            title={t('hub.communitymanagerules_193')}
                                            className="w-7 h-7 rounded hover:bg-rose-500/15 text-text-faint hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* INLINE ADD NEW RULE FORM */}
                {isAddingNew && (
                    <div className="p-4 rounded-[6px] border border-primary/50 bg-surface-inner flex flex-col gap-3 animate-fade-in shadow-md">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-primary">
                                {String(rules.length + 1).padStart(2, "0")}
                            </span>
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder={t('hub.communitymanagerules_194')}
                                className="flex-1 h-8 px-3 rounded-[4px] bg-surface border border-divider-primary text-xs font-bold text-text focus:outline-none focus:border-primary"
                                autoFocus
                            />
                        </div>

                        <textarea
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            rows={2}
                            placeholder={t('hub.communitymanagerules_195')}
                            className="w-full p-2.5 rounded-[4px] bg-surface border border-divider-primary text-xs text-text-muted focus:outline-none focus:border-primary resize-none"
                        />

                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsAddingNew(false)}
                                className="px-3 py-1.5 rounded-[4px] bg-surface hover:bg-surface-hover text-xs font-semibold text-text-muted cursor-pointer"
                            >
                                {t('hub.communitymanagerules_196')}
                            </button>
                            <button
                                type="button"
                                onClick={handleAddRule}
                                className="px-3.5 py-1.5 rounded-[4px] bg-primary hover:bg-primary/90 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                <span>{t('hub.communitymanagerules_197')}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Information Notice */}
            <div className="p-3 bg-surface-inner/30 border border-divider-primary/30 rounded-[6px] text-xs text-text-faint flex items-start gap-2.5">
                <FontAwesomeIcon icon={faCircleInfo} className="text-primary mt-0.5 text-xs shrink-0" />
                <p className="leading-relaxed">
                    {t('hub.communitymanagerules_198')}
                </p>
            </div>
        </div>
    );
};
