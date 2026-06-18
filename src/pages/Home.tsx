import React from 'react';
import { useNavigate } from 'react-router-dom';
import incidentsData from '../data/incidents.json';
import { useDemo } from '../context/DemoContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentIncidentIndex, resetDemo, isDemoMode, setDemoMode } = useDemo();

  const handleStart = () => {
    if (currentIncidentIndex !== 0) {
      resetDemo();
    } else {
      const firstIncident = incidentsData[0];
      navigate(`/incident/${firstIncident.id}`);
    }
  };

  return (
    <div className="app-container fade-in">
      <header className="header">
        <h2>VAR Room</h2>
      </header>
      
      <main className="main-content" style={{ marginTop: '10vh' }}>
        <h1 style={{ fontSize: '4rem' }}>The Law Defines Procedure.</h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '64px', color: 'var(--text-muted)' }}>
          Football's biggest controversies aren't about what happened. 
          <br/>They're about what a word means.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn-primary" style={{ fontSize: '1.25rem', padding: '16px 32px' }} onClick={handleStart}>
              Enter the Review Room
            </button>
            
            <button className="btn-ghost" style={{ fontSize: '1.25rem', padding: '16px 32px' }} onClick={() => navigate('/live')}>
              Live Generation
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <input 
              type="checkbox" 
              id="demoMode" 
              checked={isDemoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              style={{ accentColor: 'var(--accent-color)', width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="demoMode" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
              Canonical Demo Path (Skip Mbappé/De Jong)
            </label>
          </div>
        </div>
      </main>
    </div>
  );
};
