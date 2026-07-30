import { Tag, Lightbulb, AlertCircle, Lock } from 'lucide-react';
import { useState } from 'react';

export const ProblemPanel = ({ submissions = [] }: { submissions?: any[] }) => {
  const [activeTab, setActiveTab] = useState<'description' | 'solutions' | 'submissions'>('description');

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
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
          className={`px-4 py-1.5 text-sm font-bold transition-colors ${activeTab === 'solutions' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Solutions
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
          <>
            <h1 className="text-2xl font-black text-slate-800 mb-4">1. Two Sum</h1>
        
        <div className="flex items-center gap-3 mb-6">
          <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-green-500/10 text-green-600">
            Easy
          </span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Tag className="w-3.5 h-3.5" /> Arrays, Hash Table
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-slate-700 space-y-4">
          <p>
            Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
          </p>
          <p>
            You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.
          </p>
          <p>
            You can return the answer in any order.
          </p>

          <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Example 1:</h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 font-mono text-sm">
              <span className="font-bold text-slate-800">Input:</span> nums = [2,7,11,15], target = 9<br/>
              <span className="font-bold text-slate-800">Output:</span> [0,1]<br/>
              <span className="font-bold text-slate-800">Explanation:</span> Because nums[0] + nums[1] == 9, we return [0, 1].
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Example 2:</h3>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 font-mono text-sm">
              <span className="font-bold text-slate-800">Input:</span> nums = [3,2,4], target = 6<br/>
              <span className="font-bold text-slate-800">Output:</span> [1,2]
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400" /> Constraints:
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
              <li><code>2 {'<='} nums.length {'<='} 10<sup>4</sup></code></li>
              <li><code>-10<sup>9</sup> {'<='} nums[i] {'<='} 10<sup>9</sup></code></li>
              <li><code>-10<sup>9</sup> {'<='} target {'<='} 10<sup>9</sup></code></li>
              <li><strong>Only one valid answer exists.</strong></li>
            </ul>
          </div>
          
          <div className="mt-8">
             <details className="group border border-slate-200 rounded-lg bg-slate-50">
               <summary className="flex items-center gap-2 p-3 font-semibold text-slate-700 cursor-pointer list-none">
                 <Lightbulb className="w-4 h-4 text-yellow-500" /> Hint 1
               </summary>
               <div className="p-4 pt-0 text-sm text-slate-600 border-t border-slate-200">
                 A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it's best to try out brute force solutions for just for completeness. It is from these brute force solutions that you can come up with optimizations.
               </div>
             </details>
          </div>
        </div>
          </>
        )}

        {activeTab === 'solutions' && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4 text-slate-500">
            <Lock className="w-12 h-12 text-slate-300" />
            <h2 className="text-xl font-bold text-slate-700">Solutions Locked</h2>
            <p className="max-w-xs">
              Official solutions and AI explanations are locked during the interview to ensure fair evaluation. They will be available in your post-interview report.
            </p>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="flex flex-col space-y-4">
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
                      href={`/coding/review/${sub._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
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
