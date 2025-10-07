import React, { useEffect, useRef } from 'react';
import { type Message } from '../types';

const UserMessage: React.FC<{ content: string, image?: string }> = ({ content, image }) => (
  <div className="flex justify-end mb-4">
    <div className="bg-sky-600 text-white rounded-l-xl rounded-t-xl py-2 px-4 max-w-lg">
      {image && <img src={image} alt="User upload" className="rounded-md mb-2 max-w-xs max-h-48" />}
      {content && <p className="text-sm">{content}</p>}
    </div>
  </div>
);

const ModelMessage: React.FC<{ content: string }> = ({ content }) => (
  <div className="flex justify-start mb-4">
    <div className="bg-slate-100 rounded-r-xl rounded-t-xl py-2 px-4 max-w-2xl">
        <div 
          className="prose prose-sm text-slate-800 prose-pre:bg-slate-200 prose-pre:text-slate-800 prose-code:text-sky-600" 
          dangerouslySetInnerHTML={{ __html: formatMessage(content) }} 
        />
    </div>
  </div>
);

const formatMessage = (text: string) => {
    // Basic markdown processing. Order is important.
    let html = text
      // 0. Autolink URLs
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-sky-600 hover:underline">$1</a>')
      // 1. Code blocks (preserve newlines inside)
      .replace(/```([\s\S]*?)```/g, '<pre class="rounded-md p-3"><code>$1</code></pre>')
      // 2. Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-slate-200 rounded px-1 py-0.5">$1</code>')
      // 3. Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 4. Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 5. New lines (for paragraph breaks)
      .replace(/\n/g, '<br />');
      
    // Restore newlines inside pre blocks that were replaced by <br />
    html = html.replace(/<pre(.*?)>([\s\S]*?)<\/pre>/g, (match, p1, p2) => {
        return `<pre${p1}>${p2.replace(/<br \/>/g, '\n')}</pre>`;
    });

    return html;
};


const TypingIndicator: React.FC = () => (
  <div className="flex justify-start mb-4">
    <div className="bg-slate-100 rounded-r-xl rounded-t-xl py-3 px-4 max-w-lg flex items-center space-x-1">
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
