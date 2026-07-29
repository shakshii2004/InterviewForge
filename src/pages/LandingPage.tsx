import { Navbar } from '../components/layout/Navbar';
import { Hero } from '../components/hero/Hero';
import { TrustedBy } from '../components/sections/TrustedBy';
import { ProductStory } from '../components/sections/ProductStory';
import { Features } from '../components/sections/Features';
import { WhyInterviewForge } from '../components/sections/WhyInterviewForge';
import { FAQ } from '../components/sections/FAQ';
import { CTA } from '../components/sections/CTA';
import { Footer } from '../components/layout/Footer';

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-accent/30 selection:text-primary">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <TrustedBy />
        <ProductStory />
        <Features />
        <WhyInterviewForge />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};
