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
  const { currentIncidentIndex, nextIncident } = useDemo();
  
  const incident = incidentsData.find(inc => inc.id === id);

  const [step, setStep] = useState<Step>('SETUP');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userDecision1, setUserDecision1] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userDecision2, setUserDecision2] = useState<string | null>(null);

  useEffect(() => {
    setStep('SETUP');
    setUserDecision1(null);
    setUserDecision2(null);
    window.scrollTo(0, 0);
  }, [id]);

  if (!incident) {
    return <div className="app-container"><h2>Incident not found</h2></div>;
  }

  const handleDecision1 = (decision: string) => {
    setUserDecision1(decision);
    setStep('PERSPECTIVES');
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  const handleDecision2 = (decision: string) => {
    setUserDecision2(decision);
    nextIncident();
    const nextIndex = currentIncidentIndex + 1;
    if (nextIndex < incidentsData.length) {
      navigate(`/incident/${incidentsData[nextIndex].id}`);
    } else {
      navigate('/');
    }
  };

  // Simple heuristic to extract the highlight term for the Reveal
  const extractedTerm = incident.disputedTerm.replace(/["']/g, '').split('/')[0].trim();
  const rulebookText = incident.perspectives.find(p => p.persona === 'Rulebook')?.text || "";

  return (
    <div className="app-container" style={{ paddingBottom: '128px' }}>
      <header className="header" style={{ position: 'sticky', top: 0, background: 'var(--bg-color)', zIndex: 10, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h2>{incident.title} — {incident.theme}</h2>
      </header>
      
      <main className="main-content" style={{ width: '100%', maxWidth: '900px', marginTop: '32px' }}>
        
        <IncidentCard 
          title="Incident Evidence"
          mediaType="image"
          mediaUrl="https://via.placeholder.com/800x400/111111/FFFFFF?text=Evidence+(Placeholder)"
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
            
            {step === 'PERSPECTIVES' && (
              <button className="btn-primary" onClick={() => {
                setStep('REVEAL');
                setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
              }} style={{ alignSelf: 'center', marginTop: '32px' }}>
                Consult the Law
              </button>
            )}
          </div>
        )}

        {['REVEAL', 'DECISION_2'].includes(step) && (
          <div className="fade-in" style={{ marginTop: '64px', width: '100%' }}>
            <RevealSection 
              isVisible={true}
              lawCitation={incident.lawInvolved}
              lawText={rulebookText}
              undefinedTerm={extractedTerm} 
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
              options={["My call was correct", "The law is ambiguous"]}
              onSelect={handleDecision2}
            />
          </div>
        )}
      </main>
    </div>
  );
};
