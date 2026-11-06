import { useState, useEffect, useRef } from 'react';
import { getSiteSettings, getLocalSiteSettings } from '../../services/siteSettings';

// 🌟 VIDEO SOURCE:
// 1. Masukkan link CDN di bawah ini jika sudah diunggah (misal: Cloudinary, S3, BunnyCDN, dll).
// 2. Jika dibiarkan kosong (''), otomatis memakai video lokal dari folder public.
const ABOUT_VIDEO_CDN = '';
const DEFAULT_ABOUT_VIDEO = '/assets/videos/aboutvid.mp4';

export default function AboutSection() {
  const [settings, setSettings] = useState(getLocalSiteSettings);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail) setSettings(e.detail);
    };
    window.addEventListener('site-settings-updated', handleUpdate);
    return () => {
      window.removeEventListener('site-settings-updated', handleUpdate);
    };
  }, []);

  // 🌟 PERFORMANCE OPTIMIZATION:
  // Video & settings diambil HANYA saat pengguna mendekati section ini.
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoadVideo(true);
          getSiteSettings().then((data) => {
            if (data) setSettings(data);
          });
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const activeVideo = settings.about_video_url || ABOUT_VIDEO_CDN || DEFAULT_ABOUT_VIDEO;

  const paragraphs = (settings.about_description || '')
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="about" id="about" ref={sectionRef}>
      <div className="about__inner">
        {/* Text Content */}
        <div className="about__text-col" data-aos="fade-right">
          <span className="about__label">THE ESSENCE OF EBONY</span>
          <h2 className="about__title" style={{ whiteSpace: 'pre-line' }}>
            {settings.about_title || 'The Essence of Ebony'}
          </h2>

          {settings.about_subtitle && (
            <h3 className="about__subtitle">{settings.about_subtitle}</h3>
          )}

          {paragraphs.length > 0 ? (
            paragraphs.map((para, idx) => (
              <p key={idx} className="about__text">
                {para}
              </p>
            ))
          ) : (
            <p className="about__text">
              Ebony is conceived as a sanctuary of culinary artistry, an escape from
              the ordinary where every detail is meticulously curated.
            </p>
          )}

          <a href="#menu" className="about__learn-more" aria-label="Learn more about Ebony menu">
            LEARN MORE +
          </a>
        </div>

        {/* Video / Media */}
        <div className="about__image" data-aos="fade-left" data-aos-delay="150" style={{ background: '#181212', borderRadius: '16px', overflow: 'hidden' }}>
          <video
            src={activeVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      </div>
    </section>
  );
}
