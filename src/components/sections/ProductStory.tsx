import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ResumeScene } from '../three/ResumeScene';
import { Environment } from '@react-three/drei';

const steps = [
  {
    id: '01',
    title: 'Upload Resume',
    description: 'We analyze your experience to generate hyper-personalized interview scenarios tailored to your exact background.',
  },
  {
    id: '02',
    title: 'AI Analysis',
    description: 'Our AI deeply scans your technical stacks, past projects, and domain expertise in seconds.',
  },
  {
    id: '03',
    title: 'Mock Interview',
    description: 'Practice answering tough questions with our voice-enabled AI interviewer, simulating a real conversational environment.',
  },
  {
    id: '04',
    title: 'Coding Round',
    description: 'Solve realistic technical challenges in a browser-based IDE with real-time hints and an AI paired programmer.',
  },
  {
    id: '05',
    title: 'Performance Report',
    description: 'Receive actionable insights, code optimization tips, and performance metrics across multiple dimensions.',
  }
];

export const ProductStory = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="bg-background relative" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row relative">
        
        {/* Left Column - Timeline (40%) */}
        <div className="w-full md:w-[45%] py-32 md:py-64 relative z-10 pr-0 md:pr-12">
          
          <div className="mb-24">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-primary">
              The complete interview lifecycle.
            </h2>
            <p className="text-xl text-text-secondary leading-relaxed">
              A seamless journey designed to mirror real-world engineering interviews, preparing you for any scenario.
            </p>
          </div>

          <div className="relative">
            {/* Background Line */}
            <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-border" />
            
            {/* Animated Active Line */}
            <motion.div 
              className="absolute left-[11px] top-4 w-[2px] bg-primary origin-top"
              style={{ height: lineHeight }}
            />

            <div className="space-y-32">
              {steps.map((step) => {
                return (
                  <motion.div 
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-20%" }}
                    transition={{ duration: 0.6 }}
                    className="relative pl-12"
                  >
                    <div className="absolute -left-0 top-1 w-6 h-6 rounded-full border-4 border-background bg-card shadow-sm flex items-center justify-center z-10">
                       <motion.div 
                         className="w-2 h-2 rounded-full bg-primary"
                         initial={{ scale: 0 }}
                         whileInView={{ scale: 1 }}
                         viewport={{ margin: "-50%" }}
                       />
                    </div>
                    
                    <div className="text-sm font-bold text-accent mb-2 tracking-wide uppercase">Step {step.id}</div>
                    <h3 className="text-2xl font-bold mb-4 text-text">{step.title}</h3>
                    <p className="text-lg text-text-secondary">{step.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
        </div>

        {/* Right Column - Sticky 3D Scene (55%) */}
        <div className="w-full md:w-[55%] h-[60vh] md:h-screen sticky top-0 flex items-center justify-center py-8">
           {/* Generous whitespace and minimal aesthetic container */}
           <div className="relative w-full h-[80%] rounded-[32px] bg-card/40 backdrop-blur-md border border-white shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] overflow-hidden flex flex-col items-center justify-center group transition-all duration-500 hover:shadow-[0_12px_48px_0_rgba(139,92,246,0.1)]">
              
              {/* Soft purple and teal radial gradient blur blobs */}
              <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 blur-[90px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-primary/20" />
              <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-teal-500/10 blur-[90px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-teal-500/20" />
              
              <div className="w-full h-full relative z-10">
                <Canvas
                  camera={{ position: [0, 0, 9], fov: 45 }}
                  gl={{ antialias: true, alpha: true }}
                >
                  <ResumeScene />
                  <Environment preset="city" />
                </Canvas>
              </div>

              {/* Decorative overlay UI element */}
              <div className="absolute bottom-8 left-8 right-8 max-w-sm mx-auto p-4 rounded-2xl flex items-center gap-4 bg-card/70 backdrop-blur-xl shadow-glass border border-white z-20 transition-transform duration-500 group-hover:-translate-y-1">
                 <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                 </div>
                 <div>
                   <div className="text-sm font-bold text-text">AI Analysis in progress...</div>
                   <div className="text-xs text-text-secondary">Extracting skills from Resume.pdf</div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </section>
  );
};
