import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';

const HeroScene = lazy(() => import('../three/HeroScene').then(module => ({ default: module.HeroScene })));

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        
        <div className="flex flex-col items-start pt-12 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-primary leading-[1.05] mb-6">
              Interview<br />
              Like It's<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Real.</span>
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-lg md:text-xl text-text-secondary max-w-md mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Master your engineering interviews with AI-powered mock sessions, resume-aware questions, and actionable feedback.
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Button size="lg" className="px-8 shadow-xl shadow-primary/10">Start Free</Button>
            <Button size="lg" variant="secondary" className="px-8 bg-white/50 backdrop-blur-sm">Watch Demo</Button>
          </motion.div>
        </div>

        <motion.div 
          className="h-[500px] lg:h-[700px] w-full relative -mr-8 lg:-mr-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent z-10 w-24 left-0" />
          <Canvas 
            camera={{ position: [0, 0, 6], fov: 45 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <HeroScene />
              <Environment preset="city" />
            </Suspense>
          </Canvas>
        </motion.div>
      </div>
    </section>
  );
};
