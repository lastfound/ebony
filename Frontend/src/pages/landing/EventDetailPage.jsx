import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { getEvents } from '../../api/publicApi';

export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulasi pengambilan data event berdasarkan ID
    getEvents()
      .then((data) => {
        const found = data.find(e => e.id.toString() === id);
        setEvent(found || {
          id,
          title: 'Special Event',
          description: 'Detail lengkap mengenai event ini akan segera diumumkan. Pastikan Anda tidak ketinggalan acara spesial kami yang menyajikan hidangan eksklusif dan pengalaman tak terlupakan di Ebony Cafe & Gallery.',
          date: '2026-12-31T19:00:00',
          image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
        });
      })
      .catch(() => {
        // Fallback jika API gagal
        setEvent({
          id,
          title: 'Special Event',
          description: 'Detail lengkap mengenai event ini belum tersedia. Silakan hubungi kami untuk informasi lebih lanjut.',
          date: '2026-12-31T19:00:00',
          image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Memuat informasi event...</p>
        </div>
      </>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const formattedTime = new Date(event.date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <>
      <Navbar />
      
      {/* Header Event */}
      <div style={{ 
        paddingTop: '120px', 
        backgroundColor: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px 48px', textAlign: 'center' }}>
          <Link to="/" style={{ display: 'inline-block', marginBottom: '24px', fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            ← BACK TO HOME
          </Link>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 56px)', margin: '0 0 16px', lineHeight: 1.2 }}>
            {event.title}
          </h1>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', color: 'var(--color-accent)', fontWeight: 600, fontSize: '14px', letterSpacing: '0.05em' }}>
            <span>📅 {formattedDate}</span>
            <span>⏰ {formattedTime}</span>
          </div>
        </div>
      </div>

      {/* Body Event */}
      <div style={{ backgroundColor: '#fff', padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            position: 'relative',
            overflow: 'hidden',
            maxHeight: '480px',
            backgroundColor: '#141414',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '40px',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              position: 'absolute',
              inset: '-10px',
              backgroundImage: `url(${event.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px) brightness(0.5)',
              opacity: 0.75,
              transform: 'scale(1.15)',
            }} />
            <img 
              src={event.image_url} 
              alt={event.title} 
              style={{ 
                position: 'relative',
                zIndex: 1,
                width: '100%', 
                maxHeight: '480px', 
                objectFit: 'contain' 
              }} 
            />
          </div>
          
          <div style={{ lineHeight: 1.8, color: 'var(--color-text)', fontSize: '16px' }}>
            <p style={{ marginBottom: '24px' }}>{event.description}</p>
            <p>
              Bergabunglah dengan kami di Ebony Cafe & Gallery untuk menikmati suasana hangat, 
              karya seni yang indah, dan hidangan luar biasa yang telah disiapkan khusus oleh chef kami.
            </p>
          </div>

          <div style={{ marginTop: '64px', textAlign: 'center', padding: '40px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '16px' }}>Tertarik untuk hadir?</h3>
            <p style={{ color: 'var(--color-muted)', marginBottom: '24px' }}>
              Pastikan Anda mengamankan meja Anda karena kapasitas terbatas.
            </p>
            <Link to="/reservation" state={{ eventTitle: event.title }} className="btn btn--primary btn--lg">
              RESERVE A TABLE NOW
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
