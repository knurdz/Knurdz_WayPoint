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

export function useVoiceAgent() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onResultCallbackRef = useRef<((transcript: string) => void) | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const win = window as WindowWithSpeech;
    const SpeechRecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognitionConstructor) {
      setIsSupported(true);
      try {
        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = false;
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
          setIsListening(false);
          const transcript = event.results?.[0]?.[0]?.transcript;
          if (transcript && onResultCallbackRef.current) {
            onResultCallbackRef.current(transcript);
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
          setError('Could not capture voice input. Please check microphone access or type instead.');
        };

        recognitionRef.current = recognition;
      } catch {
        setIsSupported(false);
      }
    }

    if ('speechSynthesis' in window) {
      setSpeechSynthesisSupported(true);
    }

    return () => {
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

  const startListening = useCallback((onResult: (transcript: string) => void) => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    setError(null);
    onResultCallbackRef.current = onResult;
    try {
      recognitionRef.current.start();
    } catch {
      try {
        recognitionRef.current.abort();
        recognitionRef.current.start();
      } catch {
        setError('Microphone session failed to start.');
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Strip HTML markup for speech output
    const plainText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!plainText) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 1.0;
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

  return {
    isListening,
    isSpeaking,
    isSupported,
    speechSynthesisSupported,
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
