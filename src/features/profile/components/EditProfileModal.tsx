import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck, faUser, faAt, faQuoteLeft, faGlobe, faCamera, faImage } from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "@/features/auth";
import type { ProfileIdentity } from "../types";
import type { TranslateFn } from "@/shared/hooks/useTranslate";

interface EditProfileModalProps {
    identity: ProfileIdentity;
    location: string;
    onSave: (updatedIdentity: Partial<ProfileIdentity>, newLocation: string) => void;
    onClose: () => void;
    onSelectAvatarFile: (file: File) => void;
    onSelectCoverFile: (file: File) => void;
    t: TranslateFn;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
    identity,
    location,
    onSave,
    onClose,
    onSelectAvatarFile,
    onSelectCoverFile,
    t,
}) => {
    const [name, setName] = useState(identity.name);
    const [username, setUsername] = useState(identity.username);
    const [bio, setBio] = useState(identity.bio);
    const [loc, setLoc] = useState(location);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!useAuthStore.getState().requireVerifiedEmail("cập nhật thông tin cá nhân")) return;
        onSave(
            {
                name: name.trim() || identity.name,
                username: username.trim().startsWith("@") ? username.trim() : `@${username.trim()}`,
                bio: bio.trim(),
            },
            loc.trim() || location
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-lg bg-[#0D1220] rounded-[16px] shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4">
                    <h3 className="text-lg font-black text-[#F2F5FA] flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="text-[#1597FF]" />
                        <span>Chỉnh Sửa Hồ Sơ</span>
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-[#151A29] text-[#8D97AA] hover:text-[#F2F5FA] flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                {/* Form body */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
                    {/* Quick Media Update Buttons */}
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-[12px] bg-[#151A29]">
                        <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-[8px] bg-[#0D1220] hover:bg-[#1A2032] text-xs font-bold text-[#F2F5FA] cursor-pointer transition-all">
                            <FontAwesomeIcon icon={faCamera} className="text-[#1597FF]" />
                            <span>Đổi Avatar</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) onSelectAvatarFile(f);
                                }}
                            />
                        </label>

                        <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-[8px] bg-[#0D1220] hover:bg-[#1A2032] text-xs font-bold text-[#F2F5FA] cursor-pointer transition-all">
                            <FontAwesomeIcon icon={faImage} className="text-[#F5B83D]" />
                            <span>Đổi Ảnh Bìa</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) onSelectCoverFile(f);
                                }}
                            />
                        </label>
                    </div>

                    {/* Display Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#8D97AA] flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faUser} className="text-[#1597FF] text-xs" />
                            <span>Tên hiển thị</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập tên hiển thị"
                            className="h-11 px-3.5 rounded-[10px] bg-[#151A29] text-sm text-[#F2F5FA] placeholder-[#5F697C] font-semibold focus:outline-none focus:ring-1 focus:ring-[#1597FF] transition-all"
                            required
                        />
                    </div>

                    {/* Username */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#8D97AA] flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faAt} className="text-[#1597FF] text-xs" />
                            <span>Username (@handle)</span>
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="@username"
                            className="h-11 px-3.5 rounded-[10px] bg-[#151A29] text-sm text-[#F2F5FA] placeholder-[#5F697C] font-semibold focus:outline-none focus:ring-1 focus:ring-[#1597FF] transition-all"
                            required
                        />
                    </div>

                    {/* Bio */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#8D97AA] flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faQuoteLeft} className="text-[#1597FF] text-xs" />
                            <span>Tiểu sử (Bio)</span>
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            placeholder="Giới thiệu đôi nét về bản thân hoặc phong cách chơi game..."
                            className="p-3.5 rounded-[10px] bg-[#151A29] text-sm text-[#F2F5FA] placeholder-[#5F697C] font-medium focus:outline-none focus:ring-1 focus:ring-[#1597FF] resize-none transition-all"
                        />
                    </div>

                    {/* Location / Region */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#8D97AA] flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faGlobe} className="text-[#1597FF] text-xs" />
                            <span>Khu vực / Quốc gia</span>
                        </label>
                        <input
                            type="text"
                            value={loc}
                            onChange={(e) => setLoc(e.target.value)}
                            placeholder="VD: Vietnam / SEA"
                            className="h-11 px-3.5 rounded-[10px] bg-[#151A29] text-sm text-[#F2F5FA] placeholder-[#5F697C] font-semibold focus:outline-none focus:ring-1 focus:ring-[#1597FF] transition-all"
                        />
                    </div>

                    {/* Submit Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-[8px] bg-[#151A29] text-[#8D97AA] text-xs font-bold hover:text-[#F2F5FA] transition-colors cursor-pointer"
                        >
                            {t("profile.cancelEdit")}
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-[8px] bg-[#1597FF] hover:bg-[#35A8FF] text-white text-xs font-black shadow-md shadow-[#1597FF]/25 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                            <FontAwesomeIcon icon={faCheck} />
                            <span>Lưu thay đổi</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
