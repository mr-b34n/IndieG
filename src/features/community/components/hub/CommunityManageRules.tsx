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
    const [rules, setRules] = useState<CommunityRule[]>([
        {
            id: "rule-1",
            title: isVi ? "Tôn trọng và lịch sự với mọi người chơi" : "Respect other players",
            description: isVi
                ? "Không xúc phạm, phân biệt đối xử, quấy rối hay công kích cá nhân. Giữ môi trường trao đổi văn minh."
                : "No harassment, hate speech, or toxic personal attacks. Maintain a constructive gaming atmosphere.",
        },
        {
            id: "rule-2",
            title: isVi ? "Không spam hoặc quảng cáo ngoài luồng" : "No spam or self-promotion",
            description: isVi
                ? "Nghiêm cấm chia sẻ liên kết lừa đảo, phần mềm độc hại, bán tài khoản hoặc kéo mem sang nhóm khác."
                : "Refrain from unsolicited self-promotion, advertising third-party stores, or spamming identical content.",
        },
        {
            id: "rule-3",
            title: isVi ? "Gắn thẻ Spoiler khi bàn luận cốt truyện" : "Use spoiler tags for story content",
            description: isVi
                ? "Các bí mật cốt truyện, kết thúc hoặc nội dung khám phá hòn đảo đặc biệt bắt buộc phải dùng công cụ che chữ/spoiler."
                : "All major plot points, hidden island lore, and endgame reveals must be wrapped in spoiler markdown.",
        },
        {
            id: "rule-4",
            title: isVi ? "Không chia sẻ cheat, bản mod phá hoại hoặc hack" : "No game exploits or malicious mods",
            description: isVi
                ? "Không phổ biến bản hack làm hỏng trải nghiệm người chơi khác hoặc liên kết chứa virus."
                : "Exploits and unauthorized cracked executables are forbidden. Creative sandbox mods are welcomed.",
        },
        {
            id: "rule-5",
            title: isVi ? "Đăng đúng chuyên mục và chủ đề thảo luận" : "Stay on-topic and use appropriate flairs",
            description: isVi
                ? "Phân loại bài viết chính xác (Thảo luận, Hướng dẫn, Bè đẹp, Tuyển team) để các thành viên dễ tìm kiếm."
                : "Assign appropriate category tags (Discussions, Guides, Showcase, Squad) so content remains organized.",
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
        showToast(isVi ? "Đã thay đổi thứ tự quy tắc." : "Rule order updated.");
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
        showToast(isVi ? "Đã thay đổi thứ tự quy tắc." : "Rule order updated.");
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
        showToast(isVi ? "Đã lưu cập nhật quy tắc." : "Rule updated successfully.");
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
        showToast(isVi ? "Đã xóa quy tắc." : "Rule deleted.");
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
        showToast(isVi ? "Đã thêm quy tắc mới!" : "New rule added successfully!");
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
                        <span>{isVi ? "+ Thêm quy tắc" : "+ Add Rule"}</span>
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
                                            placeholder={isVi ? "Tiêu đề quy tắc..." : "Rule title..."}
                                            className="flex-1 h-8 px-3 rounded-[4px] bg-surface-inner border border-divider-primary text-xs font-bold text-text focus:outline-none focus:border-primary"
                                        />
                                    </div>

                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        rows={2}
                                        placeholder={isVi ? "Mô tả chi tiết và hướng dẫn vi phạm..." : "Detailed explanation..."}
                                        className="w-full p-2.5 rounded-[4px] bg-surface-inner border border-divider-primary text-xs text-text-muted focus:outline-none focus:border-primary resize-none"
                                    />

                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={cancelEditing}
                                            className="px-3 py-1.5 rounded-[4px] bg-surface-inner hover:bg-surface-hover text-xs font-semibold text-text-muted cursor-pointer"
                                        >
                                            {isVi ? "Hủy" : "Cancel"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => saveEditing(rule.id)}
                                            className="px-3.5 py-1.5 rounded-[4px] bg-primary hover:bg-primary/90 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                            <span>{isVi ? "Lưu thay đổi" : "Save Changes"}</span>
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
                                            title={isVi ? "Di chuyển lên" : "Move up"}
                                            className="w-7 h-7 rounded hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed text-text-faint hover:text-text flex items-center justify-center transition-colors cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faArrowUp} className="text-xs" />
                                        </button>

                                        <button
                                            type="button"
                                            disabled={idx === rules.length - 1}
                                            onClick={() => handleMoveDown(idx)}
                                            title={isVi ? "Di chuyển xuống" : "Move down"}
                                            className="w-7 h-7 rounded hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed text-text-faint hover:text-text flex items-center justify-center transition-colors cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faArrowDown} className="text-xs" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => startEditing(rule)}
                                            title={isVi ? "Chỉnh sửa quy tắc" : "Edit rule"}
                                            className="w-7 h-7 rounded hover:bg-surface-hover text-text-faint hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteRule(rule.id, rule.title)}
                                            title={isVi ? "Xóa quy tắc" : "Delete rule"}
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
                                placeholder={isVi ? "Nhập tiêu đề quy tắc mới..." : "Enter new rule title..."}
                                className="flex-1 h-8 px-3 rounded-[4px] bg-surface border border-divider-primary text-xs font-bold text-text focus:outline-none focus:border-primary"
                                autoFocus
                            />
                        </div>

                        <textarea
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            rows={2}
                            placeholder={isVi ? "Mô tả chi tiết và căn cứ xử lý vi phạm..." : "Enter description and guidance..."}
                            className="w-full p-2.5 rounded-[4px] bg-surface border border-divider-primary text-xs text-text-muted focus:outline-none focus:border-primary resize-none"
                        />

                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsAddingNew(false)}
                                className="px-3 py-1.5 rounded-[4px] bg-surface hover:bg-surface-hover text-xs font-semibold text-text-muted cursor-pointer"
                            >
                                {isVi ? "Hủy" : "Cancel"}
                            </button>
                            <button
                                type="button"
                                onClick={handleAddRule}
                                className="px-3.5 py-1.5 rounded-[4px] bg-primary hover:bg-primary/90 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                <span>{isVi ? "Thêm quy tắc này" : "Save Rule"}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Information Notice */}
            <div className="p-3 bg-surface-inner/30 border border-divider-primary/30 rounded-[6px] text-xs text-text-faint flex items-start gap-2.5">
                <FontAwesomeIcon icon={faCircleInfo} className="text-primary mt-0.5 text-xs shrink-0" />
                <p className="leading-relaxed">
                    {isVi
                        ? "Quy tắc cộng đồng được hiển thị cho tất cả người chơi trước khi đăng bài và là cơ sở để Điều hành viên xử lý các báo cáo vi phạm."
                        : "Community rules are displayed to players before posting and serve as the standard criteria for moderator actions."}
                </p>
            </div>
        </div>
    );
};
