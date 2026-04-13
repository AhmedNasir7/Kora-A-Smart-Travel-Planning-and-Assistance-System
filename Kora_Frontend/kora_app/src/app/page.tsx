import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { TripsSection } from '@/components/landing/TripsSection';
import { PackingSection } from '@/components/landing/PackingSection';
import { TimelineSection } from '@/components/landing/TimelineSection';
import { Footer } from '@/components/landing/Footer';

export const metadata = {
  title: 'Kora - Smart Travel Planning',
  description: 'Plan every journey with clarity. Organize trips, packing lists, and travel documents in one beautiful place.',
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#13151A] overflow-y-auto">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[rgba(255,123,84,0.08)] blur-3xl" />
        <div className="absolute bottom-32 left-20 w-80 h-80 rounded-full bg-[rgba(255,123,84,0.05)] blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />
        <Hero />
        <TripsSection />
        <PackingSection />
        <TimelineSection />
        <Footer />
      </div>
    </main>
  );
}
