import { Terminal, CheckCircle2, XCircle, Clock, Database, Loader2, AlertTriangle } from 'lucide-react';

interface ConsolePanelProps {
  results: any[];
  isRunning: boolean;
  isSubmitting: boolean;
}

export const ConsolePanel = ({ results, isRunning, isSubmitting }: ConsolePanelProps) => {
  const isLoading = isRunning || isSubmitting;

  return (
    <div className="h-full flex flex-col bg-slate-50 border-t border-slate-200 overflow-hidden">
      <div className="h-10 border-b border-slate-200 flex items-center px-4 bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-bold text-slate-700">Console</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="font-medium">{isRunning ? 'Running Sample Tests...' : 'Running Hidden Tests...'}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center text-slate-400 mt-8">
            <p className="text-sm font-medium">Run your code to see output here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((res, index) => (
              <div key={index} className="bg-card rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className={`px-4 py-3 border-b flex items-center justify-between ${
                  res.passed ? 'bg-emerald-50 border-emerald-100' : 
                  res.status.includes('Error') ? 'bg-red-50 border-red-100' : 'bg-rose-50 border-rose-100'
                }`}>
                  <div className="flex items-center gap-2">
                    {res.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : res.status.includes('Error') ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    )}
                    <span className={`font-bold ${
                      res.passed ? 'text-emerald-700' : 
                      res.status.includes('Error') ? 'text-red-700' : 'text-rose-700'
                    }`}>
                      Test Case {index + 1}: {res.status}
                    </span>
                  </div>
                  
                  {(res.time > 0 || res.memory > 0) && (
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {res.time} ms
                      </div>
                      <div className="flex items-center gap-1">
                        <Database className="w-3.5 h-3.5" />
                        {res.memory} KB
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-4">
                  {res.error && (
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase mb-1">Error Message</div>
                      <pre className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap border border-red-100">
                        {res.error}
                      </pre>
                    </div>
                  )}
                  
                  {res.output && (
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase mb-1">Standard Output</div>
                      <pre className="bg-slate-50 text-slate-700 p-3 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap border border-slate-200">
                        {res.output}
                      </pre>
                    </div>
                  )}

                  {!res.passed && !res.status.includes('Error') && res.expectedOutput && (
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase mb-1">Expected Output</div>
                      <pre className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap border border-emerald-100">
                        {res.expectedOutput}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
