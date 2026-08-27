import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMessage,
    faXmark,
    faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "@/features/auth";

interface ChatMessage {
    id: string;
    user: string;
    text: string;
    time: string;
}

interface CommunityChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    communityName: string;
    isVi: boolean;
}

export const CommunityChatDrawer = ({
    isOpen,
    onClose,
    communityName,
    isVi,
}: CommunityChatDrawerProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: "m1", user: "@ghoststrider", text: "Ai rảnh farm shark tooth cùng mình không?", time: "12:04" },
        { id: "m2", user: "@tactical_xeno", text: "Guide base 3 tầng mới ra hay vãi!", time: "12:05" },
        { id: "m3", user: "@ocean_lover", text: "Server đang online nha anh em!", time: "12:06" },
    ]);
    const [input, setInput] = useState("");

    const user = useAuthStore((state) => state.user);

    if (!isOpen) return null;

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        if (!useAuthStore.getState().requireVerifiedEmail("gửi tin nhắn chat")) return;

        const newMsg: ChatMessage = {
            id: `cm-${Date.now()}`,
            user: "@You",
            text: input.trim(),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, newMsg]);
        setInput("");
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-88 bg-surface border border-divider-primary rounded-[4px] shadow-2xl overflow-hidden flex flex-col animate-slide-up">
            {/* Header */}
            <div className="px-3.5 py-2.5 bg-surface-inner border-b border-divider-primary flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-text">
                    <FontAwesomeIcon icon={faMessage} className="text-emerald-500 text-xs" />
                    <span>{communityName} Live Chat</span>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-text-muted hover:text-text cursor-pointer p-1 rounded hover:bg-surface-hover transition-colors"
                >
                    <FontAwesomeIcon icon={faXmark} className="text-xs" />
                </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="p-3 space-y-2 h-72 overflow-y-auto bg-surface text-xs">
                {messages.map((m) => (
                    <div key={m.id} className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
                            <span className="font-bold text-text">{m.user}</span>
                            <span>{m.time}</span>
                        </div>
                        <div className="p-2 rounded-[4px] bg-surface-inner border border-divider-primary/60 text-text leading-relaxed">
                            {m.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Form */}
            {user && user.isVerified === false ? (
                <div className="p-2.5 border-t border-divider-primary bg-amber-500/10 text-[11px] flex items-center justify-between gap-2">
                    <span className="text-amber-500 font-bold truncate">🔒 Cần xác nhận email để chat</span>
                    <button
                        type="button"
                        onClick={() => useAuthStore.getState().openVerifyModal("Xác nhận email để gửi tin nhắn chat.")}
                        className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shrink-0 cursor-pointer text-[10px] shadow-xs"
                    >
                        Xác thực
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSend} className="p-2 border-t border-divider-primary flex items-center gap-2 bg-surface-inner">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isVi ? "Nhập tin nhắn..." : "Type a message..."}
                        className="flex-1 bg-surface border border-divider-primary rounded-[4px] px-2.5 py-1.5 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-primary"
                    />
                    <button
                        type="submit"
                        className="px-3 py-1.5 rounded-[4px] bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faPaperPlane} className="text-[10px]" />
                    </button>
                </form>
            )}
        </div>
    );
};
