const ABOUT_IMG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';

export default function AboutSection() {
  return (
    <section className="about" id="about">
      <div className="about__inner">
        {/* Text Content */}
        <div className="about__text-col" data-aos="fade-right">
          <span className="about__label">THE ESSENCE OF EBONY</span>
          <h2 className="about__title">The Essence<br />of Ebony</h2>

          <p className="about__text">
            Ebony is conceived as a sanctuary of culinary artistry, an escape from
            the ordinary where every detail is meticulously curated. We believe
            that true luxury lies in:
          </p>

          <h3 className="about__subtitle">Simple Elegance</h3>
          <p className="about__text">
            ... stripping away the superfluous to reveal the profound and authentic
            soul of our ingredients.
          </p>

          <p className="about__text">
            Our philosophy is deeply rooted in our terroir. We journey across
            seasons to source the finest produce, treating each element with
            unwavering respect and innovative technique. It is a continuous
            dialogue between cherished traditions and refined modernity.
          </p>

          <p className="about__text">
            Step into our gallery, where the meticulously designed ambiance, the
            unobtrusive service, and the exquisite, artful creations on your plate
            merge into a singular, unforgettable narrative. Welcome to a space
            where flavors tell stories.
          </p>

          <a href="#menu" className="about__learn-more">
            LEARN MORE +
          </a>
        </div>

        {/* Image */}
        <div className="about__image" data-aos="fade-left" data-aos-delay="200">
          <img src={ABOUT_IMG} alt="Fine dining dish" />
        </div>
      </div>
    </section>
  );
}
