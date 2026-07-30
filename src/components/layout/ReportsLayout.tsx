import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, History, Activity, Trophy } from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { name: 'Overview', to: '/reports', icon: LayoutDashboard, exact: true },
  { name: 'History', to: '/reports/interviews', icon: History, exact: false },
  { name: 'Skills', to: '/reports/skills', icon: Activity, exact: false },
  { name: 'Progress', to: '/reports/progress', icon: Trophy, exact: false },
];

export const ReportsLayout = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Analytics & Reports</h1>
          <p className="text-text-secondary mt-1">Track your interview performance and skill growth.</p>
        </div>
      </div>

      {/* Sub-navigation */}
      <nav className="flex space-x-1 overflow-x-auto pb-2 border-b border-border hide-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2',
                isActive
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-text-secondary hover:text-primary hover:bg-background'
              )
            }
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Content Area */}
      <div className="animate-in fade-in duration-500">
        <Outlet />
      </div>
    </div>
  );
};
