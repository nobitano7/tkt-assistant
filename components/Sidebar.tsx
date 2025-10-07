
import React from 'react';
import { Notes } from './Notes';
import { type ChatSession } from '../types';


const QuickLink: React.FC<{ href: string; name: string; icon: React.ReactNode }> = ({ href, name, icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center space-x-3 p-2 rounded-lg text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all duration-200"
  >
    {icon}
    <span className="font-medium text-sm">{name}</span>
  </a>
);

interface SidebarProps {
  onNewChat: () => void;
  sessions: ChatSession[];
  activeSessionId: number | null;
  onSelectSession: (id: number) => void;
  onDeleteSession: (id: number) => void;
}


export const Sidebar: React.FC<SidebarProps> = ({ 
  onNewChat, 
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession
}) => {
  return (
    <aside className="w-72 bg-slate-100 p-4 flex flex-col space-y-4 border-r border-slate-200 overflow-y-auto">
      <button
        onClick={onNewChat}
        className="flex w-full items-center justify-center space-x-2 p-2 rounded-lg text-white bg-sky-600 hover:bg-sky-500 transition-all duration-200 font-semibold"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
        <span>Trò chuyện mới</span>
      </button>

       <div>
        <h2 className="text-sm font-semibold text-slate-500 mt-4 mb-2 px-2 uppercase tracking-wider">Lịch sử</h2>
        <nav className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {sessions.map(session => (
            <div key={session.id} className="group relative">
              <button
                onClick={() => onSelectSession(session.id)}
                className={`flex items-center w-full text-left space-x-3 p-2 rounded-lg transition-all duration-200 ${
                  activeSessionId === session.id
                    ? 'bg-slate-200 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
                title={session.title}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <span className="text-sm truncate flex-1">{session.title}</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                title="Xóa cuộc trò chuyện"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              </button>
            </div>
          ))}
        </nav>
      </div>

      <Notes />
      
      <div>
        <h2 className="text-lg font-semibold text-sky-600 mb-2">Tải xuống</h2>
        <nav className="space-y-1">
          <QuickLink 
            href="#downloads" 
            name="Mục đã tải xuống"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>} 
          />
        </nav>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-sky-600 mb-2">Liên kết nhanh</h2>
        <nav className="space-y-1">
          <QuickLink 
            href="https://abtrip.vn" 
            name="Abtrip.vn"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>} 
          />
          <QuickLink 
            href="https://1gindo.com/bsp/index.htm" 
            name="Quy định BSP (1Gindo)"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
           />
        </nav>
      </div>
      <div className="mt-auto text-center text-xs text-slate-400">
        <p>TKT Assistant v1.2</p>
        <p>Powered by Google Gemini</p>
      </div>
    </aside>
  );
};
