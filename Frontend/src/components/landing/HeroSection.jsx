import { useNavigate } from 'react-router-dom';

// Placeholder image from Unsplash if no local asset
const HERO_IMG = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="hero" id="home">
      <div className="hero__bg">
        <video src="/assets/videos/hero-bg.mp4" autoPlay loop muted playsInline />
      </div>
      <div className="hero__overlay" />
      <div className="hero__content" data-aos="fade-up" data-aos-duration="1200">
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
        >
          RESERVE A TABLE
        </button>
      </div>
    </section>
  );
}
