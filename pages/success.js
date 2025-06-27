import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

export default function Success() {
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [copied, setCopied] = useState(false);
  const [codeString, setCodeString] = useState('');

  useEffect(() => {
    // Get config from localStorage
    const savedConfig = localStorage.getItem('widgetConfig');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);
      
      // Generate the code string
      const generatedCode = `<!-- Gist Widget -->
<script>
  window.gistConfig = {
    "url": "${parsedConfig.website}",
    "features": {
      "summarize": ${parsedConfig.features.summarize},
      "related": ${parsedConfig.features.relatedQuestions},
      "readaloud": ${parsedConfig.features.readAloud},
      "godeeper": ${parsedConfig.features.goDeeper}
    },
    "user": {
      "name": "${parsedConfig.name}",
      "email": "${parsedConfig.email}"
    },
    "setupId": "${parsedConfig.setupId}"
  };
</script>
<script src="https://widget.gist.ai/widget.js" async></script>
<!-- End Gist Widget -->`;
      
      setCodeString(generatedCode);
    } else {
      // Redirect back if no config found
      router.push('/signup');
    }
  }, [router]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePlatformClick = (platform) => {
    // Placeholder for platform-specific installation
    alert(`${platform} integration coming soon!`);
  };

  if (!config) {
    return null; // Loading state
  }

  return (
    <div className="app">
      <Head>
        <title>Your Button is Ready! | Gist AI</title>
        <meta name="description" content="Your Ask Anything button is ready to install" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      {/* Animated gradient orbs background */}
      <div className="gradient-orbs">
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
        <div className="orb orb3"></div>
      </div>

      {/* Header */}
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
          <a href="/dashboard" className="login-btn">Dashboard</a>
          <a href="/" className="demo-btn">Home</a>
        </div>
      </header>

      {/* Main Content */}
      <main className="success-container">
        <div className="success-content">
          {/* Success Header */}
          <div className="success-header fade-in">
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
            </div>
            <h1 className="success-title">Your Button is Ready!</h1>
            <p className="success-subtitle">
              Copy the code below and paste it into your website's HTML where you want the button to appear.
            </p>
          </div>

          {/* Code Display Box */}
          <div className="code-container fade-in-delay-1">
            <div className="code-header">
              <span className="code-language">HTML/JavaScript</span>
              <button 
                className={`copy-button ${copied ? 'copied' : ''}`}
                onClick={handleCopyCode}
              >
                {copied ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy Code
                  </>
                )}
              </button>
            </div>
            <pre className="code-block">
              <code>{codeString}</code>
            </pre>
          </div>

          {/* Platform Integration Section */}
          <div className="platform-section fade-in-delay-2">
            <h2 className="platform-title">Easy Platform Integration</h2>
            <p className="platform-subtitle">Install directly to your platform with one click:</p>
            
            <div className="platform-grid">
              <button 
                className="platform-card"
                onClick={() => handlePlatformClick('WordPress')}
              >
                <div className="platform-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6.7 7.5c.8-.9 1.9-1.6 3.1-2 .3-.1.5-.1.8-.2l2.5 6.8-2.5 6.8c-.2-.1-.3-.1-.5-.2zm1.9.8l-2.4-6.6 2.4-6.6 2.4 6.6-2.4 6.6zm7.3-10c-.1.3-.2.5-.3.8l-2.5 6.8c-.1.2-.1.3-.2.5-.8.9-1.9 1.6-3.1 2l2.5-6.8 2.5-6.8c.1.2.2.3.3.5.5 1.1.8 2.5.8 4z"/>
                  </svg>
                </div>
                <h3>WordPress</h3>
                <p>Install as Plugin</p>
              </button>

              <button 
                className="platform-card"
                onClick={() => handlePlatformClick('Shopify')}
              >
                <div className="platform-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.3 3.6c-.1-.1-.2-.1-.3-.1-.1 0-.2 0-.3.1l-1.1.4c-.1 0-.1-.1-.1-.1-.3-.4-.7-.6-1.2-.6h-.1c-.2-.2-.4-.3-.6-.3-1.3 0-1.9 1.6-2.1 2.4l-1.4.4c-.4.1-.4.1-.5.5C7.6 6.8 5 20.6 5 20.6l11.1 1.9 4.8-1.2S15.4 3.7 15.3 3.6zm-3.9 1.2c-.2.1-.5.1-.8.2v-.2c0-.5-.1-.9-.2-1.2.5.1.8.6 1 1.2zm-1.6-.5c.1.3.2.7.2 1.3v.1l-1.6.5c.2-.8.7-1.7 1.4-1.9zm-.3-.4c.1 0 .2 0 .2.1-.7.3-1.4 1.1-1.7 2.6l-1.3.4c.3-.9.9-3.1 2.8-3.1z"/>
                  </svg>
                </div>
                <h3>Shopify</h3>
                <p>Install as App</p>
              </button>

              <button 
                className="platform-card"
                onClick={() => handlePlatformClick('Drupal')}
              >
                <div className="platform-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.5 14.8c-.4 1.2-1.4 2.1-2.6 2.4-.4.1-.8.1-1.2.1-1.8 0-3.3-1.3-3.6-3.1-.1-.4-.1-.8 0-1.2.1-.6.4-1.2.8-1.7.4-.4.9-.8 1.5-.9.2-.1.5-.1.7-.1.8 0 1.6.3 2.1.9.6.6.9 1.4.9 2.3 0 .4-.1.9-.2 1.3h-3.9c.1.8.8 1.4 1.6 1.4.6 0 1.1-.3 1.4-.8l1.5.4zm-1.9-2.3c-.1-.6-.6-1.1-1.3-1.1s-1.2.5-1.3 1.1h2.6z"/>
                  </svg>
                </div>
                <h3>Drupal</h3>
                <p>Install as Module</p>
              </button>

              <button 
                className="platform-card"
                onClick={() => handlePlatformClick('Wix')}
              >
                <div className="platform-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 6.5L7 12l1.4 1.4 2.1-2.1V17h2v-5.7l2.1 2.1L16 12l-5-5.5zm8-4.5H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                  </svg>
                </div>
                <h3>Wix</h3>
                <p>Add to Site</p>
              </button>
            </div>
          </div>

          {/* CTA Button */}
          <div className="cta-section fade-in-delay-3">
            <Link href="/dashboard">
              <a className="dashboard-button">Go to Dashboard</a>
            </Link>
          </div>
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
          background: linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%);
          color: #fff;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* Animated gradient orbs */
        .gradient-orbs {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.4;
          animation: float 20s infinite ease-in-out;
        }

        .orb1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, #667eea 0%, transparent 70%);
          top: -300px;
          right: -200px;
          animation-delay: 0s;
        }

        .orb2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #764ba2 0%, transparent 70%);
          bottom: -200px;
          left: -100px;
          animation-delay: 7s;
        }

        .orb3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #667eea 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 14s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 3rem;
          position: sticky;
          top: 0;
          background: rgba(15, 15, 15, 0.8);
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

        /* Main Content */
        .success-container {
          padding: 4rem 2rem;
          min-height: calc(100vh - 80px);
          position: relative;
          z-index: 1;
        }

        .success-content {
          max-width: 1024px;
          margin: 0 auto;
        }

        /* Success Header */
        .success-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .success-icon {
          display: inline-flex;
          margin-bottom: 1.5rem;
          animation: checkmark 0.6s ease-out;
        }

        @keyframes checkmark {
          0% {
            transform: scale(0) rotate(-45deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0);
            opacity: 1;
          }
        }

        .success-title {
          font-size: 3rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
          color: #fff;
        }

        .success-subtitle {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Code Display Box */
        .code-container {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 4rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .code-language {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 500;
        }

        .copy-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #fff;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          animation: pulse-subtle 2s infinite;
        }

        @keyframes pulse-subtle {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
          }
        }

        .copy-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
          animation: none;
        }

        .copy-button.copied {
          background: #10b981;
          border-color: #10b981;
          animation: none;
        }

        .code-block {
          padding: 2rem;
          overflow-x: auto;
          font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
          font-size: 0.875rem;
          line-height: 1.7;
          color: #e2e8f0;
        }

        .code-block code {
          white-space: pre;
        }

        /* Platform Integration Section */
        .platform-section {
          text-align: center;
          margin-bottom: 4rem;
        }

        .platform-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #fff;
        }

        .platform-subtitle {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 3rem;
        }

        .platform-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .platform-card {
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .platform-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
          background: rgba(102, 126, 234, 0.05);
        }

        .platform-icon {
          display: inline-flex;
          margin-bottom: 1rem;
          color: #667eea;
        }

        .platform-card h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .platform-card p {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
        }

        /* CTA Section */
        .cta-section {
          text-align: center;
          margin-top: 3rem;
        }

        .dashboard-button {
          display: inline-block;
          padding: 1rem 3rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          text-decoration: none;
          border-radius: 50px;
          font-size: 1.125rem;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
          letter-spacing: 0.5px;
        }

        .dashboard-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        }

        /* Animations */
        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .fade-in-delay-1 {
          animation: fadeIn 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }

        .fade-in-delay-2 {
          animation: fadeIn 0.6s ease-out 0.4s forwards;
          opacity: 0;
        }

        .fade-in-delay-3 {
          animation: fadeIn 0.6s ease-out 0.6s forwards;
          opacity: 0;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .header {
            padding: 1rem 1.5rem;
          }

          .nav {
            display: none;
          }

          .success-title {
            font-size: 2rem;
          }

          .success-subtitle {
            font-size: 1.125rem;
          }

          .platform-grid {
            grid-template-columns: 1fr;
          }

          .code-block {
            font-size: 0.75rem;
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}