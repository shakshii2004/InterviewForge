import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Download, ChevronLeft, CheckCircle2, AlertTriangle, Code, 
  Lightbulb, TrendingUp, Zap, Box, ListChecks, Calendar, 
  Clock, CheckSquare, Brain, Target, Shield, Layout, MessageSquare,
  Copy, Check
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '../../../lib/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';

export const CodeReviewPage = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    const fetchOrGenerateReview = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/coding/review/${submissionId}`);
        setData(res.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setGenerating(true);
          try {
            const generateRes = await api.post(`/coding/review/${submissionId}`);
            setData(generateRes.data);
          } catch (generateErr: any) {
            setError('Failed to generate review. Please try again.');
          } finally {
            setGenerating(false);
          }
        } else {
          setError('Failed to load review.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) fetchOrGenerateReview();
  }, [submissionId]);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    const toastId = toast.loading('Generating PDF...');
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      
      const candidateName = 'Candidate'; // Would come from user context in real app
      pdf.save(`InterviewForge-Code-Review-${candidateName}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF Downloaded!', { id: toastId });
    } catch (error) {
      toast.error('Failed to generate PDF', { id: toastId });
    }
  };

  const copyCode = () => {
    if (data?.submission?.sourceCode) {
      navigator.clipboard.writeText(data.submission.sourceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {generating ? 'AI is conducting interview analysis...' : 'Loading Review...'}
        </h2>
        <p className="text-slate-400 max-w-md text-center">
          Analyzing correctness, complexities, edge cases, and best practices like a Senior Staff Engineer.
        </p>
      </div>
    );
  }

  if (error || !data || !data.review) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">{error || 'Review not found'}</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  const { review, submission, question } = data;

  const radarData = [
    { subject: 'Correctness', A: review.correctnessScore || 0, fullMark: 100 },
    { subject: 'Time Cpx', A: review.timeComplexityScore || 0, fullMark: 100 },
    { subject: 'Space Cpx', A: review.spaceComplexityScore || 0, fullMark: 100 },
    { subject: 'Readability', A: review.readabilityScore || 0, fullMark: 100 },
    { subject: 'Best Practices', A: review.bestPracticesScore || 0, fullMark: 100 },
    { subject: 'Optimization', A: review.optimizationScore || 0, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors">
            <ChevronLeft className="w-5 h-5" /> Back to Workspace
          </button>
          
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 rounded-xl font-medium transition-all">
            <Download className="w-4 h-4" /> Download Professional PDF
          </button>
        </div>

        {/* --- MAIN REPORT CONTAINER --- */}
        <div ref={reportRef} className="bg-card rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          
          {/* Header Banner */}
          <div className="relative bg-slate-900 p-8 md:p-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-card/10 text-white rounded-lg text-sm font-medium backdrop-blur-sm">
                    Interview Report
                  </span>
                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 rounded-lg text-sm font-medium backdrop-blur-sm">
                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  {question?.title || 'Algorithm Challenge'}
                </h1>
                <p className="text-slate-300 max-w-2xl text-lg leading-relaxed">
                  {review.summary}
                </p>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="text-slate-400 text-sm font-medium mb-1">Overall Interview Score</div>
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                  {review.overallScore}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            
            {/* Row 1: Submission Details & Execution Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Submission Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-indigo-500" /> Submission Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Difficulty" value={question?.difficulty || 'Unknown'} />
                  <DetailItem label="Language" value={submission?.language || 'Unknown'} />
                  <DetailItem label="Status" value={submission?.status || 'Unknown'} 
                    valueColor={submission?.status === 'Accepted' ? 'text-emerald-600' : 'text-red-600'} />
                  <DetailItem label="Passed Tests" value={`${submission?.passedTestCases || 0} / ${submission?.totalTestCases || 0}`} />
                </div>
              </div>

              {/* Execution Metrics */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" /> Execution Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard label="Runtime" value={`${submission?.executionTime || 0} ms`} icon={<Clock className="w-4 h-4 text-slate-400" />} />
                  <MetricCard label="Memory" value={`${submission?.memoryUsage || 0} MB`} icon={<Box className="w-4 h-4 text-slate-400" />} />
                  <div className="col-span-2">
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span className="text-slate-600">Acceptance Rate</span>
                      <span className="text-slate-800">{Math.round(((submission?.passedTestCases || 0) / Math.max(submission?.totalTestCases || 1, 1)) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500" 
                        style={{ width: `${Math.round(((submission?.passedTestCases || 0) / Math.max(submission?.totalTestCases || 1, 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Radar Chart & Sub-Scores */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-card border border-slate-200 rounded-2xl p-6 flex flex-col items-center">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Performance Radar</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar name="Score" dataKey="A" stroke="#4f46e5" strokeWidth={2} fill="#6366f1" fillOpacity={0.4} />
                    <Tooltip cursor={false} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <ScoreCard title="Correctness" score={review.correctnessScore} icon={<CheckCircle2 />} />
                <ScoreCard title="Time Cpx" score={review.timeComplexityScore} icon={<Zap />} subtitle={review.timeComplexity} />
                <ScoreCard title="Space Cpx" score={review.spaceComplexityScore} icon={<Box />} subtitle={review.spaceComplexity} />
                <ScoreCard title="Readability" score={review.readabilityScore} icon={<Code />} />
                <ScoreCard title="Best Practices" score={review.bestPracticesScore} icon={<ListChecks />} />
                <ScoreCard title="Optimization" score={review.optimizationScore} icon={<TrendingUp />} />
              </div>
            </div>

            {/* Row 3: Complexity Deep Dive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" /> Time Complexity
                  </h3>
                  <span className="px-3 py-1 bg-card text-indigo-700 font-bold rounded-lg border border-indigo-200 shadow-sm">{review.timeComplexity}</span>
                </div>
                <p className="text-indigo-800 leading-relaxed text-sm">
                  {review.timeComplexityExplanation || "No detailed explanation provided."}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <Box className="w-5 h-5 text-blue-600" /> Space Complexity
                  </h3>
                  <span className="px-3 py-1 bg-card text-blue-700 font-bold rounded-lg border border-blue-200 shadow-sm">{review.spaceComplexity}</span>
                </div>
                <p className="text-blue-800 leading-relaxed text-sm">
                  {review.spaceComplexityExplanation || "No detailed explanation provided."}
                </p>
              </div>
            </div>

            {/* Read-only Source Code */}
            {submission?.sourceCode && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 shadow-lg">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Code className="w-5 h-5 text-indigo-400" /> Submitted Code
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm font-medium">{submission.language}</span>
                    <button 
                      onClick={copyCode}
                      className="p-2 hover:bg-card/10 rounded-lg text-slate-300 transition-colors"
                      title="Copy code"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => setShowCode(!showCode)}
                      className="text-sm px-3 py-1.5 bg-card/10 hover:bg-card/20 text-white rounded-lg transition-colors"
                    >
                      {showCode ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                </div>
                
                {showCode && (
                  <div className="h-[400px] w-full">
                    <Editor
                      height="100%"
                      language={submission.language.toLowerCase() === 'python' ? 'python' : submission.language.toLowerCase() === 'java' ? 'java' : submission.language.toLowerCase() === 'c++' ? 'cpp' : 'javascript'}
                      theme="vs-dark"
                      value={submission.sourceCode}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        padding: { top: 16, bottom: 16 },
                        smoothScrolling: true,
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Edge Cases & Interview Readiness */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Edge Case Analysis */}
              <div className="bg-card border border-slate-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-500" /> Edge Case Analysis
                </h3>
                {review.edgeCaseAnalysis?.length > 0 ? (
                  <div className="space-y-3">
                    {review.edgeCaseAnalysis.map((ec: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        {ec.handled ? 
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> : 
                          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        }
                        <div>
                          <div className={`text-sm font-medium ${ec.handled ? 'text-slate-700' : 'text-slate-600'}`}>{ec.case}</div>
                          <div className={`text-xs ${ec.handled ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {ec.handled ? 'Handled correctly' : 'Potentially unhandled'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No edge cases analyzed.</p>
                )}
              </div>

              {/* Interview Readiness & Industry Comparison */}
              <div className="space-y-6">
                <div className="bg-card border border-slate-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-500" /> Interview Readiness
                  </h3>
                  <div className="flex items-center gap-4 mb-3">
                    {review.interviewReadiness?.rating === 'Excellent' && <span className="px-4 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-200 shadow-sm">Excellent - Ready</span>}
                    {review.interviewReadiness?.rating === 'Good' && <span className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 shadow-sm">Good - Minor Fixes</span>}
                    {review.interviewReadiness?.rating === 'Needs Practice' && <span className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-xl border border-red-200 shadow-sm">Needs Practice</span>}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{review.interviewReadiness?.feedback || 'N/A'}</p>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                    <TrendingUp className="w-5 h-5 text-indigo-400" /> Industry Comparison
                    <span className="text-[10px] uppercase tracking-wider bg-card/10 px-2 py-0.5 rounded-full ml-auto text-slate-300">AI Estimate</span>
                  </h3>
                  
                  <div className="space-y-5 relative z-10">
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-slate-300">Average Candidate</span>
                        <span className="font-bold text-slate-300">{review.industryComparison?.averageScore || 75}</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-500 rounded-full" style={{ width: `${review.industryComparison?.averageScore || 75}%` }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-indigo-200 font-medium">Your Score</span>
                        <span className="font-bold text-indigo-300">{review.industryComparison?.candidateScore || review.overallScore}</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full" style={{ width: `${review.industryComparison?.candidateScore || review.overallScore}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 text-sm text-center font-medium text-indigo-200 bg-card/5 py-2 rounded-lg">
                    Estimated Percentile: <span className="text-white font-bold">{review.industryComparison?.estimatedPercentile || 'Top 50%'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FeedbackSection title="Strengths" items={review.strengths} type="positive" />
              <FeedbackSection title="Weaknesses" items={review.weaknesses} type="negative" />
              <FeedbackSection title="Bugs Detected" items={review.bugs} type="warning" />
              <FeedbackSection title="Alternative Approaches" items={review.alternativeApproaches} type="info" />
            </div>

            {/* Interviewer Notes & Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 bg-card border border-slate-200 rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-indigo-500" /> Interviewer Notes
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                  {Object.entries(review.interviewerNotes || {}).filter(([k]) => k !== 'overallImpression').map(([key, value]: any) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-slate-800 font-bold">{value}/10</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(value / 10) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                  <p className="text-indigo-900 leading-relaxed italic">
                    "{review.interviewerNotes?.overallImpression || review.interviewerFeedback}"
                  </p>
                </div>
              </div>

              <div className="lg:col-span-1 bg-card border border-slate-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-blue-500" /> Improvement Checklist
                </h3>
                <div className="space-y-3">
                  {review.improvementChecklist?.length > 0 ? review.improvementChecklist.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                      <div className="w-5 h-5 rounded border-2 border-slate-300 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 leading-relaxed">{item}</span>
                    </div>
                  )) : (
                    <div className="text-sm text-slate-500 italic">No specific checklist items provided.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Learning Roadmap */}
            {review.learningRoadmap?.length > 0 && (
              <div className="bg-card border border-slate-200 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" /> Personalized Learning Roadmap
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 font-medium">Topic</th>
                        <th className="px-6 py-4 font-medium">Why it matters</th>
                        <th className="px-6 py-4 font-medium">Difficulty</th>
                        <th className="px-6 py-4 font-medium">Est. Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {review.learningRoadmap.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{item.topic}</td>
                          <td className="px-6 py-4 text-slate-600 max-w-xs">{item.reason}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              item.difficulty.toLowerCase().includes('easy') ? 'bg-emerald-100 text-emerald-700' :
                              item.difficulty.toLowerCase().includes('medium') ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {item.difficulty}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{item.estimatedTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const DetailItem = ({ label, value, valueColor = 'text-slate-800' }: any) => (
  <div>
    <div className="text-xs text-slate-500 font-medium mb-1">{label}</div>
    <div className={`text-sm font-bold ${valueColor}`}>{value}</div>
  </div>
);

const MetricCard = ({ label, value, icon }: any) => (
  <div className="bg-card p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
    <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
    <div>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
      <div className="text-sm font-bold text-slate-800">{value}</div>
    </div>
  </div>
);

const ScoreCard = ({ title, score, icon, subtitle = '' }: any) => {
  const getColor = (s: number) => {
    if (s >= 90) return 'text-emerald-500';
    if (s >= 70) return 'text-amber-500';
    return 'text-red-500';
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-card border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-medium text-slate-600">{title}</span>
        <div className="text-slate-400 w-5 h-5">{icon}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-black tracking-tight ${getColor(score)}`}>{score}</span>
        <span className="text-sm font-medium text-slate-400">/100</span>
      </div>
      {subtitle && <span className="text-xs font-bold text-slate-500 mt-2 px-2 py-1 bg-slate-100 rounded-md inline-block w-fit">{subtitle}</span>}
    </motion.div>
  );
};

const FeedbackSection = ({ title, items, type }: { title: string, items: string[], type: 'positive' | 'negative' | 'warning' | 'info' }) => {
  if (!items || items.length === 0) return null;
  const getStyles = () => {
    switch (type) {
      case 'positive': return 'bg-emerald-50/50 border-emerald-100 text-emerald-900 marker:text-emerald-500';
      case 'negative': return 'bg-red-50/50 border-red-100 text-red-900 marker:text-red-500';
      case 'warning': return 'bg-amber-50/50 border-amber-100 text-amber-900 marker:text-amber-500';
      case 'info': return 'bg-blue-50/50 border-blue-100 text-blue-900 marker:text-blue-500';
    }
  };

  return (
    <div className={`p-6 rounded-2xl border ${getStyles()} h-full`}>
      <h3 className="font-bold mb-4 text-lg">{title}</h3>
      <ul className="list-disc pl-5 space-y-2.5 text-sm">
        {items.map((item, i) => (
          <li key={i} className="leading-relaxed opacity-90">{item}</li>
        ))}
      </ul>
    </div>
  );
};
