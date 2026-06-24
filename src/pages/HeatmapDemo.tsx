import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AmbiguityHeatmap, DEFAULT_TERMS } from '../components/AmbiguityHeatmap';
import type { AmbiguityTerm } from '../components/AmbiguityHeatmap';
import incidentsData from '../data/incidents.json';

type DemoPhase = 'RULE_TEXT' | 'HIGHLIGHT' | 'SPREAD' | 'DIVERGENCE';

export const HeatmapDemo: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTerm, setSelectedTerm] = useState<AmbiguityTerm>(DEFAULT_TERMS[0]);
  const [phase, setPhase] = useState<DemoPhase>('RULE_TEXT');
  const [autoPlay, setAutoPlay] = useState(false);

  // Auto-advance phases for "Show Me The Ambiguity" mode
  useEffect(() => {
    if (!autoPlay) return;
    const phases: DemoPhase[] = ['RULE_TEXT', 'HIGHLIGHT', 'SPREAD', 'DIVERGENCE'];
    const currentIdx = phases.indexOf(phase);
    if (currentIdx < phases.length - 1) {
      const t = setTimeout(() => {
        setPhase(phases[currentIdx + 1]);
      }, 1800);
      return () => clearTimeout(t);
    } else {
      setAutoPlay(false);
    }
  }, [phase, autoPlay]);

  const handleShowMe = () => {
    setPhase('RULE_TEXT');
    setAutoPlay(true);
  };

  // Find linked incident
  const linkedIncident = incidentsData.find(inc => inc.id === selectedTerm.incidentId);

  const phaseLabels: Record<DemoPhase, string> = {
    RULE_TEXT: '1. Rule Text',
    HIGHLIGHT: '2. Highlighted Word',
    SPREAD: '3. Interpretation Spread',
    DIVERGENCE: '4. Perspective Divergence'
  };

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 48px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: '#0a0a0a',
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            ← Home
          </button>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#f5f5f5' }}>
            Inside the Room
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#EAB308', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', padding: '3px 8px', borderRadius: '3px' }}>
            AMBIGUITY HEATMAP
          </span>
          <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            ibm/granite-13b-chat-v2
          </span>
        </div>
      </header>

      <main style={{ flex: 1, padding: '40px 48px', maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Hero Block */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', paddingBottom: '8px' }}>
          <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            H.L.A. Hart's Open-Texture Problem — Interactive Instrument
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f5f5f5', margin: 0, lineHeight: 1.2 }}>
            The disagreement originates from <span style={{ color: '#EAB308', fontFamily: 'monospace' }}>one word.</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0, maxWidth: '560px', lineHeight: 1.6 }}>
            Every rulebook contains words it never defines. Select any term below to see where the law stops being a rule and starts being someone's judgment call.
          </p>

          {/* Show Me The Ambiguity CTA */}
          <button
            onClick={handleShowMe}
            style={{
              marginTop: '8px',
              padding: '14px 32px',
              fontSize: '1.1rem',
              fontWeight: 700,
              background: 'transparent',
              border: '2px solid #EAB308',
              color: '#EAB308',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(234,179,8,0.15)',
              letterSpacing: '0.5px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(234,179,8,0.07)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            Show Me The Ambiguity →
          </button>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No incident walkthrough required.
          </span>
        </div>

        {/* Phase Indicator — only visible during auto-play */}
        {autoPlay && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px',
            padding: '6px',
            width: 'fit-content',
            alignSelf: 'center'
          }}>
            {(Object.entries(phaseLabels) as [DemoPhase, string][]).map(([key, label]) => {
              const phases: DemoPhase[] = ['RULE_TEXT', 'HIGHLIGHT', 'SPREAD', 'DIVERGENCE'];
              const isActive = phase === key;
              const isPast = phases.indexOf(key) < phases.indexOf(phase);
              return (
                <div key={key} style={{
                  padding: '6px 16px',
                  borderRadius: '5px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  fontWeight: isActive ? 700 : 400,
                  background: isActive ? '#EAB308' : 'transparent',
                  color: isActive ? '#000' : isPast ? '#EAB308' : 'var(--text-muted)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => { setAutoPlay(false); setPhase(key); }}
                >
                  {isPast ? '✓ ' : ''}{label}
                </div>
              );
            })}
          </div>
        )}

        {/* Main Heatmap */}
        <div style={{ width: '100%' }}>
          <AmbiguityHeatmap
            terms={DEFAULT_TERMS}
            activeTermId={selectedTerm.incidentId}
            mode="full"
            onTermSelect={(term) => {
              setSelectedTerm(term);
              setAutoPlay(false);
              setPhase('DIVERGENCE');
            }}
          />
        </div>

        {/* Linked Incident CTA */}
        {linkedIncident && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px',
            padding: '20px 28px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>VALIDATED BENCHMARK CASE</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f5f5f5' }}>{linkedIncident.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>{linkedIncident.summary}</div>
            </div>
            <button
              onClick={() => navigate(`/incident/${linkedIncident.id}`)}
              style={{
                padding: '10px 24px',
                background: 'transparent',
                border: '1px solid rgba(234,179,8,0.4)',
                color: '#EAB308',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontWeight: 600,
                fontFamily: 'monospace',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(234,179,8,0.06)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              Walk This Incident →
            </button>
          </div>
        )}

        {/* Closing thesis */}
        <div style={{
          textAlign: 'center',
          padding: '24px 0 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center'
        }}>
          <p style={{ fontSize: '1rem', color: '#EAB308', fontWeight: 700, margin: 0, fontFamily: 'monospace' }}>
            "We don't use AI to decide; we use Watsonx to audit the rules."
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/live?mode=sensitivity')}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(234,179,8,0.4)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            >
              Run Framing Sensitivity Test →
            </button>
            <button
              onClick={() => navigate('/incident/perisic')}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(234,179,8,0.4)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            >
              Walk the Review Room →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
