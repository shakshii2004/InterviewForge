import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Trophy, Clock, Target, Flame, Activity } from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { cn } from '../../utils/cn';

export const ReportsOverview = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load analytics dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Activity className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  }

  if (!data) return <div className="text-center py-20 text-text-secondary">No analytics data available.</div>;

  const stats = [
    { label: 'Total Interviews', value: data.totalInterviews, icon: Video, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Average Score', value: `${data.averageScore}/100`, icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Highest Score', value: `${data.highestScore}/100`, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Current Streak', value: `${data.currentStreak} Days`, icon: Flame, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Practice Time', value: `${data.totalPracticeTime}m`, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  const radarData = [
    { subject: 'Technical', A: data.radarScores?.technical || 0, fullMark: 100 },
    { subject: 'Communication', A: data.radarScores?.communication || 0, fullMark: 100 },
    { subject: 'Problem Solving', A: data.radarScores?.problemSolving || 0, fullMark: 100 },
    { subject: 'Confidence', A: data.radarScores?.confidence || 0, fullMark: 100 },
    { subject: 'Project Exp', A: data.radarScores?.project || 0, fullMark: 100 },
    { subject: 'Time Mgmt', A: data.radarScores?.timeManagement || 0, fullMark: 100 },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
            <p className="text-sm font-medium text-text-secondary mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Radar Chart */}
        <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-primary mb-6">Aggregate Skill Profile</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Average Score" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
            <h3 className="text-emerald-800 font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Top Strengths
            </h3>
            {data.strongestSkills?.length > 0 ? (
              <ul className="space-y-3">
                {data.strongestSkills.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-emerald-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span className="font-medium">{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-emerald-600/70 text-sm">Complete more interviews to identify strengths.</p>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
            <h3 className="text-amber-800 font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" /> Areas to Improve
            </h3>
            {data.weakestSkills?.length > 0 ? (
              <ul className="space-y-3">
                {data.weakestSkills.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-amber-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span className="font-medium">{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-amber-600/70 text-sm">Complete more interviews to identify weaknesses.</p>
            )}
          </div>
          
          {/* Achievements Span Full */}
          <div className="md:col-span-2 bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mt-4">
            <h3 className="text-indigo-800 font-bold mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5" /> Earned Achievements
            </h3>
            <div className="flex flex-wrap gap-3">
              {data.achievements?.length > 0 ? data.achievements.map((ach: string, i: number) => (
                <div key={i} className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-indigo-200 shadow-sm">
                  <span className="text-lg">🏅</span>
                  <span className="text-sm font-bold text-indigo-900">{ach}</span>
                </div>
              )) : (
                <p className="text-indigo-600/70 text-sm">No achievements yet. Keep practicing!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
