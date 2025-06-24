import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

const mockSites = [
  { id: 1, name: 'theatlantic.com', url: 'https://theatlantic.com' },
  { id: 2, name: 'example.com', url: 'https://example.com' },
];

export default function Dashboard() {
  const router = useRouter();
  const [activePage, setActivePage] = useState('home');
  const [sites, setSites] = useState(mockSites);
  const [showModal, setShowModal] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [form, setForm] = useState({
    url: '',
    tools: {
      summarize: false,
      remix: false,
      share: false,
      ads: false,
    },
    color: '#3742fa',
    favicon: '',
  });

  const handleAddSite = () => {
    setShowModal(true);
    setShowCode(false);
    setForm({
      url: '',
      tools: { summarize: false, remix: false, share: false, ads: false },
      color: '#3742fa',
      favicon: '',
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('tools.')) {
      const tool = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        tools: { ...prev.tools, [tool]: checked },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    // Generate widget code
    let formattedUrl = form.url.trim();
    if (formattedUrl && !formattedUrl.match(/^https?:\/\//)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    const widgetConfig = {
      url: formattedUrl,
      features: {
        summarize: form.tools.summarize,
        remix: form.tools.remix,
        share: form.tools.share,
      },
      ads: { proRataAds: form.tools.ads },
      theme: { color: form.color, faviconLogo: form.favicon },
    };
    const code = `<!-- Ask Anything™ Widget -->\n<script>\n  window.askAnythingConfig = ${JSON.stringify(widgetConfig, null, 2)};\n</script>\n<script src=\"https://widget.ask-anything.ai/widget.js\" async></script>\n<!-- End Ask Anything™ Widget -->`;
    setGeneratedCode(code);
    setShowCode(true);
    // Optionally add to sites list (mock)
    setSites((prev) => [
      ...prev,
      { id: prev.length + 1, name: formattedUrl.replace(/^https?:\/\//, ''), url: formattedUrl },
    ]);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowCode(false);
  };

  return (
    <>
      <Head>
        <title>Dashboard - Ask Anything™</title>
        <meta name="description" content="Your dashboard for managing Ask Anything™ widgets and sites." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/Gist_Mark_000000.png" />
      </Head>
      <div className="dashboard-app">
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <img src="/Gist_Mark_000000.png" alt="Logo" className="sidebar-logo" onClick={() => router.push('/')} />
            <h2 className="sidebar-title">Ask Anything™</h2>
          </div>
          <nav className="sidebar-nav">
            <button className={`sidebar-link${activePage === 'home' ? ' active' : ''}`} onClick={() => setActivePage('home')}>Home</button>
            <button className={`sidebar-link${activePage === 'sites' ? ' active' : ''}`} onClick={() => setActivePage('sites')}>Sites</button>
          </nav>
        </aside>
        <main className="dashboard-main">
          {activePage === 'home' && (
            <>
              <h1 className="dashboard-title">Welcome to your Dashboard</h1>
              <p className="dashboard-desc">This is your central hub for managing your Ask Anything™ widgets and sites. More features coming soon!</p>
            </>
          )}
          {activePage === 'sites' && (
            <div className="sites-page">
              <div className="sites-header">
                <h1 className="dashboard-title">Your Sites</h1>
                <button className="add-site-btn" title="Add Site" onClick={handleAddSite}>+
                </button>
              </div>
              <ul className="sites-list">
                {sites.map(site => (
                  <li key={site.id} className="site-item">
                    <span className="site-name">{site.name}</span>
                    <a href={site.url} target="_blank" rel="noopener noreferrer" className="site-link">{site.url}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              {!showCode ? (
                <form className="add-site-form" onSubmit={handleModalSubmit}>
                  <h2>Add a New Site</h2>
                  <label>Site URL
                    <input type="text" name="url" value={form.url} onChange={handleFormChange} placeholder="yourwebsite.com" required />
                  </label>
                  <div className="form-section">
                    <span>Enable Tools:</span>
                    <label><input type="checkbox" name="tools.summarize" checked={form.tools.summarize} onChange={handleFormChange} /> Summarize</label>
                    <label><input type="checkbox" name="tools.remix" checked={form.tools.remix} onChange={handleFormChange} /> Remix</label>
                    <label><input type="checkbox" name="tools.share" checked={form.tools.share} onChange={handleFormChange} /> Share</label>
                    <label><input type="checkbox" name="tools.ads" checked={form.tools.ads} onChange={handleFormChange} /> Ads</label>
                  </div>
                  <label>Widget Color
                    <input type="color" name="color" value={form.color} onChange={handleFormChange} />
                  </label>
                  <label>Favicon URL
                    <input type="text" name="favicon" value={form.favicon} onChange={handleFormChange} placeholder="https://yourwebsite.com/favicon.ico" />
                  </label>
                  <div className="modal-actions">
                    <button type="button" className="modal-cancel" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="modal-submit">Generate Widget Code</button>
                  </div>
                </form>
              ) : (
                <div className="code-result">
                  <h2>Your Widget Code</h2>
                  <pre className="code-block"><code>{generatedCode}</code></pre>
                  <div className="modal-actions">
                    <button type="button" className="modal-cancel" onClick={closeModal}>Close</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        body {
          background: linear-gradient(135deg, #F2F0FE 0%, #FFEFF6 100%);
          min-height: 100vh;
        }
      `}</style>
      <style jsx>{`
        .dashboard-app {
          display: flex;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .dashboard-sidebar {
          width: 240px;
          background: rgba(255,255,255,0.95);
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          padding: 2rem 1.5rem 1.5rem 1.5rem;
          box-shadow: 2px 0 24px rgba(55,66,250,0.04);
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .sidebar-logo {
          width: 40px;
          height: 40px;
          cursor: pointer;
        }
        .sidebar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.01em;
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .sidebar-link {
          background: none;
          border: none;
          color: #374151;
          font-size: 1.1rem;
          font-weight: 600;
          text-align: left;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          transition: background 0.15s, color 0.15s;
          cursor: pointer;
        }
        .sidebar-link.active, .sidebar-link:hover {
          background: linear-gradient(90deg, #3742fa 0%, #8b5cf6 100%);
          color: #fff;
        }
        .dashboard-main {
          flex: 1;
          padding: 4rem 3rem;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
        }
        .dashboard-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1rem;
        }
        .dashboard-desc {
          font-size: 1.2rem;
          color: #6b7280;
        }
        /* Sites page styles */
        .sites-page {
          width: 100%;
        }
        .sites-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }
        .add-site-btn {
          background: linear-gradient(135deg, #ff6b35 0%, #3742fa 100%);
          color: #fff;
          border: none;
          font-size: 2rem;
          font-weight: 700;
          border-radius: 50%;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(55,66,250,0.08);
          cursor: pointer;
          transition: background 0.15s, box-shadow 0.15s;
        }
        .add-site-btn:hover {
          background: linear-gradient(135deg, #3742fa 0%, #ff6b35 100%);
          box-shadow: 0 4px 16px rgba(55,66,250,0.12);
        }
        .sites-list {
          list-style: none;
          padding: 0;
          margin: 0;
          width: 100%;
        }
        .site-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .site-name {
          font-weight: 600;
          color: #374151;
          font-size: 1.1rem;
        }
        .site-link {
          color: #3742fa;
          text-decoration: underline;
          font-size: 1rem;
        }
        /* Modal styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.25);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 40px rgba(55,66,250,0.10);
          padding: 2rem 2.5rem;
          min-width: 320px;
          max-width: 95vw;
          max-height: 90vh;
          overflow-y: auto;
        }
        .add-site-form h2, .code-result h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #3742fa;
          margin-bottom: 1.5rem;
        }
        .add-site-form label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        .add-site-form input[type="text"] {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          margin-bottom: 1.25rem;
        }
        .add-site-form input[type="color"] {
          margin-left: 0.5rem;
          width: 2.5rem;
          height: 2rem;
          border: none;
          background: none;
          vertical-align: middle;
        }
        .form-section {
          margin-bottom: 1.25rem;
        }
        .form-section label {
          display: inline-flex;
          align-items: center;
          font-weight: 500;
          margin-right: 1.5rem;
          margin-bottom: 0;
        }
        .form-section input[type="checkbox"] {
          margin-right: 0.5rem;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .modal-cancel {
          background: #f3f4f6;
          color: #374151;
          border: 1.5px solid #e5e7eb;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
        }
        .modal-submit {
          background: linear-gradient(135deg, #3742fa 0%, #8b5cf6 100%);
          color: #fff;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
        }
        .modal-submit:hover {
          background: linear-gradient(135deg, #8b5cf6 0%, #3742fa 100%);
        }
        .code-result {
          text-align: center;
        }
        .code-block {
          background: #161b22;
          color: #fff;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1.5rem 0;
          font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace;
          font-size: 0.95rem;
          text-align: left;
          overflow-x: auto;
        }
        @media (max-width: 900px) {
          .dashboard-app {
            flex-direction: column;
          }
          .dashboard-sidebar {
            width: 100%;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            padding: 1rem;
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
            box-shadow: none;
          }
          .sidebar-header {
            margin-bottom: 0;
          }
          .sidebar-nav {
            flex-direction: row;
            gap: 1rem;
            margin-left: 2rem;
          }
        }
        @media (max-width: 600px) {
          .dashboard-main {
            padding: 2rem 1rem;
          }
          .dashboard-title {
            font-size: 1.5rem;
          }
          .sites-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .modal {
            padding: 1rem 0.5rem;
          }
        }
      `}</style>
    </>
  );
} 