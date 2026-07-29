import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-primary font-sans text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg text-sm font-medium border border-white/10"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-4">Welcome back, {user?.name}!</h2>
          <p className="text-white/60">
            This is a protected route. Only authenticated users can see this page.
            Phase 1.3 will flesh out this dashboard completely.
          </p>
        </div>
      </div>
    </div>
  );
};
