import { useState } from 'react';
import { validateUrl } from '../utils/urlValidator';

export default function URLInputForm({ onSubmit, loading, error }) {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous validation errorx
    setValidationError('');

    // Debug logging
    console.log('URLInputForm: Submitting URL:', url);
    console.log('URLInputForm: URL trimmed:', url.trim());
    console.log('URLInputForm: URL length:', url.length);

    // Validate URL
    const validation = validateUrl(url);
    console.log('URLInputForm: Validation result:', validation);
    
    if (!validation.isValid) {  
      setValidationError(validation.error);
      return;
    }

    // Submit the normalized URL (which includes auto-added protocol)
    await onSubmit(validation.normalizedUrl);
  };

  const handleInputChange = (e) => {
    setUrl(e.target.value);
    // Clear validation error when user types
    if (validationError) {
      setValidationError('');
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <form onSubmit={handleSubmit} className="url-form">
      <div className="form-group">
        <div className={`input-wrapper ${isFocused ? 'focused' : ''} ${loading ? 'loading' : ''}`}>
          {/* Animated background particles */}
          <div className="particles-container">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`particle particle-${i + 1}`}></div>
            ))}
          </div>
          
          {/* Animated border glow */}
          <div className="border-glow"></div>
          
          {/* Gradient border animation */}
          <div className="gradient-border"></div>
          
          <input
            type="text"
            id="urlInput"
            value={url}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="example.com"
            required
            maxLength={2048}
            aria-describedby="urlError"
            aria-invalid={!!validationError || !!error}
            disabled={loading}
            autoFocus
          />
          <button 
            type="submit" 
            disabled={loading || !url.trim()}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Loading...
              </>
            ) : (
              'Add Widget'
            )}
          </button>
        </div>
        {validationError && (
          <div id="urlError" role="alert" className="error-message">
            {validationError}
          </div>
        )}
      </div>



      <style jsx>{`
        .url-form {
          max-width: 600px;
          margin: 2rem auto;
          position: relative;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: white;
          font-size: 1.1rem;
        }

        .input-wrapper {
          display: flex;
          gap: 0.5rem;
          align-items: stretch;
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          background: white;
          border: 1px solid #e5e7eb;
          box-shadow: 
            0 1px 3px 0 rgba(0, 0, 0, 0.1), 
            0 1px 2px 0 rgba(0, 0, 0, 0.06);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          backdrop-filter: blur(8px);
        }

        /* Particles Container */
        .particles-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0;
          transition: opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .input-wrapper.focused .particles-container {
          opacity: 0.8;
        }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0.4) 50%, transparent 80%);
          border-radius: 50%;
          animation-duration: 5s;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }

        .particle-1 { animation: float1 5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite; animation-delay: 0s; }
        .particle-2 { animation: float2 5.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite; animation-delay: 0.3s; }
        .particle-3 { animation: float3 4.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite; animation-delay: 0.6s; }
        .particle-4 { animation: float4 5.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite; animation-delay: 0.9s; }
        .particle-5 { animation: float5 4.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite; animation-delay: 1.2s; }
        .particle-6 { animation: float6 5.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite; animation-delay: 1.5s; }
        .particle-7 { animation: float7 5.1s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite; animation-delay: 1.8s; }
        .particle-8 { animation: float8 4.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite; animation-delay: 2.1s; }

        @keyframes float1 {
          0% { transform: translateY(100%) translateX(10%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-20%) translateX(90%); opacity: 0; }
        }

        @keyframes float2 {
          0% { transform: translateY(100%) translateX(80%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-20%) translateX(20%); opacity: 0; }
        }

        @keyframes float3 {
          0% { transform: translateY(100%) translateX(40%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-20%) translateX(70%); opacity: 0; }
        }

        @keyframes float4 {
          0% { transform: translateY(100%) translateX(70%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-20%) translateX(30%); opacity: 0; }
        }

        @keyframes float5 {
          0% { transform: translateY(100%) translateX(20%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-20%) translateX(80%); opacity: 0; }
        }

        @keyframes float6 {
          0% { transform: translateY(100%) translateX(60%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-20%) translateX(15%); opacity: 0; }
        }

        @keyframes float7 {
          0% { transform: translateY(100%) translateX(35%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-20%) translateX(85%); opacity: 0; }
        }

        @keyframes float8 {
          0% { transform: translateY(100%) translateX(85%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-20%) translateX(40%); opacity: 0; }
        }

        @keyframes float9 {
          0% { transform: translateY(100%) translateX(15%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-20%) translateX(75%); opacity: 0; }
        }

        @keyframes float10 {
          0% { transform: translateY(100%) translateX(75%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-20%) translateX(25%); opacity: 0; }
        }

        @keyframes float11 {
          0% { transform: translateY(100%) translateX(25%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-20%) translateX(60%); opacity: 0; }
        }

        @keyframes float12 {
          0% { transform: translateY(100%) translateX(50%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-20%) translateX(10%); opacity: 0; }
        }

        /* Subtle Border Glow Effect */
        .border-glow {
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(29, 78, 216, 0.2));
          border-radius: 17px;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .input-wrapper.focused .border-glow {
          opacity: 1;
        }

        .input-wrapper.loading .border-glow {
          opacity: 1;
          animation: subtlePulse 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }

        @keyframes subtlePulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.7;
          }
          50% { 
            transform: scale(1.005);
            opacity: 1;
          }
        }

        /* Ripple Effect */
        .gradient-border {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 40%, transparent 70%);
          border-radius: 50%;
          z-index: 0;
          opacity: 0;
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .input-wrapper.focused .gradient-border {
          width: 140%;
          height: 140%;
          opacity: 1;
        }

        /* Input and Button Styling */
        input {
          flex: 1;
          padding: 0.875rem 1.25rem;
          font-size: 1rem;
          border: none;
          background: transparent;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          font-family: inherit;
          position: relative;
          z-index: 3;
          color: #374151;
          font-weight: 400;
          letter-spacing: -0.01em;
        }

        input:focus {
          outline: none;
          transform: none;
        }

        input:disabled {
          background: rgba(245, 245, 245, 0.8);
          cursor: not-allowed;
        }

        input[aria-invalid="true"] {
          background: rgba(254, 242, 242, 0.9);
        }

        input::placeholder {
          color: #9ca3af;
          transition: color 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          font-weight: 400;
        }

        .input-wrapper.focused input::placeholder {
          color: rgba(59, 130, 246, 0.6);
        }

        button {
          padding: 0.875rem 1.75rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
          position: relative;
          z-index: 3;
          overflow: hidden;
          letter-spacing: -0.01em;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s ease;
        }

        button:hover:not(:disabled)::before {
          left: 100%;
        }

        button:hover:not(:disabled) {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
          transform: translateY(-1px);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 10px 15px -3px rgba(59, 130, 246, 0.4);
        }

        button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        button:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-message {
          margin-top: 0.5rem;
          color: #dc3545;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: slideIn 0.3s ease-out;
        }

        .error-message::before {
          content: "⚠️";
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Enhanced Focus State */
        .input-wrapper.focused {
          transform: translateY(-1px);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 8px 25px rgba(59, 130, 246, 0.15),
            0 0 0 1px rgba(59, 130, 246, 0.1);
        }

        /* Loading State Enhancements */
        .input-wrapper.loading {
          border-color: rgba(59, 130, 246, 0.4);
          animation: loadingPulse 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }

        @keyframes loadingPulse {
          0%, 100% { 
            transform: translateY(0);
            box-shadow: 
              0 1px 3px 0 rgba(0, 0, 0, 0.1), 
              0 1px 2px 0 rgba(0, 0, 0, 0.06),
              0 0 0 1px rgba(59, 130, 246, 0.2);
          }
          50% { 
            transform: translateY(-0.5px);
            box-shadow: 
              0 4px 6px -1px rgba(0, 0, 0, 0.1), 
              0 2px 4px -1px rgba(0, 0, 0, 0.06),
              0 8px 20px rgba(59, 130, 246, 0.2),
              0 0 0 2px rgba(59, 130, 246, 0.3);
          }
        }

        @media (max-width: 640px) {
          .input-wrapper {
            flex-direction: column;
          }

          button {
            width: 100%;
            justify-content: center;
          }

          .particles-container {
            display: none; /* Hide particles on mobile for performance */
          }
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .particle,
          .border-glow,
          .gradient-border,
          .input-wrapper {
            animation: none !important;
          }
          
          .input-wrapper.focused {
            transform: none;
          }
          
          button:hover:not(:disabled) {
            transform: none;
          }
        }
      `}</style>
    </form>
  );
}