import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const router = useRouter();

  const mockWebsites = [
    {
      id: 1,
      name: 'TechCrunch',
      url: 'techcrunch.com',
      status: 'Active',
      monthlyViews: '2.4M',
      askAnythingQueries: '45.2K',
      revenue: '$8,420',
      queryGrowth: '+18%',
      revenueGrowth: '+12%'
    },
    {
      id: 2,
      name: 'The Verge',
      url: 'theverge.com',
      status: 'Active',
      monthlyViews: '1.8M',
      askAnythingQueries: '32.1K',
      revenue: '$6,180',
      queryGrowth: '+15%',
      revenueGrowth: '+9%'
    },
    {
      id: 3,
      name: 'Wired Magazine',
      url: 'wired.com',
      status: 'Pending',
      monthlyViews: '3.1M',
      askAnythingQueries: '0',
      revenue: '$0',
      queryGrowth: '0%',
      revenueGrowth: '0%'
    }
  ];

  // Mock chart data
  const queryVolumeData = [
    { day: 'Mon', queries: 2400 },
    { day: 'Tue', queries: 2800 },
    { day: 'Wed', queries: 3200 },
    { day: 'Thu', queries: 2900 },
    { day: 'Fri', queries: 3500 },
    { day: 'Sat', queries: 2100 },
    { day: 'Sun', queries: 1800 }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 4200 },
    { month: 'Feb', revenue: 5100 },
    { month: 'Mar', revenue: 6800 },
    { month: 'Apr', revenue: 8200 },
    { month: 'May', revenue: 9500 },
    { month: 'Jun', revenue: 11200 },
    { month: 'Jul', revenue: 14600 }
  ];

  const topQueriesData = [
    { query: "How does AI affect journalism?", count: 1240, site: "TechCrunch" },
    { query: "What is machine learning?", count: 980, site: "The Verge" },
    { query: "Future of electric vehicles", count: 850, site: "TechCrunch" },
    { query: "Cryptocurrency explained", count: 720, site: "The Verge" },
    { query: "Climate change solutions", count: 650, site: "Wired" }
  ];

  const MockBarChart = ({ data, dataKey, color = "#ff6b35" }) => {
    const maxValue = Math.max(...data.map(item => item[dataKey]));
    
    return (
      <div className="mock-bar-chart">
        {data.map((item, index) => (
          <div key={index} className="bar-container">
            <div 
              className="bar" 
              style={{ 
                height: `${(item[dataKey] / maxValue) * 100}%`,
                backgroundColor: color 
              }}
            >
              <div className="bar-value">{item[dataKey]}</div>
            </div>
            <div className="bar-label">{item.day || item.month}</div>
          </div>
        ))}
      </div>
    );
  };

  const MockLineChart = ({ data, dataKey, color = "#10b981" }) => {
    const maxValue = Math.max(...data.map(item => item[dataKey]));
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (item[dataKey] / maxValue) * 80;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="mock-line-chart">
        <svg viewBox="0 0 100 100" className="line-chart-svg">
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            className="chart-line"
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (item[dataKey] / maxValue) * 80;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill={color}
                className="chart-point"
              />
            );
          })}
        </svg>
        <div className="chart-labels">
          {data.map((item, index) => (
            <span key={index} className="chart-label">
              {item.day || item.month}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Publisher Dashboard - Ask Anything™</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </Head>

      <div className="dashboard-page">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo" onClick={() => router.push('/')}>
              <img src="/Gist G white no background.png" alt="Gist" className="sidebar-gist-logo" />
              <h2>Publisher Dashboard</h2>
            </div>
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

          <div className="sidebar-footer">
            <button className="back-to-site-btn" onClick={() => router.push('/')}>
              ← Back to Site
            </button>
          </div>
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
                  <h3>Query Volume (Last 7 Days)</h3>
                  <MockBarChart data={queryVolumeData} dataKey="queries" color="#ff6b35" />
                </div>
                
                <div className="chart-card">
                  <h3>Revenue Trend (Last 7 Months)</h3>
                  <MockLineChart data={revenueData} dataKey="revenue" color="#10b981" />
                </div>
              </div>

              <div className="insights-section">
                <div className="insight-card">
                  <h3>Top Performing Queries</h3>
                  <div className="queries-list">
                    {topQueriesData.map((query, index) => (
                      <div key={index} className="query-item">
                        <div className="query-info">
                          <div className="query-text">"{query.query}"</div>
                          <div className="query-meta">{query.site} • {query.count} queries</div>
                        </div>
                        <div className="query-count">{query.count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="insight-card">
                  <h3>Performance Insights</h3>
                  <div className="insights-list">
                    <div className="insight-item">
                      <div className="insight-icon positive">📈</div>
                      <div className="insight-content">
                        <div className="insight-title">Query volume up 18%</div>
                        <div className="insight-desc">Highest growth in tech-related queries</div>
                      </div>
                    </div>
                    <div className="insight-item">
                      <div className="insight-icon positive">💡</div>
                      <div className="insight-content">
                        <div className="insight-title">New revenue opportunity</div>
                        <div className="insight-desc">AI topics showing 25% higher engagement</div>
                      </div>
                    </div>
                    <div className="insight-item">
                      <div className="insight-icon neutral">⚡</div>
                      <div className="insight-content">
                        <div className="insight-title">Response time improved</div>
                        <div className="insight-desc">Average response time down 20%</div>
                      </div>
                    </div>
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
                        <span className="stat-value">{site.askAnythingQueries} <span className="growth">{site.queryGrowth}</span></span>
                      </div>
                      <div className="website-stat">
                        <span className="stat-label">Revenue</span>
                        <span className="stat-value">{site.revenue} <span className="growth">{site.revenueGrowth}</span></span>
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

              <div className="analytics-grid">
                <div className="analytics-card full-width">
                  <h3>Query Volume Over Time</h3>
                  <div className="large-chart">
                    <MockLineChart data={revenueData.map(item => ({ ...item, queries: item.revenue * 5.3 }))} dataKey="queries" color="#3742fa" />
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>Query Categories</h3>
                  <div className="category-chart">
                    <div className="category-item">
                      <div className="category-bar" style={{ width: '45%', backgroundColor: '#ff6b35' }}></div>
                      <span>Technology (45%)</span>
                    </div>
                    <div className="category-item">
                      <div className="category-bar" style={{ width: '25%', backgroundColor: '#10b981' }}></div>
                      <span>Science (25%)</span>
                    </div>
                    <div className="category-item">
                      <div className="category-bar" style={{ width: '20%', backgroundColor: '#3742fa' }}></div>
                      <span>Business (20%)</span>
                    </div>
                    <div className="category-item">
                      <div className="category-bar" style={{ width: '10%', backgroundColor: '#f59e0b' }}></div>
                      <span>Other (10%)</span>
                    </div>
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>User Engagement</h3>
                  <div className="engagement-metrics">
                    <div className="metric">
                      <div className="metric-value">3.2min</div>
                      <div className="metric-label">Avg. Session</div>
                    </div>
                    <div className="metric">
                      <div className="metric-value">72%</div>
                      <div className="metric-label">Satisfaction</div>
                    </div>
                    <div className="metric">
                      <div className="metric-value">4.2</div>
                      <div className="metric-label">Queries/Session</div>
                    </div>
                  </div>
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

              <div className="settings-grid">
                <div className="settings-card">
                  <h3>Account Information</h3>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Company Name</label>
                      <input type="text" value="TechMedia Corp" disabled />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value="admin@techmedia.com" disabled />
                    </div>
                    <div className="form-group">
                      <label>Plan</label>
                      <input type="text" value="Enterprise" disabled />
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h3>Billing Information</h3>
                  <div className="billing-info">
                    <div className="billing-item">
                      <span>Current Plan:</span>
                      <span>Enterprise ($0/month + revenue share)</span>
                    </div>
                    <div className="billing-item">
                      <span>Next Billing:</span>
                      <span>Revenue share only</span>
                    </div>
                    <div className="billing-item">
                      <span>Revenue Share:</span>
                      <span>15% of incremental ad revenue</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          .dashboard-page {
            display: flex;
            min-height: 100vh;
            background: radial-gradient(ellipse at center, #3742fa 0%, #0c1426 100%);
            font-family: 'Inter', sans-serif;
          }

          .dashboard-sidebar {
            width: 280px;
            background: rgba(0, 0, 0, 0.3);
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            position: fixed;
            height: 100vh;
            z-index: 100;
          }

          .sidebar-header {
            padding: 2rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .sidebar-logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .sidebar-logo:hover {
            transform: scale(1.02);
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

          .sidebar-footer {
            padding: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }

          .back-to-site-btn {
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'Inter', sans-serif;
          }

          .back-to-site-btn:hover {
            background: rgba(255, 255, 255, 0.15);
          }

          .dashboard-main {
            flex: 1;
            margin-left: 280px;
            overflow-y: auto;
            background: rgba(255, 255, 255, 0.02);
          }

          .dashboard-content {
            padding: 2rem;
            max-width: 1400px;
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
          }

          .dashboard-header p {
            color: rgba(255, 255, 255, 0.7);
            font-size: 1.1rem;
            margin: 0.5rem 0 0 0;
          }

          .add-website-btn {
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
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
            transition: all 0.3s ease;
          }

          .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
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
          }

          .stat-number {
            color: white;
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
          }

          .stat-change {
            font-size: 0.85rem;
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
            margin-bottom: 3rem;
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
          }

          .mock-bar-chart {
            display: flex;
            align-items: end;
            gap: 0.5rem;
            height: 200px;
            padding: 1rem 0;
          }

          .bar-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 100%;
          }

          .bar {
            width: 100%;
            background: linear-gradient(to top, #ff6b35, #f7931e);
            border-radius: 4px 4px 0 0;
            position: relative;
            transition: all 0.3s ease;
            cursor: pointer;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 0.5rem;
          }

          .bar:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
          }

          .bar-value {
            color: white;
            font-size: 0.8rem;
            font-weight: 600;
          }

          .bar-label {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.8rem;
            margin-top: 0.5rem;
          }

          .mock-line-chart {
            height: 200px;
            position: relative;
          }

          .line-chart-svg {
            width: 100%;
            height: 80%;
          }

          .chart-line {
            stroke-dasharray: 5;
            animation: dash 2s ease-in-out infinite;
          }

          .chart-point {
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .chart-point:hover {
            r: 4;
            filter: drop-shadow(0 0 8px currentColor);
          }

          .chart-labels {
            display: flex;
            justify-content: space-between;
            margin-top: 0.5rem;
          }

          .chart-label {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.8rem;
          }

          @keyframes dash {
            0%, 100% { stroke-dashoffset: 0; }
            50% { stroke-dashoffset: 10; }
          }

          .insights-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }

          .insight-card {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 12px;
            padding: 1.5rem;
            backdrop-filter: blur(10px);
          }

          .insight-card h3 {
            color: white;
            font-size: 1.2rem;
            font-weight: 600;
            margin: 0 0 1rem 0;
          }

          .queries-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .query-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            transition: all 0.3s ease;
          }

          .query-item:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          .query-text {
            color: white;
            font-weight: 500;
            margin-bottom: 0.25rem;
          }

          .query-meta {
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.8rem;
          }

          .query-count {
            color: #ff6b35;
            font-weight: 700;
            font-size: 1.1rem;
          }

          .insights-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .insight-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
          }

          .insight-icon {
            font-size: 1.5rem;
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .insight-icon.positive {
            background: rgba(16, 185, 129, 0.2);
          }

          .insight-icon.neutral {
            background: rgba(255, 255, 255, 0.1);
          }

          .insight-title {
            color: white;
            font-weight: 600;
            margin-bottom: 0.25rem;
          }

          .insight-desc {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;
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
          }

          .website-info p {
            color: rgba(255, 255, 255, 0.7);
            margin: 0;
          }

          .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
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
          }

          .stat-value {
            color: white;
            font-weight: 600;
          }

          .growth {
            color: #10b981;
            font-size: 0.8rem;
            margin-left: 0.5rem;
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

          .analytics-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }

          .analytics-card {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 12px;
            padding: 1.5rem;
            backdrop-filter: blur(10px);
          }

          .analytics-card.full-width {
            grid-column: 1 / -1;
          }

          .analytics-card h3 {
            color: white;
            font-size: 1.2rem;
            font-weight: 600;
            margin: 0 0 1rem 0;
          }

          .large-chart {
            height: 300px;
          }

          .category-chart {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .category-item {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .category-bar {
            height: 1rem;
            border-radius: 6px;
            transition: all 0.3s ease;
          }

          .category-item span {
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
            min-width: 120px;
          }

          .engagement-metrics {
            display: flex;
            justify-content: space-around;
            text-align: center;
          }

          .metric-value {
            color: white;
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
          }

          .metric-label {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;
          }

          .settings-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }

          .settings-card {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 12px;
            padding: 1.5rem;
            backdrop-filter: blur(10px);
          }

          .settings-card h3 {
            color: white;
            font-size: 1.2rem;
            font-weight: 600;
            margin: 0 0 1rem 0;
          }

          .settings-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .form-group label {
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
            font-weight: 500;
          }

          .form-group input {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            padding: 0.75rem;
            color: white;
            font-family: 'Inter', sans-serif;
          }

          .form-group input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .billing-info {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .billing-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 6px;
          }

          .billing-item span:first-child {
            color: rgba(255, 255, 255, 0.7);
          }

          .billing-item span:last-child {
            color: white;
            font-weight: 500;
          }

          @media (max-width: 768px) {
            .dashboard-sidebar {
              width: 240px;
            }

            .dashboard-main {
              margin-left: 240px;
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

            .insights-section {
              grid-template-columns: 1fr;
            }

            .websites-grid {
              grid-template-columns: 1fr;
            }

            .analytics-grid {
              grid-template-columns: 1fr;
            }

            .settings-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 480px) {
            .dashboard-sidebar {
              width: 200px;
            }

            .dashboard-main {
              margin-left: 200px;
            }

            .sidebar-header {
              padding: 1.5rem;
            }

            .sidebar-logo h2 {
              font-size: 1rem;
            }
          }
        `}</style>
      </div>
    </>
  );
} 