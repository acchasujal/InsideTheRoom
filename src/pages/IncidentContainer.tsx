import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import incidentsData from '../data/incidents.json';
import { useDemo } from '../context/DemoContext';
import { IncidentCard } from '../components/IncidentCard';
import { DecisionPanel } from '../components/DecisionPanel';
import { PerspectiveCard } from '../components/PerspectiveCard';
import { RevealSection } from '../components/RevealSection';
import { DEFAULT_TERMS } from '../components/AmbiguityHeatmap';
import { InterpretationSpreadHero } from '../components/InterpretationSpreadHero';


type Step = 'SETUP' | 'DECISION_1' | 'PERSPECTIVES' | 'TENSION' | 'DECISION_2' | 'COMPARISON';

export const IncidentContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentIncidentIndex, nextIncident, isDemoMode, resetDemo } = useDemo();
  
  const incident = incidentsData.find(inc => inc.id === id);

  const [step, setStep] = useState<Step>('SETUP');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [decision1, setDecision1] = useState<string | null>(null);
  const [decision2, setDecision2] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStep('SETUP');
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (step !== 'SETUP') {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [step, isGenerating]);

  if (!incident) {
    return <div className="app-container"><h2>Incident not found</h2></div>;
  }

  const handleDecision1 = (decision: string) => {
    setDecision1(decision);
    setIsGenerating(true);
    setStep('PERSPECTIVES');
    
    // Simulate Granite API thinking/generation delay
    setTimeout(() => {
      setIsGenerating(false);
    }, 2500);
  };

  const handleDecision2 = (decision: string) => {
    setDecision2(decision);
    setStep('COMPARISON');
  };

  const handleNextIncident = () => {
    if (isDemoMode) {
      if (incident.id === 'perisic') {
        navigate('/incident/var_nested');
      } else if (incident.id === 'var_nested') {
        navigate('/incident/suarez');
      } else {
        resetDemo();
      }
    } else {
      nextIncident();
      const nextIndex = currentIncidentIndex + 1;
      if (nextIndex < incidentsData.length) {
        navigate(`/incident/${incidentsData[nextIndex].id}`);
      } else {
        resetDemo();
      }
    }
  };

  // Robust mapping for highlight terms since simple splitting fails on complex incidents like Suarez
  let highlightTerms: string[] = [];
  if (incident.id === 'perisic') {
    highlightTerms = ['deliberately', 'unnaturally bigger'];
  } else if (incident.id === 'var_nested') {
    highlightTerms = ['clear and obvious error'];
  } else if (incident.id === 'dejong') {
    highlightTerms = ['reckless', 'excessive force', 'serious foul play'];
  } else if (incident.id === 'mbappe') {
    highlightTerms = ['deliberately played'];
  } else if (incident.id === 'suarez') {
    highlightTerms = ['sending-off', 'penalty kick'];
  } else {
    // Fallback if needed
    highlightTerms = [incident.disputedTerm.replace(/["']/g, '').split('/')[0].trim()];
  }

  const rulebookText = incident.perspectives.find(p => p.persona === 'Rulebook')?.text || "";

  const layer1Steps = [
    "> Retrieving validated benchmark case from cache...",
    "> Loading audited perspectives (Fan, Referee, VAR)...",
    "> Finalizing local compliance payload..."
  ];

  useEffect(() => {
    if (isGenerating) {
      setGenerationLogs([]);
      let currentStep = 0;
      let timeoutId: ReturnType<typeof setTimeout>;
      
      const streamLog = () => {
        if (currentStep < layer1Steps.length) {
          setGenerationLogs(prev => [...prev, layer1Steps[currentStep]]);
          currentStep++;
          // Random jitter between 400ms and 900ms for terminal realism
          timeoutId = setTimeout(streamLog, Math.random() * 500 + 400);
        }
      };
      
      streamLog();
      return () => clearTimeout(timeoutId);
    }
  }, [isGenerating]);

  // P0 Task 3: Shift Reflection Engine
  const getCritique = () => {
    if (!decision2) return "";
    if (decision2 === "The law is ambiguous" || decision2 === "It just moves it" || decision2 === "No, Ghana was robbed") {
      return "The participant's interpretation shifted after reviewing the governing rule text. Structural ambiguity was acknowledged as a source of interpretive variance. The participant recognized that the rulebook does not resolve this incident — human judgment remains the determining factor.";
    }
    if (decision2 === "My call was correct" || decision2 === "It solves ambiguity" || decision2 === "Yes, maximum punishment given") {
      return "The participant's interpretation remained stable after reviewing the governing rule text. The original judgment was maintained despite recognizing the undefined terms in the applicable law. This pattern is consistent with high interpretive confidence in the face of documented ambiguity.";
    }
    return "The participant's interpretation was adjusted upon reviewing the rule's criteria. This indicates that transparency and structured inspection of governing text can actively reshape confidence levels when undefined terms are surfaced.";
  };

  // P0 Task 2: Shift / Divergence Detection
  const isShifted = decision2 === "The law is ambiguous" || decision2 === "It just moves it" || decision2 === "No, Ghana was robbed";

  // P0 Task 1: Audit Report Export
  const exportAuditReport = () => {
    const timestamp = new Date().toISOString();
    const markdownText = `# INSIDE THE ROOM — DECISION AUDIT REPORT
Generated: ${timestamp}
System: IBM watsonx.ai (Model: ibm/granite-13b-chat-v2)
Pillar Focus: Explainability, Transparency, Auditability

## 1. INCIDENT ANALYSIS
* **Incident Title:** ${incident.title}
* **Theme:** ${incident.theme}
* **Linguistic Tension Term:** ${incident.disputedTerm}
* **Applicable Rule:** ${incident.lawInvolved}
* **Ambiguity Rating:** ${incident.ambiguityScore}/10

## 2. GRANITE PERSPECTIVES CONSULTED
${incident.perspectives.map(p => `* **${p.persona}:** "${p.text}"`).join('\n')}

## 3. HUMAN JUDGMENT DIVERGENCE PATH
* **Initial Judgment (Decision 1):** ${decision1}
* **Reflective Judgment (Decision 2):** ${decision2}
* **Alignment Status:** ${isShifted ? "DIVERGENCE DETECTED (Ambiguity Acknowledged)" : "OPINION CONFIRMED (Intuitive Certainty)"}
* **Cognitive Shift Critique:** "${getCritique()}"

## 4. SYSTEM COMPLIANCE SIGNATURE
* **Inference Model:** ibm/granite-13b-chat-v2
* **Decoding Parameters:** greedy (reproducible)
* **Audit Signature:** watsonx-granite-v2-active-human-in-the-loop
`;

    navigator.clipboard.writeText(markdownText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="app-container" style={{ paddingBottom: '128px' }}>
      <header className="header" style={{ position: 'sticky', top: 0, background: 'var(--bg-color)', zIndex: 10, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => navigate('/')}>
            ← Home
          </button>
          <h2 style={{ margin: 0 }}>{incident.title}</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/heatmap')}
            style={{ background: 'transparent', border: '1px solid rgba(234,179,8,0.3)', color: '#EAB308', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 600 }}
          >
            ⬛ Heatmap
          </button>
          <span style={{ fontSize: '0.75rem', background: 'rgba(234, 179, 8, 0.1)', color: 'var(--accent-color)', border: '1px solid rgba(234,179,8,0.3)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold' }}>
            Ambiguity: {incident.ambiguityScore} / 10
          </span>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
            Model: ibm/granite-13b-chat-v2
          </span>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '4px 8px', borderRadius: '4px' }}>
            Transparency
          </span>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '4px 8px', borderRadius: '4px' }}>
            Auditability
          </span>
        </div>
      </header>
      
      <main className="main-content" style={{ width: '100%', maxWidth: '900px', marginTop: '20px' }}>
        
        {/* Step Progress Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '28px', width: '100%' }}>
          {[
            { label: '1. Initial Judgment', step: 'SETUP' },
            { label: '2. Granite Analysis', step: 'PERSPECTIVES' },
            { label: '3. Audit Report', step: 'COMPARISON' }
          ].map((s, i, arr) => {
            const isActive = step === s.step;
            const isPast = (
              (s.step === 'SETUP' && step !== 'SETUP') ||
              (s.step === 'PERSPECTIVES' && step === 'COMPARISON')
            );
            return (
              <React.Fragment key={s.step}>
                <div style={{
                  padding: '6px 16px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  fontWeight: isActive ? 700 : 400,
                  background: isActive ? 'rgba(234,179,8,0.12)' : 'transparent',
                  color: isActive ? '#EAB308' : isPast ? 'rgba(234,179,8,0.5)' : 'var(--text-muted)',
                  border: isActive ? '1px solid rgba(234,179,8,0.35)' : '1px solid transparent',
                  letterSpacing: '0.5px',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}>
                  {isPast ? '✓ ' : ''}{s.label}
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: '28px', height: '1px', background: isPast ? 'rgba(234,179,8,0.3)' : 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Incident Evidence Container */}
        <div style={{
          opacity: step === 'COMPARISON' ? 0.2 : 1,
          pointerEvents: step === 'COMPARISON' ? 'none' : 'auto',
          transition: 'opacity 1.5s ease',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <IncidentCard 
            title="Incident Evidence"
            mediaType="image"
            mediaUrl={`/assets/${(step === 'COMPARISON' || (step === 'PERSPECTIVES' && !isGenerating)) && (incident as any).altImageFile ? (incident as any).altImageFile : ((incident as any).imageFile || incident.id + '.png')}`}
            description={incident.summary + " " + incident.evidenceShown}
          />
        </div>

        {/* Step: Setup (Problem Judgment) */}
        {step === 'SETUP' && (
          <div className="fade-in" style={{ width: '100%', marginTop: '28px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>
                Step 1 of 3 · Human Baseline
              </span>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '520px', marginInline: 'auto', lineHeight: 1.5 }}>
                Before seeing the AI analysis, record your initial intuitive judgment below.
              </p>
            </div>
            <DecisionPanel 
              title="What is the observed judgment call?"
              options={(incident as any).decision1Options || ["Foul / Penalty / Red", "Play On / Yellow"]}
              onSelect={handleDecision1}
            />
          </div>
        )}

        {/* Step: Perspectives, Tension, Reflection (Interpretation Divergence & Interactive Framing Test) */}
        {step === 'PERSPECTIVES' && (
          <div className="fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '32px' }}>
            {isGenerating ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'monospace', margin: 0 }}>
                  Analyzing Divergence...
                </h3>
                <div className="terminal-window fade-in" style={{ margin: '0 auto', width: '100%', maxWidth: '600px' }}>
                  <div className="terminal-header"><span>Granite Inference Active</span></div>
                  <div className="terminal-body mono" style={{ color: 'var(--text-muted)' }}>
                    {generationLogs.map((log, i) => (
                      <div key={i} className="log-line">{log}</div>
                    ))}
                    <span className="cursor">_</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* 1. Interpretation Divergence */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'monospace', margin: 0, textAlign: 'left' }}>
                    Granite Generated Perspectives
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {incident.perspectives.filter(p => p.persona !== 'Rulebook').map((p, idx) => {
                      let theme: any = 'default';
                      const lower = p.persona.toLowerCase();
                      if (lower.includes('referee')) theme = 'referee';
                      if (lower.includes('fan')) theme = 'fan';
                      if (lower.includes('var')) theme = 'var';
                      
                      // Find corresponding strength
                      const termData = DEFAULT_TERMS.find(t => t.incidentId === incident.id);
                      const interp = termData?.interpretations.find(i => i.shortName.toLowerCase() === lower);
                      const strength = interp ? interp.penaltyLikelihood : undefined;

                      return (
                        <PerspectiveCard 
                          key={idx}
                          persona={p.persona}
                          text={p.text}
                          colorTheme={theme}
                          strength={strength}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* 2. Interactive Framing Test (RevealSection) */}
                <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '32px' }}>
                  <RevealSection 
                    isVisible={true}
                    lawCitation={incident.lawInvolved}
                    lawText={rulebookText}
                    highlightTerms={highlightTerms} 
                    explanation={incident.structuralTension}
                    tensionTerm={incident.tensionTerm}
                  />
                </div>

                {/* 3. Reflection Call (Decision 2) */}
                <div style={{ marginTop: '32px', width: '100%', textAlign: 'center', padding: '32px', background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '1.35rem', fontWeight: 700 }}>
                    {incident.decision2Prompt}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem', fontStyle: 'italic', lineHeight: 1.5 }}>
                    {incident.reflection}
                  </p>
                  <DecisionPanel 
                    title=""
                    options={(incident as any).decision2Options || ["My call was correct", "The law is ambiguous"]}
                    onSelect={handleDecision2}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {step === 'COMPARISON' && (() => {
          const termData = DEFAULT_TERMS.find(t => t.incidentId === incident.id);
          const spread = {
            purposive: termData?.interpretations.find(i => i.school.toLowerCase().includes('purposive'))?.penaltyLikelihood ?? 50,
            contextual: termData?.interpretations.find(i => i.school.toLowerCase().includes('contextual'))?.penaltyLikelihood ?? 50,
            procedural: termData?.interpretations.find(i => i.school.toLowerCase().includes('procedural'))?.penaltyLikelihood ?? 50,
            strict: termData?.interpretations.find(i => i.school.toLowerCase().includes('strict'))?.penaltyLikelihood ?? 50,
          };

          return (
            <div className="fade-in print-container" style={{ 
              marginTop: '24px', 
              width: '100%', 
              textAlign: 'left', 
              padding: '24px', 
              background: '#0a0a0a', 
              borderRadius: '12px', 
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)'
            }}>
              {/* Dashboard Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850, color: '#f5f5f5', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    Governance Audit Console
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    ID: {`watsonx-dec-audit-${incident.id}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }} className="no-print">
                  <button className="btn-ghost" onClick={exportAuditReport} style={{ fontSize: '0.8rem', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {copied ? "✓ Copied" : "📥 Export"}
                  </button>
                  <button className="btn-ghost" onClick={() => window.print()} style={{ fontSize: '0.8rem', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    🖨️ Print
                  </button>
                  <button className="btn-primary" onClick={handleNextIncident} style={{ fontSize: '0.8rem', padding: '6px 12px', border: '1px solid #EAB308', background: '#EAB308', color: '#000' }}>
                    Continue →
                  </button>
                </div>
              </div>

              {/* KPI Cards Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div className="glass-panel" style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '2px', borderLeft: '3px solid #10b981' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Model Status</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f5f5f5', fontFamily: 'monospace' }}>Granite 13B</span>
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '2px', borderLeft: '3px solid #EAB308' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Discretion Risk</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#EAB308', fontFamily: 'monospace' }}>{incident.ambiguityScore >= 8.5 ? 'HIGH RISK' : 'MODERATE RISK'}</span>
                </div>
                <div className="glass-panel" style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '2px', borderLeft: '3px solid #EF4444' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Human Alignment</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isShifted ? '#EAB308' : '#10B981', fontFamily: 'monospace' }}>
                    {isShifted ? '⚠️ SHIFT DETECTED' : '✓ STABLE'}
                  </span>
                </div>
                <div className="glass-panel" style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '2px', borderLeft: '3px solid #3b82f6' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Compliance Pillar</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#3b82f6', fontFamily: 'monospace' }}>EXPLAINABLE AI</span>
                </div>
              </div>

              {/* Columns Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', alignItems: 'start' }}>
                
                {/* Left Column: Spread Hero Infographic */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '1px' }}>Interpretation Spread Infographic</span>
                  <InterpretationSpreadHero
                    tensionTerm={incident.tensionTerm}
                    ambiguityScore={incident.ambiguityScore}
                    spread={spread}
                    isCorporate={false}
                  />
                </div>

                {/* Right Column: Rule Focus & Decisions Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Governing Rule context */}
                  <div style={{ background: '#121212', padding: '14px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>Policy / Rule Focus</span>
                      <span style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: '#f5f5f5' }}>{incident.title}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {incident.lawInvolved}
                    </p>
                  </div>

                  {/* Decisions timeline */}
                  <div style={{ background: '#121212', padding: '14px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>Human Decision Path</span>
                    
                    <div style={{ display: 'flex', gap: '10px', position: 'relative' }}>
                      <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', position: 'absolute', left: '7px', top: '10px', bottom: '10px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1.5px solid #666', zIndex: 1, marginTop: '2px' }} />
                          <div>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontFamily: 'monospace' }}>Initial Intuitive Judgment</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{decision1}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: 'rgba(234,179,8,0.1)', border: '1.5px solid #EAB308', zIndex: 1, marginTop: '2px' }} />
                          <div>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontFamily: 'monospace' }}>Reflective Post-Disclosure Judgment</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#EAB308' }}>{decision2}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid #EAB308', padding: '8px 10px', borderRadius: '0 4px 4px 0', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: '#EAB308', display: 'block', marginBottom: '2px', fontFamily: 'monospace' }}>Cognitive Shift Critique</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.35 }}>"{getCritique()}"</span>
                    </div>
                  </div>

                  {/* Audit Metadata details */}
                  <div style={{ background: '#121212', padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'block' }}>Execution Mode</span>
                      <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#f5f5f5' }}>Greedy / Deterministic</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'block', textAlign: 'right' }}>Governance Status</span>
                      <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#10B981' }}>✓ Human-in-the-Loop</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          );
        })()}
        <div ref={bottomRef} />
      </main>
    </div>
  );
};
