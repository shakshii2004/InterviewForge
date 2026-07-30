import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Code2, Layers, BookOpen, Settings2, Play, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

const STEPS = [
  { id: 'language', title: 'Language', icon: Code2, description: 'Select your programming language' },
  { id: 'difficulty', title: 'Difficulty', icon: Layers, description: 'Choose problem difficulty' },
  { id: 'topics', title: 'Topics', icon: BookOpen, description: 'Select algorithmic topics' },
  { id: 'config', title: 'Configuration', icon: Settings2, description: 'Set session parameters' },
  { id: 'review', title: 'Review', icon: CheckCircle2, description: 'Confirm and start' }
];

const LANGUAGES = [
  { id: 'JavaScript', label: 'JavaScript', icon: 'JS', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
  { id: 'Python', label: 'Python', icon: 'Py', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { id: 'Java', label: 'Java', icon: '☕', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
  { id: 'C++', label: 'C++', icon: 'C++', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' }
];

const DIFFICULTIES = [
  { id: 'Easy', label: 'Easy', description: 'Basic algorithms and data structures. Good for beginners.' },
  { id: 'Medium', label: 'Medium', description: 'Standard interview questions. Requires solid fundamentals.' },
  { id: 'Hard', label: 'Hard', description: 'Complex problems requiring optimization and advanced concepts.' }
];

const TOPICS = [
  'Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues', 'HashMaps', 
  'Trees', 'Binary Trees', 'BST', 'Graphs', 'Greedy', 'Dynamic Programming', 
  'Backtracking', 'Recursion', 'Binary Search', 'Sliding Window', 
  'Two Pointers', 'Heap', 'Trie', 'Bit Manipulation', 'Math'
];

export const CodingSetupWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [setupData, setSetupData] = useState({
    language: '',
    difficulty: '',
    topics: [] as string[],
    numberOfQuestions: 2,
    duration: 45
  });

  const canProceed = () => {
    switch(currentStep) {
      case 0: return !!setupData.language;
      case 1: return !!setupData.difficulty;
      case 2: return setupData.topics.length > 0;
      case 3: return true;
      default: return true;
    }
  };

  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/coding/session', setupData);
      navigate(`/coding/session/${data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create coding session');
      setLoading(false);
    }
  };

  const toggleTopic = (topic: string) => {
    setSetupData(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }));
  };

  return (
    <div className="max-w-5xl mx-auto min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 mb-2">Configure Coding Interview</h1>
        <p className="text-slate-500">Customize your coding environment to match your target interview.</p>
      </div>

      {/* Progress Tracker */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        />
        
        {STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm
                  ${isActive ? 'bg-primary text-white scale-110 shadow-primary/30' : 
                    isCompleted ? 'bg-primary/20 text-primary' : 
                    'bg-white border-2 border-slate-100 text-slate-400'}`}
              >
                <step.icon className="w-6 h-6" />
              </div>
              <div className="text-center hidden md:block">
                <p className={`text-sm font-bold ${isActive ? 'text-primary' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                  {step.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-800">Select Programming Language</h2>
                  <p className="text-slate-500">Choose the language you are most comfortable with.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => setSetupData(prev => ({ ...prev, language: lang.id }))}
                      className={`p-6 rounded-2xl border-2 text-left transition-all flex items-center gap-4
                        ${setupData.language === lang.id 
                          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                          : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold border ${lang.color}`}>
                        {lang.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{lang.label}</h3>
                        <p className="text-sm text-slate-500">Code in {lang.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-800">Select Difficulty</h2>
                  <p className="text-slate-500">Adjust the complexity of the algorithmic problems.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {DIFFICULTIES.map(diff => (
                    <button
                      key={diff.id}
                      onClick={() => setSetupData(prev => ({ ...prev, difficulty: diff.id }))}
                      className={`p-6 rounded-2xl border-2 text-left transition-all
                        ${setupData.difficulty === diff.id 
                          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                          : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{diff.label}</h3>
                      <p className="text-sm text-slate-500">{diff.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-800">Select Topics</h2>
                  <p className="text-slate-500">Choose one or more topics to focus on during this session.</p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
                  {TOPICS.map(topic => {
                    const isSelected = setupData.topics.includes(topic);
                    return (
                      <button
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        className={`px-4 py-2.5 rounded-xl border-2 font-medium transition-all
                          ${isSelected 
                            ? 'border-primary bg-primary text-white shadow-md shadow-primary/20' 
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                      >
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-800">Session Configuration</h2>
                  <p className="text-slate-500">Set the duration and number of questions.</p>
                </div>
                
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">Number of Questions</label>
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 5].map(num => (
                      <button
                        key={num}
                        onClick={() => setSetupData(prev => ({ ...prev, numberOfQuestions: num }))}
                        className={`py-4 rounded-xl border-2 font-bold transition-all text-center
                          ${setupData.numberOfQuestions === num 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">Duration (Minutes)</label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {[15, 30, 45, 60, 90].map(mins => (
                      <button
                        key={mins}
                        onClick={() => setSetupData(prev => ({ ...prev, duration: mins }))}
                        className={`py-4 rounded-xl border-2 font-bold transition-all text-center
                          ${setupData.duration === mins 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="max-w-2xl mx-auto text-center space-y-8">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-800">Ready to begin!</h2>
                <p className="text-slate-500">Review your interview configuration below.</p>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <span className="text-slate-500">Language</span>
                    <span className="font-bold text-slate-800">{setupData.language}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <span className="text-slate-500">Difficulty</span>
                    <span className="font-bold text-slate-800">{setupData.difficulty}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <span className="text-slate-500">Questions</span>
                    <span className="font-bold text-slate-800">{setupData.numberOfQuestions}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-bold text-slate-800">{setupData.duration} minutes</span>
                  </div>
                  <div className="flex justify-between items-start pt-2">
                    <span className="text-slate-500 mt-1">Topics</span>
                    <div className="flex flex-wrap gap-2 justify-end pl-4">
                      {setupData.topics.map(t => (
                        <span key={t} className="px-2 py-1 bg-white text-slate-600 rounded-md text-xs font-semibold border border-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {error && <p className="text-red-500 font-medium">{error}</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={() => currentStep > 0 ? setCurrentStep(s => s - 1) : navigate('/dashboard/coding')}
          disabled={loading}
          className="px-6 py-3 rounded-xl font-bold text-slate-500 flex items-center gap-2 hover:bg-white hover:shadow-sm border-2 border-transparent hover:border-slate-100 transition-all disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </button>

        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={() => setCurrentStep(s => s + 1)}
            disabled={!canProceed()}
            className="px-8 py-3 rounded-xl font-bold bg-primary text-white flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={loading}
            className="px-8 py-3 rounded-xl font-bold bg-emerald-500 text-white flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? 'Preparing...' : 'Start Coding Interview'}
            <Play className="w-5 h-5 fill-current" />
          </button>
        )}
      </div>
    </div>
  );
};
