"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import * as amplitude from '@amplitude/analytics-browser';

const AmplitudeContext = createContext({});

export function AmplitudeProvider({ children }) {
  const [isAmplitudeBlocked, setIsAmplitudeBlocked] = useState(false);

  useEffect(() => {
    const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
    
    // Debug API key
    console.log('🔑 Checking Amplitude API key:', 
      AMPLITUDE_API_KEY ? 'Key exists' : 'Key is missing',
      'Length:', AMPLITUDE_API_KEY?.length || 0
    );

    if (!AMPLITUDE_API_KEY) {
      console.error('❌ Amplitude API key is missing');
      setIsAmplitudeBlocked(true);
      return;
    }

    try {
      console.log('🔄 Initializing Amplitude...');
      
      // Initialize with debug mode and proper configuration
      amplitude.init(AMPLITUDE_API_KEY, undefined, {
        logLevel: amplitude.Types.LogLevel.Debug,
        defaultTracking: {
          sessions: true,
          pageViews: true,
          formInteractions: true,
          fileDownloads: true,
        },
        minIdLength: 1,
        serverUrl: 'https://api2.amplitude.com/2/httpapi',
        serverZone: 'US',
        useBatch: false, // Disable batching for immediate sending
        debug: true
      });

      // Verify initialization
      const instanceName = amplitude.getInstanceName();
      console.log('✅ Amplitude initialized successfully with instance:', instanceName);
      
    } catch (error) {
      console.error('❌ Amplitude initialization failed:', error);
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
      // Add timestamp and session ID to properties
      const enhancedProperties = {
        ...eventProperties,
        timestamp: Date.now(),
        sessionId: amplitude.getSessionId()
      };

      await amplitude.track(eventName, enhancedProperties);
      console.log('✅ Event tracked successfully:', {
        name: eventName,
        properties: enhancedProperties,
        instanceName: amplitude.getInstanceName(),
        sessionId: amplitude.getSessionId()
      });
    } catch (error) {
      console.error('❌ Failed to track event:', error);
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