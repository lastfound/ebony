import { useCallback, useEffect, useState } from 'react';
import AOS from 'aos';

export default function PromoSection() {
  const [promoData, setPromoData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/menus')
      .then(res => res.json())
      .then(resData => {
        const rawMenus = Array.isArray(resData) ? resData : (resData.data || []);
        if (Array.isArray(rawMenus)) {
          const filteredPromo = rawMenus.filter(item => 
            item.is_promo === 1 || 
            item.is_promo === '1' || 
            item.is_promo === true
          );
          setPromoData(filteredPromo);
          
          // Memastikan AOS membaca ulang posisi kotak setelah data masuk
          setTimeout(() => {
            AOS.refresh();
          }, 150);
        }
      })
      .catch(error => {
        console.error("Gagal memuat data menu promo:", error);
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

  const displayData = promoData.length > 0 ? promoData : [
    {
      id: 999,
      name: "Signature Roast Duck",
      description: "Plum reduction, charred asparagus.",
      promo_badge: "MENU PROMOTION",
      promo_tagline: "ENJOY 50% OFF",
      promo_subtext: "A special offer for selected Ebony favorites.",
      image_url: null
    }
  ];

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
          <span className="promo-badge">{displayData[currentIndex].promo_badge || 'MENU PROMOTION'}</span>
          <h2 className="promo-title">{displayData[currentIndex].name}</h2>
          <p className="promo-description">{displayData[currentIndex].description}</p>
          <div className="promo-divider"></div>
          <h3 className="promo-tagline">{displayData[currentIndex].promo_tagline || 'SPECIAL OFFER'}</h3>
          <p className="promo-subtext">{displayData[currentIndex].promo_subtext || 'A special offer for selected Ebony favorites.'}</p>
          
          {displayData.length > 1 && (
            <div className="promo-dots">
              {displayData.map((_, index) => (
                <span 
                  key={index} 
                  className={`promo-dot ${index === currentIndex ? 'promo-dot--active' : ''}`}
                  onClick={() => changeSlide(index)}
                ></span>
              ))}
            </div>
          )}
        </div>

        {/* SISI KANAN: GAMBAR BANNER */}
        <div className="promo-image-wrapper">
          <img 
            src={
              displayData[currentIndex].image_url
                ? displayData[currentIndex].image_url.startsWith('http')
                  ? displayData[currentIndex].image_url
                  : `http://localhost:8000/storage/${displayData[currentIndex].image_url}`
                : 'https://unsplash.com'
            } 
            alt={displayData[currentIndex].name} 
            style={{
              opacity: isAnimating ? 0.2 : 1,
              transition: 'opacity 0.2s ease'
            }}
            onError={(e) => {
              e.target.src = 'https://unsplash.com';
            }}
          />
        </div>

      </div>
    </section>
  );
}
