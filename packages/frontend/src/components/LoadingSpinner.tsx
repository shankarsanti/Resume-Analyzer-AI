import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

/**
 * LoadingSpinner component for loading states
 * Displays an animated spinner with optional text
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`} role="status" aria-live="polite">
      <Loader2
        className={`${sizeClasses[size]} text-blue-600 animate-spin`}
        aria-hidden="true"
      />
      <span className="sr-only">Loading</span>
      {text && (
        <p
          className={`${textSizeClasses[size]} font-medium text-gray-700 mt-4`}
          aria-live="polite"
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
