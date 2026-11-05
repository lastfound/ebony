// 🌟 PERFORMANCE: Gambar gallery diakses dari /public/assets/images/gallery/
// sehingga tidak masuk ke bundle Vite (menghemat ~2.1 MB dari JS bundle).
// Vite TIDAK akan memproses/encode file di folder public — langsung serve as-is.
const GALLERY_IMAGES = [
  {
    id: 1,
    src: '/assets/images/gallery/gallery1.jpg',
    alt: 'Ebony Cafe interior dining area',
  },
  {
    id: 2,
    src: '/assets/images/gallery/gallery2.jpg',
    alt: 'Restaurant ambiance at Ebony',
  },
  {
    id: 3,
    src: '/assets/images/gallery/gallery3.jpg',
    alt: 'Cafe gallery wall',
  },
  {
    id: 4,
    src: '/assets/images/gallery/gallery4.jpg',
    alt: 'Bar area at Ebony',
  },
  {
    id: 5,
    src: '/assets/images/gallery/gallery5.jpg',
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
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              decoding="async"
              width="400"
              height="300"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
