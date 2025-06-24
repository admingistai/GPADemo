import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';

export default function Dashboard() {
  const [selectedMetric, setSelectedMetric] = useState('ai_performance');
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedSite, setSelectedSite] = useState('the-harbor');

  // Chart data for different metrics
  const chartData = {
    ai_performance: {
      title: 'AI Performance',
      datasets: [
        { label: 'Questions Asked', data: [2450, 2680, 2890, 3120, 3340, 3560, 3890], color: '#667eea' },
        { label: 'Answered Rate', data: [94.2, 94.8, 95.1, 95.3, 95.7, 96.1, 96.4], color: '#818cf8' }
      ]
    },
    engagement: {
      title: 'User Engagement',
      datasets: [
        { label: 'Session Duration', data: [4.2, 4.5, 4.8, 5.1, 5.3, 5.6, 5.9], color: '#667eea' },
        { label: 'Pages/Session', data: [3.8, 4.1, 4.3, 4.6, 4.8, 5.1, 5.4], color: '#818cf8' }
      ]
    },
    revenue: {
      title: 'Revenue Impact',
      datasets: [
        { label: 'Revenue/Session', data: [2.45, 2.68, 2.89, 3.12, 3.34, 3.56, 3.89], color: '#667eea' },
        { label: 'Ad Impressions', data: [12.4, 13.2, 14.1, 15.2, 16.3, 17.5, 18.8], color: '#818cf8' }
      ]
    }
  };

  return (
    <>
      <Head>
        <title>AI Analytics - Ask Anything™</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="dashboard">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <div className="logo-section">
              <Image src="/Gist G white no background.png" alt="Gist" className="logo-img" width={40} height={40} />
              <h1 className="logo">Ask Anything™</h1>
            </div>
            <span className="site-selector">
              <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)}>
                <option value="the-harbor">The Harbor</option>
                <option value="tech-daily">Tech Daily</option>
                <option value="finance-weekly">Finance Weekly</option>
              </select>
            </span>
          </div>
          
          <div className="header-center">
            <nav className="nav-tabs">
              <button className="nav-tab active">Overview</button>
              <button className="nav-tab">AI Performance</button>
              <button className="nav-tab">Engagement</button>
              <button className="nav-tab">Revenue</button>
              <button className="nav-tab">Content</button>
            </nav>
          </div>
          
          <div className="header-right">
            <select className="time-selector" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button className="settings-btn">Settings</button>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {/* Overview Cards */}
          <section className="overview-section">
            <div className="metric-grid">
              {/* AI Performance Cards */}
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Questions Answered</span>
                  <span className="metric-trend positive">+12.4%</span>
                </div>
                <div className="metric-value">147.2K</div>
                <div className="metric-sparkline">
                  <svg viewBox="0 0 100 30" className="sparkline">
                    <polyline points="0,25 20,20 40,15 60,12 80,8 100,5" />
                  </svg>
                </div>
                <div className="metric-footer">96.4% answer rate</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Avg Response Time</span>
                  <span className="metric-trend positive">-8.2%</span>
                </div>
                <div className="metric-value">1.3s</div>
                <div className="metric-sparkline">
                  <svg viewBox="0 0 100 30" className="sparkline">
                    <polyline points="0,5 20,8 40,12 60,10 80,15 100,20" />
                  </svg>
                </div>
                <div className="metric-footer">Below 2s target</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Session Duration</span>
                  <span className="metric-trend positive">+23.7%</span>
                </div>
                <div className="metric-value">5m 54s</div>
                <div className="metric-sparkline">
                  <svg viewBox="0 0 100 30" className="sparkline">
                    <polyline points="0,20 20,18 40,15 60,12 80,8 100,5" />
                  </svg>
                </div>
                <div className="metric-footer">vs 4m 46s baseline</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Revenue Impact</span>
                  <span className="metric-trend positive">+31.2%</span>
                </div>
                <div className="metric-value">$42.7K</div>
                <div className="metric-sparkline">
                  <svg viewBox="0 0 100 30" className="sparkline">
                    <polyline points="0,25 20,22 40,18 60,15 80,10 100,5" />
                  </svg>
                </div>
                <div className="metric-footer">This week</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Content Discovery</span>
                  <span className="metric-trend positive">+18.9%</span>
                </div>
                <div className="metric-value">3.8x</div>
                <div className="metric-sparkline">
                  <svg viewBox="0 0 100 30" className="sparkline">
                    <polyline points="0,20 20,18 40,15 60,12 80,10 100,8" />
                  </svg>
                </div>
                <div className="metric-footer">Articles per session</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">User Satisfaction</span>
                  <span className="metric-trend positive">+4.1%</span>
                </div>
                <div className="metric-value">4.7/5</div>
                <div className="metric-sparkline">
                  <svg viewBox="0 0 100 30" className="sparkline">
                    <polyline points="0,15 20,12 40,10 60,8 80,6 100,5" />
                  </svg>
                </div>
                <div className="metric-footer">8,234 ratings</div>
              </div>
            </div>
          </section>

          {/* Main Performance Chart */}
          <section className="chart-section">
            <div className="chart-container">
              <div className="chart-header">
                <h2 className="chart-title">Performance Overview</h2>
                <div className="chart-controls">
                  <button 
                    className={`chart-btn ${selectedMetric === 'ai_performance' ? 'active' : ''}`}
                    onClick={() => setSelectedMetric('ai_performance')}
                  >
                    AI Performance
                  </button>
                  <button 
                    className={`chart-btn ${selectedMetric === 'engagement' ? 'active' : ''}`}
                    onClick={() => setSelectedMetric('engagement')}
                  >
                    Engagement
                  </button>
                  <button 
                    className={`chart-btn ${selectedMetric === 'revenue' ? 'active' : ''}`}
                    onClick={() => setSelectedMetric('revenue')}
                  >
                    Revenue
                  </button>
                </div>
              </div>
              
              <div className="chart-body">
                <svg viewBox="0 0 800 400" className="main-chart">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <line 
                      key={i}
                      x1="50" 
                      y1={50 + i * 75} 
                      x2="750" 
                      y2={50 + i * 75}
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Chart lines */}
                  {chartData[selectedMetric].datasets.map((dataset, idx) => (
                    <g key={idx}>
                      <polyline
                        points={dataset.data.map((val, i) => 
                          `${50 + i * 100},${350 - (val / Math.max(...dataset.data)) * 250}`
                        ).join(' ')}
                        fill="none"
                        stroke={dataset.color}
                        strokeWidth="2"
                      />
                      {dataset.data.map((val, i) => (
                        <circle
                          key={i}
                          cx={50 + i * 100}
                          cy={350 - (val / Math.max(...dataset.data)) * 250}
                          r="4"
                          fill={dataset.color}
                        />
                      ))}
                    </g>
                  ))}
                  
                  {/* X-axis labels */}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <text
                      key={day}
                      x={50 + i * 100}
                      y={380}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.5)"
                      fontSize="12"
                    >
                      {day}
                    </text>
                  ))}
                </svg>
                
                <div className="chart-legend">
                  {chartData[selectedMetric].datasets.map((dataset, idx) => (
                    <div key={idx} className="legend-item">
                      <span className="legend-color" style={{background: dataset.color}}></span>
                      <span className="legend-label">{dataset.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* AI Performance Detailed Metrics */}
          <section className="detailed-metrics">
            <div className="metrics-row">
              {/* Question Analytics */}
              <div className="analytics-card">
                <h3 className="card-title">Question Analytics</h3>
                <div className="question-metrics">
                  <div className="metric-row">
                    <span className="metric-name">Average Complexity Score</span>
                    <span className="metric-value">7.8/10</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Multi-turn Conversations</span>
                    <span className="metric-value">34.2%</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Sources per Answer</span>
                    <span className="metric-value">3.6</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-name">Accuracy Score</span>
                    <span className="metric-value">98.7%</span>
                  </div>
                </div>
                
                <div className="top-questions">
                  <h4 className="subsection-title">Top Question Categories</h4>
                  <div className="category-list">
                    <div className="category-item">
                      <span className="category-name">Technical Details</span>
                      <div className="category-bar">
                        <div className="category-fill" style={{width: '85%'}}></div>
                      </div>
                      <span className="category-count">2.1K</span>
                    </div>
                    <div className="category-item">
                      <span className="category-name">Comparisons</span>
                      <div className="category-bar">
                        <div className="category-fill" style={{width: '72%'}}></div>
                      </div>
                      <span className="category-count">1.8K</span>
                    </div>
                    <div className="category-item">
                      <span className="category-name">Implementation</span>
                      <div className="category-bar">
                        <div className="category-fill" style={{width: '68%'}}></div>
                      </div>
                      <span className="category-count">1.7K</span>
                    </div>
                    <div className="category-item">
                      <span className="category-name">Pricing</span>
                      <div className="category-bar">
                        <div className="category-fill" style={{width: '55%'}}></div>
                      </div>
                      <span className="category-count">1.4K</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Intelligence */}
              <div className="analytics-card">
                <h3 className="card-title">Content Intelligence</h3>
                <div className="content-insights">
                  <div className="insight-item">
                    <h4 className="insight-label">Most Queried Articles</h4>
                    <div className="article-list">
                      <div className="article-item">
                        <span className="article-title">AI Revolution in Healthcare</span>
                        <span className="article-queries">847</span>
                      </div>
                      <div className="article-item">
                        <span className="article-title">Climate Tech Breakthroughs 2025</span>
                        <span className="article-queries">623</span>
                      </div>
                      <div className="article-item">
                        <span className="article-title">Future of Remote Work</span>
                        <span className="article-queries">541</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="insight-item">
                    <h4 className="insight-label">Content Gaps Identified</h4>
                    <div className="gap-list">
                      <div className="gap-item">
                        <span className="gap-topic">Quantum computing basics</span>
                        <span className="gap-demand">High</span>
                      </div>
                      <div className="gap-item">
                        <span className="gap-topic">Sustainability metrics</span>
                        <span className="gap-demand">Medium</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Attribution */}
              <div className="analytics-card">
                <h3 className="card-title">Revenue Attribution</h3>
                <div className="revenue-breakdown">
                  <div className="revenue-metric">
                    <span className="revenue-label">Direct AI Session Value</span>
                    <span className="revenue-value">$3.89</span>
                  </div>
                  <div className="revenue-metric">
                    <span className="revenue-label">Extended Session Revenue</span>
                    <span className="revenue-value">$2.47</span>
                  </div>
                  <div className="revenue-metric">
                    <span className="revenue-label">Subscription Lift</span>
                    <span className="revenue-value">+18.3%</span>
                  </div>
                  
                  <div className="revenue-chart">
                    <h4 className="subsection-title">Revenue by Feature</h4>
                    <div className="feature-revenue">
                      <div className="feature-item">
                        <span className="feature-name">Ask Anything</span>
                        <span className="feature-value">45%</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-name">AI Summaries</span>
                        <span className="feature-value">28%</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-name">Smart Remixing</span>
                        <span className="feature-value">18%</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-name">Deep Dive</span>
                        <span className="feature-value">9%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Real-time Activity Feed */}
          <section className="activity-section">
            <div className="activity-container">
              <h3 className="section-title">Real-time Activity</h3>
              <div className="activity-feed">
                <div className="activity-item">
                  <span className="activity-time">14:32:18</span>
                  <span className="activity-type">Question</span>
                  <span className="activity-content">"How does this compare to competitors?"</span>
                  <span className="activity-article">AI in Healthcare</span>
                  <span className="activity-metrics">
                    <span className="metric">3 sources</span>
                    <span className="metric">1.2s</span>
                  </span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">14:32:15</span>
                  <span className="activity-type">Deep Dive</span>
                  <span className="activity-content">User exploring related articles</span>
                  <span className="activity-article">Climate Tech</span>
                  <span className="activity-metrics">
                    <span className="metric">4 articles</span>
                    <span className="metric">+$0.48</span>
                  </span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">14:32:12</span>
                  <span className="activity-type">Share</span>
                  <span className="activity-content">AI summary shared on LinkedIn</span>
                  <span className="activity-article">Remote Work</span>
                  <span className="activity-metrics">
                    <span className="metric">12 reactions</span>
                    <span className="metric">Viral</span>
                  </span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">14:32:08</span>
                  <span className="activity-type">Question</span>
                  <span className="activity-content">"What are the implementation costs?"</span>
                  <span className="activity-article">Quantum Computing</span>
                  <span className="activity-metrics">
                    <span className="metric">5 sources</span>
                    <span className="metric">0.9s</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Performance & User Satisfaction */}
          <section className="performance-section">
            <div className="performance-grid">
              {/* Technical Metrics */}
              <div className="performance-card">
                <h3 className="card-title">Technical Performance</h3>
                <div className="tech-metrics">
                  <div className="tech-metric">
                    <span className="tech-label">Widget Load Impact</span>
                    <span className="tech-value">+82ms</span>
                    <span className="tech-status good">Optimal</span>
                  </div>
                  <div className="tech-metric">
                    <span className="tech-label">API Response Time</span>
                    <span className="tech-value">124ms</span>
                    <span className="tech-status good">P95</span>
                  </div>
                  <div className="tech-metric">
                    <span className="tech-label">Error Rate</span>
                    <span className="tech-value">0.03%</span>
                    <span className="tech-status good">Low</span>
                  </div>
                  <div className="tech-metric">
                    <span className="tech-label">Browser Support</span>
                    <span className="tech-value">99.2%</span>
                    <span className="tech-status good">Excellent</span>
                  </div>
                </div>
              </div>

              {/* User Satisfaction */}
              <div className="performance-card">
                <h3 className="card-title">User Satisfaction</h3>
                <div className="satisfaction-metrics">
                  <div className="nps-score">
                    <span className="nps-label">NPS Score</span>
                    <span className="nps-value">72</span>
                    <span className="nps-trend">+8 pts</span>
                  </div>
                  
                  <div className="feedback-breakdown">
                    <div className="feedback-item">
                      <span className="feedback-label">Answer Quality</span>
                      <div className="feedback-bar">
                        <div className="feedback-fill" style={{width: '92%'}}></div>
                      </div>
                      <span className="feedback-score">4.6/5</span>
                    </div>
                    <div className="feedback-item">
                      <span className="feedback-label">Response Speed</span>
                      <div className="feedback-bar">
                        <div className="feedback-fill" style={{width: '88%'}}></div>
                      </div>
                      <span className="feedback-score">4.4/5</span>
                    </div>
                    <div className="feedback-item">
                      <span className="feedback-label">Relevance</span>
                      <div className="feedback-bar">
                        <div className="feedback-fill" style={{width: '94%'}}></div>
                      </div>
                      <span className="feedback-score">4.7/5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Predictive Insights */}
              <div className="performance-card">
                <h3 className="card-title">AI-Powered Insights</h3>
                <div className="ai-insights">
                  <div className="insight">
                    <span className="insight-icon">↑</span>
                    <span className="insight-text">Question volume predicted to increase 23% next week based on trending topics</span>
                  </div>
                  <div className="insight">
                    <span className="insight-icon">💡</span>
                    <span className="insight-text">Create content on "AI Ethics" - 847 unanswered queries detected</span>
                  </div>
                  <div className="insight">
                    <span className="insight-icon">⚡</span>
                    <span className="insight-text">Enable smart summaries on long-form articles to boost engagement by ~15%</span>
                  </div>
                  <div className="insight">
                    <span className="insight-icon">$</span>
                    <span className="insight-text">Premium content unlock feature could generate additional $18K/month</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .dashboard {
          background: #000;
          min-height: 100vh;
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Header */
        .header {
          background: #0a0a0a;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .logo-img {
          height: 24px;
          width: auto;
        }

        .logo {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        .site-selector select {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .site-selector select:focus {
          outline: none;
          border-color: #667eea;
        }

        .header-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .nav-tabs {
          display: flex;
          gap: 2rem;
        }

        .nav-tab {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
          cursor: pointer;
          padding: 0.5rem 0;
          transition: all 0.2s;
          position: relative;
        }

        .nav-tab:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .nav-tab.active {
          color: #fff;
        }

        .nav-tab.active::after {
          content: '';
          position: absolute;
          bottom: -1rem;
          left: 0;
          right: 0;
          height: 2px;
          background: #667eea;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .time-selector {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .time-selector:focus {
          outline: none;
          border-color: #667eea;
        }

        .settings-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .settings-btn:hover {
          border-color: rgba(255, 255, 255, 0.2);
          color: #fff;
        }

        /* Main Content */
        .main-content {
          padding: 2rem;
          max-width: 1600px;
          margin: 0 auto;
        }

        /* Overview Section */
        .overview-section {
          margin-bottom: 3rem;
        }

        .metric-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }

        .metric-card {
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1.5rem;
          transition: all 0.2s;
        }

        .metric-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .metric-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .metric-trend {
          font-size: 0.75rem;
          font-weight: 500;
        }

        .metric-trend.positive {
          color: #10b981;
        }

        .metric-trend.negative {
          color: #ef4444;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .metric-sparkline {
          height: 30px;
          margin-bottom: 0.5rem;
        }

        .sparkline {
          width: 100%;
          height: 100%;
        }

        .sparkline polyline {
          fill: none;
          stroke: #667eea;
          stroke-width: 2;
          opacity: 0.6;
        }

        .metric-footer {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }

        /* Chart Section */
        .chart-section {
          margin-bottom: 3rem;
        }

        .chart-container {
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 2rem;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .chart-title {
          font-size: 1.25rem;
          font-weight: 500;
          margin: 0;
        }

        .chart-controls {
          display: flex;
          gap: 0.5rem;
        }

        .chart-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chart-btn:hover {
          border-color: rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.8);
        }

        .chart-btn.active {
          background: rgba(102, 126, 234, 0.1);
          border-color: #667eea;
          color: #667eea;
        }

        .chart-body {
          position: relative;
        }

        .main-chart {
          width: 100%;
          height: 400px;
        }

        .chart-legend {
          display: flex;
          gap: 2rem;
          justify-content: center;
          margin-top: 1rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .legend-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Detailed Metrics */
        .detailed-metrics {
          margin-bottom: 3rem;
        }

        .metrics-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1rem;
        }

        .analytics-card {
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1.5rem;
        }

        .card-title {
          font-size: 1.125rem;
          font-weight: 500;
          margin: 0 0 1.5rem 0;
        }

        .question-metrics {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .metric-name {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .metric-value {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .subsection-title {
          font-size: 0.875rem;
          font-weight: 500;
          margin: 0 0 1rem 0;
          color: rgba(255, 255, 255, 0.8);
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .category-item {
          display: grid;
          grid-template-columns: 1fr 100px 50px;
          gap: 1rem;
          align-items: center;
        }

        .category-name {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .category-bar {
          background: rgba(255, 255, 255, 0.05);
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
        }

        .category-fill {
          height: 100%;
          background: #667eea;
          border-radius: 3px;
        }

        .category-count {
          font-size: 0.875rem;
          font-weight: 500;
          text-align: right;
        }

        /* Content Intelligence */
        .content-insights {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .insight-item {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 1rem;
        }

        .insight-item:last-child {
          border-bottom: none;
        }

        .insight-label {
          font-size: 0.875rem;
          font-weight: 500;
          margin: 0 0 0.75rem 0;
          color: rgba(255, 255, 255, 0.8);
        }

        .article-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .article-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
        }

        .article-title {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .article-queries {
          font-size: 0.875rem;
          font-weight: 500;
          color: #667eea;
        }

        .gap-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .gap-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 4px;
        }

        .gap-topic {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .gap-demand {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          border-radius: 4px;
        }

        /* Revenue Attribution */
        .revenue-breakdown {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .revenue-metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .revenue-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .revenue-value {
          font-size: 1.125rem;
          font-weight: 500;
          color: #10b981;
        }

        .revenue-chart {
          margin-top: 1.5rem;
        }

        .feature-revenue {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .feature-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 4px;
        }

        .feature-name {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .feature-value {
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* Activity Feed */
        .activity-section {
          margin-bottom: 3rem;
        }

        .activity-container {
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1.5rem;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 500;
          margin: 0 0 1.5rem 0;
        }

        .activity-feed {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .activity-item {
          display: grid;
          grid-template-columns: 80px 80px 1fr 150px 120px;
          gap: 1rem;
          align-items: center;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
          transition: all 0.2s;
        }

        .activity-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .activity-time {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          font-family: monospace;
        }

        .activity-type {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          border-radius: 4px;
          text-align: center;
        }

        .activity-content {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .activity-article {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .activity-metrics {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .activity-metrics .metric {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        /* Performance Section */
        .performance-section {
          margin-bottom: 3rem;
        }

        .performance-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1rem;
        }

        .performance-card {
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 1.5rem;
        }

        /* Technical Metrics */
        .tech-metrics {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tech-metric {
          display: grid;
          grid-template-columns: 1fr 80px 60px;
          gap: 1rem;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tech-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .tech-value {
          font-size: 0.875rem;
          font-weight: 500;
          text-align: right;
        }

        .tech-status {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          text-align: center;
        }

        .tech-status.good {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        /* User Satisfaction */
        .satisfaction-metrics {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .nps-score {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
        }

        .nps-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .nps-value {
          font-size: 2rem;
          font-weight: 600;
          color: #10b981;
        }

        .nps-trend {
          font-size: 0.875rem;
          color: #10b981;
        }

        .feedback-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .feedback-item {
          display: grid;
          grid-template-columns: 1fr 100px 50px;
          gap: 1rem;
          align-items: center;
        }

        .feedback-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .feedback-bar {
          background: rgba(255, 255, 255, 0.05);
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
        }

        .feedback-fill {
          height: 100%;
          background: #667eea;
          border-radius: 3px;
        }

        .feedback-score {
          font-size: 0.875rem;
          font-weight: 500;
          text-align: right;
        }

        /* AI Insights */
        .ai-insights {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .insight {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(102, 126, 234, 0.05);
          border: 1px solid rgba(102, 126, 234, 0.1);
          border-radius: 6px;
        }

        .insight-icon {
          font-size: 1.25rem;
        }

        .insight-text {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.4;
        }

        /* Scrollbar */
        .activity-feed::-webkit-scrollbar {
          width: 4px;
        }

        .activity-feed::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .activity-feed::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }

        .activity-feed::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .metrics-row {
            grid-template-columns: 1fr;
          }
          
          .performance-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }
          
          .header-center {
            width: 100%;
          }
          
          .nav-tabs {
            overflow-x: auto;
            width: 100%;
          }
          
          .metric-grid {
            grid-template-columns: 1fr;
          }
          
          .activity-item {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          
          .activity-time,
          .activity-type {
            display: inline-block;
            margin-right: 0.5rem;
          }
          
          .activity-metrics {
            margin-top: 0.5rem;
          }
        }
      `}</style>
    </>
  );
}