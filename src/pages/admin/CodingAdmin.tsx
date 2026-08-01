import { useState } from 'react';
import { api } from '../../lib/api';
import { Database, Search, Plus, Save, Download } from 'lucide-react';

export const CodingAdmin = () => {
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleImport = async () => {
    if (!slug) return;
    setLoading(true);
    setMessage('');
    
    // Auto-extract slug if full URL is pasted
    let finalSlug = slug.trim();
    if (finalSlug.includes('leetcode.com/problems/')) {
      const match = finalSlug.match(/problems\/([^/]+)/);
      if (match) finalSlug = match[1];
    }

    try {
      const { data } = await api.post('/admin/coding/import', { titleSlug: finalSlug });
      setMessage(`Success! Imported "${data.question.title}"`);
      setSlug('');
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Database className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Problem Importer</h1>
          <p className="text-slate-500">Easily fetch and import problems from LeetCode</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-slate-400" />
          Import from LeetCode
        </h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Paste LeetCode URL or title slug (e.g., 'two-sum')"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-slate-700 bg-slate-50 placeholder:text-slate-400"
            disabled={loading}
          />
          <button
            onClick={handleImport}
            disabled={loading || !slug}
            className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Import
              </>
            )}
          </button>
        </div>
        
        {message && (
          <div className={`mt-4 p-4 rounded-xl font-medium ${message.startsWith('Error') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};
