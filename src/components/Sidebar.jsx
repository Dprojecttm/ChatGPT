import React from 'react';
import {
  SquarePen,
  PanelLeftClose,
  Search,
  Image as ImageIcon,
  Library,
  Calendar,
  Puzzle,
  FolderKanban,
  Code2,
  MoreHorizontal,
  Trash2,
  MessageSquare,
  Gift,
  Plus,
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onToggle,
  onNewChat,
  chats,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onOpenSettings,
}) {
  return (
    <aside className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
      <div className="sidebar-header">
        <span className="sidebar-brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
            <path d="M12 6v6l4 2" />
          </svg>
          ChatGPT
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className="icon-btn" title="Search">
            <Search size={18} />
          </button>
          <button className="icon-btn" title="Close Sidebar" onClick={onToggle}>
            <PanelLeftClose size={18} />
          </button>
        </div>
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        <SquarePen size={18} />
        New chat
      </button>

      <div className="sidebar-nav-list">
        <div className="nav-item">
          <ImageIcon size={18} />
          <span>Images</span>
        </div>
        <div className="nav-item">
          <Library size={18} />
          <span>Library</span>
        </div>
        <div className="nav-item">
          <Calendar size={18} />
          <span>Scheduled</span>
        </div>
        <div className="nav-item">
          <Puzzle size={18} />
          <span>Plugins</span>
        </div>
        <div className="nav-item">
          <FolderKanban size={18} />
          <span>Projects</span>
        </div>
        <div className="nav-item">
          <Code2 size={18} />
          <span>Codex</span>
        </div>
        <div className="nav-item">
          <MoreHorizontal size={18} />
          <span>More</span>
        </div>
      </div>

      <div className="sidebar-section-title">Recents</div>

      <div className="recent-chats-scroll">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-history-item ${chat.id === activeChatId ? 'active' : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <span className="chat-history-title">{chat.title || 'New Chat'}</span>
            <div className="chat-history-actions">
              <button
                className="icon-btn"
                style={{ padding: '2px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                title="Delete Chat"
              >
                <Trash2 size={14} color="#e53e3e" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile-tile" onClick={onOpenSettings}>
          <div className="user-avatar">JM</div>
          <div className="user-info">
            <span className="user-name">Juwel Miah</span>
            <span className="user-sub">Personal account</span>
          </div>
          <MoreHorizontal size={16} color="var(--text-muted)" />
        </div>

        <button
          className="new-chat-btn"
          style={{ margin: 0, justifyContent: 'center', backgroundColor: 'var(--bg-hover)', border: 'none' }}
          onClick={onOpenSettings}
        >
          <Gift size={16} color="var(--accent-color)" />
          <span>Claim offer / Settings</span>
        </button>
      </div>
    </aside>
  );
}
