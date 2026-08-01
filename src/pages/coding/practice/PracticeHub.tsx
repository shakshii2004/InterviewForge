import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import { Search, Bookmark, BookmarkCheck, Play, Filter, Code2, Users, Clock, CheckCircle2, ChevronLeft, ChevronRight, List } from 'lucide-react';
import toast from 'react-hot-toast';

// Curated list of popular topics since we don't have all questions in memory anymore
const POPULAR_TOPICS = [
  'All',
  'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math', 'Sorting',
  'Greedy', 'Depth-First Search', 'Database', 'Breadth-First Search', 'Tree',
  'Binary Search', 'Matrix', 'Two Pointers', 'Bit Manipulation', 'Stack',
  'Design', 'Graph', 'Linked List', 'Heap (Priority Queue)'
];

export const PracticeHub = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filtering state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const navigate = useNavigate();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch when filters/page change
  useEffect(() => {
    fetchQuestions();
    fetchBookmarks();
  }, [debouncedSearch, filterTopic, filterDifficulty, page]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (filterTopic !== 'All') params.append('topic', filterTopic);
      if (filterDifficulty !== 'All') params.append('difficulty', filterDifficulty);

      const res = await api.get(`/coding/practice/questions?${params.toString()}`);
      
      // Update state with new paginated format
      if (res.data.questions) {
        setQuestions(res.data.questions);
        setTotalPages(res.data.totalPages);
        setTotalQuestions(res.data.totalQuestions);
      } else {
        // Fallback if backend wasn't updated
        setQuestions(res.data);
      }
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
      const res = await api.post('/coding/session', { questionId: id });
      navigate(`/dashboard/coding/session/${res.data.sessionId}`);
    } catch (err) {
      toast.error('Failed to start session');
    }
  };

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-br from-slate-800 to-slate-900 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4">
              <List className="w-4 h-4" />
              <span>Problemset</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
              Practice Problems
            </h1>
            <p className="text-slate-400 text-lg">Master algorithms across {totalQuestions} curated challenges.</p>
          </div>
          
          <div className="relative z-10 w-full md:w-80">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search problems, topics, or companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 text-slate-400 font-medium mr-2">
            <Filter className="w-4 h-4" /> Filters:
          </div>
          
          <select 
            value={filterDifficulty} 
            onChange={(e) => { setFilterDifficulty(e.target.value); setPage(1); }}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer font-medium appearance-none"
          >
            {difficulties.map(d => <option key={d} value={d}>{d === 'All' ? 'Difficulty' : d}</option>)}
          </select>
          
          <select 
            value={filterTopic} 
            onChange={(e) => { setFilterTopic(e.target.value); setPage(1); }}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer font-medium appearance-none max-w-[200px]"
          >
            {POPULAR_TOPICS.map(t => <option key={t} value={t}>{t === 'All' ? 'Tags' : t}</option>)}
          </select>
        </div>

        {/* Problem Table */}
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-800/80 text-slate-400 font-medium border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-4 w-12">Status</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4 w-32">Acceptance</th>
                  <th className="px-6 py-4 w-32">Difficulty</th>
                  <th className="px-6 py-4 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p>Loading problems...</p>
                      </div>
                    </td>
                  </tr>
                ) : questions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Search className="w-8 h-8 text-slate-600" />
                        <p>No matching problems found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  questions.map((q) => (
                    <tr 
                      key={q._id} 
                      onClick={() => startSolving(q._id)}
                      className="hover:bg-slate-700/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        {/* Status Icon Placeholder (can be wired up to user progress later) */}
                        <div className="w-5 h-5 rounded-full border-2 border-slate-600 group-hover:border-indigo-400 transition-colors" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                            {q.title}
                          </span>
                          <div className="flex gap-2">
                            {q.topics?.slice(0, 3).map((t: string) => (
                              <span key={t} className="text-[10px] bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {q.totalSubmissions ? Math.round((q.totalAccepted / q.totalSubmissions) * 100) : 0}%
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${
                          q.difficulty === 'Easy' ? 'text-emerald-400' :
                          q.difficulty === 'Medium' ? 'text-amber-400' :
                          'text-rose-400'
                        }`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => handleToggleBookmark(q._id, e)}
                          className="text-slate-500 hover:text-indigo-400 transition-colors p-2"
                        >
                          {bookmarks.has(q._id) ? <BookmarkCheck className="w-5 h-5 text-indigo-400 fill-indigo-400/20" /> : <Bookmark className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t border-slate-700/50 flex items-center justify-between bg-slate-800/80">
              <span className="text-sm text-slate-400">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, totalQuestions)} of {totalQuestions} problems
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum = page;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          page === pageNum 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg bg-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
