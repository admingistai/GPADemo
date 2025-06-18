import { useState, useEffect } from 'react';
import URLInputForm from '../components/URLInputForm';
import WebsiteDisplay from '../components/WebsiteDisplay';
import ErrorDisplay from '../components/ErrorDisplay';

export default function Home() {
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showWebsite, setShowWebsite] = useState(false);
  const [showFeatureSelection, setShowFeatureSelection] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState({
    recommendedQuestions: true,
    gist: true,
    askAnything: true,
    augmentedAnswers: false,
    goDeeper: false,
    ethicalAds: false,
    customVoices: false,
    remixing: false,
    addToDaily: false,
    augmentedSharing: false,
    customAgents: false,
    futureProofing: false
  });

  // Scroll animation effects
  useEffect(() => {
    const handleScroll = () => {
      // Animate elements on scroll - Simplified timing only
      const animateOnScroll = document.querySelectorAll('.animate-on-scroll');
      animateOnScroll.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 100;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('animate-visible');
        }
      });
    };

    const handleMouseMove = (e) => {
      // Mouse effects removed to prevent layout issues
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [showWebsite, showFeatureSelection, showLoadingScreen]);

  const handleUrlSubmit = async (url) => {
    try {
      setLoading(true);
      setError(null);
      setShowWebsite(false);
      
      // URL validation is now handled by URLInputForm component with auto-protocol addition
      // Test if the proxy endpoint can reach the URL
      const testResponse = await fetch(`/api/proxy?url=${encodeURIComponent(url)}&test=true`);
      const testResult = await testResponse.json();

      if (!testResponse.ok) {
        throw new Error(testResult.error || 'Unable to reach the specified website');
      }

      // Store URL and show feature selection instead of redirecting
      setTargetUrl(url);
      setShowFeatureSelection(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setShowWebsite(false);
    setShowFeatureSelection(false);
    setShowLoadingScreen(false);
    setTargetUrl('');
  };

  const handleFeatureToggle = (feature) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const handleGenerateWidget = () => {
    setShowFeatureSelection(false);
    setShowLoadingScreen(true);
    
    // After 7 seconds, redirect to the actual website
    setTimeout(() => {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
      window.open(proxyUrl, '_blank', 'noopener,noreferrer');
      
      // Reset state after a brief delay
      setTimeout(() => {
        setShowLoadingScreen(false);
        setTargetUrl('');
        setSelectedFeatures({
          recommendedQuestions: true,
          gist: true,
          askAnything: true,
          augmentedAnswers: false,
          goDeeper: false,
          ethicalAds: false,
          customVoices: false,
          remixing: false,
          addToDaily: false,
          augmentedSharing: false,
          customAgents: false,
          futureProofing: false
        });
      }, 1000);
    }, 7000);
  };

  return (
    <div className="container">
      {/* Feature Selection Screen */}
      {showFeatureSelection && (
        <section className="feature-selection">
          <div className="feature-selection-content">
            <div className="logo-section">
              <img src="/gist-logo.png" alt="Gist Logo" className="feature-logo" />
            </div>
            <h1>Configure Your Ethical AI Companion</h1>
            <p className="feature-subtitle">Choose from AI solutions built specifically for publishers and content creators—fully customizable and completely free. Deploy in minutes:</p>
            
            <div className="features-grid">
              {/* Available Features - Top Priority */}
              <div className={`feature-card ${selectedFeatures.askAnything ? 'selected' : ''}`} 
                   onClick={() => handleFeatureToggle('askAnything')}>
                <div className="feature-icon">🤖</div>
                <h3>Ask Anything</h3>
                <p>Site-wide conversational box designed to match your brand, trained on your archive; answers in milliseconds; keeps traffic on-domain.</p>
                <div className="toggle-indicator">
                  {selectedFeatures.askAnything ? '✓' : '+'}
                </div>
              </div>
              
              <div className={`feature-card ${selectedFeatures.gist ? 'selected' : ''}`} 
                   onClick={() => handleFeatureToggle('gist')}>
                <div className="feature-icon">📝</div>
                <h3>The Gist</h3>
                <p>One-sentence AI summary of any story; instant context for skimmers; proven to reduce bounce.</p>
                <div className="toggle-indicator">
                  {selectedFeatures.gist ? '✓' : '+'}
                </div>
              </div>
              
              <div className={`feature-card ${selectedFeatures.remixing ? 'selected' : ''}`} 
                   onClick={() => handleFeatureToggle('remixing')}>
                <div className="feature-icon">🎨</div>
                <h3>Remixing</h3>
                <p>Auto-converts articles into share-ready cards, reels, and threads; boosts organic reach without extra editing.</p>
                <div className="toggle-indicator">
                  {selectedFeatures.remixing ? '✓' : '+'}
                </div>
              </div>
              
              <div className={`feature-card ${selectedFeatures.augmentedSharing ? 'selected' : ''}`} 
                   onClick={() => handleFeatureToggle('augmentedSharing')}>
                <div className="feature-icon">📤</div>
                <h3>Augmented Sharing</h3>
                <p>Generates pre-written social posts and on-scroll highlights with backlinks; simplifies promotion, tracks attribution.</p>
                <div className="toggle-indicator">
                  {selectedFeatures.augmentedSharing ? '✓' : '+'}
                </div>
              </div>

              {/* Coming Soon Features */}
              <div className={`feature-card ${selectedFeatures.recommendedQuestions ? 'selected' : ''}`} 
                   onClick={() => handleFeatureToggle('recommendedQuestions')}>
                <div className="feature-icon">💡</div>
                <h3>Recommended Questions</h3>
                <p>Auto-generates the most asked follow-ups; placed inline to guide exploration; lifts page views per visit.</p>
                <div className="coming-soon-label">Coming Soon</div>
                <div className="toggle-indicator">
                  {selectedFeatures.recommendedQuestions ? '✓' : '+'}
                </div>
              </div>
              
              <div className={`feature-card ${selectedFeatures.augmentedAnswers ? 'selected' : ''}`} 
                   onClick={() => handleFeatureToggle('augmentedAnswers')}>
                <div className="feature-icon">🔗</div>
                <h3>Augmented Answers</h3>
                <p>Enriches replies with fully-licensed partner sources; citations included; maintains editorial trust.</p>
                <div className="coming-soon-label">Coming Soon</div>
                <div className="toggle-indicator">
                  {selectedFeatures.augmentedAnswers ? '✓' : '+'}
                </div>
              </div>
              
              <div className={`feature-card ${selectedFeatures.goDeeper ? 'selected' : ''}`} 
                   onClick={() => handleFeatureToggle('goDeeper')}>
                <div className="feature-icon">🔍</div>
                <h3>Go Deeper</h3>
                <p>One-click expandable sidebars with related articles, data, and media; extends time-on-page.</p>
                <div className="coming-soon-label">Coming Soon</div>
                <div className="toggle-indicator">
                  {selectedFeatures.goDeeper ? '✓' : '+'}
                </div>
              </div>
              
              <div className={`feature-card ${selectedFeatures.ethicalAds ? 'selected' : ''}`} 
                   onClick={() => handleFeatureToggle('ethicalAds')}>
                <div className="feature-icon">💰</div>
                <h3>Earn More with Ethical Ads</h3>
                <p>Privacy-safe generative ad units matched to content intent; new revenue stream, no user tracking.</p>
                <div className="coming-soon-label">Coming Soon</div>
                <div className="toggle-indicator">
                  {selectedFeatures.ethicalAds ? '✓' : '+'}
                </div>
              </div>
              
              <div className={`feature-card ${selectedFeatures.customVoices ? 'selected' : ''}`} 
                   onClick={() => handleFeatureToggle('customVoices')}>
                <div className="feature-icon">🎭</div>
                <h3>Custom Voices & Avatars</h3>
                <p>Branded TTS and 3-D presenter options; consistent tone across text, audio, and video.</p>
                <div className="coming-soon-label">Coming Soon</div>
                <div className="toggle-indicator">
                  {selectedFeatures.customVoices ? '✓' : '+'}
                </div>
              </div>
              
              <div className={`feature-card ${selectedFeatures.addToDaily ? 'selected' : ''}`} 
                   onClick={() => handleFeatureToggle('addToDaily')}>
                <div className="feature-icon">📅</div>
                <h3>Add to "My Daily"</h3>
                <p>Opt-in to a personalized site-wide or network-wide daily digest; drives habitual return traffic and incremental revenue.</p>
                <div className="coming-soon-label">Coming Soon</div>
                <div className="toggle-indicator">
                  {selectedFeatures.addToDaily ? '✓' : '+'}
                </div>
              </div>
              
              <div className={`feature-card ${selectedFeatures.customAgents ? 'selected' : ''}`} 
                   onClick={() => handleFeatureToggle('customAgents')}>
                <div className="feature-icon">🤖</div>
                <h3>Custom Publisher Agents</h3>
                <p>Build task-specific, goal-oriented AI companions (e.g., paywall support, live events); full control over scope, tone, and data.</p>
                <div className="coming-soon-label">Coming Soon</div>
                <div className="toggle-indicator">
                  {selectedFeatures.customAgents ? '✓' : '+'}
                </div>
              </div>
              
              <div className={`feature-card ${selectedFeatures.futureProofing ? 'selected' : ''}`} 
                   onClick={() => handleFeatureToggle('futureProofing')}>
                <div className="feature-icon">🚀</div>
                <h3>Future Proofing</h3>
                <p>One integration spins up an MCP server that exposes bot-friendly endpoints, surfaces structured answers, and lets trusted AI agents transact safely on-site.</p>
                <div className="coming-soon-label">Coming Soon</div>
                <div className="toggle-indicator">
                  {selectedFeatures.futureProofing ? '✓' : '+'}
                </div>
              </div>
            </div>
            
            <div className="feature-actions">
              <button className="btn-secondary" onClick={handleRetry}>
                ← Back
              </button>
              <button className="btn-primary" onClick={handleGenerateWidget}>
                Launch Revenue Engine →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Loading Screen */}
      {showLoadingScreen && (
        <section className="loading-screen">
          <div className="loading-content">
            <div className="logo-section">
              <img src="/gist-logo.png" alt="Gist Logo" className="loading-logo" />
            </div>
            <h1>Launching Your AI Companion</h1>
            <div className="loading-steps">
              {Object.entries(selectedFeatures)
                .filter(([key, isSelected]) => isSelected)
                .map(([key, isSelected], index) => {
                  const featureInfo = {
                    recommendedQuestions: { icon: "💡", text: "Generating recommended questions..." },
                    gist: { icon: "📝", text: "Creating AI summaries..." },
                    askAnything: { icon: "🤖", text: "Training conversational AI..." },
                    augmentedAnswers: { icon: "🔗", text: "Setting up augmented answers..." },
                    goDeeper: { icon: "🔍", text: "Building deep-dive sidebars..." },
                    ethicalAds: { icon: "💰", text: "Configuring ethical ad units..." },
                    customVoices: { icon: "🎭", text: "Setting up custom voices & avatars..." },
                    remixing: { icon: "🎨", text: "Enabling content remixing..." },
                    addToDaily: { icon: "📅", text: "Creating daily digest system..." },
                    augmentedSharing: { icon: "📤", text: "Setting up augmented sharing..." },
                    customAgents: { icon: "🤖", text: "Building custom publisher agents..." },
                    futureProofing: { icon: "🚀", text: "Deploying MCP server integration..." }
                  };
                  
                  return (
                    <div key={key} className="loading-step" style={{animationDelay: `${index * 0.5}s`}}>
                      <div className="step-icon">{featureInfo[key].icon}</div>
                      <span>{featureInfo[key].text}</span>
                    </div>
                  );
                })
              }
            </div>
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
          </div>
        </section>
      )}

      {!showWebsite && !showFeatureSelection && !showLoadingScreen && (
        <>
          {/* Hero Section */}
          <section className="hero">
            <div className="hero-content">
              <div className="logo-section">
                <img src="/gist-logo.png" alt="Gist Logo" className="hero-logo" />
              </div>
              <h1>Fight Fire With Fire—Get Your AI Companion</h1>
              <p className="hero-subtitle">
                  <strong>AI is stealing your content, readers, and revenue. Not anymore.</strong><br />
                  The ethical AI Companion from Gist Answers stops the big steal—keeping your users, content, and revenue where they belong: with you.
              </p>
              
              <div className="url-input-section">
                <URLInputForm 
                  onSubmit={handleUrlSubmit} 
                  loading={loading}
                  error={error}
                />
                {error && (
                  <ErrorDisplay 
                    error={error} 
                    onRetry={handleRetry}
                  />
                )}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="features animate-on-scroll">
            <div className="content-wrapper">
              <h2 className="animate-on-scroll">Why Publishers Choose the Ethical AI Companion</h2>
              
              <div className="features-table animate-on-scroll">
                <div className="table-header">
                  <div>Feature</div>
                  <div>What It Does</div>
                  <div>Benefit to You</div>
                </div>
                
                <div className="table-row animate-on-scroll">
                  <div className="feature-name"><strong>100% Licensed Content Sources</strong></div>
                  <div>Unlike any other AI solution—100% of answers sourced from licensed, opt-in content providers. No stealing, no scraping.</div>
                  <div>Answers from your content first, keeping users engaged and on your site longer while supporting ethical journalism.</div>
                </div>
                
                <div className="table-row animate-on-scroll">
                  <div className="feature-name"><strong>Completely Free & Ad-Supported</strong></div>
                  <div>100% private, ethical monetization solution that respects your users' privacy—no tracking or data harvesting.</div>
                  <div>Generate revenue through contextual ads that enhance user experience instead of interrupting it.</div>
                </div>
                
                <div className="table-row animate-on-scroll">
                  <div className="feature-name"><strong>Fully Customizable AI Companion</strong></div>
                  <div>Live in minutes with full editorial control over sources, tone, and brand voice—matches your design and values.</div>
                  <div>Can answer any question while keeping users on your site longer than traditional search solutions.</div>
                </div>
                
                <div className="table-row animate-on-scroll">
                  <div className="feature-name"><strong>Future-Proof & Always in Your Control</strong></div>
                  <div>Join thousands of publishers fighting back against AI theft and building the ethical AI movement.</div>
                  <div>Partner with creators who refuse to let big tech steal their livelihood—take back control of your content and revenue.</div>
                </div>
                
                <div className="table-row animate-on-scroll">
                  <div className="feature-name"><strong>Stop the Big Steal</strong></div>
                  <div>Fight back against AI platforms that steal your content without permission or compensation.</div>
                  <div>Reclaim your content, readers, and revenue from big tech companies exploiting your hard work.</div>
                </div>
                
                <div className="table-row animate-on-scroll">
                  <div className="feature-name"><strong>Ethical AI Movement</strong></div>
                  <div>Join thousands of publishers and creators building a fair, sustainable future for content creation.</div>
                  <div>Be part of the solution that respects creators' rights while providing valuable AI-powered experiences.</div>
                </div>
                
                <div className="table-row animate-on-scroll">
                  <div className="feature-name"><strong>Publisher-First Design</strong></div>
                  <div>Built specifically for publishers and content creators—not as an afterthought to big tech AI.</div>
                  <div>Every feature designed to protect your interests while enhancing your readers' experience.</div>
                </div>
                
                <div className="table-row animate-on-scroll">
                  <div className="feature-name"><strong>Keep Users Where They Belong</strong></div>
                  <div>Unlike traditional search that sends users away, our AI keeps them engaged on your site longer.</div>
                  <div>Your content, your readers, your revenue—all staying exactly where they should be: with you.</div>
                </div>
                
                <div className="table-row animate-on-scroll">
                  <div className="feature-name"><strong>Fight Fire With Fire</strong></div>
                  <div>Use AI to defend against AI—leverage the same technology that's threatening your business to protect it.</div>
                  <div>Turn the tables on content theft and reclaim your rightful place in the digital ecosystem.</div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonial Section */}
          <section className="testimonial animate-on-scroll">
            <div className="content-wrapper">
              <h2 className="animate-on-scroll">Publishers Are Fighting Back and Winning</h2>
              <blockquote className="animate-on-scroll">
                "The AI Companion from Gist Answers helped us reclaim our content and readers from big tech. We're keeping users on our site longer while generating ethical revenue—finally, an AI solution built for us, not against us."
                <cite>— <strong>Independent Publisher</strong></cite>
              </blockquote>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="how-it-works animate-on-scroll">
            <div className="content-wrapper">
              <h2 className="animate-on-scroll">Join the Fight in Under 5 Minutes</h2>
              <div className="steps animate-on-scroll">
                <div className="step animate-on-scroll">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Connect Your Content</h3>
                    <p>Upload your content or connect your CMS—we respect your permissions and licensing, unlike big tech AI.</p>
                  </div>
                </div>
                <div className="step animate-on-scroll">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Launch Your AI Companion</h3>
                    <p>Fully customizable AI goes live on your site—matches your design, voice, and values with full editorial control.</p>
                  </div>
                </div>
                <div className="step animate-on-scroll">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>Fight Fire With Fire</h3>
                    <p>Keep users, content, and revenue where they belong—with you. Future-proof and always in your control.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="cta animate-on-scroll">
            <div className="content-wrapper">
              <h2 className="animate-on-scroll">Join the Ethical AI Movement</h2>
              <p className="animate-on-scroll"><strong>Test your AI Companion above</strong> and join thousands of publishers fighting back against content theft. <strong>It's time to fight fire with fire.</strong></p>
            </div>
          </section>

          {/* Footer */}
          <footer className="footer">
            <div className="content-wrapper">
              <p>© 2025 ProRata.ai | Privacy • Terms • Security</p>
            </div>
          </footer>
        </>
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

        body, html {
          margin: 0;
          padding: 0;
        }

        .container {
          min-height: 100vh;
          font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          overflow-x: hidden;
          margin: 0;
          padding: 0;
        }

        /* Hero Section */
        .hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          background-size: 400% 400%;
          animation: gradientShift 8s ease infinite;
          color: white;
          padding: 4rem 2rem;
          text-align: center;
          min-height: 75vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .hero::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(ellipse 300px 100px at 20% 30%, rgba(255,255,255,0.25) 0%, transparent 70%),
            radial-gradient(ellipse 200px 150px at 80% 70%, rgba(255,255,255,0.2) 0%, transparent 70%),
            radial-gradient(ellipse 250px 80px at 50% 20%, rgba(255,255,255,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 180px 120px at 30% 80%, rgba(255,255,255,0.1) 0%, transparent 60%);
          opacity: 1;
          pointer-events: none;
          animation: heroFlow 25s ease-in-out infinite;
        }

        @keyframes heroFlow {
          0%, 100% { 
            transform: translateX(0) translateY(0) scale(1);
          }
          25% { 
            transform: translateX(20px) translateY(-10px) scale(1.05);
          }
          50% { 
            transform: translateX(-15px) translateY(15px) scale(0.95);
          }
          75% { 
            transform: translateX(10px) translateY(-5px) scale(1.02);
          }
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Hero Content */
                 .hero-content {
          max-width: 900px;
           width: 100%;
          position: relative;
          z-index: 2;
          animation: fadeInUp 1s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
         }

         .logo-section {
          margin-bottom: 2rem;
          animation: fadeInUp 1s ease-out 0.2s both;
         }

         .hero-logo {
          height: 150px;
           width: auto;
          filter: drop-shadow(0 10px 30px rgba(0,0,0,0.3)) drop-shadow(0 0 20px rgba(0,0,0,0.8)) drop-shadow(0 0 40px rgba(0,0,0,0.6));
          transition: transform 0.3s ease;
        }

        .hero-logo:hover {
          transform: scale(1.05) rotate(2deg);
         }

         .hero h1 {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 3.2rem;
           font-weight: 700;
           margin: 0 0 1.5rem 0;
           letter-spacing: -0.02em;
          background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #dbeafe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 4px 20px rgba(0,0,0,0.3);
          animation: fadeInUp 1s ease-out 0.4s both;
         }

         .hero-subtitle {
          font-size: 1.2rem;
          margin: 0 0 2.5rem 0;
          opacity: 0.95;
           max-width: 600px;
           margin-left: auto;
           margin-right: auto;
          color: #f8fafc;
          line-height: 1.6;
          text-shadow: 0 2px 10px rgba(0,0,0,0.2);
          animation: fadeInUp 1s ease-out 0.6s both;
         }

        .url-input-section {
          margin-top: 2rem;
          animation: fadeInUp 1s ease-out 0.8s both;
        }

        /* Content Wrapper */
        .content-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* Features Section */
        .features {
          padding: 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          position: relative;
          overflow: hidden;
        }

        .features::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .features::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(ellipse 400px 200px at 30% 40%, rgba(99, 102, 241, 0.25) 0%, transparent 60%),
            radial-gradient(ellipse 300px 150px at 70% 60%, rgba(139, 92, 246, 0.22) 0%, transparent 60%),
            radial-gradient(circle 100px at 20% 80%, rgba(99, 102, 241, 0.28) 0%, transparent 50%),
            radial-gradient(circle 80px at 80% 20%, rgba(139, 92, 246, 0.24) 0%, transparent 50%);
          opacity: 1;
          pointer-events: none;
          animation: featuresFloat 30s ease-in-out infinite;
        }

        @keyframes featuresFloat {
          0%, 100% { 
            transform: translateX(0) translateY(0) rotate(0deg);
          }
          33% { 
            transform: translateX(30px) translateY(-20px) rotate(2deg);
          }
          66% { 
            transform: translateX(-25px) translateY(25px) rotate(-2deg);
          }
        }

        .features h2 {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 2.5rem;
          text-align: center;
          margin: 0 0 2rem 0;
          padding-top: 3rem;
          background: linear-gradient(135deg, #1a202c 0%, #4a5568 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          letter-spacing: -0.01em;
          position: relative;
          z-index: 2;
        }

        .features-table {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.2);
          overflow: hidden;
          position: relative;
          z-index: 2;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          flex-direction: column;
          transform: none !important;
          margin-bottom: 3rem;
        }

        .table-header {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          background: linear-gradient(135deg, #4B66FF 0%, #7C3AED 100%);
          color: white;
          padding: 1.5rem 1.2rem;
          font-weight: 700;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: relative;
          z-index: 10;
          border-radius: 20px 20px 0 0;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          padding: 1.5rem 1.2rem;
          border-bottom: 1px solid rgba(226, 232, 240, 0.5);
          align-items: start;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
          background: white;
          transform: none !important;
        }

        .table-row:hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-row:nth-child(even) {
          background: rgba(248, 250, 252, 0.5);
        }

        .table-row:nth-child(even):hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
        }

        .feature-name {
          color: #2d3748;
          font-weight: 600;
          position: relative;
        }

        .feature-name::before {
          content: '';
          position: absolute;
          left: -10px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 20px;
          background: linear-gradient(135deg, #4B66FF 0%, #7C3AED 100%);
          border-radius: 2px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .table-row:hover .feature-name::before {
          opacity: 1;
        }

        /* Testimonial Section */
        .testimonial {
          padding: 4rem 0;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          position: relative;
          overflow: hidden;
        }

        .testimonial::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 30% 70%, rgba(99, 102, 241, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .testimonial::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(ellipse 500px 300px at 40% 30%, rgba(99, 102, 241, 0.22) 0%, transparent 70%),
            radial-gradient(ellipse 350px 200px at 60% 70%, rgba(139, 92, 246, 0.18) 0%, transparent 70%),
            radial-gradient(circle 150px at 80% 40%, rgba(99, 102, 241, 0.2) 0%, transparent 60%),
            radial-gradient(circle 120px at 20% 60%, rgba(139, 92, 246, 0.16) 0%, transparent 60%);
          opacity: 1;
          pointer-events: none;
          animation: testimonialGlow 35s ease-in-out infinite;
        }

        @keyframes testimonialGlow {
          0%, 100% { 
            transform: translateX(0) translateY(0) scale(1);
          }
          25% { 
            transform: translateX(15px) translateY(-10px) scale(1.02);
          }
          50% { 
            transform: translateX(-20px) translateY(20px) scale(0.98);
          }
          75% { 
            transform: translateX(10px) translateY(-15px) scale(1.01);
          }
        }

        .testimonial h2 {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 2.5rem;
          text-align: center;
          margin: 0 0 2.5rem 0;
          background: linear-gradient(135deg, #1a202c 0%, #4a5568 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          letter-spacing: -0.01em;
          position: relative;
          z-index: 2;
        }

                 blockquote {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
           font-size: 1.5rem;
          font-style: normal;
           text-align: center;
           margin: 0;
           color: #1a202c;
           max-width: 800px;
           margin: 0 auto;
           line-height: 1.7;
          position: relative;
          z-index: 2;
          padding: 2.5rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-weight: 500;
        }

        blockquote::before {
          content: '"';
          font-size: 4rem;
          color: #4B66FF;
          position: absolute;
          top: -10px;
          left: 20px;
          font-family: Georgia, serif;
          opacity: 0.3;
        }

        blockquote::after {
          content: '"';
          font-size: 4rem;
          color: #4B66FF;
          position: absolute;
          bottom: -30px;
          right: 20px;
          font-family: Georgia, serif;
          opacity: 0.3;
         }

         cite {
           display: block;
          margin-top: 2rem;
           font-style: normal;
          background: linear-gradient(135deg, #4B66FF 0%, #7C3AED 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.2rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
         }

        /* How It Works Section */
        .how-it-works {
          padding: 4rem 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          position: relative;
          overflow: hidden;
        }

        .how-it-works::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 40% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.12) 0%, transparent 50%);
          pointer-events: none;
        }

        .how-it-works::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(ellipse 350px 180px at 25% 60%, rgba(99, 102, 241, 0.18) 0%, transparent 70%),
            radial-gradient(ellipse 280px 140px at 75% 40%, rgba(139, 92, 246, 0.16) 0%, transparent 70%),
            radial-gradient(circle 120px at 60% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 60%),
            radial-gradient(circle 90px at 20% 85%, rgba(139, 92, 246, 0.18) 0%, transparent 60%);
          opacity: 1;
          pointer-events: none;
          animation: stepsPattern 20s ease-in-out infinite;
        }

        @keyframes stepsPattern {
          0%, 100% { 
            transform: translateX(0) translateY(0) scale(1);
          }
          25% { 
            transform: translateX(25px) translateY(-15px) scale(1.05);
          }
          50% { 
            transform: translateX(-20px) translateY(20px) scale(0.95);
          }
          75% { 
            transform: translateX(15px) translateY(-10px) scale(1.02);
          }
        }

        .how-it-works h2 {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 2.5rem;
          text-align: center;
          margin: 0 0 3rem 0;
          background: linear-gradient(135deg, #1a202c 0%, #4a5568 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          letter-spacing: -0.01em;
          position: relative;
          z-index: 2;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .step {
          display: flex;
          align-items: flex-start;
          gap: 1.2rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 
            0 15px 30px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .step::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #4B66FF 0%, #7C3AED 100%);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .step:hover {
          transform: translateY(-5px);
          box-shadow: 
            0 30px 60px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.3);
        }

        .step:hover::before {
          transform: scaleX(1);
        }

        .step-number {
          background: linear-gradient(135deg, #4B66FF 0%, #7C3AED 100%);
          color: white;
          width: 4rem;
          height: 4rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 1.6rem;
          flex-shrink: 0;
          box-shadow: 0 12px 35px rgba(75, 102, 255, 0.5), 0 4px 15px rgba(0, 0, 0, 0.2);
          position: relative;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 3px solid white;
        }

        .step:hover .step-number {
          transform: scale(1.15) rotate(10deg);
          box-shadow: 0 15px 40px rgba(75, 102, 255, 0.5);
          background: linear-gradient(135deg, #7C3AED 0%, #4B66FF 100%);
        }

        .step.animate-visible .step-number {
          animation: bounceIn 0.8s ease-out, pulse 2s infinite 1s;
        }

        @keyframes bounceIn {
          0% { 
            opacity: 0;
            transform: scale(0.1) rotate(-180deg);
          }
          60% { 
            opacity: 1;
            transform: scale(1.2) rotate(-10deg);
          }
          100% { 
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        .step-number::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, #4B66FF 0%, #7C3AED 100%);
          border-radius: 50%;
          z-index: -1;
          opacity: 0.3;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.1; }
        }

        .step-content h3 {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
          margin: 0 0 0.8rem 0;
          color: #2d3748;
          font-size: 1.3rem;
          font-weight: 600;
        }

                 .step-content p {
           margin: 0;
          color: #4a5568;
          font-size: 1rem;
          line-height: 1.5;
         }

         /* CTA Section */
         .cta {
           padding: 4rem 0;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
           text-align: center;
          position: relative;
          overflow: hidden;
        }

        .cta::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .cta::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(ellipse 400px 250px at 30% 30%, rgba(99, 102, 241, 0.16) 0%, transparent 80%),
            radial-gradient(ellipse 300px 200px at 70% 70%, rgba(139, 92, 246, 0.14) 0%, transparent 80%),
            radial-gradient(circle 150px at 80% 30%, rgba(99, 102, 241, 0.18) 0%, transparent 70%),
            radial-gradient(circle 100px at 20% 70%, rgba(139, 92, 246, 0.16) 0%, transparent 70%);
          opacity: 1;
          pointer-events: none;
          animation: ctaGlow 28s ease-in-out infinite;
        }

        @keyframes ctaGlow {
          0%, 100% { 
            transform: translateX(0) translateY(0) rotate(0deg);
          }
          33% { 
            transform: translateX(20px) translateY(-12px) rotate(1deg);
          }
          66% { 
            transform: translateX(-18px) translateY(18px) rotate(-1deg);
          }
         }

         .cta h2 {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
           font-size: 2.5rem;
          margin: 0 0 1.5rem 0;
          background: linear-gradient(135deg, #1a202c 0%, #4a5568 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          letter-spacing: -0.01em;
          position: relative;
          z-index: 2;
         }

         .cta p {
          font-size: 1.2rem;
           margin: 0;
          color: #4a5568;
          position: relative;
          z-index: 2;
          max-width: 550px;
          margin: 0 auto;
          line-height: 1.5;
         }

                 /* Footer */
         .footer {
          background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
           color: #e2e8f0;
           padding: 2rem 0;
           text-align: center;
          position: relative;
          overflow: hidden;
        }

        .footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.12) 0%, transparent 50%);
          pointer-events: none;
        }

        .footer::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(ellipse 200px 80px at 20% 50%, rgba(99, 102, 241, 0.18) 0%, transparent 70%),
            radial-gradient(ellipse 180px 70px at 80% 50%, rgba(139, 92, 246, 0.16) 0%, transparent 70%),
            radial-gradient(circle 60px at 50% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 60%),
            radial-gradient(circle 50px at 50% 80%, rgba(139, 92, 246, 0.18) 0%, transparent 60%);
          opacity: 1;
          pointer-events: none;
          animation: footerShimmer 32s ease-in-out infinite;
        }

        @keyframes footerShimmer {
          0%, 100% { 
            transform: translateX(0) scaleX(1);
          }
          50% { 
            transform: translateX(15px) scaleX(1.1);
          }
         }

         .footer p {
           margin: 0;
          font-size: 1rem;
          position: relative;
          z-index: 2;
          opacity: 0.8;
        }

        /* Feature Selection Screen */
        .feature-selection {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          background-size: 400% 400%;
          animation: gradientShift 8s ease infinite;
          color: white;
          padding: 2rem 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .feature-selection::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .feature-selection-content {
          max-width: 1000px;
          width: 100%;
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .feature-logo {
          height: 90px;
          width: auto;
          margin-bottom: 1rem;
          filter: drop-shadow(0 10px 30px rgba(0,0,0,0.3)) drop-shadow(0 0 20px rgba(0,0,0,0.8)) drop-shadow(0 0 40px rgba(0,0,0,0.6));
        }

        .feature-selection h1 {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 2.2rem;
          font-weight: 700;
          margin: 0 0 0.8rem 0;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #dbeafe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .feature-subtitle {
          font-size: 1rem;
          margin: 0 0 2rem 0;
          opacity: 0.95;
          color: #f8fafc;
          line-height: 1.5;
          text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid rgba(255, 255, 255, 0.2);
          position: relative;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .feature-card.selected {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 0.8rem;
        }

        .feature-card h3 {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 0.8rem 0;
          color: white;
        }

        .feature-card p {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.4;
          margin: 0;
        }

        .toggle-indicator {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .feature-card.selected .toggle-indicator {
          background: rgba(34, 197, 94, 0.8);
          color: white;
        }

        .coming-soon-label {
          position: absolute;
          top: 0.5rem;
          left: 0.5rem;
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
          color: white;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
          z-index: 5;
        }

        .feature-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .btn-primary, .btn-secondary {
          padding: 0.8rem 2rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease !important;
          border: none;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          opacity: 1 !important;
          transform: none !important;
        }

        .btn-primary {
          background: linear-gradient(135deg, #4B66FF 0%, #7C3AED 100%) !important;
          color: white !important;
          box-shadow: 0 10px 25px rgba(75, 102, 255, 0.3) !important;
        }

        .btn-primary:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 15px 35px rgba(75, 102, 255, 0.4) !important;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.2) !important;
          color: white !important;
          border: 2px solid rgba(255, 255, 255, 0.3) !important;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.3) !important;
          transform: translateY(-2px) !important;
        }

        /* Loading Screen */
        .loading-screen {
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          background-size: 400% 400%;
          animation: gradientShift 8s ease infinite;
          color: white;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .loading-screen::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .loading-content {
          max-width: 450px;
          width: 100%;
          text-align: center;
          position: relative;
          z-index: 2;
          max-height: 90vh;
          overflow: hidden;
        }

        .loading-screen .logo-section {
          margin-bottom: 1rem;
          animation: none;
          opacity: 1;
          transform: none;
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .loading-logo {
          height: 80px;
          width: auto;
          display: block;
          opacity: 1;
          margin: 0 auto;
        }

        .loading-screen h1 {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0 0 1.5rem 0;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #dbeafe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .loading-steps {
          margin-bottom: 1.5rem;
          max-height: 40vh;
          overflow-y: auto;
        }

        .loading-step {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 0.6rem;
          margin-bottom: 0.3rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          backdrop-filter: blur(10px);
          animation: loadingPulse 2s ease-in-out infinite;
        }

        @keyframes loadingPulse {
          0%, 100% { 
            background: rgba(255, 255, 255, 0.1);
            transform: scale(1);
          }
          50% { 
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.02);
          }
        }

        .step-icon {
          font-size: 1.5rem;
        }

        .loading-step span {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .loading-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          overflow: hidden;
        }

        .loading-progress {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #4B66FF 0%, #7C3AED 100%);
          border-radius: 3px;
          animation: loadingProgress 7s ease-out;
        }

        @keyframes loadingProgress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
         }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .hero {
            padding: 3rem 1rem;
            min-height: 70vh;
          }

          .hero h1 {
            font-size: 2.5rem;
            margin-bottom: 1.2rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
            margin-bottom: 2rem;
          }

          .hero-logo {
            height: 120px;
          }

          .features h2, .testimonial h2, .how-it-works h2, .cta h2 {
            font-size: 2rem;
          }

          .table-header, .table-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .table-header {
            display: none;
          }

          .table-row {
            display: block;
            padding: 1.5rem 1.2rem;
          }

          .table-row > div {
            margin-bottom: 1.2rem;
          }

          .table-row > div:last-child {
            margin-bottom: 0;
          }

          .feature-name::after {
            content: ":";
            color: #4B66FF;
            font-weight: 600;
          }

          blockquote {
            font-size: 1.3rem;
            padding: 1.8rem;
            margin: 0 1rem;
          }

          blockquote::before,
          blockquote::after {
            font-size: 3rem;
          }

          .steps {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .step {
            padding: 1.5rem;
            margin: 0 1rem;
          }

          .step-number {
            width: 3.5rem;
            height: 3.5rem;
            font-size: 1.4rem;
            font-weight: 900;
            border: 2px solid white;
          }

          .content-wrapper {
            padding: 0 1rem;
          }

          .features, .testimonial, .how-it-works, .cta {
            padding: 3rem 0;
          }

          .hero-content {
            max-width: 100%;
          }

          .feature-selection, .loading-screen {
            padding: 1rem 0.5rem;
          }

          .feature-selection h1, .loading-screen h1 {
            font-size: 1.6rem;
            margin-bottom: 1rem;
          }

          .features-grid {
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 1rem;
          }

          .feature-card {
            padding: 1.2rem;
          }

          .feature-actions {
            flex-direction: column;
            gap: 1rem;
          }

          .btn-primary, .btn-secondary {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .hero h1 {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .features h2, .testimonial h2, .how-it-works h2, .cta h2 {
            font-size: 1.7rem;
          }

          blockquote {
            font-size: 1.1rem;
            padding: 1.3rem;
          }

          .step {
            flex-direction: column;
            text-align: center;
            gap: 0.8rem;
            padding: 1.2rem;
          }

          .step-number {
            align-self: center;
            width: 3.2rem;
            height: 3.2rem;
            font-size: 1.3rem;
            font-weight: 900;
            border: 2px solid white;
          }

          .feature-selection h1, .loading-screen h1 {
            font-size: 1.4rem;
            margin-bottom: 0.8rem;
          }

          .loading-content {
            max-height: 85vh;
          }

          .loading-steps {
            max-height: 35vh;
            margin-bottom: 1rem;
          }

          .loading-step {
            padding: 0.5rem;
            gap: 0.5rem;
            margin-bottom: 0.2rem;
          }

          .loading-step span {
            font-size: 0.8rem;
          }

          .feature-subtitle {
            font-size: 0.9rem;
          }

          .feature-icon {
            font-size: 2rem;
          }

          .feature-card h3 {
            font-size: 1.1rem;
          }

          .feature-card p {
            font-size: 0.85rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          /* All animations disabled on mobile for performance */
          .animate-on-scroll {
            transform: none !important;
            transition: none;
            opacity: 1;
          }

          /* Simplified hover on mobile */
          .table-row:hover {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
          }

          /* Disable all animations */
          .animate-on-scroll, .step-number, .table-row, .hero-logo {
            animation: none;
            transition: none;
            transform: none !important;
          }
        }

        /* Scroll Animations - Disabled to prevent layout issues */
        .animate-on-scroll {
          opacity: 1;
          transform: none !important;
          transition: none;
        }

        .animate-on-scroll.animate-visible {
          opacity: 1;
          transform: none !important;
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
         }
      `}</style>
    </div>
  );
}