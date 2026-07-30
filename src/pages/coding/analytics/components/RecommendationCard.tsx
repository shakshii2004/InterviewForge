import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { api } from '../../../../lib/api';
import { motion } from 'framer-motion';

export const RecommendationCard = () => {
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check if we already have recs from the DB or trigger a generation if needed
    // The instructions say "Generate recommendations on-demand". 
    // We'll provide a button to generate them if none exist.
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.post('/coding/analytics/recommendations');
      setRecs(res.data);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 p-6 md:p-8 rounded-3xl backdrop-blur-sm relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-400" /> AI Coach Recommendations
        </h3>
        
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
        >
          {loading ? 'Analyzing...' : recs.length > 0 ? 'Refresh' : 'Generate'}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-indigo-200">Analyzing your performance data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-rose-400">
            Failed to generate recommendations. Please try again.
          </div>
        ) : recs.length > 0 ? (
          <div className="space-y-4">
            {recs.map((rec, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-900/40 border border-indigo-500/20 p-4 rounded-2xl"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg mt-1">
                    <BookOpen className="w-4 h-4 text-indigo-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-indigo-100 mb-1">{rec.action} <span className="text-indigo-400 text-sm">({rec.topic})</span></h4>
                    <p className="text-sm text-indigo-200/80 leading-relaxed">{rec.reason}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-4">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-indigo-200 mb-2 font-medium">Ready for personalized advice?</p>
            <p className="text-sm text-indigo-300/70">Our AI coach will analyze your weaknesses and recent scores to build a targeted study plan.</p>
          </div>
        )}
      </div>
    </div>
  );
};
