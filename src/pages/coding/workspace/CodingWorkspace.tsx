import { useState, useEffect, useRef } from 'react';
import { ResizableLayout } from './ResizableLayout';
import { SessionHeader } from './SessionHeader';
import { ProblemPanel } from './ProblemPanel';
import { EditorPanel, STARTER_CODE } from './EditorPanel';
import { ConsolePanel } from './ConsolePanel';
import { api } from '../../../lib/api';

interface CodingWorkspaceProps {
  initialSession: any;
}

export const CodingWorkspace = ({ initialSession }: CodingWorkspaceProps) => {
  const session = initialSession;
  const [language, setLanguage] = useState(initialSession.language || 'JavaScript');
  
  const defaultQuestionId = session.questions?.[0]?._id || session.currentQuestion?._id || session.currentQuestion;
  const [activeQuestionId, setActiveQuestionId] = useState<string>(defaultQuestionId);
  const activeQuestion = (session.questions || []).find((q: any) => q._id === activeQuestionId) || session.currentQuestion;
  
  const getStarterCode = (lang: string, q?: any) => {
    const targetQ = q || activeQuestion;
    if (targetQ && targetQ.starterCode && targetQ.starterCode[lang]) {
      return targetQ.starterCode[lang];
    }
    return STARTER_CODE[lang] || '';
  };

  // Initialize code to DB code if exists, otherwise starter code
  const [code, setCode] = useState(() => {
    if (session.codes && session.codes[activeQuestionId]) {
      return session.codes[activeQuestionId];
    }
    if (initialSession.code && initialSession.code.trim() !== '') {
      return initialSession.code;
    }
    return getStarterCode(initialSession.language || 'JavaScript', activeQuestion);
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    initialSession.lastSavedAt ? new Date(initialSession.lastSavedAt) : null
  );

  // Auto-save ref
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync state with DB
  const saveSession = async (currentCode: string, currentLang: string, questionId: string) => {
    setIsSaving(true);
    try {
      await api.patch(`/coding/session/${session._id}`, {
        code: currentCode,
        language: currentLang,
        codes: {
          [questionId]: currentCode
        }
      });
      setLastSavedAt(new Date());
    } catch (error) {
      console.error('Failed to auto-save session:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced auto-save on code change
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      saveSession(code, language, activeQuestionId);
    }, 10000); // Save every 10 seconds of idle typing

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [code, language]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSaving && lastSavedAt) {
        // We're reasonably saved, don't show warning
        return;
      }
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSaving, lastSavedAt]);

  const handleQuestionChange = async (newQuestionId: string) => {
    if (newQuestionId === activeQuestionId) return;
    
    // Save current code immediately before switching
    await saveSession(code, language, activeQuestionId);
    
    setActiveQuestionId(newQuestionId);
    
    // Load new code
    if (session.codes && session.codes[newQuestionId]) {
      setCode(session.codes[newQuestionId]);
    } else {
      const newQuestion = (session.questions || []).find((q: any) => q._id === newQuestionId);
      setCode(getStarterCode(language, newQuestion) || STARTER_CODE[language] || '');
    }
  };

  const handleLanguageChange = async (newLang: string) => {
    if (newLang === language) return;
    
    if (window.confirm(`Are you sure you want to switch to ${newLang}? This will overwrite your current code with the ${newLang} starter template.`)) {
      setLanguage(newLang);
      const newCode = getStarterCode(newLang);
      setCode(newCode);
      
      // Immediate save
      await saveSession(newCode, newLang, activeQuestionId);
    }
  };

  const handleResetCode = () => {
    if (window.confirm('Reset code to starter template? Your current code will be lost.')) {
      setCode(getStarterCode(language));
    }
  };

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Fetch submissions on load
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data } = await api.get(`/coding/submissions/${session._id}`);
        setSubmissions(data);
      } catch (err) {
        console.error('Failed to fetch submissions', err);
      }
    };
    fetchSubmissions();
  }, [session._id]);

  const handleRun = async () => {
    setIsRunning(true);
    setResults([]);
    try {
      // Ensure we have the question ID (for now hardcode to the seeded dummy question if not present)
      const questionId = activeQuestionId || 'dummy_question_id';
      
      const { data } = await api.post('/coding/run', {
        code,
        language,
        questionId
      });
      setResults(data.results);
    } catch (error: any) {
      console.error('Run error:', error);
      alert('Error running code: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setResults([]);
    try {
      const questionId = activeQuestionId || 'dummy_question_id';
      
      const { data } = await api.post('/coding/submit', {
        code,
        language,
        questionId,
        sessionId: session._id
      });
      setResults(data.results);
      
      // Update submissions list
      const subsRes = await api.get(`/coding/submissions/${session._id}`);
      setSubmissions(subsRes.data);

      if (data.submission.status === 'Accepted') {
        alert('Success! All hidden test cases passed.');
      } else {
        alert(`Submission failed: ${data.submission.status}`);
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      alert('Error submitting code: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-100 overflow-hidden font-sans">
      <SessionHeader 
        session={session}
        activeQuestionId={activeQuestionId}
        onQuestionChange={handleQuestionChange}
        language={language}
        onLanguageChange={handleLanguageChange}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
        onRun={handleRun}
        onSubmit={handleSubmit}
        isRunning={isRunning}
        isSubmitting={isSubmitting}
      />
      
      <div className="flex-1 overflow-hidden">
        <ResizableLayout 
          leftPanel={<ProblemPanel question={activeQuestion} submissions={submissions.filter(s => s.questionId === activeQuestionId || !s.questionId)} />}
          topRightPanel={
            <EditorPanel 
              language={language}
              code={code}
              onChange={(val) => setCode(val || '')}
              onReset={handleResetCode}
            />
          }
          bottomRightPanel={
            <ConsolePanel 
              results={results}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
            />
          }
        />
      </div>
    </div>
  );
};
