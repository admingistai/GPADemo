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
    
    // Format the URL to include protocol if missing
    let formattedUrl = formData.websiteUrl.trim();
    if (formattedUrl && !formattedUrl.match(/^https?:\/\//)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    // Generate the widget code based on form data
    const widgetConfig = {
      url: formattedUrl,
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
                <div className="compact-header">
                  <h1 className="main-title">Widget Setup</h1>
                  <p className="setup-subhead">Configure your settings and get your code</p>
                </div>
                
                <div className="setup-form-container">
                  <form onSubmit={handleSubmit} className="setup-form">
                    
                    {/* Website URL - Single field */}
                    <div className="form-section compact">
                      <div className="form-group">
                        <label htmlFor="websiteUrl">
                          <span className="label-icon">🌐</span>
                          Website URL *
                        </label>
                                                  <input
                            type="text"
                            id="websiteUrl"
                            name="websiteUrl"
                            value={formData.websiteUrl}
                            onChange={handleInputChange}
                            required
                            placeholder="yourwebsite.com"
                          />
                      </div>
                    </div>

                    {/* Tools & Features - Compact grid */}
                    <div className="form-section compact">
                      <h3 className="section-title">
                        <span className="section-icon">⚡</span>
                        Features
                      </h3>
                      <div className="tools-compact-grid">
                        <div className="tool-compact-item">
                          <input
                            type="checkbox"
                            id="summarize"
                            name="tools.summarize"
                            checked={formData.tools.summarize}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="summarize" className="tool-compact-label">
                            <span className="tool-name">Summarize</span>
                          </label>
                        </div>
                        
                        <div className="tool-compact-item">
                          <input
                            type="checkbox"
                            id="remix"
                            name="tools.remix"
                            checked={formData.tools.remix}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="remix" className="tool-compact-label">
                            <span className="tool-name">Remix</span>
                          </label>
                        </div>
                        
                        <div className="tool-compact-item">
                          <input
                            type="checkbox"
                            id="share"
                            name="tools.share"
                            checked={formData.tools.share}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="share" className="tool-compact-label">
                            <span className="tool-name">Share</span>
                          </label>
                        </div>
                        
                        <div className="tool-compact-item">
                          <input
                            type="checkbox"
                            id="proRataAds"
                            name="adSettings.proRataAds"
                            checked={formData.adSettings.proRataAds}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="proRataAds" className="tool-compact-label">
                            <span className="tool-name">ProRata Ads</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Theme Settings - Side by side */}
                    <div className="form-section compact">
                      <h3 className="section-title">
                        <span className="section-icon">🎨</span>
                        Appearance
                      </h3>
                      <div className="theme-grid">
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
                          <label htmlFor="faviconLogo">Logo URL</label>
                          <input
                            type="url"
                            id="faviconLogo"
                            name="theme.faviconLogo"
                            value={formData.theme.faviconLogo}
                            onChange={handleInputChange}
                            placeholder="https://yoursite.com/logo.png"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="btn--primary generate-btn"
                    >
                      Generate Widget
                    </button>
                  </form>
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

          .code-block, .code-block *, .code-header, .code-header * {
            color: white !important;
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
            padding: 2rem 1.5rem;
            max-width: 800px;
            margin: 0 auto;
            width: 100%;
          }

          .compact-header {
            text-align: center;
            margin-bottom: 2rem;
          }

          .main-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: #111827;
            letter-spacing: -0.02em;
            line-height: 1.2;
          }

          .setup-subhead, .code-subhead {
            font-size: 1.1rem;
            color: #6b7280;
            margin-bottom: 0;
            line-height: 1.5;
          }

          .setup-form-container {
            max-width: 100%;
          }

          .setup-form {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .form-section.compact {
            margin-bottom: 2rem;
          }

          .form-section.compact:last-of-type {
            margin-bottom: 1.5rem;
          }

          .section-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .section-icon {
            font-size: 1.1rem;
          }

          .label-icon {
            font-size: 0.9rem;
            margin-right: 0.5rem;
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

          .tools-compact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }

          .tool-compact-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            transition: all 0.2s ease;
          }

          .tool-compact-item:hover {
            border-color: #3742fa;
            background: #f1f5f9;
          }

          .tool-compact-item input[type="checkbox"] {
            width: 1.125rem;
            height: 1.125rem;
            accent-color: #3742fa;
            margin: 0;
          }

          .tool-compact-label {
            cursor: pointer;
            flex: 1;
          }

          .tool-name {
            font-weight: 600;
            color: #111827;
            font-size: 0.95rem;
          }

          .theme-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
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

          .generate-btn {
            margin-top: 1.5rem;
            padding: 1.125rem 2rem;
            font-size: 1.125rem;
            font-weight: 700;
            background: linear-gradient(135deg, #ff6b35 0%, #3742fa 50%, #8b5cf6 100%);
            color: white !important;
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
            background: #0d1117;
            border-radius: 16px;
            margin: 2rem 0;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            border: 1px solid #30363d;
          }

          .code-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            background: #161b22;
            border-bottom: 1px solid #30363d;
          }

          .code-title {
            color: white !important;
            font-weight: 600;
            font-size: 0.95rem;
          }

          .copy-btn {
            background: #238636;
            color: white !important;
            border: none;
            padding: 0.75rem 1.25rem;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid #2ea043;
          }

          .copy-btn:hover {
            background: #2ea043;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(46, 160, 67, 0.3);
          }

          .code-block {
            padding: 2rem;
            margin: 0;
            background: #0d1117;
            color: #f0f6fc !important;
            font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace;
            font-size: 1rem;
            line-height: 1.8;
            overflow-x: auto;
            text-align: left;
            white-space: pre;
            word-wrap: break-word;
          }

          .code-block code {
            color: #f0f6fc !important;
            background: transparent;
            font-family: inherit;
            font-size: inherit;
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
              padding: 1.5rem 1rem;
            }

            .main-content {
              padding: 1.5rem 1rem;
            }

            .main-title {
              font-size: 2rem;
            }

            .setup-form {
              padding: 1.5rem;
            }

            .tools-compact-grid {
              grid-template-columns: 1fr;
            }

            .theme-grid {
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
              padding: 1rem 0.75rem;
            }

            .main-content {
              padding: 1rem 0.75rem;
            }

            .main-title {
              font-size: 1.75rem;
            }

            .setup-form {
              padding: 1.25rem;
            }

            .section-title {
              font-size: 1.1rem;
            }

            .tagline {
              display: none;
            }

            .form-section.compact {
              margin-bottom: 1.5rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}