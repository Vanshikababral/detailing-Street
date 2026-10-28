import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import WhyChooseUs from '@/components/sections/WhyChooseUs';
import GallerySection from '@/components/sections/GallerySection';
import InstagramSection from '@/components/sections/InstagramSection';
import ReviewsSection from '@/components/sections/ReviewsSection';
import LocationSection from '@/components/sections/LocationSection';
import BookingSection from '@/components/sections/BookingSection';
import FAQSection from '@/components/sections/FAQSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <WhyChooseUs />
      <GallerySection />
      <InstagramSection />
      <ReviewsSection />
      <LocationSection />
      <BookingSection />
      <FAQSection />
    </>
  );
}
