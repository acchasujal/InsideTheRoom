import React, { useState, useEffect } from 'react';
import { generateLivePerspectives, type LiveGenerationResponse } from '../utils/mockApi';
import { PerspectiveCard } from '../components/PerspectiveCard';
import './LiveGeneration.css';

type LiveStatus = 'IDLE' | 'GENERATING' | 'COMPLETE';

export const LiveGeneration: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<LiveStatus>('IDLE');
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<LiveGenerationResponse | null>(null);

  const pipelineSteps = [
    "Initializing LangFlow Pipeline...",
    "Connecting to IBM watsonx.ai...",
    "Sanitizing input text...",
    "Querying Docling Vector Store for FIFA Laws...",
    "Law retrieved. Identifying ambiguous terms...",
    "Spawning Granite Personas (Referee, VAR, Fan, Rulebook)...",
    "Synthesizing divergent perspectives...",
    "Finalizing response payload..."
  ];

  useEffect(() => {
    if (status === 'GENERATING') {
      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < pipelineSteps.length) {
          setLogs(prev => [...prev, `[${new Date().toISOString().substring(11, 19)}] ${pipelineSteps[currentStep]}`]);
          currentStep++;
        } else {
          clearInterval(interval);
        }
      }, 600); // Emulate real-time log streaming

      return () => clearInterval(interval);
    }
  }, [status]);

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    setStatus('GENERATING');
    setLogs([]);
    setResult(null);

    try {
      const response = await generateLivePerspectives(inputText);
      setStatus('COMPLETE');
      setResult(response);
    } catch (err: any) {
      console.error(err);
      setStatus('COMPLETE');
      setResult({
        retrievedLaw: "Error: Failed to connect to backend",
        perspectives: [
          { persona: "System", text: err.message || "An error occurred while generating perspectives." }
        ]
      });
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h2>VAR Room — Live Granite Generation (Layer 2)</h2>
      </header>

      <main className="main-content" style={{ width: '100%', maxWidth: '900px' }}>
        
        {status === 'IDLE' && (
          <div className="live-input-section fade-in">
            <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Describe a Novel Incident</h3>
            <textarea 
              className="incident-input"
              rows={5}
              placeholder="e.g. A defender tackles the attacker inside the box but touches the ball first. The attacker's momentum carries them over the defender's leg..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button 
              className="btn-primary" 
              onClick={handleSubmit} 
              style={{ marginTop: '24px', alignSelf: 'flex-end' }}
              disabled={!inputText.trim()}
            >
              Run Pipeline
            </button>
          </div>
        )}

        {status === 'GENERATING' && (
          <div className="terminal-window fade-in">
            <div className="terminal-header">
              <span>LangFlow Execution Log</span>
            </div>
            <div className="terminal-body mono">
              {logs.map((log, i) => (
                <div key={i} className="log-line">{log}</div>
              ))}
              <span className="cursor">_</span>
            </div>
          </div>
        )}

        {status === 'COMPLETE' && result && (
          <div className="live-results fade-in">
            <div className="terminal-window" style={{ marginBottom: '32px' }}>
              <div className="terminal-header"><span>Pipeline Complete</span></div>
              <div className="terminal-body mono" style={{ color: 'var(--text-muted)' }}>
                {logs.slice(-2).map((log, i) => (
                  <div key={i} className="log-line">{log}</div>
                ))}
                <div className="log-line" style={{ color: 'var(--accent-color)', marginTop: '8px' }}>
                  {'>'} payload.delivered === true
                </div>
              </div>
            </div>

            <h3 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Generated Perspectives</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {result.perspectives.map((p, idx) => {
                let theme: any = 'default';
                const lower = p.persona.toLowerCase();
                if (lower.includes('referee')) theme = 'referee';
                if (lower.includes('fan')) theme = 'fan';
                if (lower.includes('var')) theme = 'var';
                if (lower.includes('rulebook')) theme = 'rulebook';
                
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

            <button className="btn-ghost" onClick={() => setStatus('IDLE')} style={{ marginTop: '48px', margin: '48px auto 0', display: 'block' }}>
              Run Another Incident
            </button>
          </div>
        )}

      </main>
    </div>
  );
};
