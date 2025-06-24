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
      console.log('🔄 Initializing Amplitude...');
      amplitude.init(AMPLITUDE_API_KEY, {
        logLevel: amplitude.Types.LogLevel.Debug, // Enable debug logs
        defaultTracking: {
          sessions: true,
        }
      });
      console.log('✅ Amplitude initialized successfully');
    } catch (error) {
      console.log('❌ Amplitude initialization failed:', error);
      setIsAmplitudeBlocked(true);
    }
  }, []);

  const trackEvent = async (eventName, eventProperties = {}) => {
    console.log('📊 Attempting to track event:', { eventName, eventProperties });
    
    if (isAmplitudeBlocked) {
      console.log('⚠️ Amplitude is blocked, skipping event tracking');
      return;
    }

    try {
      await amplitude.track(eventName, eventProperties);
      console.log('✅ Event tracked successfully:', {
        name: eventName,
        properties: eventProperties,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.log('❌ Failed to track event:', error);
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