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

      setTargetUrl(url);
      setShowWebsite(true);
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
              <h1>Create an AI Companion for Your Content—in Seconds</h1>
              <p className="hero-subtitle">
                <strong>Paste any article, blog, or homepage URL below.</strong><br />
                Gist Answers will spin up a fully branded, citation‑rich AI assistant that lives right on your site.
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
        }

        /* Hero Section */
        .hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4rem 2rem;
          text-align: center;
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

                 .hero-content {
           max-width: 800px;
           width: 100%;
         }

         .logo-section {
           margin-bottom: 2rem;
         }

         .hero-logo {
           height: 60px;
           width: auto;
         }

         .hero h1 {
           font-size: 3.5rem;
           font-weight: 700;
           margin: 0 0 1.5rem 0;
           letter-spacing: -0.02em;
         }

         .hero-subtitle {
           font-size: 1.25rem;
           margin: 0 0 3rem 0;
           opacity: 0.98;
           max-width: 600px;
           margin-left: auto;
           margin-right: auto;
           color: #ffffff;
         }

        .url-input-section {
          margin-top: 2rem;
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
          background: #f8fafc;
        }

        .features h2 {
          font-size: 2.5rem;
          text-align: center;
          margin: 0 0 3rem 0;
          color: #1a202c;
        }

        .features-table {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          background: #4B66FF;
          color: white;
          padding: 1.5rem;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          align-items: start;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-row:nth-child(even) {
          background: #f7fafc;
        }

        .feature-name {
          color: #2d3748;
        }

        /* Testimonial Section */
        .testimonial {
          padding: 4rem 0;
          background: white;
        }

        .testimonial h2 {
          font-size: 2.5rem;
          text-align: center;
          margin: 0 0 2rem 0;
          color: #1a202c;
        }

                 blockquote {
           font-size: 1.5rem;
           font-style: italic;
           text-align: center;
           margin: 0;
           color: #1a202c;
           max-width: 800px;
           margin: 0 auto;
           line-height: 1.7;
         }

         cite {
           display: block;
           margin-top: 1.5rem;
           font-style: normal;
           color: #4B66FF;
           font-size: 1.1rem;
           font-weight: 600;
         }

        /* How It Works Section */
        .how-it-works {
          padding: 4rem 0;
          background: #f8fafc;
        }

        .how-it-works h2 {
          font-size: 2.5rem;
          text-align: center;
          margin: 0 0 3rem 0;
          color: #1a202c;
        }

        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .step {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .step-number {
          background: #4B66FF;
          color: white;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .step-content h3 {
          margin: 0 0 0.5rem 0;
          color: #2d3748;
          font-size: 1.25rem;
        }

                 .step-content p {
           margin: 0;
           color: #2d3748;
         }

         /* CTA Section */
         .cta {
           padding: 4rem 0;
           background: white;
           text-align: center;
         }

         .cta h2 {
           font-size: 2.5rem;
           margin: 0 0 1rem 0;
           color: #1a202c;
         }

         .cta p {
           font-size: 1.25rem;
           margin: 0;
           color: #2d3748;
         }

                 /* Footer */
         .footer {
           background: #1a202c;
           color: #e2e8f0;
           padding: 2rem 0;
           text-align: center;
         }

         .footer p {
           margin: 0;
           font-size: 0.95rem;
         }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
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
            padding: 1.5rem;
          }

          .table-row > div {
            margin-bottom: 1rem;
          }

          .table-row > div:last-child {
            margin-bottom: 0;
          }

          .feature-name::after {
            content: ":";
          }

          blockquote {
            font-size: 1.25rem;
          }

          .steps {
            grid-template-columns: 1fr;
          }

          .content-wrapper {
            padding: 0 1rem;
          }

          .hero {
            padding: 3rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}