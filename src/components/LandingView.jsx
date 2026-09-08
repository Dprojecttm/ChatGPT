import React from 'react';
import { Image as ImageIcon, Code, Sparkles, Layout } from 'lucide-react';

export default function LandingView({ onSelectPrompt }) {
  const samplePrompts = [
    {
      icon: <ImageIcon size={18} color="#10a37f" />,
      title: 'Promotional Image Creation',
      desc: 'DALL-E 3 দিয়ে সোশ্যাল মিডিয়া বা ব্র্যান্ডের আকর্ষণীয় ছবি বানান',
      prompt: 'Create a modern, sleek promotional banner for an AI tech startup with vibrant gradients and clean typography.',
    },
    {
      icon: <Code size={18} color="#3b82f6" />,
      title: 'Pine Script MT5 রূপান্তর',
      desc: 'TradingView Pine script কোডকে MetaTrader 5 MQL5-এ রূপান্তর করুন',
      prompt: 'Can you help me convert a TradingView Pine Script strategy into MetaTrader 5 (MQL5)?',
    },
    {
      icon: <Layout size={18} color="#ec4899" />,
      title: 'ওয়েবসাইট ল্যান্ডিং পেজ ডিজাইন',
      desc: 'একটি হাই-কনভার্সন SaaS ল্যান্ডিং পেজের HTML/CSS টেমপ্লেট লিখুন',
      prompt: 'Write HTML and CSS code for a high-converting dark-mode SaaS product landing page.',
    },
    {
      icon: <Sparkles size={18} color="#eab308" />,
      title: 'সিস্টেম প্রম্পট লেখা',
      desc: 'কাস্টম এআই এজেন্টের জন্য অপটিমাইজড সিস্টেম ইন্সট্রাকশন তৈরি',
      prompt: 'Write an optimized system prompt for an expert senior React developer AI assistant.',
    },
  ];

  return (
    <div className="landing-container">
      <h1 className="landing-title">What's on your mind today?</h1>

      <div className="quick-prompts-grid">
        {samplePrompts.map((item, idx) => (
          <div key={idx} className="prompt-card" onClick={() => onSelectPrompt(item.prompt)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {item.icon}
              <span className="prompt-card-title">{item.title}</span>
            </div>
            <span className="prompt-card-desc">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
