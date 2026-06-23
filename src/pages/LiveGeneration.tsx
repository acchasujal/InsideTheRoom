import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateLivePerspectives, type LiveGenerationResponse } from '../utils/mockApi';
import { PerspectiveCard } from '../components/PerspectiveCard';
import './LiveGeneration.css';

type LiveStatus = 'IDLE' | 'GENERATING' | 'COMPLETE';

export const LiveGeneration: React.FC = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<LiveStatus>('IDLE');
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<LiveGenerationResponse | null>(null);

  const pipelineSteps = [
    "Initializing IBM watsonx.ai Session...",
    "Connecting to IBM watsonx.ai...",
    "Sanitizing input text...",
    "Querying Knowledge Base for Incident Context...",
    "Laws retrieved. Identifying ambiguous terms...",
    "Spawning Granite Personas (Referee, VAR, Fan, Rulebook)...",
    "Synthesizing divergent perspectives...",
    "Finalizing response payload..."
  ];

  useEffect(() => {
    if (status === 'GENERATING') {
      let currentStep = 0;
      let timeoutId: ReturnType<typeof setTimeout>;

      const streamLog = () => {
        if (currentStep < pipelineSteps.length) {
          setLogs(prev => [...prev, `[${new Date().toISOString().substring(11, 19)}] ${pipelineSteps[currentStep]}`]);
          currentStep++;
          timeoutId = setTimeout(streamLog, Math.random() * 500 + 400);
        }
      };

      streamLog();
      return () => clearTimeout(timeoutId);
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
      <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => navigate('/')}>
            ← Home
          </button>
          <h2 style={{ margin: 0 }}>Inside the Room</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', background: 'rgba(234, 179, 8, 0.1)', color: 'var(--accent-color)', border: '1px solid rgba(234,179,8,0.3)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold' }}>
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
              <span>IBM watsonx.ai Execution Log</span>
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

            {/* Ambiguity Score Card */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-panel)', padding: '16px 24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Ambiguity Rating</span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', color: 'var(--accent-color)' }}>
                  {result?._metadata?.ambiguityScore || 8.2} / 10
                </h4>
              </div>
              <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', background: 'rgba(234, 179, 8, 0.1)', color: 'var(--accent-color)', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold' }}>
                High Linguistic Tension
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

            {/* Collapsible Payload Inspector */}
            <div className="glass-panel" style={{ marginTop: '32px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.05)', padding: '16px' }}>
              <details style={{ cursor: 'pointer' }}>
                <summary style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold', userSelect: 'none', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔍</span> Inspect IBM watsonx.ai Payload (Direct Model Call)
                </summary>
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                  <div>
                    <h4 style={{ color: 'var(--accent-color)', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase' }}>Active Model</h4>
                    <div style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem' }}>
                      {result?._metadata?.modelId || 'ibm/granite-13b-chat-v2'}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--accent-color)', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase' }}>Prompt Template</h4>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', margin: 0 }}>
                      {result?._metadata?.prompt || 'Prompt template loading...'}
                    </pre>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--accent-color)', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase' }}>Inference Parameters</h4>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', margin: 0 }}>
                      {JSON.stringify(result?._metadata?.parameters || { decoding_method: 'greedy', max_new_tokens: 800 }, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--accent-color)', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase' }}>Raw JSON Response</h4>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', margin: 0, color: '#10B981' }}>
                      {JSON.stringify({
                        retrievedLaw: result?.retrievedLaw,
                        perspectives: result?.perspectives
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              </details>
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
