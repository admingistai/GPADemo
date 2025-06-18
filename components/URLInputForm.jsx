import { useState } from 'react';
import { validateUrl } from '../utils/urlValidator';

export default function URLInputForm({ onSubmit, loading, error }) {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous validation error
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
            {Array.from({ length: 12 }).map((_, i) => (
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
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
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
          transition: opacity 0.4s ease;
        }

        .input-wrapper.focused .particles-container {
          opacity: 1;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, #60a5fa 0%, #3b82f6 50%, transparent 70%);
          border-radius: 50%;
          animation-duration: 3s;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .particle-1 { animation: float1 3s linear infinite; }
        .particle-2 { animation: float2 3.2s linear infinite; }
        .particle-3 { animation: float3 2.8s linear infinite; }
        .particle-4 { animation: float4 3.5s linear infinite; }
        .particle-5 { animation: float5 2.9s linear infinite; }
        .particle-6 { animation: float6 3.3s linear infinite; }
        .particle-7 { animation: float7 3.1s linear infinite; }
        .particle-8 { animation: float8 2.7s linear infinite; }
        .particle-9 { animation: float9 3.4s linear infinite; }
        .particle-10 { animation: float10 2.6s linear infinite; }
        .particle-11 { animation: float11 3.6s linear infinite; }
        .particle-12 { animation: float12 2.5s linear infinite; }

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

        /* Border Glow Effect */
        .border-glow {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #60a5fa, #a855f7, #ec4899, #f59e0b, #60a5fa);
          background-size: 400% 400%;
          border-radius: 14px;
          z-index: -1;
          opacity: 0;
          animation: gradientShift 4s ease infinite;
          transition: opacity 0.3s ease;
        }

        .input-wrapper.focused .border-glow {
          opacity: 0.6;
        }

        .input-wrapper.loading .border-glow {
          opacity: 0.8;
          animation: gradientShift 2s ease infinite, pulse 1.5s ease-in-out infinite;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        /* Gradient Border Animation */
        .gradient-border {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            #60a5fa 90deg,
            transparent 180deg,
            #a855f7 270deg,
            transparent 360deg
          );
          border-radius: 12px;
          z-index: -1;
          opacity: 0;
          animation: rotate 3s linear infinite;
          transition: opacity 0.3s ease;
        }

        .input-wrapper.focused .gradient-border {
          opacity: 0.3;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Input and Button Styling */
        input {
          flex: 1;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          border: none;
          background: transparent;
          border-radius: 6px;
          transition: all 0.2s;
          font-family: inherit;
          position: relative;
          z-index: 2;
        }

        input:focus {
          outline: none;
          transform: scale(1.01);
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
          transition: color 0.2s ease;
        }

        .input-wrapper.focused input::placeholder {
          color: #60a5fa;
        }

        button {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #0070f3 0%, #0051cc 100%);
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
          position: relative;
          z-index: 2;
          overflow: hidden;
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
          background: linear-gradient(135deg, #0051cc 0%, #003d99 100%);
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 25px rgba(0, 112, 243, 0.3);
        }

        button:active:not(:disabled) {
          transform: translateY(0) scale(1);
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
          transform: scale(1.02);
          box-shadow: 
            0 10px 30px rgba(96, 165, 250, 0.2),
            0 0 0 1px rgba(96, 165, 250, 0.3);
        }

        /* Loading State Enhancements */
        .input-wrapper.loading {
          animation: loadingPulse 2s ease-in-out infinite;
        }

        @keyframes loadingPulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
          }
          50% { 
            box-shadow: 0 0 40px rgba(96, 165, 250, 0.6);
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