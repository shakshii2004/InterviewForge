import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp, Star, Trophy, ArrowRight, Activity, Download, CheckCircle, AlertTriangle, BookOpen, Clock, Zap } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

interface EvaluationData {
  _id: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  confidenceScore: number;
  projectScore: number;
  timeManagementScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendedTopics: string[];
  questionFeedback: Array<{
    questionId: string;
    score: number;
    strengths: string[];
    missingPoints: string[];
    feedback: string;
  }>;
}

interface FullSessionData {
  session: any;
  questions: any[];
  answers: any[];
}

export function Evaluation() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [evalData, setEvalData] = useState<EvaluationData | null>(null);
  const [sessionData, setSessionData] = useState<FullSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndGenerate = async () => {
      try {
        const sessionRes = await api.get(`/interviews/${sessionId}`);
        if (!sessionRes.data.success) throw new Error('Failed to fetch session');
        setSessionData({
          session: sessionRes.data.session,
          questions: sessionRes.data.questions,
          answers: sessionRes.data.answers
        });

        // Then trigger/fetch evaluation
        const evalRes = await api.post(`/evaluation/${sessionId}/generate`);
        if (evalRes.data.success) {
          setEvalData(evalRes.data.data);
        } else {
          throw new Error('Failed to generate evaluation');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Error generating evaluation');
      } finally {
        setLoading(false);
      }
    };
    fetchAndGenerate();
  }, [sessionId]);

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    toast.loading('Generating PDF...', { id: 'pdf' });
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#020617' // slate-950
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Interview_Evaluation_${sessionData?.session.role || 'Report'}.pdf`);
      toast.success('PDF Downloaded!', { id: 'pdf' });
    } catch (error) {
      toast.error('Failed to generate PDF', { id: 'pdf' });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="text-indigo-500 mb-6">
          <Brain size={64} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
          className="text-2xl font-bold text-white mb-2 text-center"
        >
          AI is analyzing your interview...
        </motion.h2>
        <p className="text-slate-400 text-center max-w-md">
          We are evaluating your answers, analyzing your communication, and generating a detailed feedback report. This usually takes about 15 seconds.
        </p>
      </div>
    );
  }

  if (!evalData || !sessionData) return <div className="text-white p-8">Evaluation not found.</div>;

  const { session, questions, answers } = sessionData;

  const radarData = [
    { subject: 'Technical', A: evalData.technicalScore, fullMark: 100 },
    { subject: 'Communication', A: evalData.communicationScore, fullMark: 100 },
    { subject: 'Problem Solving', A: evalData.problemSolvingScore, fullMark: 100 },
    { subject: 'Confidence', A: evalData.confidenceScore, fullMark: 100 },
    { subject: 'Time Mgmt', A: evalData.timeManagementScore, fullMark: 100 },
    { subject: 'Project Exp', A: evalData.projectScore, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-8" ref={reportRef}>
        
        {/* Header & Overall Score */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Interview Evaluation</h1>
            <p className="text-slate-400 text-lg mt-2">
              Role: <span className="text-indigo-400 font-medium">{session.role}</span> &bull; {session.experienceLevel} &bull; {session.interviewType}
            </p>
          </div>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl font-medium transition-all"
          >
            <Download className="w-5 h-5" /> {downloading ? 'Exporting...' : 'Download PDF'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Overall Score & Radar */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <h2 className="text-slate-400 font-medium mb-6 uppercase tracking-wider text-sm z-10">Overall Performance</h2>
              
              <div className="relative z-10 w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" className="stroke-slate-800" strokeWidth="12" fill="none" />
                  <motion.circle 
                    cx="96" cy="96" r="88" 
                    className="stroke-indigo-500"
                    strokeWidth="12" fill="none" strokeLinecap="round"
                    initial={{ strokeDasharray: "553", strokeDashoffset: "553" }}
                    animate={{ strokeDashoffset: 553 - (553 * evalData.overallScore) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-white">{evalData.overallScore}</span>
                  <span className="text-sm text-slate-400 mt-1">out of 100</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6"
            >
              <h3 className="text-slate-300 font-semibold mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-400"/> Skill Breakdown</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Summary, Strengths, Improvements */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-8"
            >
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Brain className="text-indigo-400" /> Executive Summary
              </h3>
              <p className="text-slate-300 leading-relaxed text-lg">{evalData.summary}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-6">
                <h4 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> Key Strengths</h4>
                <ul className="space-y-3">
                  {evalData.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-amber-950/20 border border-amber-500/20 rounded-3xl p-6">
                <h4 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Areas to Improve</h4>
                <ul className="space-y-3">
                  {evalData.improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-900 border border-white/10 rounded-3xl p-8">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-400"/> Recommended Topics to Review</h4>
                <div className="flex flex-wrap gap-3">
                  {evalData.recommendedTopics.map((t, i) => (
                    <span key={i} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-indigo-300 font-medium">{t}</span>
                  ))}
                </div>
            </motion.div>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="pt-8 space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6">Detailed Question Analysis</h2>
          {questions.map((q, index) => {
            const ans = answers.find(a => a.questionId === q._id);
            const qFeedback = evalData.questionFeedback.find(qf => qf.questionId === q._id);
            const isExpanded = expandedId === q._id;
            
            return (
              <motion.div 
                key={q._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden"
              >
                <button onClick={() => setExpandedId(isExpanded ? null : q._id)} className="w-full p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 pr-4">
                    <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase mb-2 block">Question {index + 1} &bull; {q.category}</span>
                    <h3 className="text-lg text-white font-medium leading-relaxed">{q.question}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    {qFeedback && (
                      <span className={`px-4 py-1.5 rounded-full border text-sm font-bold ${qFeedback.score >= 8 ? 'text-green-400 bg-green-400/10 border-green-400/20' : qFeedback.score >= 6 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
                        {qFeedback.score}/10
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5">
                      <div className="p-6 space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2"><Clock className="w-4 h-4"/> Your Answer ({ans?.responseTime || 0}s)</h4>
                          <div className="bg-slate-950 p-5 rounded-xl border border-white/5 text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {ans?.answer || 'No answer provided.'}
                          </div>
                        </div>
                        
                        {qFeedback && (
                          <div>
                            <h4 className="text-sm font-medium text-indigo-400 mb-3 uppercase tracking-wider flex items-center gap-2"><Zap className="w-4 h-4" /> AI Feedback</h4>
                            <div className="bg-indigo-500/10 p-5 rounded-xl border border-indigo-500/20 text-indigo-100/90 leading-relaxed">
                              {qFeedback.feedback}
                            </div>
                          </div>
                        )}

                        {qFeedback && (qFeedback.strengths.length > 0 || qFeedback.missingPoints.length > 0) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {qFeedback.strengths.length > 0 && (
                              <div className="bg-emerald-950/10 p-4 rounded-xl border border-emerald-500/10">
                                <h5 className="text-emerald-400 text-sm font-semibold mb-2">What you did well:</h5>
                                <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                                  {qFeedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                              </div>
                            )}
                            {qFeedback.missingPoints.length > 0 && (
                              <div className="bg-amber-950/10 p-4 rounded-xl border border-amber-500/10">
                                <h5 className="text-amber-400 text-sm font-semibold mb-2">What was missing:</h5>
                                <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                                  {qFeedback.missingPoints.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center pt-8 pb-12">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-medium transition-all">
            Return to Dashboard <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
