import React from 'react';
import './PerspectiveCard.css';

interface PerspectiveCardProps {
  persona: string;
  text: string;
  colorTheme?: 'referee' | 'fan' | 'var' | 'rulebook';
  strength?: number;
  isGovernance?: boolean;
  shiftType?: 'verdict' | 'confidence' | 'interpretation';
}

export const PerspectiveCard: React.FC<PerspectiveCardProps> = ({ persona, text, colorTheme, strength, isGovernance, shiftType }) => {
  const lowerPersona = persona.toLowerCase();
  let displayName = persona.split('—')[0].split('-')[0].trim();
  let subLabel = "Reading";

  if (isGovernance) {
    if (lowerPersona.includes('fan') || lowerPersona.includes('purposive')) {
      displayName = "Purposive Reading";
      subLabel = "Human Intent Lens";
    } else if (lowerPersona.includes('referee') || lowerPersona.includes('contextual')) {
      displayName = "Contextual Reading";
      subLabel = "Context Lens";
    } else if (lowerPersona.includes('var') || lowerPersona.includes('procedural')) {
      displayName = "Procedural Reading";
      subLabel = "Process Lens";
    } else if (lowerPersona.includes('rulebook') || lowerPersona.includes('strict')) {
      displayName = "Strict Constructionist";
      subLabel = "Literal Rule Lens";
    }
  } else {
    if (lowerPersona.includes('fan')) {
      displayName = "Fan";
      subLabel = "Purposive / Intent-Based";
    } else if (lowerPersona.includes('referee')) {
      displayName = "Referee";
      subLabel = "Contextual / Textualist";
    } else if (lowerPersona.includes('var')) {
      displayName = "VAR";
      subLabel = "Procedural-Threshold";
    } else if (lowerPersona.includes('rulebook')) {
      displayName = "Rulebook";
      subLabel = "Strict Constructionist";
    }
  }

  // Choose Icon SVG type based on persona name
  const getIconType = () => {
    const lower = persona.toLowerCase();
    if (lower.includes('fan') || lower.includes('purposive')) return 'fan';
    if (lower.includes('referee') || lower.includes('contextual')) return 'referee';
    if (lower.includes('var') || lower.includes('procedural')) return 'var';
    if (lower.includes('rulebook') || lower.includes('strict')) return 'rulebook';
    return lower;
  };

  // Choose Icon SVG
  const renderIcon = () => {
    switch (getIconType()) {
      case 'fan':
        return (
          <svg className="card-icon icon-fan" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        );
      case 'referee':
        return (
          <svg className="card-icon icon-referee" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="3" width="14" height="18" rx="2" ry="2" fill="currentColor" opacity="0.1"></rect>
            <path d="M17.5 10.5h3M6.5 10.5h3M12 3v18"></path>
          </svg>
        );
      case 'var':
        return (
          <svg className="card-icon icon-var" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        );
      case 'rulebook':
        return (
          <svg className="card-icon icon-rulebook" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  // Determine Verdict and Badge styling
  const getVerdict = () => {
    const s = strength ?? 50;
    const isCorporate = text.toLowerCase().includes('employee') || 
                        text.toLowerCase().includes('compliance') || 
                        text.toLowerCase().includes('policy') ||
                        text.toLowerCase().includes('fiduciary') || 
                        text.toLowerCase().includes('corporate') ||
                        text.toLowerCase().includes('disclosure');

    if (s >= 70) {
      return {
        label: isCorporate ? 'VIOLATION' : 'FOUL / RED',
        className: 'verdict-red',
        color: '#EF4444',
      };
    } else if (s <= 35) {
      return {
        label: isCorporate ? 'COMPLIANT' : 'PLAY ON',
        className: 'verdict-green',
        color: '#10B981',
      };
    } else {
      return {
        label: isCorporate ? 'WARNING' : 'MARGINAL',
        className: 'verdict-yellow',
        color: '#EAB308',
      };
    }
  };

  const verdict = getVerdict();

  return (
    <div className={`perspective-card compact-perspective-card theme-${colorTheme || 'default'} fade-in`}>
      <div className="card-top-row">
        <div className="persona-info">
          <div className="icon-wrapper">
            {renderIcon()}
          </div>
          <div className="persona-meta">
            <span className="persona-name">{displayName}</span>
            <span className="reading-type">{subLabel}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {shiftType === 'verdict' && (
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 800,
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              border: '1.5px solid #EF4444',
              padding: '2px 6px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'monospace',
              display: 'inline-block'
            }}>
              ⚠️ Verdict Changed
            </span>
          )}
          {shiftType === 'confidence' && (
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 800,
              background: 'rgba(234, 179, 8, 0.1)',
              color: '#EAB308',
              border: '1.5px solid #EAB308',
              padding: '2px 6px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'monospace',
              display: 'inline-block'
            }}>
              🔄 Confidence Shift
            </span>
          )}
          {shiftType === 'interpretation' && (
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 800,
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#3B82F6',
              border: '1.5px solid #3B82F6',
              padding: '2px 6px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'monospace',
              display: 'inline-block'
            }}>
              🔀 Interpretation Shift
            </span>
          )}
          <div className={`verdict-badge ${verdict.className}`}>
            {verdict.label}
          </div>
        </div>
      </div>

      <div className="card-middle-row">
        <p className="concise-summary">{text}</p>
      </div>

      {strength !== undefined && (
        <div className="card-bottom-row">
          <div className="confidence-meter-container">
            <span className="confidence-label">Confidence</span>
            <span className="confidence-value" style={{ color: verdict.color }}>{strength}%</span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${strength}%`, 
                backgroundColor: verdict.color 
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
