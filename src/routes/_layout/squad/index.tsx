import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faArrowLeft, faHouse } from '@fortawesome/free-solid-svg-icons';

const SquadPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0D111D] border border-[#20283A] rounded-[20px] p-8 shadow-2xl text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-[16px] bg-[rgba(255,176,32,0.1)] border border-[rgba(255,176,32,0.3)] text-[#FFB020] flex items-center justify-center text-3xl shadow-lg shadow-amber-500/10">
                    <FontAwesomeIcon icon={faClock} />
                </div>

                <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full bg-[#121827] border border-[#20283A] text-[#8B93A7] text-[10px] font-black uppercase tracking-wider">
                        Phát triển hệ thống
                    </span>
                    <h2 className="text-xl font-black text-[#F1F3F7] uppercase tracking-tight">
                        Tính Năng Tổ Đội Tạm Ẩn
                    </h2>
                    <p className="text-xs text-[#8B93A7] leading-relaxed">
                        Tính năng Tổ Đội (Squad) đang được phát triển nâng cấp và sẽ ra mắt trong phiên bản sắp tới.
                    </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/" })}
                        className="w-full py-3 px-4 rounded-[12px] bg-[#FFB020] hover:bg-[#ffa500] text-black font-extrabold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
                    >
                        <FontAwesomeIcon icon={faHouse} />
                        <span>Quay Về Trang Chủ</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/community" })}
                        className="w-full py-2.5 px-4 rounded-[12px] bg-[#121827] hover:bg-[#1A2130] border border-[#20283A] text-[#8B93A7] hover:text-[#F1F3F7] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span>Khám Phá Cộng Đồng</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Route = createFileRoute('/_layout/squad/')(
    { component: SquadPage }
);
