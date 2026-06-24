import React from 'react';
import { LawViewer } from './LawViewer';
import { PerspectiveCard } from './PerspectiveCard';
import './RevealSection.css';

interface RevealSectionProps {
  lawText: string;
  lawCitation: string;
  highlightTerms: string[];
  explanation: string;
  tensionTerm: string;
  isVisible: boolean;
}

export const RevealSection: React.FC<RevealSectionProps> = ({ 
  lawText, 
  lawCitation, 
  highlightTerms, 
  explanation, 
  tensionTerm,
  isVisible 
}) => {
  if (!isVisible) return null;

  return (
    <div className="reveal-section fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h3 className="tension-header" style={{ 
          fontSize: '1.75rem', 
          fontWeight: 700, 
          letterSpacing: '1px', 
          color: 'var(--text-primary)',
          margin: '0 0 16px 0',
          textTransform: 'uppercase'
        }}>
          Structural Tension Point
        </h3>
        
        {/* Amber Badge */}
        <div style={{ 
          display: 'inline-block', 
          background: 'rgba(234, 179, 8, 0.1)', 
          color: '#EAB308', 
          border: '1px solid rgba(234, 179, 8, 0.3)', 
          padding: '6px 16px', 
          borderRadius: '4px', 
          fontFamily: 'monospace', 
          fontSize: '0.85rem', 
          fontWeight: 'bold', 
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          Undefined Term: "{tensionTerm}"
        </div>
      </div>

      <LawViewer 
        lawText={lawText} 
        lawCitation={lawCitation} 
        highlightTerms={highlightTerms}
        animateReveal={true}
      />
      
      {/* Rulebook Persona Card rendered inside Tension section */}
      <div style={{ marginTop: '8px' }}>
        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>
          Law-Text Anchor
        </h4>
        <PerspectiveCard 
          persona="Rulebook" 
          text={lawText} 
          colorTheme="rulebook" 
        />
      </div>

      <div className="reveal-explanation fade-in-delayed" style={{ 
        borderLeft: '4px solid #EAB308', 
        paddingLeft: '20px', 
        background: 'rgba(255,255,255,0.01)',
        paddingTop: '12px',
        paddingBottom: '12px',
        borderRadius: '0 8px 8px 0'
      }}>
        <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
          {explanation}
        </p>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', display: 'block', fontStyle: 'italic' }}>
          IBM Granite has surfaced the discretion boundary.
        </span>
      </div>
    </div>
  );
};
