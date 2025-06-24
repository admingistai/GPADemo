import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
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
            <button className="sidebar-link active">Home</button>
            <button className="sidebar-link">Sites</button>
          </nav>
        </aside>
        <main className="dashboard-main">
          <h1 className="dashboard-title">Welcome to your Dashboard</h1>
          <p className="dashboard-desc">This is your central hub for managing your Ask Anything™ widgets and sites. More features coming soon!</p>
        </main>
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
          color: #3742fa;
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
        }
      `}</style>
    </>
  );
} 