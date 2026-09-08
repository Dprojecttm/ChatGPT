import React, { useState, useRef, useEffect } from 'react';
import { Plus, Mic, ArrowUp, Square, Compass, Sparkles, Image as ImageIcon, X } from 'lucide-react';

export default function ChatInput({
  onSendMessage,
  isGenerating,
  onStopGeneration,
  currentModel,
  onModelChange,
}) {
  const [input, setInput] = useState('');
  const [isThinkActive, setIsThinkActive] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const textareaRef = useRef(null);

  const isImageMode = currentModel === 'dall-e-3';

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim(), { thinkMode: isThinkActive });
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="input-area-wrapper">
      <div className="chat-input-box">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          rows={1}
          placeholder={isImageMode ? 'Describe the image you want DALL-E 3 to generate...' : 'Ask anything'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="chat-input-controls">
          <div className="input-tools-left">
            <button className="icon-btn" title="Add attachment or file">
              <Plus size={18} />
            </button>
            
            <div className="tool-badge">
              <Compass size={14} color="#10a37f" />
              <span>vidIQ</span>
            </div>

            <div
              className={`tool-badge ${isImageMode ? 'active' : ''}`}
              onClick={() => onModelChange(isImageMode ? 'gpt-4o-mini' : 'dall-e-3')}
            >
              <ImageIcon size={14} color={isImageMode ? '#ec4899' : 'currentColor'} />
              <span>{isImageMode ? 'Image Mode On' : 'Image Gen'}</span>
            </div>
          </div>

          <div className="input-actions-right">
            <button
              className={`think-toggle ${isThinkActive ? 'active' : ''}`}
              onClick={() => setIsThinkActive(!isThinkActive)}
              title="Enable deeper reasoning"
            >
              <Sparkles size={14} />
              <span>Think</span>
            </button>

            <button className="icon-btn" title="Voice Input">
              <Mic size={18} />
            </button>

            {isGenerating ? (
              <button className="send-btn" onClick={onStopGeneration} title="Stop generation">
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button
                className="send-btn"
                onClick={handleSubmit}
                disabled={!input.trim()}
                title="Send message"
              >
                <ArrowUp size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {showBanner && (
        <div className="codex-banner">
          <div className="codex-banner-text">
            <h4>Meet Codex in the desktop app</h4>
            <p>A coding agent that helps you build and ship with AI, included for free in your ChatGPT plan.</p>
          </div>
          <div className="codex-banner-btns">
            <button className="btn-black">Download the app</button>
            <button className="btn-outline">Learn more</button>
            <button className="icon-btn" style={{ padding: '4px' }} onClick={() => setShowBanner(false)}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
