import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css'; // 🌟 PENTING: Wajib di-import agar animasinya berfungsi!
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
    // 🌟 Menginisialisasi AOS secara mendalam dengan konfigurasi durasi
    AOS.init({
      duration: 1000, // Kecepatan munculnya 1 detik agar halus
      once: false,    // Set ke false jika ingin animasi muncul terus tiap kali di-scroll naik-turun
      mirror: true    // Memicu animasi kembali saat di-scroll ke atas
    });
    
    AOS.refreshHard();
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
