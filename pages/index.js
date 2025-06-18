import { useState, useEffect } from 'react';
import URLInputForm from '../components/URLInputForm';
import WebsiteDisplay from '../components/WebsiteDisplay';
import ErrorDisplay from '../components/ErrorDisplay';

export default function Home() {
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showWebsite, setShowWebsite] = useState(false);
  const [showFeatureSelection, setShowFeatureSelection] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState({
    recommendedQuestions: true,
    gist: true,
    askAnything: true,
    augmentedAnswers: false,
    goDeeper: false,
    ethicalAds: false,
    customVoices: false,
    remixing: false,
    addToDaily: false,
    augmentedSharing: false,
    customAgents: false,
    futureProofing: false
  });

  // Simplified scroll animation effects
  useEffect(() => {
    const handleScroll = () => {
      const animateOnScroll = document.querySelectorAll('.animate-on-scroll');
      animateOnScroll.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('animate-visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run once on mount
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showWebsite, showFeatureSelection, showLoadingScreen]);

  const handleUrlSubmit = async (url) => {
    try {
      setLoading(true);
      setError(null);
      setShowWebsite(false);
      
      const testResponse = await fetch(`/api/proxy?url=${encodeURIComponent(url)}&test=true`);
      const testResult = await testResponse.json();

      if (!testResponse.ok) {
        throw new Error(testResult.error || 'Unable to reach the specified website');
      }

      setTargetUrl(url);
      setShowFeatureSelection(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setShowWebsite(false);
    setShowFeatureSelection(false);
    setShowLoadingScreen(false);
    setTargetUrl('');
  };

  const handleFeatureToggle = (feature) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const handleGenerateWidget = () => {
    setShowFeatureSelection(false);
    setShowLoadingScreen(true);
    
    setTimeout(() => {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
      window.open(proxyUrl, '_blank', 'noopener,noreferrer');
      
              setTimeout(() => {
          setShowLoadingScreen(false);
          setTargetUrl('');
          setSelectedFeatures({
            recommendedQuestions: true,
            gist: true,
            askAnything: true,
            augmentedAnswers: false,
            goDeeper: false,
            ethicalAds: false,
            customVoices: false,
            remixing: false,
            addToDaily: false,
            augmentedSharing: false,
            customAgents: false,
            futureProofing: false
          });
        }, 1000);
    }, 7000);
  };

  return (
    <div className="app">
      {/* Feature Selection Screen */}
      {showFeatureSelection && (
        <section className="feature-selection">
          <div className="container">
            <div className="feature-header">
              <img src="/gist-logo.png" alt="Gist Logo" className="feature-logo" />
              <h1>Configure Your AI Companion</h1>
              <p>Choose from AI solutions built specifically for publishers. Deploy in minutes:</p>
            </div>
            
            <div className="features-grid">
              {/* Available Features */}
              {[
                { key: 'askAnything', icon: '🤖', title: 'Ask Anything', desc: 'Site-wide conversational box designed to match your brand, trained on your archive.' },
                { key: 'gist', icon: '📝', title: 'The Gist', desc: 'One-sentence AI summary of any story; instant context for skimmers; proven to reduce bounce.' },
                { key: 'remixing', icon: '🎨', title: 'Remixing', desc: 'Auto-converts articles into share-ready cards, reels, and threads; boosts organic reach without extra editing.' },
                { key: 'augmentedSharing', icon: '📤', title: 'Augmented Sharing', desc: 'Generates pre-written social posts and on-scroll highlights with backlinks; simplifies promotion, tracks attribution.' }
              ].map(feature => (
                <div key={feature.key} 
                     className={`feature-card ${selectedFeatures[feature.key] ? 'selected' : ''}`} 
                     onClick={() => handleFeatureToggle(feature.key)}>
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                  <div className="toggle-indicator">
                    {selectedFeatures[feature.key] ? '✓' : '+'}
                  </div>
                </div>
              ))}

              {/* Coming Soon Features */}
              {[
                { key: 'recommendedQuestions', icon: '💡', title: 'Recommended Questions', desc: 'Auto-generates the most asked follow-ups; placed inline to guide exploration; lifts page views per visit.', comingSoon: true },
                { key: 'augmentedAnswers', icon: '🔗', title: 'Augmented Answers', desc: 'Enriches replies with fully-licensed partner sources; citations included; maintains editorial trust.', comingSoon: true },
                { key: 'goDeeper', icon: '🔍', title: 'Go Deeper', desc: 'One-click expandable sidebars with related articles, data, and media; extends time-on-page.', comingSoon: true },
                { key: 'ethicalAds', icon: '💰', title: 'Earn More with Ethical Ads', desc: 'Privacy-safe generative ad units matched to content intent; new revenue stream, no user tracking.', comingSoon: true },
                { key: 'customVoices', icon: '🎭', title: 'Custom Voices & Avatars', desc: 'Branded TTS and 3-D presenter options; consistent tone across text, audio, and video.', comingSoon: true },
                { key: 'addToDaily', icon: '📅', title: 'Add to "My Daily"', desc: 'Opt-in to a personalized site-wide or network-wide daily digest that pulls your latest pieces into readers\' personalized, customized news feed; drives habitual return traffic and incremental revenue.', comingSoon: true },
                { key: 'customAgents', icon: '🤖', title: 'Custom Publisher Agents', desc: 'Build task-specific, goal-oriented AI companions (e.g., paywall support, live events); full control over scope, tone, and data.', comingSoon: true },
                { key: 'futureProofing', icon: '🚀', title: 'Future Proofing', desc: 'One integration spins up an MCP server that: (1) exposes bot-friendly endpoints for GEO/AEO mention boosts, (2) surfaces structured answers search engines favor, and (3) lets trusted third-party AI agents transact safely on-site—opening additive revenue streams while you keep full data control.', comingSoon: true }
              ].map(feature => (
                <div key={feature.key} 
                     className={`feature-card ${selectedFeatures[feature.key] ? 'selected' : ''} coming-soon`} 
                     onClick={() => handleFeatureToggle(feature.key)}>
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                  <div className="coming-soon-badge">Coming Soon</div>
                  <div className="toggle-indicator">
                    {selectedFeatures[feature.key] ? '✓' : '+'}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="feature-actions">
              <button onClick={handleRetry} className="btn-secondary">← Back</button>
              <button onClick={handleGenerateWidget} className="btn-primary">
                Generate Widget ({Object.values(selectedFeatures).filter(Boolean).length} features)
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Loading Screen */}
      {showLoadingScreen && (
        <section className="loading-screen">
          <div className="container">
            <div className="loading-content">
              <img src="/gist-logo.png" alt="Gist Logo" className="loading-logo" />
              <h2>Creating Your AI Companion</h2>
              <div className="loading-steps">
                {Object.entries(selectedFeatures)
                  .filter(([_, isSelected]) => isSelected)
                  .map(([key, _], index) => {
                    const featureNames = {
                      askAnything: '🤖 Setting up Ask Anything conversational AI',
                      gist: '📝 Configuring The Gist summary engine',
                      remixing: '🎨 Preparing content remixing tools',
                      augmentedSharing: '📤 Enabling augmented sharing features',
                      recommendedQuestions: '💡 Training question generator AI',
                      augmentedAnswers: '🔗 Connecting licensed partner sources',
                      goDeeper: '🔍 Building expandable sidebar engine',
                      ethicalAds: '💰 Setting up privacy-safe ad units',
                      customVoices: '🎭 Configuring branded TTS and avatars',
                      addToDaily: '📅 Creating personalized digest system',
                      customAgents: '🤖 Building custom publisher agents',
                      futureProofing: '🚀 Deploying MCP server integration'
                    };
                    return (
                      <div key={key} className="loading-step">
                        <div className="step-icon">✓</div>
                        <span>{featureNames[key]}</span>
                      </div>
                    );
                  })
                }
              </div>
              <div className="loading-bar">
                <div className="loading-progress"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Landing Page */}
      {!showWebsite && !showFeatureSelection && !showLoadingScreen && (
        <>
          {/* Hero Section */}
          <section className="hero">
            <div className="container">
              <div className="hero-content">
                <img src="/gist-logo.png" alt="Gist Logo" className="hero-logo" />
                <h1>Turn Any Website into an AI-Powered Experience</h1>
                <p className="hero-subtitle">
                  Add an intelligent AI companion to any website in minutes. See how it transforms user engagement.
                </p>
                
                <div className="url-input-section">
                  <URLInputForm 
                    onSubmit={handleUrlSubmit} 
                    loading={loading}
                    error={error}
                  />
                  {error && (
                    <ErrorDisplay 
                      error={error} 
                      onRetry={handleRetry}
                    />
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="features">
            <div className="container">
              <h2 className="section-title">Why Choose Our AI Companion</h2>
              
              <div className="features-list">
                {[
                  {
                    title: "100% Licensed Content Sources",
                    description: "All answers sourced from licensed, opt-in content providers. No stealing, no scraping.",
                    benefit: "Ethical AI that respects content creators and keeps users engaged on your site."
                  },
                  {
                    title: "Completely Free & Privacy-First",
                    description: "100% private monetization solution that respects users' privacy—no tracking or data harvesting.",
                    benefit: "Generate revenue through contextual ads that enhance rather than interrupt user experience."
                  },
                  {
                    title: "Fully Customizable",
                    description: "Live in minutes with full editorial control over sources, tone, and brand voice.",
                    benefit: "Matches your design and values while keeping users engaged longer than traditional search."
                  },
                  {
                    title: "Publisher-First Design",
                    description: "Built specifically for publishers and content creators—not as an afterthought to big tech AI.",
                    benefit: "Every feature designed to protect your interests while enhancing your readers' experience."
                  }
                ].map((feature, index) => (
                  <div key={index} className="feature-item animate-on-scroll">
                    <h3>{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                    <p className="feature-benefit">{feature.benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonial Section */}
          <section className="testimonial">
            <div className="container">
              <blockquote>
                "The AI Companion helped us keep users engaged longer while generating ethical revenue—finally, an AI solution built for publishers."
                <cite>— Independent Publisher</cite>
              </blockquote>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="how-it-works">
            <div className="container">
              <h2 className="section-title">Get Started in 3 Simple Steps</h2>
              <div className="steps">
                {[
                  {
                    number: "1",
                    title: "Enter Website URL",
                    description: "Simply paste any website URL above to see how our AI companion transforms the experience."
                  },
                  {
                    number: "2",
                    title: "Choose Features",
                    description: "Select from our suite of AI tools designed specifically for publishers and content creators."
                  },
                  {
                    number: "3",
                    title: "See It Live",
                    description: "Experience the enhanced website with AI-powered features that keep users engaged."
                  }
                ].map((step, index) => (
                  <div key={index} className="step animate-on-scroll">
                    <div className="step-number">{step.number}</div>
                    <div className="step-content">
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="cta">
            <div className="container">
              <h2>Ready to Transform Your Website?</h2>
              <p>Test our AI companion above and see how it can enhance user engagement on any website.</p>
            </div>
          </section>

          {/* Footer */}
          <footer className="footer">
            <div className="container">
              <p>© 2025 Gist AI | Privacy • Terms • Support</p>
            </div>
          </footer>
        </>
      )}

      {showWebsite && (
        <WebsiteDisplay 
          url={targetUrl}
          onBack={handleRetry}
        />
      )}

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app {
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #374151;
          background: #ffffff;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        /* Hero Section */
        .hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 5rem 0;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-logo {
          width: 80px;
          height: 80px;
          margin-bottom: 2rem;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .hero h1 {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          margin-bottom: 3rem;
          opacity: 0.9;
          font-weight: 400;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .url-input-section {
          margin-top: 2rem;
        }

        /* Features Section */
        .features {
          padding: 6rem 0;
          background: #f8fafc;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 4rem;
          color: #1f2937;
          letter-spacing: -0.02em;
        }

        .features-list {
          display: grid;
          gap: 3rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .feature-item {
          background: white;
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .feature-item.animate-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .feature-item h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1f2937;
        }

        .feature-description {
          font-size: 1.1rem;
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .feature-benefit {
          font-size: 1rem;
          color: #3b82f6;
          font-weight: 500;
        }

        /* Testimonial Section */
        .testimonial {
          padding: 5rem 0;
          background: #1f2937;
          color: white;
          text-align: center;
        }

        .testimonial blockquote {
          font-size: 1.5rem;
          font-style: italic;
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .testimonial cite {
          display: block;
          margin-top: 2rem;
          font-size: 1rem;
          opacity: 0.8;
          font-style: normal;
        }

        /* How It Works Section */
        .how-it-works {
          padding: 6rem 0;
          background: white;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 3rem;
          margin-top: 4rem;
        }

        .step {
          text-align: center;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .step.animate-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .step-number {
          width: 60px;
          height: 60px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 auto 1.5rem;
        }

        .step h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1f2937;
        }

        .step p {
          color: #6b7280;
          font-size: 1.1rem;
        }

        /* CTA Section */
        .cta {
          padding: 5rem 0;
          background: #f8fafc;
          text-align: center;
        }

        .cta h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #1f2937;
        }

        .cta p {
          font-size: 1.25rem;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Footer */
        .footer {
          padding: 2rem 0;
          background: #1f2937;
          color: white;
          text-align: center;
        }

        .footer p {
          opacity: 0.7;
        }

        /* Feature Selection */
        .feature-selection {
          min-height: 100vh;
          padding: 3rem 0;
          background: #f8fafc;
          display: flex;
          align-items: center;
        }

        .feature-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .feature-logo {
          width: 60px;
          height: 60px;
          margin-bottom: 1.5rem;
          border-radius: 12px;
        }

        .feature-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #1f2937;
        }

        .feature-header p {
          font-size: 1.1rem;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .feature-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          overflow: hidden;
          min-height: 180px;
          display: flex;
          flex-direction: column;
        }

        .feature-card:hover {
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
        }

        .feature-card.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .feature-card.coming-soon {
          opacity: 0.7;
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #1f2937;
          line-height: 1.3;
        }

        .feature-card p {
          color: #6b7280;
          font-size: 0.95rem;
          line-height: 1.5;
          flex-grow: 1;
        }

        .coming-soon-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: #f59e0b;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .toggle-indicator {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .feature-card:not(.selected) .toggle-indicator {
          background: #e5e7eb;
          color: #6b7280;
        }

        .feature-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          align-items: center;
        }

        .btn-primary, .btn-secondary {
          padding: 0.875rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          border: none;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        /* Loading Screen */
        .loading-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
        }

        .loading-content {
          text-align: center;
          max-width: 500px;
        }

        .loading-logo {
          width: 60px;
          height: 60px;
          margin-bottom: 2rem;
          border-radius: 12px;
        }

        .loading-content h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 2rem;
          color: #1f2937;
        }

        .loading-steps {
          text-align: left;
          margin-bottom: 2rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .loading-step {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 0;
          color: #6b7280;
        }

        .step-icon {
          width: 24px;
          height: 24px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          flex-shrink: 0;
        }

        .loading-bar {
          width: 100%;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .loading-progress {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          border-radius: 3px;
          animation: loadingProgress 7s ease-out forwards;
        }

        @keyframes loadingProgress {
          from { width: 0%; }
          to { width: 100%; }
        }

        /* Scroll Animation */
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .animate-on-scroll.animate-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .container {
            padding: 0 1rem;
          }

          .hero h1 {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .steps {
            grid-template-columns: 1fr;
          }

          .feature-actions {
            flex-direction: column;
          }

          .btn-primary, .btn-secondary {
            width: 100%;
            justify-content: center;
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}