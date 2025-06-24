"use client";
import { createContext, useContext, useEffect } from 'react';
import * as amplitude from '@amplitude/analytics-browser';

const AmplitudeContext = createContext({});

export function AmplitudeProvider({ children }) {
  useEffect(() => {
    // Initialize Amplitude with your API key
    const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    amplitude.init(AMPLITUDE_API_KEY, undefined, {
      defaultTracking: {
        sessions: true,
      },
    });
  }, []);

  const trackEvent = (eventName, eventProperties = {}) => {
    amplitude.track(eventName, eventProperties);
  };

  return (
    <AmplitudeContext.Provider value={{ trackEvent }}>
      {children}
    </AmplitudeContext.Provider>
  );
}

export function useAmplitude() {
  const context = useContext(AmplitudeContext);
  if (context === undefined) {
    throw new Error('useAmplitude must be used within an AmplitudeProvider');
  }
  return context;
} 