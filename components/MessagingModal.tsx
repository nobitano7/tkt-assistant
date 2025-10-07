
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { type BookingInfo } from '../types';
import { parseBookingToMessages } from '../services/geminiService';
import { type Part } from '@google/genai';

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialBookingInfo: BookingInfo = {
  pnr: '',
  passengerName: '',
  ticketNumber: '',
  ticketingTimeLimit: '',
  bookingClass: '',
  frequentFlyer: '',
  vipInfo: '',
  itinerary: '',
};

// Helper function to convert a File object to a Gemini-compatible Part.
async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
}

const OutputBox: React.FC<{ title: string; content: string }> = ({ title, content }) => {
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    return (
        <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-slate-700">{title}</h4>
                <button 
                    onClick={handleCopy}
                    className="px-2 py-1 text-xs font-medium rounded bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors disabled:opacity-50"
                    disabled={!content}
                >
                    {copySuccess ? 'Đã chép!' : 'Sao chép'}
                </button>
            </div>
            <textarea
                readOnly
                value={content}
                rows={content.split('\n').length + 1}
                className="w-full text-sm bg-white border-slate-200 rounded p-2 resize-none font-mono focus:outline-none"
            />
        </div>
    );
};

export const MessagingModal: React.FC<MessagingModalProps> = ({ isOpen, onClose }) => {
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setInputText('');
      setAttachedFile(null);
      setBookingInfo(null);
      setError('');
    }
  }, [isOpen]);

  const handleAnalyze = async () => {
    if (!inputText.trim() && !attachedFile) {
        setError('Vui lòng nhập văn bản hoặc đính kèm tệp.');
        return;
    }
    setIsParsing(true);
    setError('');
    setBookingInfo(null);

    try {
        let content: string | Part[];
        if (attachedFile) {
            const filePart = await fileToGenerativePart(attachedFile);
            content = inputText.trim() ? [filePart, { text: inputText }] : [filePart];
        } else {
            content = inputText;
        }
      const parsedData = await parseBookingToMessages(content);
      setBookingInfo(parsedData);
    } catch (err) {
      console.error("Failed to parse booking:", err);
      setError('Không thể phân tích booking. Vui lòng kiểm tra lại nội dung.');
    } finally {
      setIsParsing(false);
    }
  };

  const { customerMessage, checkinMessage, checkinUrl } = useMemo(() => {
    if (!bookingInfo) return { customerMessage: '', checkinMessage: '', checkinUrl: '' };
    
    let customerMsg = `Mã đặt chỗ : ${bookingInfo.pnr}\n\n`;
    if (bookingInfo.passengerName) customerMsg += `Họ tên : ${bookingInfo.passengerName}\n`;
    if (bookingInfo.ticketNumber) {
        customerMsg += `Số vé : ${bookingInfo.ticketNumber}\n`;
    } else if (bookingInfo.ticketingTimeLimit) {
        customerMsg += `Hạn xuất vé : ${bookingInfo.ticketingTimeLimit}\n`;
    }
    if (bookingInfo.bookingClass) customerMsg += `Hạng đặt chỗ : ${bookingInfo.bookingClass}\n`;
    if (bookingInfo.frequentFlyer) customerMsg += `Số thẻ : ${bookingInfo.frequentFlyer}\n`;
    if (bookingInfo.vipInfo) customerMsg += `VIP - ${bookingInfo.vipInfo}\n`;
    if (bookingInfo.itinerary) customerMsg += `\nHành trình :\n${bookingInfo.itinerary}`;

    let checkinMsg = `Giữ chỗ, check in online\n\n`;
    if (bookingInfo.itinerary) checkinMsg += `Hành trình :\n${bookingInfo.itinerary}\n\n`;
    if (bookingInfo.pnr) checkinMsg += `Mã đặt chỗ : ${bookingInfo.pnr}\n\n`;
    if (bookingInfo.passengerName) checkinMsg += `Họ tên : ${bookingInfo.passengerName}\n`;
    if (bookingInfo.ticketNumber) {
        checkinMsg += `Số vé : ${bookingInfo.ticketNumber}\n`;
    } else if (bookingInfo.ticketingTimeLimit) {
        checkinMsg += `Hạn xuất vé : ${bookingInfo.ticketingTimeLimit}\n`;
    }
    if (bookingInfo.bookingClass) checkinMsg += `Hạng đặt chỗ : ${bookingInfo.bookingClass}\n`;
    
    // Check-in URL Logic
    let url = '';
    const checkinConfig: { [key: string]: { url: string, pnrParam?: string, nameParam?: string } } = {
        'VN': { url: 'https://www.vietnamairlines.com/vn/vi/check-in-online', pnrParam: 'pnr', nameParam: 'lastname' },
        'VJ': { url: 'https://www.vietjetair.com/vi/checkin' }, // No reliable params
        'QH': { url: 'https://www.bambooairways.com/vn-vi/lam-thu-tuc-truc-tuyen/', pnrParam: 'reservationCode', nameParam: 'lastName' },
        'VU': { url: 'https://www.vietravelairlines.com/vn/vi/checkin', pnrParam: 'recordLocator', nameParam: 'lastName' },
    };

    if (bookingInfo.itinerary && bookingInfo.passengerName && bookingInfo.pnr) {
        const firstItineraryLine = bookingInfo.itinerary.split('\n')[0];
        const flightNumberMatch = firstItineraryLine.match(/\|\s*([A-Z0-9]{2})\d+\s*\|/);
        const airlineCode = flightNumberMatch ? flightNumberMatch[1].toUpperCase() : null;

        const passengerNameParts = bookingInfo.passengerName.split('/');
        const lastName = passengerNameParts[0].trim();
        
        if (airlineCode && checkinConfig[airlineCode]) {
            const config = checkinConfig[airlineCode];
            if (config.pnrParam && config.nameParam && lastName) {
                const params = new URLSearchParams();
                params.append(config.pnrParam, bookingInfo.pnr);
                params.append(config.nameParam, lastName);
                url = `${config.url}?${params.toString()}`;
            } else {
                url = config.url; // Fallback for airlines without params (VJ)
            }
        }
    }

    return {
      customerMessage: customerMsg.trim(),
      checkinMessage: checkinMsg.trim(),
      checkinUrl: url
    };
  }, [bookingInfo]);
  
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setAttachedFile(file);
    }
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-sky-600">Tin nhắn - Check in</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <main className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
                Nhập/Dán nội dung hoặc tải lên tệp (Ảnh/PDF)
            </label>
            <textarea
                rows={4}
                className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2 resize-y focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                placeholder="Dán nội dung từ GDS hoặc email xác nhận đặt chỗ..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
            />
            {attachedFile && (
                <div className="mt-2 p-2 bg-slate-100 rounded-lg flex items-center justify-between text-sm">
                    <p className="font-medium text-slate-700 truncate">{attachedFile.name}</p>
                    <button onClick={handleRemoveFile} className="p-1 text-slate-500 hover:text-slate-800" aria-label="Remove file">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
          </div>
          
          {bookingInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                <OutputBox title="Tin nhắn gửi khách" content={customerMessage} />
                <OutputBox title="Tin nhắn check in" content={checkinMessage} />
            </div>
          )}

        </main>

        <footer className="p-4 border-t bg-slate-50 flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isParsing}
                    className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    <span>{attachedFile ? 'Thay đổi tệp' : 'Đính kèm tệp'}</span>
                </button>
                <div className="text-sm h-5">
                    {error && <p className="text-red-600 animate-fade-in">{error}</p>}
                </div>
            </div>
            <div className="flex items-center space-x-3">
                 <button 
                    onClick={() => window.open(checkinUrl, '_blank', 'noopener,noreferrer')} 
                    disabled={!checkinUrl}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 disabled:bg-slate-300 transition-all flex items-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    <span>Check in</span>
                </button>
                <button 
                    onClick={handleAnalyze} 
                    disabled={isParsing || (!inputText && !attachedFile)}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 disabled:bg-slate-300 transition-all flex items-center space-x-2"
                >
                    {isParsing ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                    )}
                    <span>Phân tích</span>
                </button>
            </div>
        </footer>
      </div>
    </div>
  );
};
