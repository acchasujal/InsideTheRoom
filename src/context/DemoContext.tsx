import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface DemoContextType {
  currentIncidentIndex: number;
  isDemoMode: boolean;
  nextIncident: () => void;
  resetDemo: () => void;
  setDemoMode: (mode: boolean) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentIncidentIndex, setCurrentIncidentIndex] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(true);
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
    let escapeTimer: ReturnType<typeof setTimeout>;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        escapeCount++;
        clearTimeout(escapeTimer);
        
        // Require 5 presses within 2 seconds — prevents accidental reset during Q&A
        if (escapeCount >= 5) {
          resetDemo();
          escapeCount = 0;
        } else {
          escapeTimer = setTimeout(() => {
            escapeCount = 0;
          }, 2000);
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
    <DemoContext.Provider value={{ currentIncidentIndex, isDemoMode, nextIncident, resetDemo, setDemoMode: setIsDemoMode }}>
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
