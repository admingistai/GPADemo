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
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState({
    ask: true, // Always enabled, non-toggleable
    theGist: true,
    goDeeper: false,
    ethicalAds: false,
    customVoices: false,
    remixing: true,
    myDaily: false,
    augmentedSharing: false,
    customAgents: false,
    share: true
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
      'Implementing <em>Ask Anything™</em>...',
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

        // Convert feature selection to widget configuration
        const widgetConfig = {
          ask: selectedFeatures.ask,
          gist: selectedFeatures.theGist,
          remix: selectedFeatures.remixing,
          share: selectedFeatures.share
        };
        
        // Directly open the website with widget in a new tab
        const configParam = encodeURIComponent(JSON.stringify(widgetConfig));
        const websiteWithWidgetUrl = `/api/proxy?url=${encodeURIComponent(formattedUrl)}&config=${configParam}`;
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
            <h2 className="loading-title">Setting up <em>Ask Anything™</em></h2>
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
              <button className="login-btn" onClick={() => setShowLoginPage(true)}>Login</button>
            </div>
          </header>

          <main className="feature-content">
            <h1 className="feature-title">
              Choose Your Features
            </h1>
            <p className="feature-subtitle">
              Select the <em>Ask Anything™</em> features you'd like to enable for {targetUrl}
            </p>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-header">
                  <input
                    type="checkbox"
                    id="ask"
                    checked={selectedFeatures.ask}
                    disabled={true}
                    style={{opacity: 0.6}}
                  />
                  <label htmlFor="ask" className="feature-name"><em>Ask Anything™</em></label>
                </div>
                <p className="feature-description">Core AI-powered question answering functionality. Always enabled for your users.</p>
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
                    id="share"
                    checked={selectedFeatures.share}
                    onChange={(e) => setSelectedFeatures(prev => ({...prev, share: e.target.checked}))}
                  />
                  <label htmlFor="share" className="feature-name">Share</label>
                </div>
                <p className="feature-description">Enable users to share content and insights with others through various channels and platforms.</p>
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
              <button className="login-btn" onClick={() => setShowLoginPage(true)}>Login</button>
              </div>
          </header>

          {/* Main Content */}
          <main className="main-content">
            <h1 className="main-title">
              Add the <em>Ask Anything™</em> button<br />
              to your website.
            </h1>
            
            <div className="drive-growth-text">
              Drive growth, boost engagement, and earn more today.
            </div>
            
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
              <div className="see-how-text">
                See how this will look on your website.
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
              <img 
                src="/publishers-logos.png?v=1" 
                alt="Publishers logos" 
                className="publishers-image"
              />
                  </div>
          </footer>

          {/* Why Choose Us Section */}
          <section className="why-choose-section">
            <div className="why-choose-container">
              <div className="why-choose-header">
                                 <h2 className="why-choose-title">Why Choose <em>Ask Anything™</em>?</h2>
                <p className="why-choose-subtitle">The smart choice for publishers who want results</p>
                </div>
              
              <div className="why-choose-content">
                <div className="why-choose-main">
                  <div className="benefit-item">
                    <div className="benefit-number">01</div>
                    <div className="benefit-content">
                      <h3>Drives Engagement</h3>
                      <p>Keep visitors on your site longer with interactive AI answers that boost page views and time spent.</p>
                  </div>
                </div>
                  
                  <div className="benefit-item">
                    <div className="benefit-number">02</div>
                    <div className="benefit-content">
                      <h3>Privacy-First & Ethical</h3>
                      <p>No user tracking, fully licensed content sources, and transparent attribution you can trust.</p>
                  </div>
                  </div>
                  
                  <div className="benefit-item">
                    <div className="benefit-number">03</div>
                    <div className="benefit-content">
                      <h3>Completely Free</h3>
                      <p>No upfront costs, no hidden fees, no monthly subscriptions. Start adding value immediately.</p>
                    </div>
                  </div>
                </div>
                
                <div className="why-choose-cta">
                  <button className="primary-cta-button" onClick={() => document.querySelector('.url-input').focus()}>
                    Get Started Now
                    <span className="cta-arrow">→</span>
                  </button>
                  <p className="cta-note">Setup takes less than 2 minutes</p>
                </div>
              </div>
            </div>
          </section>

          {/* Features Page */}
          <section className="features-page">
            <div className="features-page-container">
              <h2 className="features-page-title">Core Features</h2>
              
              <div className="features-grid">
                <div className="feature-group">
                  <h3 className="feature-group-title">Smart Answers</h3>
                  <ul className="feature-list">
                    <li>Accurate answers to user questions</li>
                    <li>Promotes your content first in answers (with links back to each source)</li>
                    <li>Ability to supplement answers with content from leading publications</li>
                  </ul>
                </div>

                <div className="feature-group">
                  <h3 className="feature-group-title">Control & Privacy</h3>
                  <ul className="feature-list">
                    <li>Ability to choose which third-party publications can be used as sources</li>
                    <li>Privacy-safe—no user-level tracking</li>
                    <li>Ability to control look and feel (colors, fonts, etc.)</li>
                  </ul>
                </div>

                <div className="feature-group">
                  <h3 className="feature-group-title">Growth & Revenue</h3>
                  <ul className="feature-list">
                    <li>New high-value revenue stream (from ads)</li>
                    <li>Easy install with a plug-in or one line of code</li>
                    <li>Keeps users on your site vs. going to Google, ChatGPT, or other sites for answers</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Login Page Modal */}
      {showLoginPage && (
        <div className="login-modal-overlay" onClick={() => setShowLoginPage(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <button className="login-close-btn" onClick={() => setShowLoginPage(false)}>×</button>
            
            <div className="login-header">
              <h2 className="login-title">Welcome to <em>Ask Anything™</em></h2>
              <p className="login-subtitle">Sign in to unlock premium features</p>
            </div>
            
            <form className="login-form" onSubmit={(e) => e.preventDefault()}>
              <div className="login-field">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="login-field">
                <label htmlFor="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <div className="login-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot-password">Forgot password?</a>
              </div>
              
              <button type="submit" className="login-submit-btn">
                Sign In
              </button>
              
              <div className="login-divider">
                <span>or</span>
              </div>
              
              <div className="social-login">
                <button type="button" className="social-btn google-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                
                <button type="button" className="social-btn apple-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </button>
              </div>
              
              <div className="login-footer">
                <p>Don't have an account? <a href="#" className="signup-link">Sign up</a></p>
              </div>
            </form>
          </div>
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

        .drive-growth-text {
          font-size: 1.3rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 2rem;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          text-align: center;
          animation: slideInUp 0.8s ease-out 0.5s both;
        }

        .url-input-container {
          width: 100%;
          max-width: 500px;
          animation: slideInUp 0.8s ease-out 0.6s both;
        }

        .see-how-text {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 0.75rem;
          text-align: center;
          font-family: 'Inter', sans-serif;
          font-style: italic;
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

          .drive-growth-text {
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
          }

          .see-how-text {
            font-size: 0.9rem;
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

          .drive-growth-text {
            font-size: 1rem;
            margin-bottom: 1.25rem;
          }

          .see-how-text {
            font-size: 0.85rem;
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

        /* Login Modal Styles */
        .login-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.3s ease-out;
        }

        .login-modal {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideInUp 0.4s ease-out;
        }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .login-close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
           font-size: 1.5rem;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .login-close-btn:hover {
          color: #374151;
          background: #f3f4f6;
        }

        .login-header {
           text-align: center;
          margin-bottom: 2rem;
        }

        .login-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
          font-family: 'Inter', sans-serif;
        }

        .login-subtitle {
          color: #6b7280;
          font-size: 0.95rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .login-field label {
          font-weight: 500;
          color: #374151;
          font-size: 0.9rem;
        }

        .login-field input {
          padding: 0.875rem 1rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .login-field input:focus {
          outline: none;
          border-color: #3742fa;
          box-shadow: 0 0 0 3px rgba(55, 66, 250, 0.1);
        }

        .login-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: -0.5rem 0;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #6b7280;
          cursor: pointer;
        }

        .remember-me input {
           margin: 0;
        }

        .forgot-password {
          color: #3742fa;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        .login-submit-btn {
          background: linear-gradient(135deg, #3742fa, #5b6cfa);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          font-size: 1rem;
           font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .login-submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(55, 66, 250, 0.3);
        }

        .login-divider {
          text-align: center;
          position: relative;
          color: #9ca3af;
          font-size: 0.9rem;
          margin: 0.5rem 0;
        }

        .login-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e5e7eb;
          z-index: 1;
        }

        .login-divider span {
          background: white;
          padding: 0 1rem;
          position: relative;
          z-index: 2;
        }

        .social-login {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.875rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          color: #374151;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .social-btn:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .login-footer {
          text-align: center;
          margin-top: 1rem;
        }

        .login-footer p {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .signup-link {
          color: #3742fa;
          text-decoration: none;
          font-weight: 500;
        }

        .signup-link:hover {
          text-decoration: underline;
        }

        /* Responsive Login Modal */
        @media (max-width: 768px) {
          .login-modal {
            padding: 2rem;
            margin: 1rem;
            max-width: 100%;
          }

          .login-title {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .login-modal {
            padding: 1.5rem;
            border-radius: 16px;
          }

          .login-title {
            font-size: 1.25rem;
          }

          .social-login {
            gap: 0.5rem;
          }

          .social-btn {
            padding: 0.75rem;
            font-size: 0.9rem;
          }
        }

        /* Why Choose Us Section - Redesigned */
        .why-choose-section {
          padding: 2.5rem 3rem 4rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          animation: slideInUp 0.8s ease-out 0.4s both;
        }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .why-choose-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .why-choose-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .why-choose-title {
          font-size: 2.75rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
          line-height: 1.1;
          font-family: 'Inter', sans-serif;
        }

        .why-choose-subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 400;
          font-family: 'Inter', sans-serif;
        }

        .why-choose-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .why-choose-main {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .benefit-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateX(8px);
        }

        .benefit-number {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          color: white;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 700;
          flex-shrink: 0;
          font-family: 'Inter', sans-serif;
        }

        .benefit-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.5rem;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.01em;
        }

        .benefit-content p {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          font-family: 'Inter', sans-serif;
        }

        .why-choose-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
           text-align: center;
          padding: 2rem;
        }

        .primary-cta-button {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          color: white;
          border: none;
          padding: 1.25rem 2.5rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          box-shadow: 0 10px 30px rgba(255, 107, 53, 0.3);
        }

        .primary-cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(255, 107, 53, 0.4);
          background: linear-gradient(135deg, #f7931e, #ff6b35);
        }

        .primary-cta-button:active {
          transform: translateY(0);
        }

        .cta-arrow {
          font-size: 1.2rem;
          transition: transform 0.3s ease;
        }

        .primary-cta-button:hover .cta-arrow {
          transform: translateX(4px);
        }

        .cta-note {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          font-family: 'Inter', sans-serif;
           margin: 0;
        }

        /* Features Page */
        .features-page {
          padding: 3rem 3rem 4rem;
          background: rgba(255, 255, 255, 0.03);
        }

        .features-page-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .features-page-title {
          font-size: 2rem;
          font-weight: 600;
          color: white;
          text-align: center;
          margin-bottom: 2.5rem;
          letter-spacing: -0.02em;
          font-family: 'Inter', sans-serif;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .feature-group {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .feature-group:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .feature-group-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          margin: 0 0 1rem 0;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.01em;
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .feature-list li {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
          margin-bottom: 0.75rem;
          padding-left: 1rem;
          position: relative;
          font-family: 'Inter', sans-serif;
        }

        .feature-list li:last-child {
          margin-bottom: 0;
        }

        .feature-list li::before {
          content: '•';
          color: #3742fa;
          font-weight: bold;
          position: absolute;
          left: 0;
        }

        /* Responsive Design for Features Page */
        @media (max-width: 768px) {
          .features-page {
            padding: 2.5rem 2rem 3rem;
          }

          .features-page-title {
            font-size: 1.75rem;
            margin-bottom: 2rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .feature-group {
            padding: 1.25rem;
          }

          .feature-group-title {
            font-size: 1rem;
          }

          .feature-list li {
            font-size: 0.85rem;
            margin-bottom: 0.625rem;
          }
        }

        @media (max-width: 480px) {
          .features-page {
            padding: 2rem 1.5rem;
          }

          .features-page-title {
            font-size: 1.5rem;
          }

          .feature-group {
            padding: 1rem;
          }

          .feature-list li {
            font-size: 0.8rem;
          }
        }

        /* Responsive Design for Why Choose Us Section */
        @media (max-width: 768px) {
          .why-choose-section {
            padding: 2.5rem 2rem;
          }

          .why-choose-title {
            font-size: 2.25rem;
          }

          .why-choose-subtitle {
            font-size: 1.1rem;
          }

          .why-choose-content {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }

          .why-choose-main {
            gap: 1.5rem;
          }

          .benefit-item {
            padding: 1.5rem;
            gap: 1rem;
          }

          .benefit-number {
            width: 2.5rem;
            height: 2.5rem;
            font-size: 1rem;
          }

          .benefit-content h3 {
            font-size: 1.25rem;
          }

          .benefit-content p {
            font-size: 0.9rem;
          }

          .why-choose-cta {
            padding: 1.5rem;
          }

          .primary-cta-button {
            padding: 1rem 2rem;
            font-size: 1rem;
          }
        }

          .cta-button {
            padding: 1rem 2.5rem;
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .why-choose-section {
            padding: 2rem 1.5rem;
          }

          .why-choose-title {
            font-size: 1.9rem;
          }

          .why-choose-subtitle {
            font-size: 1rem;
          }

          .why-choose-content {
            gap: 2rem;
          }

          .why-choose-main {
            gap: 1.25rem;
          }

          .benefit-item {
            padding: 1.25rem;
            gap: 1rem;
          }

          .benefit-number {
            width: 2.25rem;
            height: 2.25rem;
            font-size: 0.9rem;
          }

          .benefit-content h3 {
            font-size: 1.1rem;
          }

          .benefit-content p {
            font-size: 0.85rem;
            line-height: 1.5;
          }

          .why-choose-cta {
            padding: 1rem;
          }

          .primary-cta-button {
            padding: 0.875rem 1.75rem;
            font-size: 0.95rem;
          }

          .cta-note {
            font-size: 0.8rem;
          }
        }

          .cta-button {
            padding: 0.875rem 2rem;
            font-size: 0.95rem;
          }
        }



        /* Tablet Specific Adjustments */
        @media (min-width: 769px) and (max-width: 1024px) {
          .why-choose-section {
            padding: 3rem 2.5rem;
          }

          .why-choose-content {
            gap: 3rem;
          }

          .benefit-item {
            padding: 1.75rem;
            gap: 1.25rem;
          }

          .benefit-content h3 {
            font-size: 1.35rem;
          }

          .why-choose-title {
            font-size: 2.5rem;
           }
         }
      `}</style>
    </div>
    </>
  );
}