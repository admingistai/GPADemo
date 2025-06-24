import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleUrlSubmit = async (url) => {
    router.push('/setup');
  };

  return (
    <>
      <Head>
        <title>Ask Anything™ - AI-Powered Website Search</title>
        <link rel="icon" href="/Gist_Mark_000000.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/Gist_Mark_000000.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/Gist_Mark_000000.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/Gist_Mark_000000.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/Gist_Mark_000000.png" />
        <script src="/widget.js" async></script>
      </Head>
      
      <div className="app">
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
                  <button 
                    className="waitlist-header-btn" 
                    onClick={() => setShowLoginPage(true)}
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </header>

            <div className="hero-cta">
              <button
                onClick={() => router.push('/setup')}
                className="get-started-btn"
              >
                Get Started
              </button>
              <span className="hero-cta-text">or, preview it on your site:</span>
              <div className="hero-url-input-wrapper">
                <input
                  type="text"
                  className="hero-url-input"
                  placeholder="Enter your website URL"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && targetUrl.trim() && handleUrlSubmit(targetUrl)}
                />
                <button
                  className="hero-try-btn"
                  onClick={() => targetUrl.trim() && handleUrlSubmit(targetUrl)}
                  disabled={!targetUrl.trim()}
                >
                  Try It
                </button>
              </div>
            </div>

            {/* Final CTA */}
            <section className="final-cta-section">
              <div className="container">
                <h2 className="cta-title">Ready to add Ask Anything™ to your website?</h2>
                <div className="final-cta-actions">
                  <button
                    onClick={() => router.push('/setup')}
                    className="final-get-started-btn"
                  >
                    Get Started
                  </button>
                  <span className="final-cta-text">or, preview it on your site:</span>
                  <div className="final-url-input-wrapper">
                    <input
                      type="text"
                      className="final-url-input"
                      placeholder="Enter your website URL"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && targetUrl.trim() && handleUrlSubmit(targetUrl)}
                    />
                    <button
                      className="final-try-btn"
                      onClick={() => targetUrl.trim() && handleUrlSubmit(targetUrl)}
                      disabled={!targetUrl.trim()}
                    >
                      Try It
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {showWebsite && (
          <WebsiteDisplay 
            url={targetUrl}
            onBack={() => setShowWebsite(false)}
          />
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
                    <span className="social-icon">G</span>
                    Continue with Google
                  </button>
                  
                  <button type="button" className="social-btn apple-btn">
                    <span className="social-icon">🍎</span>
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
      </div>
    </>
  );
}