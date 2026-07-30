import { Clock, CheckCircle2, Save, Play, RefreshCw, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface SessionHeaderProps {
  session: any;
  language: string;
  onLanguageChange: (lang: string) => void;
  isSaving: boolean;
  lastSavedAt: Date | null;
  onRun: () => void;
  onSubmit: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
}

const CountdownTimer = ({ startTime, durationMinutes }: { startTime: string, durationMinutes: number }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const durationMs = durationMinutes * 60 * 1000;
    const end = start + durationMs;

    const updateTimer = () => {
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft('00:00');
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime, durationMinutes]);

  return <span className="text-sm font-mono font-medium text-slate-700">{timeLeft || '...'}</span>;
};

export const SessionHeader = ({ session, language, onLanguageChange, isSaving, lastSavedAt, onRun, onSubmit, isRunning, isSubmitting }: SessionHeaderProps) => {
  const navigate = useNavigate();
  const languages = ['Java', 'C++', 'Python', 'JavaScript'];

  return (
    <div className="h-14 border-b border-slate-200 bg-card flex items-center justify-between px-4 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/dashboard/coding')}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          title="Exit Session"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
            IF
          </div>
          <span className="font-bold text-slate-800">Coding Workspace</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Clock className="w-4 h-4 text-slate-400" />
          <CountdownTimer startTime={session.createdAt} durationMinutes={session.duration} />
        </div>

        <select 
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="text-sm font-semibold bg-card border border-slate-200 rounded-lg px-3 py-1.5 outline-none hover:border-slate-300 focus:border-primary transition-colors cursor-pointer"
        >
          {languages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        
        <div className="flex items-center gap-2 text-sm">
          {isSaving ? (
            <span className="flex items-center gap-1.5 text-slate-500">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
            </span>
          ) : lastSavedAt ? (
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-400">
              <Save className="w-3.5 h-3.5" /> Not saved
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onRun}
          disabled={isRunning || isSubmitting}
          className="px-4 py-1.5 rounded-lg font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} 
          Run
        </button>
        <button 
          onClick={onSubmit}
          disabled={isRunning || isSubmitting}
          className="px-4 py-1.5 rounded-lg font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
          Submit
        </button>
      </div>
    </div>
  );
};
