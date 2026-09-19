import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const INITIAL_MESSAGES = [
  { 
    role: 'model', 
    content: "Halo! Saya Ebony AI 🍷 — dining concierge pribadi Anda di Ebony Indonesia, Baturaden.\n\nAda yang bisa saya bantu hari ini? Saya siap membantu reservasi meja, merekomendasikan menu, atau menjawab pertanyaan seputar cafe kami 😊",
    options: [
      '📅 Reservasi Meja',
      '🍽️ Rekomendasi Menu',
      '📍 Lokasi & Jam Buka',
      '🎂 Ada Acara Spesial',
      '💬 Hi, I speak English!'
    ]
  }
];

export default function FloatingAIChat() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Ambil conversationId dari sessionStorage agar ingatan AI tetap tersimpan selama sesi browsing
  const [conversationId, setConversationId] = useState(() => {
    return sessionStorage.getItem('ebony_ai_conversation_id') || null;
  });
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const updateConversationId = (newId) => {
    setConversationId(newId);
    if (newId) {
      sessionStorage.setItem('ebony_ai_conversation_id', newId);
    } else {
      sessionStorage.removeItem('ebony_ai_conversation_id');
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    // Tampilan visual selalu bersih saat dibuka kembali, tetapi memori percakapan tetap tersimpan di backend via conversationId
    setMessages(INITIAL_MESSAGES);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Bersihkan layar chat visual agar saat dibuka nanti tetap bersih
    setMessages(INITIAL_MESSAGES);
  };

  const handleResetConversation = () => {
    // Tombol untuk mulai topik baru dari awal jika pengguna benar-benar ingin menghapus ingatan sebelumnya
    updateConversationId(null);
    setMessages(INITIAL_MESSAGES);
  };

  const sendMessage = async (userText) => {
    const text = (userText || '').trim();
    if (!text || isLoading) return;

    // Handle special option clicks
    if (text.includes('WhatsApp Admin') || text.includes('WhatsApp')) {
      window.open('https://wa.me/6288239386759', '_blank');
      return;
    }

    // "Coba Lagi" → resend the last user message
    let messageToSend = text;
    if (text.includes('Coba Lagi')) {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
      if (lastUserMsg) {
        messageToSend = lastUserMsg.content;
      }
      // Remove the error message from display
      setMessages(prev => prev.filter((m, i) => i < prev.length - 1 || m.role !== 'model'));
    } else {
      setMessages(prev => [...prev, { role: 'user', content: text }]);
    }

    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const res = await axios.post(`${apiUrl}/ai/chat`, {
        message: messageToSend,
        conversation_id: conversationId
      }, { timeout: 60000 });

      if (res.data.success) {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'model', 
            content: res.data.message,
            options: Array.isArray(res.data.options) ? res.data.options : [],
            whatsappLink: res.data.whatsapp_link || null,
            reservationData: res.data.reservation_data || null,
            bookingNumber: res.data.booking_number || null
          }
        ]);
        if (res.data.conversation_id && res.data.conversation_id !== conversationId) {
          updateConversationId(res.data.conversation_id);
        }
      } else {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'model', 
            content: res.data.message || 'Mohon maaf, terjadi kendala pada sistem AI kami.',
            options: Array.isArray(res.data.options) ? res.data.options : ['🔄 Coba Lagi', '📱 Hubungi WhatsApp Admin']
          }
        ]);
        if (res.data.conversation_id && res.data.conversation_id !== conversationId) {
          updateConversationId(res.data.conversation_id);
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev, 
        { 
          role: 'model', 
          content: 'Mohon maaf, koneksi ke server terputus. Silakan coba lagi atau hubungi Admin via WhatsApp.',
          options: ['🔄 Coba Lagi', '📱 Hubungi WhatsApp Admin']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Do not render on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

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
            onClick={handleOpen}
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
              width: '375px',
              height: '530px',
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: 'calc(100vh - 80px)',
              backgroundColor: 'white',
              borderRadius: '14px',
              boxShadow: '0 10px 32px rgba(0,0,0,0.22)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid #eaeaea'
            }}
          >
            {/* Header */}
            <div style={{ backgroundColor: '#1a1a1a', color: 'white', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>Ebony AI</h3>
                  {conversationId && (
                    <span style={{ fontSize: '0.65rem', backgroundColor: '#2e2e2e', color: '#4ade80', padding: '2px 7px', borderRadius: '10px' }}>
                      ● Memori Aktif
                    </span>
                  )}
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', opacity: 0.75 }}>Your personal dining concierge</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {conversationId && (
                  <button 
                    onClick={handleResetConversation}
                    title="Mulai topik baru (hapus ingatan sebelumnya)"
                    style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#eee', fontSize: '0.72rem', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    🔄 Baru
                  </button>
                )}
                <button 
                  onClick={handleClose}
                  style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.25rem', cursor: 'pointer', lineHeight: 1 }}
                  title="Tutup"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#f9f9f9' }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    backgroundColor: msg.role === 'user' ? '#1a1a1a' : '#fff',
                    color: msg.role === 'user' ? '#fff' : '#1a1a1a',
                    padding: '11px 15px',
                    borderRadius: '12px',
                    maxWidth: '88%',
                    border: msg.role === 'user' ? 'none' : '1px solid #eaeaea',
                    fontSize: '0.88rem',
                    lineHeight: '1.48',
                    whiteSpace: 'pre-wrap',
                    boxShadow: msg.role === 'user' ? '0 1px 2px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.04)'
                  }}>
                    {msg.content}
                  </div>

                  {/* Interactive Option Chips / Pills */}
                  {msg.role === 'model' && Array.isArray(msg.options) && msg.options.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', maxWidth: '95%' }}>
                      {msg.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => sendMessage(opt)}
                          disabled={isLoading}
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #222',
                            color: '#1a1a1a',
                            borderRadius: '18px',
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            cursor: isLoading ? 'default' : 'pointer',
                            fontWeight: 600,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            transition: 'all 0.15s ease',
                            textAlign: 'left'
                          }}
                          onMouseEnter={(e) => {
                            if (!isLoading) {
                              e.currentTarget.style.backgroundColor = '#1a1a1a';
                              e.currentTarget.style.color = '#ffffff';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isLoading) {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.color = '#1a1a1a';
                            }
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Booking tersimpan di database */}
                  {msg.role === 'model' && msg.bookingNumber && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '10px',
                      padding: '10px 14px',
                      backgroundColor: '#e8f5e9',
                      border: '1px solid #a5d6a7',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      color: '#1b5e20',
                      maxWidth: '95%'
                    }}>
                      <span style={{ fontSize: '1.1rem' }}>✅</span>
                      <div>
                        <strong>Reservasi tersimpan di sistem!</strong> Kode Booking: <strong>#{msg.bookingNumber}</strong>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Reservation Button */}
                  {msg.role === 'model' && msg.whatsappLink && (
                    <a
                      href={msg.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginTop: '10px',
                        padding: '11px 20px',
                        backgroundColor: '#25D366',
                        color: '#ffffff',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        boxShadow: '0 3px 10px rgba(37, 211, 102, 0.35)',
                        transition: 'all 0.2s ease',
                        maxWidth: '95%',
                        cursor: 'pointer',
                        animation: 'waButtonPulse 2s ease-in-out infinite'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1ebe57';
                        e.currentTarget.style.transform = 'scale(1.03)';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 211, 102, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#25D366';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 3px 10px rgba(37, 211, 102, 0.35)';
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Kirim Reservasi ke WhatsApp Admin
                    </a>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ backgroundColor: '#fff', color: '#666', padding: '10px 14px', borderRadius: '10px', border: '1px solid #eaeaea', fontSize: '0.85rem' }}>
                    ✨ Ebony AI sedang merespon...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} style={{ borderTop: '1px solid #eaeaea', padding: '12px', display: 'flex', gap: '8px', backgroundColor: 'white' }}>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pesan atau klik opsi di atas..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '20px',
                  border: '1px solid #ddd',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
              <button 
                type="submit" 
                disabled={isLoading}
                style={{
                  backgroundColor: '#1a1a1a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '0 18px',
                  fontWeight: 'bold',
                  fontSize: '0.88rem',
                  cursor: isLoading ? 'default' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                Kirim
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
