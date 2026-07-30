import React from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, Star, Zap, Shield, Crown } from 'lucide-react';

export const Achievements = ({ badges }: { badges: string[] }) => {
  
  const allBadges = [
    { id: 'First Submission', icon: <Star />, color: 'text-amber-400', bg: 'bg-amber-400/20' },
    { id: '10 Problems Solved', icon: <Zap />, color: 'text-blue-400', bg: 'bg-blue-400/20' },
    { id: '50 Problems Solved', icon: <Shield />, color: 'text-emerald-400', bg: 'bg-emerald-400/20' },
    { id: '100 Problems Solved', icon: <Crown />, color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/20' },
    { id: '7-Day Streak', icon: <Award />, color: 'text-rose-400', bg: 'bg-rose-400/20' }
  ];

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-sm">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Award className="w-5 h-5 text-amber-400" /> Achievements
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {allBadges.map((badge, i) => {
          const unlocked = badges.includes(badge.id);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                unlocked 
                  ? `bg-slate-700/40 border-slate-600 shadow-lg ${badge.bg.replace('20', '10')}` 
                  : 'bg-slate-800/20 border-slate-700/50 opacity-60 grayscale'
              }`}
            >
              <div className={`p-3 rounded-full mb-3 ${unlocked ? badge.bg : 'bg-slate-700'} ${unlocked ? badge.color : 'text-slate-500'}`}>
                {unlocked ? badge.icon : <Lock className="w-6 h-6" />}
              </div>
              <span className={`text-sm font-semibold ${unlocked ? 'text-slate-200' : 'text-slate-500'}`}>
                {badge.id}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
