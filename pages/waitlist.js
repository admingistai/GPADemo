import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Waitlist() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Thank you! You\'ve been added to our waitlist. We\'ll be in touch soon!');
        setFormData({ name: '', email: '', company: '', role: '' });
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <Head>
        <title>Join the Waitlist - Ask Anything™</title>
        <meta name="description" content="Join the Ask Anything™ waitlist to be among the first to add AI-powered Q&A to your website." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="waitlist-page">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <img 
              src="/Gist G white no background.png" 
              alt="Gist" 
              className="gist-logo" 
              onClick={() => router.push('/')} 
              style={{ cursor: 'pointer' }}
            />
            <h1 className="logo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
              Ask<br />Anything™
            </h1>
          </div>
          <div className="header-right">
            <span className="tagline">100% ethical, uses fully licensed sources</span>
            <div className="auth-buttons">
              <button className="dashboard-btn" onClick={() => router.push('/dashboard')}>
                Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="waitlist-content">
          <div className="waitlist-container">
            <div className="waitlist-header">
              <h1 className="waitlist-title">Join the Ask Anything™ Waitlist</h1>
              <p className="waitlist-subtitle">
                Be among the first to add AI-powered Q&A to your website and keep readers engaged on your page instead of losing them to Google.
              </p>
            </div>

            <div className="waitlist-form-container">
              <form onSubmit={handleSubmit} className="waitlist-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="company">Company/Website</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Enter your company or website name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="">Select your role</option>
                    <option value="content-creator">Content Creator</option>
                    <option value="blogger">Blogger</option>
                    <option value="publisher">Publisher</option>
                    <option value="developer">Developer</option>
                    <option value="marketer">Marketer</option>
                    <option value="business-owner">Business Owner</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Joining Waitlist...' : 'Join Waitlist'}
                </button>

                {message && (
                  <div className={`message ${status === 'success' ? 'success' : 'error'}`}>
                    {message}
                  </div>
                )}
              </form>

              <div className="waitlist-benefits">
                <h3>What you'll get:</h3>
                <ul>
                  <li>✨ Early access to Ask Anything™</li>
                  <li>🎯 Priority onboarding and setup assistance</li>
                  <li>💰 Special launch pricing (50% off first year)</li>
                  <li>📊 Exclusive beta features and analytics</li>
                  <li>🤝 Direct feedback line to our team</li>
                </ul>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
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

        <style jsx>{`
          .waitlist-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 2rem;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          }

          .header-left {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .gist-logo {
            width: 32px;
            height: 32px;
            transition: transform 0.2s ease;
          }

          .gist-logo:hover {
            transform: scale(1.1);
          }

          .logo {
            font-size: 1.5rem;
            font-weight: 700;
            line-height: 1.2;
            margin: 0;
            transition: opacity 0.2s ease;
          }

          .logo:hover {
            opacity: 0.8;
          }

          .header-right {
            display: flex;
            align-items: center;
            gap: 1.5rem;
          }

          .tagline {
            font-size: 0.9rem;
            opacity: 0.9;
          }

          .dashboard-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-weight: 500;
          }

          .dashboard-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-1px);
          }

          .waitlist-content {
            padding: 4rem 2rem;
            max-width: 800px;
            margin: 0 auto;
          }

          .waitlist-container {
            display: grid;
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .waitlist-header {
            text-align: center;
          }

          .waitlist-title {
            font-size: 3rem;
            font-weight: 700;
            margin: 0 0 1rem 0;
            background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .waitlist-subtitle {
            font-size: 1.25rem;
            opacity: 0.9;
            line-height: 1.6;
            margin: 0;
            max-width: 600px;
            margin: 0 auto;
          }

          .waitlist-form-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            align-items: start;
          }

          .waitlist-form {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            padding: 2rem;
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
          }

          .form-group input,
          .form-group select {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 1rem;
            transition: all 0.2s ease;
            box-sizing: border-box;
          }

          .form-group input::placeholder {
            color: rgba(255, 255, 255, 0.6);
          }

          .form-group input:focus,
          .form-group select:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.6);
            background: rgba(255, 255, 255, 0.2);
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
          }

          .submit-btn {
            width: 100%;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-top: 1rem;
          }

          .submit-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
          }

          .submit-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .message {
            margin-top: 1rem;
            padding: 1rem;
            border-radius: 10px;
            text-align: center;
            font-weight: 500;
          }

          .message.success {
            background: rgba(34, 197, 94, 0.2);
            border: 1px solid rgba(34, 197, 94, 0.3);
            color: #dcfce7;
          }

          .message.error {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fecaca;
          }

          .waitlist-benefits {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 2rem;
          }

          .waitlist-benefits h3 {
            margin: 0 0 1.5rem 0;
            font-size: 1.25rem;
            font-weight: 600;
          }

          .waitlist-benefits ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .waitlist-benefits li {
            padding: 0.75rem 0;
            font-size: 1rem;
            opacity: 0.9;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .waitlist-benefits li:last-child {
            border-bottom: none;
          }

          .legal-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            margin-top: 4rem;
            font-size: 0.875rem;
            opacity: 0.8;
          }

          .legal-links {
            display: flex;
            gap: 1rem;
          }

          .legal-links button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            opacity: 0.8;
            transition: opacity 0.2s ease;
          }

          .legal-links button:hover {
            opacity: 1;
          }

          @media (max-width: 768px) {
            .header {
              padding: 1rem;
            }

            .header-right {
              gap: 1rem;
            }

            .tagline {
              display: none;
            }

            .waitlist-content {
              padding: 2rem 1rem;
            }

            .waitlist-title {
              font-size: 2rem;
            }

            .waitlist-subtitle {
              font-size: 1.1rem;
            }

            .waitlist-form-container {
              grid-template-columns: 1fr;
              gap: 2rem;
            }

            .legal-footer {
              flex-direction: column;
              gap: 1rem;
              text-align: center;
            }
          }
        `}</style>
      </div>
    </>
  );
} 