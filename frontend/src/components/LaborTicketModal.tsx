import React, { useState } from 'react';

interface LaborTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-colors focus:outline-none ${
            isActive
                ? 'bg-white text-sky-600 border-slate-200 border-t border-x'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
        }`}
    >
        {children}
    </button>
);

const CommandDisplay: React.FC<{
  title: string;
  command: string;
  description?: string;
  children?: React.ReactNode;
}> = ({ title, command, description, children }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(command).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
      <h4 className="font-semibold text-slate-700">{title}</h4>
      {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      <div className="mt-2 flex items-center space-x-2">
        <input
          type="text"
          readOnly
          value={command}
          className="w-full text-sm bg-slate-200 border-slate-300 rounded p-2 font-mono focus:outline-none"
        />
        <button
          onClick={handleCopy}
          className="px-3 py-2 text-xs font-medium rounded bg-slate-600 text-white hover:bg-slate-500 transition-colors whitespace-nowrap"
        >
          {copySuccess ? 'Đã chép!' : 'Chép'}
        </button>
      </div>
      {children && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
};


const TinhGiaTab: React.FC = () => {
    // FIX: Changed from useState to const as setters were unused.
    const fareBasis = 'L1YVN';
    const discount = '5';
    const altFareBasis = 'QOXVN';
    const altDiscount = '25';

    return (
        <div className="space-y-4">
            <h3 className="text-md font-semibold text-sky-700">Tính giá vé lao động</h3>
            <p className="text-sm text-slate-500">Chức năng này đang được phát triển.</p>
             <CommandDisplay
                title="Bước 1: Tạo Fare Quote"
                command={`FXX/R,UP,S2/ET/FB-${fareBasis}/D${discount}/AC-FB-${altFareBasis}/D${altDiscount}`}
                description="Lệnh này tạo một Fare Quote (Báo giá) cho phân đoạn 2, với các điều kiện về hạng giá và chiết khấu."
             />
        </div>
    );
};

export const LaborTicketModal: React.FC<LaborTicketModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('tinh-gia');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold text-sky-600">Công cụ Xuất vé Lao động</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200" aria-label="Close modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="flex-1 overflow-y-auto">
                    <div className="px-6 pt-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
                         <nav className="flex space-x-1">
                            <TabButton isActive={activeTab === 'tinh-gia'} onClick={() => setActiveTab('tinh-gia')}>Tính giá</TabButton>
                        </nav>
                    </div>
                    <div className="p-6">
                        {activeTab === 'tinh-gia' && <TinhGiaTab />}
                    </div>
                </main>
            </div>
        </div>
    );
};
