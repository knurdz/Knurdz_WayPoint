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
export type VoiceProvider = 'elevenlabs' | 'browser';

export interface UseFullDuplexVoiceOptions {
  mode?: VoiceDuplexMode;
  provider?: VoiceProvider;
  onUserTranscript?: (transcript: string) => void;
  onBargeIn?: () => void;
}

export function useFullDuplexVoice(options: UseFullDuplexVoiceOptions = {}) {
  const [duplexMode, setDuplexMode] = useState<VoiceDuplexMode>(options.mode || 'full_duplex');
  const [voiceProvider, setVoiceProvider] = useState<VoiceProvider>(options.provider || 'elevenlabs');
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
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
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

  // Clean stop for audio element and speech synthesis
  const stopAllPlayback = useCallback(() => {
    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      } catch {
        // ignore
      }
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

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
      stopAllPlayback();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [stopAllPlayback]);

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
            stopAllPlayback();
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
    stopAllPlayback();
    setIsListening(false);
  }, [stopAllPlayback]);

  // Fallback vocalization via local browser neural speech synthesis
  const speakWithBrowser = useCallback((plainText: string, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

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

  // Main speak function supporting ElevenLabs streaming with automatic browser fallback
  const speak = useCallback(
    async (text: string, onEnd?: () => void) => {
      // Clean markup and normalize whitespace
      const plainText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (!plainText) return;

      stopAllPlayback();

      if (voiceProvider === 'elevenlabs') {
        try {
          const res = await fetch('/api/agent/voice/synthesize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: plainText }),
          });

          const contentType = res.headers.get('content-type') || '';

          if (contentType.includes('audio/mpeg')) {
            const blob = await res.blob();
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            audioElementRef.current = audio;

            audio.onplay = () => {
              setIsSpeaking(true);
            };

            audio.onended = () => {
              setIsSpeaking(false);
              URL.revokeObjectURL(audioUrl);
              if (onEnd) onEnd();
            };

            audio.onerror = () => {
              URL.revokeObjectURL(audioUrl);
              speakWithBrowser(plainText, onEnd);
            };

            await audio.play();
            return;
          }
        } catch {
          // Seamless fallback on network or API failure
        }
      }

      // Default browser neural vocalization fallback
      speakWithBrowser(plainText, onEnd);
    },
    [voiceProvider, stopAllPlayback, speakWithBrowser]
  );

  const [isRadioActive, setIsRadioActive] = useState(false);

  const playRadioChime = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      type AudioContextCtor = new () => AudioContext;
      const win = window as unknown as { AudioContext?: AudioContextCtor; webkitAudioContext?: AudioContextCtor };
      const Ctor = win.AudioContext || win.webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      const now = ctx.currentTime;

      // Tone 1: High alert beep 880Hz
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Tone 2: Low alert tone 440Hz
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, now + 0.12);
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.32);

      await new Promise((resolve) => setTimeout(resolve, 340));
    } catch {
      // AudioContext unavailable
    }
  }, []);

  const broadcastAlert = useCallback(
    async (alertText: string) => {
      if (isSpeakingRef.current) {
        stopAllPlayback();
      }
      await playRadioChime();
      await speak(alertText);
    },
    [playRadioChime, speak, stopAllPlayback]
  );

  const toggleRadio = useCallback(() => {
    setIsRadioActive((prev) => !prev);
  }, []);

  // Window event listener for broadcast alerts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleBroadcastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ text: string }>;
      if (customEvent.detail && customEvent.detail.text) {
        if (isRadioActive) {
          broadcastAlert(customEvent.detail.text);
        }
      }
    };

    window.addEventListener('waypoint:broadcast_alert', handleBroadcastEvent);
    return () => {
      window.removeEventListener('waypoint:broadcast_alert', handleBroadcastEvent);
    };
  }, [isRadioActive, broadcastAlert]);

  const toggleDuplexMode = useCallback(() => {
    setDuplexMode((prev) => (prev === 'full_duplex' ? 'half_duplex' : 'full_duplex'));
  }, []);

  const toggleVoiceProvider = useCallback(() => {
    setVoiceProvider((prev) => (prev === 'elevenlabs' ? 'browser' : 'elevenlabs'));
  }, []);

  return {
    duplexMode,
    voiceProvider,
    isListening,
    isSpeaking,
    isUserSpeaking,
    isInterrupted,
    isRadioActive,
    audioLevel,
    isSupported,
    error,
    startSession,
    stopSession,
    speak,
    cancelSpeech: stopAllPlayback,
    broadcastAlert,
    playRadioChime,
    toggleRadio,
    setIsRadioActive,
    toggleDuplexMode,
    toggleVoiceProvider,
    setDuplexMode,
    setVoiceProvider,
  };
}
