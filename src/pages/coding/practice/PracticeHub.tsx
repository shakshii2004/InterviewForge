import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import { Search, Bookmark, BookmarkCheck, Play, Filter, Code2, Users, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const PracticeHub = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
    fetchBookmarks();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/coding/practice/questions');
      setQuestions(res.data);
    } catch (err) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/coding/bookmarks');
      setBookmarks(new Set(res.data.map((b: any) => b.questionId._id)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.post('/coding/bookmarks', { questionId: id });
      const newBookmarks = new Set(bookmarks);
      if (res.data.bookmarked) {
        newBookmarks.add(id);
        toast.success('Bookmarked');
      } else {
        newBookmarks.delete(id);
        toast.success('Removed bookmark');
      }
      setBookmarks(newBookmarks);
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  };

  const startSolving = async (id: string) => {
    try {
      // Create a coding session for this question
      const res = await api.post('/coding/session', { questionId: id });
      navigate(`/dashboard/coding/session/${res.data.sessionId}`);
    } catch (err) {
      toast.error('Failed to start session');
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTopic !== 'All' && !q.topics?.includes(filterTopic)) return false;
    if (filterDifficulty !== 'All' && q.difficulty !== filterDifficulty) return false;
    return true;
  });

  const topics = ['All', ...new Set(questions.flatMap(q => q.topics || []))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-br from-indigo-900/40 to-slate-800/40 p-8 rounded-3xl border border-indigo-500/20 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 flex items-center gap-3">
              <Code2 className="w-10 h-10 text-indigo-400" /> Practice Hub
            </h1>
            <p className="text-slate-400 text-lg">Master algorithms and data structures across {questions.length} problems.</p>
          </div>
          
          <div className="relative z-10 flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-slate-400 font-medium mr-2">
            <Filter className="w-4 h-4" /> Filters:
          </div>
          
          <select 
            value={filterDifficulty} 
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          
          <select 
            value={filterTopic} 
            onChange={(e) => setFilterTopic(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            {topics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Problem List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestions.map((q) => (
            <div key={q._id} className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-sm hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {q.title}
                </h3>
                <button 
                  onClick={(e) => handleToggleBookmark(q._id, e)}
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  {bookmarks.has(q._id) ? <BookmarkCheck className="w-6 h-6 text-indigo-400 fill-indigo-400/20" /> : <Bookmark className="w-6 h-6" />}
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                  q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {q.difficulty}
                </span>
                {q.acceptanceRate && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {q.acceptanceRate}% Acc
                  </span>
                )}
                {q.estimatedTime && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {q.estimatedTime}m
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-6 flex-1">
                {q.topics?.slice(0, 3).map((t: string) => (
                  <span key={t} className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-md">
                    {t}
                  </span>
                ))}
                {(q.topics?.length || 0) > 3 && (
                  <span className="text-xs bg-slate-700/50 text-slate-400 px-2 py-1 rounded-md">
                    +{(q.topics?.length || 0) - 3} more
                  </span>
                )}
              </div>
              
              {q.companies?.length > 0 && (
                <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
                  <Users className="w-4 h-4" />
                  <span className="line-clamp-1">{q.companies.join(', ')}</span>
                </div>
              )}

              <button 
                onClick={() => startSolving(q._id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/50 hover:border-indigo-600 rounded-xl font-medium transition-all"
              >
                <Play className="w-4 h-4" /> Solve Challenge
              </button>
            </div>
          ))}

          {filteredQuestions.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              No questions found matching your filters.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
