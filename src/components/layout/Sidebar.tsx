import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Video, User, Settings as SettingsIcon, FileText, BarChart2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, soon: false },
    { name: 'Resume', path: '/dashboard/resume', icon: FileText, soon: false },
    { name: 'Mock Interviews', path: '/dashboard/interviews', icon: Video, soon: false },
    { name: 'Reports', path: '/reports', icon: BarChart2, soon: false },
    { name: 'Profile', path: '/dashboard/profile', icon: User },
    { name: 'Settings', path: '/dashboard/settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 border-r border-border bg-white/50 backdrop-blur-xl hidden lg:flex flex-col h-full sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">I</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">InterviewForge</span>
        </div>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4 px-2">
          Overview
        </div>
        
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={(e) => item.soon && e.preventDefault()}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all group relative",
                item.soon ? "opacity-60 cursor-default" : "cursor-pointer",
                isActive && !item.soon
                  ? "bg-primary/5 text-primary"
                  : "text-text-secondary hover:bg-gray-50 hover:text-primary"
              )
            }
          >
            <item.icon className={cn("w-5 h-5", item.soon ? "" : "group-hover:scale-110 transition-transform")} />
            {item.name}
            
            {item.soon && (
              <span className="ml-auto text-[10px] uppercase tracking-wider bg-gray-100 text-text-secondary px-1.5 py-0.5 rounded-md">
                Soon
              </span>
            )}
          </NavLink>
        ))}
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="bg-gradient-to-r from-primary/5 to-accent/10 p-4 rounded-xl border border-primary/10 text-center">
          <h4 className="text-primary font-bold mb-1">Upgrade to Pro</h4>
          <p className="text-sm text-text-secondary mb-3">Unlock advanced AI mocks.</p>
          <button className="w-full py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shadow-md">
            View Plans
          </button>
        </div>
      </div>
    </aside>
  );
};
