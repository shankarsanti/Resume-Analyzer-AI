import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone, FileRejection } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, X, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { LoadingSpinner, ErrorDisplay } from '../components';
import { formatFileSize, getFileTypeDisplay } from '../utils';
import { analyzeResume, ApiError } from '../services';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { uploadState, setUploadState, setAnalysisResults, error, setError } = useAppContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  // Detect reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Handle file drop/selection
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setValidationError('');
    setError(null); // Clear any previous errors

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setValidationError('File size exceeds 10MB limit');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setValidationError('Invalid file type. Please upload a PDF or DOCX file');
      } else {
        setValidationError('Invalid file. Please upload a PDF or DOCX file');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setUploadState({
        ...uploadState,
        file,
      });
    }
  }, [uploadState, setUploadState, setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: uploadState.isProcessing,
  });

  // Handle file removal
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationError('');
    setError(null); // Clear any errors
    setUploadState({
      ...uploadState,
      file: null,
    });
  };

  // Handle retry after error
  const handleRetry = () => {
    setError(null);
    setValidationError('');
  };

  // Handle error dismissal
  const handleDismissError = () => {
    setError(null);
  };

  // Handle job description change
  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedFile) return;

    setError(null);
    setUploadState({
      ...uploadState,
      isProcessing: true,
      progress: 0,
      currentStage: 'Uploading file...',
    });

    try {
      // Use the API service with progress callback
      const results = await analyzeResume({
        file: selectedFile,
        jobDescription: jobDescription.trim() || undefined,
        onProgress: (progress, stage) => {
          setUploadState({
            ...uploadState,
            isProcessing: true,
            progress,
            currentStage: stage,
          });
        },
      });

      setUploadState({
        ...uploadState,
        isProcessing: false,
        progress: 100,
        currentStage: 'Complete',
      });

      setAnalysisResults(results);

      // Navigate to results page
      setTimeout(() => {
        navigate('/results');
      }, 500);
    } catch (error) {
      if (error instanceof ApiError) {
        setError({
          stage: error.stage,
          message: error.message,
          recoverable: error.recoverable,
        });
      } else {
        setError({
          stage: 'unknown',
          message: 'An unexpected error occurred',
          recoverable: false,
        });
      }

      setUploadState({
        ...uploadState,
        isProcessing: false,
        progress: 0,
        currentStage: '',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Screen reader announcements for status changes */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {uploadState.isProcessing && uploadState.currentStage}
        {error && `Error: ${error.message}`}
        {validationError && `Validation error: ${validationError}`}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
          Upload Your Resume
        </h1>

        {/* Error Display */}
        {error && (
          <div className="mb-8">
            <ErrorDisplay
              error={error}
              onRetry={handleRetry}
              onDismiss={handleDismissError}
            />
          </div>
        )}

        {/* Upload Zone or Processing State */}
        {uploadState.isProcessing ? (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-64 w-full max-w-2xl mx-auto border-2 border-blue-300 rounded-xl bg-white p-6 sm:p-8 lg:p-12 flex flex-col items-center justify-center"
          >
            <LoadingSpinner size="lg" />
            <p className="text-base sm:text-lg lg:text-xl font-medium text-gray-700 mt-4 sm:mt-6 text-center px-4">
              {uploadState.currentStage || 'Processing your resume...'}
            </p>
            <div className="w-full max-w-md mt-4 sm:mt-6 px-4">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={uploadState.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
                <motion.div
                  className="h-full bg-blue-600 rounded-full motion-reduce:transition-none"
                  initial={{ width: '0%' }}
                  animate={{ width: `${uploadState.progress}%` }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
                />
              </div>
              <p className="text-sm text-gray-600 text-center mt-2">
                {uploadState.progress}%
              </p>
            </div>
          </motion.div>
        ) : selectedFile ? (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto"
          >
            {/* File Preview */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 flex-shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {formatFileSize(selectedFile.size)} • {getFileTypeDisplay(selectedFile)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-gray-400 hover:text-red-500 transition-colors motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Remove file"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        ) : (
          <div
            {...getRootProps()}
            className={`min-h-64 w-full max-w-2xl mx-auto border-2 border-dashed rounded-xl p-6 sm:p-8 lg:p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isDragActive
                ? 'border-blue-600 border-solid bg-blue-100 scale-105 shadow-lg motion-reduce:scale-100'
                : validationError
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 hover:scale-102 motion-reduce:hover:scale-100'
            }`}
            role="button"
            aria-label="Upload resume file. Drag and drop or click to browse. Supports PDF and DOCX files up to 10MB"
            tabIndex={0}
          >
            <input {...getInputProps()} aria-label="Resume file upload" />
            <UploadCloud
              className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mb-3 sm:mb-4 transition-colors motion-reduce:transition-none ${
                isDragActive
                  ? 'text-blue-600'
                  : validationError
                  ? 'text-red-400'
                  : 'text-gray-400'
              }`}
              aria-hidden="true"
            />
            <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700 mb-2 text-center px-4">
              {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
            </p>
            <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4 text-center">or click to browse</p>
            <p className="text-xs sm:text-sm text-gray-400 text-center">
              Supports PDF and DOCX (max 10MB)
            </p>
            {validationError && (
              <motion.p
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-600 font-medium mt-4 text-center px-4"
              >
                {validationError}
              </motion.p>
            )}
          </div>
        )}

        {/* Job Description Input */}
        {!uploadState.isProcessing && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.1 }}
            className="mt-6 sm:mt-8 max-w-2xl mx-auto"
          >
            <label
              htmlFor="jobDescription"
              className="block text-base sm:text-lg font-medium text-gray-700 mb-2"
            >
              Job Description (Optional)
            </label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={handleJobDescriptionChange}
              className="w-full min-h-32 border border-gray-300 rounded-lg p-3 sm:p-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-transparent transition-all motion-reduce:transition-none"
              placeholder="Paste the job description here to get tailored suggestions..."
              disabled={uploadState.isProcessing}
              aria-describedby="jobDescription-help"
            />
            <p id="jobDescription-help" className="sr-only">
              Optional: Paste a job description to receive tailored suggestions for your resume
            </p>
            <p className="text-xs sm:text-sm text-gray-500 text-right mt-1">
              {jobDescription.length} characters
            </p>
          </motion.div>
        )}

        {/* Submit Button */}
        {!uploadState.isProcessing && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.2 }}
            className="mt-4 sm:mt-6 max-w-2xl mx-auto"
          >
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || uploadState.isProcessing}
              className={`w-full px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold flex items-center justify-center gap-2 transition-all motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] ${
                selectedFile && !uploadState.isProcessing
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg motion-reduce:hover:shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              aria-label="Analyze resume"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              Analyze Resume
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
