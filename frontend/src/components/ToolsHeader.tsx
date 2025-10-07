import React from 'react';

interface ToolsHeaderProps {
  onOpenMessagingModal: () => void;
  onOpenGroupFareModal: () => void;
  onOpenLaborTicketModal: () => void;
  onOpenNearestAirportModal: () => void;
  onOpenLookupModal: () => void;
}

const HeaderToolButton: React.FC<{ text: string; icon: React.ReactNode; onClick?: () => void, title?: string }> = ({ text, icon, onClick, title }) => (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all duration-200"
      title={title}
    >
      {icon}
      <span className="font-medium text-sm">{text}</span>
    </button>
);

export const ToolsHeader: React.FC<ToolsHeaderProps> = ({
  onOpenMessagingModal,
  onOpenGroupFareModal,
  onOpenLaborTicketModal,
  onOpenNearestAirportModal,
  onOpenLookupModal,
}) => {
  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 py-1">
        <div className="flex items-center space-x-1 flex-wrap">
            <HeaderToolButton
                text="Tin nhắn"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>}
                onClick={onOpenMessagingModal}
                title="Trích xuất thông tin, tạo tin nhắn và check-in từ booking"
            />
            <HeaderToolButton
                text="Công cụ Tra cứu GDS"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9 17.25v-3.162a4.5 4.5 0 00-3.364-4.243 3 3 0 01-1.26-2.595V5.25a3 3 0 013-3h10a3 3 0 013 3v2a3 3 0 01-1.26 2.595 4.5 4.5 0 00-3.364 4.243V17.25l-4-1.5-4 1.5z" /></svg>}
                onClick={onOpenLookupModal}
                title="Tra cứu TIMATIC, mã hóa/giải mã GDS, và các công cụ khác"
            />
             <HeaderToolButton
                text="Công cụ giá đoàn"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>}
                onClick={onOpenGroupFareModal}
                title="Phân tích và xuất file Excel cho yêu cầu giá đoàn"
            />
             <HeaderToolButton
                text="Xuất vé lao động"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a2 2 0 00-2 2v1H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2V4a2 2 0 00-2-2z" /></svg>}
                onClick={onOpenLaborTicketModal}
                title="Công cụ hỗ trợ xuất vé cho người lao động"
            />
            <HeaderToolButton
                text="Sân bay gần nhất"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.527-1.973c.218-.087.46-.168.707-.24a.75.75 0 01.707.707c-.072.247-.153.49-.24.707A2 2 0 0112 8v.5a1.5 1.5 0 01-1.5 1.5c-.526 0-.988-.27-1.268-.694a6.002 6.002 0 01-1.912 2.706 1.5 1.5 0 01-2.228-2.228z" clipRule="evenodd" /></svg>}
                onClick={onOpenNearestAirportModal}
                title="Tìm các sân bay quốc tế gần một địa điểm"
            />
        </div>
    </div>
  );
};
