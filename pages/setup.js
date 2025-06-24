import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Setup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    websiteUrl: '',
    tools: {
      summarize: false,
      remix: false,
      share: false
    },
    adSettings: {
      proRataAds: false
    },
    theme: {
      color: '#3742fa',
      faviconLogo: ''
    }
  });
  const [generatedCode, setGeneratedCode] = useState('');
  const [showCode, setShowCode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate the widget code based on form data
    const widgetConfig = {
      url: formData.websiteUrl,
      features: formData.tools,
      ads: formData.adSettings,
      theme: formData.theme
    };

    const code = `<!-- Ask Anything™ Widget -->
<script>
  window.askAnythingConfig = ${JSON.stringify(widgetConfig, null, 2)};
</script>
<script src="https://widget.ask-anything.ai/widget.js" async></script>
<!-- End Ask Anything™ Widget -->`;

    setGeneratedCode(code);
    setShowCode(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  return (
    <>
      <Head>
        <title>Setup - Ask Anything™</title>
        <meta name="description" content="Configure your Ask Anything™ widget with custom settings and generate the code for your website." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/Gist_Mark_000000.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/Gist_Mark_000000.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/Gist_Mark_000000.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/Gist_Mark_000000.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/Gist_Mark_000000.png" />
      </Head>

      <div className="app">
        <div className="setup-page">
          <header className="header">
            <div className="header-left">
              <img 
                src="/Gist_Mark_000000.png" 
                alt="Ask Anything™ Logo" 
                className="gist-logo" 
                onClick={() => router.push('/')} 
              />
              <h1 className="logo">Ask<br />Anything™</h1>
            </div>
            <div className="header-right">
              <span className="tagline">100% ethical, uses fully licensed sources</span>
            </div>
          </header>

          <main className="main-content">
            {!showCode ? (
              <>
                <h1 className="main-title">
                  Setup Your Ask Anything™ Widget
                </h1>
                
                <p className="setup-subhead">
                  Configure your widget settings and generate the code to add to your website.
                </p>
                
                <div className="setup-form-container">
                  <div className="setup-card">
                    <form onSubmit={handleSubmit} className="setup-form">
                      <div className="form-section">
                        <h3 className="section-title">Website Information</h3>
                        <div className="form-group">
                          <label htmlFor="websiteUrl">Website URL *</label>
                          <input
                            type="url"
                            id="websiteUrl"
                            name="websiteUrl"
                            value={formData.websiteUrl}
                            onChange={handleInputChange}
                            required
                            placeholder="https://yourwebsite.com"
                          />
                        </div>
                      </div>

                      <div className="form-section">
                        <h3 className="section-title">Tools</h3>
                        <div className="tools-grid">
                          <div className="tool-item">
                            <input
                              type="checkbox"
                              id="summarize"
                              name="tools.summarize"
                              checked={formData.tools.summarize}
                              onChange={handleInputChange}
                            />
                            <label htmlFor="summarize" className="tool-label">
                              <span className="tool-name">Summarize</span>
                              <span className="tool-description">One-sentence AI summary of any content</span>
                            </label>
                          </div>
                          
                          <div className="tool-item">
                            <input
                              type="checkbox"
                              id="remix"
                              name="tools.remix"
                              checked={formData.tools.remix}
                              onChange={handleInputChange}
                            />
                            <label htmlFor="remix" className="tool-label">
                              <span className="tool-name">Remix</span>
                              <span className="tool-description">Transform content into different formats</span>
                            </label>
                          </div>
                          
                          <div className="tool-item">
                            <input
                              type="checkbox"
                              id="share"
                              name="tools.share"
                              checked={formData.tools.share}
                              onChange={handleInputChange}
                            />
                            <label htmlFor="share" className="tool-label">
                              <span className="tool-name">Share</span>
                              <span className="tool-description">Enhanced sharing with AI-powered insights</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="form-section">
                        <h3 className="section-title">Ad Settings</h3>
                        <div className="tool-item">
                          <input
                            type="checkbox"
                            id="proRataAds"
                            name="adSettings.proRataAds"
                            checked={formData.adSettings.proRataAds}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="proRataAds" className="tool-label">
                            <span className="tool-name">ProRata Ads</span>
                            <span className="tool-description">Enable revenue-sharing advertising</span>
                          </label>
                        </div>
                      </div>

                      <div className="form-section">
                        <h3 className="section-title">Theme</h3>
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="color">Primary Color</label>
                            <div className="color-input-wrapper">
                              <input
                                type="color"
                                id="color"
                                name="theme.color"
                                value={formData.theme.color}
                                onChange={handleInputChange}
                              />
                              <input
                                type="text"
                                value={formData.theme.color}
                                onChange={handleInputChange}
                                name="theme.color"
                                placeholder="#3742fa"
                                className="color-text-input"
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label htmlFor="faviconLogo">Favicon Logo URL</label>
                            <input
                              type="url"
                              id="faviconLogo"
                              name="theme.faviconLogo"
                              value={formData.theme.faviconLogo}
                              onChange={handleInputChange}
                              placeholder="https://yoursite.com/favicon.png"
                            />
                          </div>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="btn--primary"
                      >
                        Generate Widget Code
                      </button>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <div className="code-generation-result">
                <h1 className="main-title">
                  Your Widget Code is Ready!
                </h1>
                
                <p className="code-subhead">
                  Copy the code below and paste it into your website's HTML where you want the widget to appear.
                </p>
                
                <div className="code-container">
                  <div className="code-header">
                    <span className="code-title">Widget Installation Code</span>
                    <button 
                      onClick={copyToClipboard}
                      className="copy-btn"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                  <pre className="code-block">
                    <code>{generatedCode}</code>
                  </pre>
                </div>
                
                <div className="code-actions">
                  <button 
                    onClick={() => setShowCode(false)}
                    className="btn--secondary"
                  >
                    ← Back to Setup
                  </button>
                  <button 
                    onClick={() => router.push('/')}
                    className="btn--primary"
                  >
                    Return to Home
                  </button>
                </div>
              </div>
            )}
          </main>

          <footer className="legal-footer">
            <div>© 2024 Gist AI, Inc. All rights reserved.</div>
            <div className="legal-links">
              <button onClick={() => window.open('https://about.gist.ai/terms', '_blank')}>
                Terms of Service
              </button>
              <button onClick={() => window.open('https://about.gist.ai/privacy', '_blank')}>
                Privacy Policy
              </button>
            </div>
          </footer>
        </div>

        <style jsx global>{`
          body {
            background: linear-gradient(135deg, #F2F0FE 0%, #FFEFF6 100%);
            min-height: 100vh;
          }

          .setup-page, .setup-page * {
            color: #111827 !important;
          }
        `}</style>
        <style jsx>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          .app {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .setup-page {
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2rem 3rem;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            position: sticky;
            top: 0;
            z-index: 100;
          }

          .header-left {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .gist-logo {
            width: 40px;
            height: 40px;
            cursor: pointer;
            transition: transform 0.2s ease;
          }

          .gist-logo:hover {
            transform: scale(1.05);
          }

          .logo {
            font-size: 1.5rem;
            font-weight: 700;
            line-height: 1.2;
            color: #111827;
            cursor: pointer;
          }

          .header-right {
            display: flex;
            align-items: center;
            gap: 2rem;
          }

          .tagline {
            font-size: 0.9rem;
            color: #6b7280;
            font-weight: 500;
          }

          .main-content {
            flex: 1;
            padding: 4rem 3rem;
            max-width: 1000px;
            margin: 0 auto;
            width: 100%;
          }

          .main-title {
            font-size: 3rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 1.5rem;
            color: #111827;
            letter-spacing: -0.02em;
            line-height: 1.2;
          }

          .setup-subhead, .code-subhead {
            font-size: 1.2rem;
            text-align: center;
            color: #6b7280;
            margin-bottom: 3rem;
            line-height: 1.6;
          }

          .setup-form-container {
            max-width: 800px;
            margin: 0 auto;
          }

          .setup-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 3rem;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .form-section {
            margin-bottom: 3rem;
          }

          .form-section:last-of-type {
            margin-bottom: 2rem;
          }

          .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #f3f4f6;
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
          }

          label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #374151;
            font-size: 0.95rem;
          }

          input[type="text"],
          input[type="url"],
          input[type="email"] {
            width: 100%;
            padding: 0.875rem 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            font-size: 1rem;
            transition: all 0.2s ease;
            background: white;
          }

          input[type="text"]:focus,
          input[type="url"]:focus,
          input[type="email"]:focus {
            outline: none;
            border-color: #3742fa;
            box-shadow: 0 0 0 3px rgba(55, 66, 250, 0.1);
          }

          .tools-grid {
            display: grid;
            gap: 1rem;
          }

          .tool-item {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1.5rem;
            background: #f9fafb;
            border: 2px solid #f3f4f6;
            border-radius: 12px;
            transition: all 0.2s ease;
          }

          .tool-item:hover {
            border-color: #e5e7eb;
            background: #ffffff;
          }

          .tool-item input[type="checkbox"] {
            margin-top: 0.25rem;
            width: 1.25rem;
            height: 1.25rem;
            accent-color: #3742fa;
          }

          .tool-label {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            cursor: pointer;
            flex: 1;
          }

          .tool-name {
            font-weight: 600;
            color: #111827;
            font-size: 1rem;
          }

          .tool-description {
            font-size: 0.9rem;
            color: #6b7280;
            line-height: 1.4;
          }

          .color-input-wrapper {
            display: flex;
            gap: 1rem;
            align-items: center;
          }

          input[type="color"] {
            width: 4rem;
            height: 3rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            cursor: pointer;
            background: none;
          }

          .color-text-input {
            flex: 1;
          }

          .btn--primary {
            background: linear-gradient(135deg, #3742fa 0%, #5b67f7 100%);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            width: 100%;
            margin-top: 1rem;
          }

          .btn--primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(55, 66, 250, 0.3);
          }

          .btn--secondary {
            background: #f3f4f6;
            color: #374151;
            border: 2px solid #e5e7eb;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .btn--secondary:hover {
            background: #e5e7eb;
            border-color: #d1d5db;
          }

          .code-generation-result {
            text-align: center;
          }

          .code-container {
            background: #1f2937;
            border-radius: 16px;
            margin: 2rem 0;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          }

          .code-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            background: #374151;
            border-bottom: 1px solid #4b5563;
          }

          .code-title {
            color: #f9fafb;
            font-weight: 600;
            font-size: 0.95rem;
          }

          .copy-btn {
            background: #3742fa;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .copy-btn:hover {
            background: #5b67f7;
          }

          .code-block {
            padding: 2rem;
            margin: 0;
            background: #1f2937;
            color: #f9fafb;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9rem;
            line-height: 1.6;
            overflow-x: auto;
            text-align: left;
          }

          .code-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
          }

          .code-actions .btn--primary,
          .code-actions .btn--secondary {
            width: auto;
            margin-top: 0;
          }

          .legal-footer {
            padding: 2rem 3rem;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.9rem;
            color: #6b7280;
          }

          .legal-links {
            display: flex;
            gap: 2rem;
          }

          .legal-links button {
            background: none;
            border: none;
            color: #6b7280;
            cursor: pointer;
            font-size: 0.9rem;
            text-decoration: underline;
          }

          .legal-links button:hover {
            color: #3742fa;
          }

          @media (max-width: 768px) {
            .header {
              padding: 1.5rem 2rem;
            }

            .main-content {
              padding: 3rem 2rem;
            }

            .main-title {
              font-size: 2.5rem;
            }

            .setup-card {
              padding: 2rem;
            }

            .form-row {
              grid-template-columns: 1fr;
            }

            .color-input-wrapper {
              flex-direction: column;
              align-items: stretch;
            }

            .code-header {
              flex-direction: column;
              gap: 1rem;
              align-items: stretch;
            }

            .code-actions {
              flex-direction: column;
            }

            .legal-footer {
              flex-direction: column;
              gap: 1rem;
              text-align: center;
              padding: 2rem;
            }
          }

          @media (max-width: 480px) {
            .header {
              padding: 1rem;
            }

            .main-content {
              padding: 2rem 1rem;
            }

            .main-title {
              font-size: 2rem;
            }

            .setup-card {
              padding: 1.5rem;
            }

            .tagline {
              display: none;
            }
          }
        `}</style>
      </div>
    </>
  );
}