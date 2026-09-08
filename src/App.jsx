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
      const title = userContent.length > 25 ? userContent.slice(0, 25) + '...' : (options.attachedFiles?.[0]?.name || 'New Chat');
      const newChat = {
        id: newId,
        title: title,
        messages: [],
      };
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newId);
      chatId = newId;
    } else {
      const chat = chats.find((c) => c.id === chatId);
      if (chat && chat.messages.length === 0) {
        const title = userContent.length > 25 ? userContent.slice(0, 25) + '...' : (options.attachedFiles?.[0]?.name || 'New Chat');
        setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, title } : c)));
      }
    }

    // Check if user is asking for an image generation
    const lowerContent = (userContent || '').toLowerCase();
    const isExplicitImageReq =
      currentModel === 'dall-e-3' ||
      lowerContent.includes('image lagbe') ||
      lowerContent.includes('generate image') ||
      lowerContent.includes('make an image') ||
      lowerContent.includes('draw') ||
      lowerContent.includes('ছবি বানিয়ে') ||
      lowerContent.includes('ছবি তৈরি') ||
      lowerContent.includes('ছবি আঁকো') ||
      lowerContent.includes('ছবি দাও');

    const userMessage = {
      id: `m-${Date.now()}`,
      role: 'user',
      content: userContent || (options.attachedFiles?.length ? 'Attached image/file' : ''),
      attachments: options.attachedFiles || [],
      thinkMode: options.thinkMode,
    };

    const assistantMsgId = `m-${Date.now() + 1}`;
    const assistantMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: isExplicitImageReq ? '🎨 Generating AI image for you...' : '',
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

    // If explicit image generation requested
    if (isExplicitImageReq) {
      try {
        const imgPrompt = userContent || 'A beautiful futuristic artwork';
        const imgResult = await generateImage({ prompt: imgPrompt });
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: `Here is your AI generated image:`,
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

    // Text Stream generation (GPT-4o or GPT-4o-mini with Vision support)
    abortControllerRef.current = new AbortController();

    const currentChat = chats.find((c) => c.id === chatId);
    const prevMessages = (currentChat?.messages || []).map((m) => {
      if (m.attachments && m.attachments.some((a) => a.type === 'image')) {
        const images = m.attachments.filter((a) => a.type === 'image');
        return {
          role: m.role,
          content: [
            { type: 'text', text: m.content || '' },
            ...images.map((img) => ({ type: 'image_url', image_url: { url: img.url } })),
          ],
        };
      }
      return { role: m.role, content: m.content || '' };
    });

    let currentMsgContent = userContent || '';
    if (options.attachedFiles && options.attachedFiles.length > 0) {
      const imageFiles = options.attachedFiles.filter((f) => f.type === 'image');
      if (imageFiles.length > 0) {
        currentMsgContent = [
          { type: 'text', text: userContent || 'Describe this image' },
          ...imageFiles.map((img) => ({ type: 'image_url', image_url: { url: img.url } })),
        ];
      }
    }

    const apiMessages = [...prevMessages, { role: 'user', content: currentMsgContent }];

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

  const handleTriggerDallE = (prompt) => {
    setCurrentModel('dall-e-3');
    handleSendMessage(prompt || 'Generate a creative image');
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
              <ChatMessage
                key={msg.id}
                message={msg}
                onGenerateImageClick={handleTriggerDallE}
              />
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
