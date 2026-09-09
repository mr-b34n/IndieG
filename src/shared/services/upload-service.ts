import { processImagePipeline, type UploadType, type ProcessedImageResult } from '../utils/image-processor';
import { API_BASE_URL } from '../api/client';

export interface UploadOptions {
    file: File;
    type: UploadType;
    token?: string;      // JWT Token của user (tự động lấy từ localStorage nếu không truyền)
    postId?: string;    // Bắt buộc nếu type === 'post'
}

export interface UploadImageResult {
    fileKey: string;
    avatarUrl?: string;
    coverUrl?: string;
    imageUrl?: string;
    url?: string;
    width?: number;
    height?: number;
    [key: string]: unknown;
}

/**
 * Lấy token lưu trữ trong trình duyệt nếu không truyền token trực tiếp
 */
function getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return (
        localStorage.getItem('indieg_access_token') ||
        localStorage.getItem('access_token')
    );
}

/**
 * Luồng Upload ảnh 3 bước tiêu chuẩn:
 * 1. Xin Presigned URL từ Backend (POST /storage/presigned-url)
 * 2. Xử lý & nén ảnh trên Browser (Resize, Crop, WebP Blob)
 * 3. Upload trực tiếp từ Browser lên Cloudflare R2 (PUT Presigned URL)
 * 4. Xác nhận và cập nhật dữ liệu với Backend (Confirm API)
 */
export async function uploadImageToR2({
    file,
    type,
    token: customToken,
    postId,
}: UploadOptions): Promise<UploadImageResult> {
    const token = customToken || getStoredToken();
    if (!token) {
        throw new Error('Bạn cần đăng nhập để thực hiện tải ảnh lên.');
    }

    if (type === 'post' && !postId) {
        throw new Error('Thiếu postId khi upload ảnh cho bài viết.');
    }

    // BƯỚC 1: Xin Presigned URL từ NestJS Backend
    const presignedRes = await fetch(`${API_BASE_URL}/storage/presigned-url`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            type,
            originalSize: file.size,
            originalMimeType: file.type || 'image/jpeg',
            postId,
        }),
    });

    if (!presignedRes.ok) {
        let errorMessage = 'Lỗi xin cấp URL upload.';
        try {
            const errorData = await presignedRes.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            errorMessage = `Lỗi xin cấp URL upload (${presignedRes.status})`;
        }
        throw new Error(errorMessage);
    }

    const presignedData = await presignedRes.json();
    const presignedUrl =
        presignedData.presignedUrl ||
        presignedData.url ||
        presignedData.uploadUrl ||
        presignedData.data?.presignedUrl ||
        presignedData.data?.url;

    const fileKey =
        presignedData.fileKey ||
        presignedData.key ||
        presignedData.data?.fileKey ||
        presignedData.data?.key;

    if (!presignedUrl || !fileKey) {
        throw new Error('Dữ liệu Presigned URL từ máy chủ không hợp lệ.');
    }

    // BƯỚC 2: Xử lý nén ảnh trên Client (Resize / Crop / Convert to WebP)
    const processed: ProcessedImageResult = await processImagePipeline(file, type);

    // BƯỚC 3: Upload TRỰC TIẾP từ Browser -> Cloudflare R2 Bucket qua Presigned URL
    const uploadR2Res = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'image/webp', // Bắt buộc phải trùng với ContentType cấu hình ở backend PutObjectCommand
        },
        body: processed.blob,
    });

    if (!uploadR2Res.ok) {
        throw new Error(`Upload trực tiếp lên Cloudflare R2 thất bại (${uploadR2Res.status}).`);
    }

    // BƯỚC 4: Xác minh và cập nhật Database trên Backend
    const confirmEndpoint =
        type === 'avatar'
            ? `${API_BASE_URL}/users/avatar`
            : type === 'cover'
            ? `${API_BASE_URL}/users/cover`
            : `${API_BASE_URL}/posts/${postId}/images`;

    const confirmRes = await fetch(confirmEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileKey }),
    });

    if (!confirmRes.ok) {
        let errorMessage = 'Cập nhật dữ liệu sau upload thất bại.';
        try {
            const errorData = await confirmRes.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            errorMessage = `Cập nhật dữ liệu sau upload thất bại (${confirmRes.status}).`;
        }
        throw new Error(errorMessage);
    }

    const confirmData = await confirmRes.json();
    return {
        ...confirmData,
        fileKey,
        width: processed.width,
        height: processed.height,
    };
}
