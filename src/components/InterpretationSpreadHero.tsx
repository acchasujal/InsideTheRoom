import React from 'react';
import './InterpretationSpreadHero.css';

interface InterpretationSpreadHeroProps {
  tensionTerm: string;
  ambiguityScore: number;
  spread: {
    purposive: number;
    contextual: number;
    procedural: number;
    strict: number;
  };
  isCorporate?: boolean;
}

export const InterpretationSpreadHero: React.FC<InterpretationSpreadHeroProps> = ({
  tensionTerm,
  ambiguityScore,
  spread,
  isCorporate = false,
}) => {
  const purposive = spread.purposive;
  const contextual = spread.contextual;
  const procedural = spread.procedural;
  const strict = spread.strict;

  const maxVal = Math.max(purposive, contextual, procedural, strict);
  const minVal = Math.min(purposive, contextual, procedural, strict);
  const spreadValue = maxVal - minVal;

  const getVerdictLabel = (val: number) => {
    if (val >= 70) return isCorporate ? 'VIOLATION' : 'FOUL (RED)';
    if (val <= 35) return isCorporate ? 'COMPLIANT' : 'PLAY ON';
    return isCorporate ? 'WARNING' : 'MARGINAL (YELLOW)';
  };

  const getVerdictColor = (val: number) => {
    if (val >= 70) return '#EF4444';
    if (val <= 35) return '#10B981';
    return '#EAB308';
  };

  const getVerdictClass = (val: number) => {
    if (val >= 70) return 'verdict-red';
    if (val <= 35) return 'verdict-green';
    return 'verdict-yellow';
  };

  return (
    <div className="interpretation-spread-hero glass-panel fade-in">
      {/* Top Section: Tension Term */}
      <div className="hero-term-container">
        <span className="hero-term-sub">Linguistic Tension Term</span>
        <div className="hero-term-glow-box">
          <span className="pitch-accent-line"></span>
          <span className="hero-term-text">"{tensionTerm}"</span>
          <span className="whistle-icon">🪙</span>
        </div>
        <p className="hero-term-desc">
          This governing term is undefined. The rulebook is silent here, creating discretion risk.
        </p>
      </div>

      {/* Downward Flow Line */}
      <div className="hero-flow-connector">
        <div className="connector-line"></div>
        <div className="connector-node">↓</div>
      </div>

      {/* Center Section: The Spread Infographic */}
      <div className="hero-spread-container">
        <div className="hero-spread-metrics">
          <div className="spread-metric-item">
            <span className="metric-label">Max Divergence</span>
            <span className="metric-value text-glowing-yellow">{spreadValue}pt Spread</span>
          </div>
          <div className="spread-metric-item">
            <span className="metric-label">Ambiguity Index</span>
            <span className="metric-value">{ambiguityScore}/10</span>
          </div>
        </div>

        {/* The visual gradient slider bar showing the extent of disagreement */}
        <div className="hero-spread-gauge-wrapper">
          <div className="gauge-axis-labels">
            <span>Play On / Compliant</span>
            <span>Warning</span>
            <span>Foul / Violation</span>
          </div>
          <div className="hero-spread-gauge-bar">
            {/* The spread range indicator */}
            <div 
              className="spread-range-indicator"
              style={{
                left: `${minVal}%`,
                width: `${spreadValue}%`,
              }}
            />
            {/* Persona markers on the bar */}
            <div className="persona-marker marker-fan" style={{ left: `${purposive}%` }} title={`Fan: ${purposive}%`}>📢</div>
            <div className="persona-marker marker-referee" style={{ left: `${contextual}%` }} title={`Referee: ${contextual}%`}>🏃</div>
            <div className="persona-marker marker-var" style={{ left: `${procedural}%` }} title={`VAR: ${procedural}%`}>🖥️</div>
            <div className="persona-marker marker-rulebook" style={{ left: `${strict}%` }} title={`Rulebook: ${strict}%`}>📖</div>
          </div>
        </div>
      </div>

      {/* Downward Flow Line */}
      <div className="hero-flow-connector">
        <div className="connector-line"></div>
        <div className="connector-node">↓</div>
      </div>

      {/* Bottom Section: 4 Reading Schools Infographic Cards */}
      <div className="hero-personas-grid">
        {[
          { name: 'Fan', label: 'Purposive', val: purposive, color: '#F97316', icon: '📢' },
          { name: 'Referee', label: 'Contextual', val: contextual, color: '#3B82F6', icon: '🏃' },
          { name: 'VAR', label: 'Procedural', val: procedural, color: '#10B981', icon: '🖥️' },
          { name: 'Rulebook', label: 'Strict', val: strict, color: '#8B5CF6', icon: '📖' },
        ].map((p) => (
          <div key={p.name} className="hero-persona-strip" style={{ borderLeft: `3px solid ${p.color}` }}>
            <div className="strip-header">
              <span className="strip-name">
                {p.icon} {p.name}
              </span>
              <span className={`verdict-badge ${getVerdictClass(p.val)}`}>
                {getVerdictLabel(p.val)}
              </span>
            </div>
            <span className="strip-reading">{p.label} Reading</span>
            <div className="strip-meter">
              <div className="strip-progress-bg">
                <div 
                  className="strip-progress-fill" 
                  style={{ width: `${p.val}%`, backgroundColor: getVerdictColor(p.val) }}
                />
              </div>
              <span className="strip-percentage" style={{ color: getVerdictColor(p.val) }}>
                {p.val}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
