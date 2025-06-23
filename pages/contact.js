import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function ContactUs() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Thank you for reaching out! We\'ll get back to you as soon as possible.');
        setFormData({ name: '', email: '', website: '', message: '' });
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
        <title>Contact Us - Ask Anything™</title>
        <meta name="description" content="Get in touch with the Ask Anything™ team. We're here to help you add AI-powered Q&A to your website." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/Gist_Mark_000000.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/Gist_Mark_000000.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/Gist_Mark_000000.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/Gist_Mark_000000.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/Gist_Mark_000000.png" />
      </Head>

      <div className="app">
        <div className="contact-page">
          {/* Header */}
          <header className="header">
            <div className="header-left">
              <img 
                src="/Gist_Mark_000000.png" 
                alt="Ask Anything™ Logo" 
                className="gist-logo" 
                onClick={() => router.push('/')} 
              />
            </div>
            <div className="header-right">
              <span className="tagline">100% ethical, uses fully licensed sources</span>
            </div>
          </header>

          {/* Main Content */}
          <main className="main-content">
            <h1 className="main-title">
              Contact Us
            </h1>
            
            <p className="contact-subhead">
              Do you want to get in contact with a member of our team? Fill out the form below and we'll get back to you as soon as possible.
            </p>
            
            <div className="contact-form-container">
              <div className="contact-card">
                <form onSubmit={handleSubmit} className="contact-form">
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
                    <div className="form-group full-width">
                      <label htmlFor="website">Website (Optional)</label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group full-width">
                      <label htmlFor="message">Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        placeholder="Tell us how we can help you..."
                        rows="4"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="btn--primary"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? 'Submitting...' : 'Submit'}
                  </button>

                  {message && (
                    <div className={`message ${status === 'success' ? 'success' : 'error'}`}>
                      {message}
                    </div>
                  )}
                </form>
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

        <style jsx global>{`
          body {
            background: linear-gradient(135deg, #F2F0FE 0%, #FFEFF6 100%);
            min-height: 100vh;
          }

          .contact-page, .contact-page * {
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
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            background: none;
          }

          .contact-page {
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
            align-items: center;
            background: #fff;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(16, 30, 54, 0.04);
            margin-bottom: 40px;
          }

          .header-left {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .gist-logo {
            height: 40px;
            width: auto;
            cursor: pointer;
            display: block;
          }

          .header-right {
            display: flex;
            align-items: center;
          }

          .tagline {
            font-size: 14px;
            font-weight: 500;
            color: #222;
            opacity: 1;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
            font-size: 48px;
            font-weight: 700;
            color: #111827;
            text-align: center;
            margin-bottom: 8px;
            margin-top: 0.5rem;
            line-height: 1.1;
            max-width: 1100px;
            font-family: 'Inter', sans-serif;
            letter-spacing: -0.01em;
            animation: slideInUp 0.8s ease-out 0.4s both;
          }

          .contact-subhead {
            font-size: 18px;
            color: #4B5563;
            text-align: center;
            margin-bottom: 32px;
            font-family: 'Inter', sans-serif;
            font-weight: 400;
            animation: slideInUp 0.8s ease-out 0.5s both;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            line-height: 1.3;
          }

          .contact-form-container {
            max-width: 600px;
            width: 100%;
            animation: slideInUp 0.8s ease-out 0.6s both;
          }

          .contact-card {
            background: rgba(255,255,255,0.85);
            border: 2px solid #7C3AED;
            box-shadow: 0 8px 32px rgba(124,58,237,0.12);
            border-radius: 12px;
            padding: 32px;
            max-width: 600px;
            margin: auto;
          }

          .contact-form {
            background: none;
            border: none;
            border-radius: 0;
            padding: 0;
            box-shadow: none;
            transition: none;
          }

          .contact-form:hover {
            background: none;
            border-color: inherit;
            transform: none;
            box-shadow: none;
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

          .form-group.full-width {
            grid-column: 1 / -1;
          }

          .form-group label {
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
            font-family: 'Inter', sans-serif;
            font-size: 0.95rem;
          }

          .form-group input,
          .form-group select,
          .form-group textarea {
            padding: 0.85rem 1.2rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.05);
            color: white;
            font-size: 1rem;
            font-family: 'Inter', sans-serif;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }

          .form-group input::placeholder,
          .form-group textarea::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }

          .form-group input:focus,
          .form-group select:focus,
          .form-group textarea:focus {
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

          .form-group textarea {
            resize: vertical;
            min-height: 100px;
          }

          .btn--primary {
            height: 48px;
            width: 100%;
            background: linear-gradient(90deg, #5E72E4 0%, #E357FF 100%);
            border: none;
            border-radius: 24px;
            font-size: 18px;
            font-weight: 600;
            color: #fff !important;
            cursor: pointer;
            transition: box-shadow 0.2s;
            margin-top: 1rem;
            box-shadow: none;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .btn--primary:hover:not(:disabled) {
            box-shadow: 0 4px 12px rgba(94,114,228,0.3);
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

          .legal-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2rem 2.85rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 3rem;
            font-size: 0.875rem;
            opacity: 1;
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
            opacity: 1;
            transition: all 0.3s ease;
            font-family: 'Inter', sans-serif;
            font-size: 0.875rem;
          }

          .legal-links button:hover {
            opacity: 1;
            transform: translateY(-1px);
          }

          @media (max-width: 1024px) {
            .contact-form-container {
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

            .contact-subhead {
              font-size: 1.2rem;
              margin-bottom: 2rem;
            }

            .form-row {
              grid-template-columns: 1fr;
              gap: 1rem;
            }

            .contact-form {
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

            .contact-subhead {
              font-size: 1.1rem;
            }

            .contact-form {
              padding: 1.5rem;
            }
          }

          @media (max-width: 640px) {
            .contact-card {
              padding: 16px;
            }
            .main-title {
              font-size: 32px;
            }
            .btn--primary {
              height: 40px;
            }
            .contact-card input,
            .contact-card textarea {
              width: 100%;
            }
          }

          .contact-card input,
          .contact-card textarea {
            border: 2px solid rgba(94,114,228,0.1);
            border-radius: 12px;
            padding: 12px 16px;
            font-size: 16px;
            width: 100%;
            box-sizing: border-box;
            margin-bottom: 16px;
            background: rgba(255,255,255,0.8);
          }

          .contact-card ::placeholder {
            color: #9CA3AF !important;
            font-weight: 400;
            opacity: 1;
          }
        `}</style>
      </div>
    </>
  );
} 