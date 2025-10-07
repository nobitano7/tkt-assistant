import React from 'react';
import { Notes } from './Notes';
import { DocumentManager } from './DocumentManager';
import { BookmarkManager } from './BookmarkManager';
import { GdsCommandManager } from './GdsCommandManager';
import { type Document, type Bookmark, type ChatSession, type GdsCommand } from '../types';

interface SidebarProps {
  onNewChat: () => void;
  sessions: ChatSession[];
  activeSessionId: number | null;
  onSelectSession: (id: number) => void;
  onDeleteSession: (id: number) => void;
  documents: Document[];
  onUploadDocument: (file: File) => void;
  onDeleteDocument: (id: number) => void;
  onUseDocument: (id: number) => void;
  docLoading: boolean;
  docError: string | null;
  bookmarks: Bookmark[];
  onAddBookmark: (name: string, url: string) => void;
  onDeleteBookmark: (id: number) => void;
  gdsCommands: GdsCommand[];
  onAddGdsCommand: (name: string, command: string) => void;
  onDeleteGdsCommand: (id: number) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}


export const Sidebar: React.FC<SidebarProps> = ({ 
  onNewChat, 
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  documents,
  onUploadDocument,
  onDeleteDocument,
  onUseDocument,
  docLoading,
  docError,
  bookmarks,
  onAddBookmark,
  onDeleteBookmark,
  gdsCommands,
  onAddGdsCommand,
  onDeleteGdsCommand,
  isCollapsed,
  setIsCollapsed
}) => {
  return (
    <aside className={`bg-slate-100 p-4 flex flex-col border-r border-slate-200 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20 items-center' : 'w-80'}`}>
      <div className={`w-full flex flex-col space-y-4 ${isCollapsed ? 'items-center' : ''}`}>
        <button
          onClick={onNewChat}
          className={`flex w-full items-center justify-center space-x-2 p-2 rounded-lg text-white bg-sky-600 hover:bg-sky-500 transition-all duration-200 font-semibold ${isCollapsed ? 'h-10 w-10' : ''}`}
          title={isCollapsed ? "Trò chuyện mới" : "Bắt đầu một cuộc trò chuyện mới"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
          <span className={isCollapsed ? 'hidden' : 'inline'}>Trò chuyện mới</span>
        </button>

        <div className="w-full">
          <h2 className={`text-sm font-semibold text-slate-500 mt-4 mb-2 px-2 uppercase tracking-wider ${isCollapsed ? 'hidden' : 'block'}`}>Lịch sử</h2>
          <nav className={`space-y-1 max-h-48 overflow-y-auto pr-1 ${isCollapsed ? 'w-12' : ''}`}>
            {sessions.map(session => (
              <div key={session.id} className="group relative">
                <button
                  onClick={() => onSelectSession(session.id)}
                  className={`flex items-center w-full text-left space-x-3 p-2 rounded-lg transition-all duration-200 ${
                    activeSessionId === session.id
                      ? 'bg-slate-200 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={session.title}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  <span className={`text-sm truncate flex-1 ${isCollapsed ? 'hidden' : 'inline'}`}>{session.title}</span>
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
      </div>
      
      <div className={`w-full flex-1 overflow-y-auto space-y-4 pt-4 border-t mt-4 ${isCollapsed ? 'hidden' : 'block'}`}>
        <DocumentManager
          documents={documents}
          onUpload={onUploadDocument}
          onDelete={onDeleteDocument}
          onUse={onUseDocument}
          isLoading={docLoading}
          error={docError}
        />

        <GdsCommandManager
          commands={gdsCommands}
          onAdd={onAddGdsCommand}
          onDelete={onDeleteGdsCommand}
        />
        
        <BookmarkManager
          bookmarks={bookmarks}
          onAdd={onAddBookmark}
          onDelete={onDeleteBookmark}
        />
        
        <Notes />
      </div>

      <div className="mt-auto pt-4 border-t border-slate-200 w-full flex flex-col items-center">
        <div className={`text-center text-xs text-slate-400 transition-opacity ${isCollapsed ? 'hidden' : 'block'}`}>
          <p>TKT Assistant v2.0</p>
          <p>Powered by Google Gemini</p>
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 mt-2 rounded-lg text-slate-500 hover:bg-slate-200"
          title={isCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
          )}
        </button>
      </div>
    </aside>
  );
};