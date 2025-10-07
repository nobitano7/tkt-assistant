import React, { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (apiKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSaveClick = () => {
    if (key.trim()) {
      onSave(key.trim());
      setError('');
    } else {
      setError('Vui lòng nhập API Key.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4">
        <header className="p-4 border-b">
          <h2 className="text-lg font-bold text-slate-700">Thiết lập Gemini API Key</h2>
        </header>
        <main className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Vui lòng nhập Gemini API Key của bạn để bắt đầu sử dụng trợ lý. 
            Khóa của bạn sẽ được lưu trữ an toàn ngay trên trình duyệt này.
          </p>
          <div>
            <label htmlFor="apiKeyInput" className="block text-sm font-medium text-slate-600 mb-1">
              API Key
            </label>
            <input
              id="apiKeyInput"
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full text-sm border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
              placeholder="Dán API Key của bạn vào đây"
            />
             {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>
           <p className="text-xs text-slate-500">
            Bạn có thể lấy API Key từ <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Google AI Studio</a>.
          </p>
        </main>
        <footer className="p-4 bg-slate-50 flex justify-end rounded-b-xl">
          <button
            onClick={handleSaveClick}
            className="px-4 py-2 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-500 transition-all"
          >
            Lưu và Bắt đầu
          </button>
        </footer>
      </div>
    </div>
  );
};