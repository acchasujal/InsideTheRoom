import React from 'react';
import './PerspectiveCard.css';

interface PerspectiveCardProps {
  persona: string;
  text: string;
  colorTheme?: 'referee' | 'fan' | 'var' | 'rulebook';
  strength?: number;
}

export const PerspectiveCard: React.FC<PerspectiveCardProps> = ({ persona, text, colorTheme, strength }) => {
  const themeClass = colorTheme ? `theme-${colorTheme}` : 'theme-default';

  const lowerPersona = persona.toLowerCase();
  let displayName = persona.split('—')[0].split('-')[0].trim();
  let subLabel = "";

  if (lowerPersona.includes('fan')) {
    displayName = "Fan";
    subLabel = "Purposive Reading";
  } else if (lowerPersona.includes('referee')) {
    displayName = "Referee";
    subLabel = "Contextual Reading";
  } else if (lowerPersona.includes('var')) {
    displayName = "VAR";
    subLabel = "Procedural Reading";
  } else if (lowerPersona.includes('rulebook')) {
    displayName = "Rulebook";
    subLabel = "Strict Constructionist Reading";
  }

  const getThemeColor = (theme?: string) => {
    switch (theme) {
      case 'referee': return '#3B82F6';
      case 'fan': return '#F97316';
      case 'var': return '#10B981';
      case 'rulebook': return '#8B5CF6';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div 
      className={`perspective-card glass-panel fade-in ${themeClass}`} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderLeft: `4px solid ${getThemeColor(colorTheme)}`,
        background: 'rgba(255, 255, 255, 0.01)',
        padding: '16px',
        borderRadius: '6px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'left'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ 
            fontSize: '0.68rem', 
            fontFamily: 'monospace', 
            color: 'var(--text-muted)', 
            textTransform: 'uppercase', 
            letterSpacing: '1px' 
          }}>
            Identity Persona
          </span>
          <span style={{ 
            fontSize: '1rem', 
            fontWeight: 800, 
            color: getThemeColor(colorTheme),
            fontFamily: 'monospace'
          }}>
            {displayName}
          </span>
        </div>
        <span style={{ 
          fontSize: '0.6rem', 
          fontFamily: 'monospace', 
          background: 'rgba(255,255,255,0.05)', 
          color: 'var(--text-muted)', 
          padding: '2px 6px', 
          borderRadius: '3px',
          letterSpacing: '0.5px'
        }}>
          AUDITED
        </span>
      </div>

      <div style={{ borderTop: '1px dashed rgba(255,255,255,0.07)', margin: '4px 0' }} />

      <p className="perspective-text" style={{ 
        margin: 0, 
        fontSize: '0.92rem', 
        lineHeight: '1.5',
        color: 'var(--text-primary)' 
      }}>
        {text}
      </p>

      {strength !== undefined && (
        <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {subLabel || 'Perspective Strength'}
            </span>
            <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 'bold', color: getThemeColor(colorTheme) }}>
              {strength}%
            </span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${strength}%`, background: getThemeColor(colorTheme), borderRadius: '2px' }} />
          </div>
        </div>
      )}
    </div>
  );
};
