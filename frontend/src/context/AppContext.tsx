import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AnalysisResults } from '@resume-analyzer/shared';
import { UploadState, ErrorState } from '../types';

interface AppContextType {
  uploadState: UploadState;
  analysisResults: AnalysisResults | null;
  error: ErrorState | null;
  setUploadState: (state: UploadState) => void;
  setAnalysisResults: (results: AnalysisResults | null) => void;
  setError: (error: ErrorState | null) => void;
  resetState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialUploadState: UploadState = {
  isProcessing: false,
  progress: 0,
  currentStage: '',
  file: null,
  jobDescription: undefined,
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [uploadState, setUploadState] = useState<UploadState>(initialUploadState);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);

  const resetState = () => {
    setUploadState(initialUploadState);
    setAnalysisResults(null);
    setError(null);
  };

  return (
    <AppContext.Provider
      value={{
        uploadState,
        analysisResults,
        error,
        setUploadState,
        setAnalysisResults,
        setError,
        resetState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
