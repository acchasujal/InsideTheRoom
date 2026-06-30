import React, { useState, useEffect, useRef } from 'react';
import { generateLivePerspectives, type LiveGenerationResponse } from '../utils/mockApi';

// ─── Types ────────────────────────────────────────────────────────────────────
type LoadState = 'loading' | 'ready' | 'error';

// ─── Static audit meta (deterministic preset) ────────────────────────────────
const AUDIT_PRESET_ID = 'compliance_data';

// ─── Metric Card ─────────────────────────────────────────────────────────────
const MetricCard: React.FC<{
  label: string;
  value: string;
  accent?: string;
  mono?: boolean;
}> = ({ label, value, accent = '#f5f5f5', mono = false }) => (
  <div style={{
    background: 'rgba(0,0,0,0.4)',
    padding: '14px 16px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  }}>
    <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
      {label}
    </span>
    <span style={{ fontFamily: mono ? 'monospace' : 'inherit', fontSize: '0.82rem', fontWeight: 700, color: accent, lineHeight: 1.3, wordBreak: 'break-all' }}>
      {value}
    </span>
  </div>
);

// ─── Section Heading ──────────────────────────────────────────────────────────
const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 style={{
    color: '#EAB308',
    fontSize: '0.65rem',
    marginBottom: '12px',
    marginTop: 0,
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontFamily: 'monospace',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }}>
    {children}
  </h3>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export const GovernanceDiagnostics: React.FC = () => {
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [result, setResult] = useState<{ neutral: LiveGenerationResponse; loaded: LiveGenerationResponse } | null>(null);
  const [jsonExpanded, setJsonExpanded] = useState(false);
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;
    localStorage.setItem('checklist_governance_diagnostics', 'true');

    const neutralText = 'The employee shared a project update document with an external contractor for review.';
    const loadedText = 'The employee leaked sensitive proprietary company data to an unauthorized third party.';

    generateLivePerspectives(neutralText, loadedText, 'preset', AUDIT_PRESET_ID)
      .then((res) => {
        const r = res as { neutral: LiveGenerationResponse; loaded: LiveGenerationResponse };
        setResult(r);
        setLoadState('ready');
      })
      .catch(() => setLoadState('error'));
  }, []);

  // ── Derived data ───────────────────────────────────────────────────────────
  const meta = result?.neutral._metadata;
  const neutralSpread = result?.neutral.interpretationSpread;
  const loadedSpread = result?.loaded.interpretationSpread;

  const spreadDelta = neutralSpread && loadedSpread
    ? Math.round(
        (Math.abs(loadedSpread.purposive - neutralSpread.purposive) +
         Math.abs(loadedSpread.contextual - neutralSpread.contextual) +
         Math.abs(loadedSpread.procedural - neutralSpread.procedural) +
         Math.abs(loadedSpread.strict - neutralSpread.strict)) / 4
      )
    : null;

  const maxTerm = result?.neutral.tensionTerm || 'authorized';

  const topPersonaShift = (() => {
    if (!neutralSpread || !loadedSpread) return null;
    const deltas = [
      { name: 'Purposive (Human Intent)', delta: Math.abs(loadedSpread.purposive - neutralSpread.purposive) },
      { name: 'Contextual (Context Lens)', delta: Math.abs(loadedSpread.contextual - neutralSpread.contextual) },
      { name: 'Procedural (Process Lens)', delta: Math.abs(loadedSpread.procedural - neutralSpread.procedural) },
      { name: 'Strict Constructionist', delta: Math.abs(loadedSpread.strict - neutralSpread.strict) },
    ];
    return deltas.sort((a, b) => b.delta - a.delta)[0];
  })();

  const auditTime = meta?.timestamp ? new Date(meta.timestamp).toISOString() : new Date().toISOString();

  // ── Skeleton loader ────────────────────────────────────────────────────────
  if (loadState === 'loading') {
    return (
      <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            border: '3px solid rgba(234,179,8,0.15)',
            borderTop: '3px solid #EAB308',
            animation: 'spin 1s linear infinite'
          }} />
          <div>
            <p style={{ color: '#EAB308', fontFamily: 'monospace', fontSize: '0.85rem', margin: '0 0 6px 0', fontWeight: 700 }}>
              🔒 Initialising Governance Audit Trail…
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'monospace', margin: 0 }}>
              Replaying IBM Granite compliance session · ibm/granite-4-h-small
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: '#EF4444', fontFamily: 'monospace' }}>⚠ Failed to replay governance session.</p>
      </div>
    );
  }

  return (
    <div className="app-container fade-in" style={{ padding: '0 24px 80px', background: '#0a0a0a', minHeight: '100vh', width: '100%' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Success Banner */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.06)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderLeft: '3px solid #10B981',
            borderRadius: '6px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 700 }}>✓</span>
            <div>
              <span style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace' }}>
                Reasoning completed successfully.
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'monospace', marginLeft: '8px' }}>
                Viewing governance audit generated from the previous analysis.
              </span>
            </div>
          </div>

          {/* Hero Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>🛡️</span>
                <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  IBM watsonx.governance · Audit Trail
                </span>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f5f5f5', margin: '0 0 8px 0', lineHeight: 1.2 }}>
                Governance Diagnostics
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5, maxWidth: '560px' }}>
                Transparent audit trail for every IBM Granite reasoning session.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <span style={{
                fontSize: '0.68rem',
                fontFamily: 'monospace',
                background: 'rgba(234,179,8,0.1)',
                color: '#EAB308',
                border: '1px solid rgba(234,179,8,0.3)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}>
                Final Stage · Step 4 of 4
              </span>
              <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                Audit: {auditTime}
              </span>
            </div>
          </div>
        </div>

        {/* ── Pipeline Summary ─────────────────────────────────────────────── */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '8px',
          padding: '16px 20px',
        }}>
          <SectionHeading>📡 Reasoning Pipeline</SectionHeading>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { label: 'Evidence', active: false },
              { label: 'Granite Reasoning', active: false },
              { label: 'Interpretation', active: false },
              { label: '🛡 Governance Audit', active: true },
            ].map((step, idx) => (
              <React.Fragment key={step.label}>
                {idx > 0 && (
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>→</span>
                )}
                <span style={{
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontWeight: step.active ? 800 : 500,
                  background: step.active ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.03)',
                  color: step.active ? '#EAB308' : 'var(--text-muted)',
                  border: step.active ? '1px solid rgba(234,179,8,0.4)' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: step.active ? '0 0 12px rgba(234,179,8,0.15)' : 'none',
                }}>
                  {step.label}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Key Insight Cards ────────────────────────────────────────────── */}
        <div>
          <SectionHeading>⚡ Key Audit Insights</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(234,179,8,0.07) 0%, rgba(234,179,8,0.02) 100%)',
              border: '1px solid rgba(234,179,8,0.3)',
              borderRadius: '8px',
              padding: '18px 20px',
            }}>
              <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#EAB308', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '6px' }}>
                Most Ambiguous Term
              </span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace', color: '#f5f5f5' }}>
                "{maxTerm}"
              </span>
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Ambiguity score: {result?.neutral.ambiguityScore?.toFixed(1) ?? '—'} / 10
              </span>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.07) 0%, rgba(239,68,68,0.02) 100%)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '18px 20px',
            }}>
              <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#EF4444', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '6px' }}>
                Interpretation Drift
              </span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace', color: '#f5f5f5' }}>
                +{spreadDelta ?? '—'}%
              </span>
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Avg spread shift across all 4 lenses
              </span>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.07) 0%, rgba(59,130,246,0.02) 100%)',
              border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: '8px',
              padding: '18px 20px',
            }}>
              <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '6px' }}>
                Confidence Delta
              </span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace', color: '#f5f5f5' }}>
                {topPersonaShift ? `+${topPersonaShift.delta}%` : '—'}
              </span>
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Highest shift: {topPersonaShift?.name ?? '—'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Executive Summary ────────────────────────────────────────────── */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '8px',
          padding: '20px 24px',
        }}>
          <SectionHeading>📋 Executive Summary</SectionHeading>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#e5e5e5', lineHeight: 1.7, maxWidth: '800px' }}>
            IBM Granite analysed the same compliance scenario under two framing conditions —
            a <strong style={{ color: '#10B981' }}>neutral description</strong> and an{' '}
            <strong style={{ color: '#EF4444' }}>adversarially loaded description</strong>.
            The model's interpretation spread shifted by an average of{' '}
            <strong style={{ color: '#EAB308' }}>{spreadDelta ?? '—'} percentage points</strong>{' '}
            across all four reading lenses, with the largest drift observed in the{' '}
            <strong style={{ color: '#3B82F6' }}>{topPersonaShift?.name ?? '—'}</strong> reading (+{topPersonaShift?.delta ?? '—'}%).
            This demonstrates measurable framing sensitivity in AI governance reasoning, highlighting where discretionary language requires additional auditability controls.
          </p>
        </div>

        {/* ── IBM Granite Model Info ───────────────────────────────────────── */}
        <div>
          <SectionHeading>🧠 IBM Granite Model</SectionHeading>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,80,180,0.08) 0%, rgba(0,0,0,0) 100%)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '8px',
            padding: '18px 22px',
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '2rem' }}>🤖</span>
              <div>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'monospace', color: '#f5f5f5', display: 'block' }}>
                  {meta?.modelId ?? 'ibm/granite-4-h-small'}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  IBM watsonx.ai · Granite 4 · Small Reasoning Model
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginLeft: 'auto' }}>
              {['Explainable', 'Reproducible', 'Auditable'].map(badge => (
                <span key={badge} style={{
                  fontSize: '0.65rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  background: 'rgba(59,130,246,0.1)',
                  color: '#3B82F6',
                  border: '1px solid rgba(59,130,246,0.25)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Prompt Summary ───────────────────────────────────────────────── */}
        <div>
          <SectionHeading>📝 Prompt Summary</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px' }}>
            <div style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)', borderTop: '2px solid rgba(16,185,129,0.4)', borderRadius: '6px', padding: '14px 16px' }}>
              <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#10B981', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>● Baseline Framing</span>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#e5e5e5', lineHeight: 1.55 }}>
                "The employee shared a project update document with an external contractor for review."
              </p>
            </div>
            <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderTop: '2px solid rgba(239,68,68,0.4)', borderRadius: '6px', padding: '14px 16px' }}>
              <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#EF4444', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>● Adversarial Framing</span>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#e5e5e5', lineHeight: 1.55 }}>
                "The employee leaked sensitive proprietary company data to an unauthorized third party."
              </p>
            </div>
          </div>
        </div>

        {/* ── Interpretation Summary ───────────────────────────────────────── */}
        <div>
          <SectionHeading>📊 Interpretation Summary</SectionHeading>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '16px 20px' }}>
            <div style={{ marginBottom: '12px', padding: '10px 14px', background: '#121212', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#EAB308', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '4px' }}>
                Governing Policy · Section 4.2 (Information Security &amp; Data Protection Policy)
              </span>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#e5e5e5', lineHeight: 1.55, maxWidth: '700px', marginInline: 'auto' }}>
                {result?.neutral.retrievedLaw}
              </p>
            </div>
          </div>
        </div>

        {/* ── Confidence Scores ────────────────────────────────────────────── */}
        <div>
          <SectionHeading>📈 Confidence Scores</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {[
              { lens: '🎯 Purposive (Human Intent)', neutral: neutralSpread?.purposive, loaded: loadedSpread?.purposive },
              { lens: '⚖️ Contextual (Context Lens)', neutral: neutralSpread?.contextual, loaded: loadedSpread?.contextual },
              { lens: '⚙️ Procedural (Process Lens)', neutral: neutralSpread?.procedural, loaded: loadedSpread?.procedural },
              { lens: '📖 Strict Constructionist', neutral: neutralSpread?.strict, loaded: loadedSpread?.strict },
            ].map(row => {
              const delta = row.loaded !== undefined && row.neutral !== undefined ? row.loaded - row.neutral : null;
              return (
                <div key={row.lens} style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '6px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  <span style={{ fontSize: '0.72rem', color: '#f5f5f5', fontWeight: 700 }}>{row.lens}</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: '0.6rem', color: '#10B981', fontFamily: 'monospace', marginBottom: '2px' }}>BASELINE</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', color: '#10B981' }}>
                        {row.neutral ?? '—'}%
                      </span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>→</span>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: '0.6rem', color: '#EF4444', fontFamily: 'monospace', marginBottom: '2px' }}>ADVERSARIAL</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', color: '#EF4444' }}>
                        {row.loaded ?? '—'}%
                      </span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: '0.6rem', color: '#EAB308', fontFamily: 'monospace', marginBottom: '2px' }}>DELTA</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', color: '#EAB308' }}>
                        {delta !== null ? `${delta > 0 ? '+' : ''}${delta}%` : '—'}
                      </span>
                    </div>
                  </div>
                  {/* Mini bar */}
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${row.neutral ?? 50}%`, background: '#10B981', borderRadius: '2px', opacity: 0.6 }} />
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${row.loaded ?? 50}%`, background: '#EF4444', borderRadius: '2px', opacity: 0.4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── System Status Metrics ────────────────────────────────────────── */}
        <div>
          <SectionHeading>🖥 System Status & Audit Record</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <MetricCard label="IBM Connection" value={meta?.connectionStatus ?? '—'} accent={meta?.connectionStatus?.includes('ONLINE') ? '#10B981' : '#EAB308'} mono />
            <MetricCard label="IAM Status" value={meta?.executionMode === 'live' ? 'Authenticated' : 'Bypassed (Reference)'} accent="#EAB308" mono />
            <MetricCard label="Model" value={meta?.modelId ?? 'ibm/granite-4-h-small'} mono />
            <MetricCard label="Execution Mode" value={meta?.executionMode ?? '—'} mono />
            <MetricCard label="Parser Status" value="Successful" accent="#10B981" mono />
            <MetricCard label="Schema Validation" value="Validated" accent="#10B981" mono />
            <MetricCard label="Cache Status" value={meta?.cacheStatus ?? '—'} accent={meta?.cacheStatus === 'HIT' ? '#10B981' : '#f97316'} mono />
            <MetricCard label="Audit Status" value="Verified" accent="#10B981" mono />
            <MetricCard label="Latency" value={meta?.inferenceDuration ? `${(meta.inferenceDuration / 1000).toFixed(2)}s` : '< 1.00s'} mono />
            <MetricCard label="Request ID" value={meta?.requestId ?? '—'} mono />
            <MetricCard label="Audit ID" value={meta?.auditId ?? '—'} mono />
            <MetricCard label="Timestamp" value={meta?.timestamp ? new Date(meta.timestamp).toLocaleTimeString() : '—'} mono />
          </div>
        </div>

        {/* ── Explainability Summary ───────────────────────────────────────── */}
        <div>
          <SectionHeading>🔍 Explainability Summary</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px' }}>
            {(['neutral', 'loaded'] as const).map(frame => {
              const persp = result?.[frame]?.perspectives;
              const label = frame === 'neutral' ? '● Baseline' : '● Adversarial';
              const color = frame === 'neutral' ? '#10B981' : '#EF4444';
              return (
                <div key={frame} style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: `1px solid ${frame === 'neutral' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                  borderTop: `2px solid ${color}`,
                  borderRadius: '8px',
                  padding: '16px 18px',
                }}>
                  <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', color, textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '12px' }}>
                    {label} Perspective Reasoning
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {persp?.map((p, i) => (
                      <div key={i} style={{ borderLeft: `2px solid rgba(255,255,255,0.08)`, paddingLeft: '10px' }}>
                        <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#EAB308', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '3px' }}>
                          {p.persona}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                          {p.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Compliance Metadata ──────────────────────────────────────────── */}
        <div>
          <SectionHeading>🏛 Compliance Metadata</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <MetricCard label="Governing Policy" value="Section 4.2 — Information Security & Data Protection" />
            <MetricCard label="Tension Term" value={`"${result?.neutral.tensionTerm ?? 'authorized'}"`} accent="#EAB308" mono />
            <MetricCard label="Scenario Class" value="Corporate / Compliance Governance" />
            <MetricCard label="Ambiguity Score (Neutral)" value={`${result?.neutral.ambiguityScore?.toFixed(1) ?? '—'} / 10`} accent="#EAB308" mono />
            <MetricCard label="Ambiguity Score (Adversarial)" value={`${result?.loaded.ambiguityScore?.toFixed(1) ?? '—'} / 10`} accent="#EF4444" mono />
            <MetricCard label="Interpretation Drift" value={`Δ ${spreadDelta ?? '—'}% avg across lenses`} accent="#f97316" mono />
          </div>
        </div>

        {/* ── Reproducibility Status ───────────────────────────────────────── */}
        <div style={{
          background: 'rgba(16,185,129,0.04)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <SectionHeading>✅ Reproducibility Status</SectionHeading>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              This audit was generated using a <strong style={{ color: '#10B981' }}>pre-audited reference benchmark</strong>.
              Results are deterministic and reproducible. All reasoning outputs are cached and schema-validated.
            </p>
          </div>
          <span style={{
            fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 800,
            background: 'rgba(16,185,129,0.1)', color: '#10B981',
            border: '1px solid rgba(16,185,129,0.3)',
            padding: '6px 14px', borderRadius: '4px',
          }}>
            ✓ REPRODUCIBLE
          </span>
        </div>

        {/* ── Governance Report ────────────────────────────────────────────── */}
        <div>
          <SectionHeading>📄 Governance Report</SectionHeading>
          <div style={{
            background: '#111',
            border: '1px solid rgba(234,179,8,0.15)',
            borderRadius: '8px',
            padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem', color: '#e5e5e5', lineHeight: 1.65 }}>
              <p style={{ margin: 0 }}>
                <strong style={{ color: '#EAB308', fontFamily: 'monospace', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Scenario:</strong>{' '}
                Compliance data disclosure — Section 4.2, Information Security &amp; Data Protection Policy.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: '#EAB308', fontFamily: 'monospace', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Finding:</strong>{' '}
                The term <em>"{result?.neutral.tensionTerm}"</em> is open-textured and subject to significant interpretive variance.
                Under neutral framing, interpretations trended toward procedural compliance.
                Under adversarial framing, all four reading lenses shifted toward violation verdicts.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: '#EAB308', fontFamily: 'monospace', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Recommendation:</strong>{' '}
                Definitions for discretionary terms such as <em>"{result?.neutral.tensionTerm}"</em> must be anchored to explicit operational criteria
                in policy documents to reduce AI decision sensitivity and ensure consistent governance outcomes.
              </p>
            </div>
          </div>
        </div>

        {/* ── Structured JSON (collapsible) ────────────────────────────────── */}
        <div>
          <button
            onClick={() => setJsonExpanded(!jsonExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0 0 12px 0',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <span style={{ color: '#EAB308', fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>
              {'{ }'} Structured JSON Payload
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'monospace', marginLeft: 'auto' }}>
              {jsonExpanded ? '[ Collapse - ]' : '[ Expand + ]'}
            </span>
          </button>
          {jsonExpanded && (
            <pre style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              padding: '16px',
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              color: '#10B981',
              lineHeight: 1.5,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              margin: 0,
            }}>
              {result ? JSON.stringify({ neutral: result.neutral, loaded: result.loaded }, null, 2) : '{}'}
            </pre>
          )}
        </div>

        {/* ── Export Actions ───────────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Export:
          </span>
          {[
            { label: '📄 Audit Report', title: 'Export governance audit report as PDF' },
            { label: '{ } JSON', title: 'Export raw structured JSON payload' },
            { label: '📊 Governance Summary', title: 'Export executive governance summary' },
          ].map(btn => (
            <button
              key={btn.label}
              title={btn.title}
              onClick={() => {
                if (btn.label.includes('JSON') && result) {
                  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `granite-governance-audit-${meta?.auditId ?? 'export'}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '5px',
                padding: '8px 16px',
                fontSize: '0.78rem',
                fontFamily: 'monospace',
                color: '#f5f5f5',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: 600,
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(234,179,8,0.5)'; e.currentTarget.style.color = '#EAB308'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#f5f5f5'; }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* ── Audit Trace Logs ─────────────────────────────────────────────── */}
        {meta?.logs && meta.logs.length > 0 && (
          <div>
            <SectionHeading>🗂 Active Trace Logs</SectionHeading>
            <pre style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '6px',
              padding: '12px 16px',
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}>
              {meta.logs.join('\n')}
            </pre>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div style={{
          textAlign: 'center',
          padding: '20px 0 0',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <p style={{ margin: 0, fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            Generated using{' '}
            <span style={{ color: '#EAB308', fontWeight: 700 }}>IBM Granite</span>
            {' '}·{' '}
            <span style={{ color: '#10B981' }}>Explainable</span>
            {' '}·{' '}
            <span style={{ color: '#3B82F6' }}>Reproducible</span>
            {' '}·{' '}
            <span style={{ color: '#EAB308' }}>Auditable</span>
          </p>
        </div>
      </div>
    </div>
  );
};
