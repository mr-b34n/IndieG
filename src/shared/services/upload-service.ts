import { processImagePipeline, type UploadType, type ProcessedImageResult } from '../utils/image-processor';
import { getApiBaseUrl } from '../api/client';

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

export interface PresignedUrlPayload {
    type: UploadType;
    originalSize: number;
    originalMimeType: string;
    postId?: string;
}

export interface PresignedUrlResponse {
    presignedUrl: string;
    fileKey: string;
    raw?: unknown;
}

/**
 * Lấy token lưu trữ trong trình duyệt nếu không truyền token trực tiếp
 */
export function getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return (
        localStorage.getItem('indieg_access_token') ||
        localStorage.getItem('access_token')
    );
}

/**
 * BƯỚC 1: Xin Presigned URL từ NestJS Backend (POST /storage/presigned-url)
 */
export async function requestPresignedUrl(
    payload: PresignedUrlPayload,
    token?: string | null
): Promise<PresignedUrlResponse> {
    const activeToken = token || getStoredToken();
    const baseUrl = getApiBaseUrl();
    const endpoint = `${baseUrl}/storage/presigned-url`;

    console.group('[Storage Pipeline] 📡 Bước 1: POST /storage/presigned-url');
    console.log('Target URL:', endpoint);
    console.log('Payload:', payload);
    console.log('Token:', activeToken ? `${activeToken.substring(0, 15)}...` : '(Không có)');
    console.groupEnd();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`;
    }

    const requestBody: Record<string, unknown> = {
        type: payload.type,
        originalSize: payload.originalSize,
        originalMimeType: payload.originalMimeType,
    };
    if (payload.postId) {
        requestBody.postId = payload.postId;
    }

    let presignedRes: Response;
    try {
        presignedRes = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
        });
    } catch (fetchError: unknown) {
        console.error('[Storage Pipeline] ❌ Lỗi kết nối mạng tới', endpoint, fetchError);
        const errDetails = fetchError instanceof Error ? fetchError.message : String(fetchError);
        throw new Error(
            `Không thể kết nối đến Backend (${endpoint}). Nguyên nhân có thể do Backend chưa bật, bị chặn CORS, hoặc trình duyệt chặn kết nối (Mixed Content: HTTPS sang HTTP localhost). Chi tiết: ${errDetails}`,
            { cause: fetchError }
        );
    }

    if (!presignedRes.ok) {
        let errorMessage = `Lỗi máy chủ (${presignedRes.status})`;
        try {
            const errorData = await presignedRes.json();
            errorMessage = errorData.message || (Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.error) || errorMessage;
        } catch {
            errorMessage = `Lỗi xin cấp URL upload (Mã HTTP: ${presignedRes.status} ${presignedRes.statusText})`;
        }
        console.error('[Storage Pipeline] ❌ Backend từ chối cấp Presigned URL:', errorMessage);
        throw new Error(errorMessage);
    }

    const presignedData = await presignedRes.json();
    console.log('[Storage Pipeline] ✅ Nhận Presigned URL từ Backend:', presignedData);

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
        console.error('[Storage Pipeline] ❌ Dữ liệu trả về thiếu presignedUrl hoặc fileKey:', presignedData);
        throw new Error('Dữ liệu Presigned URL từ máy chủ không hợp lệ (cần presignedUrl và fileKey).');
    }

    return { presignedUrl, fileKey, raw: presignedData };
}

/**
 * BƯỚC 3: Tải trực tiếp Blob WebP lên Cloudflare R2 bằng PUT request
 */
export async function uploadToR2Bucket(presignedUrl: string, blob: Blob): Promise<void> {
    console.group('[Storage Pipeline] ☁️ Bước 3: PUT lên Cloudflare R2');
    console.log('R2 Presigned URL:', presignedUrl);
    console.log('Blob size:', blob.size, 'bytes, type: image/webp');
    console.groupEnd();

    let uploadR2Res: Response;
    try {
        uploadR2Res = await fetch(presignedUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'image/webp',
            },
            body: blob,
        });
    } catch (r2Error: unknown) {
        console.error('[Storage Pipeline] ❌ Lỗi mạng khi upload lên Cloudflare R2:', r2Error);
        throw new Error(
            `Upload trực tiếp lên Cloudflare R2 thất bại. Hãy kiểm tra cấu hình CORS của Bucket R2 đã cho phép AllowedOrigins và AllowedMethods PUT: ${r2Error instanceof Error ? r2Error.message : String(r2Error)}`,
            { cause: r2Error }
        );
    }

    if (!uploadR2Res.ok) {
        console.error('[Storage Pipeline] ❌ Cloudflare R2 trả về mã lỗi:', uploadR2Res.status, uploadR2Res.statusText);
        throw new Error(`Upload trực tiếp lên Cloudflare R2 thất bại (${uploadR2Res.status} ${uploadR2Res.statusText}).`);
    }

    console.log('[Storage Pipeline] ✅ Upload lên Cloudflare R2 thành công!');
}

/**
 * BƯỚC 4: Xác nhận và cập nhật Database trên Backend
 */
export async function confirmUploadWithBackend(
    type: UploadType,
    fileKey: string,
    postId?: string,
    token?: string | null
): Promise<UploadImageResult> {
    const activeToken = token || getStoredToken();
    const baseUrl = getApiBaseUrl();
    const confirmEndpoint =
        type === 'avatar'
            ? `${baseUrl}/users/avatar`
            : type === 'cover'
            ? `${baseUrl}/users/cover`
            : `${baseUrl}/posts/${postId}/images`;

    console.group(`[Storage Pipeline] 📝 Bước 4: Xác nhận với Backend: POST ${confirmEndpoint}`);
    console.log('Payload:', { fileKey });
    console.groupEnd();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`;
    }

    let confirmRes: Response;
    try {
        confirmRes = await fetch(confirmEndpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({ fileKey }),
        });
    } catch (confError: unknown) {
        console.error('[Storage Pipeline] ❌ Lỗi mạng khi xác nhận cập nhật với Backend:', confError);
        throw new Error(
            `Không thể kết nối đến ${confirmEndpoint} để hoàn tất: ${confError instanceof Error ? confError.message : String(confError)}`,
            { cause: confError }
        );
    }

    if (!confirmRes.ok) {
        let errorMessage = 'Cập nhật dữ liệu sau upload thất bại.';
        try {
            const errorData = await confirmRes.json();
            errorMessage = errorData.message || (Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.error) || errorMessage;
        } catch {
            errorMessage = `Cập nhật dữ liệu sau upload thất bại (${confirmRes.status}).`;
        }
        console.error('[Storage Pipeline] ❌ Backend từ chối xác nhận:', errorMessage);
        throw new Error(errorMessage);
    }

    const confirmData = await confirmRes.json();
    console.log('[Storage Pipeline] 🎉 Backend xác nhận thành công:', confirmData);
    return confirmData;
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
        console.warn('[Storage Pipeline] ⚠️ Không tìm thấy JWT token trong localStorage (indieg_access_token / access_token)');
    }

    if (type === 'post' && !postId) {
        throw new Error('Thiếu postId khi upload ảnh cho bài viết.');
    }

    // BƯỚC 1: Xin Presigned URL từ NestJS Backend
    const presigned = await requestPresignedUrl(
        {
            type,
            originalSize: file.size,
            originalMimeType: file.type || 'image/jpeg',
            postId,
        },
        token
    );

    // BƯỚC 2: Xử lý nén ảnh trên Client (Resize / Crop / Convert to WebP)
    console.log('[Storage Pipeline] 🎨 Bước 2: Nén ảnh Canvas sang WebP...');
    const processed: ProcessedImageResult = await processImagePipeline(file, type);
    console.log(`[Storage Pipeline] ✅ Đã nén: ${file.size} bytes ➔ ${processed.blob.size} bytes (${processed.width}x${processed.height}px)`);

    // BƯỚC 3: Upload TRỰC TIẾP từ Browser -> Cloudflare R2 Bucket qua Presigned URL
    await uploadToR2Bucket(presigned.presignedUrl, processed.blob);

    // BƯỚC 4: Xác minh và cập nhật Database trên Backend
    const confirmData = await confirmUploadWithBackend(type, presigned.fileKey, postId, token);

    return {
        ...confirmData,
        fileKey: presigned.fileKey,
        width: processed.width,
        height: processed.height,
    };
}
