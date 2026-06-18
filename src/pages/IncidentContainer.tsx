import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import incidentsData from '../data/incidents.json';
import { useDemo } from '../context/DemoContext';
import { IncidentCard } from '../components/IncidentCard';
import { DecisionPanel } from '../components/DecisionPanel';
import { PerspectiveCard } from '../components/PerspectiveCard';
import { RevealSection } from '../components/RevealSection';

type Step = 'SETUP' | 'DECISION_1' | 'PERSPECTIVES' | 'REVEAL' | 'DECISION_2';

export const IncidentContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentIncidentIndex, nextIncident, isDemoMode, resetDemo } = useDemo();
  
  const incident = incidentsData.find(inc => inc.id === id);

  const [step, setStep] = useState<Step>('SETUP');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);

  useEffect(() => {
    setStep('SETUP');
    window.scrollTo(0, 0);
  }, [id]);

  if (!incident) {
    return <div className="app-container"><h2>Incident not found</h2></div>;
  }

  const handleDecision1 = (_decision: string) => {
    setIsGenerating(true);
    setStep('PERSPECTIVES');
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    
    // Simulate Granite API thinking/generation delay
    setTimeout(() => {
      setIsGenerating(false);
    }, 2500);
  };

  const handleDecision2 = (_decision: string) => {
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
    "> Querying Vector Store for relevant law...",
    "> Spawning personas (Fan, Referee, VAR)...",
    "> Synthesizing divergent perspectives..."
  ];

  useEffect(() => {
    if (isGenerating) {
      setGenerationLogs([]);
      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < layer1Steps.length) {
          setGenerationLogs(prev => [...prev, layer1Steps[currentStep]]);
          currentStep++;
        } else {
          clearInterval(interval);
        }
      }, 700);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  return (
    <div className="app-container" style={{ paddingBottom: '128px' }}>
      <header className="header" style={{ position: 'sticky', top: 0, background: 'var(--bg-color)', zIndex: 10, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h2>{incident.title} — {incident.theme}</h2>
      </header>
      
      <main className="main-content" style={{ width: '100%', maxWidth: '900px', marginTop: '32px' }}>
        
        <div style={{
          opacity: ['REVEAL', 'DECISION_2'].includes(step) ? 0.2 : 1,
          pointerEvents: ['REVEAL', 'DECISION_2'].includes(step) ? 'none' : 'auto',
          transition: 'opacity 1.5s ease',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <IncidentCard 
            title="Incident Evidence"
            mediaType="image"
            mediaUrl={`/assets/${(step === 'REVEAL' || step === 'DECISION_2') && (incident as any).altImageFile ? (incident as any).altImageFile : ((incident as any).imageFile || incident.id + '.png')}`}
            description={incident.summary + " " + incident.evidenceShown}
          />

        {step === 'SETUP' && (
          <div className="fade-in" style={{ marginTop: '48px', width: '100%' }}>
            <button className="btn-primary" onClick={() => setStep('DECISION_1')} style={{ margin: '0 auto', display: 'block', fontSize: '1.25rem' }}>
              Make Judgment
            </button>
          </div>
        )}

        {['DECISION_1', 'PERSPECTIVES', 'REVEAL', 'DECISION_2'].includes(step) && (
          <div className="fade-in" style={{ width: '100%' }}>
            <DecisionPanel 
              title="What is the correct call?"
              options={["Foul / Penalty / Red", "Play On / Yellow"]}
              onSelect={handleDecision1}
            />
          </div>
        )}

        {['PERSPECTIVES', 'REVEAL', 'DECISION_2'].includes(step) && (
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
              <button className="fade-in btn-primary" onClick={() => {
                setStep('REVEAL');
                // Allow a slight delay for render, then scroll to the exact LawViewer to sync with the 1s reveal animation
                setTimeout(() => {
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }, 100);
              }} style={{ alignSelf: 'center', marginTop: '32px' }}>
                Consult the Law
              </button>
            )}
          </div>
        )}
        </div>

        {['REVEAL', 'DECISION_2'].includes(step) && (
          <div className="fade-in" style={{ marginTop: '64px', width: '100%' }}>
            <RevealSection 
              isVisible={true}
              lawCitation={incident.lawInvolved}
              lawText={rulebookText}
              highlightTerms={highlightTerms} 
              explanation={incident.reveal}
            />
            
            {step === 'REVEAL' && (
              <button className="btn-ghost" onClick={() => {
                setStep('DECISION_2');
                setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
              }} style={{ marginTop: '48px', display: 'block', margin: '48px auto 0' }}>
                Reflect
              </button>
            )}
          </div>
        )}

        {step === 'DECISION_2' && (
          <div className="fade-in" style={{ marginTop: '80px', width: '100%', textAlign: 'center', padding: '32px', background: 'var(--bg-panel)', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '24px', color: 'var(--text-primary)', fontSize: '1.5rem' }}>{incident.decision2Prompt}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontStyle: 'italic' }}>{incident.reflection}</p>
            <DecisionPanel 
              title=""
              options={incident.id === 'suarez' ? ["No", "Yes"] : ["My call was correct", "The law is ambiguous"]}
              onSelect={handleDecision2}
            />
          </div>
        )}
      </main>
    </div>
  );
};
