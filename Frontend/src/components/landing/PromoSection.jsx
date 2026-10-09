import { useCallback, useEffect, useState } from 'react';
import AOS from 'aos';
import { getPromoMenus } from '../../api/publicApi';

const PROMO_FALLBACK_IMG = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80';

export default function PromoSection() {
  const [promoData, setPromoData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    getPromoMenus()
      .then((filtered) => {
        setPromoData(filtered);
      })
      .catch((error) => {
        console.error('Gagal memuat data menu promo:', error);
        setPromoData([]);
      })
      .finally(() => {
        setLoaded(true);
        setTimeout(() => {
          AOS.refresh();
        }, 150);
      });
  }, []);

  const changeSlide = useCallback((newIndex) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsAnimating(false);
    }, 150);
  }, []);

  useEffect(() => {
    if (promoData.length <= 1) return undefined;
    const timer = setInterval(() => {
      const nextIndex = currentIndex === promoData.length - 1 ? 0 : currentIndex + 1;
      changeSlide(nextIndex);
    }, 3000);
    return () => clearInterval(timer);
  }, [currentIndex, promoData.length, changeSlide]);

  // Tidak ada promo asli dari admin = section disembunyikan.
  // (Dulu menampilkan promo khayalan "Signature Roast Duck 50% OFF"
  //  yang tidak ada di database — sudah dibuang.)
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
    <section className="promo-section" data-aos="fade-up">
      <div className="promo-container">

        {/* SISI KIRI: KONTEN TEKS */}
        <div
          className="promo-content"
          style={{
            opacity: isAnimating ? 0.1 : 1,
            transition: 'opacity 0.2s ease'
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
            style={{
              opacity: isAnimating ? 0.2 : 1,
              transition: 'opacity 0.2s ease'
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
