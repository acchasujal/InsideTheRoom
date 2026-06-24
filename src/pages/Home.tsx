import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import incidentsData from '../data/incidents.json';
import { useDemo } from '../context/DemoContext';
import { AmbiguityHeatmap } from '../components/AmbiguityHeatmap';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentIncidentIndex, resetDemo, isDemoMode, setDemoMode } = useDemo();

  // Animation States
  const headlineText = "Every rulebook contains words it never defines.";
  const words = headlineText.split(' ');
  const [visibleWordsCount, setVisibleWordsCount] = useState(0);
  const [showChips, setShowChips] = useState(false);
  const [showBody, setShowBody] = useState(false);
  const [showCTA, setShowCTA] = useState(false);



  // Live ticking clock state (June 1, 1938 represents consolidation of modern Laws of the Game)
  const [clockTime, setClockTime] = useState({ years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Word-by-word typewriter
    if (visibleWordsCount < words.length) {
      const timer = setTimeout(() => {
        setVisibleWordsCount(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Stagger other sections
      const t1 = setTimeout(() => setShowChips(true), 400);
      const t2 = setTimeout(() => setShowBody(true), 1200);
      const t3 = setTimeout(() => setShowCTA(true), 2000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [visibleWordsCount, words.length]);

  useEffect(() => {
    const baseDate = new Date('1938-06-01T00:00:00Z');
    
    const updateClock = () => {
      const now = new Date();
      const diffMs = now.getTime() - baseDate.getTime();
      
      const msPerSecond = 1000;
      const msPerMinute = msPerSecond * 60;
      const msPerHour = msPerMinute * 60;
      const msPerDay = msPerHour * 24;
      const msPerYear = msPerDay * 365.25;
      
      const years = Math.floor(diffMs / msPerYear);
      const days = Math.floor((diffMs % msPerYear) / msPerDay);
      const hours = Math.floor((diffMs % msPerDay) / msPerHour);
      const minutes = Math.floor((diffMs % msPerHour) / msPerMinute);
      const seconds = Math.floor((diffMs % msPerMinute) / msPerSecond);
      
      setClockTime({ years, days, hours, minutes, seconds });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    if (currentIncidentIndex !== 0) {
      resetDemo();
    } else {
      const firstIncident = incidentsData[0];
      navigate(`/incident/${firstIncident.id}`);
    }
  };

  return (
    <div className="app-container fade-in" style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 0' }}>
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Inside the Room</h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ibm/granite-13b-chat-v2</span>
      </header>
      
      <main className="main-content" style={{ marginTop: '8vh', alignSelf: 'center', maxWidth: '720px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', width: '100%' }}>
        
        {/* Word-by-Word Header */}
        <h1 style={{ fontSize: '3rem', lineHeight: '1.15', fontWeight: 800, textAlign: 'center', color: '#f5f5f5', margin: 0, minHeight: '7rem' }}>
          {words.slice(0, visibleWordsCount).join(' ')}
        </h1>

        {/* Accent Chips */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'center', 
          flexWrap: 'wrap', 
          opacity: showChips ? 1 : 0, 
          transform: showChips ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.6s ease'
        }}>
          {["deliberate", "reasonable", "reckless", "clear and obvious"].map((word, i) => (
            <span key={i} style={{
              background: 'rgba(234, 179, 8, 0.08)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              color: '#EAB308',
              padding: '6px 14px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              fontWeight: 500,
              fontStyle: 'italic'
            }}>
              "{word}"
            </span>
          ))}
        </div>

        {/* Body Paragraphs */}
        <div style={{
          opacity: showBody ? 1 : 0,
          transform: showBody ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.6s ease',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <p style={{ fontSize: '1.2rem', color: '#EAB308', fontWeight: '500', margin: 0 }}>
            Those undefined words are where discretion lives. And where AI systems fail silently.
          </p>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
            Inside the Room uses IBM Granite to find those words, map every legitimate reading of them, and document exactly where your rules stop being rules and start being someone's judgment call.
          </p>
        </div>

        {/* Real Ambiguity Heatmap */}
        <div style={{
          opacity: showBody ? 1 : 0,
          transform: showBody ? 'translateY(0)' : 'translateY(15px)',
          transition: 'all 0.8s ease',
          width: '100%',
          maxWidth: '720px'
        }}>
          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Interactive Ambiguity Heatmap · 5 Undefined Terms
            </span>
            <button
              onClick={() => navigate('/heatmap')}
              style={{ background: 'transparent', border: '1px solid rgba(234,179,8,0.3)', color: '#EAB308', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'monospace' }}
            >
              Full View →
            </button>
          </div>
          <AmbiguityHeatmap mode="full" />
        </div>

        {/* Live Clock Widget */}
        <div style={{
          opacity: showBody ? 1 : 0,
          transform: showBody ? 'translateY(0)' : 'translateY(15px)',
          transition: 'all 0.8s ease',
          width: '100%',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '8px',
          padding: '16px 24px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
            The "Deliberate" Clock
          </span>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            FIFA Law 12 has used the word <strong>"deliberate"</strong> since 1938. It has never defined it.
          </p>
          <div style={{ fontFamily: 'monospace', fontSize: '1.25rem', color: '#EAB308', fontWeight: 'bold' }}>
            {clockTime.years}y {clockTime.days}d {clockTime.hours.toString().padStart(2, '0')}h {clockTime.minutes.toString().padStart(2, '0')}m {clockTime.seconds.toString().padStart(2, '0')}s
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
            Elapsed time this key regulatory standard has remained undefined.
          </span>
        </div>

        {/* CTAs */}
        <div style={{
          opacity: showCTA ? 1 : 0,
          transform: showCTA ? 'translateY(0)' : 'translateY(15px)',
          transition: 'all 0.8s ease',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          marginTop: '16px'
        }}>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
            <button 
              className="btn-primary" 
              style={{ 
                fontSize: '1.1rem', 
                padding: '14px 28px', 
                border: '2px solid #EAB308', 
                background: 'transparent', 
                color: '#EAB308', 
                boxShadow: '0 0 15px rgba(234, 179, 8, 0.15)',
                fontWeight: 'bold',
                cursor: 'pointer'
              }} 
              onClick={() => navigate('/heatmap')}
            >
              Show Me The Ambiguity →
            </button>

            <button
              className="btn-primary"
              style={{
                fontSize: '1.1rem',
                padding: '14px 28px',
                border: '1px solid rgba(234,179,8,0.5)',
                background: 'transparent',
                color: '#EAB308',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/live?mode=sensitivity')}
            >
              Run Framing Sensitivity Test →
            </button>
            
            <button 
              className="btn-ghost" 
              style={{ fontSize: '1.1rem', padding: '14px 28px', color: 'var(--text-muted)', cursor: 'pointer' }} 
              onClick={handleStart}
            >
              Walk the Review Room
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <input 
              type="checkbox" 
              id="demoMode" 
              checked={isDemoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              style={{ accentColor: '#EAB308', width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="demoMode" style={{ cursor: 'pointer', fontSize: '0.9rem', userSelect: 'none' }}>
              Canonical Demo Path (Skip Mbappé/De Jong)
            </label>
          </div>
        </div>
      </main>
    </div>
  );
};
