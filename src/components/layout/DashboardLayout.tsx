import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background text-text font-sans flex overflow-hidden">
      {/* Background Ornaments */}
      <div className="fixed top-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-5xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
