import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, ArrowRight, Activity, CheckCircle, Code, Target } from 'lucide-react';
import { api } from '../../lib/api';

interface CodingStats {
  interviewsCompleted: number;
  problemsSolved: number;
  averageScore: number;
  favoriteLanguage: string;
}

export const CodingDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<CodingStats | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/coding/history');
        
        const historyList = Array.isArray(data) ? data : (data.history || []);
        setHistory(historyList);
        
        if (!Array.isArray(data) && data.stats) {
          setStats(data.stats);
        } else {
          const langs = historyList.map((s: any) => s.language).filter(Boolean);
          const favLang = langs.length 
            ? langs.sort((a: any, b: any) => langs.filter((v: any) => v===a).length - langs.filter((v: any) => v===b).length).pop() 
            : 'None';
            
          const scores = historyList.map((s: any) => s.review?.overallScore || s.score || 0).filter(Boolean);
          const avgScore = scores.length ? Math.round(scores.reduce((a:any, b:any) => a + b, 0) / scores.length) : 0;
          
          setStats({
            interviewsCompleted: historyList.length,
            problemsSolved: historyList.filter((s: any) => s.status === 'Accepted' || s.status === 'completed').length,
            averageScore: avgScore,
            favoriteLanguage: favLang as string
          });
        }
      } catch (error) {
        console.error('Failed to fetch coding dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getLanguageColor = (lang: string) => {
    switch(lang) {
      case 'JavaScript': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Python': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Java': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'C++': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case 'Easy': return 'text-green-500 bg-green-500/10';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'Hard': return 'text-red-500 bg-red-500/10';
      default: return 'text-primary bg-primary/10';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="bg-card/40 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Code2 className="w-4 h-4" />
              <span>Phase 3.1 Coding Setup</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight">
              Technical Coding Interviews
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              Tackle algorithmic problems in a browser IDE with AI paired programming hints. Customize your language, topics, and difficulty.
            </p>
            
            <button 
              onClick={() => navigate('/dashboard/coding/setup')}
              className="px-8 py-4 bg-primary text-background rounded-2xl font-bold flex items-center gap-3 hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-1 group"
            >
              Start Coding Interview
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="hidden md:flex flex-col gap-4">
            <div className="bg-card p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 rotate-3 transform-gpu">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Multiple Languages</p>
                <p className="font-bold text-slate-800">JS, Python, Java, C++</p>
              </div>
            </div>
            <div className="bg-card p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 -rotate-2 transform-gpu">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Focused Practice</p>
                <p className="font-bold text-slate-800">20+ Algo Topics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Interviews Completed', value: loading ? '-' : stats?.interviewsCompleted || 0, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Problems Solved', value: loading ? '-' : stats?.problemsSolved || 0, icon: Code, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Average Score', value: loading ? '-' : `${stats?.averageScore || 0}%`, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Favorite Language', value: loading ? '-' : stats?.favoriteLanguage || 'None', icon: Code2, color: 'text-orange-500', bg: 'bg-orange-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-card p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* History Section */}
      <div className="bg-card rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Previous Coding Sessions</h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Code2 className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No coding sessions yet</h3>
            <p className="text-slate-500 max-w-sm mb-6">
              Start your first coding interview to test your algorithmic skills and track your progress here.
            </p>
            <button 
              onClick={() => navigate('/dashboard/coding/setup')}
              className="px-6 py-2.5 bg-primary/10 text-primary font-semibold rounded-xl hover:bg-primary/20 transition-colors"
            >
              Start Practice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Language</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Topics</th>
                  <th className="px-6 py-4">Questions</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((session: any) => (
                  <tr key={session._id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/coding/session/${session._id}`)}>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getLanguageColor(session.language)}`}>
                        {session.language}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getDifficultyColor(session.difficulty)}`}>
                        {session.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">
                      {(session.topics || session.questionId?.topics || []).join(', ')}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {session.numberOfQuestions} Qs
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {session.duration} min
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                        ${session.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          session.status === 'active' ? 'bg-blue-100 text-blue-700' :
                          session.status === 'abandoned' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'}`}
                      >
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
