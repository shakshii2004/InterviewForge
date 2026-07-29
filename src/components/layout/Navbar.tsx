import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b border-transparent",
        scrolled ? "glass-panel border-border/50 py-3" : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">I</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">InterviewForge</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">How it Works</a>
          <a href="#pricing" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Pricing <span className="ml-1 text-[10px] uppercase tracking-wider bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">Soon</span></a>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="hidden sm:inline-flex">Dashboard</Button>
              </Link>
              <Button onClick={() => logout()}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="hidden sm:inline-flex">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
