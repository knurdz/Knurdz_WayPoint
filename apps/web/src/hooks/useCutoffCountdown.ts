'use client';

import { useState, useEffect } from 'react';

export interface CutoffState {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isPastCutoff: boolean;
  urgency: 'normal' | 'warning' | 'critical' | 'passed';
}

export function useCutoffCountdown(): CutoffState {
  const calculate = (): CutoffState => {
    // Current time in SLST (UTC + 05:30)
    const now = new Date();
    const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
    const slstMillis = utcMillis + 5.5 * 3600000;
    const slstDate = new Date(slstMillis);

    const targetDate = new Date(slstMillis);
    targetDate.setHours(16, 0, 0, 0);

    let diffSeconds = Math.floor((targetDate.getTime() - slstDate.getTime()) / 1000);

    if (diffSeconds <= 0) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        formatted: '00:00:00',
        isPastCutoff: true,
        urgency: 'passed',
      };
    }

    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    let urgency: 'normal' | 'warning' | 'critical' = 'normal';
    if (diffSeconds <= 600) {
      urgency = 'critical';
    } else if (diffSeconds <= 1800) {
      urgency = 'warning';
    }

    return {
      hours,
      minutes,
      seconds,
      formatted,
      isPastCutoff: false,
      urgency,
    };
  };

  const [state, setState] = useState<CutoffState>(calculate);

  useEffect(() => {
    const timer = setInterval(() => {
      setState(calculate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return state;
}
