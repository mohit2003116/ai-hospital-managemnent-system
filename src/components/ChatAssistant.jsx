import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, User, Bot, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! I am your HealthAdmin Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setInput('');

    // Simulate AI Response
    setTimeout(() => {
      let botResponse = '';
      const lowerInput = userMessage.toLowerCase();

      if (lowerInput.includes('appointment') || lowerInput.includes('book')) {
        botResponse = 'You can book an appointment by going to the Appointments section. Would you like me to take you there?';
      } else if (lowerInput.includes('doctor') || lowerInput.includes('find')) {
        botResponse = 'I can help you find specialized doctors nearby. Check our "Find Help" section for real-time location tracking.';
      } else if (lowerInput.includes('fever') || lowerInput.includes('sick')) {
        botResponse = 'I am sorry to hear you are feeling unwell. You should use our "AI Symptom Checker" for a preliminary analysis or consult a doctor immediately if it is an emergency.';
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        botResponse = 'Hi there! I am here to help you navigate the hospital system. What do you need help with?';
      } else {
        botResponse = 'That is a great question. For specific medical advice, please consult one of our qualified doctors. I can help you find one or book an appointment!';
      }

      setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
    }, 1000);
  };

  const handleLinkClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{ 
          width: '350px', 
          height: '500px', 
          backgroundColor: 'var(--bg-card)', 
          borderRadius: 'var(--radius-lg)', 
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Bot size={24} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Health Assistant</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Online • Ready to help</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ 
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                display: 'flex',
                gap: '0.5rem',
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row'
              }}>
                <div style={{ 
                  width: '30px', 
                  height: '30px', 
                  borderRadius: '50%', 
                  backgroundColor: m.role === 'user' ? 'var(--bg-main)' : 'rgba(79, 70, 229, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: m.role === 'user' ? 'var(--text-main)' : 'var(--primary)',
                  flexShrink: 0
                }}>
                  {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div style={{ 
                  padding: '0.75rem', 
                  borderRadius: '12px', 
                  fontSize: '0.875rem', 
                  backgroundColor: m.role === 'user' ? 'var(--primary)' : 'var(--bg-main)',
                  color: m.role === 'user' ? 'white' : 'var(--text-main)',
                  borderTopRightRadius: m.role === 'user' ? '0' : '12px',
                  borderTopLeftRadius: m.role === 'bot' ? '0' : '12px',
                  lineHeight: '1.4'
                }}>
                  {m.content}
                  
                  {/* Action Suggestions */}
                  {m.role === 'bot' && m.content.includes('Appointments') && (
                    <button 
                      onClick={() => handleLinkClick('/appointments')}
                      style={{ 
                        marginTop: '0.75rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.4rem', 
                        backgroundColor: 'white', 
                        color: 'var(--primary)', 
                        border: 'none', 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <ExternalLink size={12} /> Go to Appointments
                    </button>
                  )}
                  {m.role === 'bot' && m.content.includes('Find Help') && (
                    <button 
                      onClick={() => handleLinkClick('/nearby-help')}
                      style={{ 
                        marginTop: '0.75rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.4rem', 
                        backgroundColor: 'white', 
                        color: 'var(--primary)', 
                        border: 'none', 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <ExternalLink size={12} /> Find Doctors Nearby
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Type your question..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ borderRadius: '20px', padding: '0.5rem 1rem' }}
            />
            <button 
              type="submit" 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--primary)', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
