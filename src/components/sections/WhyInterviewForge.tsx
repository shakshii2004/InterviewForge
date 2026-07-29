import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';

const advantages = [
  "No generic templates—every interview is uniquely generated.",
  "Real-time voice synthesis and recognition for natural conversation.",
  "Instant, actionable feedback immediately after the session.",
  "Supports over 15 programming languages for technical rounds.",
  "Track improvements through comprehensive performance dashboards.",
  "Cost-effective alternative to expensive human mock interviews."
];

export const WhyInterviewForge = () => {
  return (
    <section className="py-32 bg-primary text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
            Why engineers choose <span className="text-accent">InterviewForge</span>
          </h2>
          <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-lg">
            We bridge the gap between studying algorithms and actually performing under pressure. Our platform is built by senior engineers, for engineers.
          </p>
          
          <ul className="space-y-6">
            {advantages.map((adv, index) => (
              <motion.li 
                key={index} 
                className="flex items-start gap-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <FiCheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-white/90 font-medium">{adv}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div 
          className="relative h-[500px] rounded-3xl bg-white/5 border border-white/10 p-8 flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Abstract visual representing advantages */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-50" />
          <div className="relative z-10 glass-panel border border-white/20 p-8 rounded-2xl bg-black/20 backdrop-blur-xl w-full max-w-md text-center">
             <div className="text-6xl font-bold text-accent mb-4">98%</div>
             <div className="text-xl font-medium text-white mb-2">Offer Rate</div>
             <p className="text-white/60 text-sm">Of our active users receive an offer within 3 months of practice.</p>
          </div>
          
          {/* Decorative floating elements */}
          <motion.div 
            className="absolute top-10 left-10 w-20 h-20 rounded-full bg-accent/20 blur-2xl"
            animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white/10 blur-3xl"
            animate={{ y: [0, 30, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

      </div>
    </section>
  );
};
