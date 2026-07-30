import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { Search, Download, Trash2, FileText, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

export const InterviewHistory = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const res = await api.get('/reports/history');
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this interview and its evaluation?')) return;
    try {
      const res = await api.delete(`/reports/interview/${id}`);
      if (res.data.success) {
        toast.success('Interview deleted');
        fetchHistory();
      }
    } catch (err) {
      toast.error('Failed to delete interview');
    }
  };

  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Date', 'Role', 'Type', 'Difficulty', 'Duration (m)', 'Score', 'Status'];
    const rows = history.map(h => [
      new Date(h.createdAt).toLocaleDateString(),
      h.role,
      h.interviewType,
      h.difficulty,
      h.duration || 0,
      h.score || 0,
      h.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "interview_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredHistory = history.filter(h => {
    const matchesSearch = h.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || h.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
      {/* Toolbar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/50">
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm border border-border rounded-lg appearance-none bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
        
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-background transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background text-text-secondary sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Score</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-text-secondary">Loading history...</td></tr>
            ) : filteredHistory.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-text-secondary">No interviews found.</td></tr>
            ) : (
              filteredHistory.map((item) => (
                <tr key={item._id} className="hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-text-secondary">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-primary">{item.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-text-secondary capitalize">{item.interviewType}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-primary">{item.score ? `${item.score}/100` : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn("px-2.5 py-1 text-xs font-bold rounded-md capitalize", item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                    {item.status === 'completed' && (
                      <button onClick={() => navigate(`/evaluation/${item._id}`)} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm inline-flex items-center gap-1">
                        <FileText className="w-4 h-4" /> Report
                      </button>
                    )}
                    <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Simple Pagination Footer Placeholder */}
      <div className="p-4 border-t border-border flex items-center justify-between text-sm text-text-secondary bg-card">
        <span>Showing {filteredHistory.length} interviews</span>
        <div className="flex gap-2">
          <button disabled className="p-1 rounded border border-border opacity-50 cursor-not-allowed"><ChevronLeft className="w-5 h-5"/></button>
          <button disabled className="p-1 rounded border border-border opacity-50 cursor-not-allowed"><ChevronRight className="w-5 h-5"/></button>
        </div>
      </div>
    </div>
  );
};
