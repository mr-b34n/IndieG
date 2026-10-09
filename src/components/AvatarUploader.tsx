import React, { useState } from 'react';
import { uploadImageToR2 } from '../shared/services/upload-service';
import { ImageCropperModal } from '../features/profile/components/ImageCropperModal';
import { useTranslation } from '@/shared/hooks/useTranslate';

export interface AvatarUploaderProps {
    authToken?: string;
    currentAvatarUrl?: string;
    onUploadSuccess?: (avatarUrl: string) => void;
    onError?: (error: Error) => void;
    className?: string;
}

function dataUrlToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
    authToken,
    currentAvatarUrl,
    onUploadSuccess,
    onError,
    className = '',
}) => {
    const { t, language } = useTranslation();
    const isVi = language === 'vi';
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [statusMsg, setStatusMsg] = useState<string | null>(null);
    const [rawCropSrc, setRawCropSrc] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setErrorMsg(null);
        setStatusMsg(null);

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setRawCropSrc(reader.result);
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleSaveCropped = async (croppedDataUrl: string, croppedFile?: File) => {
        setRawCropSrc(null);
        setPreviewUrl(croppedDataUrl);

        try {
            setLoading(true);
            setStatusMsg(isVi ? 'Đang nén WebP và tải lên Cloudflare R2...' : 'Compressing WebP and uploading...');

            const fileToUpload = croppedFile || dataUrlToFile(croppedDataUrl, 'avatar.jpg');
            const result = await uploadImageToR2({
                file: fileToUpload,
                type: 'avatar',
                token: authToken,
            });

            const newAvatarUrl = result.avatarUrl || (result.url as string) || (result.imageUrl as string) || result.fileKey;
            if (newAvatarUrl) {
                setPreviewUrl(newAvatarUrl);
                onUploadSuccess?.(newAvatarUrl);
            }
            setStatusMsg(isVi ? 'Cập nhật Avatar thành công!' : 'Avatar updated successfully!');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : (isVi ? 'Upload thất bại' : 'Upload failed');
            setErrorMsg(message);
            onError?.(err instanceof Error ? err : new Error(message));
        } finally {
            setLoading(false);
        }
    };

    const displayAvatar = previewUrl || currentAvatarUrl;

    return (
        <div className={`flex flex-col items-center gap-3 p-4 bg-[#0E1320] border border-[#232B3E] rounded-[16px] max-w-sm ${className}`}>
            {rawCropSrc && (
                <ImageCropperModal
                    rawImageSrc={rawCropSrc}
                    onClose={() => setRawCropSrc(null)}
                    onSave={handleSaveCropped}
                    aspectRatio={1}
                    title={isVi ? "Căn chỉnh ảnh đại diện" : "Adjust Avatar"}
                    outputWidth={400}
                />
            )}

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
                <span>{loading ? t('common.loading', { defaultValue: 'Đang xử lý...' }) : (isVi ? 'Chọn ảnh đại diện mới' : 'Select new avatar')}</span>
                <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    disabled={loading}
                />
            </label>

            <span className="text-xs text-[#8D97AA] text-center">
                {isVi ? 'JPG, PNG, WebP • Tối đa 5MB • Hỗ trợ căn chỉnh crop trước khi nén WebP' : 'JPG, PNG, WebP • Max 5MB • Crop preview supported before WebP compression'}
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
