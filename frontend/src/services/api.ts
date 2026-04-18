import { AnalysisResults, ErrorResponse } from '@resume-analyzer/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_TIMEOUT = 35000; // 35 seconds (slightly longer than backend timeout)

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public stage: string,
    public details?: string,
    public recoverable: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface AnalyzeResumeOptions {
  file: File;
  jobDescription?: string;
  onProgress?: (progress: number, stage: string) => void;
}

/**
 * Analyzes a resume file by sending it to the backend API
 * @param options - Configuration options including file, job description, and progress callback
 * @returns Promise resolving to AnalysisResults
 * @throws ApiError with appropriate error details
 */
export async function analyzeResume(
  options: AnalyzeResumeOptions
): Promise<AnalysisResults> {
  const { file, jobDescription, onProgress } = options;

  // Create FormData for multipart/form-data upload
  const formData = new FormData();
  formData.append('file', file);
  if (jobDescription?.trim()) {
    formData.append('jobDescription', jobDescription.trim());
  }

  // Create abort controller for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    // Simulate initial progress
    onProgress?.(10, 'Uploading file...');

    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Simulate progress during response parsing
    onProgress?.(90, 'Processing results...');

    // Parse response body
    const data = await response.json();

    if (!response.ok) {
      // Handle error responses
      const errorData = data as ErrorResponse;
      
      // Determine if error is recoverable
      const recoverable = response.status === 400 || response.status === 422;
      
      throw new ApiError(
        errorData.message || 'An error occurred during analysis',
        errorData.code || 'UNKNOWN_ERROR',
        errorData.stage || 'unknown',
        errorData.details,
        recoverable
      );
    }

    // Return successful results
    onProgress?.(100, 'Complete');
    return data as AnalysisResults;

  } catch (error) {
    clearTimeout(timeoutId);

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        'Failed to connect to server',
        'NETWORK_ERROR',
        'network',
        'Please check your internet connection and ensure the server is running',
        true
      );
    }

    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        'Request timeout',
        'TIMEOUT_ERROR',
        'network',
        'The request took too long to complete. Please try with a smaller file.',
        true
      );
    }

    // Re-throw ApiError instances
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle unexpected errors
    throw new ApiError(
      'An unexpected error occurred',
      'UNKNOWN_ERROR',
      'unknown',
      error instanceof Error ? error.message : 'Please try again later',
      false
    );
  }
}

/**
 * Health check endpoint to verify API availability
 * @returns Promise resolving to true if API is healthy
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}
