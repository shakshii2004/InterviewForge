import { Tag, Lightbulb, AlertCircle, Sparkles, BrainCircuit, Activity, ChevronRight, Lock } from 'lucide-react';
import { useState } from 'react';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';

export const ProblemPanel = ({ question, submissions = [] }: { question?: any, submissions?: any[] }) => {
  const [activeTab, setActiveTab] = useState<'description' | 'solutions' | 'submissions'>('description');
  const [showHint, setShowHint] = useState<number | null>(null);

  if (!question) {
    return (
      <div className="h-full flex flex-col bg-card items-center justify-center text-slate-500">
        <Activity className="w-8 h-8 mb-2 opacity-20 animate-pulse" />
        <p>Loading question...</p>
      </div>
    );
  }

  const sanitizedDescription = DOMPurify.sanitize(question.description);

  return (
    <div className="h-full flex flex-col bg-card overflow-hidden">
      {/* Tabs */}
      <div className="h-10 border-b border-slate-200 flex items-center px-2 bg-slate-50">
        <button 
          onClick={() => setActiveTab('description')}
          className={`px-4 py-1.5 text-sm font-bold transition-colors ${activeTab === 'description' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Description
        </button>
        <button 
          onClick={() => setActiveTab('solutions')}
          className={`px-4 py-1.5 text-sm font-bold transition-colors flex items-center gap-1.5 ${activeTab === 'solutions' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Editorial
        </button>
        <button 
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-1.5 text-sm font-bold transition-colors ${activeTab === 'submissions' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Submissions
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {activeTab === 'description' && (
          <div className="pb-10">
            <h1 className="text-2xl font-black text-slate-800 mb-4">{question.title}</h1>
        
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                question.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-600' :
                question.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-600' :
                'bg-red-500/10 text-red-600'
              }`}>
                {question.difficulty}
              </span>
              {question.topics?.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Tag className="w-3.5 h-3.5" /> {question.topics.slice(0, 3).join(', ')}
                </div>
              )}
            </div>

            <div 
              className="prose prose-slate max-w-none text-slate-700 space-y-4"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />

            {/* Custom Examples parsed from API */}
            {question.examples && question.examples.length > 0 && (
              <div className="mt-8 space-y-6">
                {question.examples.map((ex: any, i: number) => (
                  <div key={i}>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Example {i + 1}:</h3>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 font-mono text-sm space-y-1">
                      <div><span className="font-bold text-slate-800">Input:</span> {ex.input}</div>
                      <div><span className="font-bold text-slate-800">Output:</span> {ex.output}</div>
                      {ex.explanation && (
                        <div className="text-slate-600 whitespace-pre-wrap"><span className="font-bold text-slate-800">Explanation:</span> {ex.explanation}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {question.constraints && question.constraints.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-400" /> Constraints:
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                  {question.constraints.map((c: string, i: number) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(c) }} />
                  ))}
                </ul>
              </div>
            )}
            
            {/* Hints */}
            {question.hints && question.hints.length > 0 && (
              <div className="mt-8 space-y-2">
                {question.hints.map((hint: string, i: number) => (
                  <div key={i} className="border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                    <button 
                      onClick={() => setShowHint(showHint === i ? null : i)}
                      className="w-full flex items-center gap-2 p-3 font-semibold text-slate-700 hover:bg-slate-100 transition-colors text-left"
                    >
                      <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0" /> 
                      <span className="flex-1">Hint {i + 1}</span>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showHint === i ? 'rotate-90' : ''}`} />
                    </button>
                    {showHint === i && (
                      <div 
                        className="p-4 pt-0 text-sm text-slate-600 border-t border-slate-200 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(hint) }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'solutions' && (
           question.aiEditorial ? (
            <div className="space-y-8 pb-10">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <BrainCircuit className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-xl font-bold text-slate-800">AI Generated Editorial</h2>
                </div>
                <p className="text-sm text-slate-600">This optimal approach and analysis was generated by Google Gemini to help you understand the core concepts.</p>
              </div>

              {question.aiEditorial.approach && (
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Optimal Approach</h3>
                  <div className="prose prose-slate max-w-none text-slate-600">
                    <ReactMarkdown>{question.aiEditorial.approach}</ReactMarkdown>
                  </div>
                </div>
              )}

              {question.aiEditorial.optimal && (
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Implementation</h3>
                  <div className="prose prose-slate max-w-none prose-pre:bg-slate-900 prose-pre:text-slate-50">
                    <ReactMarkdown>{question.aiEditorial.optimal}</ReactMarkdown>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.timeComplexity && (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Time Complexity</h4>
                    <p className="font-mono text-slate-800 font-bold">{question.timeComplexity}</p>
                  </div>
                )}
                {question.spaceComplexity && (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Space Complexity</h4>
                    <p className="font-mono text-slate-800 font-bold">{question.spaceComplexity}</p>
                  </div>
                )}
              </div>

              {question.aiEditorial.bruteForce && (
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Brute Force Approach</h3>
                  <div className="prose prose-slate max-w-none text-slate-600 bg-orange-50/50 p-4 rounded-lg border border-orange-100">
                    <ReactMarkdown>{question.aiEditorial.bruteForce}</ReactMarkdown>
                  </div>
                </div>
              )}

              {question.aiEditorial.interviewTips && (
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">Interview Tips</h3>
                  <div className="prose prose-slate max-w-none text-slate-600 bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                    <ReactMarkdown>{question.aiEditorial.interviewTips}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
           ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4 text-slate-500">
              <Lock className="w-12 h-12 text-slate-300" />
              <h2 className="text-xl font-bold text-slate-700">Editorial Locked or Generating</h2>
              <p className="max-w-xs">
                The AI is currently analyzing this problem or it hasn't been generated yet. Please check back later.
              </p>
            </div>
           )
        )}

        {activeTab === 'submissions' && (
          <div className="flex flex-col space-y-4 pb-10">
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4 text-slate-500">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-700">No Submissions Yet</h2>
                <p className="max-w-xs">
                  Your submission history for this problem will appear here once you submit your code.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub, i) => (
                  <div key={sub._id || i} className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-bold ${sub.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}`}>
                        {sub.status}
                      </span>
                      <span className="text-sm font-medium text-slate-500">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm font-medium text-slate-600 mb-3">
                      <span>Language: {sub.language}</span>
                    </div>
                    <a 
                      href={`/dashboard/coding/review/${sub._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-background bg-primary hover:bg-primary/90 rounded-md transition-colors"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      View AI Review
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
