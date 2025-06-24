import { useState } from 'react';

export default function AskAnythingForm({ onSubmit, loading, error }) {
  const [question, setQuestion] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous validation error
    setValidationError('');

    // Debug logging
    console.log('AskAnythingForm: Submitting question:', question);
    console.log('AskAnythingForm: Question trimmed:', question.trim());
    console.log('AskAnythingForm: Question length:', question.length);

    // Validate question
    if (!question.trim()) {
      setValidationError('Please enter a question');
      return;
    }

    if (question.trim().length < 3) {
      setValidationError('Please enter a more detailed question');
      return;
    }

    // Submit the question
    await onSubmit(question.trim());
  };

  const handleInputChange = (e) => {
    setQuestion(e.target.value);
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
    <form onSubmit={handleSubmit} className="ask-anything-form">
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
          
          <textarea
            id="questionInput"
            value={question}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Ask anything..."
            required
            maxLength={2000}
            rows={3}
            aria-describedby="questionError"
            aria-invalid={!!validationError || !!error}
            disabled={loading}
            autoFocus
          />
          <button 
            type="submit" 
            disabled={loading || !question.trim()}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Getting Answer...
              </>
            ) : (
              'Ask'
            )}
          </button>
        </div>
        {validationError && (
          <div id="questionError" role="alert" className="error-message">
            {validationError}
          </div>
        )}
      </div>

      <style jsx>{`
        .ask-anything-form {
          max-width: 800px;
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
          gap: 1rem;
          align-items: flex-start;
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          background: white;
          border: 1px solid #e5e7eb;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1), 
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          backdrop-filter: blur(8px);
          padding: 1.5rem;
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
          0% { transform: translateY(100%) translateX(90%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-20%) translateX(10%); opacity: 0; }
        }

        @keyframes float7 {
          0% { transform: translateY(100%) translateX(60%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-20%) translateX(40%); opacity: 0; }
        }

        @keyframes float8 {
          0% { transform: translateY(100%) translateX(30%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-20%) translateX(60%); opacity: 0; }
        }

        .border-glow {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981);
          border-radius: 20px;
          opacity: 0;
          z-index: -1;
          transition: opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          filter: blur(8px);
        }

        .input-wrapper.focused .border-glow {
          opacity: 0.3;
          animation: borderPulse 3s ease-in-out infinite;
        }

        @keyframes borderPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.02); }
        }

        .gradient-border {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 20px;
          padding: 2px;
          background: linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.3), transparent);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          opacity: 0;
          z-index: -1;
          transition: opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .input-wrapper.focused .gradient-border {
          opacity: 1;
          animation: gradientSpin 4s linear infinite;
        }

        @keyframes gradientSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        textarea {
          flex: 1;
          border: none;
          outline: none;
          font-size: 1.2rem;
          background: transparent;
          resize: vertical;
          min-height: 80px;
          max-height: 200px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.5;
          z-index: 2;
          position: relative;
        }

        textarea::placeholder {
          color: #9ca3af;
          font-size: 1.2rem;
        }

        textarea:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        button {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          min-width: 120px;
          height: fit-content;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          z-index: 2;
          position: relative;
          align-self: flex-end;
        }

        button:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }

        button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .error-message {
          color: #ef4444;
          font-size: 0.9rem;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: slideIn 0.3s ease-out;
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

        .input-wrapper.loading {
          opacity: 0.8;
        }

        .input-wrapper.loading .particles-container {
          opacity: 1;
        }

        .input-wrapper.loading .border-glow {
          opacity: 0.5;
          animation: borderPulse 1.5s ease-in-out infinite;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .ask-anything-form {
            margin: 1rem;
            max-width: none;
          }

          .input-wrapper {
            flex-direction: column;
            padding: 1rem;
            gap: 1rem;
          }

          textarea {
            font-size: 1.1rem;
            min-height: 100px;
          }

          button {
            align-self: stretch;
            padding: 0.875rem 1.5rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </form>
  );
}