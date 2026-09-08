import React, { useState, useEffect } from 'react';
import { X, Key, Globe, ExternalLink, Check, ShieldCheck } from 'lucide-react';
import { getApiKey, setApiKey, getApiBaseUrl, setApiBaseUrl } from '../services/openai';

export default function ApiKeyModal({ isOpen, onClose }) {
  const [apiKey, setKey] = useState('');
  const [baseUrl, setBase] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKey(getApiKey());
      setBase(getApiBaseUrl());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setApiKey(apiKey);
    setApiBaseUrl(baseUrl);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={20} color="var(--accent-color)" />
            <h3>OpenAI API Key & Configuration</h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-input-group">
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>OpenAI API Key:</span>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--accent-color)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Get API Key <ExternalLink size={12} />
              </a>
            </label>
            <input
              type="password"
              className="modal-input"
              placeholder="sk-proj-..."
              value={apiKey}
              onChange={(e) => setKey(e.target.value)}
              autoFocus
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              আপনার API Key কেবল আপনার ব্রাউজারে সুরক্ষিত থাকবে।
            </span>
          </div>

          <div className="modal-input-group">
            <label>API Base URL (Optional / Proxy):</label>
            <input
              type="text"
              className="modal-input"
              placeholder="https://api.openai.com/v1"
              value={baseUrl}
              onChange={(e) => setBase(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px' }}>
            <ShieldCheck size={20} color="var(--accent-color)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              সহজ টেক্সট জেনারেশন (GPT-4o / GPT-4o-mini) এবং ইমেজ জেনারেশন (DALL-E 3) সাপোর্ট করবে।
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-black"
              style={{
                backgroundColor: savedSuccess ? 'var(--accent-color)' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {savedSuccess ? (
                <>
                  <Check size={14} /> Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
