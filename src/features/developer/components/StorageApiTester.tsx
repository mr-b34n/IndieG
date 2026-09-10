import React, { useState } from 'react';
import { getApiBaseUrl } from '@/shared/api/client';
import {
    requestPresignedUrl,
    uploadToR2Bucket,
    confirmUploadWithBackend,
    getStoredToken,
    type PresignedUrlPayload,
    type PresignedUrlResponse,
} from '@/shared/services/upload-service';
import { processImagePipeline, type UploadType, type ProcessedImageResult } from '@/shared/utils/image-processor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faServer,
    faKey,
    faPaperPlane,
    faCloudArrowUp,
    faCheckCircle,
    faExclamationTriangle,
    faRotate,
    faTerminal,
    faArrowsRotate,
    faGlobe,
    faImage,
} from '@fortawesome/free-solid-svg-icons';

interface LogEntry {
    time: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    detail?: unknown;
}

export const StorageApiTester: React.FC = () => {
    // 1. Backend URL State
    const [baseUrl, setBaseUrl] = useState<string>(getApiBaseUrl());
    const [customUrlInput, setCustomUrlInput] = useState<string>(getApiBaseUrl());
    const [pingStatus, setPingStatus] = useState<{ loading: boolean; ok?: boolean; message?: string } | null>(null);

    // 2. Token State
    const [token, setToken] = useState<string>(getStoredToken() || '');
    const [isSavingToken, setIsSavingToken] = useState(false);

    // 3. Presigned URL Request Body State (matching Swagger)
    const [reqType, setReqType] = useState<UploadType>('avatar');
    const [reqSize, setReqSize] = useState<number>(1048576); // 1MB default
    const [reqMime, setReqMime] = useState<string>('image/jpeg');
    const [reqPostId, setReqPostId] = useState<string>('');

    // 4. Request execution state
    const [isCallingPresigned, setIsCallingPresigned] = useState(false);
    const [presignedResult, setPresignedResult] = useState<PresignedUrlResponse | null>(null);
    const [presignedError, setPresignedError] = useState<string | null>(null);

    // 5. End-to-End File Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStep, setUploadStep] = useState<number>(0); // 0: idle, 1: presigned, 2: webp, 3: r2, 4: confirm, 5: done
    const [isUploadingFull, setIsUploadingFull] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

    // 6. Real-time Diagnostic Logs
    const [logs, setLogs] = useState<LogEntry[]>(() => {
        const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
        const initialUrl = getApiBaseUrl();
        const initialToken = getStoredToken();
        const initialLogs: LogEntry[] = [
            { time, type: 'info', message: `Khởi tạo Storage Tester. Base URL hiện tại: ${initialUrl}` },
        ];
        if (!initialToken) {
            initialLogs.push({
                time,
                type: 'warning',
                message: 'Chưa tìm thấy JWT Bearer Token trong localStorage. Nếu backend yêu cầu xác thực, hãy dán token vào ô bên dưới.',
            });
        } else {
            initialLogs.push({
                time,
                type: 'info',
                message: `Tìm thấy JWT Token (${initialToken.substring(0, 16)}...)`,
            });
        }
        return initialLogs;
    });

    const addLog = (type: 'info' | 'success' | 'warning' | 'error', message: string, detail?: unknown) => {
        const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
        setLogs((prev) => [{ time, type, message, detail }, ...prev.slice(0, 49)]);
    };

    // Handle Save Custom Base URL
    const handleSaveBaseUrl = () => {
        const cleaned = customUrlInput.trim().replace(/\/+$/, '');
        if (!cleaned) return;
        localStorage.setItem('indieg_custom_api_url', cleaned);
        setBaseUrl(cleaned);
        addLog('success', `Đã cập nhật Backend API Base URL thành: ${cleaned}`);
    };

    // Handle Reset Base URL
    const handleResetBaseUrl = () => {
        localStorage.removeItem('indieg_custom_api_url');
        const defaultUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3636';
        setCustomUrlInput(defaultUrl);
        setBaseUrl(defaultUrl);
        addLog('info', `Đã reset Backend API Base URL về mặc định: ${defaultUrl}`);
    };

    // Handle Save Custom Token
    const handleSaveToken = () => {
        setIsSavingToken(true);
        const trimmed = token.trim();
        if (trimmed) {
            localStorage.setItem('indieg_access_token', trimmed);
            localStorage.setItem('access_token', trimmed);
            addLog('success', `Đã lưu Access Token vào localStorage (${trimmed.substring(0, 15)}...)`);
        } else {
            localStorage.removeItem('indieg_access_token');
            localStorage.removeItem('access_token');
            addLog('warning', 'Đã xóa Access Token khỏi localStorage');
        }
        setTimeout(() => setIsSavingToken(false), 500);
    };

    // Ping Backend
    const handlePingBackend = async () => {
        setPingStatus({ loading: true });
        addLog('info', `Đang kiểm tra kết nối tới ${baseUrl}...`);
        try {
            const start = performance.now();
            const res = await fetch(`${baseUrl}/`, { method: 'GET' });
            const time = Math.round(performance.now() - start);
            setPingStatus({ ok: true, message: `Kết nối thành công (HTTP ${res.status} trong ${time}ms)` });
            addLog('success', `Kết nối Backend thành công! HTTP ${res.status} (${time}ms)`);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setPingStatus({ ok: false, message: `Không kết nối được: ${msg}` });
            addLog('error', `Không thể kết nối tới ${baseUrl}. Nguyên nhân: ${msg}`, {
                gợi_ý: 'Nếu trang web chạy trên HTTPS (Cloud Run preview) và backend chạy HTTP localhost, trình duyệt sẽ chặn Mixed Content. Bạn có thể dùng ngrok (ví dụ: ngrok http 3636) để tạo URL HTTPS kết nối an toàn.',
            });
        }
    };

    // Execute Step 1: POST /storage/presigned-url
    const handleCallPresignedUrl = async () => {
        setIsCallingPresigned(true);
        setPresignedError(null);
        setPresignedResult(null);

        const payload: PresignedUrlPayload = {
            type: reqType,
            originalSize: reqSize,
            originalMimeType: reqMime,
            ...(reqPostId.trim() ? { postId: reqPostId.trim() } : {}),
        };

        addLog('info', `Gửi POST ${baseUrl}/storage/presigned-url`, payload);

        try {
            const result = await requestPresignedUrl(payload, token || undefined);
            setPresignedResult(result);
            addLog('success', 'Nhận Presigned URL thành công từ Backend!', result);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setPresignedError(msg);
            addLog('error', `POST /storage/presigned-url thất bại: ${msg}`);
        } finally {
            setIsCallingPresigned(false);
        }
    };

    // Execute End-to-End Pipeline
    const handleRunFullUpload = async () => {
        if (!selectedFile) {
            addLog('warning', 'Vui lòng chọn một file ảnh để chạy thử nghiệm upload.');
            return;
        }

        setIsUploadingFull(true);
        setUploadError(null);
        setUploadedUrl(null);
        setUploadStep(1);

        try {
            // Bước 1: Presigned URL
            addLog('info', `[Pipeline 1/4] Xin Presigned URL cho file: ${selectedFile.name} (${selectedFile.size} bytes)`);
            const presigned = await requestPresignedUrl(
                {
                    type: reqType,
                    originalSize: selectedFile.size,
                    originalMimeType: selectedFile.type || 'image/jpeg',
                    ...(reqPostId.trim() ? { postId: reqPostId.trim() } : {}),
                },
                token || undefined
            );
            addLog('success', `[Pipeline 1/4] Đã nhận fileKey: ${presigned.fileKey}`);

            // Bước 2: Canvas WebP
            setUploadStep(2);
            addLog('info', `[Pipeline 2/4] Xử lý & nén ảnh trên Canvas (Loại: ${reqType})...`);
            const processed: ProcessedImageResult = await processImagePipeline(selectedFile, reqType);
            addLog('success', `[Pipeline 2/4] Nén WebP thành công: ${selectedFile.size}B ➔ ${processed.blob.size}B (${processed.width}x${processed.height}px)`);

            // Bước 3: PUT R2
            setUploadStep(3);
            addLog('info', `[Pipeline 3/4] Đang PUT trực tiếp lên Cloudflare R2...`);
            await uploadToR2Bucket(presigned.presignedUrl, processed.blob);
            addLog('success', `[Pipeline 3/4] Upload lên Cloudflare R2 thành công!`);

            // Bước 4: Confirm
            setUploadStep(4);
            addLog('info', `[Pipeline 4/4] Xác nhận với Backend (${reqType})...`);
            const confirmData = await confirmUploadWithBackend(
                reqType,
                presigned.fileKey,
                reqPostId.trim() || undefined,
                token || undefined
            );
            addLog('success', `[Pipeline 4/4] Backend xác nhận thành công!`, confirmData);

            const finalUrl = (confirmData.avatarUrl || confirmData.coverUrl || confirmData.imageUrl || confirmData.url) as string;
            setUploadedUrl(finalUrl || URL.createObjectURL(processed.blob));
            setUploadStep(5);
            addLog('success', '🎉 Toàn bộ quy trình Upload R2 4 bước hoàn tất xuất sắc!');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setUploadError(msg);
            addLog('error', `Lỗi trong quy trình upload: ${msg}`);
        } finally {
            setIsUploadingFull(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6 text-[#E8ECF2]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D121F] border border-[#1F273D] shadow-xl">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1597FF]/10 border border-[#1597FF]/30 flex items-center justify-center text-[#1597FF]">
                            <FontAwesomeIcon icon={faServer} className="text-lg" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white flex items-center gap-2">
                                Storage & Presigned URL Tester
                                <span className="text-xs px-2 py-0.5 rounded-md bg-[#1597FF]/20 text-[#1597FF] border border-[#1597FF]/30 font-medium">
                                    POST /storage/presigned-url
                                </span>
                            </h1>
                            <p className="text-xs text-[#8D97AA]">
                                Kiểm tra, gửi thử nghiệm và chẩn đoán kết nối giữa Frontend, NestJS Backend & Cloudflare R2
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handlePingBackend}
                        disabled={pingStatus?.loading}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#1F273D] hover:bg-[#2A3552] text-[#C5D0E6] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faRotate} className={pingStatus?.loading ? 'animate-spin' : ''} />
                        <span>Kiểm tra kết nối (Ping)</span>
                    </button>
                </div>
            </div>

            {/* Section 1: Backend Connection & Token Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Backend URL Box */}
                <div className="p-4 rounded-xl bg-[#0D121F] border border-[#1F273D] space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#8D97AA] flex items-center gap-2">
                            <FontAwesomeIcon icon={faGlobe} className="text-[#1597FF]" />
                            <span>Backend API Base URL</span>
                        </label>
                        <button
                            type="button"
                            onClick={handleResetBaseUrl}
                            className="text-[11px] text-[#8D97AA] hover:text-[#1597FF] underline cursor-pointer"
                        >
                            Reset về mặc định
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={customUrlInput}
                            onChange={(e) => setCustomUrlInput(e.target.value)}
                            placeholder="http://localhost:3636"
                            className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#141A29] border border-[#232B3E] text-white focus:outline-none focus:border-[#1597FF]"
                        />
                        <button
                            type="button"
                            onClick={handleSaveBaseUrl}
                            className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#1597FF] hover:bg-[#0084F0] text-white transition-all cursor-pointer whitespace-nowrap"
                        >
                            Lưu URL
                        </button>
                    </div>

                    {pingStatus && (
                        <div
                            className={`p-2.5 rounded-lg text-xs flex items-center gap-2 border ${
                                pingStatus.ok
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                            }`}
                        >
                            <FontAwesomeIcon icon={pingStatus.ok ? faCheckCircle : faExclamationTriangle} />
                            <span>{pingStatus.message}</span>
                        </div>
                    )}
                </div>

                {/* JWT Bearer Token Box */}
                <div className="p-4 rounded-xl bg-[#0D121F] border border-[#1F273D] space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#8D97AA] flex items-center gap-2">
                            <FontAwesomeIcon icon={faKey} className="text-[#F5B83D]" />
                            <span>JWT Bearer Token</span>
                        </label>
                        <span className="text-[11px] text-[#8D97AA]">
                            {token ? 'Đã có token' : 'Chưa có token'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Dán accessToken từ Swagger hoặc Postman..."
                            className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#141A29] border border-[#232B3E] text-white focus:outline-none focus:border-[#1597FF]"
                        />
                        <button
                            type="button"
                            onClick={handleSaveToken}
                            disabled={isSavingToken}
                            className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#1F273D] hover:bg-[#2A3552] text-[#C5D0E6] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                        >
                            Lưu Token
                        </button>
                    </div>

                    <p className="text-[11px] text-[#8D97AA]">
                        Tự động đính kèm header <code className="text-[#C5D0E6] bg-[#141A29] px-1 py-0.5 rounded">Authorization: Bearer ...</code> trong mọi request.
                    </p>
                </div>
            </div>

            {/* Section 2: POST /storage/presigned-url Interactive Sandbox */}
            <div className="p-5 rounded-2xl bg-[#0D121F] border border-[#1F273D] space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#1F273D] pb-3">
                    <div>
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs border border-emerald-500/30">
                                POST
                            </span>
                            <span className="font-mono text-xs text-white">/storage/presigned-url</span>
                        </h2>
                        <p className="text-xs text-[#8D97AA] mt-0.5">
                            Gọi trực tiếp endpoint với payload theo đúng Swagger schema
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleCallPresignedUrl}
                        disabled={isCallingPresigned}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1597FF] hover:bg-[#0084F0] text-white shadow-lg shadow-[#1597FF]/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={isCallingPresigned ? faArrowsRotate : faPaperPlane} className={isCallingPresigned ? 'animate-spin' : ''} />
                        <span>{isCallingPresigned ? 'Đang gửi...' : 'Gửi Request ngay'}</span>
                    </button>
                </div>

                {/* Body Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <label className="text-[11px] font-bold text-[#8D97AA] block mb-1">
                            type <span className="text-rose-400">*</span>
                        </label>
                        <select
                            value={reqType}
                            onChange={(e) => setReqType(e.target.value as UploadType)}
                            className="w-full px-3 py-2 text-xs rounded-lg bg-[#141A29] border border-[#232B3E] text-white focus:outline-none focus:border-[#1597FF]"
                        >
                            <option value="avatar">avatar</option>
                            <option value="cover">cover</option>
                            <option value="post">post</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-[#8D97AA] block mb-1">
                            originalSize (bytes) <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="number"
                            value={reqSize}
                            onChange={(e) => setReqSize(parseInt(e.target.value, 10) || 0)}
                            className="w-full px-3 py-2 text-xs rounded-lg bg-[#141A29] border border-[#232B3E] text-white focus:outline-none focus:border-[#1597FF]"
                        />
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-[#8D97AA] block mb-1">
                            originalMimeType <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={reqMime}
                            onChange={(e) => setReqMime(e.target.value)}
                            placeholder="image/jpeg"
                            className="w-full px-3 py-2 text-xs rounded-lg bg-[#141A29] border border-[#232B3E] text-white focus:outline-none focus:border-[#1597FF]"
                        />
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-[#8D97AA] block mb-1">
                            postId (Tùy chọn)
                        </label>
                        <input
                            type="text"
                            value={reqPostId}
                            onChange={(e) => setReqPostId(e.target.value)}
                            placeholder="Chỉ cần khi type='post'"
                            className="w-full px-3 py-2 text-xs rounded-lg bg-[#141A29] border border-[#232B3E] text-white focus:outline-none focus:border-[#1597FF]"
                        />
                    </div>
                </div>

                {/* Request Payload Preview */}
                <div className="p-3 rounded-xl bg-[#090D17] border border-[#1B2236] font-mono text-xs">
                    <div className="text-[11px] text-[#8D97AA] mb-1">JSON Payload gửi đi:</div>
                    <pre className="text-cyan-300 overflow-x-auto">
                        {JSON.stringify(
                            {
                                type: reqType,
                                originalSize: reqSize,
                                originalMimeType: reqMime,
                                ...(reqPostId.trim() ? { postId: reqPostId.trim() } : {}),
                            },
                            null,
                            2
                        )}
                    </pre>
                </div>

                {/* Response Display */}
                {presignedResult && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 animate-fade-in">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                            <FontAwesomeIcon icon={faCheckCircle} />
                            <span>Kết quả thành công (HTTP 200/201)</span>
                        </div>
                        <div className="font-mono text-xs space-y-1 text-[#C5D0E6]">
                            <p><span className="text-[#8D97AA]">fileKey:</span> <span className="text-emerald-300 font-bold">{presignedResult.fileKey}</span></p>
                            <p className="break-all"><span className="text-[#8D97AA]">presignedUrl:</span> <span className="text-cyan-400">{presignedResult.presignedUrl}</span></p>
                        </div>
                    </div>
                )}

                {presignedError && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2 animate-fade-in">
                        <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            <span>Lỗi trả về từ Backend hoặc Trình duyệt</span>
                        </div>
                        <p className="text-xs text-rose-300 font-mono">{presignedError}</p>
                    </div>
                )}
            </div>

            {/* Section 3: End-to-End File Upload Sandbox (Avatar / Cover / Post) */}
            <div className="p-5 rounded-2xl bg-[#0D121F] border border-[#1F273D] space-y-4 shadow-xl">
                <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faCloudArrowUp} className="text-[#1597FF]" />
                        <span>Thử nghiệm Luồng Upload thực tế (Client ➔ Presigned ➔ Cloudflare R2 ➔ Confirm)</span>
                    </h2>
                    <p className="text-xs text-[#8D97AA] mt-0.5">
                        Chọn một file ảnh thật từ máy của bạn để chạy toàn bộ 4 bước upload
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                        <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-[#232B3E] hover:border-[#1597FF] bg-[#141A29]/50 hover:bg-[#141A29] cursor-pointer transition-all">
                            <FontAwesomeIcon icon={faImage} className="text-2xl text-[#8D97AA] mb-2" />
                            <span className="text-xs font-bold text-[#E8ECF2]">
                                {selectedFile ? selectedFile.name : 'Bấm vào đây để chọn ảnh thử nghiệm'}
                            </span>
                            <span className="text-[11px] text-[#8D97AA] mt-1">
                                {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB • ${selectedFile.type}` : 'JPG, PNG, WebP (Tối đa 10MB)'}
                            </span>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) {
                                        setSelectedFile(f);
                                        setReqSize(f.size);
                                        setReqMime(f.type || 'image/jpeg');
                                    }
                                }}
                            />
                        </label>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-[#8D97AA]">Loại upload:</span>
                            <div className="flex gap-2">
                                {(['avatar', 'cover', 'post'] as UploadType[]).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setReqType(t)}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            reqType === t
                                                ? 'bg-[#1597FF] text-white'
                                                : 'bg-[#141A29] text-[#8D97AA] hover:text-white'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {reqType === 'post' && (
                            <div>
                                <label className="text-[11px] text-[#8D97AA] block mb-1">Post ID (Bắt buộc cho post):</label>
                                <input
                                    type="text"
                                    value={reqPostId}
                                    onChange={(e) => setReqPostId(e.target.value)}
                                    placeholder="e.g. 10000000-0000-4000-8000-000000000001"
                                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#141A29] border border-[#232B3E] text-white focus:outline-none focus:border-[#1597FF]"
                                />
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleRunFullUpload}
                            disabled={!selectedFile || isUploadingFull}
                            className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#1597FF] to-[#0084F0] hover:opacity-90 text-white shadow-lg shadow-[#1597FF]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <FontAwesomeIcon icon={isUploadingFull ? faArrowsRotate : faCloudArrowUp} className={isUploadingFull ? 'animate-spin' : ''} />
                            <span>{isUploadingFull ? 'Đang thực hiện quy trình...' : 'Chạy toàn bộ quy trình Upload R2'}</span>
                        </button>
                    </div>
                </div>

                {/* Upload Steps Indicator */}
                {uploadStep > 0 && (
                    <div className="p-4 rounded-xl bg-[#090D17] border border-[#1B2236] space-y-2">
                        <div className="text-xs font-bold text-white mb-2">Tiến trình Upload:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                            <div className={`p-2 rounded-lg border ${uploadStep >= 1 ? (uploadStep === 1 && isUploadingFull ? 'border-[#1597FF] bg-[#1597FF]/10 text-[#1597FF]' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300') : 'border-[#232B3E] text-[#8D97AA]'}`}>
                                1. Xin Presigned URL
                            </div>
                            <div className={`p-2 rounded-lg border ${uploadStep >= 2 ? (uploadStep === 2 && isUploadingFull ? 'border-[#1597FF] bg-[#1597FF]/10 text-[#1597FF]' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300') : 'border-[#232B3E] text-[#8D97AA]'}`}>
                                2. Nén WebP Canvas
                            </div>
                            <div className={`p-2 rounded-lg border ${uploadStep >= 3 ? (uploadStep === 3 && isUploadingFull ? 'border-[#1597FF] bg-[#1597FF]/10 text-[#1597FF]' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300') : 'border-[#232B3E] text-[#8D97AA]'}`}>
                                3. PUT Cloudflare R2
                            </div>
                            <div className={`p-2 rounded-lg border ${uploadStep >= 4 ? (uploadStep === 4 && isUploadingFull ? 'border-[#1597FF] bg-[#1597FF]/10 text-[#1597FF]' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300') : 'border-[#232B3E] text-[#8D97AA]'}`}>
                                4. Xác nhận Backend
                            </div>
                        </div>

                        {uploadError && (
                            <div className="p-3 mt-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                                {uploadError}
                            </div>
                        )}

                        {uploadedUrl && (
                            <div className="p-3 mt-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                                <img src={uploadedUrl} alt="Uploaded" className="w-12 h-12 rounded-lg object-cover border border-emerald-500/40" />
                                <div className="text-xs text-emerald-300 font-mono">
                                    <p className="font-bold">Ảnh đã tải lên thành công!</p>
                                    <p className="text-[11px] text-[#8D97AA] truncate max-w-md">{uploadedUrl}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Section 4: Live Diagnostic Log Terminal */}
            <div className="p-4 rounded-2xl bg-[#090D17] border border-[#1B2236] space-y-2 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#1B2236] pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <FontAwesomeIcon icon={faTerminal} className="text-[#1597FF]" />
                        <span>Nhật ký Chẩn đoán thời gian thực (Console Live Logs)</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setLogs([])}
                        className="text-[11px] text-[#8D97AA] hover:text-white cursor-pointer"
                    >
                        Xóa log
                    </button>
                </div>

                <div className="h-48 overflow-y-auto font-mono text-[11px] space-y-1.5 p-2 rounded-lg bg-[#06080F] border border-[#141A29]">
                    {logs.length === 0 ? (
                        <p className="text-[#8D97AA] italic">Chưa có nhật ký nào. Hãy bấm "Gửi Request" hoặc "Chạy toàn bộ quy trình" để theo dõi.</p>
                    ) : (
                        logs.map((log, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                                <span className="text-[#566075] shrink-0">[{log.time}]</span>
                                <span
                                    className={`shrink-0 font-bold ${
                                        log.type === 'success'
                                            ? 'text-emerald-400'
                                            : log.type === 'error'
                                            ? 'text-rose-400'
                                            : log.type === 'warning'
                                            ? 'text-amber-400'
                                            : 'text-cyan-400'
                                    }`}
                                >
                                    [{log.type.toUpperCase()}]
                                </span>
                                <span className="text-[#C5D0E6] break-all">{log.message}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
