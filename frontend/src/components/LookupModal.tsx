import React, { useState, useEffect } from 'react';
import { runTimaticTool, runGdsEncoderTool } from '../services/apiService';

interface LookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatResult = (text: string) => {
    let html = text
      .replace(/```([\s\S]*?)```/g, '<pre class="rounded-md p-3 bg-slate-200 text-slate-800 font-mono text-xs">$1</pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-200 rounded px-1 py-0.5 font-mono">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');

    html = html.replace(/<pre(.*?)>([\s\S]*?)<\/pre>/g, (_match, p1, p2) => {
        return `<pre${p1}>${p2.replace(/<br \/>/g, '\n')}</pre>`;
    });
    return html;
};

const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors focus:outline-none ${
            isActive
                ? 'bg-white text-sky-600 border-slate-200 border-t border-x'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
        }`}
    >
        {children}
    </button>
);


const FormRow: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    {children}
  </div>
);

const ResultBox: React.FC<{ result: string; isLoading: boolean; error: string; title: string }> = ({ result, isLoading, error, title }) => (
    <div className="mt-4">
        <h3 className="text-md font-semibold text-slate-700 mb-2">{title}</h3>
        <div className="text-sm h-5 mb-2">{error && <p className="text-red-600 animate-fade-in">{error}</p>}</div>
        <div className="p-4 bg-white rounded-md border min-h-[100px] text-sm text-slate-800 leading-relaxed prose prose-sm max-w-none">
            {isLoading ? (
                <div className="flex items-center space-x-2 text-slate-500">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Đang tra cứu...</span>
                </div>
            ) : result ? (
                <div dangerouslySetInnerHTML={{ __html: formatResult(result) }} />
            ) : ( <p className="text-slate-400">Kết quả sẽ hiển thị ở đây.</p> )}
        </div>
    </div>
);

const EncoderTool: React.FC<{ tool: string; params: any; title: string; children: React.ReactNode }> = ({ tool, params, title, children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState('');

    const handleSearch = async () => {
        setIsLoading(true);
        setError('');
        setResult('');
        try {
            const response = await runGdsEncoderTool(tool, params);
            setResult(response.result);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="font-semibold text-slate-800 mb-3">{title}</h3>
            <div className="space-y-3">
                {children}
                <div className="flex justify-end">
                    <button onClick={handleSearch} disabled={isLoading} className="px-3 py-1.5 text-sm rounded-md bg-sky-600 text-white font-semibold hover:bg-sky-500 disabled:bg-slate-300 transition">
                        Tra cứu
                    </button>
                </div>
            </div>
            <ResultBox result={result} isLoading={isLoading} error={error} title="Kết quả" />
        </div>
    );
};


const TimaticTab: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState('');
    const [nationality, setNationality] = useState('');
    const [destination, setDestination] = useState('');
    const [transitPoints, setTransitPoints] = useState('');
    const [bookingText, setBookingText] = useState('');

    const handleSearch = async () => {
        setIsLoading(true);
        setError('');
        setResult('');
        try {
            if (!bookingText.trim() && (!nationality.trim() || !destination.trim())) {
                throw new Error('Vui lòng nhập booking hoặc điền quốc tịch và điểm đến.');
            }
            const transitArray = transitPoints.split(',').map(p => p.trim()).filter(Boolean);
            const response = await runTimaticTool(nationality, destination, transitArray, bookingText);
            setResult(response.timaticResult);

            if (response.extractedDetails) {
                setNationality(response.extractedDetails.nationality || nationality);
                setDestination(response.extractedDetails.destination || destination);
                setTransitPoints((response.extractedDetails.transitPoints || []).join(', '));
            }
        } catch (err: any) {
            setError(err.message || 'Đã xảy ra lỗi khi tra cứu.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-4">
             <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormRow label="Quốc tịch khách"><input type="text" value={nationality} onChange={e => setNationality(e.target.value)} className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" placeholder="Việt Nam" title="Quốc tịch trên hộ chiếu của khách" /></FormRow>
                    <FormRow label="Điểm đến (quốc gia)"><input type="text" value={destination} onChange={e => setDestination(e.target.value)} className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" placeholder="Mỹ" title="Quốc gia cuối cùng trong hành trình" /></FormRow>
                </div>
                <FormRow label="Điểm quá cảnh (cách nhau bởi dấu phẩy, nếu có)"><input type="text" value={transitPoints} onChange={e => setTransitPoints(e.target.value)} className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" placeholder="Nhật Bản, Hàn Quốc" title="Các quốc gia sẽ quá cảnh, cách nhau bởi dấu phẩy" /></FormRow>
                <FormRow label="Hoặc dán booking để tra cứu tự động">
                    <textarea 
                        rows={5} 
                        className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2 resize-y focus:ring-2 focus:ring-sky-500 focus:outline-none transition font-mono"
                        placeholder="Nếu có nội dung ở đây, hệ thống sẽ ưu tiên phân tích booking và bỏ qua các ô nhập bên trên."
                        value={bookingText} 
                        onChange={e => setBookingText(e.target.value)}
                        title="Dán nội dung booking để hệ thống tự động điền các trường trên"
                    />
                </FormRow>
                <div className="flex justify-end">
                    <button onClick={handleSearch} disabled={isLoading} className="px-4 py-2 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-500 disabled:bg-slate-300 transition-all flex items-center justify-center w-32" title="Bắt đầu tra cứu TIMATIC">
                         {isLoading ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Tra cứu'}
                    </button>
                </div>
            </div>
            <ResultBox result={result} isLoading={isLoading} error={error} title="Kết quả tra cứu TIMATIC" />
        </div>
    );
};

const EncoderTab: React.FC = () => {
    const [airlineQuery, setAirlineQuery] = useState('');
    const [equipCode, setEquipCode] = useState('');
    const [seatMapParams, setSeatMapParams] = useState({ flightNumber: '', date: '', segment: '' });
    const [currencyParams, setCurrencyParams] = useState({ amount: '100', from: 'USD', to: 'VND', date: '' });

    return (
        <div className="space-y-6">
            <EncoderTool tool="airline_airport_lookup" params={{ query: airlineQuery }} title="Tra cứu Hãng hàng không / Sân bay / Thành phố">
                <FormRow label="Nhập mã hoặc tên"><input type="text" value={airlineQuery} onChange={e => setAirlineQuery(e.target.value)} className="w-full text-sm border-slate-300 rounded-lg" placeholder="Ví dụ: VN, Vietnam Airlines, HAN, Hà Nội" /></FormRow>
            </EncoderTool>

            <EncoderTool tool="equipment_lookup" params={{ code: equipCode }} title="Tra cứu Loại máy bay">
                <FormRow label="Nhập mã máy bay"><input type="text" value={equipCode} onChange={e => setEquipCode(e.target.value)} className="w-full text-sm border-slate-300 rounded-lg" placeholder="Ví dụ: 321, 789" /></FormRow>
            </EncoderTool>

            <EncoderTool tool="seat_map_lookup" params={seatMapParams} title="Tra cứu Sơ đồ ghế ngồi">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormRow label="Số hiệu chuyến bay"><input type="text" value={seatMapParams.flightNumber} onChange={e => setSeatMapParams(p => ({ ...p, flightNumber: e.target.value }))} className="w-full text-sm border-slate-300 rounded-lg" placeholder="VN253" /></FormRow>
                    <FormRow label="Ngày bay"><input type="text" value={seatMapParams.date} onChange={e => setSeatMapParams(p => ({ ...p, date: e.target.value }))} className="w-full text-sm border-slate-300 rounded-lg" placeholder="25DEC" /></FormRow>
                    <FormRow label="Chặng bay"><input type="text" value={seatMapParams.segment} onChange={e => setSeatMapParams(p => ({ ...p, segment: e.target.value }))} className="w-full text-sm border-slate-300 rounded-lg" placeholder="HANSGN" /></FormRow>
                </div>
            </EncoderTool>

            <EncoderTool tool="currency_conversion" params={currencyParams} title="Quy đổi tiền tệ">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <FormRow label="Số tiền"><input type="text" value={currencyParams.amount} onChange={e => setCurrencyParams(p => ({ ...p, amount: e.target.value }))} className="w-full text-sm border-slate-300 rounded-lg" placeholder="100" /></FormRow>
                    <FormRow label="Từ"><input type="text" value={currencyParams.from} onChange={e => setCurrencyParams(p => ({ ...p, from: e.target.value }))} className="w-full text-sm border-slate-300 rounded-lg" placeholder="USD" /></FormRow>
                    <FormRow label="Sang"><input type="text" value={currencyParams.to} onChange={e => setCurrencyParams(p => ({ ...p, to: e.target.value }))} className="w-full text-sm border-slate-300 rounded-lg" placeholder="VND" /></FormRow>
                     <FormRow label="Ngày (bỏ trống = hôm nay)"><input type="text" value={currencyParams.date} onChange={e => setCurrencyParams(p => ({ ...p, date: e.target.value }))} className="w-full text-sm border-slate-300 rounded-lg" placeholder="25DEC" /></FormRow>
                </div>
            </EncoderTool>
        </div>
    );
};


export const LookupModal: React.FC<LookupModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'timatic' | 'encoder'>('timatic');

    useEffect(() => {
        if (!isOpen) {
           setActiveTab('timatic');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold text-sky-600">Công cụ Tra cứu GDS</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200" aria-label="Close modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                
                <main className="overflow-y-auto flex-1">
                     <div className="px-6 pt-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
                         <nav className="flex space-x-1">
                            <TabButton isActive={activeTab === 'timatic'} onClick={() => setActiveTab('timatic')}>TIMATIC</TabButton>
                            <TabButton isActive={activeTab === 'encoder'} onClick={() => setActiveTab('encoder')}>Mã hóa / Giải mã</TabButton>
                        </nav>
                    </div>
                     <div className="p-6">
                        {activeTab === 'timatic' && <TimaticTab />}
                        {activeTab === 'encoder' && <EncoderTab />}
                    </div>
                </main>
            </div>
        </div>
    );
};
