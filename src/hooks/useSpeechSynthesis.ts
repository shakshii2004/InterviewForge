import { useState, useEffect, useCallback } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; voiceURI?: string }) => {
    if (!supported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Small delay fixes a known browser bug where speak() fails silently if called immediately after cancel()
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      let currentVoices = voices;
      if (currentVoices.length === 0) {
        currentVoices = window.speechSynthesis.getVoices();
      }

      // Attempt to pick a good English voice by default
      const englishVoices = currentVoices.filter(v => v.lang.startsWith('en'));
      
      // Prefer Google US English or Microsoft Zira/David if available
      let selectedVoice = englishVoices.find(v => v.name.includes('Google US English'));
      if (!selectedVoice) selectedVoice = englishVoices.find(v => v.name.includes('Zira'));
      if (!selectedVoice && englishVoices.length > 0) selectedVoice = englishVoices[0];

      if (options?.voiceURI) {
        const specificVoice = currentVoices.find(v => v.voiceURI === options.voiceURI);
        if (specificVoice) selectedVoice = specificVoice;
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = options?.rate || 1.0;
      utterance.pitch = options?.pitch || 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.error('Speech synthesis error', e);
        setIsSpeaking(false);
      };

      // Firefox garbage collection bug fix: keep a global reference
      // @ts-ignore
      window.__speechUtterance = utterance;

      window.speechSynthesis.speak(utterance);
    }, 50);
  }, [supported, voices]);

  const stop = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [supported]);

  return {
    speak,
    stop,
    isSpeaking,
    supported,
    voices
  };
};
