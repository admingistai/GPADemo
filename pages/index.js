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
  const [loadingMessage, setLoadingMessage] = useState('');

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
    try {
      setLoading(true);
      setError(null);
      setShowWebsite(false);
      setShowLoadingPage(true);
      
      // Format the URL automatically
      const formattedUrl = formatUrl(url);
      
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

    } catch (err) {
      setShowLoadingPage(false);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setShowWebsite(false);
    setShowLoadingPage(false);
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

      {/* Main Landing Page */}
      {!showWebsite && !showLoadingPage && (
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
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.9rem 2.85rem;
          position: relative;
        }

        .header-left .logo {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.0;
          color: white;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.05em;
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
        }

        .url-input-container {
          width: 100%;
          max-width: 500px;
        }

        .url-input-wrapper {
          display: flex;
          background: linear-gradient(135deg, #ff6b35, #f7931e, #ff6b6b, #a855f7);
          border-radius: 50px;
          padding: 3px;
          margin-bottom: 1rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
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

          .main-title {
            font-size: 2.5rem;
            margin-bottom: 2rem;
          }

          .url-input-wrapper {
            padding: 3px;
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
            margin-top: -3rem;
          }

          .publishers-message {
            font-size: 1.2rem;
            max-width: 250px;
            white-space: normal;
            line-height: 1.3;
          }

          .bottom-cta {
            flex-direction: column;
            gap: 1rem;
          }
        }

        @media (max-width: 480px) {
          .main-title {
            font-size: 2rem;
          }

          .publishers-band {
            padding: 2rem 1rem;
            margin-bottom: 80px;
            margin-top: -4rem;
          }

          .publishers-logos,
          .publishers-logos-bottom {
            flex-direction: column;
            gap: 0.5rem;
          }

          .publisher-name {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
    </>
  );
}