import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import { Clock, CheckCircle2, XCircle, Code, ArrowRight, Download, Trash2, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

export const HistoryPage = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/coding/history');
      setHistory(res.data);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
    try {
      await api.delete(`/coding/history/${id}`);
      setHistory(history.filter(h => h._id !== id));
      toast.success('Submission deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Problem', 'Language', 'Difficulty', 'Status', 'Runtime (ms)', 'Memory (KB)', 'Score', 'Date'];
    const rows = history.map(h => [
      `"${h.questionId?.title || 'Unknown'}"`,
      h.language,
      h.questionId?.difficulty || 'Unknown',
      h.status,
      h.executionTime || 0,
      h.memoryUsed || 0,
      h.review?.overallScore || 0,
      new Date(h.submittedAt).toLocaleDateString()
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'InterviewForge_Coding_History.csv';
    link.click();
  };

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
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-md">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Coding History</h1>
            <p className="text-slate-400">Review past submissions, compare attempts, and track your progress.</p>
          </div>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl backdrop-blur-sm overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Problem</th>
                <th className="px-6 py-4">Language</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Runtime / Mem</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {history.map((item) => (
                <tr key={item._id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white mb-1">{item.questionId?.title || 'Unknown'}</div>
                    <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${
                      item.questionId?.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                      item.questionId?.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {item.questionId?.difficulty || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-300">
                    {item.language}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 font-bold ${item.status === 'Accepted' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {item.status === 'Accepted' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3"/> {item.executionTime} ms</div>
                    <div className="flex items-center gap-1 mt-1"><Cpu className="w-3 h-3"/> {item.memoryUsed} KB</div>
                  </td>
                  <td className="px-6 py-4">
                    {item.review ? (
                      <span className={`font-bold ${item.review.overallScore >= 80 ? 'text-emerald-400' : item.review.overallScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {item.review.overallScore}/100
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">No Review</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(item.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/dashboard/coding/history/compare/${item.questionId?._id}`)}
                        className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        title="Compare Attempts"
                      >
                        <Code className="w-4 h-4" />
                      </button>
                      {item.review && (
                        <button 
                          onClick={() => navigate(`/dashboard/coding/review/${item.review._id}`)}
                          className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="View Review"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(item._id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Submission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No coding history found. Start practicing!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
