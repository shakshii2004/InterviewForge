import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Square, PhoneOff, Send, Download, Award, Target, Clock } from 'lucide-react';
import { api } from '../../../lib/api';
import toast from 'react-hot-toast';
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../../hooks/useSpeechSynthesis';

interface TranscriptItem {
  speaker: 'AI' | 'User';
  text: string;
}

export const LiveSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewState, setInterviewState] = useState('Waiting to Start...');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [manualAnswer, setManualAnswer] = useState('');
  
  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Metrics Tracking
  const questionStartTime = useRef<number>(Date.now());
  const userSpeechStartTime = useRef<number | null>(null);
  const responseTimeAcc = useRef<number>(0);
  const responseTimeCount = useRef<number>(0);
  
  const totalMetrics = useRef({
    fillerWords: 0,
    speakingTime: 0,
    wordCount: 0
  });
  
  // Hardware states
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

  const { 
    isListening, 
    transcript: liveText, 
    interimTranscript, 
    startListening, 
    stopListening, 
    resetTranscript,
    supported: hasSpeechRecognition
  } = useSpeechRecognition();

  const { speak, stop: stopSpeaking, isSpeaking, supported: hasTTS } = useSpeechSynthesis();
  
  // On Mount: Fetch session details and setup streams
  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await api.get(`/interviews/live/${sessionId}`);
        if (data.status === 'completed') {
          navigate(`/dashboard/interview/live/report/${sessionId}`, { replace: true });
          return;
        }
        setSession(data);
        
        // Start Video if mode is Video
        if (data.communicationMode === 'Video') {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            mediaStreamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
            
            // Setup MediaRecorder
            const recorder = new MediaRecorder(stream);
            recorder.ondataavailable = (e) => {
              if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
            };
            recorder.start(1000); // chunk every second
            mediaRecorderRef.current = recorder;
          } catch (err) {
            toast.error('Failed to access camera/mic');
          }
        }
        
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load session');
        setLoading(false);
      }
    };
    init();

    return () => {
      stopSpeaking();
      stopListening();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [sessionId]);

  const startInterviewFlow = () => {
    if (!session) return;
    setInterviewStarted(true);
    setInterviewState('AI Speaking...');
    
    // Fix Autoplay policies: force resume on user gesture
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
    
    const introText = `Hello. I'm your AI interviewer today. We'll be having a ${session.role} interview. Let's begin.`;
    setTranscript([{ speaker: 'AI', text: introText }]);
    
    if (hasTTS) {
      speak(introText);
    }

    setTimeout(async () => {
      setInterviewState('Generating Follow-up...');
      try {
        const startRes = await api.post(`/interviews/${sessionId}/start`);
        const qData = startRes.data.data || startRes.data;
        const qText = typeof qData.question === 'string' ? qData.question : qData.question?.question;
        handleAIQuestion(qText || "Could not load question.");
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to start interview');
        setInterviewState('Waiting to Start...');
        setInterviewStarted(false);
      }
    }, 4000); 
  };

  // Ensure Video Element gets the stream once it's mounted
  useEffect(() => {
    if (!loading && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch(console.error);
    }
  }, [loading]);

  // When recording chunks update, if recorder is stopped, create URL
  useEffect(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive' && recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      setRecordingUrl(URL.createObjectURL(blob));
    }
  }, [recordedChunks]);

  // Silence Detection (Auto-Submit)
  useEffect(() => {
    if (!isListening || isProcessing || (!liveText && !interimTranscript)) return;
    
    const timeout = setTimeout(() => {
      // 3 seconds of silence -> auto submit
      submitAnswer();
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [liveText, interimTranscript, isListening, isProcessing]);

  // Update interview state dynamically
  useEffect(() => {
    if (!interviewStarted) return;
    
    if (isProcessing) {
      setInterviewState('Analyzing Response...');
    } else if (isSpeaking) {
      setInterviewState('AI Speaking...');
    } else if (isListening) {
      setInterviewState('Listening...');
    } else if (interviewState !== 'Waiting to Start...' && interviewState !== 'Interview Completed') {
      setInterviewState('Waiting...');
    }
  }, [isProcessing, isSpeaking, isListening, interviewStarted]);

  // Automatically start listening when AI finishes speaking
  const previousIsSpeaking = useRef(false);
  useEffect(() => {
    if (previousIsSpeaking.current && !isSpeaking) {
      if (micEnabled && !isProcessing) {
        questionStartTime.current = Date.now(); // reset question start time to when AI finished speaking
        startListening();
      }
    }
    previousIsSpeaking.current = isSpeaking;
  }, [isSpeaking, micEnabled, isProcessing, startListening]);

  // Track when user actually starts speaking
  useEffect(() => {
    if ((liveText || interimTranscript) && !userSpeechStartTime.current) {
      userSpeechStartTime.current = Date.now();
      
      const rTime = (Date.now() - questionStartTime.current) / 1000;
      responseTimeAcc.current += rTime;
      responseTimeCount.current += 1;
    }
  }, [liveText, interimTranscript]);

  const handleAIQuestion = (text: string) => {
    setCurrentQuestion(text);
    setTranscript(prev => [...prev, { speaker: 'AI', text }]);
    questionStartTime.current = Date.now();
    
    // Save AI transcript to db
    api.post(`/interviews/live/transcript/${sessionId}`, { speaker: 'AI', text }).catch(console.error);

    if (hasTTS && (session?.communicationMode === 'Voice' || session?.communicationMode === 'Video')) {
      speak(text);
      
      // Fallback: If the browser blocks TTS entirely (e.g. Firefox strict mode), force the mic to activate after 2 seconds
      setTimeout(() => {
        if (!isSpeaking) {
          startListening();
        }
      }, 2000);
    } else {
      // If no TTS, just start listening immediately
      startListening();
    }
  };

  const submitAnswer = async (textOverride?: string) => {
    const finalAnswer = textOverride || (liveText + ' ' + interimTranscript);
    if (!finalAnswer.trim()) {
      toast.error('Please say something before submitting.');
      return;
    }
    
    stopListening();
    setIsProcessing(true);
    setManualAnswer('');
    
    // Calculate metrics
    let actualSpeakingTime = 5; // fallback
    if (userSpeechStartTime.current) {
       actualSpeakingTime = (Date.now() - userSpeechStartTime.current) / 1000;
       // Subtract 3s of silence delay if auto-submitted (textOverride is undefined)
       if (!textOverride && actualSpeakingTime > 3) {
          actualSpeakingTime -= 3;
       }
    } else if (textOverride) {
       // manual typed answer
       actualSpeakingTime = Math.max(5, (Date.now() - questionStartTime.current) / 1000);
    }
    
    const wordsCount = finalAnswer.trim().split(/\s+/).length;
    const fillerWords = (finalAnswer.match(/\b(um|uh|like|you know|actually|basically|literally)\b/gi) || []).length;
    
    totalMetrics.current.fillerWords += fillerWords;
    totalMetrics.current.speakingTime += actualSpeakingTime;
    totalMetrics.current.wordCount += wordsCount;
    userSpeechStartTime.current = null;

    // Add User transcript locally
    setTranscript(prev => [...prev, { speaker: 'User', text: finalAnswer }]);
    resetTranscript();

    try {
      // Save User transcript to DB for live metrics
      await api.post(`/interviews/live/transcript/${sessionId}`, { speaker: 'User', text: finalAnswer });
      
      // Hit existing core API to get next question based on answer
      const { data } = await api.post(`/interviews/${sessionId}/next`, { answer: finalAnswer });
      
      const responseData = data.data !== undefined ? data.data : data;

      if (!responseData || responseData.isComplete) {
        toast.success('Interview complete!');
        endInterview();
      } else {
        const qText = typeof responseData.question === 'string' ? responseData.question : responseData.question?.question;
        handleAIQuestion(qText || "Could not load next question.");
      }
    } catch (error) {
      toast.error('Failed to submit answer');
    } finally {
      setIsProcessing(false);
    }
  };

  const endInterview = async () => {
    stopListening();
    setIsProcessing(true);
    setInterviewState('Interview Completed');
    
    const endText = "Thank you. That concludes our interview. I'll now evaluate your performance.";
    if (hasTTS) speak(endText);
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setTimeout(async () => {
      try {
        // Finish existing interview
        await api.post(`/interviews/${sessionId}/finish`);
        
        // Finish Live metrics & evaluation
        const overallWpm = totalMetrics.current.speakingTime > 0 
          ? Math.round((totalMetrics.current.wordCount / totalMetrics.current.speakingTime) * 60) 
          : 0;
          
        const avgResponseTime = responseTimeCount.current > 0
          ? Number((responseTimeAcc.current / responseTimeCount.current).toFixed(1))
          : 2.5;

        await api.post(`/interviews/live/finish/${sessionId}`, {
          speechMetrics: {
            averageResponseTime: avgResponseTime,
            wordsPerMinute: overallWpm,
            fillerWords: totalMetrics.current.fillerWords,
            totalSpeakingTime: Math.round(totalMetrics.current.speakingTime)
          }
        });
        
        // Pass the recordingUrl directly into router state
        navigate(`/dashboard/interview/live/report/${sessionId}`, { state: { recordingUrl } });
      } catch (error) {
        toast.error('Failed to end interview gracefully');
      }
    }, endText.length * 60);
  };

  const toggleCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !cameraEnabled;
      });
      setCameraEnabled(!cameraEnabled);
    }
  };

  const toggleMic = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !micEnabled;
      });
      setMicEnabled(!micEnabled);
    }
    // Also toggle speech recognition if running
    if (micEnabled) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-950 text-white">Connecting to Interview Engine...</div>;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
      
      {/* Top Navigation / Progress */}
      <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-semibold text-gray-200">LIVE</span>
          </div>
          <div className="h-4 w-px bg-gray-700" />
          <h1 className="font-medium text-gray-300">{session?.role} Interview</h1>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Elapsed: {formatTime(elapsedTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>Question {session?.currentQuestionIndex + 1} / {session?.totalQuestions}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>{session?.difficulty}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        
        {/* Left Column: AI Context */}
        <div className="w-1/3 flex flex-col gap-6">
          
          {/* AI Avatar & State */}
          <motion.div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center flex-1 relative overflow-hidden">
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-text-secondary">
              <span>AI Recruiter</span>
              <span className={`px-2 py-1 rounded-full ${
                interviewState === 'Listening...' ? 'bg-green-500/10 text-green-400' :
                interviewState === 'AI Speaking...' ? 'bg-blue-500/10 text-blue-400' :
                'bg-yellow-500/10 text-yellow-400'
              }`}>
                {interviewState}
              </span>
            </div>
            
            <div className="relative mt-8">
              {/* Outer pulsing ring when speaking */}
              {isSpeaking && (
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-blue-500/20 rounded-full" 
                />
              )}
              {/* Inner animated avatar */}
              <motion.div 
                animate={isSpeaking ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
                className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl relative z-10 ${
                  isSpeaking ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gray-800 border border-gray-700'
                }`}
              >
                {isProcessing ? (
                   <div className="flex gap-1">
                     <span className="w-2 h-2 bg-card rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                     <span className="w-2 h-2 bg-card rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                     <span className="w-2 h-2 bg-card rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                   </div>
                ) : (
                   <div className="w-12 h-12 border-4 border-white/20 rounded-full flex items-center justify-center">
                     <div className="w-6 h-6 bg-card rounded-full" />
                   </div>
                )}
              </motion.div>
            </div>
            
            <div className="mt-8 text-center w-full px-4">
              <p className="text-sm font-medium text-gray-400 mb-2">Current Question</p>
              <h2 className="text-xl font-bold text-gray-100 leading-tight">
                {!interviewStarted ? "Waiting to start..." : (currentQuestion || "Preparing your interview...")}
              </h2>
            </div>
          </motion.div>
          
        </div>
        
        {/* Right Column: Video & Controls */}
        <div className="w-2/3 flex flex-col gap-6">
          <div className="bg-black border border-gray-800 rounded-2xl flex-1 relative overflow-hidden shadow-2xl flex items-center justify-center">
            {session?.communicationMode === 'Video' ? (
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className={`w-full h-full object-cover transition-opacity duration-300 ${!cameraEnabled ? 'opacity-0' : 'opacity-100'}`} 
              />
            ) : (
              <div className="flex flex-col items-center text-text-secondary">
                <Mic className={`w-20 h-20 mb-6 ${isListening ? 'text-green-400 animate-pulse' : ''}`} />
                <p className="text-xl font-medium">{session?.communicationMode} Mode Active</p>
              </div>
            )}
            
            {/* Camera Off State */}
            {session?.communicationMode === 'Video' && !cameraEnabled && (
              <div className="absolute inset-0 flex items-center justify-center text-text-secondary bg-gray-900/80">
                <VideoOff className="w-16 h-16" />
              </div>
            )}
            
            {/* Start Button Overlay */}
            {!interviewStarted && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                <button 
                  onClick={startInterviewFlow}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all flex items-center gap-3"
                >
                  Start Interview <Mic className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {/* Overlays */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-3">
                <span className="font-medium text-sm">You (Candidate)</span>
              </div>
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2 w-max">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-semibold text-gray-300">Excellent Connection</span>
              </div>
            </div>
            
            {/* Audio visualizer bottom overlay */}
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div className={`px-4 py-2 rounded-lg backdrop-blur-md border border-white/10 flex items-center gap-3 transition-colors ${
                isListening ? 'bg-green-500/20 text-green-300' : 'bg-black/60 text-gray-400'
              }`}>
                {isListening ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
                <span className="text-xs font-semibold uppercase">{isListening ? 'Microphone Active' : 'Muted'}</span>
              </div>
              
              {/* Fallback button if silence detection fails */}
              {(liveText || interimTranscript) && !isProcessing && (
                <button 
                  onClick={() => submitAnswer()}
                  className="px-6 py-2 bg-card/10 hover:bg-card/20 backdrop-blur-md border border-white/20 rounded-full text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  Finish Answer <Send className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Manual Text Fallback */}
            <div className="absolute bottom-20 left-6 right-6 flex flex-col gap-2">
              {!hasSpeechRecognition && interviewStarted && (
                 <div className="bg-red-500/20 text-red-200 p-2 rounded-lg text-xs text-center border border-red-500/30 font-medium">
                   Voice Recognition is not supported in this browser. Please type your answers or switch to Google Chrome.
                 </div>
              )}
              {interviewStarted && (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={manualAnswer}
                    onChange={e => setManualAnswer(e.target.value)}
                    placeholder={hasSpeechRecognition ? "Or type your answer manually..." : "Type your answer here..."}
                    className="flex-1 bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 backdrop-blur-md"
                    onKeyDown={e => e.key === 'Enter' && submitAnswer(manualAnswer)}
                  />
                  <button 
                    onClick={() => submitAnswer(manualAnswer)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom Action Bar */}
          <div className="h-20 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center gap-6 shrink-0">
             {session?.communicationMode === 'Video' && (
              <button 
                onClick={toggleCamera}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${cameraEnabled ? 'bg-gray-800 hover:bg-gray-700' : 'bg-red-500/20 text-red-400'}`}
              >
                {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
             )}
             <button 
               onClick={toggleMic}
               className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${micEnabled ? 'bg-gray-800 hover:bg-gray-700' : 'bg-red-500/20 text-red-400'}`}
             >
               {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
             </button>
             <button 
               onClick={endInterview}
               className="px-6 h-12 rounded-full bg-red-600/90 hover:bg-red-500 text-white font-semibold transition-all flex items-center gap-2 shadow-lg shadow-red-900/20"
             >
               <PhoneOff className="w-4 h-4" /> End Interview
             </button>
          </div>
        </div>
        
      </div>
      
      {/* Transcript Log Drawer (Bottom Half) */}
      <div className="h-64 bg-gray-900 border-t border-gray-800 p-6 flex flex-col shrink-0">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Interview Log</h3>
        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-4">
          {transcript.map((item, idx) => (
            <div key={idx} className="flex gap-4 group">
              <div className="w-16 shrink-0 text-right">
                <span className="text-[10px] text-text-secondary font-mono mt-1 block">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex-1">
                <span className={`text-xs font-bold uppercase tracking-wide mr-3 ${item.speaker === 'AI' ? 'text-blue-400' : 'text-green-400'}`}>
                  {item.speaker === 'AI' ? 'Interviewer' : 'You'}
                </span>
                <p className={`text-sm inline leading-relaxed ${item.speaker === 'AI' ? 'text-gray-300' : 'text-gray-400'}`}>
                  {item.text}
                </p>
              </div>
            </div>
          ))}
          {/* Live text */}
          {(liveText || interimTranscript) && (
            <div className="flex gap-4">
              <div className="w-16 shrink-0 text-right">
                <span className="text-[10px] text-text-secondary font-mono mt-1 block">LIVE</span>
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold uppercase tracking-wide mr-3 text-green-400">You</span>
                <p className="text-sm inline leading-relaxed text-gray-400">
                  {liveText} <span className="opacity-60">{interimTranscript}</span>
                  <span className="ml-1 w-1.5 h-4 inline-block bg-green-500/50 animate-pulse align-middle" />
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};
