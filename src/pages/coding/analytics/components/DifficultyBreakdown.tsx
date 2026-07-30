import React from 'react';
import { Layers } from 'lucide-react';

export const DifficultyBreakdown = ({ difficulty }: { difficulty: any }) => {
  const levels = [
    { name: 'Easy', data: difficulty?.easy, color: 'emerald' },
    { name: 'Medium', data: difficulty?.medium, color: 'amber' },
    { name: 'Hard', data: difficulty?.hard, color: 'red' },
  ];

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-sm">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Layers className="w-5 h-5 text-indigo-400" /> Difficulty Breakdown
      </h3>
      
      <div className="space-y-5">
        {levels.map((level, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={`font-semibold text-${level.color}-400`}>{level.name}</span>
              <span className="text-slate-300"><span className="font-bold text-white">{level.data?.solved || 0}</span> Solved</span>
            </div>
            
            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-${level.color}-500 rounded-full`}
                style={{ width: `${Math.max(1, level.data?.successRate || 0)}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>{level.data?.successRate?.toFixed(1) || 0}% Success</span>
              <span>Avg {level.data?.averageScore?.toFixed(0) || 0} Score</span>
              <span>{level.data?.averageRuntime?.toFixed(0) || 0}ms</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
