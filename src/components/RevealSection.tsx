import React from 'react';
import { LawViewer } from './LawViewer';
import './RevealSection.css';

interface RevealSectionProps {
  lawText: string;
  lawCitation: string;
  undefinedTerm: string;
  explanation: string;
  isVisible: boolean;
}

export const RevealSection: React.FC<RevealSectionProps> = ({ 
  lawText, 
  lawCitation, 
  undefinedTerm, 
  explanation, 
  isVisible 
}) => {
  if (!isVisible) return null;

  return (
    <div className="reveal-section fade-in">
      <LawViewer 
        lawText={lawText} 
        lawCitation={lawCitation} 
        highlightTerm={undefinedTerm}
        animateReveal={true}
      />
      
      <div className="reveal-explanation fade-in-delayed">
        <p>{explanation}</p>
      </div>
    </div>
  );
};
