import { useTranslation } from "@/shared/hooks/useTranslate";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
    useCommunityMembersQuery,
    useDeleteCommunityMutation,
    useTransferCommunityOwnershipMutation,
    useUpdateCommunityMutation,
} from "@/shared/api/useQueries";
import { extractMemberList } from "@/shared/api";
import { uploadImageToR2 } from "@/shared/services/upload-service";
import { ImageCropperModal } from "@/shared/components/ui/ImageCropperModal";
import { DEFAULT_BG, DEFAULT_GAME_LOGO } from "@/shared/constants/images";
import { AppIcon as FontAwesomeIcon } from "@/shared/components/ui/Icon";
import {
    Lock as faLock,
    LockOpen as faUnlock,
    UserCheck as faUserCheck,
    Warning as faTriangleExclamation,
    Trash as faTrashCan,
    Check as faCheck,
    X as faXmark,
    CheckCircle as faCircleCheck,
    Crown as faCrown,
    Camera as faCamera,
} from "@phosphor-icons/react";

type BackendCommunityPrivacy = "public" | "private" | "invite_only";

interface CommunityManageSettingsProps {
    communityId?: string;
    communityName: string;
    communityDescription?: string;
    communitySlug?: string;
    communityTags?: string[];
    communityPrivacy?: string;
    communityLogo?: string;
    communityBackdrop?: string;
    membersCount?: number;
    gameName?: string;
    isVi: boolean;
    userRole?: string;
    onNavigateRules?: () => void;
}

function normalizePrivacy(raw?: string): BackendCommunityPrivacy {
    const val = (raw || "").toLowerCase();
    if (val === "private" || val === "approval") return "private";
    if (val === "invite_only" || val === "restricted") return "invite_only";
    return "public";
}

export const CommunityManageSettings = ({
    communityId,
    communityName,
    communityDescription = "",
    communitySlug = "",
    communityTags = [],
    communityPrivacy = "public",
    communityLogo = "",
    communityBackdrop = "",
    membersCount = 0,
    gameName = "",
    isVi,
    onNavigateRules,
}: CommunityManageSettingsProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const updateCommunityMutation = useUpdateCommunityMutation();
    const deleteCommunityMutation = useDeleteCommunityMutation();
    const transferOwnershipMutation = useTransferCommunityOwnershipMutation();

    // 1. REAL PERSISTED SETTINGS STATE
    const [name, setName] = useState(communityName);
    const [description, setDescription] = useState(communityDescription);
    const [tagsInput, setTagsInput] = useState(communityTags.join(", "));
    const [privacy, setPrivacy] = useState<BackendCommunityPrivacy>(
        normalizePrivacy(communityPrivacy)
    );
    const [logoPreview, setLogoPreview] = useState(communityLogo);
    const [backdropPreview, setBackdropPreview] = useState(communityBackdrop);
    const [cropTarget, setCropTarget] = useState<{
        kind: "logo" | "backdrop";
        rawSrc: string;
    } | null>(null);
    const [isUploadingMedia, setIsUploadingMedia] = useState<"logo" | "backdrop" | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleSelectMediaFile = (kind: "logo" | "backdrop", file?: File | null) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setCropTarget({ kind, rawSrc: reader.result });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSaveCroppedMedia = async (croppedDataUrl: string) => {
        if (!cropTarget || !communityId) return;
        const kind = cropTarget.kind;
        setCropTarget(null);
        setIsUploadingMedia(kind);
        try {
            const res = await fetch(croppedDataUrl);
            const blob = await res.blob();
            const file = new File([blob], `${kind}.webp`, { type: blob.type || "image/webp" });
            const uploaded = await uploadImageToR2({
                file,
                type: kind === "logo" ? "community-logo" : "community-cover",
                postId: communityId,
            });
            const uploadedUrl = uploaded.imageUrl || uploaded.url;
            if (!uploadedUrl) throw new Error("Upload did not return a public URL");

            await updateCommunityMutation.mutateAsync({
                id: communityId,
                data: kind === "logo" ? { logo: uploadedUrl } : { backdrop: uploadedUrl },
            });
            if (kind === "logo") {
                setLogoPreview(uploadedUrl);
            } else {
                setBackdropPreview(uploadedUrl);
            }
            showToast(
                kind === "logo"
                    ? (isVi ? "Đã cập nhật logo cộng đồng!" : "Community logo updated!")
                    : (isVi ? "Đã cập nhật ảnh bìa cộng đồng!" : "Community cover updated!")
            );
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : (isVi ? "Tải ảnh lên thất bại." : "Failed to upload image.");
            showToast(msg, true);
        } finally {
            setIsUploadingMedia(null);
        }
    };

    // Real eligible members for ownership transfer
    const { data: membersData } = useCommunityMembersQuery(communityId || "");
    const transferCandidates = useMemo(() => {
        const items = extractMemberList(membersData);
        return items
            .filter((m) => m.role !== "owner" && m.status !== "banned" && m.status !== "pending")
            .map((m) => ({
                id: m.userId,
                label: m.user?.name || m.user?.displayName || m.user?.username || `Member (${m.userId.slice(0, 6)})`,
                handle: m.user?.username ? `@${m.user.username}` : "",
                role: m.role || "member",
            }));
    }, [membersData]);

    // Feedback banner
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastIsError, setToastIsError] = useState(false);
    const showToast = (msg: string, isError = false) => {
        setToastIsError(isError);
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleSaveGeneral = async () => {
        if (!communityId) return;
        const trimmedName = name.trim();
        if (!trimmedName) {
            showToast(isVi ? "Tên cộng đồng không được để trống." : "Community name cannot be empty.", true);
            return;
        }
        const parsedTags = tagsInput
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);

        try {
            await updateCommunityMutation.mutateAsync({
                id: communityId,
                data: {
                    name: trimmedName,
                    description: description.trim(),
                    tags: parsedTags,
                    privacy,
                },
            });
            showToast(t("hub.communitymanagesettings_199"));
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : (isVi ? "Không thể lưu cài đặt cộng đồng." : "Failed to save community settings.");
            showToast(msg, true);
        }
    };

    // DANGER ZONE STATE
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [transferTargetId, setTransferTargetId] = useState("");
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmName, setDeleteConfirmName] = useState("");

    const handleConfirmTransfer = async () => {
        if (!communityId || !transferTargetId) {
            showToast(isVi ? "Vui lòng chọn thành viên nhận quyền sở hữu." : "Please select a member to transfer ownership to.", true);
            return;
        }
        const target = transferCandidates.find((c) => c.id === transferTargetId);
        try {
            await transferOwnershipMutation.mutateAsync({
                communityId,
                newOwnerId: transferTargetId,
            });
            setIsTransferModalOpen(false);
            setTransferTargetId("");
            showToast(
                isVi
                    ? `Đã chuyển giao quyền Trưởng cộng đồng cho ${target?.label || "thành viên"}.`
                    : `Ownership transferred to ${target?.label || "member"}.`
            );
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : (isVi ? "Chuyển quyền sở hữu thất bại." : "Failed to transfer ownership.");
            showToast(msg, true);
        }
    };

    const handleConfirmDelete = async () => {
        if (deleteConfirmName.trim().toLowerCase() !== communityName.trim().toLowerCase()) {
            showToast(
                isVi
                    ? `Tên cộng đồng nhập không khớp với "${communityName}".`
                    : `Community name does not match "${communityName}".`,
                true
            );
            return;
        }
        if (!communityId) return;
        try {
            await deleteCommunityMutation.mutateAsync(communityId);
            setIsDeleteModalOpen(false);
            setDeleteConfirmName("");
            showToast(t("hub.communitymanagesettings_202"));
            navigate({ to: "/community" });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : (isVi ? "Xóa cộng đồng thất bại." : "Failed to delete community.");
            showToast(msg, true);
        }
    };

    return (
        <div className="w-full flex flex-col gap-6 animate-fade-in text-text select-none pb-12">
            {/* Toast Feedback */}
            {toastMessage && (
                <div
                    className={`p-3 rounded-[6px] text-xs font-semibold flex items-center justify-between shadow-sm sticky top-0 z-40 border ${
                        toastIsError
                            ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
                            : "bg-primary/10 border-primary/40 text-primary"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={toastIsError ? faTriangleExclamation : faCircleCheck} className="text-sm" />
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
                            ? `Cấu hình thông tin, thẻ khám phá và quyền tham gia cho ${communityName}.`
                            : `Configure identity, discovery tags, and membership privacy for ${communityName}.`}
                    </p>
                </div>

                <button
                    type="button"
                    disabled={updateCommunityMutation.isPending}
                    onClick={handleSaveGeneral}
                    title={isVi ? "Lưu thay đổi" : "Save changes"}
                    className="px-3 py-1.5 rounded-[4px] bg-primary hover:bg-primary/90 disabled:opacity-50 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
                >
                    <FontAwesomeIcon icon={faCheck} className="text-xs" />
                    <span>
                        {updateCommunityMutation.isPending
                            ? (isVi ? "Đang lưu..." : "Saving...")
                            : t("hub.communitymanagesettings_203")}
                    </span>
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
                            {t("hub.communitymanagesettings_204")}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-8 px-3 rounded-[4px] bg-surface border border-divider-primary text-xs text-text focus:outline-none focus:border-primary"
                        />
                    </div>

                    {/* Linked Game (read-only) */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-text-muted">
                            {t("hub.communitymanagesettings_205")}
                        </label>
                        <div className="h-8 px-3 rounded-[4px] bg-surface/60 border border-divider-primary/60 text-xs text-text-muted flex items-center">
                            {gameName || "—"}
                        </div>
                    </div>

                    {/* Community URL Slug */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-text-muted">
                            {t("hub.communitymanagesettings_206")}
                        </label>
                        <div className="h-8 px-3 rounded-[4px] bg-surface border border-divider-primary/60 text-xs font-mono text-text-muted flex items-center select-all">
                            <span className="text-text-faint">/community/</span>
                            <span className="text-text font-semibold">{communitySlug || communityId}</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-muted">
                        {t("hub.communitymanagesettings_207")}
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="p-2.5 rounded-[4px] bg-surface border border-divider-primary text-xs text-text focus:outline-none focus:border-primary resize-none leading-relaxed"
                    />
                </div>

                {/* Logo & Cover Upload (R2 + Cropper) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                            handleSelectMediaFile("logo", e.target.files?.[0]);
                            e.target.value = "";
                        }}
                    />
                    <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                            handleSelectMediaFile("backdrop", e.target.files?.[0]);
                            e.target.value = "";
                        }}
                    />

                    <div className="flex items-center gap-3 p-2.5 rounded bg-surface border border-divider-primary/40">
                        <img
                            src={logoPreview || DEFAULT_GAME_LOGO}
                            alt="Logo preview"
                            className="w-10 h-10 rounded-[4px] object-cover bg-surface-inner shrink-0"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-bold text-text truncate">Logo</span>
                            <span className="text-[10px] font-mono text-text-faint truncate">1:1 WebP, max 5MB</span>
                        </div>
                        <button
                            type="button"
                            disabled={isUploadingMedia !== null}
                            onClick={() => logoInputRef.current?.click()}
                            className="px-2.5 py-1 rounded bg-surface-hover border border-divider-primary text-[11px] font-semibold text-text-muted hover:text-text disabled:opacity-50 cursor-pointer flex items-center gap-1"
                        >
                            <FontAwesomeIcon icon={faCamera} className="text-[11px]" />
                            <span>
                                {isUploadingMedia === "logo"
                                    ? (isVi ? "Đang tải..." : "Uploading...")
                                    : (isVi ? "Đổi logo" : "Change")}
                            </span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 rounded bg-surface border border-divider-primary/40">
                        <img
                            src={backdropPreview || DEFAULT_BG}
                            alt="Cover preview"
                            className="w-16 h-10 rounded-[4px] object-cover bg-surface-inner shrink-0"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs font-bold text-text truncate">Cover Banner</span>
                            <span className="text-[10px] font-mono text-text-faint truncate">16:9 WebP, max 10MB</span>
                        </div>
                        <button
                            type="button"
                            disabled={isUploadingMedia !== null}
                            onClick={() => coverInputRef.current?.click()}
                            className="px-2.5 py-1 rounded bg-surface-hover border border-divider-primary text-[11px] font-semibold text-text-muted hover:text-text disabled:opacity-50 cursor-pointer flex items-center gap-1"
                        >
                            <FontAwesomeIcon icon={faCamera} className="text-[11px]" />
                            <span>
                                {isUploadingMedia === "backdrop"
                                    ? (isVi ? "Đang tải..." : "Uploading...")
                                    : (isVi ? "Đổi bìa" : "Change")}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* SECTION 2: DISCOVERY TAGS */}
            <div className="p-4 rounded-[6px] bg-surface-inner/50 border border-divider-primary/50 flex flex-col gap-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>DISCOVERY</span>
                </span>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-muted">
                        {t("hub.communitymanagesettings_212")}
                    </label>
                    <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder={isVi ? "vd: rpg, co-op, indie" : "e.g. rpg, co-op, indie"}
                        className="h-8 px-3 rounded-[4px] bg-surface border border-divider-primary text-xs text-text focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            {/* SECTION 3: MEMBERSHIP & PRIVACY */}
            <div className="p-4 rounded-[6px] bg-surface-inner/50 border border-divider-primary/50 flex flex-col gap-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>MEMBERSHIP &amp; PRIVACY</span>
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    {/* PUBLIC */}
                    <div
                        onClick={() => setPrivacy("public")}
                        className={`p-3.5 rounded-[6px] border transition-all cursor-pointer flex flex-col gap-1.5 ${
                            privacy === "public"
                                ? "bg-primary/10 border-primary shadow-sm"
                                : "bg-surface border-divider-primary/50 hover:bg-surface-hover/50"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faUnlock} className="text-xs text-emerald-400" />
                                <span>OPEN</span>
                            </span>
                            {privacy === "public" && (
                                <FontAwesomeIcon icon={faCheck} className="text-primary text-xs" />
                            )}
                        </div>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            {t("hub.communitymanagesettings_218")}
                        </p>
                    </div>

                    {/* PRIVATE (APPROVAL REQUIRED) */}
                    <div
                        onClick={() => setPrivacy("private")}
                        className={`p-3.5 rounded-[6px] border transition-all cursor-pointer flex flex-col gap-1.5 ${
                            privacy === "private"
                                ? "bg-primary/10 border-primary shadow-sm"
                                : "bg-surface border-divider-primary/50 hover:bg-surface-hover/50"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faUserCheck} className="text-xs text-amber-400" />
                                <span>APPROVAL REQUIRED</span>
                            </span>
                            {privacy === "private" && (
                                <FontAwesomeIcon icon={faCheck} className="text-primary text-xs" />
                            )}
                        </div>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            {t("hub.communitymanagesettings_219")}
                        </p>
                    </div>

                    {/* INVITE_ONLY (RESTRICTED) */}
                    <div
                        onClick={() => setPrivacy("invite_only")}
                        className={`p-3.5 rounded-[6px] border transition-all cursor-pointer flex flex-col gap-1.5 ${
                            privacy === "invite_only"
                                ? "bg-primary/10 border-primary shadow-sm"
                                : "bg-surface border-divider-primary/50 hover:bg-surface-hover/50"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faLock} className="text-xs text-rose-400" />
                                <span>RESTRICTED</span>
                            </span>
                            {privacy === "invite_only" && (
                                <FontAwesomeIcon icon={faCheck} className="text-primary text-xs" />
                            )}
                        </div>
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            {t("hub.communitymanagesettings_220")}
                        </p>
                    </div>
                </div>
            </div>

            {/* SECTION 4: COMMUNITY RULES */}
            <div className="p-4 rounded-[6px] bg-surface-inner/50 border border-divider-primary/50 flex flex-col gap-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{isVi ? "QUY TẮC CỘNG ĐỒNG" : "COMMUNITY RULES"}</span>
                </span>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-[6px] bg-surface border border-divider-primary/60">
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-xs font-bold text-text">
                            {isVi ? "Quản lý quy tắc cộng đồng" : "Manage Community Rules"}
                        </span>
                        <span className="text-[11px] text-text-muted">
                            {isVi
                                ? "Thiết lập và chỉnh sửa các quy tắc để thành viên tuân thủ."
                                : "Set and edit rules for members to follow."}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onNavigateRules}
                        className="px-4 py-1.5 rounded-[4px] bg-surface-inner hover:bg-surface-hover border border-divider-primary text-xs font-semibold text-text transition-colors cursor-pointer shrink-0"
                    >
                        {isVi ? "Chỉnh sửa quy tắc" : "Edit Rules"}
                    </button>
                </div>
            </div>

            {/* SECTION 5: DANGER ZONE */}
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
                                {t("hub.communitymanagesettings_239")}
                            </span>
                            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                                {t("hub.communitymanagesettings_240")}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsTransferModalOpen(true)}
                            className="px-3 py-1.5 rounded-[4px] bg-surface hover:bg-amber-500/15 border border-amber-500/40 text-xs font-bold text-amber-400 transition-colors cursor-pointer shrink-0 self-start sm:self-center"
                        >
                            {t("hub.communitymanagesettings_241")}
                        </button>
                    </div>

                    {/* Delete Community */}
                    <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-col max-w-xl">
                            <span className="text-xs font-bold text-rose-400">
                                {t("hub.communitymanagesettings_242")}
                            </span>
                            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                                {t("hub.communitymanagesettings_243")}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="px-3 py-1.5 rounded-[4px] bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition-colors cursor-pointer shrink-0 self-start sm:self-center shadow-sm"
                        >
                            <FontAwesomeIcon icon={faTrashCan} className="text-xs mr-1.5" />
                            <span>{t("hub.communitymanagesettings_244")}</span>
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
                                    {t("hub.communitymanagesettings_245")}
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
                            {t("hub.communitymanagesettings_246")}
                        </p>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-text">
                                {t("hub.communitymanagesettings_247")}
                            </label>
                            <select
                                value={transferTargetId}
                                onChange={(e) => setTransferTargetId(e.target.value)}
                                className="h-8 px-2.5 rounded-[4px] bg-surface-inner border border-divider-primary text-xs text-text focus:outline-none"
                            >
                                <option value="">
                                    {transferCandidates.length === 0
                                        ? (isVi ? "Chưa có thành viên nào khác để chuyển giao" : "No other eligible members")
                                        : (isVi ? "-- Chọn thành viên --" : "-- Select member --")}
                                </option>
                                {transferCandidates.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.label} {c.handle ? `(${c.handle})` : ""} — {c.role}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-divider-primary/40">
                            <button
                                type="button"
                                onClick={() => setIsTransferModalOpen(false)}
                                className="px-3 py-1.5 rounded-[4px] bg-surface-inner hover:bg-surface-hover text-xs font-semibold text-text-muted cursor-pointer"
                            >
                                {t("hub.communitymanagesettings_249")}
                            </button>
                            <button
                                type="button"
                                disabled={!transferTargetId || transferOwnershipMutation.isPending}
                                onClick={handleConfirmTransfer}
                                className="px-4 py-1.5 rounded-[4px] bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-xs font-bold text-black transition-colors cursor-pointer"
                            >
                                {transferOwnershipMutation.isPending
                                    ? (isVi ? "Đang chuyển..." : "Transferring...")
                                    : t("hub.communitymanagesettings_250")}
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
                                    {t("hub.communitymanagesettings_251")}
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
                                ? `CẢNH BÁO: Thao tác này sẽ xóa vĩnh viễn "${communityName}" cùng toàn bộ dữ liệu liên quan (${membersCount} thành viên).`
                                : `WARNING: This will permanently erase "${communityName}" and its related data (${membersCount} members).`}
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

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-divider-primary/40">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-3 py-1.5 rounded-[4px] bg-surface-inner hover:bg-surface-hover text-xs font-semibold text-text-muted cursor-pointer"
                            >
                                {t("hub.communitymanagesettings_253")}
                            </button>
                            <button
                                type="button"
                                disabled={deleteCommunityMutation.isPending}
                                onClick={handleConfirmDelete}
                                className="px-4 py-1.5 rounded-[4px] bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-xs font-bold text-white transition-colors cursor-pointer"
                            >
                                {deleteCommunityMutation.isPending
                                    ? (isVi ? "Đang xóa..." : "Deleting...")
                                    : t("hub.communitymanagesettings_254")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* IMAGE CROPPER MODAL */}
            {cropTarget && (
                <ImageCropperModal
                    rawImageSrc={cropTarget.rawSrc}
                    aspectRatio={cropTarget.kind === "logo" ? 1 : 16 / 9}
                    outputWidth={cropTarget.kind === "logo" ? 512 : 1600}
                    title={
                        cropTarget.kind === "logo"
                            ? (isVi ? "Căn chỉnh Logo cộng đồng" : "Crop Community Logo")
                            : (isVi ? "Căn chỉnh Ảnh bìa cộng đồng" : "Crop Community Cover")
                    }
                    onClose={() => setCropTarget(null)}
                    onSave={handleSaveCroppedMedia}
                />
            )}
        </div>
    );
};
