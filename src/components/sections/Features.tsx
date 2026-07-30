import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { FeatureAIMockScene } from '../three/features/FeatureAIMockScene';
import { FeatureResumeScene } from '../three/features/FeatureResumeScene';
import { FeatureCodingScene } from '../three/features/FeatureCodingScene';
import { FeatureReportsScene } from '../three/features/FeatureReportsScene';
import { FeatureRoadmapScene } from '../three/features/FeatureRoadmapScene';

// A wrapper component for the premium hover card effect (Spotlight, glow, lift)
const PremiumCard = ({ children, className, glowColor }: { children: React.ReactNode, className: string, glowColor: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 20 }}
      className={`relative rounded-[32px] bg-card/40 backdrop-blur-md border border-white/60 overflow-hidden group transition-all duration-300 hover:-translate-y-2 hover:border-white/90 ${className}`}
      style={{ boxShadow: `0 12px 48px 0 rgba(31,38,135,0.05), inset 0 1px 1px 0 rgba(255,255,255,1), inset 0 -1px 1px 0 rgba(255,255,255,0.3)` }}
    >
      {/* Spotlight Effect */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 z-30"
        style={{
          opacity,
          background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 40%)`,
        }}
      />
      {children}
    </motion.div>
  );
};

export const Features = () => {
  return (
    <section className="py-32 bg-[#FAFAFA] relative overflow-hidden" id="features">
      {/* Background Noise Texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      
      {/* Subtle background radial gradients */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-primary">
            Built for serious engineers.
          </h2>
          <p className="text-xl text-text-secondary leading-relaxed">
            Every tool you need to ace your technical and behavioral interviews, meticulously crafted into one premium platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: AI Mock Interviews (Span 2) */}
          <PremiumCard className="md:col-span-2 h-[420px] flex flex-col md:flex-row" glowColor="rgba(167,139,250,0.1)">
            <div className="p-10 md:w-1/2 flex flex-col justify-center z-10">
              <h3 className="text-2xl font-bold mb-4 text-text">AI Mock Interviews</h3>
              <p className="text-text-secondary leading-relaxed">
                Practice answering tough questions with a hyper-realistic holographic AI assistant.
              </p>
            </div>
            <div className="absolute inset-0 md:relative md:w-1/2 h-full z-0 opacity-40 md:opacity-100 group-hover:scale-105 transition-transform duration-700 ease-out">
               <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
                  <FeatureAIMockScene />
                  <Environment preset="city" />
               </Canvas>
            </div>
          </PremiumCard>

          {/* Card 2: Resume Analysis (Span 1) */}
          <PremiumCard className="md:col-span-1 h-[420px] flex flex-col" glowColor="rgba(45,212,191,0.1)">
            <div className="p-10 relative z-10">
              <h3 className="text-2xl font-bold mb-4 text-text">Resume Analysis</h3>
              <p className="text-text-secondary leading-relaxed">
                Our engine parses your past experiences to generate bespoke interview questions.
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-2/3 z-0 group-hover:scale-105 transition-transform duration-700 ease-out">
               <Canvas camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: true, alpha: true }}>
                  <FeatureResumeScene />
                  <Environment preset="city" />
               </Canvas>
            </div>
          </PremiumCard>

          {/* Card 3: Coding Practice (Span 1) */}
          <PremiumCard className="md:col-span-1 h-[420px] flex flex-col" glowColor="rgba(56,189,248,0.1)">
            <div className="p-10 relative z-10">
              <h3 className="text-2xl font-bold mb-4 text-text">Coding Practice</h3>
              <p className="text-text-secondary leading-relaxed">
                Tackle algorithmic problems in a browser IDE with AI paired programming hints.
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-2/3 z-0 group-hover:scale-105 transition-transform duration-700 ease-out">
               <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
                  <FeatureCodingScene />
                  <Environment preset="city" />
               </Canvas>
            </div>
          </PremiumCard>

          {/* Card 4: Reports (Span 1) */}
          <PremiumCard className="md:col-span-1 h-[420px] flex flex-col" glowColor="rgba(251,191,36,0.1)">
            <div className="p-10 relative z-10">
              <h3 className="text-2xl font-bold mb-4 text-text">Deep Analytics</h3>
              <p className="text-text-secondary leading-relaxed">
                Visualize your pacing, confidence score, and technical weak spots over time.
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[70%] z-0 group-hover:scale-105 transition-transform duration-700 ease-out">
               <Canvas camera={{ position: [0, -0.5, 5.5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
                  <FeatureReportsScene />
                  <Environment preset="city" />
               </Canvas>
            </div>
          </PremiumCard>

          {/* Card 5: Learning Roadmap (Span 1) */}
          <PremiumCard className="md:col-span-1 h-[420px] flex flex-col" glowColor="rgba(167,139,250,0.1)">
            <div className="p-10 relative z-10">
              <h3 className="text-2xl font-bold mb-4 text-text">Personalized Roadmap</h3>
              <p className="text-text-secondary leading-relaxed">
                A custom learning tree designed to target and eliminate your specific weaknesses.
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-2/3 z-0 group-hover:scale-105 transition-transform duration-700 ease-out">
               <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
                  <FeatureRoadmapScene />
                  <Environment preset="city" />
               </Canvas>
            </div>
          </PremiumCard>

        </div>
      </div>
    </section>
  );
};
