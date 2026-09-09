import React, { useState } from 'react';
import { uploadImageToR2 } from '../services/upload-service';

export interface AvatarUploaderProps {
    authToken?: string;
    currentAvatarUrl?: string;
    onUploadSuccess?: (avatarUrl: string) => void;
    onError?: (error: Error) => void;
    className?: string;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
    authToken,
    currentAvatarUrl,
    onUploadSuccess,
    onError,
    className = '',
}) => {
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [statusMsg, setStatusMsg] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setErrorMsg(null);
        setStatusMsg(null);

        try {
            setLoading(true);
            setStatusMsg('Đang nén WebP và tải lên Cloudflare R2...');

            // Gọi service xử lý trọn gói (Step 1 -> Step 2 -> Step 3 -> Step 4)
            const result = await uploadImageToR2({
                file,
                type: 'avatar',
                token: authToken,
            });

            const newAvatarUrl = result.avatarUrl || (result.url as string) || (result.imageUrl as string);
            if (newAvatarUrl) {
                setPreviewUrl(newAvatarUrl);
                onUploadSuccess?.(newAvatarUrl);
            }
            setStatusMsg('Cập nhật Avatar thành công!');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Upload thất bại';
            setErrorMsg(message);
            onError?.(err instanceof Error ? err : new Error(message));
        } finally {
            setLoading(false);
            // Reset file input để có thể chọn lại file cùng tên nếu muốn
            e.target.value = '';
        }
    };

    const displayAvatar = previewUrl || currentAvatarUrl;

    return (
        <div className={`flex flex-col items-center gap-3 p-4 bg-[#0E1320] border border-[#232B3E] rounded-[16px] max-w-sm ${className}`}>
            <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-[#1597FF]/60 shadow-lg bg-[#141A29] flex items-center justify-center">
                {displayAvatar ? (
                    <img
                        src={displayAvatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-3xl text-[#8D97AA]">👤</span>
                )}

                {loading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-[#1597FF] border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            <label className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                loading
                    ? 'bg-[#1D263B] text-[#8D97AA] cursor-not-allowed'
                    : 'bg-[#1597FF] hover:bg-[#0084F0] text-white shadow-md hover:shadow-cyan-500/20'
            }`}>
                <span>{loading ? 'Đang xử lý...' : 'Chọn ảnh đại diện mới'}</span>
                <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    disabled={loading}
                />
            </label>

            <span className="text-xs text-[#8D97AA] text-center">
                JPG, PNG, WebP • Tối đa 5MB • Tự động crop 256x256 & nén WebP
            </span>

            {statusMsg && !errorMsg && (
                <p className="text-xs text-emerald-400 font-medium text-center animate-fade-in">
                    {statusMsg}
                </p>
            )}

            {errorMsg && (
                <p className="text-xs text-rose-400 font-medium text-center bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                    {errorMsg}
                </p>
            )}
        </div>
    );
};
