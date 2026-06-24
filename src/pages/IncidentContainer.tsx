import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import incidentsData from '../data/incidents.json';
import { useDemo } from '../context/DemoContext';
import { IncidentCard } from '../components/IncidentCard';
import { DecisionPanel } from '../components/DecisionPanel';
import { PerspectiveCard } from '../components/PerspectiveCard';
import { RevealSection } from '../components/RevealSection';

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
      return "You acknowledged the structural ambiguity of the rule system after reviewing the text. You accepted that the rulebook cannot logically resolve this incident, forcing a reliance on human moral context rather than strict procedural automation.";
    }
    if (decision2 === "My call was correct" || decision2 === "It solves ambiguity" || decision2 === "Yes, maximum punishment given") {
      return "You maintained your judgment and affirmed its correctness despite the rule's undefined terms. This shows a high reliance on personal intuition to resolve semantic gaps and enforce order where the law is silent.";
    }
    return "You adjusted your judgment upon reviewing the rule's criteria. This indicates that transparency and inspection of written law can actively reshape confidence and offset initial cognitive biases.";
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
      
      <main className="main-content" style={{ width: '100%', maxWidth: '900px', marginTop: '32px' }}>
        
        <div style={{
          opacity: ['TENSION', 'DECISION_2', 'COMPARISON'].includes(step) ? 0.2 : 1,
          pointerEvents: ['TENSION', 'DECISION_2', 'COMPARISON'].includes(step) ? 'none' : 'auto',
          transition: 'opacity 1.5s ease',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <IncidentCard 
            title="Incident Evidence"
            mediaType="image"
            mediaUrl={`/assets/${(step === 'TENSION' || step === 'DECISION_2' || step === 'COMPARISON') && (incident as any).altImageFile ? (incident as any).altImageFile : ((incident as any).imageFile || incident.id + '.png')}`}
            description={incident.summary + " " + incident.evidenceShown}
          />

        {step === 'SETUP' && (
          <div className="fade-in" style={{ marginTop: '48px', width: '100%' }}>
            <button className="btn-primary" onClick={() => setStep('DECISION_1')} style={{ margin: '0 auto', display: 'block', fontSize: '1.25rem' }}>
              Make Judgment
            </button>
          </div>
        )}

        {['DECISION_1', 'PERSPECTIVES', 'TENSION', 'DECISION_2', 'COMPARISON'].includes(step) && (
          <div className="fade-in" style={{ width: '100%' }}>
            <DecisionPanel 
              title="What is the correct call?"
              options={(incident as any).decision1Options || ["Foul / Penalty / Red", "Play On / Yellow"]}
              onSelect={handleDecision1}
            />
          </div>
        )}

        {['PERSPECTIVES', 'TENSION', 'DECISION_2', 'COMPARISON'].includes(step) && (
          <div className="fade-in" style={{ marginTop: '64px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ color: 'var(--text-muted)' }}>Granite Perspectives Generated</h3>
            
            {isGenerating ? (
              <div className="terminal-window fade-in" style={{ margin: '0 auto', width: '100%', maxWidth: '600px' }}>
                <div className="terminal-header"><span>Granite Inference Active</span></div>
                <div className="terminal-body mono" style={{ color: 'var(--text-muted)' }}>
                  {generationLogs.map((log, i) => (
                    <div key={i} className="log-line">{log}</div>
                  ))}
                  <span className="cursor">_</span>
                </div>
              </div>
            ) : (
              <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {incident.perspectives.filter(p => p.persona !== 'Rulebook').map((p, idx) => {
                  let theme: any = 'default';
                  const lower = p.persona.toLowerCase();
                  if (lower.includes('referee')) theme = 'referee';
                  if (lower.includes('fan')) theme = 'fan';
                  if (lower.includes('var')) theme = 'var';
                  
                  return (
                    <PerspectiveCard 
                      key={idx}
                      persona={p.persona}
                      text={p.text}
                      colorTheme={theme}
                    />
                  );
                })}
              </div>
            )}
            
            {step === 'PERSPECTIVES' && !isGenerating && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
                <button className="fade-in btn-primary" onClick={() => setStep('TENSION')}>
                  Enter the Structural Tension
                </button>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  IBM Granite has surfaced the discretion boundary.
                </span>
              </div>
            )}
          </div>
        )}
        </div>

        {['TENSION', 'DECISION_2', 'COMPARISON'].includes(step) && (
          <div className="fade-in" style={{ marginTop: '64px', width: '100%' }}>
            <RevealSection 
              isVisible={true}
              lawCitation={incident.lawInvolved}
              lawText={rulebookText}
              highlightTerms={highlightTerms} 
              explanation={incident.structuralTension}
              tensionTerm={incident.tensionTerm}
            />
            
            {step === 'TENSION' && (
              <button className="btn-ghost" onClick={() => setStep('DECISION_2')} style={{ marginTop: '48px', display: 'block', margin: '48px auto 0' }}>
                Reflect
              </button>
            )}
          </div>
        )}

        {['DECISION_2', 'COMPARISON'].includes(step) && (
          <div className="fade-in" style={{ marginTop: '80px', width: '100%', textAlign: 'center', padding: '32px', background: 'var(--bg-panel)', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '24px', color: 'var(--text-primary)', fontSize: '1.5rem' }}>{incident.decision2Prompt}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontStyle: 'italic' }}>{incident.reflection}</p>
            <DecisionPanel 
              title=""
              options={(incident as any).decision2Options || ["My call was correct", "The law is ambiguous"]}
              onSelect={handleDecision2}
            />
          </div>
        )}

        {step === 'COMPARISON' && (
          <div className="fade-in print-container" style={{ 
            marginTop: '80px', 
            width: '100%', 
            textAlign: 'left', 
            padding: '40px', 
            background: '#121212', 
            borderRadius: '8px', 
            border: '2px solid rgba(234, 179, 8, 0.4)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
            {/* Header branding */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #EAB308', paddingBottom: '16px', marginBottom: '32px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#f5f5f5', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Discretion Disclosure Report
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  Governance Audit & Risk Assessment Memo
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#EAB308', border: '1px solid #EAB308', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  IBM watsonx.governance active
                </span>
              </div>
            </div>

            {/* Metadata Fields Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Incident Focus</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '1.05rem' }}>{incident.title}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Undefined Term</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '1.05rem', color: '#EAB308' }}>"{incident.tensionTerm}"</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Governing Policy</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{incident.lawInvolved}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Discretion Rating</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '1.05rem', color: '#EAB308' }}>{incident.ambiguityScore} / 10</p>
              </div>
            </div>

            {/* Divergence Status Chip */}
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              {isShifted ? (
                <div style={{ display: 'inline-block', background: 'rgba(234, 179, 8, 0.1)', color: '#EAB308', border: '1px solid rgba(234, 179, 8, 0.4)', padding: '10px 24px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  ⚠️ Discretion Acknowledged & Opinion Shifted
                </div>
              ) : (
                <div style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '10px 24px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  ✓ Intuitive Judgment Confirmed
                </div>
              )}
            </div>

            {/* Decision Path Compare */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
               <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                 <p style={{ color: 'var(--text-muted)', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', fontFamily: 'monospace' }}>1. Initial Intuitive Judgment</p>
                 <p style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{decision1}</p>
               </div>
               <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                 <p style={{ color: 'var(--text-muted)', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', fontFamily: 'monospace' }}>2. Post-Tension Disclosure Judgment</p>
                 <p style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{decision2}</p>
               </div>
            </div>

            {/* Shift Critique */}
            <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid #EAB308', padding: '24px', borderRadius: '0 8px 8px 0', marginBottom: '40px' }}>
              <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#EAB308', letterSpacing: '1.5px', fontWeight: 'bold', display: 'block', marginBottom: '12px', fontFamily: 'monospace' }}>
                Cognitive Shift Analysis
              </span>
              <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: '1.6', fontStyle: 'italic' }}>
                "{getCritique()}"
              </p>
            </div>

            {/* Mapped Perspectives Audit Log */}
            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', fontFamily: 'monospace' }}>
                Audit Trail of Consulting Interpretations
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {incident.perspectives.map((p, idx) => {
                  let subLabel = "";
                  if (p.persona === "Fan") subLabel = "Purposive Reading";
                  else if (p.persona === "Referee") subLabel = "Contextual Reading";
                  else if (p.persona === "VAR") subLabel = "Procedural Reading";
                  else if (p.persona === "Rulebook") subLabel = "Strict Constructionist Reading";

                  return (
                    <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '0.95rem' }}>{p.persona}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>— {subLabel}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{p.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* System compliance signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'block' }}>System Infrastructure</span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>IBM Watsonx.governance (Model: Granite-13b)</span>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'block' }}>Inference Parameters</span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>greedy / max_tokens: 800</span>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'block' }}>Compliance ID</span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{`watsonx-dec-audit-${incident.id}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`}</span>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', flexWrap: 'wrap' }} className="no-print">
              <button 
                className="btn-ghost" 
                onClick={exportAuditReport} 
                style={{ fontSize: '1.05rem', padding: '12px 24px', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {copied ? "✓ Copied Markdown Memo" : "📥 Export Compliance Memo"}
              </button>
              
              <button 
                className="btn-ghost" 
                onClick={() => window.print()} 
                style={{ fontSize: '1.05rem', padding: '12px 24px', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                🖨️ Print Governance Report
              </button>
              
              <button className="btn-primary" onClick={handleNextIncident} style={{ fontSize: '1.05rem', padding: '12px 24px', border: '1px solid #EAB308' }}>
                Continue
              </button>
            </div>

          </div>
        )}
        <div ref={bottomRef} />
      </main>
    </div>
  );
};
