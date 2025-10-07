import React, { useRef } from 'react';
import { type Document } from '../types';

interface DocumentManagerProps {
  documents: Document[];
  onUpload: (file: File) => void;
  onDelete: (id: number) => void;
  onUse: (id: number) => void;
  isLoading: boolean;
  error: string | null;
}

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2a1 1 0 00-1 1v1a1 1 0 102 0V7a1 1 0 00-1-1zm1 3a1 1 0 11-2 0 1 1 0 012 0zm1 2a1 1 0 100 2h3a1 1 0 100-2H8zm-1-4a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" /></svg>;
  if (type.includes('word')) return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2a1 1 0 00-1 1v8a1 1 0 102 0V7a1 1 0 00-1-1zm3 0a1 1 0 00-1 1v8a1 1 0 102 0V7a1 1 0 00-1-1zm3 0a1 1 0 00-1 1v8a1 1 0 102 0V7a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
  return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ documents, onUpload, onDelete, onUse, isLoading, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-sky-600 mb-2">Tài liệu tham khảo</h2>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.pdf,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />
      <button
        onClick={handleUploadClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-dashed border-slate-400 rounded-lg text-slate-600 hover:bg-slate-200 hover:border-slate-500 transition-colors"
        title="Tải lên tài liệu (.txt, .pdf, .docx) để làm ngữ cảnh"
      >
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
        <span>Tải lên tài liệu</span>
      </button>
      
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      {isLoading && <p className="text-xs text-slate-500 mt-2 text-center animate-pulse">Đang xử lý...</p>}

      <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
        {documents.length === 0 && !isLoading ? (
          <p className="text-sm text-slate-500 text-center py-2">Chưa có tài liệu nào.</p>
        ) : (
          documents.map(doc => (
            <div key={doc.id} className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 group">
              <span className="flex-shrink-0">{getFileIcon(doc.type)}</span>
              <p className="flex-1 text-sm text-slate-700 truncate" title={doc.name}>{doc.name}</p>
              <button onClick={() => onUse(doc.id)} className="px-2 py-1 text-xs font-semibold rounded bg-sky-100 text-sky-700 hover:bg-sky-200" title="Sử dụng tài liệu này làm ngữ cảnh cho câu hỏi tiếp theo">Sử dụng</button>
              <button onClick={() => onDelete(doc.id)} className="p-1 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete document" title="Xóa tài liệu này">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};