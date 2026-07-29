import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const TopNavbar = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white/50 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-text-secondary hover:text-primary transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-text-secondary hover:text-primary hover:bg-gray-100 rounded-full transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
        </button>
        
        <Link to="/dashboard/profile" className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-gray-50 border border-transparent hover:border-border transition-all cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden shadow-sm">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-sm font-semibold text-text hidden sm:block">
            {user?.name}
          </span>
        </Link>
      </div>
    </header>
  );
};
