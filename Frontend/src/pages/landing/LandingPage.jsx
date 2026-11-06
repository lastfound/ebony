import { useEffect, lazy, Suspense } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../../components/landing/Navbar';
import HeroSection from '../../components/landing/HeroSection';

// 🌟 CODE SPLITTING (Lazy Loading & Suspense):
// Navbar dan HeroSection dimuat secara instan di atas layar (above the fold).
// Seluruh section di bawah layar dimuat secara terpisah (chunking) menggunakan React.lazy & Suspense.
// Tata letak, posisi, dan desain UI/UX tetap 100% identik tanpa perubahan visual.
const AboutSection = lazy(() => import('../../components/landing/AboutSection'));
const PromoSection = lazy(() => import('../../components/landing/PromoSection'));
const FavoritesSection = lazy(() => import('../../components/landing/FavoritesSection'));
const GallerySection = lazy(() => import('../../components/landing/GallerySection'));
const EventsSection = lazy(() => import('../../components/landing/EventsSection'));
const Footer = lazy(() => import('../../components/landing/Footer'));

export default function LandingPage() {
  useEffect(() => {
    // 🌟 Inisialisasi AOS yang hemat performa
    AOS.init({
      duration: 700,
      once: true,
      mirror: false,
      offset: 50,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <Suspense fallback={null}>
          <AboutSection />
        </Suspense>
        <Suspense fallback={null}>
          <PromoSection />
        </Suspense>
        <Suspense fallback={null}>
          <FavoritesSection />
        </Suspense>
        <Suspense fallback={null}>
          <GallerySection />
        </Suspense>
        <Suspense fallback={null}>
          <EventsSection />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
}
