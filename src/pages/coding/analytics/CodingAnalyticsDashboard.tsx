import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../../lib/api';
import { OverviewCards } from './components/OverviewCards';
import { ProgressCharts } from './components/ProgressCharts';
import { TopicPerformance } from './components/TopicPerformance';
import { LanguagePerformance } from './components/LanguagePerformance';
import { DifficultyBreakdown } from './components/DifficultyBreakdown';
import { Achievements } from './components/Achievements';
import { RecommendationCard } from './components/RecommendationCard';
import { Download, AlertTriangle, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

export const CodingAnalyticsDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/coding/analytics');
        setData(res.data);
      } catch (err) {
        setError('Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    const toastId = toast.loading('Generating Analytics Report...');
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`InterviewForge-Coding-Analytics.pdf`);
      toast.success('Report Downloaded!', { id: toastId });
    } catch (error) {
      toast.error('Failed to generate PDF', { id: toastId });
    }
  };

  const handleDownloadCSV = () => {
    if (!data) return;
    
    // Quick CSV generation for Topics
    const headers = ['Topic', 'Problems Solved', 'Average Score', 'Acceptance Rate', 'Weakness Level', 'Trend'];
    const rows = data.topicBreakdown.map((t: any) => [
      t.topic, t.solved, t.averageScore.toFixed(2), t.acceptanceRate.toFixed(2), t.weaknessLevel, t.trend
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "topic_analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Downloaded!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">{error}</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8" ref={reportRef}>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-md">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">Coding Performance Analytics</h1>
            <p className="text-slate-400 text-lg">Track your progress, identify weaknesses, and prepare for technical interviews.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleDownloadCSV} className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">
              <FileText className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl font-medium transition-colors">
              <Download className="w-4 h-4" /> Export PDF Report
            </button>
          </div>
        </div>

        {/* Overview */}
        <OverviewCards data={data} />

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProgressCharts data={data} />
        </div>

        {/* Breakdowns Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TopicPerformance topics={data.topicBreakdown} />
          </div>
          <div className="space-y-8">
            <LanguagePerformance languages={data.languageBreakdown} />
            <DifficultyBreakdown difficulty={data.difficultyBreakdown} />
          </div>
        </div>

        {/* Achievements & Recommendations Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Achievements badges={data.achievements} />
          <RecommendationCard />
        </div>

      </div>
    </div>
  );
};
