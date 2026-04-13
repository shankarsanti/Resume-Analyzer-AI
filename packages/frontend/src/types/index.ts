// Frontend-specific types for state management
import { AnalysisResults } from '@resume-analyzer/shared';

export interface UploadState {
  isProcessing: boolean;
  progress: number; // 0-100
  currentStage: string;
  file: File | null;
  jobDescription?: string;
}

export interface ErrorState {
  stage: string;
  message: string;
  recoverable: boolean;
}

export interface AppState {
  uploadState: UploadState;
  analysisResults: AnalysisResults | null;
  error: ErrorState | null;
}
