
import React, { useState, useEffect } from 'react';
import { findNearestAirports } from '../services/geminiService';
import { type AirportInfo } from '../types';

interface NearestAirportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NearestAirportModal: React.FC<NearestAirportModalProps> = ({ isOpen, onClose }) => {
    const [location, setLocation] = useState('');
    const [airports, setAirports] = useState<AirportInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setLocation('');
            setAirports([]);
            setError('');
            setIsLoading(false);
        }
    }, [isOpen]);
    
    const handleSearch = async () => {
        if (!location.trim()) {
            setError('Vui lòng nhập một địa điểm.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAirports([]);

        try {
            // FIX: findNearestAirports expects only one argument.
            const results = await findNearestAirports(location);
            setAirports(results);
        } catch (err) {
            console.error('Error finding nearest airports:', err);
            setError('Không thể tìm thấy sân bay. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold text-sky-600">Tìm Sân bay Gần nhất</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200" aria-label="Close modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <main className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div>
                        <label htmlFor="locationInput" className="block text-sm font-medium text-slate-600 mb-1">
                            Nhập tên thành phố, địa danh hoặc địa chỉ
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                id="locationInput"
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                                placeholder="Ví dụ: Quebec, Canada"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSearch}
                                disabled={isLoading || !location.trim()}
                                className="px-4 py-2 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-500 disabled:bg-slate-300 transition-all flex items-center space-x-2"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                                )}
                                <span>Tìm kiếm</span>
                            </button>
                        </div>
                    </div>

                    {isLoading && (
                        <div className="flex justify-center items-center py-8">
                            <div className="flex items-center space-x-2 text-slate-500">
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>Đang tìm kiếm...</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="text-sm h-5">
                         {error && <p className="text-red-600 animate-fade-in">{error}</p>}
                    </div>

                    {airports.length > 0 && (
                        <div className="animate-fade-in">
                            <h3 className="text-md font-semibold text-slate-700 mb-3">Kết quả tìm kiếm</h3>
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium text-slate-600 uppercase tracking-wider">Tên sân bay</th>
                                            <th className="px-4 py-3 text-left font-medium text-slate-600 uppercase tracking-wider">Mã IATA</th>
                                            <th className="px-4 py-3 text-left font-medium text-slate-600 uppercase tracking-wider">Vị trí</th>
                                            <th className="px-4 py-3 text-left font-medium text-slate-600 uppercase tracking-wider">Khoảng cách</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {airports.map((airport, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3 font-medium text-slate-800">{airport.airportName}</td>
                                                <td className="px-4 py-3 font-mono text-slate-600">{airport.iataCode}</td>
                                                <td className="px-4 py-3 text-slate-600">{airport.location}</td>
                                                <td className="px-4 py-3 text-slate-600">{airport.distance}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};