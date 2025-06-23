import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import URLInputForm from '../components/URLInputForm';
import WebsiteDisplay from '../components/WebsiteDisplay';
import ErrorDisplay from '../components/ErrorDisplay';

export default function Home() {
  const router = useRouter();
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
    goDeeper: false,
    customVoices: false,
    myDaily: false,
    augmentedSharing: false,
    customAgents: false
  });

  // Enhanced scroll animation effects
  useEffect(() => {
    const handleScroll = () => {
      const animateOnScroll = document.querySelectorAll('.animate-on-scroll');
      animateOnScroll.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 120;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('animate-visible');
        }
      });
    };

    // Intersection Observer for more sophisticated animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-animate-in');
          // Add stagger delay for child elements
          const children = entry.target.querySelectorAll('.stagger-animate');
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('stagger-in');
            }, index * 100);
          });
        }
      });
    }, observerOptions);

    // Observe sections for scroll animations
    const sections = document.querySelectorAll('section, .publishers-band, .testimonials-section');
    sections.forEach(section => {
      section.classList.add('scroll-observe');
      observer.observe(section);
    });

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run once on mount
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
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
    setTargetUrl(url);
    setShowLoadingPage(true);
    
    // Format the URL automatically
    const formattedUrl = formatUrl(url);
    
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

    // Random delay between 3-6 seconds (shorter since no feature selection)
    const delay = Math.random() * 3000 + 3000;
    
    setTimeout(async () => {
      clearInterval(messageInterval);
      
      try {
        const testResponse = await fetch(`/api/proxy?url=${encodeURIComponent(formattedUrl)}&test=true`);
        const testResult = await testResponse.json();

        if (!testResponse.ok) {
          throw new Error(testResult.error || 'Unable to reach the specified website');
        }

        // Use default widget configuration with Ask Anything enabled
        const widgetConfig = {
          ask: true
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
          ask: selectedFeatures.ask
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
              <img src="/Gist_Mark_000000.png" alt="Gist Logo" />
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
              <img src="/Gist_Mark_000000.png" alt="Gist" className="gist-logo" onClick={() => window.open('https://about.gist.ai', '_blank')} />
              <h1 className="logo">Ask<br />Anything™</h1>
            </div>
            <div className="header-right">
              <span className="tagline">100% ethical, uses fully licensed sources</span>
              <div className="auth-buttons">
                <button className="waitlist-header-btn" onClick={() => router.push('/waitlist')}>Join Waitlist</button>
              </div>
            </div>
          </header>

          <main className="feature-content">
            <h1 className="feature-title">
              Configure Features
            </h1>
            <p className="feature-subtitle">
              Select additional features for {targetUrl}. Ask Anything™ is always enabled.
            </p>
              
            <div className="features-compact-grid">
              <div className="feature-compact-card">
                <div className="feature-compact-header">
                  <input
                    type="checkbox"
                    id="theGist"
                    checked={selectedFeatures.theGist}
                    onChange={(e) => setSelectedFeatures(prev => ({...prev, theGist: e.target.checked}))}
                  />
                  <label htmlFor="theGist" className="feature-compact-name">Summarize</label>
              </div>
                <p className="feature-compact-description">One-sentence AI summary of any story</p>
            </div>


              

                
              <div className="feature-compact-card">
                <div className="feature-compact-header">
                  <input
                    type="checkbox"
                    id="goDeeper"
                    checked={selectedFeatures.goDeeper}
                    onChange={(e) => setSelectedFeatures(prev => ({...prev, goDeeper: e.target.checked}))}
                  />
                  <label htmlFor="goDeeper" className="feature-compact-name">Go Deeper</label>
                </div>
                <p className="feature-compact-description">Expandable sidebars with related articles and media</p>
                </div>
                

                
              <div className="feature-compact-card">
                <div className="feature-compact-header">
                  <input
                    type="checkbox"
                    id="customVoices"
                    checked={selectedFeatures.customVoices}
                    onChange={(e) => setSelectedFeatures(prev => ({...prev, customVoices: e.target.checked}))}
                  />
                  <label htmlFor="customVoices" className="feature-compact-name">Custom Voices</label>
                </div>
                <p className="feature-compact-description">Branded TTS and presenter options</p>
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
              <img src="/Gist_Mark_000000.png" alt="Gist" className="gist-logo" onClick={() => window.open('https://about.gist.ai', '_blank')} />
              <h1 className="logo">Ask<br />Anything™</h1>
                </div>
            <div className="header-right">
              <span className="tagline">100% ethical, uses fully licensed sources</span>
              <div className="auth-buttons">
                <button className="waitlist-header-btn" onClick={() => setShowLoginPage(true)}>Sign In</button>
              </div>
              </div>
          </header>

          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-container">
              <div className="hero-video">
                <iframe 
                  src="https://www.youtube.com/embed/g_XPo_d-Mhw" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen>
                </iframe>
            </div>
              <div className="hero-content">
                <h1 className="hero-title">
                  Help people find what they need on your website.
                </h1>
                <p className="hero-description">
                  Add a customizable AI-powered search box to your web pages and show fast, relevant results powered by Gist Answers.
                </p>
                <div className="hero-cta">
                  <button
                    onClick={() => router.push('/waitlist')}
                    className="get-started-btn"
                  >
                    Get Started
                  </button>
                  <span className="hero-cta-text">or, preview it on your site:</span>
                  <div className="hero-url-input-wrapper">
                  <input
                    type="text"
                      className="hero-url-input"
                      placeholder="Enter your website URL (e.g., example.com)"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && targetUrl.trim() && handleUrlSubmit(targetUrl)}
                  />
                  <button
                      className="hero-try-btn"
                      onClick={() => targetUrl.trim() && handleUrlSubmit(targetUrl)}
                      disabled={!targetUrl.trim()}
                    >
                      <span className="gist-icon">G</span>
                      Try It
                  </button>
            </div>
              </div>
              </div>
                </div>
          </section>



          {/* Why Choose Ask Anything™ */}
          <section className="why-choose-section white-section">
            <div className="container">
              <h2 className="section-title">Why choose Ask Anything™</h2>
              <div className="benefits-grid">
                <div className="benefit-card stagger-animate">
                  <div className="benefit-icon">🎯</div>
                  <h3>Stops readers from leaving your site</h3>
                  <p>When readers have questions, they click Ask Anything™ instead of searching Google, keeping them engaged on your page longer.</p>
                  </div>
                  
                <div className="benefit-card stagger-animate">
                  <div className="benefit-icon">📚</div>
                  <h3>Better ads with higher engagement</h3>
                  <p>Interactive AI responses create premium ad inventory with longer dwell times and higher click-through rates than standard display ads.</p>
                </div>
                  
                <div className="benefit-card stagger-animate">
                  <div className="benefit-icon">💰</div>
                  <h3>Completely free with 50/50 revenue split</h3>
                  <p>Zero installation costs, zero monthly fees. We only make money when you make money through our fair 50/50 revenue share.</p>
                  </div>
              </div>
            </div>
          </section>

          {/* Make It Yours */}
          <section className="make-it-yours-section">
            <div className="container">
              <h2 className="section-title">Make it yours</h2>
              <div className="customization-grid">
                <div className="customization-item stagger-animate">
                  <h3>Match your brand perfectly</h3>
                  <p>Customize colors, fonts, favicon, and button styling to seamlessly blend with your website's design and brand identity.</p>
                </div>

                <div className="customization-item stagger-animate">
                  <h3>Choose your tools and features</h3>
                  <p>Enable or disable specific features like Ask Anything™ and Go Deeper based on your needs.</p>
                </div>

                <div className="customization-item stagger-animate">
                  <h3>Control your advertising</h3>
                  <p>Set ad preferences, choose which types of ads to display, and maintain full control over the advertising experience on your site.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="final-cta-section white-section">
            <div className="container">
              <h2 className="cta-title">Ready to add Ask Anything™ to your website?</h2>
              <div className="waitlist-container">
                <button
                  onClick={() => router.push('/waitlist')}
                  className="waitlist-btn"
                >
                  Join Waitlist
                </button>
              </div>
            </div>
          </section>

          {/* Legal Footer */}
          <footer className="legal-footer">
            <div>© 2024 Gist AI, Inc. All rights reserved.</div>
            <div className="legal-links">
              <button onClick={() => window.open('https://about.gist.ai/terms', '_blank')}>Terms of Service</button>
              <button onClick={() => window.open('https://about.gist.ai/privacy', '_blank')}>Privacy Policy</button>
            </div>
          </footer>
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
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
        }

        /* Loading Page */
        .loading-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1a202c;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
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
          color: #1a202c;
          animation: fadeIn 0.8s ease-out;
         }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Scroll Animation Styles */
        .scroll-observe {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .scroll-observe.scroll-animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        .stagger-animate {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .stagger-animate.stagger-in {
          opacity: 1;
          transform: translateY(0);
        }

        /* Smooth scrolling for the entire page */
        html {
          scroll-behavior: smooth;
        }

        /* Subtle parallax effect on scroll */
        .parallax-subtle {
          transition: transform 0.1s ease-out;
        }

        /* Professional micro-interactions */
        .benefit-item-horizontal, .step-item, .copy-feature {
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .benefit-item-horizontal:hover {
          transform: translateY(-2px);
        }

        .step-item:hover {
          transform: translateY(-1px);
        }

        .copy-feature:hover {
          transform: translateX(2px);
        }

        /* Smooth transitions for all interactive elements */
        button, input, .url-input-wrapper, .video-container {
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* Enhanced button animations */
        .generate-btn, .why-choose-generate-btn, .footer-generate-btn {
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* Subtle scale animation for icons */
        .benefit-icon, .feature-icon, .step-number {
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .benefit-item-horizontal:hover .benefit-icon,
        .copy-feature:hover .feature-icon,
        .step-item:hover .step-number {
          transform: scale(1.1);
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem 2.85rem;
          position: relative;
          animation: slideInDown 0.6s ease-out 0.2s both;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        }

        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .gist-logo {
          height: 2.5rem;
          width: auto;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .gist-logo:hover {
          transform: scale(1.1);
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
        }

        .header-left .logo {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.0;
          color: #1a202c;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.05em;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .header-left .logo:hover {
          transform: scale(1.05);
          text-shadow: 0 0 20px rgba(26, 32, 44, 0.2);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .tagline {
          font-size: 1rem;
          font-style: italic;
          opacity: 0.7;
           font-weight: 700;
           letter-spacing: -0.02em;
          line-height: 1.1;
          color: #4a5568;
         }

        .auth-buttons {
          display: flex;
          gap: 1rem;
          align-items: center;
        }



        .waitlist-header-btn {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(79, 70, 229, 0.3);
        }

        .waitlist-header-btn:hover {
          background: linear-gradient(135deg, #4338ca, #6d28d9);
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
        }

        /* Hero Section */
        .hero-section {
          background: white;
          padding: 4rem 2rem;
          color: #1a1a1a;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-video {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        }

        .hero-video iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .hero-content {
          padding-left: 2rem;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          color: #1a1a1a;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.02em;
        }

        .hero-description {
          font-size: 1.25rem;
          line-height: 1.5;
          margin-bottom: 2rem;
          color: #4a4a4a;
          font-family: 'Inter', sans-serif;
        }

        .hero-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          width: 100%;
        }

        .get-started-btn {
          background: linear-gradient(270deg, #667eea, #764ba2, #f093fb, #f5576c, #667eea);
          background-size: 400% 400%;
          border: none;
          color: white;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          animation: gradientFlow 3s ease infinite;
          position: relative;
          overflow: hidden;
        }

        .get-started-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          animation-duration: 1.5s;
        }

        @keyframes gradientFlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .hero-cta-text {
          color: #666;
          font-family: 'Kalam', cursive;
          font-size: 1.2rem;
          font-style: italic;
          font-weight: 400;
          transform: rotate(-2deg);
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
          letter-spacing: 0.5px;
        }

        .hero-url-input-wrapper {
          display: flex;
          background: transparent;
          border-radius: 50px;
          overflow: visible;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          width: 400px;
          flex-shrink: 0;
          position: relative;
          padding: 3px;
        }

        .hero-url-input-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c, #ff6b35, #feca57, #667eea);
          border-radius: 50px;
          z-index: -1;
          animation: rainbowRotate 3s linear infinite;
        }

        .hero-url-input-wrapper::after {
          content: '';
          position: absolute;
          inset: 3px;
          background: white;
          border-radius: 47px;
          z-index: -1;
        }

        @keyframes rainbowRotate {
          0% {
            background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c, #ff6b35, #feca57, #667eea);
          }
          25% {
            background: linear-gradient(135deg, #764ba2, #f093fb, #f5576c, #ff6b35, #feca57, #667eea, #764ba2);
          }
          50% {
            background: linear-gradient(135deg, #f093fb, #f5576c, #ff6b35, #feca57, #667eea, #764ba2, #f093fb);
          }
          75% {
            background: linear-gradient(135deg, #f5576c, #ff6b35, #feca57, #667eea, #764ba2, #f093fb, #f5576c);
          }
          100% {
            background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c, #ff6b35, #feca57, #667eea);
          }
        }

        .hero-url-input-wrapper:hover {
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        .hero-url-input-wrapper:focus-within {
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.2);
        }

        .hero-url-input {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border: none;
          background: transparent;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          color: #1a202c;
          outline: none;
          border-radius: 50px;
        }

        .hero-url-input::placeholder {
          color: #a0aec0;
        }

        .hero-try-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 75%, #f5576c 100%);
          background-size: 400% 400%;
          border: none;
          border-radius: 47px;
          color: white;
          padding: 0.875rem 1.5rem;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          animation: gradientFlow 3s ease infinite;
          white-space: nowrap;
          margin: 0;
        }

        .hero-try-btn:hover:not(:disabled) {
          animation-duration: 1.5s;
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .hero-try-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          animation: none;
          background: #a0aec0;
        }

        .gist-icon {
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
          font-family: 'Inter', sans-serif;
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 2rem 1rem;
          }

          .hero-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .hero-content {
            padding-left: 0;
            text-align: center;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-description {
            font-size: 1.1rem;
          }

          .hero-cta {
            flex-direction: column;
            gap: 1.5rem;
          }

          .get-started-btn {
            padding: 0.875rem 1.75rem;
            font-size: 1rem;
          }

          .hero-url-input-wrapper {
            width: 100%;
            flex-direction: column;
          }

          .hero-url-input {
            padding: 0.75rem 1rem;
            font-size: 0.95rem;
          }

          .hero-try-btn {
            padding: 0.75rem 1.25rem;
            font-size: 0.9rem;
            border-radius: 47px;
          }
        }

        /* Main Content */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 2rem;
          text-align: center;
          margin-top: -1rem;
        }

        .main-title {
          font-size: 3.2rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 0.5rem;
          margin-top: 0.5rem;
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
          font-size: 1.35rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 2rem;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          text-align: center;
          animation: slideInUp 0.8s ease-out 0.5s both;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.3;
        }

        /* Subtle hover animations for interactive text */
        .hoverable-text {
          transition: all 0.4s ease;
          cursor: pointer;
        }

        .main-title.hoverable-text:hover {
          color: rgba(255, 255, 255, 1);
          text-shadow: 0 4px 12px rgba(255, 255, 255, 0.15);
        }

        .drive-growth-text.hoverable-text:hover {
          color: rgba(255, 255, 255, 1);
          text-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
        }

        .url-input-container {
          width: 100%;
          max-width: 500px;
          animation: slideInUp 0.8s ease-out 0.6s both;
        }

        /* Video Section */
        .video-section {
          margin: 0.5rem 0 2rem 0;
          display: flex;
          justify-content: center;
          animation: slideInUp 0.8s ease-out 0.7s both;
        }

        .video-container {
          position: relative;
          width: 100%;
          max-width: 960px;
          aspect-ratio: 16 / 9;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }

        .video-container:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
        }

        .video-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        @media (max-width: 768px) {
          .video-section {
            margin: 1.5rem 1rem;
          }
          
          .video-container {
            max-width: 100%;
            border-radius: 12px;
          }
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

        /* White sections for contrast */
        .white-section {
          color: #333 !important;
        }

        /* Why Choose Section */
        .why-choose-section {
          padding: 5rem 0;
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%);
        }

        .why-choose-section.white-section {
          background: white;
          position: relative;
          overflow: hidden;
        }

        .why-choose-section.white-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 20%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(255, 182, 193, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }

        .why-choose-section.white-section .section-title {
          color: #333;
          position: relative;
          z-index: 1;
        }

        .why-choose-section.white-section .benefit-card {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.1);
          color: #333;
          position: relative;
          z-index: 1;
        }

        .why-choose-section.white-section .benefit-card h3 {
          color: #333;
        }

        .why-choose-section.white-section .benefit-card p {
          color: #666;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a202c;
          text-align: center;
          margin-bottom: 3rem;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .benefit-card {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(226, 232, 240, 0.3);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .benefit-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.95);
        }

        .benefit-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          display: block;
        }

        .benefit-card h3 {
          color: #1a202c;
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .benefit-card p {
          color: #4a5568;
          font-size: 1rem;
          line-height: 1.6;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Make It Yours Section */
        .make-it-yours-section {
          padding: 5rem 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
          color: #1a202c;
        }

        .make-it-yours-section .section-title {
          color: #1a202c;
        }

        .customization-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          text-align: center;
        }

        .customization-item h3 {
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1a202c;
        }

        .customization-item p {
          font-size: 1rem;
          line-height: 1.6;
          color: #4a5568;
        }

        /* Final CTA Section */
        .final-cta-section {
          padding: 5rem 0;
          background: linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 100%);
          text-align: center;
        }



        .final-cta-section.white-section {
          background: white;
          position: relative;
          overflow: hidden;
        }

        .final-cta-section.white-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 20%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(255, 182, 193, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }

        .cta-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 2rem;
        }

        .final-cta-section.white-section .cta-title {
          color: #333;
          position: relative;
          z-index: 1;
        }

        /* Waitlist Button */
        .waitlist-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 1rem 0;
        }

        .waitlist-btn {
          background: linear-gradient(135deg, #3742fa 0%, #a855f7 50%, #ff6b35 100%);
          color: white;
          border: none;
          padding: 1.25rem 3rem;
          border-radius: 50px;
          font-size: 1.2rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: relative;
          overflow: hidden;
        }

        .waitlist-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #4f46e5 0%, #c084fc 50%, #f97316 100%);
          transition: left 0.3s ease;
          z-index: -1;
        }

        .waitlist-btn:hover::before {
          left: 0;
        }

        .waitlist-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .section-title {
            font-size: 2rem;
          }

          .benefits-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .benefit-card {
            padding: 1.5rem;
          }

          .customization-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .cta-title {
            font-size: 2rem;
          }

          .waitlist-btn {
            padding: 1rem 2rem;
            font-size: 1rem;
          }

          .container {
            padding: 0 1rem;
          }
        }

        /* Legal Footer */
        .legal-footer {
          background: rgba(248, 250, 252, 0.8);
          border-top: 1px solid rgba(226, 232, 240, 0.3);
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #4a5568;
          font-size: 0.9rem;
        }

        .legal-links {
          display: flex;
          gap: 2rem;
        }

        .legal-links button {
          background: none;
          border: none;
          color: #4a5568;
          cursor: pointer;
          text-decoration: underline;
          font-size: 0.9rem;
          font-family: 'Inter', sans-serif;
        }

        .legal-links button:hover {
          color: #1a202c;
        }

        @media (max-width: 768px) {
          .legal-footer {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .legal-links {
            gap: 1rem;
          }
        }

        /* Feature Page Styles */
        .feature-page {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          color: #1a202c;
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
          color: #1a202c;
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

        /* Compact Feature Design */
        .features-compact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
          width: 100%;
          margin-bottom: 2rem;
          animation: slideInUp 0.8s ease-out 0.6s both;
        }

        .feature-compact-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .feature-compact-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .feature-compact-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .feature-compact-header input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #ff6b35;
          cursor: pointer;
        }

        .feature-compact-name {
          font-size: 1rem;
          font-weight: 600;
          color: white;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          flex: 1;
        }

        .feature-compact-description {
          font-size: 0.85rem;
          line-height: 1.4;
          color: rgba(255, 255, 255, 0.7);
          font-family: 'Inter', sans-serif;
          margin: 0;
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
            transform: translateY(-1rem);
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
            transform: translateY(0);
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
          padding: 0.25rem 3rem 4rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          animation: slideInUp 0.8s ease-out 0.4s both;
        }

        .why-choose-section.white-section {
          background: 
            radial-gradient(circle at 20% 80%, rgba(255, 107, 53, 0.15) 0%, transparent 35%),
            radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 35%),
            linear-gradient(135deg, rgba(0, 0, 0, 0.03) 0%, transparent 100%),
            #f8f9fa !important;
          backdrop-filter: none !important;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          padding: 4rem 3rem 5rem;
          position: relative;
          box-shadow: 
            inset 0 0 120px rgba(0, 0, 0, 0.08),
            0 0 0 1px rgba(0, 0, 0, 0.05) !important;
        }

        .why-choose-section.white-section .why-choose-title {
          color: #333 !important;
        }

        .why-choose-section.white-section .why-choose-subtitle {
          color: #666 !important;
        }

        .why-choose-section.white-section .benefit-item-horizontal {
          background: rgba(0, 0, 0, 0.02) !important;
          border: 1px solid rgba(0, 0, 0, 0.1) !important;
        }

        .why-choose-section.white-section .benefit-item-horizontal:hover {
          background: rgba(0, 0, 0, 0.05) !important;
          border-color: rgba(0, 0, 0, 0.2) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
        }

        .why-choose-section.white-section .benefit-item-horizontal .benefit-icon {
          background: linear-gradient(135deg, #ff6b35, #f7931e) !important;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3) !important;
        }

        .why-choose-section.white-section .benefit-item-horizontal h3 {
          color: #333 !important;
        }

        .why-choose-section.white-section .benefit-item-horizontal p {
          color: #666 !important;
        }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .why-choose-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .why-choose-header {
          text-align: center;
          margin-bottom: 1.5rem;
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

        .horizontal-benefits {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .benefit-item-horizontal {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .benefit-item-horizontal:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .benefit-item-horizontal .benefit-icon {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          width: 3rem;
          height: 3rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin: 0 auto 1rem auto;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
        }

        .benefit-item-horizontal h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.75rem;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.01em;
        }

        .benefit-item-horizontal p {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
           margin: 0;
          font-family: 'Inter', sans-serif;
         }

        .why-choose-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
           text-align: center;
          padding: 0;
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

        /* Why Choose URL Input Styles */
        .why-choose-url-input-container {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .why-choose-url-input-wrapper {
          display: flex;
          background: linear-gradient(135deg, #ff6b35, #f7931e, #ff6b6b, #a855f7);
          border-radius: 50px;
          padding: 3px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          max-width: 500px;
          width: 100%;
        }

        .why-choose-url-input-wrapper:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }

        .why-choose-url-input-wrapper:focus-within {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(255, 107, 53, 0.2);
        }

        .why-choose-url-input-inner {
          display: flex;
          background: white;
          border-radius: 47px;
          padding: 3px;
          width: 100%;
        }

        .why-choose-url-input {
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

        .why-choose-url-input:focus {
          transform: scale(1.01);
        }

        .why-choose-url-input::placeholder {
          color: #666;
          font-family: 'Inter', sans-serif;
        }

        .why-choose-url-input:disabled {
          opacity: 0.7;
        }

        .why-choose-generate-btn {
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

        .why-choose-generate-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #e55a2b, #e0821a, #ff5252, #9333ea);
          transform: translateY(-1px) scale(1.05);
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }

        .why-choose-generate-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
          transition: all 0.1s ease;
        }

        .why-choose-generate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* How It Works Section */
        .how-it-works-section {
          background: radial-gradient(ellipse at center, #2a3cdf 0%, #1a2742 100%);
          padding: 4rem 2rem 5rem;
          margin-bottom: 0;
        }

        .how-it-works-container {
          max-width: 1200px;
          margin: 0 auto;
           text-align: center;
        }

        .how-it-works-header {
          margin-bottom: 3rem;
        }

        .how-it-works-title {
          font-size: 2.75rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
          line-height: 1.1;
          font-family: 'Inter', sans-serif;
         }

        .how-it-works-steps {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr;
          gap: 2rem;
          align-items: center;
        }

        .step-arrow {
          font-size: 2rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 300;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.1);
          }
        }

        @media (max-width: 768px) {
          .how-it-works-steps {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .step-arrow {
            transform: rotate(90deg);
            margin: 1rem 0;
          }
        }

        .step-item {
          text-align: center;
          transition: all 0.3s ease;
        }

        .step-item:hover {
          transform: translateY(-4px);
        }

        .step-number {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          color: white;
          width: 4rem;
          height: 4rem;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.3rem;
          font-family: 'Inter', sans-serif;
          margin: 0 auto 1.5rem auto;
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
        }

        .step-title {
          font-size: 1.4rem;
          font-weight: 600;
          color: white;
          margin: 0 0 1rem 0;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.01em;
          height: 3.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .step-description {
          font-size: 1.1rem;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          font-family: 'Inter', sans-serif;
        }

        @media (max-width: 768px) {
          .how-it-works-section {
            padding: 3rem 2rem 4rem;
          }
          
          .how-it-works-title {
            font-size: 2.25rem;
          }
          
          .how-it-works-steps {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          
          .step-number {
            width: 3.5rem;
            height: 3.5rem;
            font-size: 1.1rem;
          }
          
          .step-title {
            font-size: 1.2rem;
          }
          
          .step-description {
          font-size: 0.9rem;
          }
        }

        /* Copy Page */
        .copy-page {
          padding: 3rem 3rem 4rem;
          background: rgba(255, 255, 255, 0.03);
        }

        .copy-page.white-section {
          background: 
            radial-gradient(circle at 20% 80%, rgba(255, 107, 53, 0.15) 0%, transparent 35%),
            radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 35%),
            linear-gradient(135deg, rgba(0, 0, 0, 0.03) 0%, transparent 100%),
            #f8f9fa !important;
          backdrop-filter: none !important;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          padding: 4rem 3rem 5rem;
          position: relative;
          box-shadow: 
            inset 0 0 120px rgba(0, 0, 0, 0.08),
            0 0 0 1px rgba(0, 0, 0, 0.05) !important;
        }

        .copy-page-container {
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .copy-header {
          margin-bottom: 3rem;
        }

        .copy-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
          line-height: 1.2;
          font-family: 'Inter', sans-serif;
        }

        .copy-subtitle {
          font-size: 1.2rem;
          color: #666;
          margin: 0;
          font-family: 'Inter', sans-serif;
          line-height: 1.5;
        }

        .copy-features {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          text-align: left;
          max-width: 700px;
          margin: 0 auto;
        }

        .copy-feature {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .feature-icon {
          color: #10b981;
          font-size: 1.2rem;
          font-weight: bold;
          margin-top: 0.1rem;
          flex-shrink: 0;
        }

        .copy-feature p {
          font-size: 1.1rem;
          color: #555;
          margin: 0;
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          font-weight: 600;
        }

        /* Responsive Design for Copy Page */
        @media (max-width: 768px) {
          .copy-page {
            padding: 2.5rem 2rem 3rem;
          }

          .copy-title {
            font-size: 2rem;
            margin-bottom: 1rem;
          }

          .copy-subtitle {
            font-size: 1.1rem;
          }

          .copy-features {
            gap: 1.25rem;
          }

          .copy-feature p {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .copy-page {
            padding: 2rem 1.5rem;
          }

          .copy-title {
            font-size: 1.75rem;
          }

          .copy-subtitle {
            font-size: 1rem;
          }

          .copy-feature p {
            font-size: 0.85rem;
          }
        }

        /* Revenue Section */
        .revenue-section {
          background: radial-gradient(ellipse at center, #3742fa 0%, #0c1426 100%);
          padding: 5rem 2rem;
          margin-bottom: 0;
        }

        .revenue-container {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .revenue-header {
          margin-bottom: 4rem;
        }

        .revenue-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.2;
          font-family: 'Inter', sans-serif;
          max-width: 900px;
          margin: 0 auto;
        }

        .revenue-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          margin-bottom: 4rem;
        }

        .revenue-column {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 2.5rem;
          backdrop-filter: blur(10px);
        }

        .column-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
            margin-bottom: 2rem;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.01em;
          }

        .revenue-features {
          display: flex;
          flex-direction: column;
            gap: 1.5rem;
          text-align: left;
        }

        .revenue-feature {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .revenue-feature .feature-icon {
          color: #10b981;
          font-size: 1.2rem;
          font-weight: bold;
          margin-top: 0.1rem;
          flex-shrink: 0;
        }

        .revenue-feature p {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          font-weight: 600;
        }

        .revenue-cta {
          display: flex;
          justify-content: center;
        }

        .calculate-revenue-btn {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          color: white;
          border: none;
          padding: 1.25rem 2.5rem;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.01em;
          box-shadow: 0 10px 30px rgba(255, 107, 53, 0.3);
        }

        .calculate-revenue-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(255, 107, 53, 0.4);
          background: linear-gradient(135deg, #e55a2b, #e0821a);
        }

        @media (max-width: 768px) {
          .revenue-section {
            padding: 4rem 2rem;
          }
          
          .revenue-title {
            font-size: 2rem;
          }
          
          .revenue-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
            margin-bottom: 3rem;
          }
          
          .revenue-column {
            padding: 2rem;
          }
          
          .column-title {
            font-size: 1.5rem;
          }
          
          .revenue-feature p {
            font-size: 0.9rem;
          }
          
          .calculate-revenue-btn {
            padding: 1rem 2rem;
            font-size: 1rem;
          }
        }

        /* Footer CTA Styles */
        .footer-cta-section {
          background: #f8f9fa !important;
          background-image: 
            radial-gradient(circle at 10% 90%, rgba(229, 90, 43, 0.15) 0%, transparent 20%),
            radial-gradient(circle at 90% 10%, rgba(139, 69, 199, 0.15) 0%, transparent 20%) !important;
          padding: 4rem 2rem;
          text-align: center;
          box-shadow: 
            inset 0 0 60px rgba(0, 0, 0, 0.03),
            0 -10px 30px rgba(0, 0, 0, 0.05) !important;
        }

        .footer-cta-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .footer-cta-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #333;
          font-family: 'Inter', sans-serif;
        }

        .footer-cta-subtitle {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 3rem;
          line-height: 1.6;
          font-family: 'Inter', sans-serif;
        }

        .footer-url-input-container {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .footer-url-input-wrapper {
          display: flex;
          background: linear-gradient(135deg, #ff6b35, #f7931e, #ff6b6b, #a855f7);
          border-radius: 50px;
          padding: 3px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          max-width: 500px;
          width: 100%;
        }

        .footer-url-input-wrapper:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }

        .footer-url-input-wrapper:focus-within {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(255, 107, 53, 0.2);
        }

        .footer-url-input-inner {
          display: flex;
          background: white;
          border-radius: 47px;
          padding: 3px;
          width: 100%;
        }

        .footer-url-input {
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

        .footer-url-input:focus {
          transform: scale(1.01);
        }

        .footer-url-input::placeholder {
          color: #666;
          font-family: 'Inter', sans-serif;
        }

        .footer-url-input:disabled {
          opacity: 0.7;
        }

        .footer-generate-btn {
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

        .footer-generate-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #e55a2b, #e0821a, #ff5252, #9333ea);
          transform: translateY(-1px) scale(1.05);
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }

        .footer-generate-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
          transition: all 0.1s ease;
        }

        .footer-generate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .footer-disclaimer {
          font-size: 1rem;
          color: #666;
          margin: 0;
          font-family: 'Inter', sans-serif;
        }

        @media (max-width: 768px) {
          .footer-cta-section {
            padding: 3rem 1.5rem;
          }
          
          .footer-cta-title {
            font-size: 2.25rem;
          }
          
          .footer-cta-subtitle {
            font-size: 1.1rem;
            margin-bottom: 2.5rem;
          }
          
          .footer-url-input-wrapper {
            max-width: 400px;
          }
          
          .footer-generate-btn {
            padding: 0.875rem 1.5rem;
            font-size: 0.95rem;
          }
        }

        @media (max-width: 480px) {
          .footer-cta-title {
            font-size: 1.9rem;
          }

          .footer-cta-subtitle {
            font-size: 1rem;
          }

          .footer-url-input {
            padding: 0.875rem 1.25rem;
            font-size: 0.9rem;
          }

          .footer-generate-btn {
            padding: 0.875rem 1.25rem;
            font-size: 0.9rem;
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

          .horizontal-benefits {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .benefit-item-horizontal {
            padding: 1.25rem;
          }

          .benefit-item-horizontal .benefit-icon {
            width: 2.5rem;
            height: 2.5rem;
            font-size: 1.25rem;
            margin-bottom: 0.75rem;
          }

          .benefit-item-horizontal h3 {
            font-size: 1.1rem;
          }

          .benefit-item-horizontal p {
            font-size: 0.85rem;
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

          .horizontal-benefits {
            gap: 1.25rem;
            margin-bottom: 1.5rem;
          }

          .benefit-item-horizontal {
            padding: 1rem;
          }

          .benefit-item-horizontal .benefit-number {
            width: 2.25rem;
            height: 2.25rem;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
          }

          .benefit-item-horizontal h3 {
            font-size: 1rem;
          }

          .benefit-item-horizontal p {
            font-size: 0.8rem;
            line-height: 1.4;
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

          .horizontal-benefits {
            gap: 1.75rem;
            margin-bottom: 2.5rem;
          }

          .benefit-item-horizontal {
            padding: 1.5rem;
          }

          .benefit-item-horizontal h3 {
            font-size: 1.2rem;
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