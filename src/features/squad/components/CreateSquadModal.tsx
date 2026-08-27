import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark,
    faUsers,
    faGamepad,
    faMicrophone,
    faTag,
    faLink,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useSquadStore } from "../store/useSquadStore";
import { useAuthStore } from "@/features/auth";
import { GAME_OPTIONS, QUICK_TAGS, VOICE_OPTIONS } from "../constants";
import { type SquadVoiceType } from "../types";

interface CreateSquadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateSquadModal = ({ isOpen, onClose }: CreateSquadModalProps) => {
    const { t } = useTranslation();
    const addSquad = useSquadStore((state) => state.addSquad);

    const [name, setName] = useState("");
    const [game, setGame] = useState(GAME_OPTIONS[0]);
    const [customGame, setCustomGame] = useState("");
    const [maxMembers, setMaxMembers] = useState(5);
    const [voice, setVoice] = useState<SquadVoiceType>("Discord Required");
    const [roomCode, setRoomCode] = useState("");
    const [discordUrl, setDiscordUrl] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState<string[]>(["🤝 Tìm Đồng Đội"]);
    const [tagInput, setTagInput] = useState("");

    if (!isOpen) return null;

    const handleToggleTag = (tag: string) => {
        if (tags.includes(tag)) {
            setTags(tags.filter((t) => t !== tag));
        } else if (tags.length < 5) {
            setTags([...tags, tag]);
        }
    };

    const handleAddCustomTag = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim()) && tags.length < 5) {
                setTags([...tags, tagInput.trim()]);
                setTagInput("");
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!useAuthStore.getState().requireVerifiedEmail("tạo phòng đội nhóm")) return;
        const finalGame = game === "Khác..." ? customGame || "Gaming" : game;

        if (!name.trim() || !description.trim()) {
            return;
        }

        addSquad({
            name: name.trim(),
            game: finalGame,
            description: description.trim(),
            tags,
            maxMembers: Number(maxMembers),
            voice,
            roomCode: roomCode.trim() || undefined,
            discordUrl: discordUrl.trim() || undefined,
        });

        onClose();
        setName("");
        setDescription("");
        setRoomCode("");
        setDiscordUrl("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
            <div className="w-full max-w-xl bg-surface border border-divider-primary rounded-[4px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-divider-primary bg-surface-inner">
                    <div className="flex items-center gap-2.5">
                        <FontAwesomeIcon icon={faUsers} className="text-primary text-xs" />
                        <span className="font-extrabold text-sm text-text uppercase tracking-tight">
                            {t("squad.createTitle")}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-[4px] border border-divider-primary flex items-center justify-center text-text-muted hover:text-text cursor-pointer transition-colors"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-xs" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 flex flex-col gap-4 text-xs">
                    {/* Squad Name */}
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-text uppercase tracking-wider text-[11px]">
                            {t("squad.nameLabel")} <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder={t("squad.namePlaceholder")}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-surface-inner border border-divider-primary rounded-[4px] px-3 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-primary transition-colors font-medium"
                        />
                    </div>

                    {/* Game & Max Members */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="flex flex-col gap-1">
                            <label className="font-bold text-text uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faGamepad} className="text-primary text-[10px]" />
                                <span>{t("squad.gameLabel")}</span>
                            </label>
                            <select
                                value={game}
                                onChange={(e) => setGame(e.target.value)}
                                className="w-full bg-surface-inner border border-divider-primary rounded-[4px] px-3 py-2 text-xs text-text focus:outline-none focus:border-primary font-medium cursor-pointer"
                            >
                                {GAME_OPTIONS.map((g) => (
                                    <option key={g} value={g} className="bg-surface text-text">
                                        {g}
                                    </option>
                                ))}
                            </select>
                            {game === "Khác..." && (
                                <input
                                    type="text"
                                    placeholder={t("squad.customGamePlaceholder")}
                                    value={customGame}
                                    onChange={(e) => setCustomGame(e.target.value)}
                                    className="mt-1 w-full bg-surface-inner border border-divider-primary rounded-[4px] px-3 py-1.5 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-primary font-medium"
                                />
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-bold text-text uppercase tracking-wider text-[11px] flex items-center justify-between">
                                <span>{t("squad.maxMembers")}</span>
                                <span className="text-primary font-bold font-mono">
                                    {t("squad.membersCount", { count: maxMembers })}
                                </span>
                            </label>
                            <input
                                type="range"
                                min={2}
                                max={10}
                                value={maxMembers}
                                onChange={(e) => setMaxMembers(Number(e.target.value))}
                                className="w-full accent-primary h-1.5 bg-surface-inner rounded-full cursor-pointer mt-2.5"
                            />
                            <div className="flex justify-between text-[10px] font-mono text-text-faint">
                                <span>2 (Duo)</span>
                                <span>5 (Squad)</span>
                                <span>10 (Guild)</span>
                            </div>
                        </div>
                    </div>

                    {/* Voice Type */}
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-text uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faMicrophone} className="text-emerald-500 text-[10px]" />
                            <span>{t("squad.voiceChannel")}</span>
                        </label>
                        <select
                            value={voice}
                            onChange={(e) => setVoice(e.target.value as SquadVoiceType)}
                            className="w-full bg-surface-inner border border-divider-primary rounded-[4px] px-3 py-2 text-xs text-text focus:outline-none focus:border-primary font-medium cursor-pointer"
                        >
                            {VOICE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-surface text-text font-medium">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Room Code & Discord */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="flex flex-col gap-1">
                            <label className="font-bold text-text uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faLink} className="text-primary text-[10px]" />
                                <span>{t("squad.roomCode")}</span>
                            </label>
                            <input
                                type="text"
                                placeholder={t("squad.roomCodePlaceholder")}
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value)}
                                className="w-full bg-surface-inner border border-divider-primary rounded-[4px] px-3 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-primary font-medium"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="font-bold text-text uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faLink} className="text-indigo-400 text-[10px]" />
                                <span>{t("squad.discordLink")}</span>
                            </label>
                            <input
                                type="url"
                                placeholder="https://discord.gg/..."
                                value={discordUrl}
                                onChange={(e) => setDiscordUrl(e.target.value)}
                                className="w-full bg-surface-inner border border-divider-primary rounded-[4px] px-3 py-2 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-primary font-medium"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1">
                        <label className="font-bold text-text uppercase tracking-wider text-[11px]">
                            {t("squad.description")} <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            required
                            rows={3}
                            placeholder={t("squad.descPlaceholder")}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-surface-inner border border-divider-primary rounded-[4px] p-2.5 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-primary transition-colors resize-none font-medium"
                        />
                    </div>

                    {/* Quick Tags */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-text uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faTag} className="text-amber-500 text-[10px]" />
                            <span>{t("squad.tagsLabel")}</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {QUICK_TAGS.map((tag) => {
                                const isSelected = tags.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleToggleTag(tag)}
                                        className={`px-2.5 py-0.5 rounded-[3px] text-xs font-semibold transition-colors border cursor-pointer ${
                                            isSelected
                                                ? "bg-primary text-white border-primary"
                                                : "bg-surface-inner text-text-muted border-divider-primary hover:border-text-faint"
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                        <input
                            type="text"
                            placeholder={t("squad.customTagPlaceholder")}
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddCustomTag}
                            className="w-full bg-surface-inner border border-divider-primary rounded-[4px] px-3 py-1.5 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-primary font-medium mt-1"
                        />
                    </div>

                    {/* Submit Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-divider-primary mt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-[4px] border border-divider-primary bg-surface hover:bg-surface-hover text-text-muted hover:text-text font-bold text-xs transition-colors cursor-pointer"
                        >
                            {t("squad.cancel")}
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-[4px] bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                            <span>{t("squad.createButton")}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
