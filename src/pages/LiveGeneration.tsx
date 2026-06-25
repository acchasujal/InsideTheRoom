import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { generateLivePerspectives } from '../utils/mockApi';
import { PerspectiveCard } from '../components/PerspectiveCard';
import { InterpretationSpreadHero } from '../components/InterpretationSpreadHero';
import './LiveGeneration.css';

// ─── Preset Matching Helper ──────────────────────────────────────────────────
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

function isPresetText(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return PRESETS.some(p => 
    lower.includes(p.neutral.toLowerCase().substring(0, 20)) || 
    lower.includes(p.loaded.toLowerCase().substring(0, 20))
  );
}

// ─── LRU Cache class (For Preset Demonstrations Only) ────────────────────────
class LRUCache<K, V> {
  private capacity: number;
  private ttl: number;
  private cache: Map<K, { value: V; expiry: number }> = new Map();

  constructor(capacity: number, ttlMs: number) {
    this.capacity = capacity;
    this.ttl = ttlMs;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, { value, expiry: Date.now() + this.ttl });
  }
}

const PRESET_CACHE = new LRUCache<string, any>(50, 10 * 60 * 1000); // 50 entries, 10 min TTL
const PENDING_REQUESTS = new Map<string, Promise<any>>();

type LiveStatus = 'IDLE' | 'GENERATING' | 'COMPLETE';
type Mode = 'single' | 'sensitivity';

export const LiveGeneration: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [mode, setMode] = useState<Mode>('single');
  const [inputText, setInputText] = useState('');
  const [loadedText, setLoadedText] = useState('');
  const [status, setStatus] = useState<LiveStatus>('IDLE');
  
  // Structured API error states
  const [apiError, setApiError] = useState<{ message: string; details: string; logs: string[] } | null>(null);
  
  // Terminal log outputs (client-side connection process)
  const [neutralLogs, setNeutralLogs] = useState<string[]>([]);
  const [loadedLogs, setLoadedLogs] = useState<string[]>([]);
  
  // Results
  const [singleResult, setSingleResult] = useState<any>(null);
  const [sensitivityResult, setSensitivityResult] = useState<{ neutral: any; loaded: any } | null>(null);

  const pipelineSteps = [
    "Initializing local client parameters...",
    "Validating input incident schema...",
    "Routing query to Watsonx serverless gateway...",
  ];

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'sensitivity') {
      setMode('sensitivity');
      setInputText(PRESETS[0].neutral);
      setLoadedText(PRESETS[0].loaded);
    }
  }, [searchParams]);

  const runLogAnimation = (currentMode: Mode, serverLogs: string[] = []): Promise<void> => {
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
            }, 50);
          }
          currentStep++;
          setTimeout(streamLog, 100);
        } else {
          // Merge server-side timestamps stage logs once gateway request completes
          if (serverLogs.length > 0) {
            setNeutralLogs(prev => [...prev, ...serverLogs]);
            if (currentMode === 'sensitivity') {
              setLoadedLogs(prev => [...prev, ...serverLogs]);
            }
          }
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
    setApiError(null);
    setSingleResult(null);
    setSensitivityResult(null);
    setMode('sensitivity');
    setInputText(PRESETS[0].neutral);
    setLoadedText(PRESETS[0].loaded);
  };

  const handleRun = async (forceFallbackValue = false) => {
    if (!inputText.trim()) return;
    if (mode === 'sensitivity' && !loadedText.trim()) return;

    setStatus('GENERATING');
    setApiError(null);
    setSingleResult(null);
    setSensitivityResult(null);

    const capturedMode = mode;
    const isPreset = isPresetText(inputText) || (capturedMode === 'sensitivity' && isPresetText(loadedText));
    const cacheKey = capturedMode === 'sensitivity' ? `sens_${inputText}_${loadedText}` : `single_${inputText}`;

    // 1. Read Cache ONLY for preset demonstrations
    if (isPreset && !forceFallbackValue) {
      const cachedData = PRESET_CACHE.get(cacheKey);
      if (cachedData) {
        await runLogAnimation(capturedMode, [
          `[${new Date().toISOString().substring(11, 19)}] [Client Cache] Cache HIT. Returning pre-audited reference response.`
        ]);
        if (capturedMode === 'sensitivity') {
          setSensitivityResult(cachedData);
        } else {
          setSingleResult(cachedData);
        }
        setStatus('COMPLETE');
        return;
      }
    }

    // 2. Prevent Concurrent Duplicate Requests (Deduplication)
    let apiPromise = PENDING_REQUESTS.get(cacheKey);
    if (!apiPromise) {
      apiPromise = generateLivePerspectives(inputText, loadedText, isPreset, forceFallbackValue);
      PENDING_REQUESTS.set(cacheKey, apiPromise);
    }

    try {
      const response = await apiPromise;
      PENDING_REQUESTS.delete(cacheKey);

      // Extract server-side stage logs
      const serverLogs = response.neutral
        ? (response.neutral._metadata?.logs || [])
        : (response._metadata?.logs || []);

      await runLogAnimation(capturedMode, serverLogs);

      // Cache ONLY presets
      if (isPreset || forceFallbackValue) {
        PRESET_CACHE.set(cacheKey, response);
      }

      if (capturedMode === 'sensitivity') {
        setSensitivityResult(response);
      } else {
        setSingleResult(response);
      }
    } catch (err: any) {
      PENDING_REQUESTS.delete(cacheKey);
      console.error('[Inference Error]', err);

      await runLogAnimation(capturedMode, err.logs || []);

      // Never fabricate governance reasoning after failure.
      // Set structured error and present benchmark option
      setApiError({
        message: err.message || 'IBM watsonx.ai is currently unavailable.',
        details: err.details || 'Connection to Vercel Watsonx proxy timed out or failed.',
        logs: err.logs || [],
      });
      setSingleResult(null);
      setSensitivityResult(null);
    }

    setStatus('COMPLETE');
  };

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

    const set1 = new Set(w1);
    const set2 = new Set(w2);
    let intersection = 0;
    set1.forEach(word => {
      if (set2.has(word)) intersection++;
    });

    const union = set1.size + set2.size - intersection;
    const similarity = intersection / union;

    const positiveWords = ["clean", "legal", "natural", "incidental", "allow", "play", "permissible", "correct", "justify", "accept", "proper"];
    const negativeWords = ["violation", "infraction", "breach", "foul", "illegal", "force", "reckless", "penalty", "error", "violently", "improper"];

    const hasPositive1 = w1.some(w => positiveWords.includes(w));
    const hasNegative1 = w1.some(w => negativeWords.includes(w));
    const hasPositive2 = w2.some(w => positiveWords.includes(w));
    const hasNegative2 = w2.some(w => negativeWords.includes(w));

    return (similarity < 0.65) || ((hasPositive1 && hasNegative2) || (hasNegative1 && hasPositive2));
  };

  const isCorporateText = (text: string) => {
    const lower = text.toLowerCase();
    return lower.includes('employee') || lower.includes('compliance') || lower.includes('policy') || lower.includes('fiduciary') || lower.includes('corporate') || lower.includes('disclosure');
  };

  // Helper to extract metadata properties from result safely
  const getResultMetadata = () => {
    if (mode === 'sensitivity' && sensitivityResult) {
      return sensitivityResult.neutral?._metadata || {};
    }
    return singleResult?._metadata || {};
  };

  const metadata = getResultMetadata();

  return (
    <div className="app-container" style={{ paddingBottom: '96px', background: '#0a0a0a', minHeight: '100vh', width: '100%' }}>
      <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px', marginBottom: '32px' }}>
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
          <span className="badge-football">⚽ Football Governance</span>
        </div>
      </header>

      <main className="main-content" style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            Granite Inference Engine · Live Governance Analysis
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f5f5f5', margin: '0 0 8px 0', lineHeight: 1.2 }}>
            Framing Sensitivity Test
          </h1>
          <p style={{ margin: '0 auto', fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '520px', lineHeight: 1.6 }}>
            Same incident. Same rule. Watch how word choice alone changes the AI's verdict.
          </p>
        </div>

        {/* Tab Selector */}
        {status === 'IDLE' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '8px', width: 'fit-content', alignSelf: 'center', marginBottom: '16px' }}>
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
                fontSize: '0.85rem',
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
                fontSize: '0.85rem',
                transition: 'all 0.2s ease'
              }}
            >
              Framing Sensitivity Test
            </button>
          </div>
        )}

        {status === 'IDLE' && (
          <div className="live-input-section fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Presets */}
            <div>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'block', marginBottom: '12px', letterSpacing: '1px' }}>
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
                      fontSize: '0.82rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '4px',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                    className="preset-btn"
                  >
                    <strong style={{ fontSize: '0.82rem', color: '#EAB308' }}>{p.title}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.category}</span>
                  </button>
                ))}
              </div>
            </div>

            {mode === 'single' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>Describe custom governance incident</h3>
                <textarea 
                  className="incident-input"
                  rows={4}
                  placeholder="Describe the incident in detail..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ margin: 0, color: '#EAB308', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', fontFamily: 'monospace' }}>
                    1. Neutral Description Framing
                  </h4>
                  <textarea 
                    className="incident-input"
                    rows={4}
                    placeholder="Enter neutral phrasing (e.g. objective facts)..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ margin: 0, color: '#ef4444', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', fontFamily: 'monospace' }}>
                    2. Loaded Description Framing
                  </h4>
                  <textarea 
                    className="incident-input"
                    rows={4}
                    placeholder="Enter loaded phrasing (e.g. biased terms)..."
                    value={loadedText}
                    onChange={(e) => setLoadedText(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button 
              className="btn-primary" 
              onClick={() => handleRun(false)} 
              style={{ alignSelf: 'flex-end', padding: '10px 24px', border: '1px solid #EAB308', background: '#EAB308', color: '#000', fontWeight: 'bold', fontSize: '0.9rem' }}
              disabled={!inputText.trim() || (mode === 'sensitivity' && !loadedText.trim())}
            >
              {mode === 'sensitivity' ? 'Run Framing Sensitivity Test →' : 'Run Single Inference'}
            </button>
          </div>
        )}

        {/* Terminals */}
        {status === 'GENERATING' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ textAlign: 'center', color: '#EAB308', margin: 0, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: 'monospace' }}>
              IBM watsonx.ai Granite Pipeline Active
            </h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div className="terminal-window fade-in" style={{ flex: 1, minWidth: '280px' }}>
                <div className="terminal-header"><span>Pipeline log: Neutral Frame</span></div>
                <div className="terminal-body mono">
                  {neutralLogs.map((log, i) => (
                    <div key={i} className="log-line">{log}</div>
                  ))}
                  <span className="cursor">_</span>
                </div>
              </div>
              {mode === 'sensitivity' && (
                <div className="terminal-window fade-in" style={{ flex: 1, minWidth: '280px' }}>
                  <div className="terminal-header"><span>Pipeline log: Loaded Frame</span></div>
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

        {/* Results / Error Displays */}
        {status === 'COMPLETE' && (
          <div className="live-results fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* API Error Screen (IBM Unavailable) */}
            {apiError ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.07)',
                  border: '1.5px solid #EF4444',
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15)'
                }}>
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>⚠️</span>
                  <h3 style={{ color: '#EF4444', fontWeight: 800, margin: '0 0 8px 0', textTransform: 'uppercase', fontSize: '1.25rem', letterSpacing: '0.5px' }}>
                    IBM watsonx.ai is Currently Unavailable
                  </h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {apiError.message}
                  </p>
                  <p style={{ margin: '0 0 20px 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                    Details: {apiError.details}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    <button 
                      className="btn-primary" 
                      onClick={() => handleRun(true)} 
                      style={{ border: '1px solid #EAB308', background: '#EAB308', color: '#000', padding: '8px 20px', fontSize: '0.82rem' }}
                    >
                      Run Pre-audited Reference Benchmark
                    </button>
                    <button 
                      className="btn-ghost" 
                      onClick={resetToIdle} 
                      style={{ padding: '8px 20px', fontSize: '0.82rem' }}
                    >
                      Go Back
                    </button>
                  </div>
                </div>

                {/* Show Stage Logs for Diagnosis */}
                {apiError.logs.length > 0 && (
                  <div className="terminal-window">
                    <div className="terminal-header"><span>Connection Stage Logs (Trace)</span></div>
                    <div className="terminal-body mono" style={{ color: '#EF4444', minHeight: '120px' }}>
                      {apiError.logs.map((log, i) => (
                        <div key={i} className="log-line">{log}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Single mode render */}
                {mode === 'single' && singleResult && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <InterpretationSpreadHero
                      tensionTerm={singleResult.tensionTerm || "discretion"}
                      ambiguityScore={singleResult._metadata?.ambiguityScore || 8.0}
                      spread={{
                        purposive: singleResult.interpretationSpread?.purposive ?? 50,
                        contextual: singleResult.interpretationSpread?.contextual ?? 50,
                        procedural: singleResult.interpretationSpread?.procedural ?? 50,
                        strict: singleResult.interpretationSpread?.strict ?? 50,
                      }}
                      isCorporate={isCorporateText(inputText)}
                    />

                    <div style={{ background: '#121212', padding: '16px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <strong style={{ color: '#EAB308', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px', fontFamily: 'monospace' }}>
                        Retrieved Law / Governing Policy
                      </strong>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                        {singleResult.retrievedLaw}
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                      {singleResult.perspectives.map((p: any, idx: number) => {
                        let theme: any = 'default';
                        const lower = p.persona.toLowerCase();
                        if (lower.includes('referee')) theme = 'referee';
                        if (lower.includes('fan')) theme = 'fan';
                        if (lower.includes('var')) theme = 'var';
                        if (lower.includes('rulebook')) theme = 'rulebook';

                        let strength = undefined;
                        if (singleResult?.interpretationSpread) {
                          const spread = singleResult.interpretationSpread;
                          if (lower.includes('fan')) strength = spread.purposive;
                          else if (lower.includes('referee')) strength = spread.contextual;
                          else if (lower.includes('var')) strength = spread.procedural;
                          else if (lower.includes('rulebook')) strength = spread.strict;
                        }

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
                )}

                {/* Sensitivity mode render */}
                {mode === 'sensitivity' && sensitivityResult && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: '#121212', border: '1.5px solid #EAB308', padding: '16px 24px', borderRadius: '8px', textAlign: 'center' }}>
                      <h3 style={{ margin: '0 0 6px 0', color: '#EAB308', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Same incident. Same rule. Different words. Different verdict.
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.45', color: 'var(--text-muted)' }}>
                        Watch how the interpretation spread shifts based on linguistic framing. The rulebook does not settle the dispute — the choice of phrasing changes the verdict.
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <h4 style={{ color: '#EAB308', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'monospace', margin: 0, textAlign: 'center' }}>
                          Neutral Framing Spread
                        </h4>
                        <InterpretationSpreadHero
                          tensionTerm={sensitivityResult.neutral.tensionTerm || "discretion"}
                          ambiguityScore={sensitivityResult.neutral._metadata?.ambiguityScore || 7.5}
                          spread={{
                            purposive: sensitivityResult.neutral.interpretationSpread?.purposive ?? 50,
                            contextual: sensitivityResult.neutral.interpretationSpread?.contextual ?? 50,
                            procedural: sensitivityResult.neutral.interpretationSpread?.procedural ?? 50,
                            strict: sensitivityResult.neutral.interpretationSpread?.strict ?? 50,
                          }}
                          isCorporate={isCorporateText(inputText)}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <h4 style={{ color: '#ef4444', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'monospace', margin: 0, textAlign: 'center' }}>
                          Loaded Framing Spread
                        </h4>
                        <InterpretationSpreadHero
                          tensionTerm={sensitivityResult.loaded.tensionTerm || "discretion"}
                          ambiguityScore={sensitivityResult.loaded._metadata?.ambiguityScore || 9.0}
                          spread={{
                            purposive: sensitivityResult.loaded.interpretationSpread?.purposive ?? 50,
                            contextual: sensitivityResult.loaded.interpretationSpread?.contextual ?? 50,
                            procedural: sensitivityResult.loaded.interpretationSpread?.procedural ?? 50,
                            strict: sensitivityResult.loaded.interpretationSpread?.strict ?? 50,
                          }}
                          isCorporate={isCorporateText(loadedText)}
                        />
                      </div>
                    </div>

                    <div style={{ background: '#121212', padding: '16px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <strong style={{ color: '#EAB308', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px', fontFamily: 'monospace' }}>
                        Retrieved Governing Rule Context
                      </strong>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                        {sensitivityResult.neutral.retrievedLaw}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {["Fan", "Referee", "VAR", "Rulebook"].map((personaName) => {
                        const neutralPersp = sensitivityResult.neutral.perspectives.find((p: any) => p.persona.toLowerCase().includes(personaName.toLowerCase())) || { text: "" };
                        const loadedPersp = sensitivityResult.loaded.perspectives.find((p: any) => p.persona.toLowerCase().includes(personaName.toLowerCase())) || { text: "" };
                        
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
                              border: isDivergent ? '1.5px solid rgba(234, 179, 8, 0.35)' : '1px solid rgba(255,255,255,0.04)',
                              background: isDivergent ? 'rgba(234, 179, 8, 0.02)' : 'transparent',
                              borderRadius: '8px',
                              padding: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f5f5f5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {personaName === 'Fan' && '📢 Fan'}
                                {personaName === 'Referee' && '🏃 Referee'}
                                {personaName === 'VAR' && '🖥️ VAR'}
                                {personaName === 'Rulebook' && '📖 Rulebook'}
                              </span>
                              {isDivergent && (
                                <span className="divergence-pill">
                                  ⚠️ Verdict Shifted
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                              <PerspectiveCard 
                                persona={personaName}
                                text={neutralPersp.text}
                                colorTheme={theme}
                                strength={(() => {
                                  const spread = sensitivityResult.neutral.interpretationSpread;
                                  if (!spread) return undefined;
                                  if (personaName === 'Fan') return spread.purposive;
                                  if (personaName === 'Referee') return spread.contextual;
                                  if (personaName === 'VAR') return spread.procedural;
                                  if (personaName === 'Rulebook') return spread.strict;
                                  return undefined;
                                })()}
                              />
                              <PerspectiveCard 
                                persona={personaName}
                                text={loadedPersp.text}
                                colorTheme={theme}
                                strength={(() => {
                                  const spread = sensitivityResult.loaded.interpretationSpread;
                                  if (!spread) return undefined;
                                  if (personaName === 'Fan') return spread.purposive;
                                  if (personaName === 'Referee') return spread.contextual;
                                  if (personaName === 'VAR') return spread.procedural;
                                  if (personaName === 'Rulebook') return spread.strict;
                                  return undefined;
                                })()}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Governance Payload Inspector — Separates the 4 metrics distinctly */}
                <div className="glass-panel" style={{ marginTop: '20px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px', borderRadius: '8px', background: '#121212' }}>
                  <details style={{ cursor: 'pointer' }}>
                    <summary style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 'bold', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase', color: '#EAB308', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', padding: '2px 8px', borderRadius: '3px' }}>Governance</span>
                      Inspect Inference Provenance &amp; Audit Record
                    </summary>
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>

                      <div>
                        <h4 style={{ color: '#EAB308', fontSize: '0.65rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'monospace' }}>Audit Configuration Metrics</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                          
                          {/* 1. Model Identity */}
                          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Model Identity</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, color: '#f5f5f5' }}>
                              {metadata.modelId || 'IBM Granite 13B Chat v2'}
                            </span>
                          </div>

                          {/* 2. Execution Mode */}
                          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Execution Mode</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, color: '#f5f5f5' }}>
                              {metadata.executionMode || 'Greedy / Deterministic'}
                            </span>
                          </div>

                          {/* 3. Cache Status */}
                          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Cache Status</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, color: metadata.cacheStatus === 'HIT' ? '#10B981' : '#f97316' }}>
                              {metadata.cacheStatus || 'BYPASSED'}
                            </span>
                          </div>

                          {/* 4. Connection Status */}
                          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Connection Status</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, color: metadata.connectionStatus === 'ONLINE / LIVE' ? '#10B981' : '#EAB308' }}>
                              {metadata.connectionStatus || 'ONLINE / LIVE'}
                            </span>
                          </div>

                        </div>
                      </div>

                      {/* Trace Logs Panel */}
                      {metadata.logs && metadata.logs.length > 0 && (
                        <div>
                          <h4 style={{ color: '#EAB308', fontSize: '0.65rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'monospace' }}>Active Trace Logs</h4>
                          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: 'rgba(0,0,0,0.4)', padding: '10px 14px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.78rem', margin: 0, lineHeight: '1.4', color: 'var(--text-muted)' }}>
                            {metadata.logs.join('\n')}
                          </pre>
                        </div>
                      )}

                    </div>
                  </details>
                </div>
              </>
            )}

            <button className="btn-ghost" onClick={resetToIdle} style={{ marginTop: '16px', marginInline: 'auto', display: 'block', padding: '10px 20px', fontSize: '0.85rem' }}>
              Run Another Incident Test
            </button>
          </div>
        )}

      </main>
    </div>
  );
};
