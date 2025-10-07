import React, { useState, useCallback, useEffect } from 'react';
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
import { sendMessage } from './services/apiService';
import { useDocuments, type DocumentWithContent } from './hooks/useDocuments';
import { useBookmarks } from './hooks/useBookmarks';
import { useGdsCommands } from './hooks/useGdsCommands';


// Helper function to convert a File object to a base64 string and mimeType.
async function fileToData(file: File): Promise<{ data: string; mimeType: string }> {
  const base64EncodedData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    data: base64EncodedData,
    mimeType: file.type,
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { documents, handleAddDocument, handleDeleteDocument, getDocumentContent, isLoading: docLoading, error: docError } = useDocuments();
  const [contextualDocument, setContextualDocument] = useState<DocumentWithContent | null>(null);
  const { bookmarks, addBookmark, deleteBookmark } = useBookmarks();
  const { commands, addCommand: addGdsCommand, deleteCommand: deleteGdsCommand } = useGdsCommands();

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
  
  const handleUseDocument = async (id: number) => {
    const doc = await getDocumentContent(id);
    if (doc) {
        setContextualDocument(doc);
    }
  };

  const handleClearContext = () => {
      setContextualDocument(null);
  };

  const handleSendMessage = useCallback(async (messageText: string, imageFile: File | null) => {
    if (isLoading || (!messageText.trim() && !imageFile && !contextualDocument)) {
        return;
    }

    let finalMessageText = messageText;
    if (contextualDocument) {
      finalMessageText = `Dựa vào nội dung tài liệu sau đây có tên "${contextualDocument.name}":\n---\n${contextualDocument.content}\n---\nHãy trả lời câu hỏi: ${messageText}`;
    }

    const imageUrl = imageFile ? URL.createObjectURL(imageFile) : undefined;
    const userMessage: Message = { role: 'user', content: messageText, image: imageUrl };
    
    const isNewChat = activeSession?.messages.length === 1;
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
    setContextualDocument(null); // Clear context after sending

    const currentHistory = (activeSession?.messages || []).map(msg => ({ role: msg.role, content: msg.content }));

    try {
        const imagePart = imageFile ? await fileToData(imageFile) : undefined;
        const responseStream = await sendMessage(currentHistory, finalMessageText, imagePart);
        const reader = responseStream.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";
        
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                try {
                    const parsed = JSON.parse(line);
                    if(parsed.text) {
                        accumulatedText += parsed.text;
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
                } catch (e) {
                    console.error("Error parsing stream chunk:", line, e);
                }
            }
        }
    } catch (error) {
        console.error('Error sending message:', error);
        setSessions(prev =>
          prev.map(session => {
            if (session.id === activeSessionId) {
              const updatedMessages = [...session.messages];
              updatedMessages[updatedMessages.length - 1] = {
                role: 'model',
                content: 'Xin lỗi, đã có lỗi kết nối đến máy chủ. Vui lòng thử lại.',
              };
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
  }, [isLoading, sessions, activeSessionId, activeSession, contextualDocument]);

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
      <div className="flex h-screen w-full font-sans overflow-hidden">
        <Sidebar 
          onNewChat={handleNewChat}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          documents={documents}
          onUploadDocument={handleAddDocument}
          onDeleteDocument={handleDeleteDocument}
          onUseDocument={handleUseDocument}
          docLoading={docLoading}
          docError={docError}
          bookmarks={bookmarks}
          onAddBookmark={addBookmark}
          onDeleteBookmark={deleteBookmark}
          gdsCommands={commands}
          onAddGdsCommand={addGdsCommand}
          onDeleteGdsCommand={deleteGdsCommand}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
        <div className="flex flex-col flex-1 bg-white transition-all duration-300 ease-in-out">
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
            contextualDocument={contextualDocument}
            onClearContext={handleClearContext}
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