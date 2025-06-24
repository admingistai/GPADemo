import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

const TOOL_ICONS = {
  summarize: '📝',
  remix: '🎛️',
  share: '🔗',
  ads: '💸',
};
const TOOL_LABELS = {
  summarize: 'Summarize',
  remix: 'Remix',
  share: 'Share',
  ads: 'Ads',
};

const mockSites = [
  {
    id: 1,
    name: 'theatlantic.com',
    url: 'https://theatlantic.com',
    tools: { summarize: true, remix: false, share: true, ads: false },
    color: '#3742fa',
    favicon: '',
  },
  {
    id: 2,
    name: 'example.com',
    url: 'https://example.com',
    tools: { summarize: false, remix: true, share: false, ads: true },
    color: '#ff6b35',
    favicon: '',
  },
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
    tools: { summarize: false, remix: false, share: false, ads: false },
    color: '#3742fa',
    favicon: '',
  });
  const [editSiteId, setEditSiteId] = useState(null);

  const handleAddSite = () => {
    setShowModal(true);
    setShowCode(false);
    setEditSiteId(null);
    setForm({
      url: '',
      tools: { summarize: false, remix: false, share: false, ads: false },
      color: '#3742fa',
      favicon: '',
    });
  };

  const handleEditSite = (site) => {
    setShowModal(true);
    setShowCode(false);
    setEditSiteId(site.id);
    setForm({
      url: site.url.replace(/^https?:\/\//, ''),
      tools: { ...site.tools },
      color: site.color || '#3742fa',
      favicon: site.favicon || '',
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
    // Add or update site in mock list
    setSites((prev) => {
      if (editSiteId) {
        return prev.map(site =>
          site.id === editSiteId
            ? {
                ...site,
                name: formattedUrl.replace(/^https?:\/\//, ''),
                url: formattedUrl,
                tools: { ...form.tools },
                color: form.color,
                favicon: form.favicon,
              }
            : site
        );
      } else {
        return [
          ...prev,
          {
            id: prev.length + 1,
            name: formattedUrl.replace(/^https?:\/\//, ''),
            url: formattedUrl,
            tools: { ...form.tools },
            color: form.color,
            favicon: form.favicon,
          },
        ];
      }
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setShowCode(false);
    setEditSiteId(null);
  };

  // --- UI ---
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
                <button className="add-site-btn" title="Add Site" onClick={handleAddSite}>+ Add Site</button>
              </div>
              <div className="sites-grid">
                {sites.map(site => (
                  <div key={site.id} className="site-card">
                    <div className="site-card-header">
                      <div className="site-card-title">
                        <span className="site-card-favicon" style={{ background: site.color }}>
                          {site.favicon ? (
                            <img src={site.favicon} alt="favicon" />
                          ) : (
                            <span className="site-card-initial">{site.name[0].toUpperCase()}</span>
                          )}
                        </span>
                        <div>
                          <div className="site-card-name">{site.name}</div>
                          <a href={site.url} target="_blank" rel="noopener noreferrer" className="site-card-url">{site.url}</a>
                        </div>
                      </div>
                      <button className="site-card-edit" title="Edit" onClick={e => { e.stopPropagation(); handleEditSite(site); }}>Edit</button>
                    </div>
                    <div className="site-card-tools">
                      {Object.entries(site.tools).map(([tool, enabled]) =>
                        enabled ? (
                          <span key={tool} className="site-tool-badge" title={TOOL_LABELS[tool]}>{TOOL_ICONS[tool]}</span>
                        ) : null
                      )}
                      <span className="site-tool-color" title="Widget Color" style={{ background: site.color }}></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              {!showCode ? (
                <form className="add-site-form" onSubmit={handleModalSubmit}>
                  <h2>{editSiteId ? 'Edit Site' : 'Add a New Site'}</h2>
                  <div className="modal-form-row">
                    <div className="modal-form-col">
                      <label>Site URL
                        <input type="text" name="url" value={form.url} onChange={handleFormChange} placeholder="yourwebsite.com" required />
                      </label>
                      <label>Widget Color
                        <input type="color" name="color" value={form.color} onChange={handleFormChange} />
                      </label>
                      <label>Favicon URL
                        <input type="text" name="favicon" value={form.favicon} onChange={handleFormChange} placeholder="https://yourwebsite.com/favicon.ico" />
                      </label>
                    </div>
                    <div className="modal-form-col">
                      <div className="form-section">
                        <span>Enable Tools:</span>
                        <div className="tool-toggle-group">
                          {Object.keys(TOOL_LABELS).map(tool => (
                            <label key={tool} className={`tool-toggle${form.tools[tool] ? ' enabled' : ''}`} title={TOOL_LABELS[tool]}>
                              <input type="checkbox" name={`tools.${tool}`} checked={form.tools[tool]} onChange={handleFormChange} />
                              <span className="tool-toggle-icon">{TOOL_ICONS[tool]}</span>
                              <span className="tool-toggle-label">{TOOL_LABELS[tool]}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="widget-preview">
                        <span className="widget-preview-color" style={{ background: form.color }}></span>
                        {form.favicon && <img src={form.favicon} alt="favicon" className="widget-preview-favicon" />}
                        <span className="widget-preview-label">Widget Preview</span>
                      </div>
                    </div>
                  </div>
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
          font-size: 1.1rem;
          font-weight: 700;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          box-shadow: 0 2px 8px rgba(55,66,250,0.08);
          cursor: pointer;
          transition: background 0.15s, box-shadow 0.15s;
        }
        .add-site-btn:hover {
          background: linear-gradient(135deg, #3742fa 0%, #ff6b35 100%);
          box-shadow: 0 4px 16px rgba(55,66,250,0.12);
        }
        .sites-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
        }
        .site-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(55,66,250,0.07);
          padding: 1.5rem 1.5rem 1rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          border: 1.5px solid #e5e7eb;
          transition: box-shadow 0.15s, border 0.15s;
        }
        .site-card:hover {
          box-shadow: 0 8px 32px rgba(55,66,250,0.13);
          border: 1.5px solid #3742fa;
        }
        .site-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .site-card-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .site-card-favicon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(55,66,250,0.07);
        }
        .site-card-favicon img {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }
        .site-card-initial {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
        }
        .site-card-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: #374151;
        }
        .site-card-url {
          color: #3742fa;
          text-decoration: underline;
          font-size: 0.98rem;
        }
        .site-card-edit {
          background: #f3f4f6;
          color: #374151;
          border: 1.5px solid #e5e7eb;
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, border 0.15s;
        }
        .site-card-edit:hover {
          background: #3742fa;
          color: #fff;
          border: 1.5px solid #3742fa;
        }
        .site-card-tools {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .site-tool-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          color: #3742fa;
          font-size: 1.15rem;
          border-radius: 8px;
          padding: 0.25rem 0.6rem;
          font-weight: 700;
          border: 1.5px solid #e5e7eb;
        }
        .site-tool-color {
          display: inline-block;
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 2px solid #e5e7eb;
          margin-left: 0.5rem;
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
          min-width: 340px;
          max-width: 98vw;
          max-height: 90vh;
          overflow-y: auto;
        }
        .add-site-form h2, .code-result h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #3742fa;
          margin-bottom: 1.5rem;
        }
        .modal-form-row {
          display: flex;
          gap: 2rem;
        }
        .modal-form-col {
          flex: 1;
          min-width: 180px;
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
        .tool-toggle-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .tool-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f3f4f6;
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          font-weight: 600;
          border: 1.5px solid #e5e7eb;
          cursor: pointer;
          transition: background 0.15s, border 0.15s;
        }
        .tool-toggle.enabled {
          background: #3742fa;
          color: #fff;
          border: 1.5px solid #3742fa;
        }
        .tool-toggle input[type="checkbox"] {
          margin-right: 0.5rem;
        }
        .tool-toggle-icon {
          font-size: 1.15rem;
        }
        .widget-preview {
          margin-top: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .widget-preview-color {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 2px solid #e5e7eb;
        }
        .widget-preview-favicon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          object-fit: contain;
          border: 1.5px solid #e5e7eb;
        }
        .widget-preview-label {
          font-size: 1rem;
          color: #6b7280;
          margin-left: 0.5rem;
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
        @media (max-width: 700px) {
          .sites-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
          .modal-form-row {
            flex-direction: column;
            gap: 1rem;
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