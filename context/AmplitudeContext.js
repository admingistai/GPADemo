"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import * as amplitude from '@amplitude/analytics-browser';

const AmplitudeContext = createContext({});

export function AmplitudeProvider({ children }) {
  const [isAmplitudeBlocked, setIsAmplitudeBlocked] = useState(false);

  useEffect(() => {
    // Initialize Amplitude with your API key
    const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    try {
      amplitude.init(AMPLITUDE_API_KEY, undefined, {
        defaultTracking: {
          sessions: true,
        },
        logLevel: amplitude.Types.LogLevel.None, // Suppress console logs
        transportProvider: {
          send: async (payload) => {
            try {
              const response = await fetch('https://api2.amplitude.com/2/httpapi', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': '*/*'
                },
                body: JSON.stringify(payload)
              });
              if (!response.ok) throw new Error('Failed to send analytics');
              return response;
            } catch (error) {
              // Silently fail if blocked by content blocker
              setIsAmplitudeBlocked(true);
              return null;
            }
          }
        }
      });
    } catch (error) {
      // Silently handle initialization errors
      setIsAmplitudeBlocked(true);
    }
  }, []);

  const trackEvent = (eventName, eventProperties = {}) => {
    if (isAmplitudeBlocked) {
      // Silently skip tracking if Amplitude is blocked
      return;
    }
    try {
      amplitude.track(eventName, eventProperties);
    } catch (error) {
      // Silently handle tracking errors
      setIsAmplitudeBlocked(true);
    }
  };

  return (
    <AmplitudeContext.Provider value={{ trackEvent, isAmplitudeBlocked }}>
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