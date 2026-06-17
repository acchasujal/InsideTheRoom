import React, { useEffect, useState } from 'react';
import './LawViewer.css';

interface LawViewerProps {
  lawText: string;
  lawCitation: string;
  highlightTerm?: string;
  animateReveal?: boolean;
}

export const LawViewer: React.FC<LawViewerProps> = ({ lawText, lawCitation, highlightTerm, animateReveal = false }) => {
  const [isRevealed, setIsRevealed] = useState(!animateReveal);

  useEffect(() => {
    if (animateReveal) {
      const timer = setTimeout(() => {
        setIsRevealed(true);
      }, 1000); // 1.0s delay as per UI specs
      return () => clearTimeout(timer);
    }
  }, [animateReveal]);

  const renderText = () => {
    if (!highlightTerm) return lawText;

    const parts = lawText.split(new RegExp(`(${highlightTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlightTerm.toLowerCase() ? (
        <span key={index} className={`reveal-target ${isRevealed ? 'highlighted' : ''}`}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className={`law-viewer glass-panel ${isRevealed ? 'revealed-state' : ''}`}>
      <div className="law-citation">{lawCitation}</div>
      <p className="mono law-text">{renderText()}</p>
    </div>
  );
};
