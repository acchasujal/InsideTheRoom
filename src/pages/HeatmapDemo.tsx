import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AmbiguityHeatmap, DEFAULT_TERMS } from '../components/AmbiguityHeatmap';
import type { AmbiguityTerm } from '../components/AmbiguityHeatmap';
import incidentsData from '../data/incidents.json';

type DemoPhase = 'RULE_TEXT' | 'HIGHLIGHT' | 'SPREAD' | 'DIVERGENCE';

// Governance metadata enrichment for each term
const GOVERNANCE_METADATA: Record<string, {
  definitionStatus: string;
  occurrences: number;
  affectedIncidents: string[];
  governanceRisk: 'Critical' | 'High' | 'Medium';
  riskColor: string;
  relatedTerms: string[];
  notes: string;
}> = {
  deliberately: {
    definitionStatus: 'Undefined — no statutory definition in FIFA Laws of the Game',
    occurrences: 23,
    affectedIncidents: ['Perišić v. Croatia (2018)', 'Mbappé Offside (2022)', 'Multiple UCL handball reviews'],
    governanceRisk: 'Critical',
    riskColor: '#ef4444',
    relatedTerms: ['intentional', 'deliberate act', 'voluntarily', 'purposely'],
    notes: 'The term appears in both Law 11 (Offside) and Law 12 (Handball) without definition in either context. Each instance requires independent discretionary interpretation.',
  },
  'clear and obvious error': {
    definitionStatus: 'Undefined — VAR protocol uses term as intervention threshold without measurement criteria',
    occurrences: 47,
    affectedIncidents: ['VAR Protocol Review (2023)', 'Multiple Premier League VAR controversies', 'FIFA World Cup 2022 reviews'],
    governanceRisk: 'Critical',
    riskColor: '#ef4444',
    relatedTerms: ['obvious mistake', 'factual error', 'clear error', 'missed incident'],
    notes: 'The dual-adjective requirement ("clear" AND "obvious") creates a compound ambiguity — both terms are undefined, and their conjunction is undefined as well.',
  },
  'serious foul play / reckless': {
    definitionStatus: 'Partially defined — Law 12 distinguishes reckless from excessive force but provides no measurable threshold',
    occurrences: 31,
    affectedIncidents: ['De Jong Chest Kick (2022)', 'Multiple red card boundary disputes'],
    governanceRisk: 'High',
    riskColor: '#f97316',
    relatedTerms: ['excessive force', 'brutality', 'endangers safety', 'reckless challenge'],
    notes: 'The boundary between reckless (yellow) and excessive force (red) is the most commonly disputed threshold in professional football governance.',
  },
  'deliberately played': {
    definitionStatus: 'Undefined — Law 11 exception for "deliberately played by an opponent" lacks definition',
    occurrences: 18,
    affectedIncidents: ['Mbappé Offside (2022)', 'Multiple offside line reviews'],
    governanceRisk: 'High',
    riskColor: '#f97316',
    relatedTerms: ['deliberate save', 'involuntary deflection', 'reaction play', 'deliberately touched'],
    notes: 'The distinction between a deliberate play and an involuntary deflection is the most common VAR dispute in offside adjudication.',
  },
  'procedural vs substantive justice': {
    definitionStatus: 'Not defined — concept absent from FIFA Laws; doctrine imported from jurisprudence',
    occurrences: 5,
    affectedIncidents: ['Suárez Handball (2010)', 'Goal-line technology incidents'],
    governanceRisk: 'Medium',
    riskColor: '#eab308',
    relatedTerms: ['maximum sanction', 'proportional remedy', 'unjust enrichment', 'sporting equity'],
    notes: 'The rulebook prescribes a specific sanction but is silent on whether the outcome constitutes just resolution. This exposes a structural gap between procedural compliance and substantive fairness.',
  },
};

export const HeatmapDemo: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTerm, setSelectedTerm] = useState<AmbiguityTerm>(DEFAULT_TERMS[0]);
  const [phase, setPhase] = useState<DemoPhase>('RULE_TEXT');
  const [autoPlay, setAutoPlay] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTerm, setDrawerTerm] = useState<AmbiguityTerm | null>(null);

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

  // Close drawer on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleShowMe = () => {
    setPhase('RULE_TEXT');
    setAutoPlay(true);
  };

  const openDrawer = (term: AmbiguityTerm) => {
    setDrawerTerm(term);
    setDrawerOpen(true);
  };

  // Find linked incident
  const linkedIncident = incidentsData.find(inc => inc.id === selectedTerm.incidentId);

  const phaseLabels: Record<DemoPhase, string> = {
    RULE_TEXT: '1. Rule Text',
    HIGHLIGHT: '2. Highlighted Word',
    SPREAD: '3. Interpretation Spread',
    DIVERGENCE: '4. Perspective Divergence'
  };

  const govMeta = drawerTerm ? (GOVERNANCE_METADATA[drawerTerm.term] || null) : null;

  const getHeatColor = (score: number) => {
    if (score >= 9) return '#ef4444';
    if (score >= 8) return '#f97316';
    if (score >= 7) return '#eab308';
    return '#10b981';
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
            H.L.A. Hart's Open-Texture Problem — Interactive Governance Instrument
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f5f5f5', margin: 0, lineHeight: 1.2 }}>
            The disagreement originates from <span style={{ color: '#EAB308', fontFamily: 'monospace' }}>one word.</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', margin: 0, maxWidth: '580px', lineHeight: 1.7 }}>
            AI reveals where interpretation diverges. Human judgment remains essential.
            Select any undefined term below to inspect its governance risk profile.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
            {/* Show Me The Ambiguity CTA */}
            <button
              onClick={handleShowMe}
              style={{
                padding: '12px 28px',
                fontSize: '1rem',
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
              Explore Ambiguity Map →
            </button>
            <button
              onClick={() => openDrawer(selectedTerm)}
              style={{
                padding: '12px 28px',
                fontSize: '1rem',
                fontWeight: 700,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text-muted)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(234,179,8,0.4)'; e.currentTarget.style.color = '#EAB308'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              Inspect Term Knowledge Graph →
            </button>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Click any term in the index to inspect its governance risk profile.
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
              openDrawer(term);
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
            "We don't use AI to decide; we use Granite to audit where the rules stop being rules."
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
              Enter the Review Room →
            </button>
          </div>
        </div>
      </main>

      {/* ── GOVERNANCE KNOWLEDGE GRAPH DRAWER ──────────────────────────── */}
      {/* Backdrop */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 49, backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
            transition: 'opacity 0.3s ease',
            cursor: 'pointer'
          }}
        />
      )}

      {/* Drawer Panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: drawerOpen ? 0 : '-560px',
        width: '560px',
        maxWidth: '95vw',
        height: '100vh',
        background: '#0d0d0d',
        borderLeft: '1px solid rgba(234,179,8,0.2)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        transition: 'right 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowY: 'auto',
        boxShadow: '-16px 0 48px rgba(0,0,0,0.8)'
      }}>
        {drawerTerm && govMeta && (
          <>
            {/* Drawer Header */}
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#111', position: 'sticky', top: 0, zIndex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Governance Knowledge Graph · Undefined Term
                  </div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', color: getHeatColor(drawerTerm.score) }}>
                    "{drawerTerm.term}"
                  </h2>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '3px', border: `1px solid ${getHeatColor(drawerTerm.score)}`, color: getHeatColor(drawerTerm.score) }}>
                      Ambiguity {drawerTerm.score}/10
                    </span>
                    <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '3px', border: `1px solid ${govMeta.riskColor}`, color: govMeta.riskColor, fontWeight: 700 }}>
                      {govMeta.governanceRisk} Risk
                    </span>
                    <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                      {drawerTerm.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.4rem', padding: '4px 8px', borderRadius: '4px' }}
                  aria-label="Close drawer"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Definition Status */}
              <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '14px 18px' }}>
                <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Definition Status</div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#f5f5f5', lineHeight: 1.55 }}>{govMeta.definitionStatus}</p>
              </div>

              {/* Occurrences + Incidents */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Occurrences</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'monospace', color: '#EAB308' }}>{govMeta.occurrences}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>professional match reviews</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Governance Risk</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace', color: govMeta.riskColor }}>{govMeta.governanceRisk}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>undefined term classification</div>
                </div>
              </div>

              {/* Rule Text */}
              <div>
                <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Rule Text</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.88rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '5px', padding: '14px 16px', color: '#e5e5e5', lineHeight: 1.65 }}>
                  {drawerTerm.ruleText}
                </div>
              </div>

              {/* Affected Incidents */}
              <div>
                <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Affected Incidents</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {govMeta.affectedIncidents.map((inc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#d4d4d4' }}>
                      <span style={{ color: '#EAB308', fontFamily: 'monospace', fontSize: '0.7rem' }}>▸</span>
                      {inc}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reading Schools + Confidence Distribution */}
              <div>
                <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>Reading Schools · Confidence Distribution</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {drawerTerm.interpretations.map((interp, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${interp.color}22`, borderRadius: '6px', padding: '12px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: interp.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {interp.school} ({interp.shortName})
                        </span>
                        <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700, color: interp.color }}>{interp.penaltyLikelihood}%</span>
                      </div>
                      {/* Mini confidence bar */}
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '8px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${interp.penaltyLikelihood}%`, background: interp.color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{interp.reading}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Terms */}
              <div>
                <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Related Terms</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {govMeta.relatedTerms.map((rt, i) => (
                    <span key={i} style={{ fontSize: '0.75rem', fontFamily: 'monospace', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)', color: '#EAB308', padding: '3px 10px', borderRadius: '4px', fontStyle: 'italic' }}>
                      "{rt}"
                    </span>
                  ))}
                </div>
              </div>

              {/* Governance Notes */}
              <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid #EAB308', padding: '14px 18px', borderRadius: '0 6px 6px 0' }}>
                <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#EAB308', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Governance Notes</div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{govMeta.notes}</p>
              </div>

              {/* Responsible AI footer */}
              <div style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-muted)', opacity: 0.6, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', fontStyle: 'italic' }}>
                This profile assists human governance review. It does not constitute legal advice or an authoritative ruling.
              </div>

              {/* CTA to incident */}
              {(() => {
                const linked = incidentsData.find(inc => inc.id === drawerTerm.incidentId);
                return linked ? (
                  <button
                    onClick={() => { setDrawerOpen(false); navigate(`/incident/${linked.id}`); }}
                    style={{
                      padding: '12px 20px',
                      background: 'transparent',
                      border: '1px solid rgba(234,179,8,0.4)',
                      color: '#EAB308',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      marginTop: '4px'
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(234,179,8,0.06)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    Walk the "{drawerTerm.term}" Incident →
                  </button>
                ) : null;
              })()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
