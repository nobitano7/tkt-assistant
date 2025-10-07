import React, { useEffect, useRef } from 'react';
import { type Message } from '../types';
import { GdsCommandBlock } from './GdsCommandBlock';

const UserMessage: React.FC<{ content: string, image?: string }> = ({ content, image }) => (
  <div className="flex justify-end items-start mb-4 space-x-3 animate-fade-in-up">
    <div className="bg-sky-600 text-white rounded-xl rounded-br-none py-2 px-4 max-w-lg">
      {image && <img src={image} alt="User upload" className="rounded-md mb-2 max-w-xs max-h-48" />}
      {content && <p className="text-sm">{content}</p>}
    </div>
     <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
        U
    </div>
  </div>
);

// Formats simple markdown (bold, italic, links, inline code) but skips block-level elements like code blocks.
const formatSimpleText = (text: string) => {
    return text
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-sky-600 hover:underline">$1</a>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-200 rounded px-1 py-0.5">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
};

const ModelMessage: React.FC<{ content: string }> = ({ content }) => {
  // Split the content by GDS command blocks, keeping the delimiters
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="flex justify-start items-start mb-4 space-x-3 animate-fade-in-up">
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
            </svg>
        </div>
        <div className="bg-slate-100 rounded-xl rounded-bl-none py-2 px-4 max-w-2xl">
            <div className="prose prose-sm text-slate-800 prose-pre:bg-slate-200 prose-pre:text-slate-800 prose-code:text-sky-600">
                {parts.map((part, index) => {
                    if (part.startsWith('```') && part.endsWith('```')) {
                        // This is a GDS command block
                        const command = part.slice(3, -3);
                        return <GdsCommandBlock key={index} command={command} />;
                    } else if (part.trim()) {
                        // This is a regular text part
                        return (
                            <div
                                key={index}
                                dangerouslySetInnerHTML={{ __html: formatSimpleText(part) }}
                            />
                        );
                    }
                    return null; // Don't render empty parts
                })}
            </div>
        </div>
    </div>
  );
};

const TypingIndicator: React.FC = () => (
  <div className="flex justify-start items-start mb-4 space-x-3 animate-fade-in-up">
     <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
        </svg>
    </div>
    <div className="bg-slate-100 rounded-xl rounded-bl-none py-3 px-4 max-w-lg flex items-center space-x-1">
      <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
    </div>
  </div>
);


export const ChatWindow: React.FC<{ messages: Message[]; isLoading: boolean }> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="space-y-4">
        {messages.map((msg, index) => {
          if (msg.role === 'user') {
            return <UserMessage key={index} content={msg.content} image={msg.image} />;
          } else {
            // Don't render empty model messages unless we are loading the very first chunk
            const isLastMessage = index === messages.length - 1;
            if (!msg.content && !isLastMessage) return null;
            if (!msg.content && isLastMessage && !isLoading) return null;

            return <ModelMessage key={index} content={msg.content} />;
          }
        })}
        {isLoading && messages[messages.length - 1]?.role === 'user' && <TypingIndicator />}
        {isLoading && messages[messages.length - 1]?.role === 'model' && !messages[messages.length-1].content && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </main>
  );
};