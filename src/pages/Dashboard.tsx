import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Target, Trophy, Clock, Play, Edit3, ArrowRight, Video, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';

const stats = [
  { label: 'Interviews Completed', value: '0', icon: Video, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Average Score', value: '-', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { label: 'Practice Time', value: '0h', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { label: 'Target Role', value: 'Not Set', icon: Target, color: 'text-blue-600', bg: 'bg-blue-100' },
];

const quickActions = [
  {
    title: 'Start AI Interview',
    description: 'Jump right into a new mock interview session.',
    icon: Play,
    link: '#',
    soon: true,
    primary: true,
  },
  {
    title: 'Update Profile',
    description: 'Keep your target role and skills up to date.',
    icon: Edit3,
    link: '/dashboard/profile',
    soon: false,
    primary: false,
  },
];

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-text-secondary">
            Ready to crush your next technical interview?
          </p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-secondary">{stat.label}</p>
                <p className="text-2xl font-bold text-primary mt-0.5">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Actions & Empty States) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions */}
          <section>
            <h2 className="text-xl font-bold text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, idx) => {
                const ActionTag = action.soon ? 'div' : Link;
                return (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                  >
                    <ActionTag
                      to={action.link}
                      className={cn(
                        "group block p-6 rounded-2xl border transition-all relative overflow-hidden",
                        action.soon ? "cursor-default border-border bg-gray-50" : "cursor-pointer bg-white shadow-sm",
                        action.primary && !action.soon ? "border-primary/20 hover:border-primary/40 hover:shadow-md" : "",
                        !action.primary && !action.soon ? "border-border hover:border-gray-300 hover:shadow-md" : ""
                      )}
                    >
                      {action.primary && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[50px] rounded-full pointer-events-none" />
                      )}
                      
                      <div className="flex items-start justify-between relative z-10">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center mb-4",
                          action.primary ? "bg-primary text-white shadow-md" : "bg-gray-100 text-primary border border-border"
                        )}>
                          <action.icon className="w-5 h-5" />
                        </div>
                        {action.soon && (
                          <span className="text-xs font-bold uppercase tracking-wider bg-gray-200 text-text-secondary px-2 py-1 rounded-md flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" /> Coming Soon
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-bold text-primary mb-2">{action.title}</h3>
                      <p className="text-sm text-text-secondary mb-4">{action.description}</p>
                      
                      {!action.soon && (
                        <div className={cn(
                          "flex items-center gap-2 text-sm font-bold transition-colors",
                          action.primary ? "text-primary" : "text-text-secondary group-hover:text-primary"
                        )}>
                          Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </ActionTag>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* AI Feedback Teaser */}
          <section>
            <div className="bg-gradient-to-br from-primary to-[#4a2450] border border-primary/20 rounded-2xl p-8 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[80px] rounded-full pointer-events-none" />
              <div className="relative z-10 max-w-md">
                <Sparkles className="w-8 h-8 text-accent mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">AI-Powered Insights</h2>
                <p className="text-white/80 mb-6">
                  Complete your first mock interview to unlock personalized feedback, pacing analysis, and a custom learning roadmap.
                </p>
                <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-colors cursor-not-allowed opacity-50">
                  Analyze Performance (Locked)
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (Recent Activity) */}
        <div className="lg:col-span-1">
          <section className="bg-white border border-border rounded-2xl p-6 h-full shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-6">Recent Activity</h2>
            
            <div className="flex flex-col items-center justify-center text-center py-12 px-4 h-[300px]">
              <div className="w-16 h-16 rounded-full bg-gray-50 border border-border flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-primary font-bold mb-2">No activity yet</h3>
              <p className="text-sm text-text-secondary max-w-[200px]">
                Your recent interviews and achievements will appear here.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
