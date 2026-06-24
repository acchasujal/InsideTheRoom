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
  const [currentIncidentIndex, setCurrentIncidentIndex] = useState(() => {
    const saved = localStorage.getItem('demo_currentIncidentIndex');
    return saved !== null ? parseInt(saved, 10) : 0;
  });
  const [isDemoMode, setIsDemoMode] = useState(() => {
    const saved = localStorage.getItem('demo_isDemoMode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('demo_currentIncidentIndex', currentIncidentIndex.toString());
  }, [currentIncidentIndex]);

  useEffect(() => {
    localStorage.setItem('demo_isDemoMode', JSON.stringify(isDemoMode));
  }, [isDemoMode]);

  const resetDemo = () => {
    setCurrentIncidentIndex(0);
    localStorage.removeItem('demo_currentIncidentIndex');
    localStorage.removeItem('demo_isDemoMode');
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
