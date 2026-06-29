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
  const [showBody, setShowBody] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    // Word-by-word typewriter
    if (visibleWordsCount < words.length) {
      const timer = setTimeout(() => {
        setVisibleWordsCount(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Stagger other sections
      const t2 = setTimeout(() => setShowBody(true), 600);
      const t3 = setTimeout(() => setShowCTA(true), 1200);
      return () => {
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [visibleWordsCount, words.length]);

  const handleStart = () => {
    if (currentIncidentIndex !== 0) {
      resetDemo();
    } else {
      const firstIncident = incidentsData[0];
      navigate(`/incident/${firstIncident.id}`);
    }
  };


  return (
    <div className="app-container fade-in" style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 var(--space-4) var(--space-8)' }}>
      <main className="main-content" style={{ alignSelf: 'center', maxWidth: '1280px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', width: '100%', marginTop: '24px' }}>
        
        {/* Headline Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', textAlign: 'center' }}>

          {/* Governance category pill */}
          <div style={{
            opacity: showBody ? 1 : 0,
            transition: 'opacity 0.5s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#10B981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: '3px 10px', borderRadius: '20px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700 }}>
              IBM watsonx.governance · Discretion Disclosure
            </span>
          </div>

          <h1 style={{ fontSize: '2.6rem', lineHeight: '1.18', fontWeight: 800, textAlign: 'center', color: '#f5f5f5', margin: 0, minHeight: '3.2rem' }}>
            {words.slice(0, visibleWordsCount).join(' ')}
          </h1>
          
          {/* Accent Chips */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            opacity: showBody ? 1 : 0,
            transform: showBody ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.5s ease',
          }}>
            {["deliberate", "reasonable", "reckless", "clear and obvious"].map((word) => (
              <span key={word} style={{
                background: 'rgba(234, 179, 8, 0.08)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
                color: '#EAB308',
                padding: '4px 10px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                letterSpacing: '0.5px',
                fontStyle: 'italic'
              }}>
                "{word}"
              </span>
            ))}
          </div>
        </div>

        {/* The 'Deliberate' Clock & Copy */}
        <div style={{
          opacity: showBody ? 1 : 0,
          transform: showBody ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.8s ease 0.1s',
          textAlign: 'center',
          maxWidth: '800px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <p style={{ fontSize: '1.08rem', color: '#f5f5f5', margin: 0, lineHeight: 1.4, maxWidth: '640px' }}>
            Those undefined words are where discretion lives — and where AI systems fail silently.
          </p>
          <div style={{ 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            borderRadius: '6px', 
            padding: '8px 16px',
            display: 'inline-block',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
              FIFA Law 12 Discretion Metric
            </span>
            <span style={{ fontSize: '1.15rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#ef4444', display: 'block' }}>
              Undefined since 1938 (87 years)
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
              since FIFA introduced the word "deliberate" without a formal definition.
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, maxWidth: '700px' }}>
            Inside the Room uses IBM Granite to find these linguistic tension points, map every legitimate reading, and document exactly where your regulations stop being rules and start being opinion.
          </p>
        </div>

        {/* Subtle Onboarding Tracker */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          width: '100%',
          maxWidth: '1000px',
          textAlign: 'left',
          background: 'rgba(255, 255, 255, 0.01)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          padding: '16px',
          opacity: showCTA ? 1 : 0,
          transform: showCTA ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.8s ease 0.2s',
          marginTop: '4px'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 'bold',
              color: '#EAB308',
              background: 'rgba(234, 179, 8, 0.1)',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              flexShrink: 0
            }}>1</div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.82rem', fontWeight: 700, color: '#f5f5f5', letterSpacing: '0.5px' }}>① Framing Test</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.35' }}>
                Test how loaded vs. neutral phrasing impacts Granite's evaluation.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', borderLeft: '1px solid rgba(255, 255, 255, 0.06)', paddingLeft: '16px' }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 'bold',
              color: '#EAB308',
              background: 'rgba(234, 179, 8, 0.1)',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              flexShrink: 0
            }}>2</div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.82rem', fontWeight: 700, color: '#f5f5f5', letterSpacing: '0.5px' }}>② Incident Review</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.35' }}>
                Audit four diverse semantic readings (Fan, Referee, VAR, Rulebook).
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', borderLeft: '1px solid rgba(255, 255, 255, 0.06)', paddingLeft: '16px' }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 'bold',
              color: '#EAB308',
              background: 'rgba(234, 179, 8, 0.1)',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              flexShrink: 0
            }}>3</div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.82rem', fontWeight: 700, color: '#f5f5f5', letterSpacing: '0.5px' }}>③ Governance Report</h4>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.35' }}>
                Analyze compliance-grade system logs, response schema, and latency.
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div style={{
          opacity: showCTA ? 1 : 0,
          transform: showCTA ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.8s ease 0.3s',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          {/* HERO STATEMENT — the core demo insight */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(234,179,8,0.06) 0%, rgba(239,68,68,0.04) 100%)',
            border: '1px solid rgba(234,179,8,0.2)',
            borderRadius: '10px',
            padding: '18px 28px',
            textAlign: 'center',
            maxWidth: '680px',
            width: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #EAB308 0%, #ef4444 100%)' }} />
            <p style={{
              margin: 0,
              fontSize: '1.35rem',
              fontWeight: 800,
              color: '#f5f5f5',
              lineHeight: 1.35,
              letterSpacing: '-0.01em'
            }}>
              Same replay.{' '}
              <span style={{ color: '#EAB308' }}>Same rule.</span>{' '}
              Different words.{' '}
              <span style={{ color: '#ef4444' }}>Different verdict.</span>
            </p>
            <p style={{ margin: '10px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              The Framing Sensitivity Test proves that AI governance decisions shift based on <em>how</em> the incident is described — not just <em>what</em> happened.
            </p>
          </div>

          {/* Primary CTA: Framing Sensitivity Test */}
          <button 
            className="btn-primary" 
            style={{ 
              fontSize: '1.1rem', 
              padding: '14px 40px', 
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
            onClick={() => navigate('/live?mode=sensitivity')}
            onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(234, 179, 8, 0.45)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(234, 179, 8, 0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Run the Framing Sensitivity Test →
          </button>

          {/* Secondary CTA: Walk the Review Room */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
            <button
              style={{
                fontSize: '0.85rem',
                padding: '8px 20px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderRadius: '5px'
              }}
              onClick={handleStart}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#EAB308'; e.currentTarget.style.color = '#EAB308'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            >
              Walk the Review Room
            </button>
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
