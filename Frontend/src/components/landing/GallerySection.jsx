const GALLERY_IMAGES = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80',
    alt: 'Ebony Cafe interior dining area',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
    alt: 'Restaurant ambiance',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1428515613728-6b4607e44363?w=600&q=80',
    alt: 'Cafe gallery wall',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=600&q=80',
    alt: 'Bar area',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80',
    alt: 'Private dining room',
  },
];

export default function GallerySection() {
  return (
    <section className="gallery" id="gallery">
      <div className="section-header" data-aos="fade-up">
        <span className="section-label">AN AUTHENTIC EXPERIENCE</span>
        <h2 className="section-title">An authentic experience</h2>
      </div>

      <div className="gallery__grid">
        {GALLERY_IMAGES.map((img, index) => (
          <div className="gallery__item" key={img.id} data-aos="fade-up" data-aos-delay={index * 100}>
            <img src={img.src} alt={img.alt} loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}
