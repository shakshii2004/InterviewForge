import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Code, Zap, Box, TrendingUp, Clock, Trophy, Flame } from 'lucide-react';

export const OverviewCards = ({ data }: { data: any }) => {
  const cards = [
    { title: 'Problems Solved', value: data.totalProblemsSolved, icon: <Code />, color: 'from-blue-500 to-indigo-500' },
    { title: 'Acceptance Rate', value: `${data.acceptanceRate.toFixed(1)}%`, icon: <CheckCircle2 />, color: 'from-emerald-400 to-emerald-600' },
    { title: 'Average Score', value: data.averageScore.toFixed(0), icon: <TrendingUp />, color: 'from-purple-500 to-fuchsia-500' },
    { title: 'Avg Runtime', value: `${data.averageRuntime.toFixed(1)} ms`, icon: <Zap />, color: 'from-amber-400 to-orange-500' },
    { title: 'Avg Memory', value: `${data.averageMemory.toFixed(1)} MB`, icon: <Box />, color: 'from-cyan-400 to-blue-500' },
    { title: 'Current Streak', value: `${data.currentStreak} Days`, icon: <Flame />, color: 'from-red-400 to-rose-600' },
    { title: 'Longest Streak', value: `${data.longestStreak} Days`, icon: <Trophy />, color: 'from-yellow-400 to-amber-500' },
    { title: 'Favorite Lang', value: data.favoriteLanguage, icon: <Code />, color: 'from-slate-500 to-slate-700' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm hover:bg-slate-800/60 transition-colors relative overflow-hidden group"
        >
          <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity`} />
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color} text-white`}>
              {React.cloneElement(card.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
            </div>
            <div className="text-sm font-medium text-slate-400">{card.title}</div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-white">{card.value}</div>
        </motion.div>
      ))}
    </div>
  );
};
