import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import incidentsData from '../data/incidents.json';
import { useDemo } from '../context/DemoContext';
import { AmbiguityHeatmap } from '../components/AmbiguityHeatmap';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentIncidentIndex, resetDemo } = useDemo();

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
    <div className="app-container fade-in" style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: 'var(--space-4) var(--space-4) var(--space-12)' }}>
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 0', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Inside the Room</h2>
          <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', background: 'rgba(234,179,8,0.08)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.2)', padding: '2px 8px', borderRadius: '3px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>IBM SkillsBuild 2025</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ibm/granite-13b-chat-v2</span>
      </header>
      
      <main className="main-content" style={{ alignSelf: 'center', maxWidth: '850px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', width: '100%', marginTop: '2vh' }}>
        
        {/* Headline Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
          <h1 style={{ fontSize: '3rem', lineHeight: '1.15', fontWeight: 800, textAlign: 'center', color: '#f5f5f5', margin: 0, minHeight: '4rem' }}>
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
        </div>

        {/* Real Ambiguity Heatmap (Hero Centerpiece) */}
        <div style={{
          opacity: showBody ? 1 : 0,
          transform: showBody ? 'translateY(0)' : 'translateY(15px)',
          transition: 'all 0.8s ease',
          width: '100%',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          borderRadius: '12px',
          padding: '4px',
          background: 'linear-gradient(180deg, rgba(234,179,8,0.02) 0%, rgba(0,0,0,0) 100%)',
          boxShadow: '0 0 60px rgba(234, 179, 8, 0.06), 0 0 0 1px rgba(234,179,8,0.05) inset'
        }}>
          <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Interpretation Spread Analyzer
              </span>
              <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#EAB308', fontWeight: 700, letterSpacing: '0.3px' }}>
                5 Undefined Terms · 5 Benchmark Incidents
              </span>
            </div>
            <button
              onClick={() => navigate('/heatmap')}
              style={{ background: 'transparent', border: '1px solid rgba(234,179,8,0.4)', color: '#EAB308', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.3px', transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(234,179,8,0.06)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              Open Full Analyzer →
            </button>
          </div>
          <AmbiguityHeatmap mode="full" />
        </div>

        {/* Short Explanation Block */}
        <div style={{
          opacity: showBody ? 1 : 0,
          transform: showBody ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.6s ease',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <p style={{ fontSize: '1.35rem', color: '#EAB308', fontWeight: 600, margin: 0, lineHeight: '1.4' }}>
            Where rules stop, human discretion begins.
          </p>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6', maxWidth: '580px' }}>
            IBM Granite surfaces undefined terms, maps four legitimate reading schools, and generates a transparent audit trail — so you can see exactly where law ends and judgment begins.
          </p>
        </div>

        {/* Structured Metric Group (The "Deliberate" Clock) */}
        <div style={{
          opacity: showBody ? 1 : 0,
          transform: showBody ? 'translateY(0)' : 'translateY(15px)',
          transition: 'all 0.8s ease',
          width: '100%',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '8px',
          padding: '20px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          alignItems: 'center',
          textAlign: 'left'
        }}>
          <div>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>
              REGULATORY CHRONOLOGY
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#EAB308', display: 'block' }}>
              FIFA Law 12: "Deliberate"
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px', lineHeight: 1.4 }}>
              Statutory standard remained undefined since modern laws consolidated.
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>
              ELAPSED DURATION (SINCE JUNE 1, 1938)
            </span>
            <div style={{ fontFamily: 'monospace', fontSize: '1.35rem', color: '#EAB308', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              {clockTime.years}y {clockTime.days}d {clockTime.hours.toString().padStart(2, '0')}h {clockTime.minutes.toString().padStart(2, '0')}m
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
              Accumulated ambiguity duration without definition
            </span>
          </div>
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
          gap: '24px'
        }}>
          {/* Primary CTA */}
          <button 
            className="btn-primary" 
            style={{ 
              fontSize: '1.15rem', 
              padding: '14px 36px', 
              border: '2px solid #EAB308', 
              background: '#EAB308', 
              color: '#000', 
              boxShadow: '0 0 24px rgba(234, 179, 8, 0.25)',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.5px',
              borderRadius: '6px'
            }} 
            onClick={handleStart}
            onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(234, 179, 8, 0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(234, 179, 8, 0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Enter the Review Room →
          </button>

          {/* Secondary CTAs */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
            <button
              style={{
                fontSize: '0.9rem',
                padding: '9px 20px',
                border: '1px solid rgba(234,179,8,0.35)',
                background: 'transparent',
                color: '#EAB308',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderRadius: '5px'
              }}
              onClick={() => navigate('/heatmap')}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(234,179,8,0.06)'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              Explore Ambiguity Map
            </button>

            <button
              style={{
                fontSize: '0.9rem',
                padding: '9px 20px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderRadius: '5px'
              }}
              onClick={() => navigate('/live?mode=sensitivity')}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(234,179,8,0.3)'; e.currentTarget.style.color = '#EAB308'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              Framing Sensitivity Test
            </button>
          </div>

        </div>

        {/* Interactive Demo Selector Grid */}
        <div style={{
          opacity: showCTA ? 1 : 0,
          transform: showCTA ? 'translateY(0)' : 'translateY(15px)',
          transition: 'all 0.8s ease',
          width: '100%',
          marginTop: '8px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '32px'
        }}>
          <h3 style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center' }}>
            Interactive Demo · Select Benchmark Case
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {incidentsData.map((inc) => (
              <div
                key={inc.id}
                onClick={() => navigate(`/incident/${inc.id}`)}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '6px',
                  padding: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  textAlign: 'left'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = 'rgba(234,179,8,0.4)';
                  e.currentTarget.style.background = 'rgba(234,179,8,0.02)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#EAB308', background: 'rgba(234,179,8,0.08)', padding: '2px 6px', borderRadius: '3px', border: '1px solid rgba(234,179,8,0.2)' }}>
                    {inc.theme.split('/')[0].trim()}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    Ambiguity: {inc.ambiguityScore}
                  </span>
                </div>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '0.95rem', fontWeight: 700, color: '#f5f5f5' }}>{inc.title}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {inc.summary.length > 80 ? inc.summary.slice(0, 80) + "..." : inc.summary}
                </p>
                <span style={{ fontSize: '0.75rem', color: '#EAB308', fontFamily: 'monospace', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  Launch Audit →
                </span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};
