import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export const CTA = () => {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-8">
            Ready to ace your next <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">engineering interview?</span>
          </h2>
          <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of developers who have landed offers at top tech companies using InterviewForge. Start practicing today for free.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto px-10 shadow-xl shadow-primary/10">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto px-10">
              View Pricing
            </Button>
          </div>
          
          <p className="text-sm text-text-secondary mt-8">
            No credit card required. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
