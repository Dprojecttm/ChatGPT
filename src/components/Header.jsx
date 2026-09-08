import React from 'react';
import { PanelLeft, Gift, Settings, Moon, Sun, ChevronDown, Sparkles } from 'lucide-react';

export default function Header({
  isSidebarOpen,
  onToggleSidebar,
  currentModel,
  onModelChange,
  theme,
  onToggleTheme,
  onOpenSettings,
}) {
  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {!isSidebarOpen && (
          <button className="icon-btn" onClick={onToggleSidebar} title="Open Sidebar">
            <PanelLeft size={20} />
          </button>
        )}
      </div>

      <div className="header-center-tabs">
        <button className="tab-btn active">Chat</button>
        <button className="tab-btn">+ Work</button>
      </div>

      <div className="header-right">
        {/* Model Selector Pill */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select
            value={currentModel}
            onChange={(e) => onModelChange(e.target.value)}
            style={{
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <optgroup label="OpenAI Flagship">
              <option value="gpt-4o">✨ GPT-4o (Omni - Smartest)</option>
              <option value="gpt-4o-mini">⚡ GPT-4o-mini (Fast & Light)</option>
              <option value="gpt-4-turbo">🔮 GPT-4 Turbo</option>
            </optgroup>
            <optgroup label="Reasoning Models">
              <option value="o1">🧠 o1 (Advanced Reasoning)</option>
              <option value="o1-mini">⚡ o1-mini (Fast Reasoning)</option>
              <option value="o3-mini">🚀 o3-mini (Next-Gen Reasoning)</option>
              <option value="deepseek-r1">🐋 DeepSeek-R1 (Reasoning)</option>
            </optgroup>
            <optgroup label="Other Popular AI">
              <option value="claude-3-5-sonnet">🎭 Claude 3.5 Sonnet</option>
              <option value="gpt-3.5-turbo">💬 GPT-3.5 Turbo</option>
            </optgroup>
            <optgroup label="Image Generation">
              <option value="dall-e-3">🎨 DALL-E 3 (Image Generator)</option>
            </optgroup>
          </select>
        </div>

        <a href="#offer" className="offer-pill" onClick={(e) => { e.preventDefault(); onOpenSettings(); }}>
          <Gift size={14} />
          <span>Free offer</span>
        </a>

        <button className="icon-btn" onClick={onToggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="icon-btn" onClick={onOpenSettings} title="Settings & API Key">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
