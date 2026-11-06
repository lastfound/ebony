import { useState, useEffect, useRef } from 'react';
import { getGalleries } from '../../api/publicApi';

// 🌟 PERFORMANCE: Fallback awal agar gambar tampil seketika tanpa CLS
const DEFAULT_GALLERY_IMAGES = [
  {
    id: 1,
    image_url: '/assets/images/gallery/gallery1.jpeg',
    caption: 'Ebony Cafe interior dining area',
    title: 'Interior Dining Area',
  },
  {
    id: 2,
    image_url: '/assets/images/gallery/gallery2.jpeg',
    caption: 'Restaurant ambiance at Ebony',
    title: 'Restaurant Ambiance',
  },
  {
    id: 3,
    image_url: '/assets/images/gallery/gallery3.jpeg',
    caption: 'Cafe gallery wall',
    title: 'Art Gallery Wall',
  },
  {
    id: 4,
    image_url: '/assets/images/gallery/gallery4.jpeg',
    caption: 'Bar area at Ebony',
    title: 'Bar Area',
  },
  {
    id: 5,
    image_url: '/assets/images/gallery/gallery5.jpeg',
    caption: 'Private dining room',
    title: 'Private Dining Room',
  },
];

export default function GallerySection() {
  const [galleries, setGalleries] = useState(DEFAULT_GALLERY_IMAGES);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          getGalleries()
            .then((data) => {
              if (Array.isArray(data) && data.length > 0) {
                setGalleries(data);
              }
            })
            .catch(() => {
              // fallback tetap menggunakan DEFAULT_GALLERY_IMAGES
            });
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="gallery" id="gallery" ref={sectionRef}>
      <div className="section-header" data-aos="fade-up">
        <span className="section-label">AN AUTHENTIC EXPERIENCE</span>
        <h2 className="section-title">An authentic experience</h2>
      </div>

      <div className="gallery__grid">
        {galleries.map((img, index) => (
          <div className="gallery__item" key={img.id} data-aos="fade-up" data-aos-delay={(index % 5) * 100}>
            <img
              src={img.image_url || img.src}
              alt={img.caption || img.title || 'Ebony Cafe Gallery'}
              loading="lazy"
              decoding="async"
              width="400"
              height="300"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80';
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
