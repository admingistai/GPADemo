import * as amplitude from '@amplitude/analytics-browser';

// Initialize Amplitude with configuration
export const initAnalytics = (apiKey) => {
  if (!apiKey) {
    console.warn('Amplitude API key not found');
    return;
  }
  
  try {
    amplitude.init(apiKey, undefined, {
      defaultTracking: {
        sessions: true,
        pageViews: true,
        formInteractions: true,
        fileDownloads: true
      }
    });
  } catch (error) {
    console.error('Failed to initialize Amplitude:', error);
  }
};

// Export amplitude instance for direct usage
export { amplitude };

// Track page views
export const trackPageView = (pageName, properties = {}) => {
  amplitude.track('Page Viewed', {
    page_name: pageName,
    ...properties
  });
};

// Track feature toggles
export const trackFeatureToggle = (featureName, isEnabled) => {
  amplitude.track('Feature Toggled', {
    feature_name: featureName,
    is_enabled: isEnabled
  });
};

// Track form submissions
export const trackFormSubmission = (formName, success = true, properties = {}) => {
  amplitude.track('Form Submitted', {
    form_name: formName,
    success,
    ...properties
  });
};

// Track button clicks
export const trackButtonClick = (buttonName, properties = {}) => {
  amplitude.track('Button Clicked', {
    button_name: buttonName,
    ...properties
  });
};

// Set user properties
export const setUserProperties = (properties) => {
  amplitude.setUserProperties(properties);
};

// Identify user
export const identifyUser = (userId, properties = {}) => {
  amplitude.setUserId(userId);
  if (Object.keys(properties).length > 0) {
    setUserProperties(properties);
  }
}; 