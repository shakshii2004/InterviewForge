import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, BrainCircuit, ChevronRight, Activity, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

interface Question {
  _id: string;
  order: number;
  question: string;
  category: string;
  difficulty: string;
}

interface Answer {
  _id: string;
  questionId: string;
  answer: string;
}

interface SessionData {
  _id: string;
  status: string;
  duration: number;
  role: string;
  difficulty: string;
  interviewType: string;
  totalQuestions: number;
  currentQuestionIndex: number;
  startedAt?: string;
}

export const InterviewSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState<SessionData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);
  const [answerText, setAnswerText] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  const saveTimeoutRef = useRef<any>(null);

  // Fetch Session Data
  const loadSession = async () => {
    try {
      const res = await api.get(`/interviews/${sessionId}`);
      const { session, questions, answers } = res.data;
      
      setSession(session);
      
      if (session.status === 'completed') {
        navigate(`/evaluation/${session._id}`);
        return;
      }

      if (session.status === 'pending') {
        startInterview();
      } else {
        // Find current question based on session index
        const currentQ = questions.find((q: any) => q.order === session.currentQuestionIndex);
        if (currentQ) {
          setCurrentQuestion(currentQ);
          const currentA = answers.find((a: any) => a.questionId === currentQ._id);
          if (currentA) {
            setCurrentAnswer(currentA);
            setAnswerText(currentA.answer || '');
          }
        }
        
        // Calculate remaining time
        if (session.startedAt) {
          const elapsedSecs = Math.floor((new Date().getTime() - new Date(session.startedAt).getTime()) / 1000);
          const totalSecs = session.duration * 60;
          setTimeLeft(Math.max(0, totalSecs - elapsedSecs));
        }
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('Failed to load interview session');
      navigate('/dashboard/interviews');
    }
  };

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0 && session?.status === 'in-progress') {
      const timerId = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerId);
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [timeLeft, session?.status]);

  const startInterview = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post(`/interviews/${sessionId}/start`);
      if (res.data.success && res.data.data) {
        // Reload session to get new question
        await loadSession();
      }
    } catch (error) {
      toast.error('Failed to generate interview questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAnswer = async (text: string, isFinal = false) => {
    if (!currentAnswer) return;
    setSaveStatus('saving');
    try {
      await api.post(`/interviews/${sessionId}/answer`, {
        answerId: currentAnswer._id,
        answer: text,
        isFinal
      });
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('error');
    }
  };

  // Debounced auto-save
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setAnswerText(val);
    setSaveStatus('saving');
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveAnswer(val, false);
    }, 1000);
  };

  const handleNext = async () => {
    setIsGenerating(true);
    // Force final save before next
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    await saveAnswer(answerText, true);

    try {
      const res = await api.post(`/interviews/${sessionId}/next`);
      if (res.data.success) {
        if (!res.data.data) {
          // Interview completed natively
          navigate(`/evaluation/${sessionId}`);
        } else {
          setAnswerText('');
          await loadSession();
        }
      }
    } catch (error) {
      toast.error('Failed to load next question');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    await saveAnswer(answerText, true);

    try {
      await api.post(`/interviews/${sessionId}/finish`);
      navigate(`/evaluation/${sessionId}`);
    } catch (error) {
      toast.error('Failed to finish interview');
    } finally {
      setIsFinishing(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
        {/* Background Ornaments */}
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-accent/20 blur-[100px] rounded-full" />
        
        <div className="relative z-10 flex flex-col items-center">
          <BrainCircuit className="w-16 h-16 text-primary animate-pulse mb-6" />
          <h1 className="text-3xl font-bold text-primary mb-2">
            {isGenerating ? 'AI is analyzing your response...' : 'Loading Session...'}
          </h1>
          <p className="text-text-secondary mb-8 max-w-md">
            {isGenerating ? 'Generating contextual follow-up questions tailored to your experience.' : 'Setting up your interview room.'}
          </p>
          <div className="w-64 h-2 bg-background rounded-full overflow-hidden">
            <div className="h-full bg-primary w-1/2 rounded-full animate-[progress_1s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  if (!session || !currentQuestion) return <div>Error loading session</div>;

  const isLastQuestion = session.currentQuestionIndex >= session.totalQuestions;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 bg-card/50 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-primary" />
          <span className="font-bold text-primary">InterviewForge</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-48 h-2 bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(session.currentQuestionIndex / session.totalQuestions) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-text-secondary">
              Q{session.currentQuestionIndex} / {session.totalQuestions}
            </span>
          </div>
          
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-medium",
            timeLeft < 300 ? "bg-error/10 border-error/20 text-error" : "bg-primary/5 border-primary/10 text-primary"
          )}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Context */}
        <aside className="w-72 bg-card/30 border-r border-border p-6 hidden lg:flex flex-col gap-6">
          <div>
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Interview Context</h3>
            <div className="space-y-4">
              <div className="bg-card p-3 rounded-xl border border-border">
                <span className="text-xs text-text-secondary block mb-1">Target Role</span>
                <span className="font-bold text-primary">{session.role}</span>
              </div>
              <div className="bg-card p-3 rounded-xl border border-border">
                <span className="text-xs text-text-secondary block mb-1">Interview Type</span>
                <span className="font-bold text-primary">{session.interviewType}</span>
              </div>
              <div className="bg-card p-3 rounded-xl border border-border flex justify-between items-center">
                <span className="text-xs text-text-secondary">Difficulty</span>
                <span className={cn(
                  "text-xs font-bold px-2 py-1 rounded-md",
                  session.difficulty === 'Easy' ? "bg-success/10 text-success" :
                  session.difficulty === 'Medium' ? "bg-yellow-100 text-yellow-700" :
                  "bg-error/10 text-error"
                )}>{session.difficulty}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-auto">
            <Button className="w-full text-error border-error/20 hover:bg-error/5 hover:border-error/30" onClick={handleFinish}>
              End Early
            </Button>
          </div>
        </aside>

        {/* Main Interview Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Question Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card rounded-3xl p-8 border border-border shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-1 rounded-md">
                    {currentQuestion.category}
                  </span>
                  {currentQuestion.difficulty === 'Hard' && (
                    <span className="text-xs font-bold uppercase tracking-wider text-error bg-error/10 px-2 py-1 rounded-md">
                      Follow-up
                    </span>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-primary leading-tight">
                  {currentQuestion.question}
                </h2>
              </motion.div>
            </AnimatePresence>

            {/* Answer Area */}
            <div className="bg-card rounded-3xl border border-border shadow-sm flex flex-col focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <div className="p-4 border-b border-border flex justify-between items-center bg-background/50 rounded-t-3xl">
                <span className="text-sm font-medium text-text-secondary flex items-center gap-2">
                  Your Answer
                  {saveStatus === 'saving' && <Loader2 className="w-3 h-3 animate-spin text-text-secondary" />}
                  {saveStatus === 'saved' && <CheckCircle className="w-3 h-3 text-success" />}
                </span>
                <span className="text-xs text-text-secondary">
                  {answerText.length} chars
                </span>
              </div>
              <textarea
                className="w-full h-64 p-6 bg-transparent resize-none focus:outline-none text-primary leading-relaxed"
                placeholder="Type your response here... (auto-saves as you type)"
                value={answerText}
                onChange={handleAnswerChange}
                autoFocus
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-end pt-4">
              {isLastQuestion ? (
                <Button onClick={handleFinish} disabled={isFinishing} className="shadow-lg bg-accent hover:bg-accent/90">
                  {isFinishing ? 'Finishing...' : 'Submit & Finish'} <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={answerText.trim().length === 0} className="shadow-md">
                  Submit Answer <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
