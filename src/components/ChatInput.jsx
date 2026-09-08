import React, { useState, useRef, useEffect } from 'react';
import { Plus, Mic, ArrowUp, Square, Compass, Sparkles, Image as ImageIcon, X, FileText } from 'lucide-react';

export default function ChatInput({
  onSendMessage,
  isGenerating,
  onStopGeneration,
  currentModel,
  onModelChange,
}) {
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isThinkActive, setIsThinkActive] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const isImageMode = currentModel === 'dall-e-3';

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const processFiles = (files) => {
    const fileList = Array.from(files);
    fileList.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachedFiles((prev) => [
            ...prev,
            {
              id: `f-${Date.now()}-${Math.random()}`,
              name: file.name,
              type: 'image',
              url: e.target.result,
              file: file,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachedFiles((prev) => [
          ...prev,
          {
            id: `f-${Date.now()}-${Math.random()}`,
            name: file.name,
            type: 'document',
            file: file,
          },
        ]);
      }
    });
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handlePaste = (e) => {
    if (e.clipboardData && e.clipboardData.files.length > 0) {
      e.preventDefault();
      processFiles(e.clipboardData.files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if ((!input.trim() && attachedFiles.length === 0) || isGenerating) return;
    onSendMessage(input.trim(), { thinkMode: isThinkActive, attachedFiles });
    setInput('');
    setAttachedFiles([]);
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
    <div
      className={`input-area-wrapper ${isDragging ? 'drag-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,.pdf,.txt,.doc,.docx"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <div className="chat-input-box">
        {/* Attachment Previews */}
        {attachedFiles.length > 0 && (
          <div className="attached-previews-container">
            {attachedFiles.map((file) => (
              <div key={file.id} className="attached-file-badge">
                {file.type === 'image' ? (
                  <img src={file.url} alt={file.name} className="attached-img-preview" />
                ) : (
                  <FileText size={16} color="var(--accent-color)" />
                )}
                <span className="file-name">{file.name}</span>
                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={() => removeFile(file.id)}
                  title="Remove attachment"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          className="chat-textarea"
          rows={1}
          placeholder={
            isImageMode
              ? 'Describe the image you want DALL-E 3 to generate...'
              : 'Ask anything or attach an image...'
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />

        <div className="chat-input-controls">
          <div className="input-tools-left">
            <button
              type="button"
              className="icon-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Add attachment or image (+)"
            >
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
              type="button"
              className={`think-toggle ${isThinkActive ? 'active' : ''}`}
              onClick={() => setIsThinkActive(!isThinkActive)}
              title="Enable deeper reasoning"
            >
              <Sparkles size={14} />
              <span>Think</span>
            </button>

            <button type="button" className="icon-btn" title="Voice Input">
              <Mic size={18} />
            </button>

            {isGenerating ? (
              <button type="button" className="send-btn" onClick={onStopGeneration} title="Stop generation">
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                className="send-btn"
                onClick={handleSubmit}
                disabled={!input.trim() && attachedFiles.length === 0}
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
