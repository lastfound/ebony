import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hello! I'm Ebony AI, your personal dining concierge. What are you looking for tonight?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      // Adjust URL based on actual env setup. Assuming standard public api structure.
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const res = await axios.post(`${apiUrl}/ai/chat`, {
        message: userMsg,
        conversation_id: conversationId
      });

      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'model', content: res.data.message }]);
        if (res.data.conversation_id && !conversationId) {
          setConversationId(res.data.conversation_id);
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', content: res.data.message || 'Maaf, terjadi kesalahan.' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: 'Gagal terhubung ke AI Service.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (text) => {
    setInput(text);
  };

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999
        }}
      >
        {!isOpen && (
          <button 
            onClick={() => setIsOpen(true)}
            style={{
              backgroundColor: '#1a1a1a',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ✨ Ask Ebony AI
          </button>
        )}

        {isOpen && (
          <div 
            style={{
              width: '350px',
              height: '500px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid #eaeaea'
            }}
          >
            {/* Header */}
            <div style={{ backgroundColor: '#1a1a1a', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Ebony AI</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Your personal dining concierge</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#f9f9f9' }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: '16px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    backgroundColor: msg.role === 'user' ? '#1a1a1a' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#1a1a1a',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    maxWidth: '85%',
                    border: msg.role === 'user' ? 'none' : '1px solid #eaeaea',
                    fontSize: '0.9rem',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ backgroundColor: '#fff', color: '#1a1a1a', padding: '10px 14px', borderRadius: '8px', border: '1px solid #eaeaea', fontSize: '0.9rem' }}>
                    Typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div style={{ padding: '8px 16px', display: 'flex', flexWrap: 'wrap', gap: '8px', backgroundColor: '#f9f9f9' }}>
                {['🍽️ Recommend a menu', '❤️ Romantic dinner', '📅 Help me reserve'].map(action => (
                  <button 
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    style={{
                      background: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '16px',
                      padding: '6px 10px',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ borderTop: '1px solid #eaeaea', padding: '12px', display: 'flex', gap: '8px', backgroundColor: 'white' }}>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  outline: 'none'
                }}
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                style={{
                  backgroundColor: '#1a1a1a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0 16px',
                  cursor: (isLoading || !input.trim()) ? 'default' : 'pointer',
                  opacity: (isLoading || !input.trim()) ? 0.6 : 1
                }}
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
