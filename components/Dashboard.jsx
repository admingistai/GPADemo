import { useState } from 'react';

export default function Dashboard({ onClose }) {
  const [activeTab, setActiveTab] = useState('home');

  const mockWebsites = [
    {
      id: 1,
      name: 'TechCrunch',
      url: 'techcrunch.com',
      status: 'Active',
      monthlyViews: '2.4M',
      askAnythingQueries: '45.2K',
      revenue: '$8,420'
    },
    {
      id: 2,
      name: 'The Verge',
      url: 'theverge.com',
      status: 'Active',
      monthlyViews: '1.8M',
      askAnythingQueries: '32.1K',
      revenue: '$6,180'
    },
    {
      id: 3,
      name: 'Wired Magazine',
      url: 'wired.com',
      status: 'Pending',
      monthlyViews: '3.1M',
      askAnythingQueries: '0',
      revenue: '$0'
    }
  ];

  return (
    <div className="dashboard-overlay">
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <img src="/Gist G white no background.png" alt="Gist" className="sidebar-gist-logo" />
              <h2>Publisher Dashboard</h2>
            </div>
            <button className="dashboard-close-btn" onClick={onClose}>×</button>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <span className="nav-icon">📊</span>
              Home
            </button>
            <button 
              className={`nav-item ${activeTab === 'pages' ? 'active' : ''}`}
              onClick={() => setActiveTab('pages')}
            >
              <span className="nav-icon">🌐</span>
              Pages
            </button>
            <button 
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <span className="nav-icon">📈</span>
              Analytics
            </button>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="nav-icon">⚙️</span>
              Settings
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          {activeTab === 'home' && (
            <div className="dashboard-content">
              <div className="dashboard-header">
                <h1>Dashboard Overview</h1>
                <p>Monitor your Ask Anything™ performance across all sites</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <h3>Total Queries</h3>
                    <div className="stat-number">77.3K</div>
                    <div className="stat-change positive">+12.5% this month</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <h3>Revenue Generated</h3>
                    <div className="stat-number">$14,600</div>
                    <div className="stat-change positive">+8.3% this month</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <h3>Active Sites</h3>
                    <div className="stat-number">3</div>
                    <div className="stat-change neutral">2 active, 1 pending</div>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-content">
                    <h3>Avg. Response Time</h3>
                    <div className="stat-number">1.2s</div>
                    <div className="stat-change positive">-0.3s improvement</div>
                  </div>
                </div>
              </div>

              <div className="charts-section">
                <div className="chart-card">
                  <h3>Query Volume (Last 30 Days)</h3>
                  <div className="mock-chart">
                    <div className="chart-placeholder">📈 Interactive chart would go here</div>
                  </div>
                </div>
                
                <div className="chart-card">
                  <h3>Revenue Trend</h3>
                  <div className="mock-chart">
                    <div className="chart-placeholder">💹 Revenue chart would go here</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pages' && (
            <div className="dashboard-content">
              <div className="dashboard-header">
                <h1>Your Websites</h1>
                <p>Manage Ask Anything™ widgets across your properties</p>
                <button className="add-website-btn">+ Add New Website</button>
              </div>

              <div className="websites-grid">
                {mockWebsites.map(site => (
                  <div key={site.id} className="website-card">
                    <div className="website-header">
                      <div className="website-info">
                        <h3>{site.name}</h3>
                        <p>{site.url}</p>
                      </div>
                      <div className={`status-badge ${site.status.toLowerCase()}`}>
                        {site.status}
                      </div>
                    </div>
                    
                    <div className="website-stats">
                      <div className="website-stat">
                        <span className="stat-label">Monthly Views</span>
                        <span className="stat-value">{site.monthlyViews}</span>
                      </div>
                      <div className="website-stat">
                        <span className="stat-label">Ask Anything™ Queries</span>
                        <span className="stat-value">{site.askAnythingQueries}</span>
                      </div>
                      <div className="website-stat">
                        <span className="stat-label">Revenue</span>
                        <span className="stat-value">{site.revenue}</span>
                      </div>
                    </div>
                    
                    <div className="website-actions">
                      <button className="action-btn secondary">Configure</button>
                      <button className="action-btn primary">View Analytics</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="dashboard-content">
              <div className="dashboard-header">
                <h1>Advanced Analytics</h1>
                <p>Deep dive into your Ask Anything™ performance metrics</p>
              </div>
              <div className="analytics-placeholder">
                <div className="placeholder-content">
                  <h3>📊 Advanced Analytics Coming Soon</h3>
                  <p>Detailed performance metrics, user engagement data, and revenue analytics will be available here.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="dashboard-content">
              <div className="dashboard-header">
                <h1>Account Settings</h1>
                <p>Manage your account preferences and billing</p>
              </div>
              <div className="settings-placeholder">
                <div className="placeholder-content">
                  <h3>⚙️ Settings Panel Coming Soon</h3>
                  <p>Account management, billing settings, and preferences will be available here.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .dashboard-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        .dashboard-container {
          background: radial-gradient(ellipse at center, #3742fa 0%, #0c1426 100%);
          width: 95vw;
          height: 90vh;
          border-radius: 16px;
          display: flex;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .dashboard-sidebar {
          width: 280px;
          background: rgba(0, 0, 0, 0.3);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sidebar-gist-logo {
          height: 1.5rem;
          width: auto;
        }

        .sidebar-logo h2 {
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          font-family: 'Inter', sans-serif;
        }

        .dashboard-close-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .dashboard-close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
        }

        .nav-item {
          width: 100%;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          padding: 1rem 2rem;
          text-align: left;
          font-size: 1rem;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .nav-item.active {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          color: white;
          font-weight: 600;
        }

        .nav-icon {
          font-size: 1.2rem;
        }

        .dashboard-main {
          flex: 1;
          overflow-y: auto;
          background: rgba(255, 255, 255, 0.02);
        }

        .dashboard-content {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .dashboard-header h1 {
          color: white;
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
          font-family: 'Inter', sans-serif;
        }

        .dashboard-header p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.1rem;
          margin: 0.5rem 0 0 0;
          font-family: 'Inter', sans-serif;
        }

        .add-website-btn {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-website-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          font-size: 2rem;
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          width: 3rem;
          height: 3rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content h3 {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          font-weight: 500;
          margin: 0 0 0.5rem 0;
          font-family: 'Inter', sans-serif;
        }

        .stat-number {
          color: white;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          font-family: 'Inter', sans-serif;
        }

        .stat-change {
          font-size: 0.85rem;
          font-family: 'Inter', sans-serif;
        }

        .stat-change.positive {
          color: #10b981;
        }

        .stat-change.neutral {
          color: rgba(255, 255, 255, 0.6);
        }

        .charts-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .chart-card {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .chart-card h3 {
          color: white;
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          font-family: 'Inter', sans-serif;
        }

        .mock-chart {
          height: 200px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chart-placeholder {
          color: rgba(255, 255, 255, 0.5);
          font-family: 'Inter', sans-serif;
        }

        .websites-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .website-card {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .website-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }

        .website-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .website-info h3 {
          color: white;
          font-size: 1.3rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          font-family: 'Inter', sans-serif;
        }

        .website-info p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          font-family: 'Inter', sans-serif;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
        }

        .status-badge.active {
          background: #10b981;
          color: white;
        }

        .status-badge.pending {
          background: #f59e0b;
          color: white;
        }

        .website-stats {
          margin: 1.5rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .website-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          font-family: 'Inter', sans-serif;
        }

        .stat-value {
          color: white;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
        }

        .website-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 6px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          color: white;
        }

        .action-btn.primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
        }

        .analytics-placeholder,
        .settings-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 400px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 2px dashed rgba(255, 255, 255, 0.2);
        }

        .placeholder-content {
          text-align: center;
        }

        .placeholder-content h3 {
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          font-family: 'Inter', sans-serif;
        }

        .placeholder-content p {
          color: rgba(255, 255, 255, 0.7);
          font-family: 'Inter', sans-serif;
          max-width: 400px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            width: 100vw;
            height: 100vh;
            border-radius: 0;
          }

          .dashboard-sidebar {
            width: 240px;
          }

          .sidebar-header {
            padding: 1.5rem;
          }

          .sidebar-logo h2 {
            font-size: 1rem;
          }

          .dashboard-content {
            padding: 1.5rem;
          }

          .dashboard-header h1 {
            font-size: 2rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .charts-section {
            grid-template-columns: 1fr;
          }

          .websites-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
} 