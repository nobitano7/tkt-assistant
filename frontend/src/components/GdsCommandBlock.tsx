import React, { useState } from 'react';

export const GdsCommandBlock: React.FC<{ command: string }> = ({ command }) => {
    const [copySuccess, setCopySuccess] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(command.trim()).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    return (
        <div className="bg-slate-800 rounded-lg overflow-hidden my-2 text-left">
            <div className="flex justify-between items-center px-3 py-1 bg-slate-700/50">
                <span className="text-xs font-semibold text-slate-300">GDS Command</span>
                <button 
                    onClick={handleCopy} 
                    className="text-xs font-medium rounded text-slate-300 hover:text-white transition-colors flex items-center space-x-1"
                    title="Sao chép lệnh"
                >
                    {copySuccess ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Đã chép</span>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>Chép</span>
                        </>
                    )}
                </button>
            </div>
            <pre className="p-3 text-sm text-white font-mono whitespace-pre-wrap"><code>{command.trim()}</code></pre>
        </div>
    );
};