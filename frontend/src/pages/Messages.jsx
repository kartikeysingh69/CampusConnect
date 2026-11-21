// src/pages/Messages.jsx — Phase 11: Real-Time Direct Messaging
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getConversations, getChatThread, sendDirectMessage } from '../services/api';
import toast from 'react-hot-toast';
import {
  FaComments,
  FaPaperPlane,
  FaUserCircle,
  FaSearch,
  FaCircle,
  FaUserTie,
  FaGraduationCap,
  FaShieldAlt
} from 'react-icons/fa';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const chatEndRef = useRef(null);

  // Load conversations list
  const loadConversations = async (keepActive = true) => {
    try {
      const { data } = await getConversations();
      const list = Array.isArray(data) ? data : (data?.conversations || []);
      setConversations(list);
      if (!keepActive && list.length > 0 && !activeUser) {
        selectUser(list[0]);
      }
    } catch (err) {
      // ignore poll errors
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    loadConversations(false);
    const interval = setInterval(() => {
      loadConversations(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // When activeUser changes, fetch thread
  useEffect(() => {
    if (!activeUser || !activeUser.id) return;
    let isCurrent = true;

    const fetchThread = async () => {
      try {
        const { data } = await getChatThread(activeUser.id);
        const list = Array.isArray(data) ? data : (data?.messages || []);
        if (isCurrent) {
          setMessages(list);
        }
      } catch (err) {
        // error
      } finally {
        if (isCurrent) setLoadingMessages(false);
      }
    };

    setLoadingMessages(true);
    fetchThread();

    const threadPoll = setInterval(fetchThread, 3000);
    return () => {
      isCurrent = false;
      clearInterval(threadPoll);
    };
  }, [activeUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectUser = (u) => {
    setActiveUser(u);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeUser || !activeUser.id || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const { data } = await sendDirectMessage({
        receiver_id: activeUser.id,
        message: text
      });
      const newMsg = data.data || data;
      setMessages((prev) => [...(Array.isArray(prev) ? prev : []), newMsg]);
      loadConversations(true);
    } catch (err) {
      toast.error('Failed to send message');
      setInputText(text); // restore
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = (Array.isArray(conversations) ? conversations : []).filter(
    (c) =>
      c?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role) => {
    if (role === 'admin') return <FaShieldAlt style={{ color: '#dc2626' }} title="TPO Admin" />;
    if (role === 'recruiter') return <FaUserTie style={{ color: '#2563eb' }} title="Recruiter" />;
    return <FaGraduationCap style={{ color: '#16a34a' }} title="Student" />;
  };

  return (
    <div
      style={{
        maxWidth: '1300px',
        margin: '0 auto',
        padding: '1.5rem 1rem',
        height: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 350px) 1fr',
          gap: '1.25rem',
          background: '#ffffff',
          borderRadius: '18px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9',
          overflow: 'hidden'
        }}
      >
        {/* Left Pane: Contacts & Conversations */}
        <div
          style={{
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            background: '#fafafa'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.2rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#ffffff'
            }}
          >
            <h2
              style={{
                margin: '0 0 0.75rem',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FaComments style={{ color: '#ea580c' }} /> Direct Messages
            </h2>
            <div style={{ position: 'relative' }}>
              <FaSearch
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '0.85rem'
                }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidates or recruiters..."
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 34px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Conversations list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {loadingConv ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>
                Loading contacts...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                No conversations found.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = activeUser?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => selectUser(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 0.9rem',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      marginBottom: '4px',
                      background: isSelected ? '#ffedd5' : '#ffffff',
                      border: isSelected ? '1px solid #fed7aa' : '1px solid #f1f5f9',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: isSelected ? '#ea580c' : '#e2e8f0',
                          color: isSelected ? '#ffffff' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.05rem'
                        }}
                      >
                        {c.name?.charAt(0).toUpperCase()}
                      </div>
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          fontSize: '0.75rem'
                        }}
                      >
                        {getRoleIcon(c.role)}
                      </span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span
                          style={{
                            fontWeight: isSelected ? 800 : 700,
                            color: isSelected ? '#c2410c' : '#0f172a',
                            fontSize: '0.92rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {c.name}
                        </span>
                        {c.unread_count > 0 && (
                          <span
                            style={{
                              background: '#ea580c',
                              color: '#fff',
                              borderRadius: '10px',
                              padding: '1px 6px',
                              fontSize: '0.7rem',
                              fontWeight: 800
                            }}
                          >
                            {c.unread_count}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#64748b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '2px'
                        }}
                      >
                        {c.company_name ? `${c.company_name} HR` : c.email}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Message Thread */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
          {activeUser ? (
            <>
              {/* Active Chat Header */}
              <div
                style={{
                  padding: '1rem 1.4rem',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#ea580c',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800
                    }}
                  >
                    {activeUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                      {activeUser.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b' }}>
                      {getRoleIcon(activeUser.role)}
                      <span style={{ textTransform: 'capitalize' }}>
                        {activeUser.company_name ? `${activeUser.company_name} Recruiter` : activeUser.role}
                      </span>
                      <span>•</span>
                      <span>{activeUser.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div
                style={{
                  flex: 1,
                  padding: '1.2rem',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  background: '#f8fafc'
                }}
              >
                {loadingMessages ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    Loading message history...
                  </div>
                ) : (!messages || messages.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No messages yet. Send a message to start the conversation!
                  </div>
                ) : (
                  (Array.isArray(messages) ? messages : []).map((m) => {
                    const isMe = m.sender_id === user.id;
                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div
                          style={{
                            background: isMe ? '#ea580c' : '#ffffff',
                            color: isMe ? '#ffffff' : '#1e293b',
                            padding: '10px 15px',
                            borderRadius: isMe
                              ? '14px 14px 2px 14px'
                              : '14px 14px 14px 2px',
                            boxShadow: isMe
                              ? '0 2px 6px rgba(234, 88, 12, 0.2)'
                              : '0 2px 5px rgba(0,0,0,0.04)',
                            border: isMe ? 'none' : '1px solid #e2e8f0',
                            fontSize: '0.9rem',
                            lineHeight: 1.5,
                            wordBreak: 'break-word'
                          }}
                        >
                          {m.message}
                        </div>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: '#94a3b8',
                            marginTop: '3px',
                            padding: '0 4px'
                          }}
                        >
                          {new Date(m.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSend}
                style={{
                  padding: '0.85rem 1.2rem',
                  borderTop: '1px solid #e2e8f0',
                  background: '#ffffff',
                  display: 'flex',
                  gap: '0.75rem'
                }}
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Type a message to ${activeUser.name}...`}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#ea580c')}
                  onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  style={{
                    background: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0 1.4rem',
                    fontWeight: 700,
                    cursor: !inputText.trim() || sending ? 'not-allowed' : 'pointer',
                    opacity: !inputText.trim() || sending ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FaPaperPlane />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                padding: '2rem'
              }}
            >
              <FaComments style={{ fontSize: '3.5rem', marginBottom: '1rem', color: '#cbd5e1' }} />
              <h3 style={{ margin: 0, color: '#475569' }}>Select a conversation</h3>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>
                Choose a candidate, recruiter, or placement officer from the left to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}