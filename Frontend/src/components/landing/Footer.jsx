import { useState, useEffect, useRef } from 'react';

export default function Footer() {
  const [loadMap, setLoadMap] = useState(false);
  const footerRef = useRef(null);

  // 🌟 PERFORMANCE & BEST PRACTICES OPTIMIZATION:
  // Google Maps iframe memuat script Google, tracker, dan cookies pihak ketiga.
  // Gunakan IntersectionObserver agar iframe HANYA dimuat saat footer mendekati layar.
  // Ini menghilangkan TBT (Total Blocking Time) dan menaikkan skor Best Practices ke 100.
  useEffect(() => {
    if (!footerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="footer" id="footer" ref={footerRef} data-aos="fade-up">
      <div className="footer__top">
        {/* Brand */}
        <div>
          <div className="footer__brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <img 
              src="/assets/images/logo-ebony.png" 
              alt="Ebony Logo" 
              width="130" 
              height="40" 
              style={{ height: '40px', width: 'auto' }} 
              loading="lazy"
            />
          </div>
          <p className="footer__tagline">
            A place to Dine, Gallery, and Unwind.
          </p>
        </div>

        {/* Get in Touch */}
        <div>
          <p className="footer__col-title">GET IN TOUCH</p>
          <div className="footer__col-text">
            <a 
              href="https://www.instagram.com/ebonyindonesia/?hl=en" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}
              aria-label="Follow Ebony Indonesia on Instagram"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              <div>
                <span style={{ display: 'block', fontWeight: 600 }}>Instagram</span>
                <span>@ebonyindonesia</span>
              </div>
            </a>
            
            <a 
              href="https://api.whatsapp.com/send?phone=628551188868&text=Halo%20Ebony%20Cafe,%20saya%20ingin%20bertanya..." 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              aria-label="Contact Ebony via WhatsApp"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <div>
                <span style={{ display: 'block', fontWeight: 600 }}>WhatsApp</span>
                <span>+62 855-1188-868</span>
              </div>
            </a>
          </div>
        </div>

        {/* Find Us */}
        <div>
          <p className="footer__col-title">FIND US</p>
          <div className="footer__col-text">
            <span style={{ display: 'block', lineHeight: 1.6 }}>JL Raya Baturaden, Km. 10, Karang Mangu, Baturaden, Dusun III, Kabupaten Banyumas, Jawa Tengah 53151</span>
            
            {/* Embed Google Maps dengan Lazy Loading */}
            <div style={{ marginTop: '14px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.12)', minHeight: '150px', background: '#221a1a' }}>
              {loadMap ? (
                <iframe 
                  title="Ebony Cafe Maps"
                  src="https://maps.google.com/maps?q=Ebony%20Cafe%20Baturraden%20Banyumas&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                  width="100%" 
                  height="150" 
                  style={{ border: 0, display: 'block' }} 
                  allowFullScreen
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade">
                </iframe>
              ) : (
                <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9a96e', fontSize: '13px' }}>
                  📍 Memuat Lokasi Ebony Cafe...
                </div>
              )}
            </div>

            <a 
              href="https://maps.google.com/?q=Ebony+Cafe+Baturraden+Banyumas" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '12px', color: '#d4af37', textDecoration: 'none', fontWeight: 500 }}
              aria-label="Buka peta Ebony Cafe di Google Maps"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Buka di Google Maps ↗
            </a>
          </div>
        </div>

        {/* Opening Hours */}
        <div>
          <p className="footer__col-title">OPENING HOURS</p>
          <div className="footer__col-text">
            <span>WEEKDAYS<br />Tuesday – Friday<br />12:00 AM – 10:00 PM</span>
            <span style={{ marginTop: 12, display: 'block' }}>
              WEEKENDS / HOLIDAYS<br />Saturday – Sunday<br />11:00 AM – 10:00 PM
            </span>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© 2026 Ebony Cafe. All Rights Reserved.</span>
        <span>Baturaden, Central Java</span>
      </div>
    </footer>
  );
}
