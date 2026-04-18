import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, XCircle, Clock, Server, RefreshCw } from 'lucide-react';
import { ErrorState } from '../types';

interface ErrorDisplayProps {
  error: ErrorState;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * ErrorDisplay component shows different error types with appropriate styling and actions
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
}) => {
  // Determine error type and styling based on error stage
  const getErrorConfig = () => {
    const stage = error.stage.toLowerCase();

    // Validation errors (400)
    if (stage === 'upload' || stage === 'validation') {
      return {
        icon: XCircle,
        iconColor: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        title: 'Validation Error',
        showRetry: true,
      };
    }

    // Processing errors (422)
    if (
      stage === 'extraction' ||
      stage === 'section_detection' ||
      stage === 'content_analysis' ||
      stage === 'analysis'
    ) {
      return {
        icon: AlertCircle,
        iconColor: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        title: 'Processing Error',
        showRetry: true,
      };
    }

    // Timeout errors (504)
    if (stage === 'timeout' || error.message.toLowerCase().includes('timeout')) {
      return {
        icon: Clock,
        iconColor: 'text-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        title: 'Timeout Error',
        showRetry: true,
      };
    }

    // Network errors
    if (stage === 'network') {
      return {
        icon: Server,
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        title: 'Connection Error',
        showRetry: true,
      };
    }

    // Server errors (500) and unknown errors
    return {
      icon: Server,
      iconColor: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      title: 'Server Error',
      showRetry: error.recoverable,
    };
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-6 max-w-2xl mx-auto`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start gap-4">
        {/* Error Icon */}
        <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-0.5`} aria-hidden="true" />

        {/* Error Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {config.title}
          </h3>
          <p className="text-base text-gray-700 mb-1">{error.message}</p>
          
          {/* Recovery suggestions based on error type */}
          <div className="mt-3 text-sm text-gray-600">
            {getRecoverySuggestion(error)}
          </div>
        </div>

        {/* Dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label="Dismiss error"
          >
            <XCircle className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Action buttons */}
      {config.showRetry && onRetry && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Try uploading again"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try Again
          </button>
        </div>
      )}
    </motion.div>
  );
};

/**
 * Get recovery suggestion text based on error details
 */
function getRecoverySuggestion(error: ErrorState): React.ReactNode {
  const stage = error.stage.toLowerCase();
  const message = error.message.toLowerCase();

  // Validation errors
  if (stage === 'upload' || stage === 'validation') {
    if (message.includes('size') || message.includes('10mb')) {
      return (
        <p>
          <strong>Suggestion:</strong> Try compressing your resume or reducing its size to under 10MB.
        </p>
      );
    }
    if (message.includes('format') || message.includes('type')) {
      return (
        <p>
          <strong>Suggestion:</strong> Please upload a PDF or DOCX file. Other formats are not supported.
        </p>
      );
    }
    if (message.includes('corrupt')) {
      return (
        <p>
          <strong>Suggestion:</strong> The file may be corrupted. Try re-saving it or using a different file.
        </p>
      );
    }
  }

  // Extraction errors
  if (stage === 'extraction') {
    if (message.includes('image') || message.includes('scanned') || message.includes('ocr')) {
      return (
        <p>
          <strong>Suggestion:</strong> This appears to be a scanned PDF. Please upload a PDF with selectable text, or convert your resume to a text-based format.
        </p>
      );
    }
    if (message.includes('no text') || message.includes('empty')) {
      return (
        <p>
          <strong>Suggestion:</strong> No text could be extracted from your file. Ensure your resume contains readable text content.
        </p>
      );
    }
  }

  // Section detection errors
  if (stage === 'section_detection') {
    return (
      <p>
        <strong>Suggestion:</strong> Make sure your resume includes standard sections like Skills, Experience, and Education with clear headings.
      </p>
    );
  }

  // Timeout errors
  if (stage === 'timeout' || message.includes('timeout')) {
    return (
      <p>
        <strong>Suggestion:</strong> Try uploading a shorter resume (under 5 pages) or reduce the file size.
      </p>
    );
  }

  // Network errors
  if (stage === 'network') {
    return (
      <p>
        <strong>Suggestion:</strong> Check your internet connection and ensure the server is running. If the problem persists, try again later.
      </p>
    );
  }

  // Generic recoverable error
  if (error.recoverable) {
    return (
      <p>
        <strong>Suggestion:</strong> Please try uploading your resume again. If the problem persists, try a different file.
      </p>
    );
  }

  // Non-recoverable server error
  return (
    <p>
      <strong>Suggestion:</strong> An unexpected error occurred. Please try again later or contact support if the issue continues.
    </p>
  );
}

export default ErrorDisplay;
