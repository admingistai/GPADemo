import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

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
  const [generatedCode, setGeneratedCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Generate Widget button clicked
    
    // Start loading
    setIsGenerating(true);
    
    // Format the URL to include protocol if missing
    let formattedUrl = formData.websiteUrl.trim();
    if (formattedUrl && !formattedUrl.match(/^https?:\/\//)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      // Store the setup data in Vercel Blob
      const response = await fetch('/api/store-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          websiteUrl: formattedUrl,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to store setup data');
      }

      const { setupId, url } = await response.json();

      // Generate the widget code with the setup ID
      const widgetConfig = {
        url: formattedUrl,
        features: formData.tools,
        user: {
          name: formData.name,
          email: formData.email
        },
        setupId // Include the setup ID in the widget config
      };

      const code = `<!-- Gist Widget -->
<script>
  window.gistConfig = ${JSON.stringify(widgetConfig, null, 2)};
</script>
<script src="https://widget.gist.ai/widget.js" async></script>
<!-- End Gist Widget -->`;

      setGeneratedCode(code);
      setShowCode(true);

      // Widget generated successfully
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to generate widget. Please try again.');

      // Widget generation failed
    } finally {
      setIsGenerating(false);
    }
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

  const handleDashboardClick = () => {
    // Dashboard button clicked
    router.push('/dashboard');
  };

  const handlePlatformIntegration = (platform) => {
    // Platform integration button clicked

    // Show platform-specific instructions
    // In the future, this could redirect to platform-specific installation pages
    const instructions = {
      wordpress: {
        title: 'WordPress Installation',
        message: 'To install on WordPress:\n\n1. Download the Gist plugin from WordPress.org\n2. Upload and activate the plugin\n3. Go to Settings > Gist and paste your configuration\n4. The widget will appear automatically on your posts'
      },
      shopify: {
        title: 'Shopify Installation', 
        message: 'To install on Shopify:\n\n1. Visit the Shopify App Store\n2. Search for "Gist Answers"\n3. Install the app to your store\n4. Configure your widget settings in the app dashboard'
      },
      drupal: {
        title: 'Drupal Installation',
        message: 'To install on Drupal:\n\n1. Download the Gist module from Drupal.org\n2. Install using Composer or manual upload\n3. Enable the module in Extend\n4. Configure the module settings and add your API key'
      },
      wix: {
        title: 'Wix Installation',
        message: 'To add to your Wix site:\n\n1. Open your Wix Editor\n2. Click "+ Add" and select "More"\n3. Choose "HTML Code" from the menu\n4. Paste your widget code in the HTML Code element\n5. The widget will appear on your published site'
      }
    };

    const instruction = instructions[platform];
    if (instruction) {
      alert(`${instruction.title}\n\n${instruction.message}`);
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
        ) : !showCode ? (
          <div className="setup-form-container">
            <h1>Generate your Ask Anything Widget</h1>
            <p className="setup-description">Configure your widget settings and get started in minutes</p>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
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
                    <span className="feature-label">Related Questions</span>
                    <span className="feature-description">Suggests relevant follow-up questions</span>
                  </label>

                  <label className="feature-toggle">
                    <input
                      type="checkbox"
                      name="tools.share"
                      checked={formData.tools.share}
                      onChange={handleInputChange}
                    />
                    <span className="feature-label">Read Aloud</span>
                    <span className="feature-description">Text-to-speech for answers</span>
                  </label>

                  <label className="feature-toggle">
                    <input
                      type="checkbox"
                      name="tools.ads"
                      checked={formData.tools.ads}
                      onChange={handleInputChange}
                    />
                    <span className="feature-label">Go Deeper</span>
                    <span className="feature-description">Provides in-depth explanations</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="submit-button">
                Generate
              </button>
            </form>
          </div>
        ) : (
          <div className="code-result">
            <h1>Your Widget is Ready!</h1>
            <p>Copy the code below and paste it into your website's HTML where you want the widget to appear.</p>
            
            <div className="code-container">
              <pre>
                <code>{generatedCode}</code>
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(generatedCode)}
                className="copy-button"
              >
                Copy Code
              </button>
            </div>
            
            <div className="integration-section">
              <h2>Easy Platform Integration</h2>
              <p>Install directly to your platform with one click:</p>
              
              <div className="integration-buttons">
                <button className="integration-btn wordpress-btn" onClick={() => handlePlatformIntegration('wordpress')}>
                  <div className="platform-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.158 12.786L9.46 20.625c.806.237 1.657.375 2.54.375 1.047 0 2.051-.18 2.986-.51-.024-.039-.046-.081-.065-.126l-2.763-7.578zm6.84-4.068c0 1.029-.39 1.741-.726 2.293-.445.726-.861 1.342-.861 2.068 0 .809.616 1.563 1.488 1.563.039 0 .076-.005.114-.007C18.267 16.15 17.143 17 15.846 17c-1.951 0-3.541-1.59-3.541-3.541 0-.456.097-.886.261-1.283l.86-2.365.01-.029c.39-1.067.86-2.293.86-4.154 0-1.563-.571-2.628-1.488-2.628-.651 0-1.097.456-1.097 1.097 0 .511.313.97.313 1.494 0 .809-.611 1.451-1.488 1.451C9.736 7.042 9 6.306 9 5.5c0-1.563 1.284-2.84 2.903-2.84 1.951 0 3.284 1.34 3.284 3.541 0 1.903-.765 3.284-1.488 4.513z"/>
                    </svg>
                  </div>
                  <div className="platform-text">
                    <span className="platform-name">WordPress</span>
                    <span className="platform-desc">Install as Plugin</span>
                  </div>
                </button>
                
                <button className="integration-btn shopify-btn" onClick={() => handlePlatformIntegration('shopify')}>
                  <div className="platform-logo">
                    {/* Shopify SVG placeholder */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="2" y="2" width="20" height="20" rx="4" />
                      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff">S</text>
                    </svg>
                  </div>
                  <div className="platform-text">
                    <span className="platform-name">Shopify</span>
                    <span className="platform-desc">Install as App</span>
                  </div>
                </button>
                <button className="integration-btn drupal-btn" onClick={() => handlePlatformIntegration('drupal')}>
                  <div className="platform-logo">
                    {/* Drupal SVG placeholder */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" />
                      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff">D</text>
                    </svg>
                  </div>
                  <div className="platform-text">
                    <span className="platform-name">Drupal</span>
                    <span className="platform-desc">Install as Module</span>
                  </div>
                </button>
                <button className="integration-btn wix-btn" onClick={() => handlePlatformIntegration('wix')}>
                  <div className="platform-logo">
                    {/* Wix SVG placeholder */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <ellipse cx="12" cy="12" rx="10" ry="8" />
                      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff">W</text>
                    </svg>
                  </div>
                  <div className="platform-text">
                    <span className="platform-name">Wix</span>
                    <span className="platform-desc">Add as HTML</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}