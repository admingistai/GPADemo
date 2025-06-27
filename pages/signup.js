import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: ''
  });
  const [features, setFeatures] = useState({
    summarize: true,
    relatedQuestions: true,
    readAloud: true,
    goDeeper: true
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFeatureToggle = (feature) => {
    setFeatures({
      ...features,
      [feature]: !features[feature]
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      // Store configuration in localStorage for now
      localStorage.setItem('widgetConfig', JSON.stringify({
        ...formData,
        features
      }));
      
      // Redirect to setup page
      router.push('/setup');
    }, 1500);
  };

  return (
    <div className="container">
      <Head>
        <title>Generate Your Ask Anything Button | Gist AI</title>
        <meta name="description" content="Configure your Ask Anything button settings and get started in minutes" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main className="main">
        {/* Header */}
        <div className="header-section">
          <h1 className="main-title">
            Generate Your Ask Anything Button
          </h1>
          <p className="subtitle">
            Configure your Ask Anything button settings and get started in minutes
          </p>
        </div>

        {/* Form Container */}
        <div className="form-container">
          <form onSubmit={handleGenerate}>
            {/* Your Information Card */}
            <div className="card">
              <h2 className="card-title">Your Information</h2>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="website">Website URL</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                  required
                />
              </div>
            </div>

            {/* Widget Features Card */}
            <div className="card">
              <h2 className="card-title">Widget Features</h2>
              <div className="features-grid">
                <div 
                  className={`feature-item ${features.summarize ? 'active' : ''}`}
                  onClick={() => handleFeatureToggle('summarize')}
                >
                  <input
                    type="checkbox"
                    checked={features.summarize}
                    onChange={() => {}}
                    className="feature-checkbox"
                  />
                  <div className="feature-content">
                    <h3>Summarize</h3>
                    <p>AI-powered article summaries</p>
                  </div>
                </div>

                <div 
                  className={`feature-item ${features.relatedQuestions ? 'active' : ''}`}
                  onClick={() => handleFeatureToggle('relatedQuestions')}
                >
                  <input
                    type="checkbox"
                    checked={features.relatedQuestions}
                    onChange={() => {}}
                    className="feature-checkbox"
                  />
                  <div className="feature-content">
                    <h3>Related Questions</h3>
                    <p>Instantly get related questions and answers</p>
                  </div>
                </div>

                <div 
                  className={`feature-item ${features.readAloud ? 'active' : ''}`}
                  onClick={() => handleFeatureToggle('readAloud')}
                >
                  <input
                    type="checkbox"
                    checked={features.readAloud}
                    onChange={() => {}}
                    className="feature-checkbox"
                  />
                  <div className="feature-content">
                    <h3>Read Aloud</h3>
                    <p>Listen to content with text-to-speech</p>
                  </div>
                </div>

                <div 
                  className={`feature-item ${features.goDeeper ? 'active' : ''}`}
                  onClick={() => handleFeatureToggle('goDeeper')}
                >
                  <input
                    type="checkbox"
                    checked={features.goDeeper}
                    onChange={() => {}}
                    className="feature-checkbox"
                  />
                  <div className="feature-content">
                    <h3>Go Deeper</h3>
                    <p>Get in-depth explanations and context</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button 
              type="submit" 
              className={`generate-button ${isGenerating ? 'generating' : ''}`}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </form>
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .main {
          padding: 4rem 2rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .header-section {
          text-align: center;
          margin-bottom: 4rem;
        }

        .main-title {
          font-size: 3.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #f97316 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1rem;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .subtitle {
          font-size: 1.25rem;
          color: #9ca3af;
          line-height: 1.6;
        }

        .form-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .card {
          background: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .card-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 2rem;
          color: #ffffff;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #9ca3af;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-group input {
          width: 100%;
          padding: 0.875rem 1.25rem;
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #ffffff;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        .form-group input::placeholder {
          color: #6b7280;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .feature-item {
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .feature-item:hover {
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .feature-item.active {
          border-color: #f97316;
          background: rgba(249, 115, 22, 0.05);
        }

        .feature-checkbox {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          margin-top: 2px;
          accent-color: #f97316;
          cursor: pointer;
        }

        .feature-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }

        .feature-content p {
          font-size: 0.875rem;
          color: #9ca3af;
          line-height: 1.4;
        }

        .generate-button {
          width: 100%;
          padding: 1.25rem 2rem;
          background: linear-gradient(135deg, #f97316 0%, #8b5cf6 100%);
          color: #ffffff;
          border: none;
          border-radius: 50px;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(249, 115, 22, 0.3);
          letter-spacing: 0.5px;
          margin-top: 2rem;
        }

        .generate-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(249, 115, 22, 0.4);
        }

        .generate-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .generate-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .generate-button.generating {
          background: linear-gradient(135deg, #f97316 0%, #8b5cf6 100%);
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.8; }
          100% { opacity: 1; }
        }

        @media (max-width: 768px) {
          .main-title {
            font-size: 2.5rem;
          }

          .subtitle {
            font-size: 1.125rem;
          }

          .card {
            padding: 2rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .feature-item {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}