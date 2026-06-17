import React from 'react';
import './PerspectiveCard.css';

interface PerspectiveCardProps {
  persona: string;
  text: string;
  colorTheme?: 'referee' | 'fan' | 'var' | 'rulebook';
}

export const PerspectiveCard: React.FC<PerspectiveCardProps> = ({ persona, text, colorTheme }) => {
  const themeClass = colorTheme ? `theme-${colorTheme}` : 'theme-default';

  return (
    <div className={`perspective-card glass-panel fade-in ${themeClass}`}>
      <span className="persona-badge">{persona}</span>
      <p className="perspective-text">{text}</p>
    </div>
  );
};
