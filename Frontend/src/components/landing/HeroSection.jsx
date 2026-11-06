import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// 🌟 VIDEO SOURCE:
// 1. Masukkan link CDN di bawah jika diunggah ke CDN eksternal (Cloudinary, S3, BunnyCDN, dll).
// 2. Jika dibiarkan kosong (''), otomatis memakai video lokal dari folder public.
const HERO_VIDEO_CDN = '';
const DEFAULT_HERO_VIDEO = '/assets/videos/background.mp4';

export default function HeroSection() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);

  const activeVideo = HERO_VIDEO_CDN || DEFAULT_HERO_VIDEO;

  // 🌟 PERFORMANCE: Tunda pemuatan video 20 MB sampai halaman sepenuhnya selesai dirender.
  // Lighthouse mengukur LCP & FCP dari konten HTML/CSS pertama yang muncul di layar.
  // Jika video mulai di-download bersamaan, ia akan memakan bandwidth dan menghambat
  // font, CSS, dan JS utama yang harus selesai terlebih dahulu.
  //
  // Strategi: Tunggu event 'load' (semua resource kritis selesai) + 100ms buffer,
  // baru inject <video> ke DOM. Ini memastikan skor Lighthouse tidak terhambat video.
  const startVideo = useCallback(() => {
    setShowVideo(true);
  }, []);

  useEffect(() => {
    // Jika user mengaktifkan prefers-reduced-motion atau save-data, skip video
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || navigator.connection?.saveData) return;

    if (document.readyState === 'complete') {
      // Halaman sudah selesai load — langsung mulai
      const t = setTimeout(startVideo, 100);
      return () => clearTimeout(t);
    }

    // Tunggu halaman selesai load baru inject video
    const onLoad = () => {
      setTimeout(startVideo, 100);
    };
    window.addEventListener('load', onLoad, { once: true });

    // Safety fallback: jika load event terlalu lama, mulai setelah 3 detik
    const fallback = setTimeout(startVideo, 3000);

    return () => {
      window.removeEventListener('load', onLoad);
      clearTimeout(fallback);
    };
  }, [startVideo]);

  // 🌟 Intersection Observer: Otomatis PAUSE video saat hero di-scroll keluar layar
  // dan RESUME saat kembali ke atas → menghemat CPU/GPU dan baterai.
  useEffect(() => {
    if (!heroRef.current || !showVideo) return;

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
  }, [showVideo]);

  return (
    <section className="hero" id="home" ref={heroRef}>
      <div className="hero__bg" style={{ backgroundColor: '#181212' }}>
        {showVideo && (
          <video
            ref={videoRef}
            src={activeVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
      </div>
      <div className="hero__overlay" />
      <div className="hero__content">
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
