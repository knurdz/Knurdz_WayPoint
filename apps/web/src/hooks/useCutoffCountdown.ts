'use client';

import { useState, useEffect } from 'react';

export interface CutoffState {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isPastCutoff: boolean;
  urgency: 'normal' | 'warning' | 'critical' | 'passed';
  mounted: boolean;
}

const DEFAULT_STATE: CutoffState = {
  hours: 0,
  minutes: 0,
  seconds: 0,
  formatted: '16:00 SLST',
  isPastCutoff: false,
  urgency: 'normal',
  mounted: false,
};

export function useCutoffCountdown(): CutoffState {
  const calculate = (): Omit<CutoffState, 'mounted'> => {
    const now = new Date();
    const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
    const slstMillis = utcMillis + 5.5 * 3600000;
    const slstDate = new Date(slstMillis);

    const targetDate = new Date(slstMillis);
    targetDate.setHours(16, 0, 0, 0);

    const diffSeconds = Math.floor((targetDate.getTime() - slstDate.getTime()) / 1000);

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

  const [state, setState] = useState<CutoffState>(DEFAULT_STATE);

  useEffect(() => {
    setState({ ...calculate(), mounted: true });
    const timer = setInterval(() => {
      setState({ ...calculate(), mounted: true });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return state;
}
