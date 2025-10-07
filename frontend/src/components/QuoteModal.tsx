import React, { useState, useEffect, useMemo } from 'react';
import { type QuoteData, type ItineraryGroup, type PriceRow } from '../types';
import { parsePnrToQuote } from '../services/apiService';
import { abtripLogo } from './Header';
import 'html-to-docx'; // Import for side effects if needed by the library

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Airport code to city name mapping
const airportCodes: { [key: string]: string } = {
  HAN: 'Hà Nội', SGN: 'TP. HCM', DAD: 'Đà Nẵng', CXR: 'Nha Trang', PQC: 'Phú Quốc',
  DLI: 'Đà Lạt', HPH: 'Hải Phòng', VCA: 'Cần Thơ', UIH: 'Quy Nhơn', VCL: 'Chu Lai',
  THD: 'Thanh Hóa', VII: 'Vinh', HUI: 'Huế', BMV: 'Buôn Ma Thuột', PXU: 'Pleiku',
  VKG: 'Rạch Giá', VCS: 'Côn Đảo', CAN: 'Quảng Châu', CDG: 'Paris', FCO: 'Rome'
};

const COMPANIES = {
  abtrip: {
    id: 'abtrip',
    name: 'Abtrip',
    logo: abtripLogo,
    fullName: 'CÔNG TY TNHH THƯƠNG MẠI DU LỊCH VÀ DỊCH VỤ HÀNG KHÔNG ABTRIP',
    address: 'Trụ sở chính: 16/61 Lạc Trung, ph. Vĩnh Tuy, Hà Nội<br/>Chi nhánh: Tầng 3, nhà ga T2, sân bay Quốc tế Nội Bài, Hà Nội',
    contact: 'Tel: 024.3987.7580/Ext: 101 – 103 | Hotline: 0868.320.320 / 0869.320.320<br/>Email: Info@abtrip.vn | Website: www.abtrip.vn',
    bankInfo: `- Công Ty TNHH Thương Mại Du lịch và Dịch Vụ Hàng Không AB trip<br/>- VND: 100040217<br/>- Ngân hàng thương mại cổ phần xuất nhập khẩu Việt Nam (EXIMBANK)- Chi nhánh Cầu Giấy`,
    signer: 'ĐỖ THU HẰNG',
    priceMarkup: 0
  },
  thanhviet: {
    id: 'thanhviet',
    name: 'Thành Việt',
    logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5NiIgaGVpZHRoPSI0OCIgdmlld0JveD0iMCAwIDk2IDQ4Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMwMDY1QjIiIGQ9Ik0zMC4wMjYgNDcuNTI4Yy0uMzk2LjYxOC0xLjE1NS44MjQtMS43NzMuNDI3bC0yMC4xMS0xMy4xMDljLS42MTktLjM5Ni0uODI1LTEuMTU1LS40MjgtMS43NzNsMTMuMTEtMjAuMTExYy4zOTYtLjYxOCAxLjE1NS0uODI0IDEuNzczLS40MjdsMjAuMTEgMTMuMTEuMDEzLS4wMDhjLjYxOC4zOTYgLjgyNCAxLjE1NS40MjcgMS43NzNsLTEzLjEgMjAuMTEtLjAxMi0uMDA5Wm0uMDUyLTEuODQ2bDExLjg5MS0xOC4yNTUtMTguMjU1LTExLjg5MUw0LjgyIDI3LjQyNGwxMy40MTIgOC43NDcgMTEuODQ2LTcuNzM3LS4wMDkuMDE0Wm0tMTUuNTA5LTIzLjgxM2wtNS42NDQgOC42NzYtOC42NzYtNS42NDQgMTguNzAxLTEyLjE4MSAxMi4xODEgMTguN2wtOC42NzYtNS42NDQtNS42NDQgOC42NzYtMi44Mi00LjMzOEwyNS45MyAxMy41bC00LjMzOC0yLjgyWiIvPjxwYXRoIGZpbGw9IiMwMDY1QjIiIGQ9Ik02My41MDcgNDIuNTE3VjUuNTI3aDYuNTYydjM3SDYzLjUwN1ptMTQuMjQ1IDBWNS41MjdoNi40OTV2MjEuMzQ4bC0uMTQxLjE0djE1LjQ0aC02LjM1NFoiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNNjMuNTA3IDQyLjUxN1Y1LjUyN2g2LjU2MnYzN0g2My41MDdabTE0LjI0NSAwVjUuNTI3aDYuNDk1djIxLjM0OGwtLjE0MS4xNHYxNS40NGgtNi4zNTRaIi8+PHBhdGggZmlsbD0iIzAwNjVCMiIgZD0iTTc3Ljc1MiA0Mi41MTd2LTguNThoNC4yODJ2LTUuNTI3aC00LjI4MnYtOS40ODNoLTUuOTM4djI5LjEzNGwxLjY1Ni0uMDAxWiIvPjxnPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik03Ny43NTIgNDIuNTE3di04LjU4aDQuMjgydi01LjUyN2gtNC4yODJ2LTkuNDgzaC01LjkzOHYyOS4xMzRsMS42NTYtLjAwMVoiLz48L2c+PC9nPjwvc3ZnPg==',
    fullName: 'THANH VIET TRAVEL AGENT-TOURS, WORLD WIDE TICKETING',
    fullNameInPayment: 'Công ty TNHH Thương mại và Du lịch Thành Việt',
    address: '28N Phạm Hồng Thái - Hà Nội',
    contact: 'Hot lines: 0904800225 / 0971800225 | Tel: (84.4) 39275720 | Email: truongvoyages@gmail.com',
    bankInfo: `- Tại Ngân Hàng: Ngân hàng TMCP Ngoại Thương Việt Nam<br/>- Số tài khoản: VND 0011004183919`,
    signer: 'Nguyễn Văn Quyết',
    priceMarkup: 280000
  },
  skyteam: {
    id: 'skyteam',
    name: 'Skyteam',
    logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZHRoPSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMGE5ZTciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNi41IDEzLjVDNSA5IDggMyAxMyAzYzQgMCA3IDMuNSA3IDd2NCI+PC9wYXRoPjxwYXRoIGQ9Ik0xNy41IDEwLjVDMTkgMTUgMTYgMjEgMTEgMjFjLTQgMC03LTMuNS03LTd2LTQiPjwvcGF0aD48L3N2Zz4=',
    fullName: 'CÔNG TY CỔ PHẦN VÉ MÁY BAY SKYTEAM',
    address: 'Địa chỉ: [Địa chỉ Skyteam]',
    contact: 'Tel: [SĐT Skyteam] | Email: [Email Skyteam]',
    bankInfo: `- Tên tài khoản: [Tên TK Skyteam]<br/>- Số tài khoản: [Số TK Skyteam]<br/>- Ngân hàng: [Ngân hàng Skyteam]`,
    signer: 'ĐỖ THU HẰNG',
    priceMarkup: 430000
  },
   hongngochah: {
    id: 'hongngochah',
    name: 'Hồng Ngọc Hà',
    logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyODAgODAiPjxwYXRoIGQ9Ik00MCw3MCBDODAsNTUgMTIwLDU1IDE2MCw3MCIgc3Ryb2tlPSIjMDU3RUE5IiBzdHJva2Utd2lkdGg9IjYiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNNTUsNDMgTDI1LDQzIEw0MCwxMyBaIiBmaWxsPSIjREIyNzI4Ii8+PHBhdGggZD0iTTc1LDQzIEwxMDUsNDMgTDkwLDEzIFoiIGZpbGw9IiNEQjI3MjgiLz48dGV4dCB4PSIxMDUiIHk9IjU1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDBweCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwMDAiPmhvbmduZ29jaGE8L3RleHQ+PC9zdmc+',
    fullName: 'PHÒNG VÉ HỒNG NGỌC HÀ',
    address: '30 Phan Chu Trinh Str, Hoan Kiem Dist., Ha Noi, Vietnam',
    contact: 'Tel: (84-4) 39275720 | Fax: (84-4) 39275719',
    bankInfo: `- Chủ TK: Công ty TNHH XD TM DL Hồng Ngọc Hà - Chi nhánh Hà Nội<br/>- Số TK: 19027508046665<br/>- Tại ngân hàng: Ngân hàng thương mại cổ phần kỹ thương Việt Nam (Techcombank - Hội sở)`,
    signer: 'TRẦN VĂN LINH',
    priceMarkup: 190000
  }
};


function numberToWordsVietnamese(number: number): string {
    const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const teens = ["mười", "mười một", "mười hai", "mười ba", "mười bốn", "mười lăm", "mười sáu", "mười bảy", "mười tám", "mười chín"];
    const tens = ["", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];
    const powers = ["", "nghìn", "triệu", "tỷ"];

    if (number === 0) return "Không đồng";

    let numStr = String(Math.floor(number));
    if (numStr.length > 12) return "Số quá lớn";

    let result = [];
    let powerIndex = 0;

    while (numStr.length > 0) {
        let block = numStr.length > 3 ? numStr.slice(-3) : numStr;
        numStr = numStr.length > 3 ? numStr.slice(0, -3) : "";

        let h = parseInt(block.length > 2 ? block[0] : '0');
        let t = parseInt(block.length > 1 ? block.slice(-2, -1) : '0');
        let u = parseInt(block.slice(-1));

        let blockText = [];

        if (h > 0) {
            blockText.push(units[h], "trăm");
        }

        if (t > 1) {
            blockText.push(tens[t]);
            if (u === 1) blockText.push("mốt");
            else if (u === 4) blockText.push("tư");
            else if (u === 5) blockText.push("lăm");
            else if (u > 0) blockText.push(units[u]);
        } else if (t === 1) {
            blockText.push(teens[u]);
        } else { // t === 0
            if (h > 0 && u > 0) blockText.push("linh");
            if (u > 0) blockText.push(units[u]);
        }
        
        if (blockText.length > 0) {
            if (powerIndex > 0) {
                blockText.push(powers[powerIndex]);
            }
            result.unshift(blockText.join(" "));
        }
        
        powerIndex++;
    }

    let finalResult = result.join(" ");
    return finalResult.charAt(0).toUpperCase() + finalResult.slice(1) + " đồng";
}

const initialQuoteState: QuoteData = {
  customerName: '',
  itineraryGroups: [],
  totalInWords: '',
  signerName: 'ĐỖ THU HẰNG',
  notes: '- Hoàn vé phí 100usd, thay đổi phí 100usd và chênh lệch giá trả thêm nếu có\n- Quý khách vui lòng kiểm tra lại trước khi xuất vé',
};

const FormRow: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    {children}
  </div>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h3 className="text-md font-semibold text-sky-700 border-b border-slate-200 pb-2 mb-4">{title}</h3>
);

interface Preview {
    id: string;
    companyName: string;
    htmlContent: string;
    plainTextContent: string;
    customerName: string;
}

interface QuotePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    previews: Preview[];
}

const QuotePreviewModal: React.FC<QuotePreviewModalProps> = ({ isOpen, onClose, previews }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');
    const [activeTabId, setActiveTabId] = useState(previews.length > 0 ? previews[0].id : '');
    
    useEffect(() => {
        if (isOpen && previews.length > 0) {
            setActiveTabId(previews[0].id);
        }
    }, [isOpen, previews]);

    const activePreview = useMemo(() => {
        return previews.find(p => p.id === activeTabId);
    }, [activeTabId, previews]);


    const handleDownloadDocx = async () => {
        if (!activePreview) return;
        setIsDownloading(true);
        try {
            // Use the global htmlToDocx from the script tag
            const htmlToDocx = (window as any).htmlToDocx;
            if (!htmlToDocx) {
                throw new Error('html-to-docx library is not loaded.');
            }
            
            const fileData = await htmlToDocx(activePreview.htmlContent, null, {
                margins: { top: 720, right: 720, bottom: 720, left: 720 },
            });
            
            const blob = fileData instanceof Blob ? fileData : new Blob([fileData]);
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const customerFileName = activePreview.customerName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const companyFileName = activePreview.companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `BaoGia_${companyFileName}_${customerFileName || 'KH'}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error('Failed to download DOCX:', err);
            alert('Không thể tải file DOCX. Vui lòng thử lại.');
        } finally {
            setIsDownloading(false);
        }
    };
    
    const handleCopyToClipboard = async () => {
        if (!activePreview) return;
        try {
            const blobHtml = new Blob([activePreview.htmlContent], { type: 'text/html' });
            const blobText = new Blob([activePreview.plainTextContent], { type: 'text/plain' });
            const clipboardItem = new (window as any).ClipboardItem({
                'text/html': blobHtml,
                'text/plain': blobText,
            });
            await navigator.clipboard.write([clipboardItem]);
            setCopySuccess('Đã sao chép vào clipboard!');
            setTimeout(() => setCopySuccess(''), 3000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            alert('Lỗi sao chép. Vui lòng thử lại.');
        }
    };

    if (!isOpen || !activePreview) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <h2 className="text-lg font-bold text-slate-700">Xem trước Báo giá</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200" aria-label="Close preview">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                 <div className="px-4 border-b bg-slate-50">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        {previews.map(preview => (
                            <button
                                key={preview.id}
                                onClick={() => setActiveTabId(preview.id)}
                                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                                    activeTabId === preview.id
                                        ? 'border-sky-500 text-sky-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                                aria-current={activeTabId === preview.id ? 'page' : undefined}
                            >
                                {preview.companyName}
                            </button>
                        ))}
                    </nav>
                </div>
                <main className="flex-1 bg-slate-200 p-4 overflow-y-auto">
                    <div className="bg-white shadow-lg mx-auto">
                        <iframe srcDoc={activePreview.htmlContent} title={`${activePreview.companyName} Báo giá xem trước`} className="w-full h-[75vh] border-0" />
                    </div>
                </main>
                <footer className="p-4 border-t bg-slate-50 flex justify-between items-center rounded-b-xl">
                    <div className="text-sm h-5">{copySuccess && <p className="text-green-600 font-semibold animate-fade-in">{copySuccess}</p>}</div>
                    <div className="flex items-center space-x-3">
                        <button onClick={handleCopyToClipboard} className="px-4 py-2 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-500 transition-all flex items-center space-x-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" /><path d="M3 5a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm5 9a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" /></svg><span>Sao chép</span></button>
                        <button onClick={handleDownloadDocx} disabled={isDownloading} className="px-4 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 disabled:bg-slate-300 transition-all flex items-center space-x-2">{isDownloading ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 8.586V3a1 1 0 10-2 0v5.586L8.707 7.293zM3 11a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>}<span>Tải file DOCX</span></button>
                    </div>
                </footer>
            </div>
        </div>
    );
}

const generateDefaultQuoteHtml = (data: QuoteData, company: any, total: number) => {
    const today = new Date();
    const formattedDate = `Hà Nội, ngày ${String(today.getDate()).padStart(2, '0')} tháng ${String(today.getMonth() + 1).padStart(2, '0')} năm ${today.getFullYear()}`;
    const formatCurrency = (value: number) => value > 0 ? value.toLocaleString('vi-VN') : '0';

    const detailsHtml = data.itineraryGroups.map((group) => {
        const itineraryRows = group.itineraryDetails.split('\n').filter(line => line.trim()).map(line => {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length < 3) return `<tr><td colspan="4">${line}</td></tr>`;
            const [flightInfo, date, time] = parts;
            const flightParts = flightInfo.split(' ');
            const flightNumber = flightParts.slice(0, 2).join(' ');
            const route = flightParts.slice(2).join(' ');
            const [originCode, destCode] = route.split('-');
            const originCity = airportCodes[originCode] || originCode;
            const destCity = airportCodes[destCode] || destCode;
            const formattedRoute = `${originCity} (${originCode}) - ${destCity} (${destCode})`;
            return `<tr><td class="text-center">${flightNumber}</td><td class="text-left">${formattedRoute}</td><td class="text-center">${date}</td><td class="text-center">${time}</td></tr>`;
        }).join('');

        const itineraryTable = `<p class="section-subtitle"><strong>Hành trình:</strong></p><table><thead><tr><th class="text-center" style="width: 20%;">Chuyến bay</th><th class="text-center">Chặng bay</th><th class="text-center" style="width: 15%;">Ngày bay</th><th class="text-center" style="width: 20%;">Thời gian</th></tr></thead><tbody>${itineraryRows}</tbody></table>`;
        
        const passengerRows = group.priceRows.map(row => `<tr><td class="text-left">${row.flightClass}</td><td class="text-left">${row.passengers.replace(/, /g, '<br>')}</td></tr>`).join('');
        const passengerTable = `<p class="section-subtitle"><strong>Hành khách:</strong></p><table><thead><tr><th class="text-center" style="width: 30%;">Hạng vé</th><th class="text-center">Tên hành khách</th></tr></thead><tbody>${passengerRows}</tbody></table>`;

        return `<div class="itinerary-group">${itineraryTable}${passengerTable}</div>`;
    }).join('');

    const allPriceRows = data.itineraryGroups.flatMap(g => g.priceRows);
    const priceTableHtml = allPriceRows.map(row => {
        const base = parseFloat(row.baseFare.replace(/[^0-9]/g, '')) || 0;
        const tax = parseFloat(row.taxes.replace(/[^0-9]/g, '')) || 0;
        const fee = parseFloat(row.serviceFee.replace(/[^0-9]/g, '')) || 0;
        const pax = parseInt(row.paxCount, 10) || 1;
        const unitPrice = base + tax + fee;
        const rowTotal = unitPrice * pax;
        return `<tr><td class="text-left">${row.flightClass}</td><td class="text-right">${formatCurrency(base)}</td><td class="text-right">${formatCurrency(tax)}</td><td class="text-right">${formatCurrency(fee)}</td><td class="text-right">${formatCurrency(unitPrice)}</td><td class="text-center">${row.paxCount}</td><td class="text-right">${formatCurrency(rowTotal)}</td></tr>`;
    }).join('');

    return `
<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>Báo giá vé máy bay</title><style>
body{font-family:Arial,sans-serif;font-size:12px;color:#333;max-width:800px;margin:auto;padding:20px;background-color:#fff;}
p{margin:4px 0;line-height:1.5;}
.header{display:flex;align-items:center;gap:15px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;margin-bottom:15px;}
.company-name{font-weight:bold;font-size:13px;}
.quote-title{text-align:center;font-size:24px;margin:25px 0;color:#000;font-weight:bold;letter-spacing:1px;}
.section-title{font-size:14px;margin-top:25px;font-weight:bold;color:#111827;}
.section-subtitle{margin-top:15px;margin-bottom:8px;}
table{width:100%;border-collapse:collapse;margin-top:5px;}
th,td{border:1px solid #e5e7eb;padding:8px;vertical-align:top;}
thead,th{background-color:#f9fafb;font-weight:bold;color:#374151;}
th{text-align:center;}
.text-left{text-align:left;}
.text-right{text-align:right;}
.text-center{text-align:center;}
.itinerary-group:not(:first-child){margin-top:20px;}
.totals-section{margin-top:15px;display:flex;justify-content:flex-end;}
.totals-box{width:50%;}
.total-amount{font-weight:bold;display:flex;justify-content:space-between;border-top:1px solid #ccc;padding-top:8px;}
.total-in-words{font-style:italic;font-weight:bold;display:flex;justify-content:space-between;padding-top:4px;}
.footer{margin-top:40px;display:flex;justify-content:space-between;align-items:flex-end;gap:20px;}
.footer-notes{font-style:italic;font-size:11px;flex:1;}
.footer-signature{text-align:center;flex-shrink:0;}
</style></head><body>
<div class="header">
  <div><img src="${company.logo}" alt="${company.name} Logo" style="height: 40px; width: auto;" /></div>
  <div>
    <p class="company-name">${company.fullName}</p>
    <p>${company.address}</p>
    <p>${company.contact}</p>
  </div>
</div>
<h2 class="quote-title">BÁO GIÁ</h2>
<p><strong>Kính gửi:</strong> ${data.customerName}</p>
<p>${company.fullName} trân trọng gửi tới quý khách báo giá vé máy bay chi tiết như sau:</p>
<p class="section-title">1. Tên khách và hành trình:</p>
${detailsHtml}
<p class="section-title">2. Giá vé:</p>
<table>
  <thead><tr><th>Hạng</th><th>Giá vé</th><th>Thuế</th><th>Phí DV</th><th>Đơn giá</th><th>Số khách</th><th>Tổng tiền</th></tr></thead>
  <tbody>${priceTableHtml}</tbody>
</table>
<div class="totals-section">
  <div class="totals-box">
      <p class="total-amount"><span>Tổng số tiền thanh toán (VND):</span> <span>${formatCurrency(total)}</span></p>
      <p class="total-in-words"><span>Bằng chữ:</span> <span>${data.totalInWords}</span></p>
  </div>
</div>
<p class="section-title">Thanh toán:</p>
<p>${company.bankInfo.replace(/\n/g, '<br/>')}</p>
<div class="footer">
  <div class="footer-notes">
    <p style="margin:0;">${data.notes.replace(/\n/g, '<br/>')}</p>
  </div>
  <div class="footer-signature">
    <p style="margin: 0;">${formattedDate}</p>
    <p style="margin: 8px 0; font-weight: bold;">XIN TRÂN TRỌNG CẢM ƠN!</p>
    <p style="margin-top: 70px; font-weight: bold;">${company.signer}</p>
  </div>
</div>
</body></html>`;
};


const generateThanhVietQuoteHtml = (data: QuoteData, company: any, total: number) => {
    const today = new Date();
    const formattedDateForSign = `Ngày ${String(today.getDate()).padStart(2, '0')} tháng ${String(today.getMonth() + 1).padStart(2, '0')} năm ${today.getFullYear()}`;
    const formattedDateForHeader = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const formatCurrency = (value: number) => value.toLocaleString('vi-VN');

    const allPriceRows = data.itineraryGroups.flatMap(g => g.priceRows);
    const totalPax = allPriceRows.reduce((sum, row) => sum + (parseInt(row.paxCount, 10) || 0), 0);
    const unitPrice = totalPax > 0 ? total / totalPax : 0;
    
    // Aggregate data for display
    const allPassengers = allPriceRows.map(r => r.passengers).join(', ').split(', ').map(p => p.trim()).filter(Boolean);
    const allFlightLinesRaw = data.itineraryGroups.flatMap(g => g.itineraryDetails.split('\n')).filter(line => line.trim());
    const firstItinerary = data.itineraryGroups[0]?.itineraryDetails || '';
    const firstRouteMatch = firstItinerary.match(/([A-Z]{3})-([A-Z]{3})/);
    let quoteSubject = 'vé máy bay';
    let hànhTrìnhSubject = '';
    if (firstRouteMatch) {
        const originCity = airportCodes[firstRouteMatch[1]] || firstRouteMatch[1];
        const destCity = airportCodes[firstRouteMatch[2]] || firstRouteMatch[2];
        quoteSubject = `${originCity} – ${destCity} – ${originCity}`; // Assuming round trip for subject
        hànhTrìnhSubject = `${firstRouteMatch[1]} – ${firstRouteMatch[2]} – ${firstRouteMatch[1]}`;
    }

    const passengerHtml = allPassengers.map((name, index) => `${index + 1}.${name}`).join('<br/>');
    const flightHtml = allFlightLinesRaw.map((line, index) => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length < 3) return `${index + 1}.${line}`;
        const [flightInfo, date, time] = parts;
        const flightParts = flightInfo.split(' ');
        const flightNumber = flightParts.slice(0, 2).join(' ');
        const route = flightParts.slice(2).join('').replace('-', '');
        const [depTime, arrTime] = time.split('-').map(t => t.replace(':', ''));
        return `${index + 1 + allPassengers.length}.${flightNumber} ${date} ${route} ${depTime} ${arrTime}`;
    }).join('<br/>');
    
    return `
<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>Báo giá - ${company.name}</title><style>
body{font-family:'Times New Roman',Times,serif;font-size:13px;color:#000;max-width:800px;margin:auto;padding:20px;line-height:1.5;}
p{margin:5px 0;}
.header{display:flex;justify-content:space-between;border-bottom:2px dotted #000;padding-bottom:10px;margin-bottom:10px;align-items:flex-start;}
.header-left{display:flex;align-items:center;gap:10px;}
.header-right p{margin:0;font-size:11px;text-align:right;}
.company-info p{margin:0;font-size:12px;font-weight:bold;color:#0065b2;}
.quote-title{text-align:center;font-size:24px;margin:25px 0;font-weight:bold;}
.info-grid{display:grid;grid-template-columns:120px 1fr;margin:3px 0;}
.info-grid strong{grid-column:1;}
.info-grid span{grid-column:2;}
.details-table{width:100%;border-collapse:collapse;margin:15px 0;}
.details-table th, .details-table td{border:1px solid #000;padding:5px;vertical-align:top;font-size:13px;}
.details-table th{font-weight:bold;}
.notes{padding-left:20px;}
.footer{margin-top:20px;text-align:right;}
.signature{margin-top:80px;font-weight:bold;}
</style></head><body>
<div class="header">
  <div class="header-left">
    <img src="${company.logo}" alt="${company.name} Logo" style="height: 60px; width: auto;" />
    <div class="company-info">
      <p>${company.fullName}</p>
      <p>ĐẠI LÝ VÉ MÁY BAY VÀ DU LỊCH</p>
      <p>28N Phạm Hồng Thái - Hà Nội</p>
    </div>
  </div>
  <div class="header-right">
    <img src="data:image/png;base64,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" alt="Vietnam Airlines Logo" style="height: 25px; width: auto; margin-bottom: 5px;"/>
    <p>Hot lines: ${company.contact.split('|')[0].trim()}</p>
    <p>Tel: ${company.contact.split('|')[1].trim()}</p>
    <p>Email: ${company.contact.split('|')[2].trim()}</p>
  </div>
</div>
<h2 class="quote-title">BÁO GIÁ</h2>
<div class="info-grid"><strong>Kính gửi:</strong> <span>${data.customerName}</span></div>
<div class="info-grid"><strong>Ngày:</strong> <span>${formattedDateForHeader}</span></div>
<div class="info-grid"><strong>Báo giá:</strong> <span>${quoteSubject}</span></div>
<br/>
<p>Xin trân trọng cảm ơn Quý cơ quan đã lựa chọn dịch vụ của chúng tôi, chúng tôi xin gửi tới Quý cơ quan hành trình và giá vé phù hợp với dự kiến mà Quý cơ quan đã đề xuất.</p>
<p><strong>Hành trình:</strong> ${hànhTrìnhSubject}</p>

<table class="details-table">
  <thead><tr><th style="width:50%;">Tên khách</th><th>Chuyến bay</th></tr></thead>
  <tbody><tr>
    <td style="vertical-align:top;">${passengerHtml}</td>
    <td style="vertical-align:top;">${flightHtml}</td>
  </tr></tbody>
</table>
<p><strong>Giá vé:</strong> ${formatCurrency(unitPrice)} /1 khách - hành lý 1 kiện 23kg</p>
<p><strong>Tổng số:</strong> ${formatCurrency(unitPrice)} x ${totalPax} = ${formatCurrency(total)}</p>
<br/>
<p><strong>Lưu ý:</strong></p>
<div class="notes">${data.notes.replace(/\n/g, '<br/>')}</div>
<br/>
<p><strong>Tên công ty:</strong> ${company.fullNameInPayment || company.fullName}</p>
<p><strong>Tại Ngân Hàng:</strong> ${company.bankInfo.split('<br/>')[0]?.replace('- Tại Ngân Hàng: ', '')}</p>
<p><strong>Số tài khoản:</strong> ${company.bankInfo.split('<br/>')[1]?.replace('- Số tài khoản: ', '')}</p>
<br/>
<p>Chúng tôi rất hân hạnh được hợp tác cùng Quý cơ quan.</p>
<div class="footer">
    <p>${formattedDateForSign}</p>
    <p class="signature">${company.signer}</p>
</div>
</body></html>`;
};

const generateHongNgocHaQuoteHtml = (data: QuoteData, company: any, total: number) => {
    const today = new Date();
    const formattedDate = `Hà Nội, ngày ${String(today.getDate()).padStart(2, '0')} tháng ${String(today.getMonth() + 1).padStart(2, '0')} năm ${today.getFullYear()}`;
    const formatCurrency = (value: number) => value > 0 ? value.toLocaleString('vi-VN') : '0';

    const allItineraries = data.itineraryGroups.flatMap(g => 
      g.itineraryDetails.split('\n').filter(Boolean).map(line => {
        const parts = line.split('|');
        const flightInfo = parts[0]?.trim();
        const route = flightInfo?.split(' ').slice(2).join(' ') || '';
        return route;
      })
    ).join(' - ');

    let totalBase = 0;
    let totalTax = 0;
    let totalFee = 0;
    let totalPax = 0;
    
    data.itineraryGroups.forEach(group => {
        group.priceRows.forEach(row => {
            const pax = parseInt(row.paxCount, 10) || 0;
            totalPax += pax;
            totalBase += (parseFloat(row.baseFare.replace(/[^0-9]/g, '')) || 0);
            totalTax += (parseFloat(row.taxes.replace(/[^0-9]/g, '')) || 0);
            const feeFromForm = parseFloat(row.serviceFee.replace(/[^0-9]/g, '')) || 0;
            totalFee += (feeFromForm + company.priceMarkup);
        });
    });
    
    // For HNH template, we show per-pax price, so we divide by totalPax if it exists
    const perPaxBase = totalPax > 0 ? totalBase / totalPax : 0;
    const perPaxTax = totalPax > 0 ? totalTax / totalPax : 0;
    const perPaxFee = totalPax > 0 ? totalFee / totalPax : 0;
    const totalPerRow = perPaxBase + perPaxTax + perPaxFee;
    const grandTotal = totalPerRow * totalPax;

    return `
<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>Báo giá - ${company.name}</title><style>
body{font-family:'Times New Roman',Times,serif;font-size:11pt;color:#000;max-width:900px;margin:auto;padding:10px;background-color:#fff;}
table{width:100%;border-collapse:collapse;border:1px solid #000; font-size: 11pt;}
td,th{border:1px solid #000;padding:5px;vertical-align:middle;height:25px;}
.header-table td{border:none;vertical-align:top;}
.company-name{font-size:12pt;font-weight:bold; color: #A52A2A;}
.company-contact{font-size:10pt; color: #000;}
.quote-title{text-align:center;font-size:16pt;margin:15px 0;font-weight:bold;}
.info-row td{border:none;padding:3px 0;}
.main-table th{font-weight:bold;text-align:center;}
.main-table td{text-align:right;}
.main-table td:first-child{text-align:center;}
.total-label{font-weight:bold;}
.footer-table td{border:none;padding:2px 0;}
.signature-container{width:50%; float:right; text-align:center;}
.signature{margin-top:70px;font-weight:bold;}
</style></head><body>
<table class="header-table">
  <tr>
    <td style="width:30%;"><img src="${company.logo}" alt="Logo" style="width:200px;"/></td>
    <td style="width:70%; text-align:center;">
        <div class="company-name">${company.fullName}</div>
        <div>${company.address}</div>
        <div class="company-contact">${company.contact}</div>
    </td>
  </tr>
</table>
<h2 class="quote-title">BÁO GIÁ</h2>
<table class="info-row">
    <tr>
        <td style="width:100px;"><strong>Kính gửi:</strong></td>
        <td><strong>${data.customerName || 'Quý Khách Hàng'}</strong></td>
    </tr>
     <tr>
        <td colspan="2">Phòng vé máy bay Hồng Ngọc Hà gửi tới quý cơ quan báo giá hành trình trên hãng không Vietnam Airlines như sau:</td>
    </tr>
</table>
<br/>
<table class="main-table">
    <thead>
        <tr>
            <th rowspan="2">Hành trình</th>
            <th colspan="3">Giá vé</th>
            <th rowspan="2">Số lượng</th>
            <th rowspan="2">Tổng cộng</th>
        </tr>
        <tr>
            <th>Giá vé</th>
            <th>Thuế</th>
            <th>Phí DV</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>${allItineraries}</td>
            <td>${formatCurrency(perPaxBase)}</td>
            <td>${formatCurrency(perPaxTax)}</td>
            <td>${formatCurrency(perPaxFee)}</td>
            <td style="text-align:center;">${totalPax}</td>
            <td>${formatCurrency(grandTotal)}</td>
        </tr>
         <tr>
            <td><strong>Tỷ giá : 24820</strong></td>
            <td colspan="4" class="total-label" style="text-align:right;">Tổng tiền (VND)</td>
            <td><strong>${formatCurrency(grandTotal)}</strong></td>
        </tr>
    </tbody>
</table>
<br/>
<table class="footer-table">
    <tr><td>${data.notes.replace(/\n/g, '<br/>')}</td></tr>
</table>
<br/>
<table class="footer-table">
  <tr><td colspan="2"><strong>Thông tin tài khoản</strong></td></tr>
  <tr><td style="width:150px; text-align:left;"><strong>Chủ TK</strong></td><td style="text-align:left;">: ${company.bankInfo.split('<br/>')[0].replace('- Chủ TK: ', '')}</td></tr>
  <tr><td style="text-align:left;"><strong>Số TK</strong></td><td style="text-align:left;">: ${company.bankInfo.split('<br/>')[1].replace('- Số TK: ', '')}</td></tr>
  <tr><td style="text-align:left;"><strong>Tại ngân hàng</strong></td><td style="text-align:left;">: ${company.bankInfo.split('<br/>')[2].replace('- Tại ngân hàng: ', '')}</td></tr>
</table>
<br/>
<table class="footer-table">
  <tr><td style="text-align:left;">Chúng tôi rất hân hạnh được hợp tác cùng Quý cơ quan.</td></tr>
</table>

<div class="signature-container">
    <p>${formattedDate}</p>
    <p><strong>Thay mặt phòng vé</strong></p>
    <p class="signature">${company.signer}</p>
</div>
</body></html>`;
};


export const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose }) => {
  const [pnrText, setPnrText] = useState('');
  const [quoteData, setQuoteData] = useState<QuoteData>(initialQuoteState);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<Preview[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setPnrText('');
      setQuoteData(initialQuoteState);
      setError('');
      setIsPreviewOpen(false);
    }
  }, [isOpen]);

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuoteData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, groupIndex: number, rowIndex: number) => {
      const { name, value } = e.target;
      setQuoteData(prev => {
          const newGroups = JSON.parse(JSON.stringify(prev.itineraryGroups));
          if (name === 'itineraryDetails') {
              newGroups[groupIndex][name] = value;
          } else {
              newGroups[groupIndex].priceRows[rowIndex][name as keyof PriceRow] = value;
          }
          return { ...prev, itineraryGroups: newGroups };
      });
  };

  const handleAnalyzePnr = async () => {
    if (!pnrText.trim()) {
        setError('Vui lòng dán nội dung booking vào ô.'); return;
    }
    setIsParsing(true); setError('');
    try {
      const parsedData = await parsePnrToQuote(pnrText);
      const newItineraryGroups = parsedData.itineraryGroups.map(group => ({
          itineraryDetails: group.itineraryDetails.replace(/\\n/g, '\n'),
          priceRows: group.priceRows.map(row => {
               // Robustly count passengers from numbered and un-numbered lists.
              const isNumberedList = row.passengers.match(/^\s*\d+\./m);
              const paxCount = isNumberedList 
                  ? (row.passengers.match(/^\s*\d+\./gm) || []).length
                  : (row.passengers.split(',').filter(p => p.trim()).length || 1);
              return {
                  ...row,
                  baseFare: '',
                  taxes: '',
                  serviceFee: '',
                  paxCount: String(paxCount || 1)
              };
          })
      }));
      setQuoteData(prev => ({ ...prev, itineraryGroups: newItineraryGroups, customerName: prev.customerName || '' }));
    } catch (err) {
      console.error("Failed to parse PNR:", err);
      setError('Không thể phân tích booking. Vui lòng kiểm tra lại nội dung.');
    } finally {
      setIsParsing(false);
    }
  };

  const baseTotalPrice = useMemo(() => {
    return quoteData.itineraryGroups.reduce((currentTotal, group) => {
        return currentTotal + group.priceRows.reduce((groupTotal, row) => {
            const base = parseFloat(row.baseFare.replace(/[^0-9]/g, '')) || 0;
            const tax = parseFloat(row.taxes.replace(/[^0-9]/g, '')) || 0;
            const fee = parseFloat(row.serviceFee.replace(/[^0-9]/g, '')) || 0;
            const pax = parseInt(row.paxCount, 10) || 0;
            return groupTotal + (base + tax + fee) * pax;
        }, 0);
    }, 0);
  }, [quoteData.itineraryGroups]);

  useEffect(() => {
    if (baseTotalPrice > 0) {
      setQuoteData(prev => ({ ...prev, totalInWords: numberToWordsVietnamese(baseTotalPrice) }));
    } else {
      setQuoteData(prev => ({ ...prev, totalInWords: '' }));
    }
  }, [baseTotalPrice]);

  const handlePreview = () => {
    if (!quoteData.customerName || baseTotalPrice <= 0) {
      setError('Vui lòng điền Tên khách hàng và thông tin giá vé.'); return;
    }
    setError(''); 
    
    const generatedPreviews = Object.values(COMPANIES).map(company => {
        const companyQuoteData = JSON.parse(JSON.stringify(quoteData));
        let companyTotalPrice = 0;

        companyQuoteData.itineraryGroups.forEach((group: ItineraryGroup) => {
            group.priceRows.forEach((row: PriceRow) => {
                const base = parseFloat(row.baseFare.replace(/[^0-9]/g, '')) || 0;
                const tax = parseFloat(row.taxes.replace(/[^0-9]/g, '')) || 0;
                const fee = parseFloat(row.serviceFee.replace(/[^0-9]/g, '')) || 0;
                const pax = parseInt(row.paxCount, 10) || 1;

                const newFee = fee + (company.priceMarkup || 0);
                row.serviceFee = String(newFee); 
                companyTotalPrice += (base + tax + newFee) * pax;
            });
        });
        
        companyQuoteData.totalInWords = numberToWordsVietnamese(companyTotalPrice);
        
        let html;
        if (company.id === 'thanhviet') {
            html = generateThanhVietQuoteHtml(companyQuoteData, company, companyTotalPrice);
        } else if (company.id === 'hongngochah') {
            html = generateHongNgocHaQuoteHtml(companyQuoteData, company, companyTotalPrice);
        } else {
            html = generateDefaultQuoteHtml(companyQuoteData, company, companyTotalPrice);
        }

        const plainText = `BÁO GIÁ VÉ MÁY BAY - ${company.name}\n...\nTổng tiền: ${companyTotalPrice.toLocaleString('vi-VN')} VND`;

        return {
            id: company.id,
            companyName: company.name,
            htmlContent: html,
            plainTextContent: plainText,
            customerName: companyQuoteData.customerName
        };
    });
    
    setPreviewData(generatedPreviews);
    setIsPreviewOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
          <header className="p-4 border-b flex justify-between items-center"><h2 className="text-lg font-bold text-sky-600">Tạo Báo Giá Vé Chi Tiết</h2><button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200" aria-label="Close modal"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></header>
          <main className="p-6 overflow-y-auto flex-1 space-y-6">
            <div><label htmlFor="pnrInput" className="block text-sm font-medium text-slate-600 mb-1">Dán nội dung booking tại đây và nhấn nút Phân tích</label><div className="flex items-start space-x-2"><textarea id="pnrInput" rows={5} className="w-full text-sm bg-slate-50 border border-slate-300 rounded-lg p-2 resize-y focus:ring-2 focus:ring-sky-500 focus:outline-none transition font-mono" placeholder="Dán toàn bộ nội dung của các PNR..." value={pnrText} onChange={(e) => setPnrText(e.target.value)} /><button onClick={handleAnalyzePnr} disabled={isParsing} className="p-2 h-full rounded-lg bg-sky-600 text-white hover:bg-sky-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center" aria-label="Phân tích booking">{isParsing ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>}</button></div></div>
            <div className="space-y-6">
              <div><SectionHeader title="Thông tin khách hàng" /><FormRow label="Kính gửi (Tên KH / Công ty)"><input type="text" name="customerName" value={quoteData.customerName} onChange={handleGeneralChange} className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" placeholder="BAN TÔN GIÁO CHÍNH PHỦ" /></FormRow></div>
              {quoteData.itineraryGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="p-4 border border-slate-200 rounded-lg">
                  <SectionHeader title={`Hành trình ${quoteData.itineraryGroups.length > 1 ? groupIndex + 1 : ''}`} />
                  <FormRow label="Chi tiết hành trình"><textarea name="itineraryDetails" rows={5} value={group.itineraryDetails} onChange={(e) => handleNestedChange(e, groupIndex, 0)} className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 font-mono" /></FormRow>
                  {group.priceRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="mt-4 pt-4 border-t">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormRow label="Hạng vé"><input type="text" name="flightClass" value={row.flightClass} onChange={(e) => handleNestedChange(e, groupIndex, rowIndex)} className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" /></FormRow>
                            <FormRow label="Tên hành khách"><textarea name="passengers" rows={2} value={row.passengers} onChange={(e) => handleNestedChange(e, groupIndex, rowIndex)} className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" /></FormRow>
                       </div>
                       <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <FormRow label="Giá vé (Base fare)"><input type="text" name="baseFare" value={row.baseFare} onChange={(e) => handleNestedChange(e, groupIndex, rowIndex)} className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" placeholder="15000000" /></FormRow>
                          <FormRow label="Thuế & Phí"><input type="text" name="taxes" value={row.taxes} onChange={(e) => handleNestedChange(e, groupIndex, rowIndex)} className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" placeholder="5000000" /></FormRow>
                          <FormRow label="Phí dịch vụ"><input type="text" name="serviceFee" value={row.serviceFee} onChange={(e) => handleNestedChange(e, groupIndex, rowIndex)} className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" placeholder="200000" /></FormRow>
                          <FormRow label="Số khách"><input type="text" name="paxCount" value={row.paxCount} onChange={(e) => handleNestedChange(e, groupIndex, rowIndex)} className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" placeholder="1" /></FormRow>
                       </div>
                    </div>
                  ))}
                </div>
              ))}
              <div>
                  <SectionHeader title="Tổng hợp giá (VND) - Gốc (Abtrip)" />
                  <div className="mt-4 p-3 bg-sky-50 rounded-lg flex items-center justify-end space-x-6 text-sm">
                      <div className="text-slate-600">Tổng tiền: <span className="font-bold text-sky-600 text-lg">{baseTotalPrice.toLocaleString('vi-VN')} VND</span></div>
                  </div>
                  <div className="mt-4"><FormRow label="Bằng chữ"><input type="text" name="totalInWords" value={quoteData.totalInWords} readOnly className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 bg-slate-50 italic" /></FormRow></div>
              </div>
              <div>
                <SectionHeader title="Thông tin khác" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormRow label="Người báo giá (Chung)">
                        <input type="text" name="signerName" value={quoteData.signerName} onChange={handleGeneralChange} className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" placeholder="ĐỖ THU HẰNG" />
                    </FormRow>
                    <FormRow label="Ghi chú / Lưu ý">
                        <textarea name="notes" rows={4} value={quoteData.notes} onChange={handleGeneralChange} className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500" />
                    </FormRow>
                </div>
              </div>
            </div>
          </main>
          <footer className="p-4 border-t bg-slate-50 flex justify-between items-center">
            <div className="text-sm h-5">{error && <p className="text-red-600 animate-fade-in">{error}</p>}</div>
            <button onClick={handlePreview} className="px-4 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-500 disabled:bg-slate-300 transition-all flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
              <span>Xem trước & Xuất file</span>
            </button>
          </footer>
        </div>
      </div>
      <QuotePreviewModal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        previews={previewData} 
      />
    </>
  );
};
