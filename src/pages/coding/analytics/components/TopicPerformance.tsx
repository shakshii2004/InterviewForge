import React from 'react';
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const TopicPerformance = ({ topics }: { topics: any[] }) => {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl backdrop-blur-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-700/50">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" /> Topic Performance
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-800/80 border-b border-slate-700/50">
            <tr>
              <th className="px-6 py-4 font-semibold">Topic</th>
              <th className="px-6 py-4 font-semibold text-center">Solved</th>
              <th className="px-6 py-4 font-semibold text-center">Avg Score</th>
              <th className="px-6 py-4 font-semibold text-center">Acceptance</th>
              <th className="px-6 py-4 font-semibold text-center">Weakness</th>
              <th className="px-6 py-4 font-semibold text-center">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {topics.length > 0 ? topics.map((t, i) => (
              <tr key={i} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-200">{t.topic}</td>
                <td className="px-6 py-4 text-center text-slate-300">{t.solved}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`font-bold ${t.averageScore >= 80 ? 'text-emerald-400' : t.averageScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {t.averageScore.toFixed(0)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-slate-300">{t.acceptanceRate.toFixed(1)}%</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    t.weaknessLevel === 'Low' ? 'bg-emerald-500/10 text-emerald-400' :
                    t.weaknessLevel === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {t.weaknessLevel}
                  </span>
                </td>
                <td className="px-6 py-4 flex justify-center">
                  {t.trend === 'Up' ? <TrendingUp className="w-5 h-5 text-emerald-400" /> :
                   t.trend === 'Down' ? <TrendingDown className="w-5 h-5 text-red-400" /> :
                   <Minus className="w-5 h-5 text-slate-400" />}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 italic">No topic data available yet. Solve some problems!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
