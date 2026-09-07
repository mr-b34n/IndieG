import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLock,
    faUnlock,
    faUserCheck,
    faTriangleExclamation,
    faTrashCan,
    faKey,
    faCheck,
    faXmark,
    faCircleCheck,
    faEyeSlash,
    faEye,
    faCrown,
} from "@fortawesome/free-solid-svg-icons";

interface CommunityManageSettingsProps {
    communityName: string;
    communityDescription?: string;
    communitySlug?: string;
    gameName?: string;
    isVi: boolean;
    onUpdateCommunityInfo?: (name: string, desc: string) => void;
}

export const CommunityManageSettings = ({
    communityName,
    communityDescription = "Cộng đồng những người chơi sinh tồn, thiết kế và phiêu lưu trên đại dương trong tựa game Raft. Cùng chia sẻ kinh nghiệm, bản vẽ và tìm đồng đội!",
    communitySlug = "raft",
    gameName = "Raft",
    isVi,
    onUpdateCommunityInfo,
}: CommunityManageSettingsProps) => {
    // 1. GENERAL SECTION STATE
    const [name, setName] = useState(communityName);
    const [description, setDescription] = useState(communityDescription);
    const [game, setGame] = useState(gameName);
    const [avatarUrl] = useState("https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&auto=format&fit=crop&q=80");
    const [coverUrl] = useState("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80");

    // 2. DISCOVERY SECTION STATE
    const [tags, setTags] = useState("survival, building, ocean, multiplayer, co-op");
    const [category, setCategory] = useState("Survival Sandbox");
    const [searchVisibility, setSearchVisibility] = useState<"visible" | "hidden">("visible");

    // 3. MEMBERSHIP & PRIVACY SECTION STATE (Prompt exact options & 1-sentence explanations)
    const [membershipPrivacy, setMembershipPrivacy] = useState<"open" | "approval" | "restricted">("approval");
    const [requirePlaytimeProof, setRequirePlaytimeProof] = useState(true);

    // 4. CONTENT SETTINGS STATE
    const [allowedPostTypes, setAllowedPostTypes] = useState({
        discussions: true,
        guides: true,
        media: true,
        events: true,
        polls: true,
    });
    const [maxMediaSizeMB, setMaxMediaSizeMB] = useState(25);
    const [allowVideoUploads, setAllowVideoUploads] = useState(true);
    const [autoEmbedLinks, setAutoEmbedLinks] = useState(true);

    // 5. MODERATION SETTINGS STATE
    const [minAccountAgeDays, setMinAccountAgeDays] = useState(3);
    const [autoFlagThreshold, setAutoFlagThreshold] = useState(3);
    const [allowModsPinPosts, setAllowModsPinPosts] = useState(true);

    // FEEDBACK
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleSaveGeneral = () => {
        if (onUpdateCommunityInfo) {
            onUpdateCommunityInfo(name, description);
        }
        showToast(isVi ? "Đã lưu cài đặt chung của cộng đồng." : "Saved general community settings.");
    };

    // 6. DANGER ZONE MODAL/STATE
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transferTargetUser, setTransferTargetUser] = useState("Minh Quân (@shark_hunter99)");
    const [transferPassword, setTransferPassword] = useState("");

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmName, setDeleteConfirmName] = useState("");
    const [deletePassword, setDeletePassword] = useState("");

    const handleConfirmTransfer = () => {
        if (!transferPassword.trim()) {
            alert(isVi ? "Vui lòng nhập mật khẩu để xác thực lại danh tính." : "Please enter your password to re-authenticate.");
            return;
        }
        setIsTransferModalOpen(false);
        setTransferPassword("");
        showToast(isVi ? `Đã chuyển giao quyền Trưởng cộng đồng cho ${transferTargetUser}.` : `Ownership transferred to ${transferTargetUser}.`);
    };

    const handleConfirmDelete = () => {
        if (deleteConfirmName.trim().toLowerCase() !== communityName.trim().toLowerCase()) {
            alert(isVi ? `Tên cộng đồng nhập không khớp với "${communityName}".` : `Community name does not match "${communityName}".`);
            return;
        }
        if (!deletePassword.trim()) {
            alert(isVi ? "Vui lòng nhập mật khẩu xác thực." : "Please enter your password to confirm deletion.");
            return;
        }
        setIsDeleteModalOpen(false);
        setDeleteConfirmName("");
        setDeletePassword("");
        showToast(isVi ? "Cộng đồng đã được đánh dấu xóa vĩnh viễn." : "Community scheduled for permanent deletion.");
    };

    return (
        <div className="w-full flex flex-col gap-6 animate-fade-in text-text select-none pb-12">
            {/* Toast Feedback */}
            {toastMessage && (
                <div className="p-3 bg-primary/10 border border-primary/40 rounded-[6px] text-xs font-semibold text-primary flex items-center justify-between shadow-sm sticky top-0 z-40">
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
                        COMMUNITY SETTINGS
                    </h2>
                    <p className="text-xs text-text-muted mt-0.5">
                        {isVi
                            ? `Cấu hình thông tin, phạm vi tìm kiếm, quyền thành viên và kiểm duyệt cho ${communityName}.`
                            : `Configure identity, discovery, membership permissions, and moderation for ${communityName}.`}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleSaveGeneral}
                    className="px-4 py-1.5 rounded-[4px] bg-primary hover:bg-primary/90 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
                >
                    <FontAwesomeIcon icon={faCheck} className="text-xs" />
                    <span>{isVi ? "Lưu tất cả thay đổi" : "Save All Changes"}</span>
                </button>
            </div>

            {/* SECTION 1: GENERAL */}
            <div className="p-4 rounded-[6px] bg-surface-inner/50 border border-divider-primary/50 flex flex-col gap-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>GENERAL</span>
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Community Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-text-muted">
                            {isVi ? "Tên cộng đồng" : "Community name"}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-8 px-3 rounded-[4px] bg-surface border border-divider-primary text-xs text-text focus:outline-none focus:border-primary"
                        />
                    </div>

                    {/* Game Association */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-text-muted">
                            {isVi ? "Tựa game liên kết" : "Associated Game"}
                        </label>
                        <input
                            type="text"
                            value={game}
                            onChange={(e) => setGame(e.target.value)}
                            className="h-8 px-3 rounded-[4px] bg-surface border border-divider-primary text-xs text-text focus:outline-none focus:border-primary"
                        />
                    </div>

                    {/* Community URL Slug */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-text-muted">
                            {isVi ? "Đường dẫn cộng đồng (URL Slug)" : "Community URL"}
                        </label>
                        <div className="h-8 px-3 rounded-[4px] bg-surface border border-divider-primary/60 text-xs font-mono text-text-muted flex items-center select-all">
                            <span className="text-text-faint">app.gg/community/</span>
                            <span className="text-text font-semibold">{communitySlug}</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-muted">
                        {isVi ? "Mô tả giới thiệu" : "Description"}
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        className="p-2.5 rounded-[4px] bg-surface border border-divider-primary text-xs text-text focus:outline-none focus:border-primary resize-none leading-relaxed"
                    />
                </div>

                {/* Logo & Cover preview rows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="flex items-center gap-3 p-2.5 rounded bg-surface border border-divider-primary/40">
                        <img
                            src={avatarUrl}
                            alt="Logo preview"
                            className="w-10 h-10 rounded-[4px] object-cover bg-surface-inner shrink-0"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-bold text-text truncate">Logo / Avatar</span>
                            <span className="text-[10px] font-mono text-text-faint truncate">Square 1:1, max 2MB</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => showToast(isVi ? "Chọn file ảnh mới..." : "Select new image...")}
                            className="px-2.5 py-1 rounded bg-surface-hover border border-divider-primary text-[11px] font-semibold text-text-muted hover:text-text cursor-pointer"
                        >
                            {isVi ? "Thay đổi" : "Change"}
                        </button>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 rounded bg-surface border border-divider-primary/40">
                        <img
                            src={coverUrl}
                            alt="Cover preview"
                            className="w-16 h-10 rounded-[4px] object-cover bg-surface-inner shrink-0"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-bold text-text truncate">Cover Banner</span>
                            <span className="text-[10px] font-mono text-text-faint truncate">16:9 or 3:1 ratio</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => showToast(isVi ? "Chọn file ảnh mới..." : "Select new image...")}
                            className="px-2.5 py-1 rounded bg-surface-hover border border-divider-primary text-[11px] font-semibold text-text-muted hover:text-text cursor-pointer"
                        >
                            {isVi ? "Thay đổi" : "Change"}
                        </button>
                    </div>
                </div>
            </div>

            {/* SECTION 2: DISCOVERY */}
            <div className="p-4 rounded-[6px] bg-surface-inner/50 border border-divider-primary/50 flex flex-col gap-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>DISCOVERY</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-text-muted">
                            {isVi ? "Thẻ từ khóa (Tags)" : "Tags (comma separated)"}
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="h-8 px-3 rounded-[4px] bg-surface border border-divider-primary text-xs text-text focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-text-muted">
                            {isVi ? "Danh mục (Category)" : "Category"}
                        </label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="h-8 px-3 rounded-[4px] bg-surface border border-divider-primary text-xs text-text focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-surface border border-divider-primary/40 mt-1">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-text">
                            {isVi ? "Khả năng tìm kiếm trên nền tảng" : "Search Visibility"}
                        </span>
                        <span className="text-[11px] text-text-muted">
                            {isVi
                                ? "Cho phép cộng đồng xuất hiện trong kết quả tìm kiếm và danh mục khám phá"
                                : "Allow this community to appear in platform search results and directory"}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setSearchVisibility(searchVisibility === "visible" ? "hidden" : "visible")
                        }
                        className={`px-3 py-1 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                            searchVisibility === "visible"
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : "bg-surface-hover text-text-faint border border-divider-primary"
                        }`}
                    >
                        <FontAwesomeIcon icon={searchVisibility === "visible" ? faEye : faEyeSlash} className="text-[11px]" />
                        <span>{searchVisibility === "visible" ? (isVi ? "Công khai" : "Visible") : (isVi ? "Ẩn tìm kiếm" : "Hidden")}</span>
                    </button>
                </div>
            </div>

            {/* SECTION 3: MEMBERSHIP & PRIVACY (Prompt exact requirements) */}
            <div className="p-4 rounded-[6px] bg-surface-inner/50 border border-divider-primary/50 flex flex-col gap-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>MEMBERSHIP & PRIVACY</span>
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    {/* OPEN */}
                    <div
                        onClick={() => setMembershipPrivacy("open")}
                        className={`p-3.5 rounded-[6px] border transition-all cursor-pointer flex flex-col gap-1.5 ${
                            membershipPrivacy === "open"
                                ? "bg-primary/10 border-primary shadow-sm"
                                : "bg-surface border-divider-primary/50 hover:bg-surface-hover/50"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faUnlock} className="text-xs text-emerald-400" />
                                <span>OPEN</span>
                            </span>
                            {membershipPrivacy === "open" && (
                                <FontAwesomeIcon icon={faCheck} className="text-primary text-xs" />
                            )}
                        </div>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            {isVi ? "Bất kỳ người chơi nào cũng có thể tự do tham gia ngay lập tức." : "Anyone can join."}
                        </p>
                    </div>

                    {/* APPROVAL REQUIRED */}
                    <div
                        onClick={() => setMembershipPrivacy("approval")}
                        className={`p-3.5 rounded-[6px] border transition-all cursor-pointer flex flex-col gap-1.5 ${
                            membershipPrivacy === "approval"
                                ? "bg-primary/10 border-primary shadow-sm"
                                : "bg-surface border-divider-primary/50 hover:bg-surface-hover/50"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faUserCheck} className="text-xs text-amber-400" />
                                <span>APPROVAL REQUIRED</span>
                            </span>
                            {membershipPrivacy === "approval" && (
                                <FontAwesomeIcon icon={faCheck} className="text-primary text-xs" />
                            )}
                        </div>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            {isVi ? "Người dùng gửi yêu cầu và cần được Điều hành viên hoặc Trưởng nhóm phê duyệt." : "Users request access and moderators/admin approve."}
                        </p>
                    </div>

                    {/* RESTRICTED */}
                    <div
                        onClick={() => setMembershipPrivacy("restricted")}
                        className={`p-3.5 rounded-[6px] border transition-all cursor-pointer flex flex-col gap-1.5 ${
                            membershipPrivacy === "restricted"
                                ? "bg-primary/10 border-primary shadow-sm"
                                : "bg-surface border-divider-primary/50 hover:bg-surface-hover/50"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faLock} className="text-xs text-rose-400" />
                                <span>RESTRICTED</span>
                            </span>
                            {membershipPrivacy === "restricted" && (
                                <FontAwesomeIcon icon={faCheck} className="text-primary text-xs" />
                            )}
                        </div>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            {isVi ? "Chỉ những người dùng được mời trực tiếp mới có thể gia nhập." : "Only invited users can join."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-surface border border-divider-primary/40 mt-1">
                    <span className="text-xs text-text-muted">
                        {isVi ? "Yêu cầu ghi chú số giờ chơi khi nộp đơn gia nhập" : "Require playtime note on join request"}
                    </span>
                    <input
                        type="checkbox"
                        checked={requirePlaytimeProof}
                        onChange={(e) => setRequirePlaytimeProof(e.target.checked)}
                        className="w-4 h-4 accent-primary cursor-pointer"
                    />
                </div>
            </div>

            {/* SECTION 4: CONTENT */}
            <div className="p-4 rounded-[6px] bg-surface-inner/50 border border-divider-primary/50 flex flex-col gap-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>CONTENT</span>
                </span>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-text-muted">
                        {isVi ? "Định dạng bài viết cho phép" : "Allowed post types"}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {Object.entries(allowedPostTypes).map(([typeKey, isAllowed]) => (
                            <label
                                key={typeKey}
                                className="flex items-center gap-2 p-2 rounded bg-surface border border-divider-primary/40 text-xs text-text cursor-pointer hover:bg-surface-hover capitalize"
                            >
                                <input
                                    type="checkbox"
                                    checked={isAllowed}
                                    onChange={(e) =>
                                        setAllowedPostTypes((prev) => ({
                                            ...prev,
                                            [typeKey]: e.target.checked,
                                        }))
                                    }
                                    className="accent-primary"
                                />
                                <span>{typeKey}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="flex items-center justify-between p-2.5 rounded bg-surface border border-divider-primary/40">
                        <span className="text-xs text-text-muted">
                            {isVi ? "Cho phép upload video trực tiếp" : "Allow video uploads"}
                        </span>
                        <input
                            type="checkbox"
                            checked={allowVideoUploads}
                            onChange={(e) => setAllowVideoUploads(e.target.checked)}
                            className="w-4 h-4 accent-primary cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded bg-surface border border-divider-primary/40">
                        <span className="text-xs text-text-muted">
                            {isVi ? "Giới hạn dung lượng file" : "Max upload size"}
                        </span>
                        <select
                            value={maxMediaSizeMB}
                            onChange={(e) => setMaxMediaSizeMB(Number(e.target.value))}
                            className="h-7 px-2 rounded bg-surface-inner border border-divider-primary text-xs font-mono text-text focus:outline-none"
                        >
                            <option value={10}>10 MB</option>
                            <option value={25}>25 MB</option>
                            <option value={50}>50 MB</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded bg-surface border border-divider-primary/40">
                        <span className="text-xs text-text-muted">
                            {isVi ? "Tự động xem trước link" : "Auto-embed link"}
                        </span>
                        <input
                            type="checkbox"
                            checked={autoEmbedLinks}
                            onChange={(e) => setAutoEmbedLinks(e.target.checked)}
                            className="w-4 h-4 accent-primary cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* SECTION 5: MODERATION */}
            <div className="p-4 rounded-[6px] bg-surface-inner/50 border border-divider-primary/50 flex flex-col gap-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>MODERATION</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5 p-2.5 rounded bg-surface border border-divider-primary/40">
                        <span className="text-xs font-semibold text-text">
                            {isVi ? "Tuổi tài khoản tối thiểu" : "Minimum account age"}
                        </span>
                        <span className="text-[11px] text-text-muted">
                            {isVi ? "Ngăn chặn clone bot spam" : "Prevent new spam accounts"}
                        </span>
                        <select
                            value={minAccountAgeDays}
                            onChange={(e) => setMinAccountAgeDays(Number(e.target.value))}
                            className="h-7 px-2 rounded bg-surface-inner border border-divider-primary text-xs font-mono text-text focus:outline-none mt-1"
                        >
                            <option value={0}>{isVi ? "Không giới hạn" : "No restriction"}</option>
                            <option value={1}>{isVi ? "1 ngày" : "1 day"}</option>
                            <option value={3}>{isVi ? "3 ngày (Khuyên dùng)" : "3 days (Recommended)"}</option>
                            <option value={7}>{isVi ? "7 ngày" : "7 days"}</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5 p-2.5 rounded bg-surface border border-divider-primary/40">
                        <span className="text-xs font-semibold text-text">
                            {isVi ? "Tự động ẩn sau số báo cáo" : "Auto-flag report threshold"}
                        </span>
                        <span className="text-[11px] text-text-muted">
                            {isVi ? "Tự động tạm ẩn bài vi phạm" : "Hide content pending review"}
                        </span>
                        <select
                            value={autoFlagThreshold}
                            onChange={(e) => setAutoFlagThreshold(Number(e.target.value))}
                            className="h-7 px-2 rounded bg-surface-inner border border-divider-primary text-xs font-mono text-text focus:outline-none mt-1"
                        >
                            <option value={2}>2 {isVi ? "báo cáo" : "reports"}</option>
                            <option value={3}>3 {isVi ? "báo cáo" : "reports"}</option>
                            <option value={5}>5 {isVi ? "báo cáo" : "reports"}</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5 p-2.5 rounded bg-surface border border-divider-primary/40 justify-between">
                        <div>
                            <span className="text-xs font-semibold text-text block">
                                {isVi ? "Quyền ghim bài của Điều hành viên" : "Allow mods to pin posts"}
                            </span>
                            <span className="text-[11px] text-text-muted">
                                {isVi ? "Cho phép ghim bài thông báo" : "Can pin community announcements"}
                            </span>
                        </div>
                        <input
                            type="checkbox"
                            checked={allowModsPinPosts}
                            onChange={(e) => setAllowModsPinPosts(e.target.checked)}
                            className="w-4 h-4 accent-primary cursor-pointer self-start mt-2"
                        />
                    </div>
                </div>
            </div>

            {/* SECTION 6: DANGER ZONE (Carefully separated at the bottom) */}
            <div className="p-4 rounded-[6px] bg-rose-950/20 border border-rose-500/30 flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-2 text-rose-400">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-sm" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                        DANGER ZONE
                    </span>
                </div>

                <div className="divide-y divide-rose-500/20">
                    {/* Transfer Ownership */}
                    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-col max-w-xl">
                            <span className="text-xs font-bold text-text">
                                {isVi ? "Chuyển giao quyền sở hữu cộng đồng" : "Transfer community ownership"}
                            </span>
                            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                                {isVi
                                    ? "Chuyển giao toàn bộ quyền quản trị cao nhất của cộng đồng này cho một thành viên khác. Bạn sẽ trở thành Điều hành viên thông thường."
                                    : "Ownership transfer gives another member full administrative control of this community."}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsTransferModalOpen(true)}
                            className="px-3 py-1.5 rounded-[4px] bg-surface hover:bg-amber-500/15 border border-amber-500/40 text-xs font-bold text-amber-400 transition-colors cursor-pointer shrink-0 self-start sm:self-center"
                        >
                            {isVi ? "Chuyển quyền sở hữu..." : "Transfer Ownership..."}
                        </button>
                    </div>

                    {/* Delete Community */}
                    <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-col max-w-xl">
                            <span className="text-xs font-bold text-rose-400">
                                {isVi ? "Xóa vĩnh viễn cộng đồng này" : "Delete this community"}
                            </span>
                            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                                {isVi
                                    ? "Thao tác này sẽ xóa toàn bộ bài viết, thảo luận, danh sách thành viên và tệp đa phương tiện của cộng đồng này. Không thể khôi phục."
                                    : "Permanently delete this community, all posts, guides, and member associations. This action cannot be undone."}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="px-3 py-1.5 rounded-[4px] bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition-colors cursor-pointer shrink-0 self-start sm:self-center shadow-sm"
                        >
                            <FontAwesomeIcon icon={faTrashCan} className="text-xs mr-1.5" />
                            <span>{isVi ? "Xóa cộng đồng..." : "Delete Community..."}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL 1: TRANSFER OWNERSHIP */}
            {isTransferModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-xs">
                    <div className="w-full max-w-md bg-surface border border-amber-500/40 rounded-[8px] p-5 shadow-2xl flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-amber-400">
                                <FontAwesomeIcon icon={faCrown} />
                                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                                    {isVi ? "XÁC NHẬN CHUYỂN QUYỀN SỞ HỮU" : "TRANSFER OWNERSHIP"}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsTransferModalOpen(false)}
                                className="text-text-muted hover:text-text cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        <p className="text-xs text-text-muted leading-relaxed">
                            {isVi
                                ? "Hành động này sẽ chuyển quyền Trưởng cộng đồng cao nhất cho thành viên được chỉ định. Bạn sẽ không thể tự hoàn tác nếu không có sự đồng ý của họ."
                                : "Ownership transfer gives another member full administrative control of this community."}
                        </p>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-text">
                                {isVi ? "Chọn thành viên nhận quyền sở hữu" : "Select member"}
                            </label>
                            <select
                                value={transferTargetUser}
                                onChange={(e) => setTransferTargetUser(e.target.value)}
                                className="h-8 px-2.5 rounded-[4px] bg-surface-inner border border-divider-primary text-xs text-text focus:outline-none"
                            >
                                <option value="Moderator 1">Moderator 1</option>
                                <option value="Moderator 2">Moderator 2</option>
                                <option value="Member 1">Member 1</option>
                            </select>
                        </div>

                        {/* Re-authentication required as specified */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-text flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faKey} className="text-amber-400 text-xs" />
                                <span>{isVi ? "Xác thực mật khẩu của bạn" : "Re-authenticate (Enter your password)"}</span>
                            </label>
                            <input
                                type="password"
                                value={transferPassword}
                                onChange={(e) => setTransferPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-8 px-3 rounded-[4px] bg-surface-inner border border-divider-primary text-xs text-text focus:outline-none focus:border-amber-400"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-divider-primary/40">
                            <button
                                type="button"
                                onClick={() => setIsTransferModalOpen(false)}
                                className="px-3 py-1.5 rounded-[4px] bg-surface-inner hover:bg-surface-hover text-xs font-semibold text-text-muted cursor-pointer"
                            >
                                {isVi ? "Hủy" : "Cancel"}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmTransfer}
                                className="px-4 py-1.5 rounded-[4px] bg-amber-500 hover:bg-amber-600 text-xs font-bold text-black transition-colors cursor-pointer"
                            >
                                {isVi ? "Xác nhận chuyển giao" : "Confirm Transfer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: DELETE COMMUNITY */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-xs">
                    <div className="w-full max-w-md bg-surface border border-rose-500/50 rounded-[8px] p-5 shadow-2xl flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-rose-400">
                                <FontAwesomeIcon icon={faTrashCan} />
                                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                                    {isVi ? "XÓA VĨNH VIỄN CỘNG ĐỒNG" : "DELETE COMMUNITY"}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="text-text-muted hover:text-text cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-xs text-rose-300 leading-relaxed">
                            {isVi
                                ? `CẢNH BÁO: Thao tác này sẽ xóa toàn bộ nội dung của "${communityName}". Tất cả 1,284 thành viên sẽ bị giải tán khỏi cộng đồng này.`
                                : `WARNING: This will permanently erase "${communityName}". All 1,284 members will be disbanded.`}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs text-text-muted">
                                {isVi
                                    ? `Để xác nhận, vui lòng nhập chính xác tên cộng đồng: "${communityName}"`
                                    : `To confirm, please type the community name: "${communityName}"`}
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmName}
                                onChange={(e) => setDeleteConfirmName(e.target.value)}
                                placeholder={communityName}
                                className="h-8 px-3 rounded-[4px] bg-surface-inner border border-divider-primary text-xs text-text focus:outline-none focus:border-rose-400"
                            />
                        </div>

                        {/* Re-authentication password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-text flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faKey} className="text-rose-400 text-xs" />
                                <span>{isVi ? "Xác thực mật khẩu tài khoản của bạn" : "Re-authenticate password"}</span>
                            </label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-8 px-3 rounded-[4px] bg-surface-inner border border-divider-primary text-xs text-text focus:outline-none focus:border-rose-400"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-divider-primary/40">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-3 py-1.5 rounded-[4px] bg-surface-inner hover:bg-surface-hover text-xs font-semibold text-text-muted cursor-pointer"
                            >
                                {isVi ? "Hủy" : "Cancel"}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="px-4 py-1.5 rounded-[4px] bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition-colors cursor-pointer"
                            >
                                {isVi ? "Xác nhận xóa vĩnh viễn" : "Delete Community"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
