import React from 'react';
import { LawViewer } from './LawViewer';
import './RevealSection.css';

interface RevealSectionProps {
  lawText: string;
  lawCitation: string;
  highlightTerms: string[];
  explanation: string;
  isVisible: boolean;
}

export const RevealSection: React.FC<RevealSectionProps> = ({ 
  lawText, 
  lawCitation, 
  highlightTerms, 
  explanation, 
  isVisible 
}) => {
  if (!isVisible) return null;

  return (
    <div className="reveal-section fade-in">
      <LawViewer 
        lawText={lawText} 
        lawCitation={lawCitation} 
        highlightTerms={highlightTerms}
        animateReveal={true}
      />
      
      <div className="reveal-explanation fade-in-delayed">
        <p>{explanation}</p>
      </div>
    </div>
  );
};
