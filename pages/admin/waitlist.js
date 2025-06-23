import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function WaitlistAdmin({ waitlistData, stats }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const ADMIN_PASSWORD = 'gist2024admin'; // Change this in production!

  const handleAuth = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const filteredData = waitlistData.filter(entry =>
    entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.website && entry.website.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (entry.interest && entry.interest.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedData = [...filteredData].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'submittedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Website', 'Interest', 'Submitted At'];
    const csvContent = [
      headers.join(','),
      ...sortedData.map(entry => [
        `"${entry.name}"`,
        `"${entry.email}"`,
        `"${entry.website || ''}"`,
        `"${entry.interest || ''}"`,
        `"${new Date(entry.submittedAt).toLocaleString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Waitlist Admin - Ask Anything™</title>
        </Head>
        <div className="auth-container">
          <div className="auth-form">
            <img src="/Gist G white no background.png" alt="Gist" className="auth-logo" />
            <h1>Waitlist Admin</h1>
            <form onSubmit={handleAuth}>
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Access Admin Panel</button>
            </form>
          </div>
          <style jsx>{`
            .auth-container {
              min-height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            .auth-form {
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 20px;
              padding: 2rem;
              text-align: center;
              color: white;
              max-width: 400px;
              width: 90%;
            }
            .auth-logo {
              width: 48px;
              height: 48px;
              margin-bottom: 1rem;
            }
            h1 {
              margin: 0 0 2rem 0;
              font-size: 1.5rem;
            }
            input {
              width: 100%;
              padding: 0.75rem 1rem;
              border: 1px solid rgba(255, 255, 255, 0.3);
              border-radius: 10px;
              background: rgba(255, 255, 255, 0.1);
              color: white;
              font-size: 1rem;
              margin-bottom: 1rem;
              box-sizing: border-box;
            }
            input::placeholder {
              color: rgba(255, 255, 255, 0.6);
            }
            button {
              width: 100%;
              padding: 0.75rem 1rem;
              background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
              border: none;
              border-radius: 10px;
              color: white;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: transform 0.2s ease;
            }
            button:hover {
              transform: translateY(-1px);
            }
          `}</style>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Waitlist Admin - Ask Anything™</title>
      </Head>
      <div className="admin-container">
        <header className="admin-header">
          <div className="header-left">
            <img src="/Gist G white no background.png" alt="Gist" className="logo" />
            <h1>Waitlist Admin</h1>
          </div>
          <div className="header-right">
            <button onClick={() => router.push('/')} className="back-btn">
              ← Back to Site
            </button>
            <button onClick={() => setIsAuthenticated(false)} className="logout-btn">
              Logout
            </button>
          </div>
        </header>

        <main className="admin-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Signups</h3>
              <div className="stat-number">{stats.total}</div>
            </div>
            <div className="stat-card">
              <h3>This Week</h3>
              <div className="stat-number">{stats.recentSignups}</div>
            </div>
            <div className="stat-card">
              <h3>With Websites</h3>
              <div className="stat-number">{stats.websitesCount}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="controls">
            <div className="search-controls">
              <input
                type="text"
                placeholder="Search by name, email, or website..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="sort-controls">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="submittedAt">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="email">Sort by Email</option>
                <option value="website">Sort by Website</option>
              </select>
              <button 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="sort-order-btn"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
              <button onClick={exportToCSV} className="export-btn">
                Export CSV
              </button>
            </div>
          </div>

          {/* Waitlist Table */}
          <div className="table-container">
            <table className="waitlist-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Website</th>
                  <th>Interest</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((entry, index) => (
                  <tr key={entry.id}>
                    <td>{index + 1}</td>
                    <td>{entry.name}</td>
                    <td>{entry.email}</td>
                    <td>{entry.website || '-'}</td>
                    <td title={entry.interest}>{entry.interest ? (entry.interest.length > 50 ? entry.interest.substring(0, 50) + '...' : entry.interest) : '-'}</td>
                    <td>{new Date(entry.submittedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedData.length === 0 && (
            <div className="no-results">
              {searchTerm ? 'No results found for your search.' : 'No waitlist entries yet.'}
            </div>
          )}
        </main>

        <style jsx>{`
          .admin-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }

          .admin-header {
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

          .logo {
            width: 32px;
            height: 32px;
          }

          .header-left h1 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 700;
          }

          .header-right {
            display: flex;
            gap: 1rem;
          }

          .back-btn, .logout-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .back-btn:hover, .logout-btn:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          .admin-content {
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .stat-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            padding: 1.5rem;
            text-align: center;
          }

          .stat-card h3 {
            margin: 0 0 0.5rem 0;
            font-size: 0.9rem;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .stat-number {
            font-size: 2rem;
            font-weight: 700;
          }

          .controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            gap: 1rem;
          }

          .search-input {
            padding: 0.75rem 1rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 1rem;
            min-width: 300px;
          }

          .search-input::placeholder {
            color: rgba(255, 255, 255, 0.6);
          }

          .sort-controls {
            display: flex;
            gap: 0.5rem;
            align-items: center;
          }

          .sort-controls select {
            padding: 0.5rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
          }

          .sort-order-btn, .export-btn {
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .sort-order-btn:hover, .export-btn:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          .table-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            overflow: hidden;
          }

          .waitlist-table {
            width: 100%;
            border-collapse: collapse;
          }

          .waitlist-table th {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          }

          .waitlist-table td {
            padding: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .waitlist-table tr:hover {
            background: rgba(255, 255, 255, 0.05);
          }

          .no-results {
            text-align: center;
            padding: 2rem;
            opacity: 0.7;
            font-style: italic;
          }

          @media (max-width: 768px) {
            .admin-header {
              padding: 1rem;
            }

            .admin-content {
              padding: 1rem;
            }

            .controls {
              flex-direction: column;
              align-items: stretch;
            }

            .search-input {
              min-width: auto;
              width: 100%;
            }

            .waitlist-table {
              font-size: 0.875rem;
            }

            .waitlist-table th,
            .waitlist-table td {
              padding: 0.5rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    // Import the blob functions
    const { head } = await import('@vercel/blob');
    
    const BLOB_FILENAME = 'waitlist.json';
    let waitlistData = [];
    
    try {
      // Check if blob exists first
      await head(BLOB_FILENAME);
      
      // Fetch the blob content
      const blobUrl = `https://${process.env.VERCEL_URL || process.env.BLOB_READ_WRITE_TOKEN?.split('_')[1] || 'localhost'}.vercel-storage.com/${BLOB_FILENAME}`;
      const response = await fetch(blobUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
        }
      });

      if (response.ok) {
        const data = await response.text();
        waitlistData = JSON.parse(data);
      }
    } catch (error) {
      // Blob doesn't exist or error fetching, start with empty array
      console.log('Blob not found or error fetching, starting with empty array:', error.message);
    }

    const stats = {
      total: waitlistData.length,
      recentSignups: waitlistData.filter(entry => {
        const signupDate = new Date(entry.submittedAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return signupDate > weekAgo;
      }).length,
      topRoles: waitlistData.reduce((acc, entry) => {
        if (entry.role) {
          acc[entry.role] = (acc[entry.role] || 0) + 1;
        }
        return acc;
      }, {})
    };

    return {
      props: {
        waitlistData,
        stats
      }
    };
  } catch (error) {
    console.error('Error loading waitlist data from blob:', error);
    return {
      props: {
        waitlistData: [],
        stats: { total: 0, recentSignups: 0, topRoles: {} }
      }
    };
  }
} 