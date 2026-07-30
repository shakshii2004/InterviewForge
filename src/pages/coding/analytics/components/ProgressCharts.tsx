import React from 'react';
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

export const ProgressCharts = ({ data }: { data: any }) => {
  const radarData = [
    { subject: 'Correctness', A: data.averageCorrectness || 0, fullMark: 100 },
    { subject: 'Optimization', A: data.averageOptimization || 0, fullMark: 100 },
    { subject: 'Readability', A: data.averageReadability || 0, fullMark: 100 },
    { subject: 'Best Practices', A: data.averageBestPractices || 0, fullMark: 100 },
    { subject: 'Complexity', A: data.averageComplexity || 0, fullMark: 100 }
  ];

  const monthlyData = data.monthlyProgress;

  return (
    <>
      <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-sm">
        <h3 className="text-lg font-bold text-white mb-6">Monthly Activity & Scores</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Area type="monotone" dataKey="problemsSolved" name="Problems Solved" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorSolved)" />
              <Area type="monotone" dataKey="averageScore" name="Avg Score" stroke="#34d399" strokeWidth={3} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-sm flex flex-col items-center">
        <h3 className="text-lg font-bold text-white mb-2 w-full text-left">Skill Radar</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
              <Radar name="Score" dataKey="A" stroke="#818cf8" strokeWidth={2} fill="#6366f1" fillOpacity={0.4} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};
