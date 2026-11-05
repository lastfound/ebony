import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../../components/landing/Navbar';
import HeroSection from '../../components/landing/HeroSection';
import AboutSection from '../../components/landing/AboutSection';
import PromoSection from '../../components/landing/PromoSection';
import FavoritesSection from '../../components/landing/FavoritesSection';
import GallerySection from '../../components/landing/GallerySection';
import EventsSection from '../../components/landing/EventsSection';
import Footer from '../../components/landing/Footer';

export default function LandingPage() {
  useEffect(() => {
    // 🌟 Inisialisasi AOS yang ringan & hemat performa (tidak bikin lag saat di-scroll)
    AOS.init({
      duration: 700,
      once: true,      // Cukup animasi 1x saat pertama terlihat (menghilangkan lag & jank pada mobile)
      mirror: false,   // Jangan hitung ulang animasi saat scroll naik untuk menjaga 60 FPS
      offset: 50,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        
        {/* Banner Promo Baru */}
        <PromoSection />

        <FavoritesSection />
        <GallerySection />
        <EventsSection />
      </main>
      <Footer />
    </>
  );
}
