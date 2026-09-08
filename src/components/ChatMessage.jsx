import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check, Download, Bot, User, Sparkles, Image as ImageIcon, FileText } from 'lucide-react';

export default function ChatMessage({ message, onGenerateImageClick }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      {!isUser && (
        <div className="assistant-avatar">
          <Bot size={18} color="var(--accent-color)" />
        </div>
      )}

      <div className="message-bubble">
        {message.thinkMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <Sparkles size={13} color="var(--accent-color)" />
            <span>Thought process complete</span>
          </div>
        )}

        {isUser ? (
          <div>
            {/* User Attached Files/Images */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="user-attachments-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                {message.attachments.map((att) => (
                  <div key={att.id || att.name} className="user-attachment-item">
                    {att.type === 'image' || att.url ? (
                      <img
                        src={att.url}
                        alt={att.name}
                        style={{ maxWidth: '240px', maxHeight: '180px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-hover)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                        <FileText size={14} color="var(--accent-color)" />
                        <span>{att.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
          </div>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');

                  if (!inline && match) {
                    return (
                      <div style={{ position: 'relative', margin: '12px 0' }}>
                        <div className="code-header">
                          <span>{match[1]}</span>
                          <button
                            className="code-copy-btn"
                            onClick={() => handleCopyText(codeString)}
                          >
                            {copied ? (
                              <>
                                <Check size={12} color="#10a37f" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy size={12} /> Copy code
                              </>
                            )}
                          </button>
                        </div>
                        <pre style={{ margin: 0 }}>
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    );
                  }
                  return (
                    <code className={className} style={{ background: 'var(--bg-hover)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.88em' }} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>

            {/* Quick DALL-E Image Generation Button if prompt asked for an image */}
            {message.canGenerateImage && onGenerateImageClick && (
              <div style={{ marginTop: '12px' }}>
                <button
                  onClick={() => onGenerateImageClick(message.userPrompt)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '999px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(236,72,153,0.3)',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <ImageIcon size={16} />
                  <span>🎨 DALL-E 3 দিয়ে ছবি তৈরি করুন</span>
                </button>
              </div>
            )}

            {/* If message contains a generated image */}
            {message.imageUrl && (
              <div className="generated-image-card" style={{ marginTop: '12px' }}>
                <img
                  src={message.imageUrl}
                  alt={message.imagePrompt || 'Generated AI Image'}
                  style={{ width: '100%', maxWidth: '512px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'block' }}
                />
                <div
                  className="generated-image-footer"
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '340px' }}>
                    🎨 Prompt: "{message.imagePrompt}"
                  </span>
                  <a
                    href={message.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    download="dall-e-image.png"
                    style={{
                      color: 'var(--accent-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'none',
                      fontWeight: 600,
                      background: 'var(--bg-hover)',
                      padding: '4px 10px',
                      borderRadius: '8px',
                    }}
                  >
                    <Download size={14} /> Download
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="assistant-avatar" style={{ background: 'var(--accent-color)', color: '#fff' }}>
          <User size={16} />
        </div>
      )}
    </div>
  );
}
