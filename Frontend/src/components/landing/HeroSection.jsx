import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 🌟 VIDEO SOURCE:
// 1. Masukkan link CDN di bawah jika diunggah ke CDN eksternal (Cloudinary, S3, BunnyCDN, dll).
// 2. Jika dibiarkan kosong (''), otomatis memakai video lokal dari folder public.
const HERO_VIDEO_CDN = '';
const DEFAULT_HERO_VIDEO = '/assets/videos/bchero.mp4';
const HERO_FALLBACK_IMG = '/assets/images/menu/hero1.jfif';

export default function HeroSection() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const activeVideo = HERO_VIDEO_CDN || DEFAULT_HERO_VIDEO;

  // Pastikan muted diset langsung pada elemen DOM agar browser tidak memblokir autoplay
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().then(() => {
        setVideoPlaying(true);
      }).catch(() => {
        // Autoplay terblokir browser — fallback gambar tetap tampil rapi
        setVideoPlaying(false);
      });
    }
  }, [activeVideo]);

  // 🌟 Intersection Observer: Otomatis PAUSE video saat hero di-scroll keluar layar
  // dan RESUME saat kembali ke atas → menghemat CPU/GPU dan baterai.
  useEffect(() => {
    if (!heroRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (videoRef.current) {
            if (entry.isIntersecting) {
              videoRef.current.play().catch(() => {});
            } else {
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero" id="home" ref={heroRef}>
      <div className="hero__bg" style={{ backgroundColor: '#181212' }}>
        {/* Foto fallback instan: langsung tampil seketika agar layar TIDAK GELAP saat video sedang buffering */}
        <img
          src={HERO_FALLBACK_IMG}
          alt="Ebony Ambiance"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: videoPlaying ? 0 : 1,
            transition: 'opacity 0.8s ease-in-out',
            zIndex: 1,
          }}
        />

        {/* Video background */}
        <video
          ref={videoRef}
          src={activeVideo}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onPlaying={() => setVideoPlaying(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 2,
            opacity: videoPlaying ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
          }}
        />
      </div>
      <div className="hero__overlay" style={{ zIndex: 3 }} />
      <div className="hero__content" style={{ zIndex: 4 }}>
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
