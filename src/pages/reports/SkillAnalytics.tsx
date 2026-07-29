import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Activity, Star, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const SkillAnalytics = () => {
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
        toast.error('Failed to load skill analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Activity className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  if (!data) return <div className="text-center py-20 text-gray-500">No skill data available.</div>;

  const barData = [
    { name: 'Tech', score: data.radarScores?.technical || 0 },
    { name: 'Comm', score: data.radarScores?.communication || 0 },
    { name: 'Problem', score: data.radarScores?.problemSolving || 0 },
    { name: 'Conf', score: data.radarScores?.confidence || 0 },
    { name: 'Proj', score: data.radarScores?.project || 0 },
    { name: 'Time', score: data.radarScores?.timeManagement || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Core Attributes Bar */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <h2 className="text-lg font-bold text-primary mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-500" /> Core Attributes Breakdown</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actionable Insights */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-center">
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> AI Recommendations</h2>
          {data.weakestSkills?.length > 0 ? (
            <div className="space-y-4">
              {data.weakestSkills.map((skill: string, idx: number) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-border">
                  <p className="font-bold text-primary mb-1">Improve: {skill}</p>
                  <p className="text-sm text-text-secondary">Based on recent interviews, focusing on this topic will yield the highest impact on your overall score.</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Not enough data to generate recommendations. Complete more interviews.</p>
          )}
        </div>
      </div>
      
      {/* Detected Skills Grid */}
      <h2 className="text-lg font-bold text-primary mt-8 mb-4">Detected Technical Strengths</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.strongestSkills?.length > 0 ? (
          data.strongestSkills.map((skill: string, idx: number) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between"
            >
              <span className="font-semibold text-primary">{skill}</span>
              <Star className="w-5 h-5 text-emerald-500 fill-emerald-500" />
            </motion.div>
          ))
        ) : (
          <p className="text-gray-500 col-span-3">No specific strengths isolated yet.</p>
        )}
      </div>
    </div>
  );
};
