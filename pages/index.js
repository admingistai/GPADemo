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
              <img src="/Gist G white no background.png" alt="Gist" className="gist-logo" onClick={() => window.open('https://about.gist.ai', '_blank')} />
              <h1 className="logo">Ask<br />Anything™</h1>
            </div>
            <div className="header-right">
              <span className="tagline">100% ethical, uses fully licensed sources</span>
              <div className="auth-buttons">
                <button className="signin-btn" onClick={() => router.push('/dashboard')}>Sign In</button>
                <button className="signup-btn" onClick={() => setShowLoginPage(true)}>Sign Up</button>
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
                    id="remixing"
                    checked={selectedFeatures.remixing}
                    onChange={(e) => setSelectedFeatures(prev => ({...prev, remixing: e.target.checked}))}
                  />
                  <label htmlFor="remixing" className="feature-compact-name">Multi-Format Sharing</label>
                </div>
                <p className="feature-compact-description">Auto-converts articles into share-ready cards and threads</p>
              </div>
              
              <div className="feature-compact-card">
                <div className="feature-compact-header">
                  <input
                    type="checkbox"
                    id="share"
                    checked={selectedFeatures.share}
                    onChange={(e) => setSelectedFeatures(prev => ({...prev, share: e.target.checked}))}
                  />
                  <label htmlFor="share" className="feature-compact-name">Share</label>
                </div>
                <p className="feature-compact-description">Enable users to share content through various channels</p>
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
                    id="ethicalAds"
                    checked={selectedFeatures.ethicalAds}
                    onChange={(e) => setSelectedFeatures(prev => ({...prev, ethicalAds: e.target.checked}))}
                  />
                  <label htmlFor="ethicalAds" className="feature-compact-name">Ethical Ads</label>
                </div>
                <p className="feature-compact-description">Privacy-safe ad units matched to content intent</p>
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
              <img src="/Gist G white no background.png" alt="Gist" className="gist-logo" onClick={() => window.open('https://about.gist.ai', '_blank')} />
              <h1 className="logo">Ask<br />Anything™</h1>
                </div>
                        <div className="header-right">
              <span className="tagline">100% ethical, uses fully licensed sources</span>
              <div className="auth-buttons">
                <button className="signin-btn" onClick={() => router.push('/dashboard')}>Sign In</button>
                <button className="signup-btn" onClick={() => setShowLoginPage(true)}>Sign Up</button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="main-content">
            <h1 className="main-title hoverable-text">
              Keep readers on your site with AI that answers, cites, and converts.
            </h1>
            
            <div className="drive-growth-text hoverable-text">
              Gist Answers transforms your content into an interactive knowledge base that keeps readers engaged and drives revenue without compromising editorial integrity.
            </div>
            
            <div className="url-input-container">
              <div className="url-input-wrapper">
                <div className="url-input-inner">
                  <input
                    type="text"
                    placeholder="Enter your URL to preview on your site..."
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

          {/* YouTube Video Section */}
          <div className="video-section">
            <div className="video-container">
                              <iframe 
                  src="https://www.youtube.com/embed/g_XPo_d-Mhw" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen>
                </iframe>
            </div>
          </div>

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

          {/* Testimonials Section */}
          <section className="testimonials-section">
            <div className="testimonials-container">
              <div className="testimonial-box">
                <div className="testimonial-content">
                  <p>"With Gist Answers, we can combine our award-winning journalism with trusted external sources to deliver deeper context and smarter discovery in response to user questions."</p>
                  <div className="testimonial-author">
                    <strong>Will Lee</strong>
                    <span>CEO, AdWeek</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Us Section */}
          <section className="why-choose-section white-section">
            <div className="why-choose-container">
              <div className="why-choose-header">
                <h2 className="why-choose-title">Transform Content into Conversations</h2>
                </div>
              
              <div className="horizontal-benefits">
                <div className="benefit-item-horizontal stagger-animate">
                  <div className="benefit-icon">📚</div>
                  <h3>Answer beyond the article</h3>
                  <p>Gist draws from your entire content library to provide comprehensive answers while always citing sources.</p>
                  </div>
                  
                <div className="benefit-item-horizontal stagger-animate">
                  <div className="benefit-icon">🎯</div>
                  <h3>Search traffic stays put</h3>
                  <p>Keep readers engaged on your site instead of bouncing back to search engines for follow-up questions.</p>
                </div>
                  
                <div className="benefit-item-horizontal stagger-animate">
                  <div className="benefit-icon">💰</div>
                  <h3>Ad-funded, no fees</h3>
                  <p>Our revenue-share model means you only pay when Gist generates additional ad impressions and engagement.</p>
                  </div>
                </div>
              
              <div className="why-choose-cta">
                <div className="why-choose-url-input-container">
                  <div className="why-choose-url-input-wrapper">
                    <div className="why-choose-url-input-inner">
                      <input
                        type="url"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        placeholder="Enter your URL to preview on your site..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !loading && targetUrl.trim()) {
                            handleUrlSubmit(targetUrl);
                          }
                        }}
                        className="why-choose-url-input"
                        disabled={loading}
                      />
                      <button
                        onClick={() => handleUrlSubmit(targetUrl)}
                        disabled={loading || !targetUrl.trim()}
                        className="why-choose-generate-btn"
                      >
                        {loading ? 'Generating...' : 'Generate'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="how-it-works-section">
            <div className="how-it-works-container">
              <div className="how-it-works-header">
                <h2 className="how-it-works-title">How It Works</h2>
              </div>
              
              <div className="how-it-works-steps">
                <div className="step-item stagger-animate">
                  <div className="step-number">01</div>
                  <h3 className="step-title">One line: live in minutes</h3>
                  <p className="step-description">Drop a single line of code into your site and Gist Answers is instantly live. No complex setup, no technical expertise required.</p>
                </div>
                
                <div className="step-arrow stagger-animate">→</div>
                
                <div className="step-item stagger-animate">
                  <div className="step-number">02</div>
                  <h3 className="step-title">Choose theme</h3>
                  <p className="step-description">Customize colors, fonts, and positioning to match your brand perfectly. Your answers, your style, your site.</p>
                </div>
                
                <div className="step-arrow stagger-animate">→</div>
                
                <div className="step-item stagger-animate">
                  <div className="step-number">03</div>
                  <h3 className="step-title">Integrate with ads</h3>
                  <p className="step-description">Start earning revenue immediately with privacy-safe ads that complement your content without disrupting the user experience.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Copy Page */}
          <section className="copy-page white-section">
            <div className="copy-page-container">
              <div className="copy-header">
                <h2 className="copy-title">AI that cites, respects rights, and never hallucinates revenue risk</h2>
                <p className="copy-subtitle">We built Gist with journalistic integrity and publisher sustainability as our core principles.</p>
              </div>
              
              <div className="copy-features">
                <div className="copy-feature stagger-animate">
                  <div className="feature-icon">✓</div>
                  <p>Every answer includes citations to your content and trusted external sources</p>
                </div>
                
                <div className="copy-feature stagger-animate">
                  <div className="feature-icon">✓</div>
                  <p>Strict fact-checking protocols prevent hallucinations and misinformation</p>
                </div>
                
                <div className="copy-feature stagger-animate">
                  <div className="feature-icon">✓</div>
                  <p>Your content remains on your servers; we never train on your proprietary data</p>
                </div>
                
                <div className="copy-feature">
                  <div className="feature-icon">✓</div>
                  <p>Transparent attribution maintains reader trust and publisher authority</p>
                </div>
                
                <div className="copy-feature">
                  <div className="feature-icon">✓</div>
                  <p>Full GDPR, CCPA, and accessibility compliance built-in</p>
                </div>
              </div>
            </div>
          </section>

          {/* Revenue Section */}
          <section className="revenue-section">
            <div className="revenue-container">
              <div className="revenue-header">
                <h2 className="revenue-title">$0 platform fee. We split the incremental ad revenue; you keep editorial independence.</h2>
              </div>
              
              <div className="revenue-grid">
                <div className="revenue-column">
                  <h3 className="column-title">What You Get</h3>
                  <div className="revenue-features">
                    <div className="revenue-feature">
                      <div className="feature-icon">✓</div>
                      <p>Full integration with your CMS and ad stack</p>
                    </div>
                    
                    <div className="revenue-feature">
                      <div className="feature-icon">✓</div>
                      <p>Custom branding and voice settings</p>
                    </div>
                    
                    <div className="revenue-feature">
                      <div className="feature-icon">✓</div>
                      <p>Comprehensive analytics dashboard</p>
                    </div>
                    
                    <div className="revenue-feature">
                      <div className="feature-icon">✓</div>
                      <p>Dedicated customer success manager</p>
                    </div>
                    
                    <div className="revenue-feature">
                      <div className="feature-icon">✓</div>
                      <p>Weekly performance reports</p>
                    </div>
                  </div>
                </div>
                
                <div className="revenue-column">
                  <h3 className="column-title">How It Works</h3>
                  <div className="revenue-features">
                    <div className="revenue-feature">
                      <div className="feature-icon">✓</div>
                      <p>No upfront costs or monthly fees</p>
                    </div>
                    
                    <div className="revenue-feature">
                      <div className="feature-icon">✓</div>
                      <p>Revenue share on new ad impressions only</p>
                    </div>
                    
                    <div className="revenue-feature">
                      <div className="feature-icon">✓</div>
                      <p>Transparent attribution of all revenue</p>
                    </div>
                    
                    <div className="revenue-feature">
                      <div className="feature-icon">✓</div>
                      <p>30-day trial with full analytics access</p>
                    </div>
                    
                    <div className="revenue-feature">
                      <div className="feature-icon">✓</div>
                      <p>Cancel anytime with no penalties</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="revenue-cta">
                <button className="calculate-revenue-btn">
                  Calculate Your Revenue Uplift
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="footer-cta-section white-section">
            <div className="footer-cta-container">
              <h2 className="footer-cta-title">Let's Keep Readers Reading</h2>
              <p className="footer-cta-subtitle">
                Join leading publishers who are using Gist Answers to transform their content strategy, increase engagement, and drive sustainable revenue growth.
              </p>
              
              <div className="footer-url-input-container">
                <div className="footer-url-input-wrapper">
                  <div className="footer-url-input-inner">
                    <input
                      type="url"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="Enter your URL to preview on your site..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !loading && targetUrl.trim()) {
                          handleUrlSubmit(targetUrl);
                        }
                      }}
                      className="footer-url-input"
                      disabled={loading}
                    />
                    <button
                      onClick={() => handleUrlSubmit(targetUrl)}
                      disabled={loading || !targetUrl.trim()}
                      className="footer-generate-btn"
                    >
                      {loading ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                </div>
              </div>
              

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

        .auth-buttons {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .signin-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .signin-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .signup-btn {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(255, 107, 53, 0.3);
        }

        .signup-btn:hover {
          background: linear-gradient(135deg, #e55a2b, #e0821a);
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
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
        }

        .main-title {
          font-size: 3.2rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 1rem;
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
          margin: 0.25rem 0 0.25rem 0;
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

        /* Publishers Band */
        .publishers-band {
          background: transparent;
          padding: 1rem 2rem 2rem;
          margin-bottom: 0;
          animation: fadeInUp 1s ease-out 0.8s both;
        }

        .publishers-band.white-section {
          background: white !important;
          padding: 4rem 2rem 5rem;
          margin-bottom: 0;
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

        /* Testimonials Section */
        .testimonials-section {
          background: transparent;
          padding: 1.5rem 2rem 5rem;
          margin-bottom: 0;
          opacity: 0;
          transform: translateY(40px);
          animation: fadeInUp 1s ease-out 2s both;
        }

        .testimonials-container {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
        }

        .testimonial-box {
          background: transparent;
          border: none;
          padding: 0;
          transition: all 0.3s ease;
          position: relative;
          width: 100%;
          text-align: center;
        }

        .testimonial-content {
          position: relative;
        }

        .testimonial-content::before,
        .testimonial-content::after {
          content: '';
          position: absolute;
          font-size: 12rem;
          font-weight: 100;
          color: white;
          font-family: 'Helvetica Neue', 'Arial', sans-serif;
          line-height: 1;
          pointer-events: none;
        }

        .testimonial-content::before {
          content: '"';
          top: -3rem;
          left: -3rem;
        }

        .testimonial-content::after {
          content: '"';
          bottom: -5rem;
          right: -3rem;
        }

        .testimonial-content p {
          font-size: 1.5rem;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.95);
          font-family: 'Inter', sans-serif;
          margin-bottom: 1rem;
          font-style: italic;
          font-weight: 300;
          max-width: 100%;
        }

        .testimonial-author {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .testimonial-author strong {
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          font-family: 'Inter', sans-serif;
        }

        .testimonial-author span {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.7);
          font-family: 'Inter', sans-serif;
        }

        @media (max-width: 768px) {
          .testimonials-container {
            max-width: 100%;
            padding: 0 1rem;
          }
          
          .testimonials-section {
            padding: 2rem 1rem 4rem;
          }
          
          .testimonial-content p {
            font-size: 1.2rem;
            line-height: 1.4;
          }
          
          .testimonial-author strong {
            font-size: 1rem;
          }
          
          .testimonial-author span {
            font-size: 0.9rem;
          }
          
          .testimonial-content::before,
          .testimonial-content::after {
            font-size: 8rem;
          }
          
          .testimonial-content::before {
            top: -2rem;
            left: -1.5rem;
          }
          
          .testimonial-content::after {
            bottom: -3rem;
            right: -1.5rem;
          }
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

        /* Legal Footer */
        .legal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 2rem 1rem 2rem;
          margin-top: 2rem;
          font-family: 'Inter', sans-serif;
        }

        .copyright {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }

        .legal-links {
          display: flex;
          gap: 2rem;
        }

        .legal-link {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          cursor: pointer;
          transition: color 0.3s ease;
          text-decoration: underline;
          font-family: 'Inter', sans-serif;
        }

        .legal-link:hover {
          color: rgba(255, 255, 255, 0.9);
        }

        @media (max-width: 768px) {
          .legal-footer {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
            padding: 1.5rem 0 1rem 0;
          }

          .legal-links {
            gap: 1.5rem;
          }
        }
      `}</style>

        {/* Copyright and Legal Footer */}
        <div className="legal-footer">
          <div className="copyright">
            © 2024 Gist AI, Inc. All rights reserved.
          </div>
          <div className="legal-links">
            <button onClick={() => window.open('https://gist.ai/terms', '_blank')} className="legal-link">
              Terms of Service
            </button>
            <button onClick={() => window.open('https://gist.ai/privacy', '_blank')} className="legal-link">
              Privacy Policy
            </button>
          </div>
        </div>
    </div>
    </>
  );
}