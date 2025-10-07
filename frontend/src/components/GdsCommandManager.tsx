import React, { useState } from 'react';
import { type GdsCommand } from '../types';

interface GdsCommandManagerProps {
  commands: GdsCommand[];
  onAdd: (name: string, command: string) => void;
  onDelete: (id: number) => void;
}

const GdsCommandItem: React.FC<{ command: GdsCommand; onDelete: (id: number) => void; }> = ({ command, onDelete }) => {
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(command.command).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    return (
        <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 group">
            <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-medium text-slate-700 truncate" title={command.name}>{command.name}</p>
                 <p className="text-xs text-slate-500 font-mono truncate" title={command.command}>{command.command}</p>
            </div>
            <button
                onClick={handleCopy}
                className={`px-2 py-1 text-xs font-semibold rounded transition-colors w-16 flex-shrink-0 ${
                    copySuccess 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
                {copySuccess ? 'Đã chép!' : 'Chép'}
            </button>
             <button
                onClick={(e) => { e.stopPropagation(); onDelete(command.id); }}
                className="p-1 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete command"
                title="Xóa lệnh này"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            </button>
        </div>
    );
};


export const GdsCommandManager: React.FC<GdsCommandManagerProps> = ({ commands, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [command, setCommand] = useState('');

  const handleAdd = () => {
    if (name.trim() && command.trim()) {
      onAdd(name, command);
      setName('');
      setCommand('');
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
        <h2 className="text-lg font-semibold text-sky-600">Bí kíp võ công (GDS)</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="p-1 rounded-full text-slate-500 hover:bg-slate-200"
          aria-label="Add new GDS command"
          title="Thêm lệnh GDS mới"
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
            placeholder="Tên gợi nhớ (ví dụ: Hiển thị PNR)"
            className="w-full text-sm p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500"
          />
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Lệnh GDS (ví dụ: RT)"
            className="w-full text-sm p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 font-mono"
          />
          <div className="flex justify-end space-x-2">
            <button onClick={() => setIsAdding(false)} className="px-3 py-1 text-sm rounded-md bg-slate-200 hover:bg-slate-300">Hủy</button>
            <button onClick={handleAdd} className="px-3 py-1 text-sm rounded-md bg-sky-600 text-white font-semibold hover:bg-sky-500">Lưu</button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {commands.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-2">Chưa có lệnh nào được lưu.</p>
        ) : (
          commands.map(cmd => (
            <GdsCommandItem key={cmd.id} command={cmd} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
};