export type UploadType = 'avatar' | 'cover' | 'post';

export interface ProcessedImageResult {
    blob: Blob;
    width: number;
    height: number;
}

/**
 * Upload size limits (in bytes) per policy:
 * - Avatar: 5 MB
 * - Cover: 10 MB
 * - Post: 15 MB
 */
export const MAX_IMAGE_SIZES: Record<UploadType, number> = {
    avatar: 5 * 1024 * 1024,  // 5 MB
    cover: 10 * 1024 * 1024,  // 10 MB
    post: 15 * 1024 * 1024,   // 15 MB
};

export const ALLOWED_IMAGE_MIMES = [
    'image/jpeg',
    'image/png',
    'image/webp',
];

/**
 * Pre-validation for file size and MIME type
 */
export function validateImageFile(file: File, type: UploadType): void {
    const maxSize = MAX_IMAGE_SIZES[type];
    if (file.size > maxSize) {
        const limitMb = Math.round(maxSize / (1024 * 1024));
        throw new Error(`Dung lượng file vượt quá giới hạn ${limitMb}MB cho ${type}.`);
    }

    const mime = (file.type || '').toLowerCase();
    const isAllowedMime = ALLOWED_IMAGE_MIMES.includes(mime);
    const hasValidExtension = /\.(jpe?g|png|webp)$/i.test(file.name);

    if (!isAllowedMime && !hasValidExtension) {
        throw new Error('File không đúng định dạng. Chỉ chấp nhận JPG, PNG hoặc WebP.');
    }
}

/**
 * Pipeline xử lý ảnh trên Browser Canvas
 * - Decode & validate dimension dị thường (< 20,000px)
 * - Resize / Center Crop đúng theo policy từng loại
 * - Chuyển đổi và nén thành WebP Blob
 */
export async function processImagePipeline(
    file: File,
    type: UploadType
): Promise<ProcessedImageResult> {
    // 1. Validate file size & MIME
    validateImageFile(file, type);

    return new Promise((resolve, reject) => {
        // 2. Decode ảnh bằng HTMLImageElement
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        // Kích hoạt nếu file bị hỏng hoặc đổi extension giả mạo (ví dụ .exe -> .jpg)
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('File không phải là định dạng ảnh hợp lệ hoặc bị hỏng.'));
        };

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            const { naturalWidth: width, naturalHeight: height } = img;

            // 3. Kiểm tra dimension dị thường
            if (!width || !height || width <= 0 || height <= 0) {
                return reject(new Error('Kích thước ảnh không hợp lệ.'));
            }

            if (width > 20000 || height > 20000) {
                return reject(new Error('Kích thước ảnh quá lớn (vượt quá 20,000 px).'));
            }

            let targetWidth = width;
            let targetHeight = height;
            let quality = 0.8;

            // [RULE 12] AVATAR: 256x256, Square Center Crop, WebP Q85
            if (type === 'avatar') {
                targetWidth = 256;
                targetHeight = 256;
                quality = 0.85;
            } 
            // [RULE 13] COVER: Max width 1920px, giữ tỷ lệ, Không Upscale, WebP Q85
            else if (type === 'cover') {
                quality = 0.85;
                if (width > 1920) {
                    targetWidth = 1920;
                    targetHeight = Math.round((height * 1920) / width);
                }
            } 
            // [RULE 14] POST IMAGE: Max 1600x1600, giữ tỷ lệ, Không Upscale, WebP Q80
            else if (type === 'post') {
                quality = 0.8;
                if (width > 1600 || height > 1600) {
                    if (width > height) {
                        targetWidth = 1600;
                        targetHeight = Math.round((height * 1600) / width);
                    } else {
                        targetHeight = 1600;
                        targetWidth = Math.round((width * 1600) / height);
                    }
                }
            }

            // 4. Khởi tạo Canvas để render & nén
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                return reject(new Error('Không thể khởi tạo Canvas 2D Context.'));
            }

            // Smoothing quality cao
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // 5. Render theo từng Policy
            if (type === 'avatar') {
                // Square Center Crop cho Avatar
                const minDimension = Math.min(width, height);
                const sourceX = (width - minDimension) / 2;
                const sourceY = (height - minDimension) / 2;
                ctx.drawImage(
                    img,
                    sourceX, sourceY, minDimension, minDimension, // Cắt hình vuông từ tâm
                    0, 0, targetWidth, targetHeight                // Scale vào 256x256
                );
            } else {
                // Cover & Post: Resize giữ tỷ lệ, không upscale
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            }

            // 6. Export ra WebP Blob
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        // Fallback bằng toDataURL nếu toBlob trả null
                        try {
                            const dataUrl = canvas.toDataURL('image/webp', quality);
                            const arr = dataUrl.split(',');
                            const mimeMatch = arr[0]?.match(/:(.*?);/);
                            const mime = mimeMatch ? mimeMatch[1] : 'image/webp';
                            const bstr = atob(arr[1] || '');
                            let n = bstr.length;
                            const u8arr = new Uint8Array(n);
                            while (n--) {
                                u8arr[n] = bstr.charCodeAt(n);
                            }
                            const fallbackBlob = new Blob([u8arr], { type: mime });
                            return resolve({ blob: fallbackBlob, width: targetWidth, height: targetHeight });
                        } catch {
                            return reject(new Error('Chuyển đổi WebP thất bại.'));
                        }
                    }
                    resolve({ blob, width: targetWidth, height: targetHeight });
                },
                'image/webp',
                quality
            );
        };

        img.src = objectUrl;
    });
}
