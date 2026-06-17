import React, { useState } from 'react';
import './DecisionPanel.css';

interface DecisionPanelProps {
  title: string;
  options: string[];
  onSelect: (option: string) => void;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({ title, options, onSelect }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    setSelected(option);
    // Add brief visual delay before bubbling up
    setTimeout(() => onSelect(option), 600);
  };

  return (
    <div className="decision-panel fade-in">
      <h3>{title}</h3>
      <div className="options-group">
        {options.map((option) => (
          <button 
            key={option} 
            className={`btn-decision ${selected === option ? 'selected' : selected ? 'dimmed' : ''}`}
            onClick={() => !selected && handleSelect(option)}
            disabled={!!selected}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};
