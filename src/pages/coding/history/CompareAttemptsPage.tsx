import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Clock, Cpu, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

export const CompareAttemptsPage = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // We will compare first vs latest attempt
  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const res = await api.get(`/coding/history/compare/${questionId}`);
        if (res.data.submissions?.length < 2) {
          setError('You need at least 2 submissions for this problem to compare attempts.');
        } else {
          setData(res.data);
        }
      } catch (err) {
        setError('Failed to load comparison data');
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [questionId]);

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">{error}</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Go Back</button>
      </div>
    );
  }

  const submissions = data.submissions;
  const first = submissions[0];
  const latest = submissions[submissions.length - 1];
  
  const runtimeDiff = first.executionTime - latest.executionTime;
  const memoryDiff = first.memoryUsed - latest.memoryUsed;
  const scoreDiff = (latest.review?.overallScore || 0) - (first.review?.overallScore || 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 flex flex-col h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Compare Attempts</h1>
          <p className="text-sm text-slate-400">First Attempt vs Latest Attempt</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-medium mb-1">Runtime Improvement</h3>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-white">{Math.abs(runtimeDiff)} ms</span>
            {runtimeDiff > 0 ? (
              <span className="flex items-center text-emerald-400 text-sm font-bold pb-1"><TrendingUp className="w-4 h-4 mr-1"/> Faster</span>
            ) : runtimeDiff < 0 ? (
              <span className="flex items-center text-red-400 text-sm font-bold pb-1"><TrendingDown className="w-4 h-4 mr-1"/> Slower</span>
            ) : <span className="text-slate-500 text-sm font-bold pb-1">No Change</span>}
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-medium mb-1">Memory Improvement</h3>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-white">{Math.abs(memoryDiff)} KB</span>
            {memoryDiff > 0 ? (
              <span className="flex items-center text-emerald-400 text-sm font-bold pb-1"><TrendingUp className="w-4 h-4 mr-1"/> Less RAM</span>
            ) : memoryDiff < 0 ? (
              <span className="flex items-center text-red-400 text-sm font-bold pb-1"><TrendingDown className="w-4 h-4 mr-1"/> More RAM</span>
            ) : <span className="text-slate-500 text-sm font-bold pb-1">No Change</span>}
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
          <h3 className="text-slate-400 text-sm font-medium mb-1">AI Score Trend</h3>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-white">{Math.abs(scoreDiff)} Pts</span>
            {scoreDiff > 0 ? (
              <span className="flex items-center text-emerald-400 text-sm font-bold pb-1"><TrendingUp className="w-4 h-4 mr-1"/> Better</span>
            ) : scoreDiff < 0 ? (
              <span className="flex items-center text-red-400 text-sm font-bold pb-1"><TrendingDown className="w-4 h-4 mr-1"/> Worse</span>
            ) : <span className="text-slate-500 text-sm font-bold pb-1">No Change</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="flex flex-col bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="p-4 bg-slate-800 border-b border-slate-700/50 flex justify-between items-center">
            <h2 className="font-bold text-white">First Attempt</h2>
            <div className="text-xs text-slate-400">{new Date(first.submittedAt).toLocaleString()}</div>
          </div>
          <div className="flex-1 relative">
            <Editor
              value={first.sourceCode}
              language={first.language === 'python' ? 'python' : first.language === 'java' ? 'java' : 'cpp'}
              theme="vs-dark"
              options={{ readOnly: true, minimap: { enabled: false } }}
            />
          </div>
          <div className="p-4 bg-slate-800 border-t border-slate-700/50 flex gap-4 text-sm font-medium text-slate-300">
            <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-400"/> {first.executionTime} ms</div>
            <div className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-blue-400"/> {first.memoryUsed} KB</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Score: {first.review?.overallScore || 'N/A'}</div>
          </div>
        </div>

        <div className="flex flex-col bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="p-4 bg-slate-800 border-b border-slate-700/50 flex justify-between items-center">
            <h2 className="font-bold text-emerald-400">Latest Attempt</h2>
            <div className="text-xs text-slate-400">{new Date(latest.submittedAt).toLocaleString()}</div>
          </div>
          <div className="flex-1 relative">
            <Editor
              value={latest.sourceCode}
              language={latest.language === 'python' ? 'python' : latest.language === 'java' ? 'java' : 'cpp'}
              theme="vs-dark"
              options={{ readOnly: true, minimap: { enabled: false } }}
            />
          </div>
          <div className="p-4 bg-slate-800 border-t border-slate-700/50 flex gap-4 text-sm font-medium text-slate-300">
            <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-400"/> {latest.executionTime} ms</div>
            <div className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-blue-400"/> {latest.memoryUsed} KB</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Score: {latest.review?.overallScore || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
