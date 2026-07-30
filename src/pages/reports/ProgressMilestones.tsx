import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Activity, LineChart as LineChartIcon, Trophy } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const ProgressMilestones = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get('/reports/progress');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Activity className="w-8 h-8 text-indigo-500 animate-spin" /></div>;
  if (!data || data.length === 0) return <div className="text-center py-20 text-text-secondary">Not enough data to map progress. Complete at least one interview!</div>;

  return (
    <div className="space-y-6">
      
      {/* Line Chart */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <h2 className="text-lg font-bold text-primary mb-6 flex items-center gap-2"><LineChartIcon className="w-5 h-5 text-indigo-500" /> Score Progression</h2>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
              />
              <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Mini milestones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <Trophy className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
            <h3 className="text-3xl font-bold mb-1">{data.length}</h3>
            <p className="text-indigo-100 text-sm font-medium">Interviews Completed</p>
         </div>
         <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
            <h3 className="text-3xl font-bold mb-1">
              {data.length > 0 ? data[data.length - 1].score : 0}
            </h3>
            <p className="text-emerald-100 text-sm font-medium">Latest Score</p>
         </div>
      </div>
      
    </div>
  );
};
