import React from 'react';
import './PerspectiveCard.css';

interface PerspectiveCardProps {
  persona: string;
  text: string;
  colorTheme?: 'referee' | 'fan' | 'var' | 'rulebook';
}

export const PerspectiveCard: React.FC<PerspectiveCardProps> = ({ persona, text, colorTheme }) => {
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

  return (
    <div className={`perspective-card glass-panel fade-in ${themeClass}`} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span className="persona-badge" style={{ alignSelf: 'flex-start' }}>{displayName}</span>
        {subLabel && (
          <span className="persona-sublabel" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
            {subLabel}
          </span>
        )}
      </div>
      <p className="perspective-text" style={{ margin: 0 }}>{text}</p>
    </div>
  );
};
