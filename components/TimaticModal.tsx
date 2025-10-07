
import React, { useState, useEffect } from 'react';
import { runTimaticTool, extractTimaticDetailsFromBooking } from '../services/geminiService';

interface TimaticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FormRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    {children}
  </div>
);

const formatResult = (text: string) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
    return html;
};

export const TimaticModal: React.FC<TimaticModalProps> = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState('');

    // State for all fields
    const [nationality, setNationality] = useState('');
    const [destination, setDestination] = useState('');
    const [transitPoints, setTransitPoints] = useState('');
    const [bookingText, setBookingText] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setIsLoading(false);
            setError('');
            setResult('');
            setNationality('');
            setDestination('');
            setTransitPoints('');
            setBookingText('');
        }
    }, [isOpen]);

    const handleSearch = async () => {
        setIsLoading(true);
        setError('');
        setResult('');

        try {
            if (bookingText.trim()) {
                // --- Analysis Workflow ---
                // FIX: extractTimaticDetailsFromBooking expects only one argument.
                const extractedDetails = await extractTimaticDetailsFromBooking(bookingText);
                if (!extractedDetails.nationality || !extractedDetails.destination) {
                    throw new Error('Không thể tự động xác định Quốc tịch hoặc Điểm đến từ booking.');
                }
                
                // Populate fields for user feedback
                setNationality(extractedDetails.nationality);
                setDestination(extractedDetails.destination);
                setTransitPoints(extractedDetails.transitPoints.join(', '));
                
                // Search with extracted details
                // FIX: runTimaticTool does not take apiKey as an argument.
                const timaticResult = await runTimaticTool(extractedDetails.nationality, extractedDetails.destination, extractedDetails.transitPoints);
                setResult(timaticResult);

            } else {
                // --- Manual Workflow ---
                const transitArray = transitPoints.split(',').map(p => p.trim()).filter(Boolean);
                if (!nationality.trim() || !destination.trim()) {
                    throw new Error('Vui lòng nhập Quốc tịch và Điểm đến.');
                }
                // FIX: runTimaticTool does not take apiKey as an argument. This also fixes the type error.
                const timaticResult = await runTimaticTool(nationality, destination, transitArray);
                setResult(timaticResult);
            }
        } catch (err: any) {
            console.error('Error in TIMATIC search:', err);
            setError(err.message || 'Đã xảy ra lỗi khi tra cứu. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold text-sky-600">Công cụ Tra cứu TIMATIC</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200" aria-label="Close modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                
                <main className="overflow-y-auto flex-1 p-6 space-y-4">
                     <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormRow label="Quốc tịch khách"><input type="text" value={nationality} onChange={e => setNationality(e.target.value)} className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" placeholder="Việt Nam" /></FormRow>
                            <FormRow label="Điểm đến (quốc gia)"><input type="text" value={destination} onChange={e => setDestination(e.target.value)} className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" placeholder="Mỹ" /></FormRow>
                        </div>
                        <FormRow label="Điểm quá cảnh (cách nhau bởi dấu phẩy, nếu có)"><input type="text" value={transitPoints} onChange={e => setTransitPoints(e.target.value)} className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" placeholder="Nhật Bản, Hàn Quốc" /></FormRow>
                        
                        <FormRow label="Hoặc dán booking để tra cứu tự động">
                            <textarea 
                                rows={5} 
                                className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2 resize-y focus:ring-2 focus:ring-sky-500 focus:outline-none transition font-mono"
                                placeholder="Nếu có nội dung ở đây, hệ thống sẽ ưu tiên phân tích booking và bỏ qua các ô nhập bên trên."
                                value={bookingText} 
                                onChange={e => setBookingText(e.target.value)}
                            />
                        </FormRow>

                        <div className="flex justify-end">
                            <button onClick={handleSearch} disabled={isLoading} className="px-4 py-2 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-500 disabled:bg-slate-300 transition-all flex items-center justify-center w-32">
                                 {isLoading ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Tra cứu'}
                            </button>
                        </div>
                    </div>

                    <div className="mt-4">
                         <h3 className="text-md font-semibold text-slate-700 mb-2">Kết quả tra cứu</h3>
                         <div className="text-sm h-5 mb-2">
                            {error && <p className="text-red-600 animate-fade-in">{error}</p>}
                         </div>
                        <div className="p-4 bg-white rounded-md border min-h-[150px] text-sm text-slate-800 leading-relaxed prose prose-sm max-w-none">
                            {isLoading && !result ? (
                                <div className="flex items-center space-x-2 text-slate-500">
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span>Đang tra cứu, vui lòng chờ...</span>
                                </div>
                            ) : result ? (
                                 <div dangerouslySetInnerHTML={{ __html: formatResult(result) }} />
                            ) : (
                                <p className="text-slate-400">Kết quả sẽ được hiển thị ở đây.</p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};