import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Code2 } from 'lucide-react';

export const LanguagePerformance = ({ languages }: { languages: any[] }) => {
  const COLORS = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-sm">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Code2 className="w-5 h-5 text-blue-400" /> Language Distribution
      </h3>
      
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={languages}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="problemsSolved"
                nameKey="language"
                stroke="none"
              >
                {languages.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 space-y-3 w-full">
          {languages.length > 0 ? languages.map((l, i) => (
            <div key={i} className="flex justify-between items-center bg-slate-700/30 p-2.5 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="font-medium text-slate-200">{l.language}</span>
              </div>
              <div className="text-sm">
                <span className="text-slate-400 mr-3">{l.problemsSolved} solved</span>
                <span className="font-bold text-slate-200">{l.averageScore.toFixed(0)} avg</span>
              </div>
            </div>
          )) : (
            <p className="text-sm text-slate-500 italic">No language data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
