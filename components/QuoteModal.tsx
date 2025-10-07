
import React, { useState, useEffect, useMemo } from 'react';
import { type QuoteData, type ItineraryGroup, type PriceRow } from '../types';
import { parsePnrToQuote } from '../services/geminiService';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Airport code to city name mapping
const airportCodes: { [key: string]: string } = {
  HAN: 'Hà Nội', SGN: 'TP. HCM', DAD: 'Đàẵng', CXR: 'Nha Trang', PQC: 'Phú Quốc',
  DLI: 'Đà Lạt', HPH: 'Hải Phòng', VCA: 'Cần Thơ', UIH: 'Quy Nhơn', VCL: 'Chu Lai',
  THD: 'Thanh Hóa', VII: 'Vinh', HUI: 'Huế', BMV: 'Buôn Ma Thuột', PXU: 'Pleiku',
  VKG: 'Rạch Giá', VCS: 'Côn Đảo', CAN: 'Quảng Châu', CDG: 'Paris', FCO: 'Rome'
};

const COMPANIES = {
  abtrip: {
    id: 'abtrip',
    name: 'Abtrip',
    logo: 'data:image/png;base64,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a/4j/9v+K//D/Yf+I/6D/7P8Z/zX/sP/4/zD/sv/4/wj/9P8S/wz/iP9Q/6T/BP+I/5D/Gv/g/4j/Av+Q/wH/6P9a/5D/5P/4/wj/7P84/9D/KP+Q/wj/6P8a/5D/GP/4/9L/nP8a/+D/Af94/4j/EP84/zX/5v8S/xH/4P85/8D/KP85/xH/OP96/+n/Sf9o/9H/IP96/+n/4P8R/xH/wv+S/yj/Av9Z/yj/KP+K/9D/JP96/4j/wv+i/yj/Av9o//D/X/8G/8j/Bv/g/yj/vP96/4j/Nf+C/yz/4P96/wX/Vf9o/9n/GP/o/4D/gv8w//D/pP+i/zn/BP9Z/3n/GP/w/6D/BP/k/wj/GP8C/+n/5P8w/+j/5v8Z/+D/CP/S/zX/Mv/i/zn/Nf8y/5L/JP8S/6L/Nf+C/yT/NP+K/yT/5v/4/4r/OP8w/4L/BP/5/4D/Iv8y/5D/+P9q/5r/IP8w/6L/NP8w/7L/Qf84/9H/Qv9B/2n/Rf9B/5v/4f/Z/yn/Qf9B/9H/Iv8B/6L/IP8y//D/5P+I/9L/ov+i/zD/Iv/a/5L/CP/Z/4r/Af+C/9n/Kv/i/2n/BP/5/7L/JP/p/1X/Cf9S/wn/lP/Q/9D//D/4/zH/iP8A/wn/cP+i/yD/Iv8w/2H/KP8w/+D/4f+Q/9D/Uv9a/7r/Vf9K/0X/pf8B/7L/Yf9S/1X/Rf+6/2H/Qf9x/yz/4v/6/8j/Af9h/2n/Mv9i/yD/5P8C/9L/4P/A/wX/Af8a/yD/sv+w/2n/CP+C/yz/4P/4/7L/NP9I/2n/mv/A/7r/sv+6/6j/AP/Z/4L/EP8A/8j/OP8R/0j/Iv8x/yj/4P8I//D/af85/1n/FP/g/4L/OP/6/4r/Qf9a/zn/Ef8y/1n/JP8R/1H/Of8S/0j/Mf9S/3n/4v/6/+n/IP/6/0j/IP8x/xH/wv9I/yn/5v9Z//D/Vf9Z/wX/wf8S/yj/Qv9Z/yz/Cf9a/xH/Iv/S/7r/Of/w/6D/JP85/9D/MP/6/7L/4f+S/4L/OP/6/7L/Iv8J/zD/4f8q/9D/IP/6/zX/QP+C/zn/Nf/w/5D/5v8S/+D/5P/i/5r/Af9a/4j/wf/Q/wj/6P8A/wj/JP84/yT/Sf9o/1n/wf8y/0X/Ef9R/1n/JP8R/zn/JP9o/xD/Sf9a/2n/Sf9x/5v/AP85/7r/NP9J/zH/JP+Q/7L/OP9I/5v/JP+Q/4L/Iv8y/+D/4P85/9L/IP/Y/0j/Yf8a/1H/vP96/5r/EP9B/7r/Sf/Z/5D/If8a/+j/CP9J/5D/KP96/0n/4P/5//D/LP9B/0n/Iv9i/9n/BP8a/5D/Yf9Y/5D/Iv9Z/7L/5v/S/zX/mv+Q/zn/Ef9J/4j/GP8R/zD/WP/S/0X/Mf8S/zD/Qf8I/0X/JP9o/1H/GP9B/1X/GP85/4j/JP9R/4j/Af9B/5D/Iv8a/wj/Qf9C/5L/KP+Q/5r/Qf8y/5D/6P8h//D/Sf8w/yH/4v8Z/+D/IP9Z//D/Af/5/5L/CP/Z/wj/8f+i/wX/6P96/wH/BP+S/5D/4P96/wH/Cf9x/yz/CP8C//D/GP+K/yj/6P+Y/yH/CP+C/+D/IP/w/yH/8v+S/yH/8v+Q/wX/5v/i/2n/Iv+S/xH/wf9h/zH/CP9a/yj/Qv9h/2n/IP9B/2n/wf8a/0H/4P/Q/9n/KP/w/9H/IP9h/7L/8v+Q/zD/EP8y/yD/5P8C/8j/mv+A/1X/CP/w/0n/If/6/9L/4P8y//D/BP8A/yH/BP+i/9L/Sf+A/9n/Av+I/4L/KP+C/0n/Ef/6/wj/EP+Y/4j/CP/6/4j//D/gv8j/ov+S/yj/Gv/S/yT/8P9B/zn/4P8a/0j/FP/S/xD/Wf+C/4j/Af85/wj/8f8i/zn/4v8R/3n/BP8B/2H/Ev/6/wX/4f8y/zX/EP9h/yT/4P+C/4j/+P9Z/5r/AP/6/4j/Af9Z/9n/Uv9a/6D/Uv9x/zD/sv/5/4D/wf8A/1X/Af+a/+X/wv/Q/+X/Mf/Q/wj/AP96/zD/Uf9B/8D/AP9q/wX/Af8S/3n/Ev9Y/3n/Ev95/0n/Ef/Q/7L/BP8y/1n/Sf9C/6D/Af9Z/5D/Uv8Q/0H/Iv/5/4D/CP9R/wj/FP8S/yH/kv+S/yH/Wf9Y/1H/CP/4/4r/Av+S/wH/4P8S/yz/EP/g/+n/Iv/4/4j/Af/w/+D/CP/S/wj/6P8A/5L/wf8y/yT/Qf9Z/xD/4v/a/5L/4v9B/5v/Mf9R/5D/8f8I/zD/4v9R/7L/JP9x/9n/IP9h/1n/IP+Q/+n/6P8Q/zD/4v/Q/yj/OP9h/4D/GP9B/+D/4f+Q/0j/KP9h/3n/4v/6/4L/CP85/8D/4f9h/zn/4P9S/+X/BP/5/3n/4P9h/3n/4v8Q/9D/AP/6/9n/CP/w/+n/EP9h/+D/4v/6/4L/CP9S/5v/vP96/7L/NP/g/7L/Mv/i/1X/Qf9x/wj/4v+S/4j/FP9Z/3n/8f8w/xD/Wf9h/wj/5v8S/yT/8v+Q/4j/CP8S/5L/BP/k/wn/Yv9S/0n/Of9J/6D/Uv95/5D/5P9h/5r/Sf/5/0n/Vf/6/7L/NP+I/6j/GP9Y/xD/8P8a/+D/4P8C/6j/Iv+Y/+j/5P9Z/yj/Av/w/wH/6P96/4j/AP+Q/6j/AP/Q/4j/AP96/wj/6P+Y/wj/6P/5/2n/Cf/4/+D/Av/Q/wn/Mv+Q/4j/wf9x/9L/NP/5/5r/MP8S/yT/Iv9Y/8D/mv+I/6j/KP/S/xD/4v+A/1n/QP8S/wj/Qf9B/+D/MP9a/5L/GP8a/9D/KP+Q/5D/5P9Y/5L/IP/w/4r/6P/i/zn/6P/5/8D/Af/S/1X/Vf9i/0X/4v+S/0X/wf/i/4L/NP/4/+D/Uv9I/0X/Yf+6/1X/Qf9p/0X/Vf9h/+n/Mf+Q/5L/qP+Q/2n/CP+I/4r/5P9Y/6D/Ef/w/zD/Qv9Z//D/Mf9x/3n/Rf8A/xH/NP9I/1n/KP9B/1n/Mf9R/5L/OP8w/2n/GP9I/5L/Mv/w/xD/Sf/4/wH/CP/5/wD/4f9I/7L/KP/g/6D/Iv/i/7L/6P8S/wj/5v8S/9L/Iv/4/wj/8f/Q/6j/pP/Q/6j/1P+S/9D/0v/4/9L/4P+S/wj/Av+w/0X/Qf9Z/9D/Af+6/0X/wf9x/1H/Rf9h/4L/Av8y/1n/BP+6/8D/CP9i/8D/CP9Z/1n/Ev/w/2n/wf8B/6D/Iv/A/1n/KP/4/9n/BP9I/7r/BP/5/wH//D/Gv9R/7z/ev9p/0n/Uf/A/wH/Ev9J/wn/Qf/p/wn/2P/S/0n/ev8J/1//Yf8w/xD/Uf/A/wj/Sf+S/wn/0v8g//j/Qf+K/zT/6/8F/wT/AP9R/8H/cf9V/0X/uv9h/0H/Wv9h/0H/kP+g/wT/Wv+I/xj/AP8o//L/kP+S/zj//D/6f/B/+C/6j/GP8o/6j/qP+a/wj/KP84/4j/5v8Z/yT/Av8C/4L/AP/4/wH/BP8a/8D/Af/5/5L/CP+Q/+j/BP/4/4j/Av/Q/6j/GP9Y/wj/8v/w/zX/CP84/4j/wf9x/9H/Rf9x/+n/8f+Q/9L/OP/4/1n/5P8S/9D/wv+S/9D//D/4/zD/5v+A/4r/4P+S/4L/4v9i//D/+P8w/4L/5v+Q/5L/5P+C/9n/kv+C/9n/lP+C/8D/9P8I/8D/MP/5/wD/CP/4/4r/Ev+S/4j/CP/y/4r/EP/w/6D/Av+I/6j/CP8R/+X/BP/p/2n/wf95//D/+P9B/9n/Vf9Z/yT/8P8S/9L//D/Yf+I/1X/AP/Q/zT/+P8o/7T/AP/Z/zH/Qf/w/wj/8P+g/xD/Qf9p/0n/Qf/A/+T/Wf9h/yT/5/+S/wT/CP8w/zL/AP/Q/+D/5//p/yD/Mv/w//L/Mv8g/0n/cf+g/xD/gv8k/zT/4P+K/wL/kP/Z/zH/Iv85/+L/EP8x/+j/OP8h/+L/mP+I/+D/Ev/w/yT/kP+K//D/Ef/Z/8L/kP/g/+b/iP/S/+H/kP85/8H/iP8Q//L/4v85/zT/EP8Q/+j/5//A//D/Af/S/1L/cf9F/1X/Qf9h/wD/sv/l/xH/cf9V/8H/Af85/6T/0v+g/xH/Wv9V/wD/EP9h/0n/Mv8Q/xH/AP+y/yT/SP8R/+T/Wf9Z/+j/WP8R/+T/Of9J/+b/Sf95/+b/Ef9h/3n//D/6P8U/+D/qP8Q/wj/Kf+i/0H/qP8I/5D/2f/C/9D/Wf8E/1j/AP/m/6L/Af/y/5D/Of/B/2H/0P/w/wH/CP8h/xr/Uf/0/xj/2f9J/5D/6P8E/4j/kP8U/wD/yP84/1j/EP/w/xn/Mf9B/zj/qP/k/5j/6P/y/5D/Yf/B/4j/8P+i/5D/2f+i/6L/KP8I/5L/Ef/C/5L/KP8o/1H/0f8g/xL/mv8Q/wL/CP8Q/1j/iP8g/1H/yP/y/5D/AP/o/0n/Rf8B/xL/Uf/B/0L/Uf8J/1r/Ef/C/3H/oP8w/xL/JP/y/wD/AP/o/5D/CP8Q/+L/qP+a/xL/iv/y/1H/iP8y//j/JP/g/+D/iP/w/4L/iP8Q/5j/CP/0/+L/iv/o//n/Af/m/xn/JP8B/7D/gv8C/4D/kv8E/4L/6f/g//n/iP/g/zn/6f8k/3H/Wf8k/xH/Yf8g/1n/Ef8J/2H/Of+k/0H/gP8U/5D/iP8o/xH/Mf8Q/5j/CP/o//n/gP/k/5L/kP9J//r/Ef/C/2H/JP/g/xr/Yf8g//j/Af8E//j/gP8g//r/af9J/7r//D/4v/Q/6j/AP8a/yD/OP+Y/wj/KP9I/4j/GP/4/wj/GP84/6j/Iv/4/zH/4P8S//D/Sf+Q/+D/5v+I/+X/wf/4/5D/8v8y/5D/+P8Z/5L/5P+Y/zn/4v8Q/8D/IP8y/1n/Ev8S/yj/5v9Z//D/BP9J/+D/4v/5/2H/Cf+C/zn/5P+a/9D/BP/4/4L/EP9h/zD/6P+I/+X/Cf96/4j/+P9Z/2H/JP/A/wj/wf+Y/yj/OP+S/zD/+P+w/wD/5v8I/+j/JP8A/wj/4v/6/8j/BP+S/+j/6P8Q/+j/JP8A/8D/IP/6/xH/4P85/9L/IP96/+j/8v/A/4D/If/6/9n/CP9I/1n/KP/w/zn/+P/A/+n/Av9S/+n/8v/4/9D/6P8Q/8D/CP+Q/9D/Vf9i/yT/BP96/wH/5v+I/9n/qP8C/6j/+P+w/7D/Wf9Z/4D/Af+C/4r/NP/g/wH/BP+w/yH/8v9i/yT/5v+K/9D/+P/4/9n/BP/6/5D/5P8Y/9n/Sf+Q/9n/BP+I/6j/Ev8B/8j/OP9Y/wD/8P8Z/0X/Af8Y/zH/Qf+Y/yH/6P/5/wj/KP8w/+j/6P9I/8D/IP8Q/0j/wf9I/8j/IP9x/7r/Cf9Z/+n/BP/6/9n/CP/w/6D/EP9B/2n/Sf9B/8D/5P9Z/2H/JP/5/9L/BP8I/zD/Mv8A/9D/4P/5/+n/IP8y//D/8v8y/yD/Sf9x/6D/EP+C/yT/NP+D/gH/yv8A==',
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
    logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5NiIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDk2IDQ4Ij48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMwMDY1QjIiIGQ9Ik0zMC4wMjYgNDcuNTI4Yy0uMzk2LjYxOC0xLjE1NS44MjQtMS43NzMuNDI3bC0yMC4xMS0xMy4xMDljLS42MTktLjM5Ni0uODI1LTEuMTU1LS40MjgtMS43NzNsMTMuMTEtMjAuMTExYy4zOTYtLjYxOCAxLjE1NS0uODI0IDEuNzczLS40MjdsMjAuMTEgMTMuMTEuMDEzLS4wMDhjLjYxOC4zOTYgLjgyNCAxLjE1NS40MjcgMS43NzNsLTEzLjEgMjAuMTEtLjAxMi0uMDA5Wm0uMDUyLTEuODQ2bDExLjg5MS0xOC4yNTUtMTguMjU1LTExLjg5MUw0LjgyIDI3LjQyNGwxMy40MTIgOC43NDcgMTEuODQ2LTcuNzM3LS4wMDkuMDE0Wm0tMTUuNTA5LTIzLjgxM2wtNS42NDQgOC42NzYtOC42NzYtNS42NDQgMTguNzAxLTEyLjE4MSAxMi4xODEgMTguN2wtOC42NzYtNS42NDQtNS42NDQgOC42NzYtMi44Mi00LjMzOEwyNS45MyAxMy41bC00LjMzOC0yLjgyWiIvPjxwYXRoIGZpbGw9IiMwMDY1QjIiIGQ9Ik02My41MDcgNDIuNTE3VjUuNTI3aDYuNTYydjM3SDYzLjUwN1ptMTQuMjQ1IDBWNS41MjdoNi40OTV2MjEuMzQ4bC0uMTQxLjE0djE1LjQ0aC02LjM1NFoiLz48cGF0aCBmaWxsPSIjRkZGIiBkPSJNNjMuNTA3IDQyLjUxN1Y1LjUyN2g2LjU2MnYzN0g2My41MDdabTE0LjI0NSAwVjUuNTI3aDYuNDk1djIxLjM0OGwtLjE0MS4xNHYxNS40NGgtNi4zNTRaIi8+PHBhdGggZmlsbD0iIzAwNjVCMiIgZD0iTTc3Ljc1MiA0Mi41MTd2LTguNThoNC4yODJ2LTUuNTI3aC00LjI4MnYtOS40ODNoLTUuOTM4djI5LjEzNGwxLjY1Ni0uMDAxWiIvPjxnPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik03Ny43NTIgNDIuNTE3di04LjU4aDQuMjgydi01LjUyN2gtNC4yODJ2LTkuNDgzaC01LjkzOHYyOS4xMzRsMS42NTYtLjAwMVoiLz48L2c+PC9nPjwvc3ZnPg==',
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
    logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMGE5ZTciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNi41IDEzLjVDNSA5IDggMyAxMyAzYzQgMCA3IDMuNSA3IDd2NCI+PC9wYXRoPjxwYXRoIGQ9Ik0xNy41IDEwLjVDMTkgMTUgMTYgMjEgMTEgMjFjLTQgMC03LTMuNS03LTd2LTQiPjwvcGF0aD48L3N2Zz4=',
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
            const { default: htmlToDocx } = await import('html-to-docx');
            const fileData = await htmlToDocx(activePreview.htmlContent, null, {
                margins: { top: 720, right: 720, bottom: 720, left: 720 },
            });
            
            // FIX: Ensure the data passed to createObjectURL is a Blob, as html-to-docx can return an ArrayBuffer.
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
            const clipboardItem = new ClipboardItem({
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
    return quoteData.itineraryGroups.reduce((total, group) => {
        return total + group.priceRows.reduce((groupTotal, row) => {
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
