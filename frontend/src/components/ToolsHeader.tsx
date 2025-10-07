import React from 'react';

interface ToolsHeaderProps {
  onOpenQuoteModal: () => void;
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
  onOpenQuoteModal,
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
                text="Tạo báo giá"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg>}
                onClick={onOpenQuoteModal}
                title="Tạo báo giá chi tiết từ PNR"
            />
            <HeaderToolButton
                text="Tạo tin nhắn"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>}
                onClick={onOpenMessagingModal}
                title="Trích xuất thông tin, tạo tin nhắn và check-in từ booking"
            />
             <HeaderToolButton
                text="Giá đoàn"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>}
                onClick={onOpenGroupFareModal}
                title="Phân tích và xuất file Excel cho yêu cầu giá đoàn"
            />
            <HeaderToolButton
                text="Tra cứu GDS & TIMATIC"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>}
                onClick={onOpenLookupModal}
                title="Tra cứu TIMATIC, mã hóa/giải mã GDS, và các công cụ khác"
            />
             <HeaderToolButton
                text="Vé lao động"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-1.082.217l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7a1 1 0 00-.217-1.082z" /></svg>}
                onClick={onOpenLaborTicketModal}
                title="Công cụ hỗ trợ xuất vé cho người lao động"
            />
            <HeaderToolButton
                text="Tìm sân bay"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>}
                onClick={onOpenNearestAirportModal}
                title="Tìm các sân bay quốc tế gần một địa điểm"
            />
        </div>
    </div>
  );
};