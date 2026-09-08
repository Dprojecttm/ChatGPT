import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check, Download, ExternalLink, Bot, User, Sparkles } from 'lucide-react';

export default function ChatMessage({ message }) {
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
          <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
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

            {/* If message contains a DALL-E generated image */}
            {message.imageUrl && (
              <div className="generated-image-card">
                <img src={message.imageUrl} alt={message.imagePrompt || 'Generated AI Image'} />
                <div className="generated-image-footer">
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                    🎨 DALL-E 3: {message.imagePrompt}
                  </span>
                  <a
                    href={message.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    download="dall-e-image.png"
                    style={{ color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    <Download size={14} /> Save
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
