import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LandingView from './components/LandingView';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';
import ApiKeyModal from './components/ApiKeyModal';
import { generateTextStream, generateImage, getApiKey } from './services/openai';

const INITIAL_CHATS = [
  { id: 'c-1', title: 'ওয়েবসাইট ল্যান্ডিং পেজ তুলনা', messages: [] },
  { id: 'c-2', title: 'আলাপ অনুবাদ', messages: [] },
  { id: 'c-3', title: 'ThemeFlex Brand Guide', messages: [] },
  { id: 'c-4', title: 'ব্র্যান্ড কিট মনে রাখা', messages: [] },
  { id: 'c-5', title: 'ট্র্যাকিং অপসারণ', messages: [] },
  { id: 'c-6', title: 'Promotional Image Creation', messages: [] },
  { id: 'c-7', title: 'ব্র্যান্ড নাম পরিবর্তন', messages: [] },
  { id: 'c-8', title: 'Pine Script MT5 রূপান্তর', messages: [] },
  { id: 'c-9', title: 'রূপান্তর কোড লেখা', messages: [] },
  { id: 'c-10', title: 'সিস্টেম প্রম্পট লেখা', messages: [] },
];

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('chatgpt_theme') || 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState('gpt-4o');

  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('chatgpt_history');
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  const [activeChatId, setActiveChatId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chatgpt_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('chatgpt_history', JSON.stringify(chats));
  }, [chats]);

  const activeChat = chats.find((c) => c.id === activeChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isGenerating]);

  const handleNewChat = () => {
    const newId = `c-${Date.now()}`;
    const newChat = {
      id: newId,
      title: 'New chat',
      messages: [],
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newId);
  };

  const handleDeleteChat = (id) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
    }
  };

  const handleSendMessage = async (userContent, options = {}) => {
    let chatId = activeChatId;

    if (!chatId) {
      const newId = `c-${Date.now()}`;
      const title = userContent.length > 25 ? userContent.slice(0, 25) + '...' : userContent;
      const newChat = {
        id: newId,
        title: title,
        messages: [],
      };
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newId);
      chatId = newId;
    } else {
      // Update title if first message
      const chat = chats.find((c) => c.id === chatId);
      if (chat && chat.messages.length === 0) {
        const title = userContent.length > 25 ? userContent.slice(0, 25) + '...' : userContent;
        setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, title } : c)));
      }
    }

    const userMessage = {
      id: `m-${Date.now()}`,
      role: 'user',
      content: userContent,
      thinkMode: options.thinkMode,
    };

    const assistantMsgId = `m-${Date.now() + 1}`;
    const assistantMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: currentModel === 'dall-e-3' ? '🎨 Generating DALL-E 3 image...' : '',
      thinkMode: options.thinkMode,
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, userMessage, assistantMessage] }
          : c
      )
    );

    setIsGenerating(true);

    if (currentModel === 'dall-e-3') {
      try {
        const imgResult = await generateImage({ prompt: userContent });
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: `Here is your generated image for: **"${userContent}"**`,
                          imageUrl: imgResult.url,
                          imagePrompt: imgResult.revised_prompt,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      } catch (err) {
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: `❌ Image Generation Failed: ${err.message}` }
                      : m
                  ),
                }
              : c
          )
        );
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // Text Stream generation (GPT-4o or GPT-4o-mini)
    abortControllerRef.current = new AbortController();

    const currentChat = chats.find((c) => c.id === chatId);
    const prevMessages = (currentChat?.messages || []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const apiMessages = [
      ...prevMessages,
      { role: 'user', content: userContent },
    ];

    await generateTextStream({
      messages: apiMessages,
      model: currentModel,
      signal: abortControllerRef.current.signal,
      onChunk: (chunkText) => {
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: chunkText } : m
                  ),
                }
              : c
          )
        );
      },
      onFinish: () => {
        setIsGenerating(false);
      },
      onError: (err) => {
        setIsGenerating(false);
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: `❌ API Error: ${err.message}` }
                      : m
                  ),
                }
              : c
          )
        );
      },
    });
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
  };

  return (
    <div className="app-container">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewChat={handleNewChat}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onDeleteChat={handleDeleteChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="main-content">
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          currentModel={currentModel}
          onModelChange={setCurrentModel}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {activeChat && activeChat.messages.length > 0 ? (
          <div className="messages-container">
            {activeChat.messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <LandingView onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
        )}

        <ChatInput
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          onStopGeneration={handleStopGeneration}
          currentModel={currentModel}
          onModelChange={setCurrentModel}
        />
      </main>

      <ApiKeyModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
