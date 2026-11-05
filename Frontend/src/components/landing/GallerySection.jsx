import gallery1 from '../../assets/gallery1.jpg';
import gallery2 from '../../assets/gallery2.jpg';
import gallery3 from '../../assets/gallery3.jpg';
import gallery4 from '../../assets/gallery4.jpg';
import gallery5 from '../../assets/gallery5.jpg';

const GALLERY_IMAGES = [
  {
    id: 1,
    src: gallery1,
    alt: 'Ebony Cafe interior dining area',
  },
  {
    id: 2,
    src: gallery2,
    alt: 'Restaurant ambiance',
  },
  {
    id: 3,
    src: gallery3,
    alt: 'Cafe gallery wall',
  },
  {
    id: 4,
    src: gallery4,
    alt: 'Bar area',
  },
  {
    id: 5,
    src: gallery5,
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
