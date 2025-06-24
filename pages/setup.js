import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Setup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    websiteUrl: '',
    tools: {
      summarize: false,
      remix: false,
      share: false,
      ads: false
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Format the URL to include protocol if missing
      let formattedUrl = formData.websiteUrl.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }

      // Generate widget code (simplified example)
      const code = `
<!-- Gist Widget -->
<script>
  window.GIST_CONFIG = {
    website: "${formattedUrl}",
    features: {
      summarize: ${formData.tools.summarize},
      remix: ${formData.tools.remix},
      share: ${formData.tools.share},
      ads: ${formData.tools.ads}
    }
  };
</script>
<script src="https://widget.gist.ai/v1/widget.js" async></script>
      `.trim();

      // Simulate API delay
      setTimeout(() => {
        setGeneratedCode(code);
        setIsGenerating(false);
        setShowCode(true);
      }, 2000); // 2 second delay to show loading
    } catch (error) {
      console.error('Error generating widget:', error);
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Head>
        <title>Setup - Gist</title>
        <meta name="description" content="Configure your Gist widget with custom settings" />
      </Head>

      <div className="setup-container">
        {isGenerating ? (
          <div className="loading-screen">
            <div className="loading-spinner"></div>
            <h2>Generating Your Widget...</h2>
            <p>This will only take a moment</p>
          </div>
        ) : showCode ? (
          <div className="code-result">
            <h1>Your Widget is Ready!</h1>
            <p>Copy the code below and paste it into your website's HTML where you want the widget to appear.</p>
            
            <div className="code-container">
              <pre><code>{generatedCode}</code></pre>
              <button 
                onClick={() => navigator.clipboard.writeText(generatedCode)}
                className="copy-button"
              >
                Copy Code
              </button>
            </div>

            <button 
              onClick={() => router.push('/dashboard')}
              className="dashboard-button"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="setup-form-container">
            <h1>Setup Your Widget</h1>
            <p className="setup-description">Configure your widget settings and get started in minutes</p>
            
            <form onSubmit={handleSubmit} className="setup-form">
              <div className="form-section">
                <h2>Your Information</h2>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="websiteUrl">Website URL</label>
                  <input
                    type="text"
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
                <h2>Widget Features</h2>
                <div className="features-grid">
                  <label className="feature-toggle">
                    <input
                      type="checkbox"
                      name="tools.summarize"
                      checked={formData.tools.summarize}
                      onChange={handleInputChange}
                    />
                    <span className="feature-label">Summarize</span>
                    <span className="feature-description">AI-powered article summaries</span>
                  </label>

                  <label className="feature-toggle">
                    <input
                      type="checkbox"
                      name="tools.remix"
                      checked={formData.tools.remix}
                      onChange={handleInputChange}
                    />
                    <span className="feature-label">Remix</span>
                    <span className="feature-description">Content remixing and adaptation</span>
                  </label>

                  <label className="feature-toggle">
                    <input
                      type="checkbox"
                      name="tools.share"
                      checked={formData.tools.share}
                      onChange={handleInputChange}
                    />
                    <span className="feature-label">Share</span>
                    <span className="feature-description">Social sharing capabilities</span>
                  </label>

                  <label className="feature-toggle">
                    <input
                      type="checkbox"
                      name="tools.ads"
                      checked={formData.tools.ads}
                      onChange={handleInputChange}
                    />
                    <span className="feature-label">Ads</span>
                    <span className="feature-description">Monetization features</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="submit-button">
                Generate Widget
              </button>
            </form>
          </div>
        )}
      </div>

      <style jsx>{`
        .setup-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #111827;
        }

        .setup-description {
          font-size: 1.1rem;
          color: #6B7280;
          margin-bottom: 2rem;
        }

        .setup-form {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #111827;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        input[type="text"],
        input[type="email"] {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          font-size: 1rem;
        }

        input[type="text"]:focus,
        input[type="email"]:focus {
          outline: none;
          border-color: #6366F1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .feature-toggle {
          display: grid;
          grid-template-areas:
            "checkbox header"
            "description description";
          grid-template-columns: auto 1fr;
          gap: 0.5rem 1rem;
          padding: 1rem;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          align-items: center;
        }

        .feature-toggle:hover {
          border-color: #6366F1;
          background: #F9FAFB;
        }

        .feature-toggle input[type="checkbox"] {
          grid-area: checkbox;
          margin: 0;
          width: 1.2rem;
          height: 1.2rem;
        }

        .feature-label {
          grid-area: header;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .feature-description {
          grid-area: description;
          font-size: 0.875rem;
          color: #6B7280;
          margin: 0;
        }

        .submit-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #FF6B6B 0%, #4F46E5 50%, #9333EA 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
          background: linear-gradient(135deg, #FF8787 0%, #6366F1 50%, #A855F7 100%);
        }

        .submit-button:active {
          transform: translateY(0);
        }

        .loading-screen {
          text-align: center;
          padding: 4rem 0;
        }

        .loading-spinner {
          border: 4px solid #F3F4F6;
          border-top: 4px solid #6366F1;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 2rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .code-result {
          text-align: center;
        }

        .code-container {
          background: #1F2937;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 2rem 0;
          position: relative;
        }

        pre {
          margin: 0;
          white-space: pre-wrap;
          color: #F9FAFB;
          text-align: left;
          font-family: monospace;
        }

        .copy-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.5rem 1rem;
          background: #374151;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .copy-button:hover {
          background: #4B5563;
        }

        .dashboard-button {
          padding: 1rem 2rem;
          background: #6366F1;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .dashboard-button:hover {
          background: #4F46E5;
        }

        @media (max-width: 640px) {
          .setup-container {
            padding: 20px;
          }

          h1 {
            font-size: 2rem;
          }

          .setup-form {
            padding: 1.5rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
} 