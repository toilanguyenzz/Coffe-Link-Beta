
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ToolsContextType {
  moisture: number;
  setMoisture: (val: number) => void;
  impurities: number;
  setImpurities: (val: number) => void;
  blackBroken: number;
  setBlackBroken: (val: number) => void;
  basePrice: number;
  setBasePrice: (val: number) => void;
}

const ToolsContext = createContext<ToolsContextType | undefined>(undefined);

export const useTools = () => {
  const context = useContext(ToolsContext);
  if (!context) {
    throw new Error('useTools must be used within a ToolsProvider');
  }
  return context;
};

export const ToolsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default values for Coffee Standards
  const [moisture, setMoisture] = useState<number>(15.0);
  const [impurities, setImpurities] = useState<number>(1.0);
  const [blackBroken, setBlackBroken] = useState<number>(2.0);
  const [basePrice, setBasePrice] = useState<number>(82500);

  return (
    <ToolsContext.Provider value={{
      moisture, setMoisture,
      impurities, setImpurities,
      blackBroken, setBlackBroken,
      basePrice, setBasePrice
    }}>
      {children}
    </ToolsContext.Provider>
  );
};
