import React from 'react';
import './App.css';

function App() {
  // These variables are baked in during the 'docker build' via your Build Args
  const bgColor = process.env.REACT_APP_COLOR || "#1e293b"; // Default dark slate
  const siteName = process.env.REACT_APP_NAME || "DevOps Portal";
  const envName = process.env.REACT_APP_ENV || "Production";
  const isDebug = process.env.REACT_APP_DEBUG === "true";

  return (
    /* Dynamic background color from .env */
    <div className="App" style={{ backgroundColor: bgColor }}>
      <div className="glass-container">
        <header className="app-header">
          <div className="pulse-wrapper">
            <span className="pulse-dot"></span>
            <span className="status-label">System Live</span>
          </div>
          <h1>{siteName}</h1>
          <p className="env-badge">{envName} Environment</p>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <label>Deployment Status</label>
            <div className="value">Stable</div>
          </div>
          <div className="stat-card">
            <label>Debug Mode</label>
            <div className={`value ${isDebug ? 'debug-active' : ''}`}>
              {isDebug ? "Enabled" : "Disabled"}
            </div>
          </div>
        </section>

        <div className="tech-stack">
          <h3>Infrastructure Details</h3>
          <ul>
            <li><strong>Orchestration:</strong> Docker Compose</li>
            <li><strong>Registry:</strong> Amazon ECR</li>
            <li><strong>CI/CD:</strong> GitHub Actions</li>
          </ul>
        </div>

        <div className="color-info">
          <p>Current Background Variable:</p>
          <code>{bgColor}</code>
        </div>

        <footer className="app-footer">
          &copy; 2026 {siteName} | {envName} Instance
        </footer>
      </div>
    </div>
  );
}

export default App;
