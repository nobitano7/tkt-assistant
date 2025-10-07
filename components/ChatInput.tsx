import React, { useRef, useEffect, useState } from 'react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: (message: string, image: File | null) => void;
  isLoading: boolean;
  attachedImage: File | null;
  setAttachedImage: (file: File | null) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, onSendMessage, isLoading, attachedImage, setAttachedImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (attachedImage) {
      const url = URL.createObjectURL(attachedImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [attachedImage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage(input, attachedImage);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setAttachedImage(file);
    }
    // Reset the input value to allow re-selecting the same file
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleRemoveImage = () => {
    setAttachedImage(null);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          setAttachedImage(file);
          e.preventDefault();
          return;
        }
      }
    }
  };


  return (
    <footer className="bg-white p-4 border-t border-slate-200">
      {attachedImage && previewUrl && (
        <div className="p-2 mb-2 bg-slate-100 rounded-lg flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-3">
                <img src={previewUrl} alt="Preview" className="h-14 w-14 object-cover rounded-md" />
                <div className="text-sm text-slate-700">
                    <p className="font-medium truncate max-w-xs">{attachedImage.name}</p>
                    <p className="text-xs text-slate-500">{`${(attachedImage.size / 1024).toFixed(1)} KB`}</p>
                </div>
            </div>
            <button 
                onClick={handleRemoveImage} 
                className="p-1 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                aria-label="Remove image"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
      )}
      <div className="relative">
        <textarea
          className="w-full bg-white border border-slate-300 rounded-lg py-3 pr-28 pl-12 resize-none focus:ring-2 focus:ring-sky-500 focus:outline-none transition text-sm"
          placeholder="Nhập câu hỏi hoặc dán ảnh vào đây..."
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={isLoading}
        />
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        <button
            onClick={handleAttachClick}
            disabled={isLoading}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-50 transition-colors"
            aria-label="Attach file"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
        </button>
        <button
          onClick={() => onSendMessage(input, attachedImage)}
          disabled={isLoading || (!input.trim() && !attachedImage)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-sky-600 text-white hover:bg-sky-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Send message"
        >
          {isLoading ? (
             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          )}
        </button>
      </div>
    </footer>
  );
};