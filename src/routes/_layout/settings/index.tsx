import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faGear, faUser, faShieldHalved, faGlobe, faBug, faLightbulb, faCheckCircle, faArrowLeft, faBan
} from '@fortawesome/free-solid-svg-icons';
import { useThemeStore } from '@/shared/store/useThemeStore';

export const Route = createFileRoute('/_layout/settings/')({
    component: SettingsPage,
});

function SettingsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("general");
    const theme = useThemeStore((state) => state.theme);
    const toggleTheme = useThemeStore((state) => state.toggleTheme);
    const language = useThemeStore((state) => state.language);
    const toggleLanguage = useThemeStore((state) => state.toggleLanguage);

    const [feedbackType, setFeedbackType] = useState<"bug" | "feedback">("bug");
    const [feedbackTitle, setFeedbackTitle] = useState("");
    const [feedbackDescription, setFeedbackDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmitFeedback = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setFeedbackTitle("");
                setFeedbackDescription("");
            }, 3000);
        }, 1000);
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => navigate({ to: "/" })}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-border text-text-muted hover:text-text hover:bg-surface-hover transition-colors shadow-sm"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <h1 className="text-2xl font-bold text-text flex items-center gap-3">
                    <FontAwesomeIcon icon={faGear} />
                    Cài đặt
                </h1>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Menu */}
                <div className="w-full md:w-72 shrink-0 flex flex-col gap-2">
                    {[
                        { id: "general", label: "Cài đặt chung", icon: faGlobe },
                        { id: "account", label: "Tài khoản & Bảo mật", icon: faShieldHalved },
                        { id: "blocked", label: "Danh sách chặn", icon: faBan },
                        { id: "feedback", label: "Báo lỗi & Góp ý", icon: faBug },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all text-left ${
                                activeTab === tab.id
                                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                                    : "bg-surface border border-border text-text-muted hover:bg-surface-hover hover:text-text hover:border-border/80"
                            }`}
                        >
                            <FontAwesomeIcon icon={tab.icon} className={activeTab === tab.id ? "text-white" : "text-text-muted"} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
                        {activeTab === "general" && (
                            <div className="flex flex-col gap-8 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-text mb-4">Giao diện</h3>
                                    <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-background">
                                        <div>
                                            <p className="font-semibold text-text">Chế độ tối (Dark Mode)</p>
                                            <p className="text-sm text-text-muted mt-1">Sử dụng nền tối để bảo vệ mắt</p>
                                        </div>
                                        <button 
                                            onClick={toggleTheme}
                                            className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${theme === 'dark' ? 'bg-primary' : 'bg-border'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-bold text-text mb-4">Ngôn ngữ</h3>
                                    <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-background">
                                        <div>
                                            <p className="font-semibold text-text">Ngôn ngữ hiển thị</p>
                                            <p className="text-sm text-text-muted mt-1">Thay đổi ngôn ngữ ứng dụng</p>
                                        </div>
                                        <button 
                                            onClick={toggleLanguage}
                                            className="px-4 py-2 border border-border rounded-lg bg-surface-hover hover:bg-border text-sm font-bold text-text transition-colors"
                                        >
                                            {language === 'vi' ? 'Tiếng Việt' : 'English'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "account" && (
                            <div className="flex flex-col gap-6 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faUser} className="text-primary" />
                                        Quản lý tài khoản
                                    </h3>
                                    <p className="text-text-muted text-sm mb-4">Chức năng quản lý mật khẩu và các phiên đăng nhập đang được phát triển.</p>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-background opacity-60 pointer-events-none">
                                            <div>
                                                <p className="font-semibold text-text">Đổi mật khẩu</p>
                                                <p className="text-sm text-text-muted mt-0.5">Cập nhật mật khẩu mới</p>
                                            </div>
                                            <button className="px-4 py-2 bg-surface-hover border border-border rounded-lg font-bold text-sm">Cập nhật</button>
                                        </div>
                                        <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-background opacity-60 pointer-events-none">
                                            <div>
                                                <p className="font-semibold text-text">Xác thực 2 yếu tố (2FA)</p>
                                                <p className="text-sm text-text-muted mt-0.5">Bảo vệ tài khoản bằng ứng dụng Authenticator</p>
                                            </div>
                                            <button className="px-4 py-2 bg-surface-hover border border-border rounded-lg font-bold text-sm">Bật</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border">
                                    <h3 className="text-lg font-bold text-rose-500 mb-4">Khu vực nguy hiểm</h3>
                                    <div className="flex items-center justify-between p-4 border border-rose-500/20 rounded-xl bg-rose-500/5">
                                        <div>
                                            <p className="font-semibold text-text">Xóa tài khoản</p>
                                            <p className="text-sm text-text-muted mt-0.5">Xóa vĩnh viễn dữ liệu của bạn</p>
                                        </div>
                                        <button className="px-4 py-2 bg-rose-500 text-white rounded-lg font-bold text-sm hover:bg-rose-600 transition-colors">Xóa tài khoản</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "blocked" && (
                            <div className="flex flex-col gap-6 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-text mb-2">Tài khoản bị chặn</h3>
                                    <p className="text-text-muted text-sm mb-6">Những tài khoản dưới đây sẽ không thể tương tác với bạn, và bạn cũng sẽ không thấy bài viết/bình luận của họ.</p>
                                    
                                    <div className="flex flex-col gap-3">
                                        {[
                                            { name: "ToxicGamer99", username: "@toxic99", reason: "Spam / Ngôn từ đả kích", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ToxicGamer99" },
                                            { name: "ScammerBot", username: "@scammer_xyz", reason: "Lừa đảo / Phishing", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ScammerBot" }
                                        ].map((blocked) => (
                                            <div key={blocked.username} className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                                                <div className="flex items-center gap-4">
                                                    <img src={blocked.avatar} alt={blocked.name} className="w-10 h-10 rounded-full object-cover grayscale opacity-60" />
                                                    <div className="flex flex-col">
                                                        <p className="font-bold text-text text-sm line-through opacity-80">{blocked.name}</p>
                                                        <p className="text-xs text-text-muted">{blocked.username}</p>
                                                    </div>
                                                </div>
                                                <button className="px-4 py-2 border border-border bg-surface-hover hover:bg-border text-text text-xs font-bold rounded-lg transition-colors">
                                                    Bỏ chặn
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "feedback" && (
                            <div className="flex flex-col gap-6 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-text mb-2">Gửi phản hồi cho chúng tôi</h3>
                                    <p className="text-text-muted text-sm mb-6">Bạn gặp sự cố hay có ý tưởng hay? Hãy cho chúng tôi biết nhé!</p>
                                    
                                    {isSuccess ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in bg-background rounded-xl border border-border">
                                            <FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-emerald-500 mb-4" />
                                            <h4 className="text-xl font-bold text-text mb-2">Đã gửi thành công!</h4>
                                            <p className="text-text-muted text-sm">
                                                Cảm ơn bạn đã đóng góp. Chúng tôi sẽ xem xét phản hồi của bạn sớm nhất.
                                            </p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmitFeedback} className="flex flex-col gap-5">
                                            <div className="flex gap-4">
                                                <label className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${feedbackType === "bug" ? "border-rose-500 bg-rose-500/10" : "border-border bg-background hover:bg-surface-hover"}`}>
                                                    <input type="radio" name="feedbackType" value="bug" checked={feedbackType === "bug"} onChange={() => setFeedbackType("bug")} className="hidden" />
                                                    <FontAwesomeIcon icon={faBug} className={`text-2xl mb-2 ${feedbackType === "bug" ? "text-rose-500" : "text-text-muted"}`} />
                                                    <span className={`font-semibold ${feedbackType === "bug" ? "text-text" : "text-text-muted"}`}>Báo lỗi</span>
                                                </label>
                                                <label className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${feedbackType === "feedback" ? "border-amber-500 bg-amber-500/10" : "border-border bg-background hover:bg-surface-hover"}`}>
                                                    <input type="radio" name="feedbackType" value="feedback" checked={feedbackType === "feedback"} onChange={() => setFeedbackType("feedback")} className="hidden" />
                                                    <FontAwesomeIcon icon={faLightbulb} className={`text-2xl mb-2 ${feedbackType === "feedback" ? "text-amber-500" : "text-text-muted"}`} />
                                                    <span className={`font-semibold ${feedbackType === "feedback" ? "text-text" : "text-text-muted"}`}>Góp ý tính năng</span>
                                                </label>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-text mb-2">Tiêu đề</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={feedbackTitle}
                                                    onChange={(e) => setFeedbackTitle(e.target.value)}
                                                    placeholder={feedbackType === "bug" ? "Ví dụ: Lỗi không thể tải ảnh lên" : "Ví dụ: Nên có thêm chế độ Dark Mode"}
                                                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-text placeholder-text-faint focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-text mb-2">Mô tả chi tiết</label>
                                                <textarea
                                                    required
                                                    value={feedbackDescription}
                                                    onChange={(e) => setFeedbackDescription(e.target.value)}
                                                    placeholder={feedbackType === "bug" ? "Vui lòng mô tả các bước để tái hiện lỗi này..." : "Chia sẻ thêm chi tiết về ý tưởng của bạn..."}
                                                    className="w-full h-32 px-4 py-3 rounded-xl bg-background border border-border text-text placeholder-text-faint focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                                                ></textarea>
                                            </div>

                                            <div className="flex justify-end pt-2">
                                                <button
                                                    type="submit"
                                                    disabled={!feedbackTitle.trim() || !feedbackDescription.trim() || isSubmitting}
                                                    className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                                >
                                                    {isSubmitting ? "Đang gửi..." : "Gửi phiếu"}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
