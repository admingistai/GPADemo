import { useState, useEffect } from 'react';
import Head from 'next/head';
import URLInputForm from '../components/URLInputForm';
import WebsiteDisplay from '../components/WebsiteDisplay';
import ErrorDisplay from '../components/ErrorDisplay';

export default function Home() {
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showWebsite, setShowWebsite] = useState(false);
  const [showLoadingPage, setShowLoadingPage] = useState(false);
  const [showFeaturePage, setShowFeaturePage] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState({
    recommendedQuestions: true,
    theGist: true,
    augmentedAnswers: false,
    goDeeper: false,
    ethicalAds: false,
    customVoices: false,
    remixing: false,
    myDaily: false,
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
  }, [showWebsite]);

  const formatUrl = (inputUrl) => {
    let formattedUrl = inputUrl.trim();
    
    // Remove any existing protocol
    formattedUrl = formattedUrl.replace(/^https?:\/\//, '');
    
    // Add https:// prefix
    formattedUrl = 'https://' + formattedUrl;
    
    return formattedUrl;
  };

  const handleUrlSubmit = async (url) => {
    setError(null);
    setShowFeaturePage(true);
  };

  const handleFeatureContinue = async () => {
    setShowFeaturePage(false);
    setShowLoadingPage(true);
    
    // Format the URL automatically
    const formattedUrl = formatUrl(targetUrl);
    
    const loadingMessages = [
      'Generating button design...',
      'Adding functionality...',
      'Optimizing user experience...',
      'Implementing Ask Anything™...',
      'Configuring smart responses...',
      'Setting up AI integration...',
      'Customizing for your site...',
      'Finalizing button placement...',
      'Testing compatibility...',
      'Preparing launch...'
    ];

    // Show random loading messages
    const messageInterval = setInterval(() => {
      const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
      setLoadingMessage(randomMessage);
    }, 800);

    // Random delay between 5-10 seconds
    const delay = Math.random() * 5000 + 5000;
    
    setTimeout(async () => {
      clearInterval(messageInterval);
      
      try {
        const testResponse = await fetch(`/api/proxy?url=${encodeURIComponent(formattedUrl)}&test=true`);
        const testResult = await testResponse.json();

        if (!testResponse.ok) {
          throw new Error(testResult.error || 'Unable to reach the specified website');
        }

        // Directly open the website with widget in a new tab
        const websiteWithWidgetUrl = `/api/proxy?url=${encodeURIComponent(formattedUrl)}`;
        window.open(websiteWithWidgetUrl, '_blank');
        
        // Reset the form for potential next use
        setShowLoadingPage(false);
        setTargetUrl('');
      } catch (err) {
        setShowLoadingPage(false);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, delay);
  };

  const handleRetry = () => {
    setError(null);
    setShowWebsite(false);
    setShowLoadingPage(false);
    setShowFeaturePage(false);
    setTargetUrl('');
    setLoading(false);
  };

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/favicon-192x192.png" />
        <script src="/widget.js" async></script>
      </Head>
      
    <div className="app">
      {/* Loading Page */}
      {showLoadingPage && (
        <div className="loading-page">
          <div className="loading-content">
            <div className="loading-spinner">
              <img src="/Gist G white no background.png" alt="Gist Logo" />
            </div>
            <h2 className="loading-title">Setting up Ask Anything™</h2>
            <p className="loading-message">{loadingMessage}</p>
            <div className="loading-progress">
              <div className="progress-bar"></div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Selection Page */}
      {showFeaturePage && (
        <div className="feature-page">
          <header className="header">
            <div className="header-left">
              <h1 className="logo">Ask<br />Anything™</h1>
            </div>
            <div className="header-right">
              <span className="tagline">100% ethical, uses fully licensed sources</span>
              <button className="login-btn">Login</button>
            </div>
          </header>

          <main className="feature-content">
            <h1 className="feature-title">
              Choose Your Features
            </h1>
            <p className="feature-subtitle">
              Select the Ask Anything™ features you'd like to enable for {targetUrl}
            </p>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-header">
                  <input
                    type="checkbox"
                    id="recommendedQuestions"
                    checked={selectedFeatures.recommendedQuestions}
                    onChange={(e) => setSelectedFeatures(prev => ({...prev, recommendedQuestions: e.target.checked}))}
                  />
                  <label htmlFor="recommendedQuestions" className="feature-name">Recommended Questions</label>
                </div>
                <p className="feature-description">Auto-generates the most asked follow-ups; placed inline to guide exploration; lifts page views per visit.</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <input
                    type="checkbox"
                    id="theGist"
                    checked={selectedFeatures.theGist}
                    onChange={(e) => setSelectedFeatures(prev => ({...prev, theGist: e.target.checked}))}
                  />
                  <label htmlFor="theGist" className="feature-name">The Gist</label>
                </div>
                <p className="feature-description">One-sentence AI summary of any story; instant context for skimmers; proven to reduce bounce.</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <input
                    type="checkbox"
                    id="augmentedAnswers"
                    checked={selectedFeatures.augmentedAnswers}
                    onChange={(e) => setSelectedFeatures(prev => ({...prev, augmentedAnswers: e.target.checked}))}
                  />
                  <label htmlFor="augmentedAnswers" className="feature-name">Augmented Answers</label>
                </div>
                <p className="feature-description">Enriches replies with fully-licensed partner sources; citations included; maintains editorial trust.</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <input
                    type="checkbox"
                    id="goDeeper"
                    checked={selectedFeatures.goDeeper}
                    onChange={(e) => setSelectedFeatures(prev => ({...prev, goDeeper: e.target.checked}))}
                  />
                  <label htmlFor="goDeeper" className="feature-name">Go Deeper</label>
                </div>
                <p className="feature-description">One-click expandable sidebars with related articles, data, and media; extends time-on-page.</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <input
                    type="checkbox"
                    id="ethicalAds"
                    checked={selectedFeatures.ethicalAds}
                    onChange={(e) => setSelectedFeatures(prev => ({...prev, ethicalAds: e.target.checked}))}
                  />
                  <label htmlFor="ethicalAds" className="feature-name">Earn More with Ethical Ads</label>
                </div>
                <p className="feature-description">Privacy-safe generative ad units matched to content intent; new revenue stream, no user tracking.</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <input
                    type="checkbox"
                    id="customVoices"
                    checked={selectedFeatures.customVoices}
                    onChange={(e) => setSelectedFeatures(prev => ({...prev, customVoices: e.target.checked}))}
                  />
                  <label htmlFor="customVoices" className="feature-name">Custom Voices & Avatars</label>
                </div>
                <p className="feature-description">Branded TTS and 3-D presenter options; consistent tone across text, audio, and video.</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <input
                    type="checkbox"
                    id="remixing"
                    checked={selectedFeatures.remixing}
                    onChange={(e) => setSelectedFeatures(prev => ({...prev, remixing: e.target.checked}))}
                  />
                  <label htmlFor="remixing" className="feature-name">Remixing</label>
                </div>
                <p className="feature-description">Auto-converts articles into share-ready cards, reels, and threads; boosts organic reach without extra editing.</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <input
                    type="checkbox"
                    id="myDaily"
                    checked={selectedFeatures.myDaily}
                    onChange={(e) => setSelectedFeatures(prev => ({...prev, myDaily: e.target.checked}))}
                  />
                  <label htmlFor="myDaily" className="feature-name">Add to "My Daily"</label>
                </div>
                <p className="feature-description">Opt-in to a personalized site-wide or network-wide daily digest that pulls your latest pieces into readers' personalized, customized news feed; drives habitual return traffic and incremental revenue.</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <input
                    type="checkbox"
                    id="augmentedSharing"
                    checked={selectedFeatures.augmentedSharing}
                    onChange={(e) => setSelectedFeatures(prev => ({...prev, augmentedSharing: e.target.checked}))}
                  />
                  <label htmlFor="augmentedSharing" className="feature-name">Augmented Sharing</label>
                </div>
                <p className="feature-description">Generates pre-written social posts and on-scroll highlights with backlinks; simplifies promotion, tracks attribution.</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <input
                    type="checkbox"
                    id="customAgents"
                    checked={selectedFeatures.customAgents}
                    onChange={(e) => setSelectedFeatures(prev => ({...prev, customAgents: e.target.checked}))}
                  />
                  <label htmlFor="customAgents" className="feature-name">Custom Publisher/Creator/Promotional Agents</label>
                </div>
                <p className="feature-description">Build task-specific, goal-oriented AI companions (e.g., paywall support, live events); full control over scope, tone, and data.</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <input
                    type="checkbox"
                    id="futureProofing"
                    checked={selectedFeatures.futureProofing}
                    onChange={(e) => setSelectedFeatures(prev => ({...prev, futureProofing: e.target.checked}))}
                  />
                  <label htmlFor="futureProofing" className="feature-name">Future Proofing</label>
                </div>
                <p className="feature-description">One integration spins up an MCP server that: (1) exposes bot-friendly endpoints for GEO/AEO mention boosts, (2) surfaces structured answers search engines favor, and (3) lets trusted third-party AI agents transact safely on-site—opening additive revenue streams while you keep full data control.</p>
              </div>
            </div>

            <div className="feature-actions">
              <button className="back-btn" onClick={() => setShowFeaturePage(false)}>
                ← Back
              </button>
              <button className="continue-btn" onClick={handleFeatureContinue}>
                Continue with Selected Features
              </button>
            </div>
          </main>
        </div>
      )}

      {/* Main Landing Page */}
      {!showWebsite && !showLoadingPage && !showFeaturePage && (
        <div className="landing-page">
          {/* Header */}
          <header className="header">
            <div className="header-left">
              <h1 className="logo">Ask<br />Anything™</h1>
            </div>
            <div className="header-right">
              <span className="tagline">100% ethical, uses fully licensed sources</span>
              <button className="login-btn">Login</button>
            </div>
          </header>

          {/* Main Content */}
          <main className="main-content">
            <h1 className="main-title">
              Add the Ask Anything™ button<br />
              to your website.
            </h1>
            
            <div className="url-input-container">
              <div className="url-input-wrapper">
                <div className="url-input-inner">
                  <input
                    type="text"
                    placeholder="Paste URL"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !loading && targetUrl.trim()) {
                        handleUrlSubmit(targetUrl);
                      }
                    }}
                    className="url-input"
                    disabled={loading}
                  />
                  <button
                    onClick={() => handleUrlSubmit(targetUrl)}
                    disabled={loading || !targetUrl.trim()}
                    className="generate-btn"
                  >
                    {loading ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </div>
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>
          </main>

          {/* Publishers Band */}
          <footer className="publishers-band">
            <div className="publishers-content">
              <div className="publishers-message">
                Drive growth, boost engagement, and earn more today.
              </div>
              <img 
                src="/publishers-logos.png?v=1" 
                alt="Publishers logos" 
                className="publishers-image"
              />
            </div>
          </footer>
        </div>
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
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          min-height: 100vh;
          background: radial-gradient(ellipse at center, #3742fa 0%, #0c1426 100%);
        }

        /* Loading Page */
        .loading-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .loading-content {
          text-align: center;
          max-width: 500px;
          padding: 2rem;
        }

        .loading-spinner {
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem;
          animation: spin 2s linear infinite;
        }

        .loading-spinner img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .loading-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          font-family: 'Inter', sans-serif;
          line-height: 0.95;
          letter-spacing: -0.05em;
        }

        .loading-message {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.8;
          font-family: 'Inter', sans-serif;
          min-height: 1.5rem;
          line-height: 0.95;
          letter-spacing: -0.02em;
        }

        .loading-progress {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(135deg, #ff6b35, #f7931e, #ff6b6b, #a855f7);
          animation: progress 8s ease-in-out infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }

        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }

        .landing-page {
          background: transparent;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          color: white;
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.9rem 2.85rem;
          position: relative;
          animation: slideInDown 0.6s ease-out 0.2s both;
        }

        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .header-left .logo {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.0;
          color: white;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.05em;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .header-left .logo:hover {
          transform: scale(1.05);
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .tagline {
          font-size: 1rem;
          font-style: italic;
          opacity: 0.9;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .login-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .login-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        /* Main Content */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem 2rem;
          text-align: center;
        }

        .main-title {
          font-size: 3.2rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 2rem;
          margin-top: 1.5rem;
          max-width: 1100px;
          color: white;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.01em;
          animation: slideInUp 0.8s ease-out 0.4s both;
        }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .url-input-container {
          width: 100%;
          max-width: 500px;
          animation: slideInUp 0.8s ease-out 0.6s both;
        }

        .url-input-wrapper {
          display: flex;
          background: linear-gradient(135deg, #ff6b35, #f7931e, #ff6b6b, #a855f7);
          border-radius: 50px;
          padding: 3px;
          margin-bottom: 1rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .url-input-wrapper:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }

        .url-input-wrapper:focus-within {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(255, 107, 53, 0.2);
        }

        .url-input-inner {
          display: flex;
          background: white;
          border-radius: 47px;
          padding: 3px;
          width: 100%;
        }

        .url-input {
          flex: 1;
          border: none;
          background: white;
          padding: 0.75rem 1.25rem;
          font-size: 1rem;
          font-family: 'Inter', sans-serif;
          color: #333;
          outline: none;
          border-radius: 42px;
          transition: all 0.2s ease;
        }

        .url-input:focus {
          transform: scale(1.01);
        }

        .url-input::placeholder {
          color: #666;
          font-family: 'Inter', sans-serif;
        }

        .generate-btn {
          background: linear-gradient(135deg, #ff6b35, #f7931e, #ff6b6b, #a855f7);
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 40px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .generate-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #e55a2b, #e0821a, #ff5252, #9333ea);
          transform: translateY(-1px) scale(1.05);
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }

        .generate-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
          transition: all 0.1s ease;
        }

        .generate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          color: #ff6b6b;
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          margin-top: 1rem;
        }

        /* Publishers Band */
        .publishers-band {
          background: transparent;
          padding: 1rem 2rem 5rem;
          margin-bottom: 80px;
          animation: fadeInUp 1s ease-out 0.8s both;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .publishers-content {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
          position: relative;
        }

        .publishers-image {
          max-width: 100%;
          height: auto;
          margin: 2rem 0;
          display: block;
          transition: all 0.3s ease;
        }

        .publishers-image:hover {
          transform: scale(1.02);
          filter: brightness(1.1);
        }

        .publishers-message {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          font-family: 'Inter', sans-serif;
          z-index: 10;
          text-shadow: 0 3px 8px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9);
          white-space: nowrap;
          animation: textGlow 3s ease-in-out infinite alternate;
        }

        @keyframes textGlow {
          from { text-shadow: 0 3px 8px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9); }
          to { text-shadow: 0 3px 8px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.9), 0 0 20px rgba(255, 255, 255, 0.1); }
        }

        /* Feature Page Styles */
        .feature-page {
          background: radial-gradient(ellipse at center, #3742fa 0%, #0c1426 100%);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          color: white;
          animation: fadeIn 0.8s ease-out;
        }

        .feature-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 2rem 8rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .feature-title {
          font-size: 3rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 1rem;
          color: white;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.01em;
          text-align: center;
          animation: slideInUp 0.8s ease-out 0.2s both;
        }

        .feature-subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 3rem;
          text-align: center;
          font-family: 'Inter', sans-serif;
          animation: slideInUp 0.8s ease-out 0.4s both;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
          width: 100%;
          margin-bottom: 3rem;
          animation: slideInUp 0.8s ease-out 0.6s both;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .feature-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }

        .feature-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .feature-header input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #ff6b35;
          cursor: pointer;
        }

        .feature-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          flex: 1;
        }

        .feature-description {
          font-size: 0.95rem;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.8);
          font-family: 'Inter', sans-serif;
          margin: 0;
        }

        .feature-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          width: 100%;
          animation: slideInUp 0.8s ease-out 0.8s both;
        }

        .back-btn, .continue-btn {
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .back-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .back-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .continue-btn {
          background: linear-gradient(135deg, #ff6b35, #f7931e, #ff6b6b, #a855f7);
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .continue-btn:hover {
          background: linear-gradient(135deg, #e55a2b, #e0821a, #ff5252, #9333ea);
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }

        .bottom-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          margin-top: 2rem;
          padding-top: 2rem;
        }

        .cta-text {
          font-size: 1.1rem;
          color: white;
          font-family: 'Inter', sans-serif;
        }

        .ask-anything-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: white;
          border: none;
          color: #333;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .ask-anything-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .google-icon {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #4285f4, #34a853, #fbbc05, #ea4335);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 0.9rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
            padding: 1.5rem;
          }

          .header-left {
            text-align: left !important;
          }

          .header-left .logo {
            text-align: left !important;
          }

          .header-right {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-end;
            text-align: right;
          }

          .tagline {
            max-width: 120px;
            word-wrap: break-word;
            line-height: 1.2;
          }

          .main-content {
            padding: 1rem 2rem;
          }

          .main-title {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            margin-top: 0;
          }

          .url-input-wrapper {
            padding: 3px;
            margin-top: 0.5rem;
          }

          .url-input-inner {
            padding: 3px;
          }

          .url-input {
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
          }

          .generate-btn {
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
            border-radius: 37px;
          }

          .publishers-logos,
          .publishers-logos-bottom {
            gap: 1rem;
          }

          .publisher-name {
            font-size: 0.9rem;
          }

          .publishers-band {
            padding: 1rem 2rem 5rem;
            margin-bottom: 80px;
            transform: translateY(-6rem);
            animation: none;
          }

          .publishers-message {
            font-size: 1.2rem;
            max-width: 250px;
            white-space: normal;
            line-height: 1.3;
          }

          /* Feature Page Mobile Styles */
          .feature-content {
            padding: 1rem 1rem 8rem;
          }

          .feature-title {
            font-size: 2.5rem;
            margin-bottom: 0.75rem;
          }

          .feature-subtitle {
            font-size: 1rem;
            margin-bottom: 2rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .feature-card {
            padding: 1.25rem;
          }

          .feature-actions {
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
          }

          .back-btn, .continue-btn {
            width: 100%;
            max-width: 300px;
          }

          .bottom-cta {
            flex-direction: column;
            gap: 1rem;
          }
        }

        @media (max-width: 480px) {
          .main-content {
            padding: 0.5rem 1rem;
          }

          .main-title {
            font-size: 2rem;
            margin-bottom: 0.75rem;
          }

          .publishers-band {
            padding: 2rem 1rem;
            margin-bottom: 80px;
            transform: translateY(-8rem);
            animation: none;
          }

          .publishers-logos,
          .publishers-logos-bottom {
            flex-direction: column;
            gap: 0.5rem;
          }

          .publisher-name {
            font-size: 0.8rem;
          }

          /* Feature Page Small Mobile Styles */
          .feature-title {
            font-size: 2rem;
          }

          .feature-subtitle {
            font-size: 0.9rem;
          }

          .feature-card {
            padding: 1rem;
          }

          .feature-name {
            font-size: 1rem;
          }

          .feature-description {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
    </>
  );
}