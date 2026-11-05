import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 🌟 VIDEO SOURCE:
// 1. Masukkan link CDN di bawah jika sudah diunggah (misal: Cloudinary, S3, BunnyCDN, dll).
// 2. Jika dibiarkan kosong (''), otomatis memakai video lokal dari folder public.
const HERO_VIDEO_CDN = '';
const DEFAULT_HERO_VIDEO = '/assets/videos/WhatsApp Video 2026-11-05 at 09.46.06.mp4';

export default function HeroSection() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const activeVideo = HERO_VIDEO_CDN || DEFAULT_HERO_VIDEO;

  useEffect(() => {
    // 🌟 Mengizinkan browser menyelesaikan First Contentful Paint (FCP) & LCP teks terlebih dahulu
    // sebelum memulai streaming video latar belakang yang berat
    const timer = setTimeout(() => {
      setIsVideoLoaded(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Batasi pemutaran video hanya pada rentang 1 s/d 11.5 detik
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      if (videoRef.current.currentTime >= 11.5 || videoRef.current.currentTime < 1) {
        videoRef.current.currentTime = 1;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 1;
    }
  };

  return (
    <section className="hero" id="home">
      <div className="hero__bg" style={{ backgroundColor: '#181212' }}>
        {isVideoLoaded && (
          <video
            ref={videoRef}
            src={activeVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>
      <div className="hero__overlay" />
      <div className="hero__content" data-aos="fade-up" data-aos-duration="900">
        <span className="hero__label">FRENCH · ASIAN FUSION</span>
        <h1 className="hero__title">
          A culinary experience<br />to remember
        </h1>
        <p className="hero__subtitle">
          Where fine ingredients meet thoughtful technique
          <br />in an intimate setting
        </p>
        <button
          className="btn btn--outline-light btn--lg"
          onClick={() => navigate('/reservation')}
          aria-label="Reserve a Table at Ebony"
        >
          RESERVE A TABLE
        </button>
      </div>
    </section>
  );
}
