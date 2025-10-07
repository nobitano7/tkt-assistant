



import React, { useState, useEffect, useRef } from 'react';
import { parseGroupFareRequest } from '../services/apiService';
import type { GroupFareFlightInfo } from '../types';

declare const XLSX: any; // Use the global XLSX object from the script tag in index.html

interface GroupFareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TableInput: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; disabled?: boolean; }> = ({ value, onChange, disabled = false }) => (
    <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full text-sm bg-transparent p-1 focus:bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none rounded-md disabled:bg-slate-100 disabled:cursor-not-allowed"
    />
);


const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode, title?: string }> = ({ isActive, onClick, children, title }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-colors focus:outline-none ${
            isActive
                ? 'bg-white text-sky-600 border-slate-200 border-t border-x'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
        }`}
        title={title}
    >
        {children}
    </button>
);

const FarePreviewModal: React.FC<{ isOpen: boolean; onClose: () => void; htmlContent: string; title: string; }> = ({ isOpen, onClose, htmlContent, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <h2 className="text-lg font-bold text-slate-700">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200" aria-label="Close preview">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="flex-1 bg-slate-100 p-4 overflow-y-auto">
                    <iframe srcDoc={htmlContent} title={title} className="w-full h-full border-0 bg-white shadow-md" />
                </main>
            </div>
        </div>
    );
};

const initialManualEntry: Partial<GroupFareFlightInfo> = {
    agent: '',
    agentCode: '',
    quantity: '',
};

const VJ_AGENT_NAME = 'ABTRIP';
const VJ_AGENT_CODE = '37410181';

export const GroupFareModal: React.FC<GroupFareModalProps> = ({ isOpen, onClose }) => {
    const [inputText, setInputText] = useState('');
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [parsedFlights, setParsedFlights] = useState<GroupFareFlightInfo[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<'parser' | 'VNA' | 'VJ' | 'QH' | 'VU'>('parser');
    const [manualEntry, setManualEntry] = useState<Partial<GroupFareFlightInfo>>(initialManualEntry);
    const [manualParseText, setManualParseText] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');


    useEffect(() => {
        if (!isOpen) {
            setInputText('');
            setAttachedFile(null);
            setParsedFlights([]);
            setError('');
            setCopySuccess('');
            setActiveTab('parser');
            setManualEntry(initialManualEntry);
            setManualParseText('');
            setIsPreviewOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (activeTab === 'VJ') {
            setManualEntry(prev => ({
                ...prev,
                agent: VJ_AGENT_NAME,
                agentCode: VJ_AGENT_CODE,
            }));
            const needsUpdate = parsedFlights.length > 0 && parsedFlights.some(f => f.agent !== VJ_AGENT_NAME || f.agentCode !== VJ_AGENT_CODE);
            if (needsUpdate) {
                setParsedFlights(prev => prev.map(flight => ({
                    ...flight,
                    agent: VJ_AGENT_NAME,
                    agentCode: VJ_AGENT_CODE,
                })));
            }
        }
    }, [activeTab, parsedFlights]);


    const handleAnalyze = async () => {
        if (!inputText.trim() && !attachedFile) {
            setError('Vui lòng nhập văn bản hoặc đính kèm tệp.');
            return;
        }
        setIsParsing(true);
        setError('');
        setParsedFlights([]);

        try {
            const parsedData = await parseGroupFareRequest(inputText, attachedFile);
            if (activeTab === 'VJ') {
                setParsedFlights(parsedData.map(flight => ({
                    ...flight,
                    agent: VJ_AGENT_NAME,
                    agentCode: VJ_AGENT_CODE,
                })));
            } else {
                setParsedFlights(parsedData);
            }
        } catch (err) {
            console.error("Failed to parse group fare request:", err);
            setError('Không thể phân tích yêu cầu. Vui lòng kiểm tra lại nội dung.');
        } finally {
            setIsParsing(false);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && (file.type.startsWith('image/'))) {
            setAttachedFile(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRemoveFile = () => {
        setAttachedFile(null);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        // FIX: Correctly handle pasted files in the textarea.
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              setAttachedFile(file);
              e.preventDefault();
              return;
            }
          }
        }
    };
    
    const handleFlightInfoChange = (index: number, field: keyof GroupFareFlightInfo, value: string) => {
        const updatedFlights = [...parsedFlights];
        updatedFlights[index] = { ...updatedFlights[index], [field]: value };
        setParsedFlights(updatedFlights);
    };

    const handleManualEntryChange = (field: keyof typeof initialManualEntry, value: string) => {
        setManualEntry(prev => ({ ...prev, [field]: value }));
    };

    const handleParseAndAdd = async () => {
        if (!manualParseText.trim() && !attachedFile) {
            setError('Vui lòng nhập văn bản hoặc đính kèm tệp để phân tích.');
            return;
        }
        setIsParsing(true);
        setError('');

        try {
            const parsedData = await parseGroupFareRequest(manualParseText, attachedFile);
            
            const newFlights = parsedData.map(flight => {
                const agent = manualEntry.agent || flight.agent;
                const agentCode = manualEntry.agentCode || flight.agentCode;
                const quantity = manualEntry.quantity || flight.quantity;
                
                if (activeTab === 'VJ') {
                    return { ...flight, agent: VJ_AGENT_NAME, agentCode: VJ_AGENT_CODE, quantity };
                }
                return { ...flight, agent, agentCode, quantity };
            });

            setParsedFlights(prev => [...prev, ...newFlights]);
            setManualParseText('');
            setAttachedFile(null);

        } catch (err) {
            console.error("Failed to parse and add group fare request:", err);
            setError('Không thể phân tích yêu cầu. Vui lòng kiểm tra lại nội dung.');
        } finally {
            setIsParsing(false);
        }
    };
    
    const handleExportExcel = () => {
        if (parsedFlights.length === 0) return;

        let data, worksheet, fileName;
        const workbook = XLSX.utils.book_new();

        // --- Styling Definitions ---
        const border = {
            top: { style: 'thin', color: { rgb: "FF000000" } },
            bottom: { style: 'thin', color: { rgb: "FF000000" } },
            left: { style: 'thin', color: { rgb: "FF000000" } },
            right: { style: 'thin', color: { rgb: "FF000000" } },
        };

        const headerStyle = {
            font: { bold: true },
            alignment: { horizontal: 'center', vertical: 'center' },
            border,
            fill: { fgColor: { rgb: "FFE9ECEF" } } // Light grey
        };

        const cellStyle = {
            border,
            alignment: { vertical: 'center' }
        };

        const applyStyles = (ws: any, hasMergedHeader: boolean) => {
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let r = range.s.r; r <= range.e.r; ++r) {
                for (let c = range.s.c; c <= range.e.c; ++c) {
                    const cellAddress = XLSX.utils.encode_cell({ r, c });
                    let cell = ws[cellAddress];
                    if (!cell) {
                         ws[cellAddress] = { t: 's', v: '' };
                         cell = ws[cellAddress];
                    }

                    let styleToApply = cellStyle;
                    const headerRow = hasMergedHeader ? 1 : 0;
                    if (r < headerRow) {
                        // Merged row or empty cells above header
                        styleToApply = headerStyle;
                    } else if (r === headerRow) {
                        styleToApply = headerStyle;
                    }

                    cell.s = styleToApply;
                }
            }
             if (hasMergedHeader && ws['E1']) {
                ws['E1'].s = headerStyle;
            }
        };

        if (activeTab === 'VJ') {
            const header = [
                "Đại lý/ Cty", "MÃ AG/ CSGR", "SỐ LƯỢNG", "CODE",
                "HÀNH TRÌNH", "NGÀY", "GIỜ", "SHCB"
            ];
            const topHeader = ["", "", "", "", "CHẶNG BAY 1", null, null, null];

            data = parsedFlights.map(flight => [
                VJ_AGENT_NAME,
                VJ_AGENT_CODE,
                flight.quantity,
                "", // Code column is empty
                flight.itinerary,
                flight.date,
                flight.time,
                flight.flightNumber
            ]);
            
            worksheet = XLSX.utils.aoa_to_sheet([topHeader, header, ...data]);
            
            if (!worksheet['!merges']) worksheet['!merges'] = [];
            worksheet['!merges'].push({ s: { r: 0, c: 4 }, e: { r: 0, c: 7 } });

            applyStyles(worksheet, true);
            worksheet['!cols'] = [ { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 8 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 12 } ];

            fileName = "YeuCauGiaDoan_VJ.xlsx";
            XLSX.utils.book_append_sheet(workbook, worksheet, "YeuCauGiaDoan_VJ");

        } else {
            // Default export logic
            data = [
                ["STT", "Agent", "Mã Agent", "Số lượng", "Hành trình", "Ngày bay", "Giờ bay", "Số hiệu CB"],
                ...parsedFlights.map((flight, index) => [
                    index + 1,
                    flight.agent,
                    flight.agentCode,
                    flight.quantity,
                    flight.itinerary,
                    flight.date,
                    flight.time,
                    flight.flightNumber
                ])
            ];
            
            worksheet = XLSX.utils.aoa_to_sheet(data);
            applyStyles(worksheet, false);
            worksheet['!cols'] = [ { wch: 5 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 12 } ];

            fileName = "YeuCauGiaDoan.xlsx";
            XLSX.utils.book_append_sheet(workbook, worksheet, "YeuCauGiaDoan");
        }
        
        XLSX.writeFile(workbook, fileName);
    };
    
    const handleCopy = () => {
        const headers = ["STT", "Agent", "Mã Agent", "Số lượng", "Hành trình", "Ngày bay", "Giờ bay", "Số hiệu CB"];
        const headerString = headers.join('\t');
        const dataString = parsedFlights.map((flight, index) => 
            [index + 1, flight.agent, flight.agentCode, flight.quantity, flight.itinerary, flight.date, flight.time, flight.flightNumber].join('\t')
        ).join('\n');

        const fullString = `${headerString}\n${dataString}`;
        navigator.clipboard.writeText(fullString).then(() => {
            setCopySuccess('Đã sao chép!');
            setTimeout(() => setCopySuccess(''), 2500);
        });
    };
    
    const handlePreview = () => {
        if (parsedFlights.length === 0) return;

        let tableHtml = `<style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 20px; background-color: #f8f9fa; color: #212529; }
            table { border-collapse: collapse; width: 100%; font-size: 14px; border: 1px solid #dee2e6; }
            th, td { border: 1px solid #dee2e6; padding: 10px; text-align: left; }
            th { background-color: #e9ecef; font-weight: 600; }
            tr:nth-child(even) { background-color: #f8f9fa; }
            .merged-header { text-align: center; font-weight: bold; background-color: #e9ecef; }
        </style><table>`;

        if (activeTab === 'VJ') {
            const header = [
                "Đại lý/ Cty", "MÃ AG/ CSGR", "SỐ LƯỢNG", "CODE",
                "HÀNH TRÌNH", "NGÀY", "GIỜ", "SHCB"
            ];

            tableHtml += '<thead>';
            tableHtml += `<tr><td colspan="4"></td><td colspan="4" class="merged-header">CHẶNG BAY 1</td></tr>`;
            tableHtml += `<tr>${header.map(h => `<th>${h}</th>`).join('')}</tr>`;
            tableHtml += '</thead><tbody>';

            parsedFlights.forEach(flight => {
                const rowData = [
                    VJ_AGENT_NAME,
                    VJ_AGENT_CODE,
                    flight.quantity,
                    "", // Code
                    flight.itinerary,
                    flight.date,
                    flight.time,
                    flight.flightNumber
                ].map(d => `<td>${d}</td>`).join('');
                tableHtml += `<tr>${rowData}</tr>`;
            });
             tableHtml += '</tbody></table>';
        } else {
            const headers = ["STT", "Agent", "Mã Agent", "Số lượng", "Hành trình", "Ngày bay", "Giờ bay", "Số hiệu CB"];
            tableHtml += `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;

            parsedFlights.forEach((flight, index) => {
                const rowData = [
                    index + 1,
                    flight.agent,
                    flight.agentCode,
                    flight.quantity,
                    flight.itinerary,
                    flight.date,
                    flight.time,
                    flight.flightNumber
                ].map(d => `<td>${d}</td>`).join('');
                tableHtml += `<tr>${rowData}</tr>`;
            });
            tableHtml += '</tbody></table>';
        }

        setPreviewHtml(tableHtml);
        setIsPreviewOpen(true);
    };

    if (!isOpen) return null;

    return (
      <>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold text-sky-600">Công cụ Phân tích Yêu cầu giá đoàn</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200" aria-label="Close modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <main className="overflow-y-auto flex-1 bg-slate-50">
                     <div className="px-6 pt-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
                        <nav className="flex space-x-1">
                            <TabButton isActive={activeTab === 'parser'} onClick={() => setActiveTab('parser')} title="Sử dụng AI để phân tích tự do">Phân tích AI</TabButton>
                            <TabButton isActive={activeTab === 'VNA'} onClick={() => setActiveTab('VNA')} title="Sử dụng mẫu Excel cho Vietnam Airlines">VNA</TabButton>
                            <TabButton isActive={activeTab === 'VJ'} onClick={() => setActiveTab('VJ')} title="Sử dụng mẫu Excel cho Vietjet Air">VJ</TabButton>
                            <TabButton isActive={activeTab === 'QH'} onClick={() => setActiveTab('QH')} title="Sử dụng mẫu Excel cho Bamboo Airways">QH</TabButton>
                            <TabButton isActive={activeTab === 'VU'} onClick={() => setActiveTab('VU')} title="Sử dụng mẫu Excel cho Vietravel Airlines">VU</TabButton>
                        </nav>
                    </div>

                    <div className="p-6 space-y-6">
                        {activeTab === 'parser' ? (
                             <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">
                                    Nhập/Dán nội dung hoặc tải lên ảnh yêu cầu giá đoàn
                                </label>
                                <textarea
                                    rows={4}
                                    className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2 resize-y focus:ring-2 focus:ring-sky-500 focus:outline-none transition font-mono"
                                    placeholder="Dán nội dung hoặc ảnh yêu cầu giá đoàn tại đây..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onPaste={handlePaste}
                                    title="Dán nội dung hoặc ảnh yêu cầu giá đoàn để AI phân tích"
                                />
                                {attachedFile && (
                                    <div className="mt-2 p-2 bg-slate-100 rounded-lg flex items-center justify-between text-sm border">
                                        <p className="font-medium text-slate-700 truncate">{attachedFile.name}</p>
                                        <button onClick={handleRemoveFile} className="p-1 text-slate-500 hover:text-slate-800" aria-label="Remove file">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                             <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                                 <h3 className="font-semibold text-slate-700">Nhập thông tin cho <span className="text-sky-600">{activeTab}</span></h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <div>
                                        <label className="text-xs font-medium text-slate-500">Agent</label>
                                        <input type="text" value={manualEntry.agent || ''} onChange={e => handleManualEntryChange('agent', e.target.value)} className="w-full text-sm border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-sky-500 focus:outline-none disabled:bg-slate-100" disabled={activeTab === 'VJ'} />
                                     </div>
                                      <div>
                                        <label className="text-xs font-medium text-slate-500">Mã Agent</label>
                                        <input type="text" value={manualEntry.agentCode || ''} onChange={e => handleManualEntryChange('agentCode', e.target.value)} className="w-full text-sm border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-sky-500 focus:outline-none disabled:bg-slate-100" disabled={activeTab === 'VJ'}/>
                                     </div>
                                      <div>
                                        <label className="text-xs font-medium text-slate-500">Số lượng (Mặc định)</label>
                                        <input type="text" value={manualEntry.quantity || ''} onChange={e => handleManualEntryChange('quantity', e.target.value)} className="w-full text-sm border-slate-300 rounded-md p-2 focus:ring-1 focus:ring-sky-500 focus:outline-none" placeholder="Điền để áp dụng cho tất cả"/>
                                     </div>
                                </div>
                                <div className="pt-4 border-t">
                                    <label className="block text-sm font-medium text-slate-600 mb-1">
                                        Nhập/Dán 1 hoặc nhiều chuyến bay, hoặc đính kèm ảnh
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2 resize-y focus:ring-2 focus:ring-sky-500 focus:outline-none transition font-mono"
                                        placeholder={`VD:\nHAN-SGN 10/10/2025 14:45-16:50 ${activeTab}1143\nHAN-SGN 11/10/2025 14:45-16:50 ${activeTab}1143`}
                                        value={manualParseText}
                                        onChange={(e) => setManualParseText(e.target.value)}
                                        onPaste={handlePaste}
                                        title="Nhập hoặc dán thông tin chuyến bay theo từng dòng"
                                    />
                                     {attachedFile && (
                                        <div className="mt-2 p-2 bg-slate-100 rounded-lg flex items-center justify-between text-sm border">
                                            <p className="font-medium text-slate-700 truncate">{attachedFile.name}</p>
                                            <button onClick={handleRemoveFile} className="p-1 text-slate-500 hover:text-slate-800" aria-label="Remove file">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center mt-2">
                                        <button onClick={() => fileInputRef.current?.click()} disabled={isParsing} className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors flex items-center space-x-2 text-sm">
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span>{attachedFile ? 'Thay đổi ảnh' : 'Đính kèm ảnh'}</span>
                                        </button>
                                         <button onClick={handleParseAndAdd} disabled={isParsing || (!manualParseText && !attachedFile)} className="px-3 py-2 text-sm rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-500 transition-all flex items-center space-x-2 disabled:bg-slate-300" title="Phân tích và thêm các chuyến bay vào bảng kết quả">
                                            {isParsing ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                                            <span>Phân tích & Thêm</span>
                                        </button>
                                    </div>
                                </div>
                             </div>
                        )}
                        {parsedFlights.length > 0 && (
                            <div className="animate-fade-in">
                                <h3 className="text-md font-semibold text-sky-700 mb-3">Kết quả</h3>
                                <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
                                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-medium text-slate-600 uppercase tracking-wider w-[5%]">STT</th>
                                                <th className="px-3 py-2 text-left font-medium text-slate-600 uppercase tracking-wider w-[15%]">Agent</th>
                                                <th className="px-3 py-2 text-left font-medium text-slate-600 uppercase tracking-wider w-[10%]">Mã Agent</th>
                                                <th className="px-3 py-2 text-left font-medium text-slate-600 uppercase tracking-wider w-[10%]">Số lượng</th>
                                                <th className="px-3 py-2 text-left font-medium text-slate-600 uppercase tracking-wider w-[20%]">Hành trình</th>
                                                <th className="px-3 py-2 text-left font-medium text-slate-600 uppercase tracking-wider w-[15%]">Ngày bay</th>
                                                <th className="px-3 py-2 text-left font-medium text-slate-600 uppercase tracking-wider w-[10%]">Giờ bay</th>
                                                <th className="px-3 py-2 text-left font-medium text-slate-600 uppercase tracking-wider w-[15%]">Số hiệu CB</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {parsedFlights.map((flight, index) => (
                                                <tr key={index}>
                                                    <td className="px-3 py-2 text-center text-slate-500">{index + 1}</td>
                                                    <td className="px-2 py-1"><TableInput value={flight.agent} onChange={(e) => handleFlightInfoChange(index, 'agent', e.target.value)} disabled={activeTab === 'VJ'} /></td>
                                                    <td className="px-2 py-1"><TableInput value={flight.agentCode} onChange={(e) => handleFlightInfoChange(index, 'agentCode', e.target.value)} disabled={activeTab === 'VJ'} /></td>
                                                    <td className="px-2 py-1"><TableInput value={flight.quantity} onChange={(e) => handleFlightInfoChange(index, 'quantity', e.target.value)} /></td>
                                                    <td className="px-2 py-1"><TableInput value={flight.itinerary} onChange={(e) => handleFlightInfoChange(index, 'itinerary', e.target.value)} /></td>
                                                    <td className="px-2 py-1"><TableInput value={flight.date} onChange={(e) => handleFlightInfoChange(index, 'date', e.target.value)} /></td>
                                                    <td className="px-2 py-1"><TableInput value={flight.time} onChange={(e) => handleFlightInfoChange(index, 'time', e.target.value)} /></td>
                                                    <td className="px-2 py-1"><TableInput value={flight.flightNumber} onChange={(e) => handleFlightInfoChange(index, 'flightNumber', e.target.value)} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                <footer className="p-4 border-t bg-white flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                         {activeTab === 'parser' && (
                            <button onClick={() => fileInputRef.current?.click()} disabled={isParsing} className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span>{attachedFile ? 'Thay đổi ảnh' : 'Đính kèm ảnh'}</span>
                            </button>
                         )}
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        <div className="text-sm h-5">
                            {error && <p className="text-red-600 animate-fade-in">{error}</p>}
                        </div>
                    </div>
                     <div className="flex items-center space-x-3">
                         {parsedFlights.length > 0 && (
                            <div className="flex items-center space-x-3 animate-fade-in">
                                <div className="text-sm h-5">{copySuccess && <p className="text-green-600 font-semibold">{copySuccess}</p>}</div>
                                <button onClick={handlePreview} className="px-3 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                    <span>Xem trước</span>
                                </button>
                                <button onClick={handleCopy} className="px-3 py-2 rounded-lg bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 transition-all flex items-center space-x-2">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" /><path d="M3 5a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm5 9a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" /></svg>
                                    <span>Sao chép</span>
                                </button>
                                <button onClick={handleExportExcel} className="px-3 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 transition-all flex items-center space-x-2" title="Xuất bảng kết quả ra file Excel theo mẫu">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm6.293-6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                    <span>Xuất Excel</span>
                                </button>
                             </div>
                         )}
                         {activeTab === 'parser' && (
                             <button onClick={handleAnalyze} disabled={isParsing || (!inputText && !attachedFile)} className="px-4 py-2 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-500 disabled:bg-slate-300 transition-all flex items-center space-x-2 w-32 justify-center" title="Phân tích toàn bộ nội dung trong ô nhập liệu">
                                {isParsing ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                                    <span>Phân tích</span>
                                    </>
                                )}
                            </button>
                         )}
                    </div>
                </footer>
            </div>
        </div>
        <FarePreviewModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            htmlContent={previewHtml}
            title="Xem trước File Excel"
        />
      </>
    );
};
