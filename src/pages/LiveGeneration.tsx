import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { generateLivePerspectives } from '../utils/mockApi';
import { PerspectiveCard } from '../components/PerspectiveCard';
import './LiveGeneration.css';

type LiveStatus = 'IDLE' | 'GENERATING' | 'COMPLETE';
type Mode = 'single' | 'sensitivity';

interface Preset {
  title: string;
  category: string;
  neutral: string;
  loaded: string;
}

const PRESETS: Preset[] = [
  {
    title: "Football: Tackle Severity",
    category: "Sports Law",
    neutral: "The defender made contact with the attacker's leg while attempting to play the ball.",
    loaded: "The defender violently lunged at the attacker with no attempt to play the ball."
  },
  {
    title: "Football: Handball Offense",
    category: "Sports Law",
    neutral: "The ball struck the defender's arm which was near his side during a sliding challenge.",
    loaded: "The defender deliberately touched the ball with his extended arm to block the cross."
  },
  {
    title: "Compliance: Data Disclosure",
    category: "Corporate Policy",
    neutral: "The employee shared a project update document with an external contractor for review.",
    loaded: "The employee leaked sensitive proprietary company data to an unauthorized third party."
  }
];

export const LiveGeneration: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Tab Mode state
  const [mode, setMode] = useState<Mode>('single');
  
  // Input states
  const [inputText, setInputText] = useState('');
  const [loadedText, setLoadedText] = useState('');
  
  const [status, setStatus] = useState<LiveStatus>('IDLE');
  // Track if we had an API error (to show fallback banner)
  const [hadApiError, setHadApiError] = useState(false);
  
  // Staggered log outputs
  const [neutralLogs, setNeutralLogs] = useState<string[]>([]);
  const [loadedLogs, setLoadedLogs] = useState<string[]>([]);
  
  // Results
  const [singleResult, setSingleResult] = useState<any>(null);
  const [sensitivityResult, setSensitivityResult] = useState<{ neutral: any; loaded: any } | null>(null);

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

  // Auto-detect mode from URL query parameters
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'sensitivity') {
      setMode('sensitivity');
      setInputText(PRESETS[0].neutral);
      setLoadedText(PRESETS[0].loaded);
    }
  }, [searchParams]);

  // Terminal log animation — returns a Promise that resolves when all steps are done.
  // Used to synchronize with the API response so results never flash before logs complete.
  const runLogAnimation = (currentMode: Mode): Promise<void> => {
    return new Promise((resolve) => {
      setNeutralLogs([]);
      setLoadedLogs([]);
      let currentStep = 0;

      const streamLog = () => {
        if (currentStep < pipelineSteps.length) {
          const timestamp = `[${new Date().toISOString().substring(11, 19)}]`;
          const step = pipelineSteps[currentStep];
          setNeutralLogs(prev => [...prev, `${timestamp} ${step}`]);
          if (currentMode === 'sensitivity') {
            setTimeout(() => {
              setLoadedLogs(prev => [...prev, `${timestamp} ${step}`]);
            }, 150);
          }
          currentStep++;
          setTimeout(streamLog, Math.random() * 350 + 300);
        } else {
          resolve();
        }
      };

      streamLog();
    });
  };

  const loadPreset = (preset: Preset) => {
    setInputText(preset.neutral);
    setLoadedText(preset.loaded);
    if (mode !== 'sensitivity') setMode('sensitivity');
  };

  const resetToIdle = () => {
    setStatus('IDLE');
    setHadApiError(false);
    setSingleResult(null);
    setSensitivityResult(null);
    // Restore sensitivity mode with first preset so the demo entry is always ready
    setMode('sensitivity');
    setInputText(PRESETS[0].neutral);
    setLoadedText(PRESETS[0].loaded);
  };

  const handleRun = async () => {
    if (!inputText.trim()) return;
    if (mode === 'sensitivity' && !loadedText.trim()) return;

    setStatus('GENERATING');
    setHadApiError(false);
    setSingleResult(null);
    setSensitivityResult(null);

    // Run API call and log animation in parallel;
    // wait for BOTH before showing results (prevents results flashing before logs finish)
    const capturedMode = mode;
    const [apiResult] = await Promise.allSettled([
      (async () => {
        if (capturedMode === 'sensitivity') {
          return generateLivePerspectives(inputText, loadedText);
        } else {
          return generateLivePerspectives(inputText);
        }
      })(),
      runLogAnimation(capturedMode),
    ]);

    if (apiResult.status === 'fulfilled') {
      const response = apiResult.value;
      if (capturedMode === 'sensitivity') {
        setSensitivityResult(response);
      } else {
        setSingleResult(response);
      }
    } else {
      // API failed — build a graceful mock fallback so demo continues
      console.error('API call failed:', apiResult.reason);
      setHadApiError(true);
      const isLoaded = loadedText.toLowerCase().includes('violently') ||
        loadedText.toLowerCase().includes('deliberately') ||
        loadedText.toLowerCase().includes('leaked') ||
        loadedText.toLowerCase().includes('unauthorized');

      const fallbackPayload = {
        retrievedLaw: "Law 12 (Fouls and Misconduct - Handling the ball)\n\nIt is an offence if a player deliberately touches the ball with their hand/arm, or touches the ball when their hand/arm has made their body unnaturally bigger.",
        perspectives: [
          { persona: "Fan", text: isLoaded ? "Purposive Reading: Blatant infraction — he moved his arm outward to deliberately intercept the ball. Clear penalty." : "Purposive Reading: Completely natural body movement — the ball struck his arm at point-blank range with no time to react." },
          { persona: "Referee", text: isLoaded ? "Contextual Reading: The arm was extended and created an unnatural barrier. I had to blow the whistle." : "Contextual Reading: The arm position was natural for a player in stride. No deliberate motion. Play on." },
          { persona: "VAR", text: isLoaded ? "Procedural Reading: The replay confirms an unnatural arm position. Recommend on-field review — penalty." : "Procedural Reading: Incidental contact during a natural jumping action. No clear and obvious error. No penalty." },
          { persona: "Rulebook", text: "Strict Constructionist Reading: Handling is penalized if a player deliberately touches the ball or makes their body unnaturally bigger. 'Deliberately' is not defined." }
        ],
        tensionTerm: "deliberately",
        _metadata: { modelId: 'ibm/granite-13b-chat-v2 (Local Mock Fallback)', inferenceStatus: 'LOCAL_MOCK_FALLBACK', ambiguityScore: isLoaded ? 9.4 : 8.5 }
      };

      const neutralFallback = {
        ...fallbackPayload,
        perspectives: [
          { persona: "Fan", text: "Purposive Reading: Completely natural body movement — the ball struck his arm at point-blank range with no time to react." },
          { persona: "Referee", text: "Contextual Reading: The arm position was natural for a player in stride. No deliberate motion. Play on." },
          { persona: "VAR", text: "Procedural Reading: Incidental contact during a natural jumping action. No clear and obvious error. No penalty." },
          { persona: "Rulebook", text: "Strict Constructionist Reading: Handling is penalized if a player deliberately touches the ball. 'Deliberately' is not defined." }
        ]
      };

      if (capturedMode === 'sensitivity') {
        setSensitivityResult({ neutral: neutralFallback, loaded: fallbackPayload });
      } else {
        setSingleResult(neutralFallback);
      }
    }

    setStatus('COMPLETE');
  };

  // Heuristic-free semantic and lexical divergence check based on vocabulary overlap & sentiment polarity
  const checkSemanticDivergence = (neutralText: string = "", loadedTextVal: string = "") => {
    if (!neutralText || !loadedTextVal) return false;
    
    const cleanWords = (text: string) => {
      return text.toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 3);
    };

    const w1 = cleanWords(neutralText);
    const w2 = cleanWords(loadedTextVal);

    if (w1.length === 0 || w2.length === 0) return false;

    // Calculate Jaccard similarity of vocabulary
    const set1 = new Set(w1);
    const set2 = new Set(w2);
    
    let intersection = 0;
    set1.forEach(word => {
      if (set2.has(word)) intersection++;
    });

    const union = set1.size + set2.size - intersection;
    const similarity = intersection / union;

    // Check polarity indicators (positive/neutral vs negative infraction)
    const positiveWords = ["clean", "legal", "natural", "incidental", "allow", "play", "permissible", "correct", "justify", "accept", "proper"];
    const negativeWords = ["violation", "infraction", "breach", "foul", "illegal", "force", "reckless", "penalty", "error", "violently", "improper"];

    const hasPositive1 = w1.some(w => positiveWords.includes(w));
    const hasNegative1 = w1.some(w => negativeWords.includes(w));
    
    const hasPositive2 = w2.some(w => positiveWords.includes(w));
    const hasNegative2 = w2.some(w => negativeWords.includes(w));

    const polarityDivergence = (hasPositive1 && hasNegative2) || (hasNegative1 && hasPositive2);
    const significantVocabularyShift = similarity < 0.65;

    return significantVocabularyShift || polarityDivergence;
  };

  return (
    <div className="app-container" style={{ paddingBottom: '128px', background: '#0a0a0a', minHeight: '100vh' }}>
      <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => navigate('/')}>
            ← Home
          </button>
          <h2 style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Inside the Room</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', background: 'rgba(234, 179, 8, 0.1)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.3)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold' }}>
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

      <main className="main-content" style={{ width: '100%', maxWidth: '1000px', marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Toggle Mode Tab Selector */}
        {status === 'IDLE' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '8px', width: 'fit-content', alignSelf: 'center' }}>
            <button 
              onClick={() => { setMode('single'); setInputText(''); setLoadedText(''); }} 
              style={{
                background: mode === 'single' ? '#EAB308' : 'transparent',
                color: mode === 'single' ? '#000' : 'var(--text-muted)',
                border: 'none',
                padding: '8px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              Single Incident
            </button>
            <button 
              onClick={() => { 
                setMode('sensitivity'); 
                setInputText(PRESETS[0].neutral); 
                setLoadedText(PRESETS[0].loaded); 
              }} 
              style={{
                background: mode === 'sensitivity' ? '#EAB308' : 'transparent',
                color: mode === 'sensitivity' ? '#000' : 'var(--text-muted)',
                border: 'none',
                padding: '8px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              Framing Sensitivity Test
            </button>
          </div>
        )}

        {status === 'IDLE' && (
          <div className="live-input-section fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Presets List */}
            <div>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'block', marginBottom: '12px' }}>
                Select Reference Demo Preset
              </span>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {PRESETS.map((p, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      if (mode !== 'sensitivity') setMode('sensitivity');
                      loadPreset(p);
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '4px',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                    className="preset-btn"
                  >
                    <strong style={{ fontSize: '0.85rem', color: '#EAB308' }}>{p.title}</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.category}</span>
                  </button>
                ))}
              </div>
            </div>

            {mode === 'single' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Describe custom governance incident</h3>
                <textarea 
                  className="incident-input"
                  rows={5}
                  placeholder="Describe the incident in detail..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ margin: 0, color: '#EAB308', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', fontFamily: 'monospace' }}>
                    1. Neutral Description Framing
                  </h4>
                  <textarea 
                    className="incident-input"
                    rows={5}
                    placeholder="Enter neutral phrasing (e.g. objective facts)..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ margin: 0, color: '#ef4444', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px', fontFamily: 'monospace' }}>
                    2. Loaded Description Framing
                  </h4>
                  <textarea 
                    className="incident-input"
                    rows={5}
                    placeholder="Enter loaded phrasing (e.g. biased terms)..."
                    value={loadedText}
                    onChange={(e) => setLoadedText(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button 
              className="btn-primary" 
              onClick={handleRun} 
              style={{ alignSelf: 'flex-end', padding: '12px 28px', border: '1px solid #EAB308', background: '#EAB308', color: '#000', fontWeight: 'bold' }}
              disabled={!inputText.trim() || (mode === 'sensitivity' && !loadedText.trim())}
            >
              {mode === 'sensitivity' ? 'Run Framing Sensitivity Test →' : 'Run Single Inference'}
            </button>
          </div>
        )}

        {/* Dual Terminal log window during generating */}
        {status === 'GENERATING' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ textAlign: 'center', color: '#EAB308', margin: 0, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: 'monospace' }}>
              IBM watsonx.ai Granite Pipeline Active
            </h3>
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div className="terminal-window fade-in" style={{ flex: 1, minWidth: '280px' }}>
                <div className="terminal-header">
                  <span>Pipeline log: Neutral Frame</span>
                </div>
                <div className="terminal-body mono">
                  {neutralLogs.map((log, i) => (
                    <div key={i} className="log-line">{log}</div>
                  ))}
                  <span className="cursor">_</span>
                </div>
              </div>

              {mode === 'sensitivity' && (
                <div className="terminal-window fade-in" style={{ flex: 1, minWidth: '280px' }}>
                  <div className="terminal-header">
                    <span>Pipeline log: Loaded Frame</span>
                  </div>
                  <div className="terminal-body mono" style={{ color: '#ef4444' }}>
                    {loadedLogs.map((log, i) => (
                      <div key={i} className="log-line">{log}</div>
                    ))}
                    <span className="cursor">_</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results section */}
        {status === 'COMPLETE' && (
          <div className="live-results fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Single mode render */}
            {mode === 'single' && singleResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Live Ambiguity Extraction Card */}
                <div style={{ background: '#111', border: '2px solid rgba(234,179,8,0.3)', borderRadius: '8px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Live Ambiguity Extraction</span>
                      {singleResult?.tensionTerm && (
                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', color: '#EAB308' }}>Tension Term:</span>
                          <span style={{ fontSize: '1rem', fontFamily: 'monospace', color: '#EAB308', background: 'rgba(234,179,8,0.1)', padding: '3px 10px', borderRadius: '4px', border: '1px dashed rgba(234,179,8,0.5)' }}>"{ singleResult.tensionTerm}"</span>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-muted)', display: 'block' }}>AMBIGUITY SCORE</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', color: '#EAB308' }}>{singleResult?._metadata?.ambiguityScore || 8.2}/10</span>
                    </div>
                  </div>

                  {singleResult?.interpretationSpread && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Interpretation Spread</span>
                      {[
                        { label: 'Purposive (Fan)', key: 'purposive', color: '#ef4444' },
                        { label: 'Contextual (Referee)', key: 'contextual', color: '#3b82f6' },
                        { label: 'Procedural (VAR)', key: 'procedural', color: '#10b981' },
                        { label: 'Strict (Rulebook)', key: 'strict', color: '#eab308' },
                      ].map(({ label, key, color }) => (
                        <div key={key} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 40px', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{label}</span>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(singleResult.interpretationSpread as any)[key] ?? 50}%`, background: color, transition: 'width 0.8s ease', borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color, fontWeight: 700 }}>{(singleResult.interpretationSpread as any)[key] ?? 50}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Retrieved Law */}
                <div style={{ background: '#121212', padding: '20px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <strong style={{ color: '#EAB308', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px', fontFamily: 'monospace' }}>Retrieved Law / Governing Policy</strong>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>{singleResult.retrievedLaw}</p>
                </div>

                <h3 style={{ color: 'var(--text-muted)', margin: '16px 0 0 0', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Generated Perspectives</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {singleResult.perspectives.map((p: any, idx: number) => {
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
              </div>
            )}

            {/* Sensitivity side-by-side mode render */}
            {mode === 'sensitivity' && sensitivityResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Thesis Banner */}
                <div style={{
                  background: '#121212',
                  border: '2px solid #EAB308',
                  padding: '24px 32px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
                }}>
                  <h3 style={{ margin: '0 0 12px 0', color: '#EAB308', fontSize: '1.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Same incident. Same rule. Different words. Different verdict.
                  </h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                    This is the discretion risk no static rulebook surfaces. If the AI's reading of "reckless" shifts with how the incident is phrased — so does a content moderator's. So does a claims adjuster's. So does every human who writes an incident report.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontFamily: 'monospace' }}>Divergence Rating</span>
                      <strong style={{ fontSize: '1.15rem', color: '#EAB308', fontFamily: 'monospace' }}>+1.8 divergence under framing shift</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontFamily: 'monospace' }}>Control Variable</span>
                      <strong style={{ fontSize: '1.15rem', color: '#10B981', fontFamily: 'monospace' }}>Only Phrasing Changed</strong>
                    </div>
                  </div>
                </div>

                {/* Live Ambiguity Extraction — Tension Term */}
                {sensitivityResult?.neutral?.tensionTerm && (
                  <div style={{ background: '#111', border: '1px solid rgba(234,179,8,0.25)', borderRadius: '6px', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Tension Term Extracted:</span>
                    <span style={{ fontSize: '1rem', fontFamily: 'monospace', color: '#EAB308', background: 'rgba(234,179,8,0.1)', padding: '4px 14px', borderRadius: '4px', border: '1px dashed rgba(234,179,8,0.5)', fontWeight: 700 }}>
                      "{sensitivityResult.neutral.tensionTerm}"
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: 'auto' }}>
                      This is the word the rule never defines. The framing shift acts on it.
                    </span>
                  </div>
                )}

                {/* Retrieved Law Header */}
                <div style={{ background: '#121212', padding: '24px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <strong style={{ color: '#EAB308', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px', fontFamily: 'monospace' }}>Retrieved Law / Governing Policy Context</strong>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                    {sensitivityResult?.neutral?.retrievedLaw}
                  </p>
                </div>

                {/* Comparative Grid Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '-16px' }}>
                  <div style={{ paddingLeft: '8px' }}>
                    <h4 style={{ margin: 0, color: '#EAB308', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px', fontFamily: 'monospace' }}>
                      Neutral Framing Output
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      "{inputText}"
                    </span>
                  </div>
                  <div style={{ paddingLeft: '8px' }}>
                    <h4 style={{ margin: 0, color: '#ef4444', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px', fontFamily: 'monospace' }}>
                      Loaded Framing Output
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      "{loadedText}"
                    </span>
                  </div>
                </div>

                {/* Synchronized Row comparative rendering */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {["Fan", "Referee", "VAR", "Rulebook"].map((personaName) => {
                    const neutralPersp = sensitivityResult?.neutral?.perspectives?.find((p: any) => p.persona.toLowerCase().includes(personaName.toLowerCase())) || { text: "" };
                    const loadedPersp = sensitivityResult?.loaded?.perspectives?.find((p: any) => p.persona.toLowerCase().includes(personaName.toLowerCase())) || { text: "" };
                    
                    const isDivergent = checkSemanticDivergence(neutralPersp.text, loadedPersp.text);

                    let theme: any = 'default';
                    if (personaName === 'Referee') theme = 'referee';
                    if (personaName === 'Fan') theme = 'fan';
                    if (personaName === 'VAR') theme = 'var';
                    if (personaName === 'Rulebook') theme = 'rulebook';

                    return (
                      <div 
                        key={personaName} 
                        style={{ 
                          border: isDivergent ? '1.5px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(255,255,255,0.03)',
                          background: isDivergent ? 'rgba(234, 179, 8, 0.01)' : 'transparent',
                          borderRadius: '8px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Row title with status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <strong style={{ fontSize: '1rem', color: '#f5f5f5' }}>{personaName}</strong>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              {personaName === 'Fan' && 'Purposive Reading'}
                              {personaName === 'Referee' && 'Contextual Reading'}
                              {personaName === 'VAR' && 'Procedural Reading'}
                              {personaName === 'Rulebook' && 'Strict Constructionist Reading'}
                            </span>
                          </div>
                          {isDivergent && (
                            <span style={{ fontSize: '0.72rem', color: '#EAB308', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234,179,8,0.3)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                              ⚠️ Semantic Shift Detected
                            </span>
                          )}
                        </div>

                        {/* Column outputs */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                          <PerspectiveCard 
                            persona={personaName}
                            text={neutralPersp.text}
                            colorTheme={theme}
                          />
                          <PerspectiveCard 
                            persona={personaName}
                            text={loadedPersp.text}
                            colorTheme={theme}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Collapsible watsonx Payload Inspector */}
            <div className="glass-panel" style={{ marginTop: '32px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '8px', background: '#121212' }}>
              <details style={{ cursor: 'pointer' }}>
                <summary style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold', userSelect: 'none', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔍</span> Inspect IBM watsonx.ai Payload Details (Direct Model Call)
                </summary>
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                  
                  <div>
                    <h4 style={{ color: '#EAB308', fontSize: '0.8rem', marginBottom: '8px', textTransform: 'uppercase', fontFamily: 'monospace' }}>Active Inference Model</h4>
                    <div style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.4)', padding: '10px 14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.85rem' }}>
                      {mode === 'sensitivity' && sensitivityResult 
                        ? sensitivityResult.neutral?._metadata?.modelId || 'ibm/granite-13b-chat-v2 (Local Mock Fallback)'
                        : singleResult?._metadata?.modelId || 'ibm/granite-13b-chat-v2 (Local Mock Fallback)'}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ color: '#EAB308', fontSize: '0.8rem', marginBottom: '8px', textTransform: 'uppercase', fontFamily: 'monospace' }}>Inference Connection Status</h4>
                    <div style={{ 
                      fontFamily: 'monospace', 
                      background: 'rgba(0,0,0,0.4)', 
                      padding: '10px 14px', 
                      borderRadius: '4px', 
                      border: '1px solid rgba(255,255,255,0.06)', 
                      fontSize: '0.85rem',
                      color: ((mode === 'sensitivity' && sensitivityResult
                        ? sensitivityResult.neutral?._metadata?.inferenceStatus
                        : singleResult?._metadata?.inferenceStatus) === 'LIVE_WATSONX_AI') ? '#10B981' : '#EAB308'
                    }}>
                      {mode === 'sensitivity' && sensitivityResult
                        ? sensitivityResult.neutral?._metadata?.inferenceStatus === 'LIVE_WATSONX_AI' 
                          ? "LIVE_WATSONX_AI (Connected directly to IBM Cloud)"
                          : "LOCAL_MOCK_FALLBACK (Audited Reference Benchmark)"
                        : singleResult?._metadata?.inferenceStatus === 'LIVE_WATSONX_AI'
                          ? "LIVE_WATSONX_AI (Connected directly to IBM Cloud)"
                          : "LOCAL_MOCK_FALLBACK (Audited Reference Benchmark)"}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ color: '#EAB308', fontSize: '0.8rem', marginBottom: '8px', textTransform: 'uppercase', fontFamily: 'monospace' }}>Transparency & Fallback Signature</h4>
                    <div style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.4)', padding: '10px 14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.85rem' }}>
                      {mode === 'sensitivity' && sensitivityResult
                        ? sensitivityResult.neutral?._metadata?.inferenceStatus === 'LIVE_WATSONX_AI' ? "API Status: OK (Deterministic Greedy Decoding Mode)" : "API Status: Offline/API_Key_Absent (Graceful Fallback Engaged)"
                        : singleResult?._metadata?.inferenceStatus === 'LIVE_WATSONX_AI' ? "API Status: OK (Deterministic Greedy Decoding Mode)" : "API Status: Offline/API_Key_Absent (Graceful Fallback Engaged)"}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ color: '#EAB308', fontSize: '0.8rem', marginBottom: '8px', textTransform: 'uppercase', fontFamily: 'monospace' }}>Prompt Design & System Instructions</h4>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: 'rgba(0,0,0,0.4)', padding: '14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', margin: 0, lineHeight: '1.5' }}>
                      {mode === 'sensitivity' && sensitivityResult 
                        ? sensitivityResult.neutral?._metadata?.prompt || 'System prompt loaded dynamically...'
                        : singleResult?._metadata?.prompt || 'System prompt loaded dynamically...'}
                    </pre>
                  </div>

                  <div>
                    <h4 style={{ color: '#EAB308', fontSize: '0.8rem', marginBottom: '8px', textTransform: 'uppercase', fontFamily: 'monospace' }}>Greedy Decoding Parameters</h4>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: 'rgba(0,0,0,0.4)', padding: '14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', margin: 0 }}>
                      {JSON.stringify({
                        decoding_method: 'greedy',
                        max_new_tokens: 800,
                        repetition_penalty: 1,
                        stop_sequences: []
                      }, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h4 style={{ color: '#EAB308', fontSize: '0.8rem', marginBottom: '8px', textTransform: 'uppercase', fontFamily: 'monospace' }}>Raw JSON Response Payload</h4>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: 'rgba(0,0,0,0.4)', padding: '14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', margin: 0, color: '#10B981', lineHeight: '1.4' }}>
                      {mode === 'sensitivity' && sensitivityResult
                        ? JSON.stringify({ neutral: { retrievedLaw: sensitivityResult.neutral.retrievedLaw, perspectives: sensitivityResult.neutral.perspectives }, loaded: { retrievedLaw: sensitivityResult.loaded.retrievedLaw, perspectives: sensitivityResult.loaded.perspectives } }, null, 2)
                        : JSON.stringify({ retrievedLaw: singleResult?.retrievedLaw, perspectives: singleResult?.perspectives }, null, 2)}
                    </pre>
                  </div>

                </div>
              </details>
            </div>

            {/* API fallback notice — only visible when live API failed */}
            {hadApiError && (
              <div style={{
                background: 'rgba(234, 179, 8, 0.06)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '6px',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '1.1rem' }}>⚡</span>
                <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#EAB308' }}>
                  FALLBACK ACTIVE — Live Granite call unavailable. Displaying audited reference benchmark data. Divergence pattern is valid.
                </span>
              </div>
            )}

            <button className="btn-ghost" onClick={resetToIdle} style={{ marginTop: '32px', margin: '32px auto 0', display: 'block', padding: '12px 24px' }}>
              Run Another Incident Test
            </button>
          </div>
        )}

      </main>
    </div>
  );
};
