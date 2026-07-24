import { useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import type { PostData, PostFileAttachment } from "./Post";
import { postToEditableAttachments, prepareAttachmentsForSave, revokeAttachmentUrls, type EditableAttachment } from "../helpers/postAttachments";
import { AttachmentPicker } from "./AttachmentPicker";

interface EditPostModalProps {
    initialTitle: string;
    initialContent: string;
    initialAttachments?: Pick<PostData, "images" | "files">;
    onClose: () => void;
    onSave: (data: {
        title: string;
        content: string;
        images?: string[];
        files?: PostFileAttachment[];
    }) => void;
}

export const EditPostModal = ({
    initialTitle,
    initialContent,
    initialAttachments,
    onClose,
    onSave,
}: EditPostModalProps) => {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [attachments, setAttachments] = useState<EditableAttachment[]>(() =>
        initialAttachments ? postToEditableAttachments(initialAttachments) : []
    );
    const [isSaving, setIsSaving] = useState(false);

    const canSave = content.trim().length > 0 && !isSaving;

    const handleSave = async () => {
        if (!canSave) return;

        setIsSaving(true);
        try {
            const { images, files } = await prepareAttachmentsForSave(attachments);
            revokeAttachmentUrls(attachments);
            onSave({
                title: title.trim(),
                content: content.trim(),
                images,
                files,
            });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        revokeAttachmentUrls(attachments);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-200 flex items-center justify-center animate-fade-in px-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
                <div className="flex flex-row items-center justify-between px-5 py-4 border-b border-border bg-surface-hover/30">
                    <h3 className="font-bold text-lg text-text">Edit Post</h3>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <div className="flex flex-col p-5 gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="edit-post-title" className="text-sm font-semibold text-text">
                            Title
                        </label>
                        <input
                            id="edit-post-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Post title"
                            className="w-full h-10 px-4 bg-surface-hover border border-border rounded-xl text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="edit-post-content" className="text-sm font-semibold text-text">
                            Content
                        </label>
                        <textarea
                            id="edit-post-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's on your mind?"
                            className="w-full bg-surface-hover border border-border rounded-xl p-3 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none h-32"
                        />
                    </div>

                    <AttachmentPicker
                        attachments={attachments}
                        onChange={setAttachments}
                    />

                    <div className="flex flex-row gap-3 pt-1">
                        <button
                            onClick={handleClose}
                            disabled={isSaving}
                            className="flex-1 py-2.5 rounded-full font-semibold text-sm text-text bg-surface-hover hover:bg-border transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!canSave}
                            className={`flex-1 py-2.5 rounded-full font-semibold text-sm transition-colors ${
                                canSave
                                    ? "bg-primary text-white hover:bg-primary-hover shadow-sm"
                                    : "bg-surface-hover text-text-faint cursor-not-allowed"
                            }`}
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
