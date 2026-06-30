import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import incidentsData from '../data/incidents.json';
import { useDemo } from '../context/DemoContext';
import { AmbiguityHeatmap } from '../components/AmbiguityHeatmap';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { currentIncidentIndex, resetDemo } = useDemo();

  // Onboarding Checklist state
  const [checklist, setChecklist] = useState(() => ({
    framingTest: localStorage.getItem('checklist_framing_test') === 'true',
    knowledgeGraph: localStorage.getItem('checklist_knowledge_graph') === 'true',
    incidentReview: localStorage.getItem('checklist_incident_review') === 'true',
    governanceDiagnostics: localStorage.getItem('checklist_governance_diagnostics') === 'true'
  }));

  const toggleChecklistItem = (key: keyof typeof checklist) => {
    const newVal = !checklist[key];
    setChecklist(prev => ({ ...prev, [key]: newVal }));
    localStorage.setItem(`checklist_${key.replace(/([A-Z])/g, '_$1').toLowerCase()}`, newVal ? 'true' : 'false');
  };

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

        {/* The 'Deliberate' Clock & Copy -> Replaced with value-first hero copy */}
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
          {/* Core Demo Insight */}
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
              fontSize: '1.45rem',
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
          </div>

          <p style={{ fontSize: '1.05rem', color: '#f5f5f5', margin: '8px 0 0 0', lineHeight: 1.4, maxWidth: '680px', fontWeight: 500 }}>
            Inside the Room leverages IBM Granite to extract open-textured regulatory terms, map alternative semantic readings, and audit AI decision sensitivity automatically.
          </p>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, maxWidth: '640px' }}>
            Open-textured words are where discretion lives—and where enterprise automation fails silently. We prove and govern narrative bias to make high-stakes automated decisions auditable.
          </p>
        </div>

        {/* Explore Inside the Room Cards Grid */}
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          opacity: showCTA ? 1 : 0,
          transform: showCTA ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.8s ease 0.2s',
          marginTop: '16px',
          textAlign: 'left'
        }}>
          <h3 style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#EAB308', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 700 }}>
            🧭 Explore Inside the Room
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            width: '100%'
          }}>
            {[
              {
                id: 'framingTest',
                icon: '⚖️',
                title: '① Framing Test',
                desc: "Test how loaded vs. neutral phrasing impacts Granite's evaluation.",
                est: '2 min',
                path: '/live'
              },
              {
                id: 'knowledgeGraph',
                icon: '🕸️',
                title: '② Knowledge Graph',
                desc: 'Explore undefined terms, ambiguity hotspots and interpretation spread.',
                est: '2 min',
                path: '/heatmap'
              },
              {
                id: 'incidentReview',
                icon: '⚽',
                title: '③ Incident Review',
                desc: 'Walk through historic World Cup controversies using Granite reasoning.',
                est: '3 min',
                path: '/incident/perisic'
              },
              {
                id: 'governanceDiagnostics',
                icon: '🛡️',
                title: '④ Governance Diagnostics',
                desc: 'View the full enterprise audit trail — confidence scores, model info, compliance metadata and reproducibility.',
                est: '1 min',
                path: '/governance'
              }
            ].map(card => (
              <div 
                key={card.id}
                onClick={() => navigate(card.path)}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.4)';
                  e.currentTarget.style.background = 'rgba(234, 179, 8, 0.02)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.25rem' }}>{card.icon}</span>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                      {card.est}
                    </span>
                  </div>
                  <h4 style={{ margin: '4px 0', fontSize: '0.9rem', color: '#f5f5f5', fontWeight: 700 }}>{card.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{card.desc}</p>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#EAB308', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, marginTop: '12px' }}>
                  Launch →
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Demo Checklist */}
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          background: 'linear-gradient(180deg, rgba(234,179,8,0.02) 0%, rgba(0,0,0,0) 100%)',
          border: '1px solid rgba(234, 179, 8, 0.2)',
          borderRadius: '8px',
          padding: '20px',
          marginTop: '16px',
          opacity: showCTA ? 1 : 0,
          transform: showCTA ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.8s ease 0.25s',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '0.85rem', fontFamily: 'monospace', color: '#EAB308', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
              🏆 Judge Demo Checklist
            </h3>
            <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#10B981', background: 'rgba(16,185,129,0.08)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.2)' }}>
              Progress: {Object.values(checklist).filter(Boolean).length} / 4 Completed
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {[
              { key: 'framingTest' as const, label: 'Run a Framing Sensitivity Test', desc: 'Observe decision outcome shifts.' },
              { key: 'knowledgeGraph' as const, label: 'Audit terms in Knowledge Graph', desc: 'Inspect the interpretation spread.' },
              { key: 'incidentReview' as const, label: 'Complete an Incident Review', desc: 'Confirm human post-disclosure alignment.' },
              { key: 'governanceDiagnostics' as const, label: 'Inspect Governance Payload Logs', desc: 'Review compliance-grade trace logs.' }
            ].map(item => (
              <div 
                key={item.key}
                onClick={() => toggleChecklistItem(item.key)}
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: checklist[item.key] ? 'rgba(16,185,129,0.02)' : 'rgba(255,255,255,0.01)',
                  border: checklist[item.key] ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(255,255,255,0.03)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '3px',
                  border: checklist[item.key] ? '1.5px solid #10B981' : '1.5px solid var(--text-muted)',
                  background: checklist[item.key] ? '#10B981' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '2px',
                  flexShrink: 0,
                  fontSize: '0.65rem',
                  color: '#000',
                  fontWeight: 'bold'
                }}>
                  {checklist[item.key] ? '✓' : ''}
                </div>
                <div>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 600, 
                    color: checklist[item.key] ? 'rgba(255,255,255,0.85)' : '#f5f5f5',
                    textDecoration: checklist[item.key] ? 'line-through' : 'none',
                    transition: 'all 0.2s'
                  }}>
                    {item.label}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {item.desc}
                  </span>
                </div>
              </div>
            ))}
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
          gap: '12px',
          marginTop: '8px'
        }}>
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
            onClick={() => navigate('/live')}
            onMouseOver={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(234, 179, 8, 0.45)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(234, 179, 8, 0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Launch the Framing Sensitivity Test →
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
