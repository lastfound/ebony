import { useState, useEffect } from 'react';
import { getSiteSettings, getLocalSiteSettings } from '../../services/siteSettings';

export default function AboutSection() {
  const [settings, setSettings] = useState(getLocalSiteSettings);

  useEffect(() => {
    let mounted = true;
    getSiteSettings().then((data) => {
      if (mounted && data) setSettings(data);
    });

    const handleUpdate = (e) => {
      if (e.detail) setSettings(e.detail);
    };
    window.addEventListener('site-settings-updated', handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('site-settings-updated', handleUpdate);
    };
  }, []);

  const paragraphs = (settings.about_description || '')
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section className="about" id="about">
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

          <a href="#menu" className="about__learn-more">
            LEARN MORE +
          </a>
        </div>

        {/* Image */}
        <div className="about__image" data-aos="fade-left" data-aos-delay="200">
          <img
            src={settings.about_image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'}
            alt="Ebony Cafe & Gallery Culinary Art"
            onError={(e) => {
              // Fallback jika image gagal load
              e.currentTarget.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';
            }}
          />
        </div>
      </div>
    </section>
  );
}
