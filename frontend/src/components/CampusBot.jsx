// src/components/CampusBot.jsx — Phase 9: AI Placement Assistant & Copilot
import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaComments,
  FaBriefcase,
  FaCalendarAlt,
  FaFileAlt,
  FaLightbulb,
  FaUserGraduate,
  FaMinus
} from 'react-icons/fa';

export default function CampusBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 Hi! I'm **CampusBot**, your AI Placement Copilot. Ask me about active drives, eligibility, upcoming interviews, or resume preparation tips!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const { data } = await sendChatMessage(textToSend);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: data.reply || 'Sorry, I could not process that request.' }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: '⚠️ I encountered an error connecting to CampusBot server. Please try again in a moment.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'Active Drives', text: 'What active campus placement drives are available right now?' },
    { label: 'Next Interview', text: 'When is my next interview or placement round?' },
    { label: 'ATS Tips', text: 'Give me top ATS resume tips to get shortlisted' },
    { label: 'Highest CTC', text: 'What is the highest package offered so far in the drives?' }
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#ea580c',
            color: '#fff',
            border: 'none',
            borderRadius: '50px',
            padding: '14px 22px',
            boxShadow: '0 10px 25px -5px rgba(234, 88, 12, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 700,
            fontSize: '0.98rem',
            zIndex: 9999,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          title="Open CampusBot AI Assistant"
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FaRobot style={{ fontSize: '1.35rem' }} />
            <span
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                width: '8px',
                height: '8px',
                backgroundColor: '#22c55e',
                borderRadius: '50%',
                border: '1.5px solid #fff'
              }}
            />
          </div>
          <span>CampusBot AI</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '390px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 48px)',
            backgroundColor: '#ffffff',
            borderRadius: '18px',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 10000,
            animation: 'fadeInUp 0.25s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
              color: '#ffffff',
              padding: '1rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}
              >
                <FaRobot />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>CampusBot Copilot</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', opacity: 0.9 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                  <span>Online • Ready to assist</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '6px 8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
                title="Minimize"
              >
                <FaMinus />
              </button>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#fff7ed',
              borderBottom: '1px solid #fed7aa',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              scrollbarWidth: 'none'
            }}
          >
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.text)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #fdba74',
                  color: '#c2410c',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#ffedd5')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#ffffff')}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              backgroundColor: '#f8fafc'
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: m.sender === 'user' ? '#ea580c' : '#ffffff',
                  color: m.sender === 'user' ? '#ffffff' : '#1e293b',
                  padding: '10px 14px',
                  borderRadius:
                    m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  boxShadow:
                    m.sender === 'user'
                      ? '0 2px 5px rgba(234, 88, 12, 0.2)'
                      : '0 2px 5px rgba(0, 0, 0, 0.04)',
                  border: m.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                  fontSize: '0.88rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#ffffff',
                  color: '#64748b',
                  padding: '8px 14px',
                  borderRadius: '14px 14px 14px 2px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span className="dot-pulse">CampusBot is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '0.75rem',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask CampusBot anything..."
              disabled={loading}
              style={{
                flex: 1,
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '0.88rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#ea580c')}
              onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                backgroundColor: '#ea580c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0 14px',
                cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                opacity: !input.trim() || loading ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.95rem'
              }}
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  );
}