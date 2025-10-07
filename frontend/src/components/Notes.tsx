import React, { useState, useEffect, useMemo } from 'react';
import { type Note } from '../types';

const NOTE_STORAGE_KEY = 'TKT_ASSISTANT_NOTES';

export const Notes: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [inputText, setInputText] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    // Load notes from localStorage on initial render
    useEffect(() => {
        try {
            const storedNotes = localStorage.getItem(NOTE_STORAGE_KEY);
            if (storedNotes) {
                setNotes(JSON.parse(storedNotes));
            }
        } catch (error) {
            console.error("Failed to load notes from localStorage", error);
        }
    }, []);

    // Save notes to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify(notes));
        } catch (error) {
            console.error("Failed to save notes to localStorage", error);
        }
    }, [notes]);

    const handleAddNote = () => {
        if (inputText.trim()) {
            const newNote: Note = {
                id: Date.now(),
                text: inputText.trim(),
                completed: false,
            };
            setNotes(prevNotes => [newNote, ...prevNotes]);
            setInputText('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddNote();
        }
    };

    const handleToggleComplete = (id: number) => {
        setNotes(notes.map(note =>
            note.id === id ? { ...note, completed: !note.completed } : note
        ));
    };

    const handleDeleteNote = (id: number) => {
        setNotes(notes.filter(note => note.id !== id));
    };

    const handleClearCompleted = () => {
        setNotes(notes.filter(note => !note.completed));
    };
    
    const filteredNotes = useMemo(() => {
        switch (filter) {
            case 'active':
                return notes.filter(note => !note.completed);
            case 'completed':
                return notes.filter(note => note.completed);
            default:
                return notes;
        }
    }, [notes, filter]);

    const FilterButton: React.FC<{
        filterType: 'all' | 'active' | 'completed';
        text: string;
    }> = ({ filterType, text }) => (
        <button
            onClick={() => setFilter(filterType)}
            className={`px-2 py-1 text-xs rounded ${
                filter === filterType 
                ? 'bg-sky-600 text-white' 
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
        >
            {text}
        </button>
    );

    return (
        <div>
            <h2 className="text-lg font-semibold text-sky-600 mb-4">Ghi chú & Nhắc việc</h2>
            <div className="space-y-3">
                <div className="relative">
                     <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập ghi chú mới..."
                        rows={2}
                        className="w-full text-sm p-2 pr-16 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none transition"
                    />
                    <button
                        onClick={handleAddNote}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm rounded-md bg-sky-600 text-white font-semibold hover:bg-sky-500 disabled:bg-slate-300 transition"
                        disabled={!inputText.trim()}
                    >
                        Thêm
                    </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1">
                        <FilterButton filterType="all" text="Tất cả" />
                        <FilterButton filterType="active" text="Chưa xong" />
                        <FilterButton filterType="completed" text="Đã xong" />
                    </div>
                    <button onClick={handleClearCompleted} className="text-xs text-slate-500 hover:text-red-500 transition-colors">Xóa mục đã hoàn thành</button>
                </div>
               
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {filteredNotes.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">Chưa có ghi chú nào.</p>
                    ) : (
                        filteredNotes.map(note => (
                            <div key={note.id} className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 group">
                                <input
                                    type="checkbox"
                                    checked={note.completed}
                                    onChange={() => handleToggleComplete(note.id)}
                                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer flex-shrink-0"
                                />
                                <p className={`flex-1 text-sm text-slate-700 break-words ${note.completed ? 'line-through text-slate-400' : ''}`}>
                                    {note.text}
                                </p>
                                <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                    aria-label="Delete note"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};