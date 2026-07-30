import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import { Clock, ShieldAlert, Trophy, Settings, Play } from 'lucide-react';
import toast from 'react-hot-toast';

export const AssessmentHub = () => {
  const [type, setType] = useState<'Assessment' | 'Contest'>('Assessment');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await api.post('/coding/assessment', {
        type,
        durationMinutes,
        difficulty: type === 'Contest' ? difficulty : undefined, // Contests can have fixed difficulty, assessments might be mixed
        questionCount
      });
      navigate(`/dashboard/coding/assessment/${res.data._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full bg-slate-800/40 border border-slate-700/50 p-8 md:p-12 rounded-3xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">Coding Assessments</h1>
          <p className="text-slate-400 text-lg">Test your skills under pressure with timed assessments or custom contest modes.</p>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-6 mb-10">
          <button
            onClick={() => setType('Assessment')}
            className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center ${
              type === 'Assessment' 
                ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            <ShieldAlert className={`w-10 h-10 ${type === 'Assessment' ? 'text-indigo-400' : 'text-slate-500'}`} />
            <h3 className="text-xl font-bold">Mock Assessment</h3>
            <p className="text-sm">Structured interview-style test with mixed difficulty.</p>
          </button>

          <button
            onClick={() => setType('Contest')}
            className={`flex-1 p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center ${
              type === 'Contest' 
                ? 'bg-fuchsia-600/10 border-fuchsia-500 text-white shadow-[0_0_20px_rgba(192,38,211,0.2)]' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            <Trophy className={`w-10 h-10 ${type === 'Contest' ? 'text-fuchsia-400' : 'text-slate-500'}`} />
            <h3 className="text-xl font-bold">Custom Contest</h3>
            <p className="text-sm">Configure your own rules, difficulty, and duration.</p>
          </button>
        </div>

        <div className="relative z-10 bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8 space-y-6">
          <div className="flex items-center gap-3 text-lg font-bold text-white border-b border-slate-700 pb-4">
            <Settings className="w-5 h-5 text-indigo-400" /> Configuration
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Duration (Minutes)
              </label>
              <select 
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
                <option value={90}>90 Minutes</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Questions Count</label>
              <select 
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value={1}>1 Question</option>
                <option value={2}>2 Questions</option>
                <option value={3}>3 Questions</option>
                <option value={4}>4 Questions</option>
              </select>
            </div>
            
            {type === 'Contest' && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-400">Difficulty Level</label>
                <div className="flex gap-4">
                  {['Easy', 'Medium', 'Hard'].map(d => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-colors ${
                        difficulty === d
                          ? d === 'Easy' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : d === 'Medium' ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                          : 'bg-red-500/20 border-red-500 text-red-400'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={handleStart}
          disabled={loading}
          className="relative z-10 w-full flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" /> Start {type}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
