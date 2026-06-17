import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface DemoContextType {
  currentIncidentIndex: number;
  nextIncident: () => void;
  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentIncidentIndex, setCurrentIncidentIndex] = useState(0);
  const navigate = useNavigate();

  const resetDemo = () => {
    setCurrentIncidentIndex(0);
    navigate('/');
  };

  const nextIncident = () => {
    setCurrentIncidentIndex(prev => prev + 1);
  };

  useEffect(() => {
    let escapeCount = 0;
    let escapeTimer: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        escapeCount++;
        clearTimeout(escapeTimer);
        
        if (escapeCount >= 3) {
          resetDemo();
          escapeCount = 0;
        } else {
          escapeTimer = setTimeout(() => {
            escapeCount = 0;
          }, 1000); // Must press 3 times within 1 second
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(escapeTimer);
    };
  }, [navigate]);

  return (
    <DemoContext.Provider value={{ currentIncidentIndex, nextIncident, resetDemo }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
