import { useState } from 'react';
import URLInputForm from '../components/URLInputForm';
import WebsiteDisplay from '../components/WebsiteDisplay';
import ErrorDisplay from '../components/ErrorDisplay';

export default function Home() {
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showWebsite, setShowWebsite] = useState(false);

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

      // Instead of showing preview, redirect directly to the website with widget
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      window.open(proxyUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setShowWebsite(false);
    setTargetUrl('');
  };

  return (
    <div className="container">
      {!showWebsite && (
        <>
          {/* Hero Section */}
          <section className="hero">
            <div className="hero-content">
              <div className="logo-section">
                <img src="/gist-logo.png" alt="Gist Logo" className="hero-logo" />
              </div>
              <h1>Turn Any Website into an AI-Powered Experience</h1>
                              <p className="hero-subtitle">
                  <strong>Paste any article, blog, or homepage URL below.</strong><br />
                  See what a Gist Powered AI Companion would look like on your site.
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
          <section className="features">
            <div className="content-wrapper">
              <h2>What You'll Get—And Why It Matters</h2>
              
              <div className="features-table">
                <div className="table-header">
                  <div>Feature</div>
                  <div>What It Does</div>
                  <div>Benefit to You</div>
                </div>
                
                <div className="table-row">
                  <div className="feature-name"><strong>Brand‑Perfect Customization</strong></div>
                  <div>Matches your tone, typography, colors, and editorial guidelines.</div>
                  <div>Readers experience a seamless extension of <em>your</em> brand, not a third‑party chatbot.</div>
                </div>
                
                <div className="table-row">
                  <div className="feature-name"><strong>Purpose‑Driven Modes</strong></div>
                  <div>Configure for engagement, ticketing, event Q&A, or any custom KPI.</div>
                  <div>Low‑hallucination answers optimized for the outcome that drives your business.</div>
                </div>
                
                <div className="table-row">
                  <div className="feature-name"><strong>Deep Content Blending</strong></div>
                  <div>Combines your articles with fully licensed partner sources.</div>
                  <div>Longer sessions, richer context, and fresh story angles—without extra reporting.</div>
                </div>
                
                <div className="table-row">
                  <div className="feature-name"><strong>Ethical, Context‑Aware Advertising</strong></div>
                  <div>100% private ad units rendered inside the answer card.</div>
                  <div>New, incremental revenue with zero integration cost.</div>
                </div>
                
                <div className="table-row">
                  <div className="feature-name"><strong>Voice, Read‑Aloud & Avatars</strong></div>
                  <div>Multimodal options bring stories to life.</div>
                  <div>Accessibility + wow factor = higher time‑on‑page and social shares.</div>
                </div>
                
                <div className="table-row">
                  <div className="feature-name"><strong>Auto‑Viral Formats</strong></div>
                  <div>Instantly converts articles into social slides, shorts, and story cards.</div>
                  <div>Built‑in growth engine that expands organic reach while you sleep.</div>
                </div>
                
                <div className="table-row">
                  <div className="feature-name"><strong>Proprietary Attribution Tech</strong></div>
                  <div>Locks in source credit on every snippet.</div>
                  <div>You keep control, compliance, and SEO juice—even off‑platform.</div>
                </div>
                
                <div className="table-row">
                  <div className="feature-name"><strong>Gist Answer Network</strong></div>
                  <div>Opt‑in syndication + "Add to My Daily Gist" personalized digests.</div>
                  <div>50/50 rev‑share and premium link placement that drives repeat traffic.</div>
                </div>
                
                <div className="table-row">
                  <div className="feature-name"><strong>Future‑Proof MCP Server</strong></div>
                  <div>Your own command center to manage and monetize incoming AI agents.</div>
                  <div>Stay in control as bot traffic explodes—set rules, rates, and new engagement models.</div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonial Section */}
          <section className="testimonial">
            <div className="content-wrapper">
              <h2>Real‑World Impact</h2>
              <blockquote>
                "Gist Answers turned our Cannes Lions coverage into an interactive experience—readers asked, listened, and shared. Engagement soared."
                <cite>— <strong>Will Lee, CEO, ADWEEK</strong></cite>
              </blockquote>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="how-it-works">
            <div className="content-wrapper">
              <h2>How It Works in 30 Seconds</h2>
              <div className="steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Drop a URL</h3>
                    <p>We index only the pages you allow.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>We Spin Up Your Companion</h3>
                    <p>Branded UI, live in minutes.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>You Flip the Switch</h3>
                    <p>Start engaging visitors and earning new ad revenue instantly.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="cta">
            <div className="content-wrapper">
              <h2>Ready to See It?</h2>
              <p><strong>Paste your URL above</strong> or <strong>schedule a live walkthrough</strong> with our product team.</p>
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
        .container {
          min-height: 100vh;
          font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          overflow-x: hidden;
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
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 90%, rgba(255,255,255,0.05) 0%, transparent 50%);
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
          height: 100px;
          width: auto;
          filter: drop-shadow(0 10px 30px rgba(0,0,0,0.3));
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
          padding: 4rem 0;
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
        }

        .table-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          padding: 1.5rem 1.2rem;
          border-bottom: 1px solid rgba(226, 232, 240, 0.5);
          align-items: start;
          transition: all 0.3s ease;
          position: relative;
        }

        .table-row:hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
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
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
          max-width: 1000px;
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
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.3rem;
          flex-shrink: 0;
          box-shadow: 0 8px 25px rgba(75, 102, 255, 0.3);
          position: relative;
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
            height: 80px;
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
            width: 3rem;
            height: 3rem;
            font-size: 1.2rem;
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
          }
        }
      `}</style>
    </div>
  );
}