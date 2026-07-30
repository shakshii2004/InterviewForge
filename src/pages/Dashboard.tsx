import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Target, Trophy, Clock, Play, Edit3, ArrowRight, Video, Sparkles, FileText, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await api.get('/interviews');
        if (res.data.success) {
          setInterviews(res.data.interviews);
        }
      } catch (err) {
        toast.error('Failed to load interview history');
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  const completed = interviews.filter(i => i.status === 'completed');
  const avgScore = completed.length 
    ? Math.round(completed.reduce((acc, curr) => acc + (curr.score || 0), 0) / completed.length) 
    : 0;
  const totalDuration = completed.reduce((acc, curr) => acc + (curr.duration || 0), 0);

  const stats = [
    { label: 'Interviews Completed', value: completed.length.toString(), icon: Video, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Average Score', value: completed.length ? `${avgScore}/100` : '-', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Practice Time', value: `${totalDuration}m`, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Target Role', value: user?.targetRole || 'Not Set', icon: Target, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  const quickActions = [
    {
      title: 'Start AI Interview',
      description: 'Jump right into a new mock text interview session.',
      icon: Play,
      link: '/dashboard/interviews',
      soon: false,
      primary: true,
    },
    {
      title: 'Live Audio/Video Interview',
      description: 'Practice with a real-time AI using your webcam and mic.',
      icon: Video,
      link: '/dashboard/interview/live/setup',
      soon: false,
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
            className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
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
        {/* Left Column (Actions) */}
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <h2 className="text-xl font-bold text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, idx) => {
                const ActionTag = action.soon ? 'div' : Link;
                return (
                  <motion.div key={action.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + idx * 0.1 }}>
                    <ActionTag
                      to={action.link}
                      className={cn(
                        "group block p-6 rounded-2xl border transition-all relative overflow-hidden",
                        action.soon ? "cursor-default border-border bg-background" : "cursor-pointer bg-card shadow-sm",
                        action.primary && !action.soon ? "border-primary/20 hover:border-primary/40 hover:shadow-md" : "",
                        !action.primary && !action.soon ? "border-border hover:border-border hover:shadow-md" : ""
                      )}
                    >
                      {action.primary && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[50px] rounded-full pointer-events-none" />
                      )}
                      
                      <div className="flex items-start justify-between relative z-10">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4", action.primary ? "bg-primary text-background shadow-md" : "bg-background text-primary border border-border")}>
                          <action.icon className="w-5 h-5" />
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-primary mb-2">{action.title}</h3>
                      <p className="text-sm text-text-secondary mb-4">{action.description}</p>
                      
                      {!action.soon && (
                        <div className={cn("flex items-center gap-2 text-sm font-bold transition-colors", action.primary ? "text-primary" : "text-text-secondary group-hover:text-primary")}>
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
          {completed.length === 0 && (
            <section>
              <div className="bg-gradient-to-br from-primary to-[#4a2450] border border-primary/20 rounded-2xl p-8 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[80px] rounded-full pointer-events-none" />
                <div className="relative z-10 max-w-md">
                  <Sparkles className="w-8 h-8 text-accent mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">AI-Powered Insights</h2>
                  <p className="text-white/80 mb-6">
                    Complete your first mock interview to unlock personalized feedback, pacing analysis, and a custom learning roadmap.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Column (Recent Activity) */}
        <div className="lg:col-span-1">
          <section className="bg-card border border-border rounded-2xl p-6 h-full shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-6">Interview History</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12"><Activity className="w-8 h-8 text-indigo-400 animate-spin" /></div>
            ) : interviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 h-[300px]">
                <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-primary font-bold mb-2">No activity yet</h3>
                <p className="text-sm text-text-secondary max-w-[200px]">Your recent interviews will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.map((session, i) => (
                  <motion.div key={session._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="p-4 rounded-xl border border-border hover:border-indigo-300 transition-colors bg-background hover:bg-card group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-primary">{session.role}</h4>
                        <p className="text-xs text-text-secondary">{new Date(session.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={cn("px-2 py-1 text-xs font-bold rounded-md", session.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                        {session.status}
                      </span>
                    </div>
                    {session.status === 'completed' ? (
                      <button onClick={() => navigate(`/evaluation/${session._id}`)} className="mt-3 w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <FileText className="w-4 h-4" /> View Report
                      </button>
                    ) : (
                      <button onClick={() => navigate(`/interview/${session._id}`)} className="mt-3 w-full py-2 bg-amber-50 text-amber-600 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors">
                        <Play className="w-4 h-4" /> Resume Interview
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
