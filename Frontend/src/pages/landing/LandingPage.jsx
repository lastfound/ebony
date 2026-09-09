import { useEffect } from 'react';
import AOS from 'aos';
import Navbar from '../../components/landing/Navbar';
import HeroSection from '../../components/landing/HeroSection';
import AboutSection from '../../components/landing/AboutSection';
import FavoritesSection from '../../components/landing/FavoritesSection';
import GallerySection from '../../components/landing/GallerySection';
import EventsSection from '../../components/landing/EventsSection';
import Footer from '../../components/landing/Footer';

export default function LandingPage() {
  useEffect(() => {
    AOS.refreshHard();
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <FavoritesSection />
        <GallerySection />
        <EventsSection />
      </main>
      <Footer />
    </>
  );
}
