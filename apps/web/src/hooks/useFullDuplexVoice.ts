'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Browser speech recognition type definitions
interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: unknown) => void) | null;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

export type VoiceDuplexMode = 'full_duplex' | 'half_duplex';

export interface UseFullDuplexVoiceOptions {
  mode?: VoiceDuplexMode;
  onUserTranscript?: (transcript: string) => void;
  onBargeIn?: () => void;
}

export function useFullDuplexVoice(options: UseFullDuplexVoiceOptions = {}) {
  const [duplexMode, setDuplexMode] = useState<VoiceDuplexMode>(options.mode || 'full_duplex');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isSpeakingRef = useRef(false);
  const onTranscriptRef = useRef(options.onUserTranscript);
  const onBargeInRef = useRef(options.onBargeIn);

  useEffect(() => {
    onTranscriptRef.current = options.onUserTranscript;
    onBargeInRef.current = options.onBargeIn;
  }, [options.onUserTranscript, options.onBargeIn]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Initialize speech recognition and browser support
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const win = window as WindowWithSpeech;
    const SpeechRecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognitionConstructor) {
      setIsSupported(true);
      try {
        const recognition = new SpeechRecognitionConstructor();
        // In full duplex mode we keep continuous listening active
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en_US';

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
          const resultsLen = Object.keys(event.results).length;
          if (resultsLen > 0) {
            const lastIndex = resultsLen - 1;
            const transcript = event.results[lastIndex]?.[0]?.transcript;
            if (transcript && onTranscriptRef.current) {
              onTranscriptRef.current(transcript.trim());
            }
          }
        };

        recognition.onerror = () => {
          // Handled gracefully in event loops
        };

        recognitionRef.current = recognition;
      } catch {
        setIsSupported(false);
      }
    }

    return () => {
      stopAudioAnalysis();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup errors
        }
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Web Audio API analyzer with acoustic echo cancellation
  const startAudioAnalysis = async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let speakingCounter = 0;

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(1, average / 128);
        setAudioLevel(normalized);

        // Voice activity threshold
        const threshold = 0.12;
        if (normalized > threshold) {
          speakingCounter++;
          setIsUserSpeaking(true);

          // Full duplex barge in detection
          if (isSpeakingRef.current && speakingCounter > 2) {
            // User interrupted the agent while speaking
            setIsInterrupted(true);
            if (typeof window !== 'undefined' && window.speechSynthesis) {
              window.speechSynthesis.cancel();
            }
            setIsSpeaking(false);
            if (onBargeInRef.current) {
              onBargeInRef.current();
            }
            setTimeout(() => setIsInterrupted(false), 1200);
          }
        } else {
          speakingCounter = 0;
          setIsUserSpeaking(false);
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch {
      // microphone access denied or not allowed
    }
  };

  const stopAudioAnalysis = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }
    setAudioLevel(0);
    setIsUserSpeaking(false);
  };

  const startSession = useCallback(async () => {
    setError(null);
    await startAudioAnalysis();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        try {
          recognitionRef.current.abort();
          recognitionRef.current.start();
        } catch {
          setError('Microphone session failed to initialize.');
        }
      }
    }
  }, []);

  const stopSession = useCallback(() => {
    stopAudioAnalysis();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsListening(false);
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Remove markup and normalize spacing
    const plainText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!plainText) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 1.02;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const cancelSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const toggleDuplexMode = useCallback(() => {
    setDuplexMode((prev) => (prev === 'full_duplex' ? 'half_duplex' : 'full_duplex'));
  }, []);

  return {
    duplexMode,
    isListening,
    isSpeaking,
    isUserSpeaking,
    isInterrupted,
    audioLevel,
    isSupported,
    error,
    startSession,
    stopSession,
    speak,
    cancelSpeech,
    toggleDuplexMode,
    setDuplexMode,
  };
}
