import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Briefcase, Star, Clock, Activity, CheckCircle, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';

const steps = [
  { id: 1, title: 'Role', icon: Briefcase },
  { id: 2, title: 'Experience', icon: Star },
  { id: 3, title: 'Type', icon: Activity },
  { id: 4, title: 'Difficulty', icon: Activity },
  { id: 5, title: 'Duration', icon: Clock },
  { id: 6, title: 'Review', icon: CheckCircle }
];

const EXPERIENCES = ['Junior', 'Mid-Level', 'Senior', 'Lead'];
const INTERVIEW_TYPES = ['Behavioral', 'Technical', 'System Design'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DURATIONS = [15, 30, 45, 60];

export const InterviewWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: '',
    experienceLevel: '',
    interviewType: '',
    difficulty: '',
    duration: 30
  });

  useEffect(() => {
    // Check if user has a resume
    const checkResume = async () => {
      try {
        const res = await api.get('/resume');
        if (res.data.success && res.data.resume) {
          setHasResume(true);
        }
      } catch (e) {
        // No resume found (404) or other error
      }
    };
    checkResume();
  }, []);

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.role.trim().length > 0;
      case 2: return formData.experienceLevel !== '';
      case 3: return formData.interviewType !== '';
      case 4: return formData.difficulty !== '';
      case 5: return formData.duration > 0;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/interviews', formData);
      if (response.data.success) {
        toast.success('Interview session created!');
        navigate(`/interview/${response.data.sessionId}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">What role are you interviewing for?</h2>
            <p className="text-text-secondary">Be specific (e.g. Frontend Engineer, Product Manager)</p>
            <input 
              type="text" 
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g. Senior Full Stack Engineer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              autoFocus
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">What is your experience level?</h2>
            <div className="grid grid-cols-2 gap-4">
              {EXPERIENCES.map(exp => (
                <button
                  key={exp}
                  onClick={() => setFormData({ ...formData, experienceLevel: exp })}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    formData.experienceLevel === exp 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border hover:border-border text-text-secondary hover:text-primary"
                  )}
                >
                  <span className="font-semibold block">{exp}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">What type of interview?</h2>
            <div className="grid gap-4">
              {INTERVIEW_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, interviewType: type })}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    formData.interviewType === type 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border hover:border-border text-text-secondary hover:text-primary"
                  )}
                >
                  <span className="font-semibold block">{type}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Select difficulty</h2>
            <div className="grid gap-4">
              {DIFFICULTIES.map(diff => (
                <button
                  key={diff}
                  onClick={() => setFormData({ ...formData, difficulty: diff })}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between",
                    formData.difficulty === diff 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border hover:border-border text-text-secondary hover:text-primary"
                  )}
                >
                  <span className="font-semibold block">{diff}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">How long should the interview last?</h2>
            <div className="grid grid-cols-2 gap-4">
              {DURATIONS.map(dur => (
                <button
                  key={dur}
                  onClick={() => setFormData({ ...formData, duration: dur })}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-all",
                    formData.duration === dur 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border hover:border-border text-text-secondary hover:text-primary"
                  )}
                >
                  <span className="font-semibold block text-xl">{dur} min</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Review your Interview Setup</h2>
            <div className="bg-background rounded-2xl p-6 space-y-4 border border-border">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-text-secondary font-medium">Role</span>
                <span className="text-primary font-bold">{formData.role}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-text-secondary font-medium">Experience</span>
                <span className="text-primary font-bold">{formData.experienceLevel}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-text-secondary font-medium">Type</span>
                <span className="text-primary font-bold">{formData.interviewType}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-text-secondary font-medium">Difficulty</span>
                <span className="text-primary font-bold">{formData.difficulty}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-text-secondary font-medium">Duration</span>
                <span className="text-primary font-bold">{formData.duration} minutes</span>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-text-secondary font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Resume Attachment
                </span>
                {hasResume ? (
                  <span className="text-success font-bold flex items-center gap-1 bg-success/10 px-3 py-1 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" /> Detected & Attached
                  </span>
                ) : (
                  <span className="text-text-secondary text-sm">None uploaded</span>
                )}
              </div>
            </div>
            <p className="text-center text-sm text-text-secondary">
              Once you start, the AI will begin the interview based on these parameters.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Progress Indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-background rounded-full -z-10" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full -z-10 transition-all duration-500 ease-in-out" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((s) => {
            const isCompleted = s.id < currentStep;
            const isCurrent = s.id === currentStep;
            return (
              <div key={s.id} className="flex flex-col items-center gap-2 relative bg-background px-2">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                    isCompleted ? "bg-primary border-primary text-background" : 
                    isCurrent ? "bg-card border-primary text-primary shadow-[0_0_0_4px_rgba(15,23,42,0.1)]" : 
                    "bg-card border-border text-gray-400"
                  )}
                >
                  <s.icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-xs font-bold absolute -bottom-6 w-max transition-colors",
                  isCurrent || isCompleted ? "text-primary" : "text-gray-400"
                )}>{s.title}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border shadow-xl p-8 md:p-12 min-h-[400px] flex flex-col">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex justify-between items-center pt-6 border-t border-gray-100">
          <Button 
            variant="secondary" 
            onClick={handlePrev} 
            disabled={currentStep === 1 || isLoading}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          
          {currentStep < 6 ? (
            <Button 
              onClick={handleNext} 
              disabled={!isStepValid()}
              className="flex items-center gap-2 shadow-md"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="flex items-center gap-2 shadow-lg bg-accent hover:bg-accent/90"
            >
              {isLoading ? 'Preparing Session...' : 'Start Interview'} <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
