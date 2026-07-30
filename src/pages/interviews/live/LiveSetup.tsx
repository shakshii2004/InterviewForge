import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Mic, Monitor, Clock, Play, AlertCircle } from 'lucide-react';
import { api } from '../../../lib/api';
import toast from 'react-hot-toast';

export const LiveSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState({ camera: false, mic: false });
  const [hasRequested, setHasRequested] = useState(false);
  
  const [config, setConfig] = useState({
    role: 'Software Engineer',
    experienceLevel: 'Mid-Level',
    interviewType: 'Technical',
    difficulty: 'Medium',
    duration: 30,
    communicationMode: 'Voice' as 'Text' | 'Voice' | 'Video'
  });

  const requestPermissions = async () => {
    try {
      setHasRequested(true);
      if (config.communicationMode === 'Video') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setPermissions({ camera: true, mic: true });
        // Stop the tracks right away just to test permission
        stream.getTracks().forEach(t => t.stop());
      } else if (config.communicationMode === 'Voice') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissions({ camera: false, mic: true });
        stream.getTracks().forEach(t => t.stop());
      } else {
        setPermissions({ camera: false, mic: false });
      }
    } catch (err) {
      toast.error('Permissions denied. Please allow access to continue.');
    }
  };

  const handleStart = async () => {
    if (config.communicationMode !== 'Text' && !hasRequested) {
      await requestPermissions();
      return;
    }

    if (config.communicationMode === 'Video' && (!permissions.camera || !permissions.mic)) {
      toast.error('Camera and Microphone permissions required for Video mode.');
      return;
    }

    if (config.communicationMode === 'Voice' && !permissions.mic) {
      toast.error('Microphone permission required for Voice mode.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/interviews/live/start', config);
      navigate(`/dashboard/interview/live/session/${data._id}`);
    } catch (error) {
      toast.error('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Live AI Interview Setup</h1>
        <p className="text-gray-400">Configure your virtual interview experience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl space-y-6"
        >
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-400" />
            Interview Settings
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
              <input
                type="text"
                value={config.role}
                onChange={(e) => setConfig({ ...config, role: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
              <select
                value={config.interviewType}
                onChange={(e) => setConfig({ ...config, interviewType: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option>Technical</option>
                <option>Behavioral</option>
                <option>System Design</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
              <select
                value={config.difficulty}
                onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Duration</label>
              <select
                value={config.duration}
                onChange={(e) => setConfig({ ...config, duration: Number(e.target.value) })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-xl space-y-6"
        >
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-400" />
            Communication Mode
          </h2>

          <div className="space-y-4">
            {(['Text', 'Voice', 'Video'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setConfig({ ...config, communicationMode: mode })}
                className={`w-full p-4 rounded-lg border text-left transition-colors flex items-center gap-4
                  ${config.communicationMode === mode 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'}`}
              >
                {mode === 'Text' && <Monitor className="w-6 h-6 text-gray-400" />}
                {mode === 'Voice' && <Mic className="w-6 h-6 text-green-400" />}
                {mode === 'Video' && <Camera className="w-6 h-6 text-purple-400" />}
                
                <div>
                  <h3 className="font-semibold">{mode} Mode</h3>
                  <p className="text-sm text-gray-400">
                    {mode === 'Text' && 'Classic chat-based interview.'}
                    {mode === 'Voice' && 'Speak your answers aloud. AI will respond with voice.'}
                    {mode === 'Video' && 'Full immersive experience with webcam and voice.'}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {config.communicationMode !== 'Text' && !hasRequested && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
              <p className="text-sm text-yellow-200">
                You will be prompted to allow hardware permissions on the next step.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleStart}
          disabled={loading}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {hasRequested || config.communicationMode === 'Text' ? 'Start Interview' : 'Allow Permissions & Continue'}
              <Play className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
    </div>
  );
};
