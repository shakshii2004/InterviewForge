import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Target, Mic, MessageSquare, Clock, Zap, BookOpen, ChevronRight, Download, Video, Play, Trash } from 'lucide-react';
import { api } from '../../../lib/api';
import toast from 'react-hot-toast';

export const LiveReport = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const recordingUrl = location.state?.recordingUrl;
  
  const [evaluation, setEvaluation] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fallbackGenerated, setFallbackGenerated] = useState(false);
  const [isRecordingVisible, setIsRecordingVisible] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const [evalRes, sessionRes] = await Promise.all([
          api.get(`/evaluation/${sessionId}`).catch(() => ({ data: null })), // The evaluation might not be ready instantly
          api.get(`/interviews/live/${sessionId}`)
        ]);
        
        setEvaluation(evalRes.data?.data || evalRes.data);
        setSession(sessionRes.data?.data || sessionRes.data);
      } catch (error) {
        toast.error('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
    
    // Polling if evaluation isn't ready
    let attempts = 0;
    const interval = setInterval(async () => {
      if (!evaluation && !fallbackGenerated) {
        attempts++;
        try {
          const evalRes = await api.get(`/evaluation/${sessionId}`);
          if (evalRes.data?.data) {
            setEvaluation(evalRes.data.data);
            clearInterval(interval);
            return;
          }
        } catch(e) {}
        
        // Timeout after 20 seconds, generate fallback
        if (attempts > 4) {
          clearInterval(interval);
          generateFallbackEvaluation();
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionId, evaluation, fallbackGenerated]);

  const generateFallbackEvaluation = () => {
    // Generate fallback scores if AI evaluation fails
    const wpm = session?.speechMetrics?.wordsPerMinute || 0;
    const isWpmGood = wpm >= 110 && wpm <= 160;
    const questionsAnswered = session?.transcript?.filter((t:any) => t.speaker === 'User').length || 0;
    
    // Very simple heuristics
    const commScore = isWpmGood ? 85 : 70;
    const techScore = questionsAnswered > 0 ? 80 : 50;
    const confScore = (session?.speechMetrics?.fillerWords || 0) < 5 ? 90 : 75;
    
    const overall = Math.round((commScore + techScore + confScore) / 3);

    setEvaluation({
      overallScore: overall,
      communicationScore: commScore,
      technicalScore: techScore,
      confidenceScore: confScore,
      summary: "We were unable to generate a detailed AI evaluation at this time. The scores above are estimated based on your speech analytics, response completeness, and speaking time.",
      strengths: ["Completed the interview", "Provided verbal responses"],
      improvements: ["Try answering more questions", "Ensure a stable connection for full AI analysis"],
      nextPracticePlan: {
        topicsToRevise: ["General Technical Concepts"],
        interviewTips: ["Maintain a steady speaking pace", "Elaborate more on your answers"],
        suggestedPractice: ["Mock Interviews", "Core Fundamentals"]
      },
      questionFeedback: []
    });
    setFallbackGenerated(true);
    toast.error("AI Evaluation failed. Using estimated scores.");
  };

  const downloadTranscript = () => {
    if (!session?.transcript) return;
    
    let textContent = `Interview Transcript - ${session.role}\n`;
    textContent += `Date: ${new Date(session.createdAt || Date.now()).toLocaleDateString()}\n\n`;
    
    session.transcript.forEach((item: any) => {
      const speaker = item.speaker === 'AI' ? 'Interviewer' : 'You';
      const time = new Date(item.timestamp || Date.now()).toLocaleTimeString();
      textContent += `[${time}] ${speaker}:\n${item.text}\n\n`;
    });
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transcript_${session.role.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-white">Loading Premium Report...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            Interview Performance Report
          </h1>
          <p className="text-gray-400">
            {session?.role} • {session?.interviewType} • {session?.difficulty} • {session?.communicationMode} Mode
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={downloadTranscript} 
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Transcript (.txt)
          </button>
          <button 
            onClick={() => window.print()} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {!evaluation ? (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">AI is analyzing your interview</h2>
          <p className="text-gray-400 max-w-md">
            Our Senior AI Engineer is currently processing your voice transcript, calculating speech metrics, and generating personalized feedback. This usually takes 30-60 seconds.
          </p>
        </div>
      ) : (
        <>
          {/* Top Score Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-xl flex flex-col items-center justify-center text-center">
              <Award className="w-8 h-8 text-yellow-400 mb-2" />
              <p className="text-sm text-gray-400 font-medium">Overall Score</p>
              <p className="text-3xl font-bold">{evaluation.overallScore || 0}/100</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-xl flex flex-col items-center justify-center text-center">
              <MessageSquare className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-sm text-gray-400 font-medium">Communication</p>
              <p className="text-3xl font-bold">{evaluation.communicationScore || 0}/100</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-xl flex flex-col items-center justify-center text-center">
              <Zap className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-sm text-gray-400 font-medium">Technical</p>
              <p className="text-3xl font-bold">{evaluation.technicalScore || 0}/100</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gray-800/50 border border-gray-700/50 p-6 rounded-xl flex flex-col items-center justify-center text-center">
              <Target className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-sm text-gray-400 font-medium">Confidence</p>
              <p className="text-3xl font-bold">{evaluation.confidenceScore || 0}/100</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Summary & Speech Metrics */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Executive Summary</h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  {evaluation.summary}
                </p>
              </div>

              {session?.communicationMode !== 'Text' && session?.speechMetrics && (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-blue-400" />
                    Speech Analytics
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Words Per Minute</span>
                        <span className="font-semibold">{session.speechMetrics.wordsPerMinute} WPM</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((session.speechMetrics.wordsPerMinute / 200) * 100, 100)}%` }}></div>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">Ideal pace is 130-160 WPM.</p>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Filler Words Used</span>
                        <span className="font-semibold text-yellow-400">{session.speechMetrics.fillerWords}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Avg. Response Time</span>
                        <span className="font-semibold">{session.speechMetrics.averageResponseTime}s</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Interview Recording Section */}
              {recordingUrl && isRecordingVisible && (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Video className="w-5 h-5 text-red-400" />
                      Interview Recording
                    </h3>
                    <button 
                      onClick={() => setIsRecordingVisible(false)}
                      className="text-text-secondary hover:text-red-400 transition-colors"
                      title="Delete Recording"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="rounded-lg overflow-hidden border border-gray-700 bg-black aspect-video mb-4">
                    <video src={recordingUrl} controls className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex gap-2">
                    <a href={recordingUrl} download={`Interview_${session?.role?.replace(/\s+/g, '_')}_Recording.webm`} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold flex justify-center items-center gap-2 transition-colors">
                      <Download className="w-4 h-4" /> Download Recording
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Feedback & Transcript */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Actionable Feedback Sections */}
              {(evaluation.strengths?.length > 0 || evaluation.improvements?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5" /> What You Did Well
                    </h3>
                    <ul className="space-y-3">
                      {evaluation.strengths?.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-green-500 mt-1">✓</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5" /> Areas To Improve
                    </h3>
                    <ul className="space-y-3">
                      {evaluation.improvements?.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-red-500 mt-1">✗</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Next Practice Plan */}
              {evaluation.nextPracticePlan && (
                <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" /> Next Practice Plan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-blue-300 mb-2">Topics to Revise</h4>
                      <ul className="space-y-2">
                        {evaluation.nextPracticePlan.topicsToRevise?.map((t: string, i: number) => (
                          <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" /> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-purple-300 mb-2">Interview Tips</h4>
                      <ul className="space-y-2">
                        {evaluation.nextPracticePlan.interviewTips?.map((t: string, i: number) => (
                          <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5" /> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-green-300 mb-2">Suggested Practice</h4>
                      <ul className="space-y-2">
                        {evaluation.nextPracticePlan.suggestedPractice?.map((t: string, i: number) => (
                          <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" /> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Question Feedback */}
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-6">Detailed Answer Analysis</h3>
                
                <div className="space-y-6">
                  {evaluation.questionFeedback?.map((fb: any, idx: number) => (
                    <div key={idx} className="bg-gray-900/50 border border-gray-700 rounded-lg p-5">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium text-gray-200">Question {idx + 1}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          fb.score >= 80 ? 'bg-green-500/20 text-green-400' :
                          fb.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          Score: {fb.score}/100
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-4">{fb.feedback}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-xs font-semibold text-green-400 mb-2">Strengths</h5>
                          <ul className="space-y-1">
                            {fb.strengths?.map((s: string, i: number) => (
                              <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                <span className="text-green-400 mt-0.5">•</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-xs font-semibold text-red-400 mb-2">Areas to Improve</h5>
                          <ul className="space-y-1">
                            {fb.missingPoints?.map((m: string, i: number) => (
                              <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                <span className="text-red-400 mt-0.5">•</span> {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Transcript */}
              {session?.transcript && session.transcript.length > 0 && (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    Complete Interview Transcript
                  </h3>
                  
                  <div className="space-y-4">
                    {session.transcript.map((item: any, idx: number) => (
                      <div key={idx} className="border-b border-gray-700/50 last:border-0 pb-4 last:pb-0">
                        <p className={`text-xs font-bold mb-1 ${item.speaker === 'AI' ? 'text-blue-400' : 'text-green-400'}`}>
                          {item.speaker === 'AI' ? 'Interviewer' : 'You'} 
                          <span className="text-text-secondary font-normal ml-2">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </p>
                        <p className="text-sm text-gray-300 leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
};
