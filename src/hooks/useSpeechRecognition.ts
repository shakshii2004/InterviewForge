import { useState, useEffect, useCallback, useRef } from 'react';

// Type definitions for Web Speech API (since TS might not have them by default)
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const recognitionRef = useRef<any>(null);
  const isIntendedToStop = useRef<boolean>(true);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please use Google Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          currentTranscript += result[0].transcript + ' ';
        } else {
          currentInterim += result[0].transcript;
        }
      }

      if (currentTranscript) {
        setTranscript((prev) => prev + currentTranscript);
      }
      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setHasPermission(false);
        setError('Microphone permission denied.');
      } else {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setError(event.error);
        }
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (!isIntendedToStop.current) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition', e);
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    // Check permissions early if possible
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
        if (result.state === 'granted') setHasPermission(true);
        if (result.state === 'denied') setHasPermission(false);
      });
    }

    return () => {
      recognition.stop();
    };
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    if (recognitionRef.current && !isListening) {
      try {
        isIntendedToStop.current = false;
        recognitionRef.current.start();
        setIsListening(true);
        setHasPermission(true);
      } catch (err: any) {
        console.error('Failed to start recognition:', err);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    isIntendedToStop.current = true;
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    error,
    hasPermission,
    supported: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  };
};
