import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Code2 } from 'lucide-react';
import { api } from '../../lib/api';
import { CodingWorkspace } from './workspace/CodingWorkspace';

export const CodingSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await api.get(`/coding/session/${sessionId}`);
        setSession(data);
      } catch (err: any) {
        console.error('Failed to load session', err);
        setError('Failed to load coding session. It may not exist or you are unauthorized.');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-primary/10 flex items-center justify-center mb-6 border border-slate-100 animate-pulse">
          <Code2 className="w-8 h-8 text-primary" />
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Preparing Workspace...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Code2 className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Session Error</h2>
          <p className="text-slate-500 mb-8">{error || 'Session not found'}</p>
          <button 
            onClick={() => navigate('/dashboard/coding')}
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors w-full"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <CodingWorkspace initialSession={session} />;
};
