import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

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
    <div className="app">
      <Head>
        <title>Generate Your Ask Anything Button | Gist AI</title>
        <meta name="description" content="Configure your Ask Anything button settings and get started in minutes" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      {/* Header from landing page */}
      <header className="header">
        <Link href="/" className="logo-section">
          <Image 
            src="/icon.png" 
            alt="Gist AI Logo" 
            width={28} 
            height={28} 
            className="logo"
          />
          <span className="brand-name">Gist AI</span>
        </Link>
        
        <nav className="nav">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#about">About</a>
        </nav>
        
        <div className="header-actions">
          <a href="/login" className="login-btn">Login</a>
          <a href="/" className="demo-btn">Back to Home</a>
        </div>
      </header>

      {/* Main Content */}
      <main className="signup-container">
        <div className="signup-content">
          {/* Title Section */}
          <div className="signup-header">
            <h1 className="signup-title">
              Generate Your Ask Anything Button<span className="cursor"></span>
            </h1>
            <p className="signup-subtitle">
              Configure your Ask Anything button settings and get started in minutes
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleGenerate} className="signup-form">
            {/* Your Information Card */}
            <div className="form-card">
              <h2 className="card-title">Your Information</h2>
              
              <div className="form-field">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label htmlFor="website">Website URL</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                  required
                  className="form-input"
                />
              </div>
            </div>

            {/* Widget Features Card */}
            <div className="form-card">
              <h2 className="card-title">Widget Features</h2>
              
              <div className="features-grid">
                <label className={`feature-option ${features.summarize ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={features.summarize}
                    onChange={() => handleFeatureToggle('summarize')}
                    className="feature-checkbox"
                  />
                  <span className="custom-checkbox"></span>
                  <div className="feature-info">
                    <h3>Summarize</h3>
                    <p>AI-powered article summaries</p>
                  </div>
                </label>

                <label className={`feature-option ${features.relatedQuestions ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={features.relatedQuestions}
                    onChange={() => handleFeatureToggle('relatedQuestions')}
                    className="feature-checkbox"
                  />
                  <span className="custom-checkbox"></span>
                  <div className="feature-info">
                    <h3>Related Questions</h3>
                    <p>Instantly get related questions and answers</p>
                  </div>
                </label>

                <label className={`feature-option ${features.readAloud ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={features.readAloud}
                    onChange={() => handleFeatureToggle('readAloud')}
                    className="feature-checkbox"
                  />
                  <span className="custom-checkbox"></span>
                  <div className="feature-info">
                    <h3>Read Aloud</h3>
                    <p>Listen to content with text-to-speech</p>
                  </div>
                </label>

                <label className={`feature-option ${features.goDeeper ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={features.goDeeper}
                    onChange={() => handleFeatureToggle('goDeeper')}
                    className="feature-checkbox"
                  />
                  <span className="custom-checkbox"></span>
                  <div className="feature-info">
                    <h3>Go Deeper</h3>
                    <p>Get in-depth explanations and context</p>
                  </div>
                </label>
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
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #000;
          color: #fff;
          min-height: 100vh;
        }

        /* Header - copied from landing page */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 3rem;
          position: sticky;
          top: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          z-index: 100;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: inherit;
          transition: opacity 0.2s ease;
        }

        .logo-section:hover {
          opacity: 0.8;
        }

        .logo {
          height: 28px;
          width: auto;
        }

        .brand-name {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .nav {
          display: flex;
          gap: 2.5rem;
        }

        .nav a {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.2s;
        }

        .nav a:hover {
          color: #fff;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .login-btn {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          padding: 0.5rem 1rem;
          transition: color 0.2s;
        }

        .login-btn:hover {
          color: #fff;
        }

        .demo-btn {
          background: #fff;
          color: #000;
          border: none;
          padding: 0.6rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
        }

        .demo-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
        }

        /* Main Signup Container */
        .signup-container {
          padding: 4rem 2rem;
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .signup-content {
          width: 100%;
          max-width: 600px;
        }

        /* Header Section */
        .signup-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .signup-title {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
          color: #fff;
          position: relative;
          display: inline-block;
        }

        /* Blinking cursor animation */
        .cursor {
          display: inline-block;
          width: 3px;
          height: 1.2em;
          background: #fff;
          margin-left: 2px;
          animation: blink 1s step-end infinite;
          vertical-align: text-bottom;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }

        .signup-subtitle {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
        }

        /* Form Styles */
        .signup-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-card {
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          transition: all 0.3s ease;
        }

        .form-card:hover {
          border-color: rgba(255, 255, 255, 0.15);
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #fff;
        }

        .form-field {
          margin-bottom: 1.25rem;
        }

        .form-field:last-child {
          margin-bottom: 0;
        }

        .form-field label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.5rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .feature-option {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .feature-option:hover {
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .feature-option.active {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }

        .feature-checkbox {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .custom-checkbox {
          position: relative;
          width: 20px;
          height: 20px;
          background: #0a0a0a;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          transition: all 0.2s ease;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .feature-option.active .custom-checkbox {
          background: #667eea;
          border-color: #667eea;
        }

        .feature-option.active .custom-checkbox::after {
          content: '';
          position: absolute;
          left: 6px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .feature-info h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.25rem;
        }

        .feature-info p {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.3;
        }

        /* Generate Button */
        .generate-button {
          width: 100%;
          padding: 1rem 2rem;
          margin-top: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
          letter-spacing: 0.5px;
        }

        .generate-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        }

        .generate-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .generate-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .generate-button.generating {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .header {
            padding: 1rem 1.5rem;
          }

          .nav {
            display: none;
          }

          .signup-title {
            font-size: 2rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .form-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}