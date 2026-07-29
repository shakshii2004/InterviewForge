export const TrustedBy = () => {
  return (
    <section className="py-12 border-b border-border bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        <p className="text-sm font-medium text-text-secondary mb-8 uppercase tracking-widest">
          Trusted by engineers from top companies
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale transition-opacity duration-300 hover:opacity-70">
          <span className="text-xl font-bold font-serif">Acme Corp</span>
          <span className="text-xl font-bold tracking-tighter">GlobalTech</span>
          <span className="text-xl font-semibold italic">Innovate</span>
          <span className="text-xl font-bold">NEXUS</span>
          <span className="text-xl font-medium tracking-widest">PULSE</span>
        </div>
      </div>
    </section>
  );
};
