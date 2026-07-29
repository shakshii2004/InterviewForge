export const Footer = () => {
  return (
    <footer className="bg-white border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-xs leading-none">I</span>
              </div>
              <span className="font-bold text-lg tracking-tight text-primary">InterviewForge</span>
            </div>
            <p className="text-text-secondary text-sm">
              AI-powered interview preparation platform. Practice, improve, and land your dream job.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-sm text-text">Product</h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Use Cases</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm text-text">Resources</h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Interview Guides</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm text-text">Company</h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-secondary">
            © {new Date().getFullYear()} InterviewForge. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-text-secondary">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
