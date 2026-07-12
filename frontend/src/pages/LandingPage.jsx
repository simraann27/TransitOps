import { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import OperationsMetrics from '../components/OperationsMetrics';
import PlatformIntro from '../components/PlatformIntro';
import Features from '../components/Features';
import DispatchFlow from '../components/DispatchFlow';
import Intelligence from '../components/Intelligence';
import AnalyticsPreview from '../components/AnalyticsPreview';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';
import ProductTourModal from '../components/ProductTourModal';

export default function LandingPage() {
  const [isTourOpen, setIsTourOpen] = useState(false);

  return (
    <div style={{
      backgroundColor: 'var(--bg-warm-white)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Navbar onOpenTour={() => setIsTourOpen(true)} />
      <main style={{ flexGrow: 1 }}>
        <Hero onOpenTour={() => setIsTourOpen(true)} />
        <OperationsMetrics />
        <PlatformIntro />
        <Features />
        <DispatchFlow />
        <Intelligence />
        <AnalyticsPreview />
        <FinalCTA />
      </main>
      <Footer />

      <ProductTourModal 
        isOpen={isTourOpen} 
        onClose={() => setIsTourOpen(false)} 
      />
    </div>
  );
}
