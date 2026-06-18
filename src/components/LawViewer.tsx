import React, { useEffect, useState } from 'react';
import './LawViewer.css';

interface LawViewerProps {
  lawText: string;
  lawCitation: string;
  highlightTerms?: string[];
  animateReveal?: boolean;
}

export const LawViewer: React.FC<LawViewerProps> = ({ lawText, lawCitation, highlightTerms = [], animateReveal = false }) => {
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
    if (!highlightTerms || highlightTerms.length === 0) return lawText;

    // Build a regex that matches any of the highlight terms
    const escapedTerms = highlightTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
    
    const parts = lawText.split(regex);
    
    return parts.map((part, index) => {
      const isMatch = highlightTerms.some(term => term.toLowerCase() === part.toLowerCase());
      return isMatch ? (
        <span key={index} className={`reveal-target ${isRevealed ? 'highlighted' : ''}`}>
          {part}
        </span>
      ) : (
        part
      );
    });
  };

  return (
    <div className={`law-viewer glass-panel ${isRevealed ? 'revealed-state' : ''}`}>
      <div className="law-citation">{lawCitation}</div>
      <p className="mono law-text">{renderText()}</p>
    </div>
  );
};
