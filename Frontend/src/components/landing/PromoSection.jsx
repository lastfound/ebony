import { useCallback, useEffect, useState, useRef } from 'react';
import AOS from 'aos';
import { getPromoMenus } from '../../api/publicApi';

const PROMO_FALLBACK_IMG = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80';

const DEFAULT_PROMO_DATA = [
  {
    id: 'promo-1',
    name: 'Wagyu Tenderloin Special Offer',
    description: 'Nikmati sajian istimewa Signature Wagyu Tenderloin Steak dengan saus truffle butter khas Ebony.',
    promo_badge: 'CHEF SELECTION',
    promo_tagline: 'SPECIAL OFFER',
    promo_subtext: 'Rasakan pengalaman kuliner tak terlupakan di suasana hangat Ebony Cafe.',
    image_url: '/assets/images/menu/stk.jfif',
  },
  {
    id: 'promo-2',
    name: 'Artisan Pastry & Coffee Pairing',
    description: 'Setiap pembelian aneka French Croissant, nikmati racikan single-origin Latte dengan harga bundling istimewa.',
    promo_badge: 'AFTERNOON SPECIAL',
    promo_tagline: 'DAILY PAIRING',
    promo_subtext: 'Tersedia setiap hari pukul 14:00 - 18:00 WIB.',
    image_url: '/assets/images/menu/pastry.jfif',
  }
];

export default function PromoSection() {
  const [promoData, setPromoData] = useState(DEFAULT_PROMO_DATA);
  const [loaded, setLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    // 🌟 PERFORMANCE: Ambil menu promo HANYA saat mendekati section ini
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          getPromoMenus()
            .then((filtered) => {
              if (Array.isArray(filtered) && filtered.length > 0) {
                setPromoData(filtered);
              } else {
                setPromoData(DEFAULT_PROMO_DATA);
              }
            })
            .catch((error) => {
              console.error('Gagal memuat data menu promo:', error);
              setPromoData(DEFAULT_PROMO_DATA);
            })
            .finally(() => {
              setLoaded(true);
              setTimeout(() => {
                AOS.refresh();
              }, 150);
            });
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const changeSlide = useCallback((newIndex) => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 250);
  }, [isAnimating]);

  useEffect(() => {
    if (promoData.length <= 1) return undefined;
    const timer = setInterval(() => {
      const nextIndex = currentIndex === promoData.length - 1 ? 0 : currentIndex + 1;
      changeSlide(nextIndex);
    }, 4000);
    return () => clearInterval(timer);
  }, [currentIndex, promoData.length, changeSlide]);

  if (loaded && promoData.length === 0) return null;

  const displayData = promoData.length > 0 ? promoData : [
    {
      id: 'loading',
      name: 'Memuat promo...',
      description: '',
      promo_badge: 'MENU PROMOTION',
      promo_tagline: 'SPECIAL OFFER',
      promo_subtext: '',
      image_url: PROMO_FALLBACK_IMG,
    }
  ];
  const safeIndex = Math.min(currentIndex, displayData.length - 1);

  return (
    <section className="promo-section" data-aos="fade-up" ref={sectionRef}>
      <div className="promo-container">

        {/* SISI KIRI: KONTEN TEKS */}
        <div
          className="promo-content"
          style={{
            opacity: isAnimating ? 0 : 1,
            transform: isAnimating ? 'translateY(6px)' : 'translateY(0)',
            transition: 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out'
          }}
        >
          <span className="promo-badge">{displayData[safeIndex].promo_badge || 'MENU PROMOTION'}</span>
          <h2 className="promo-title">{displayData[safeIndex].name}</h2>
          <p className="promo-description">{displayData[safeIndex].description}</p>
          <div className="promo-divider"></div>
          <h3 className="promo-tagline">{displayData[safeIndex].promo_tagline || 'SPECIAL OFFER'}</h3>
          <p className="promo-subtext">{displayData[safeIndex].promo_subtext || 'A special offer for selected Ebony favorites.'}</p>

          {displayData.length > 1 && (
            <div className="promo-dots">
              {displayData.map((_, index) => (
                <span
                  key={index}
                  className={`promo-dot ${index === safeIndex ? 'promo-dot--active' : ''}`}
                  onClick={() => changeSlide(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Go to slide ${index + 1}`}
                ></span>
              ))}
            </div>
          )}
        </div>

        {/* SISI KANAN: GAMBAR BANNER */}
        <div className="promo-image-wrapper">
          <img
            src={displayData[safeIndex].image_url || PROMO_FALLBACK_IMG}
            alt={displayData[safeIndex].name}
            loading="lazy"
            width="500"
            height="400"
            style={{
              opacity: isAnimating ? 0 : 1,
              transform: isAnimating ? 'scale(0.98)' : 'scale(1)',
              transition: 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out'
            }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PROMO_FALLBACK_IMG;
            }}
          />
        </div>

      </div>
    </section>
  );
}
