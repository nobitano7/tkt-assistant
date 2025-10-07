import React, { useState } from 'react';
import { type Bookmark } from '../types';

interface BookmarkManagerProps {
  bookmarks: Bookmark[];
  onAdd: (name: string, url: string) => void;
  onDelete: (id: number) => void;
}

export const BookmarkManager: React.FC<BookmarkManagerProps> = ({ bookmarks, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const handleAdd = () => {
    if (name.trim() && url.trim()) {
      onAdd(name, url);
      setName('');
      setUrl('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleAdd();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-sky-600">Liên kết Yêu thích</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="p-1 rounded-full text-slate-500 hover:bg-slate-200"
          aria-label="Add new bookmark"
          title="Thêm liên kết mới"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isAdding && (
        <div className="p-3 mb-3 bg-white border border-slate-200 rounded-lg space-y-2 animate-fade-in">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tên (ví dụ: Abtrip)"
            className="w-full text-sm p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500"
          />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="URL (ví dụ: abtrip.vn)"
            className="w-full text-sm p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500"
          />
          <div className="flex justify-end space-x-2">
            <button onClick={() => setIsAdding(false)} className="px-3 py-1 text-sm rounded-md bg-slate-200 hover:bg-slate-300">Hủy</button>
            <button onClick={handleAdd} className="px-3 py-1 text-sm rounded-md bg-sky-600 text-white font-semibold hover:bg-sky-500">Lưu</button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {bookmarks.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-2">Chưa có mục yêu thích nào.</p>
        ) : (
          bookmarks.map(bm => (
            <a 
              key={bm.id} 
              href={bm.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 group hover:border-sky-400 hover:bg-sky-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              <p className="flex-1 text-sm text-slate-700 truncate" title={bm.name}>{bm.name}</p>
              <button onClick={(e) => { e.preventDefault(); onDelete(bm.id); }} className="p-1 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete bookmark" title="Xóa liên kết này">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              </button>
            </a>
          ))
        )}
      </div>
    </div>
  );
};