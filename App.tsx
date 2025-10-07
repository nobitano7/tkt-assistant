
import React, { useState, useCallback, useEffect } from 'react';
import { type Chat, GoogleGenAI, type Part, type Content } from '@google/genai';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { Header } from './components/Header';
import { ToolsHeader } from './components/ToolsHeader';
import { QuoteModal } from './components/QuoteModal';
import { MessagingModal } from './components/MessagingModal';
import { GroupFareModal } from './components/GroupFareModal';
import { LaborTicketModal } from './components/LaborTicketModal';
import { NearestAirportModal } from './components/NearestAirportModal';
import { LookupModal } from './components/LookupModal';
import { type Message, type ChatSession } from './types';
import { startChatSession, runTimaticTool, runGenerateSrDocsTool } from './services/geminiService';


// Helper function to convert a File object to a Gemini-compatible Part.
async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
}

const SESSIONS_STORAGE_KEY = 'TKT_ASSISTANT_SESSIONS';

const initialMessages: Message[] = [
  {
    role: 'model',
    content: 'Xin chào! Tôi là Trợ lý Nghiệp vụ TKT. Tôi có thể giúp gì cho bạn hôm nay?',
  },
];


const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
  const [isMessagingModalOpen, setIsMessagingModalOpen] = useState<boolean>(false);
  const [isGroupFareModalOpen, setIsGroupFareModalOpen] = useState<boolean>(false);
  const [isLaborTicketModalOpen, setIsLaborTicketModalOpen] = useState<boolean>(false);
  const [isNearestAirportModalOpen, setIsNearestAirportModalOpen] = useState<boolean>(false);
  const [isLookupModalOpen, setIsLookupModalOpen] = useState<boolean>(false);

  // Load sessions from localStorage on initial render
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions);
        if (parsedSessions.length > 0) {
          setSessions(parsedSessions);
          setActiveSessionId(parsedSessions[0].id); // Activate the most recent one
          return;
        }
      }
    } catch (error) {
      console.error("Failed to load sessions from localStorage", error);
    }
    // If nothing is loaded, create a new initial session
    const initialSession: ChatSession = { 
      id: Date.now(), 
      title: 'Trò chuyện mới', 
      messages: initialMessages 
    };
    setSessions([initialSession]);
    setActiveSessionId(initialSession.id);
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
        try {
            localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
        } catch (error) {
            console.error("Failed to save sessions to localStorage", error);
        }
    }
  }, [sessions]);
  
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  const handleSendMessage = useCallback(async (messageText: string, imageFile: File | null) => {
    if (isLoading || !activeSessionId || (!messageText.trim() && !imageFile)) {
        return;
    }

    const imageUrl = imageFile ? URL.createObjectURL(imageFile) : undefined;
    const userMessage: Message = { role: 'user', content: messageText, image: imageUrl };
    
    const isNewChat = activeSession?.messages.length === 1 && activeSession.messages[0].role === 'model';
    const newTitle = isNewChat && messageText.trim() ? (messageText.substring(0, 40) + (messageText.length > 40 ? '...' : '')) : activeSession?.title;

    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            title: newTitle || 'Trò chuyện mới',
            messages: [...session.messages, userMessage, { role: 'model', content: '' }]
          };
        }
        return session;
      })
    );

    setInput('');
    setAttachedImage(null);
    setIsLoading(true);
    
    const currentHistory = (activeSession?.messages || []).map(msg => ({ 
      role: msg.role, 
      // Simplified history to text-only to avoid storing image data in local storage
      parts: [{ text: msg.content }] 
    }));

    try {
      const chat = startChatSession(currentHistory as Content[]);
      
      const messagePayload: string | Part[] = imageFile 
        ? [ { text: messageText }, await fileToGenerativePart(imageFile) ] 
        : messageText;

      const result = await chat.sendMessageStream({ message: messagePayload });

      let accumulatedText = "";
      const functionCalls: any[] = [];

      for await (const chunk of result) {
        if (chunk.text) {
          accumulatedText += chunk.text;
           setSessions(prev =>
              prev.map(session => {
                if (session.id === activeSessionId) {
                  const updatedMessages = [...session.messages];
                  updatedMessages[updatedMessages.length - 1] = {
                    ...updatedMessages[updatedMessages.length - 1],
                    content: accumulatedText,
                  };
                  return { ...session, messages: updatedMessages };
                }
                return session;
              })
            );
        }
        if (chunk.functionCalls) {
          functionCalls.push(...chunk.functionCalls);
        }
      }

      if (functionCalls.length > 0) {
        // Temporarily remove the empty placeholder and add thinking messages
        setSessions(prev =>
          prev.map(session => {
            if (session.id === activeSessionId) {
              const thinkingMessages: Message[] = functionCalls.map(fc => {
                if (fc.name === 'lookupTimatic') {
                    const { nationality, destination, transitPoints } = fc.args;
                    const transitInfo = transitPoints?.length ? ` quá cảnh tại ${transitPoints.join(', ')}` : '';
                    return { role: 'model', content: `*Đang tra cứu TIMATIC cho khách quốc tịch ${nationality} đi ${destination}${transitInfo}...*` };
                } else if (fc.name === 'generateSrDocs') {
                    return { role: 'model', content: '*Đang tạo lệnh SR DOCS...*' };
                }
                return { role: 'model', content: '*Đang xử lý công cụ...*' };
              });
              return { ...session, messages: [...session.messages.slice(0, -1), ...thinkingMessages] };
            }
            return session;
          })
        );

        const toolResponses = [];
        for (const fc of functionCalls) {
            let toolResponsePayload;
            if (fc.name === 'lookupTimatic') {
                const toolResult = await runTimaticTool(fc.args.nationality, fc.args.destination, fc.args.transitPoints, fc.args.suggestAlternatives);
                toolResponsePayload = { result: toolResult };
            } else if (fc.name === 'generateSrDocs') {
                toolResponsePayload = runGenerateSrDocsTool(fc.args);
            }
            if (toolResponsePayload) {
                toolResponses.push({ id: fc.id, name: fc.name, response: toolResponsePayload });
            }
        }
        
        if (toolResponses.length > 0) {
            const functionResponseParts: Part[] = toolResponses.map(toolResponse => ({
                functionResponse: { name: toolResponse.name, response: toolResponse.response },
            }));
            
            const finalStream = await chat.sendMessageStream({ message: functionResponseParts });
            
             // Replace thinking messages with a single empty placeholder for the final answer
            setSessions(prev =>
              prev.map(session => {
                if (session.id === activeSessionId) {
                  return { ...session, messages: [...session.messages.slice(0, -functionCalls.length), { role: 'model', content: '' }] };
                }
                return session;
              })
            );
            
            let finalAccumulatedText = "";
            for await (const chunk of finalStream) {
                finalAccumulatedText += chunk.text;
                setSessions(prev =>
                  prev.map(session => {
                    if (session.id === activeSessionId) {
                      const updatedMessages = [...session.messages];
                      updatedMessages[updatedMessages.length - 1] = { ...updatedMessages[updatedMessages.length - 1], content: finalAccumulatedText };
                      return { ...session, messages: updatedMessages };
                    }
                    return session;
                  })
                );
            }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSessions(prev =>
        prev.map(session => {
          if (session.id === activeSessionId) {
            const updatedMessages = [...session.messages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if(lastMessage.role === 'model'){
                 updatedMessages[updatedMessages.length - 1] = { role: 'model', content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.' };
            } else {
                updatedMessages.push({ role: 'model', content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.' })
            }
            return { ...session, messages: updatedMessages };
          }
          return session;
        })
      );
    } finally {
      setIsLoading(false);
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    }
  }, [isLoading, sessions, activeSessionId, activeSession]);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now(),
      title: 'Trò chuyện mới',
      messages: initialMessages,
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleSelectSession = (id: number) => {
    setActiveSessionId(id);
  };

  const handleDeleteSession = (id: number) => {
    setSessions(prev => {
      const newSessions = prev.filter(s => s.id !== id);
      if (activeSessionId === id) {
        if (newSessions.length > 0) {
          setActiveSessionId(newSessions[0].id);
        } else {
          const newSession: ChatSession = { id: Date.now(), title: 'Trò chuyện mới', messages: initialMessages };
          setActiveSessionId(newSession.id);
          return [newSession];
        }
      }
      if (newSessions.length === 0) {
        const newSession: ChatSession = { id: Date.now(), title: 'Trò chuyện mới', messages: initialMessages };
        setActiveSessionId(newSession.id);
        return [newSession];
      }
      return newSessions;
    });
  };

  return (
    <>
      <div className="flex h-screen w-full font-sans">
        <Sidebar 
          onNewChat={handleNewChat}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
        />
        <div className="flex flex-col flex-1 bg-white">
          <Header />
          <ToolsHeader
            onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
            onOpenMessagingModal={() => setIsMessagingModalOpen(true)}
            onOpenGroupFareModal={() => setIsGroupFareModalOpen(true)}
            onOpenLaborTicketModal={() => setIsLaborTicketModalOpen(true)}
            onOpenNearestAirportModal={() => setIsNearestAirportModalOpen(true)}
            onOpenLookupModal={() => setIsLookupModalOpen(true)}
          />
          <ChatWindow messages={messages} isLoading={isLoading} />
          <ChatInput
            input={input}
            setInput={setInput}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            attachedImage={attachedImage}
            setAttachedImage={setAttachedImage}
          />
        </div>
      </div>
      <QuoteModal 
        isOpen={isQuoteModalOpen} 
        onClose={() => setIsQuoteModalOpen(false)}
      />
      <MessagingModal 
        isOpen={isMessagingModalOpen}
        onClose={() => setIsMessagingModalOpen(false)}
      />
      <GroupFareModal
        isOpen={isGroupFareModalOpen}
        onClose={() => setIsGroupFareModalOpen(false)}
      />
       <LaborTicketModal
        isOpen={isLaborTicketModalOpen}
        onClose={() => setIsLaborTicketModalOpen(false)}
      />
      <NearestAirportModal
        isOpen={isNearestAirportModalOpen}
        onClose={() => setIsNearestAirportModalOpen(false)}
      />
      <LookupModal
        isOpen={isLookupModalOpen}
        onClose={() => setIsLookupModalOpen(false)}
      />
    </>
  );
};

export default App;
