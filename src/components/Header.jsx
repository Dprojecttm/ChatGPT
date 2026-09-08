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
            <option value="gpt-4o">GPT-4o (Smartest)</option>
            <option value="gpt-4o-mini">GPT-4o-mini (Fast & Light)</option>
            <option value="dall-e-3">🎨 DALL-E 3 (Image Generator)</option>
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
