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

      <div className="app">
        <div className="waitlist-page">
          {/* Header */}
          <header className="header">
            <div className="header-left">
              <img 
                src="/Gist G white no background.png" 
                alt="Gist" 
                className="gist-logo" 
                onClick={() => router.push('/')} 
              />
              <h1 className="logo" onClick={() => router.push('/')}>
                Ask<br />Anything™
              </h1>
            </div>
            <div className="header-right">
              <span className="tagline">100% ethical, uses fully licensed sources</span>
            </div>
          </header>

          {/* Main Content */}
          <main className="main-content">
            <h1 className="main-title">
              Join the Ask Anything™ Waitlist
            </h1>
            
            <div className="drive-growth-text">
              Be among the first to add AI-powered Q&A to your website and keep readers engaged on your page instead of losing them to Google.
            </div>
            
            <div className="waitlist-form-container">
              <form onSubmit={handleSubmit} className="waitlist-form">
                <div className="form-row">
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
                </div>

                <div className="form-row">
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
          </main>

          {/* Legal Footer */}
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

          .waitlist-page {
            background: transparent;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            color: white;
            animation: fadeIn 0.8s ease-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes slideInDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 1.5rem 2.85rem;
            position: relative;
            animation: slideInDown 0.6s ease-out 0.2s both;
          }

          .header-left {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .gist-logo {
            height: 2.5rem;
            width: auto;
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .gist-logo:hover {
            transform: scale(1.1);
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
          }

          .logo {
            font-size: 1.5rem;
            font-weight: 600;
            line-height: 1.0;
            color: white;
            font-family: 'Inter', sans-serif;
            letter-spacing: -0.05em;
            transition: all 0.3s ease;
            cursor: pointer;
            margin: 0;
          }

          .logo:hover {
            transform: scale(1.05);
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
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

          .auth-buttons {
            display: flex;
            gap: 1rem;
            align-items: center;
          }



          .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 0.5rem 2rem;
            text-align: center;
            margin-top: -1rem;
          }

          .main-title {
            font-size: 3.2rem;
            font-weight: 700;
            line-height: 1.1;
            margin-bottom: 0.5rem;
            margin-top: 0.5rem;
            max-width: 1100px;
            color: white;
            font-family: 'Inter', sans-serif;
            letter-spacing: -0.01em;
            animation: slideInUp 0.8s ease-out 0.4s both;
          }

          .drive-growth-text {
            font-size: 1.35rem;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 3rem;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            text-align: center;
            animation: slideInUp 0.8s ease-out 0.5s both;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            line-height: 1.3;
          }

          .waitlist-form-container {
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 3rem;
            align-items: start;
            max-width: 1000px;
            width: 100%;
            animation: slideInUp 0.8s ease-out 0.6s both;
          }

          .waitlist-form {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 2.5rem;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }

          .waitlist-form:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .form-group {
            display: flex;
            flex-direction: column;
          }

          .form-group label {
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
            font-family: 'Inter', sans-serif;
            font-size: 0.95rem;
          }

          .form-group input,
          .form-group select {
            padding: 0.85rem 1.2rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.05);
            color: white;
            font-size: 1rem;
            font-family: 'Inter', sans-serif;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }

          .form-group input::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }

          .form-group input:focus,
          .form-group select:focus {
            outline: none;
            border-color: rgba(79, 70, 229, 0.6);
            background: rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
            transform: translateY(-1px);
          }

          .form-group select option {
            background: #1a1a2e;
            color: white;
          }

          .submit-btn {
            width: 100%;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 1.1rem;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            margin-top: 1rem;
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2);
          }

          .submit-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, #4338ca, #6d28d9);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3);
          }

          .submit-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
          }

          .message {
            margin-top: 1.5rem;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            text-align: center;
            font-weight: 500;
            font-family: 'Inter', sans-serif;
            animation: slideInUp 0.3s ease-out;
          }

          .message.success {
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid rgba(34, 197, 94, 0.3);
            color: #86efac;
          }

          .message.error {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fca5a5;
          }

          .waitlist-benefits {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: 2rem;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }

          .waitlist-benefits:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
          }

          .waitlist-benefits h3 {
            margin: 0 0 1.5rem 0;
            font-size: 1.25rem;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            color: white;
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
            transition: all 0.3s ease;
            font-family: 'Inter', sans-serif;
          }

          .waitlist-benefits li:last-child {
            border-bottom: none;
          }

          .waitlist-benefits li:hover {
            opacity: 1;
            transform: translateX(5px);
          }

          .legal-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2rem 2.85rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 3rem;
            font-size: 0.875rem;
            opacity: 0.8;
            font-family: 'Inter', sans-serif;
          }

          .legal-links {
            display: flex;
            gap: 1.5rem;
          }

          .legal-links button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            opacity: 0.8;
            transition: all 0.3s ease;
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
          }

          .legal-links button:hover {
            opacity: 1;
            transform: translateY(-1px);
          }

          @media (max-width: 1024px) {
            .waitlist-form-container {
              grid-template-columns: 1fr;
              gap: 2rem;
              max-width: 600px;
            }
          }

          @media (max-width: 768px) {
            .header {
              padding: 1rem 1.5rem;
              flex-direction: column;
              gap: 1rem;
              align-items: center;
            }

            .header-right {
              gap: 1rem;
            }

            .tagline {
              display: none;
            }

            .main-content {
              padding: 1rem;
            }

            .main-title {
              font-size: 2.5rem;
            }

            .drive-growth-text {
              font-size: 1.2rem;
              margin-bottom: 2rem;
            }

            .form-row {
              grid-template-columns: 1fr;
              gap: 1rem;
            }

            .waitlist-form {
              padding: 2rem;
            }

            .legal-footer {
              flex-direction: column;
              gap: 1rem;
              text-align: center;
              padding: 2rem 1.5rem;
            }
          }

          @media (max-width: 480px) {
            .main-title {
              font-size: 2rem;
            }

            .drive-growth-text {
              font-size: 1.1rem;
            }

            .waitlist-form {
              padding: 1.5rem;
            }
          }
        `}</style>
      </div>
    </>
  );
} 