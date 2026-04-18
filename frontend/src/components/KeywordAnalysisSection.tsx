import React from 'react';
import { motion } from 'framer-motion';
import { KeywordAnalysis } from '@resume-analyzer/shared';

interface KeywordAnalysisSectionProps {
  keywords: KeywordAnalysis;
}

const KeywordAnalysisSection: React.FC<KeywordAnalysisSectionProps> = ({ keywords }) => {
  // Detect reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  return (
    <section
      className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-md border border-gray-200 mb-4 sm:mb-6"
      aria-labelledby="keyword-analysis-heading"
    >
      <h2 id="keyword-analysis-heading" className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">
        Keyword Analysis
      </h2>

      {/* Missing Keywords Section */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">
          Missing Keywords
        </h3>
        <div className="flex flex-wrap gap-2" role="list" aria-label="Missing keywords">
          {keywords.missingKeywords.length > 0 ? (
            keywords.missingKeywords.map((kw, index) => (
              <motion.span
                key={index}
                role="listitem"
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.05, duration: 0.3 }}
                className="px-2.5 py-1.5 sm:px-3 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-700 border border-red-200"
              >
                {kw.text}
              </motion.span>
            ))
          ) : (
            <p className="text-sm sm:text-base text-green-600" role="status">No missing keywords found! ✓</p>
          )}
        </div>
      </div>

      {/* Matching Keywords Section */}
      <div>
        <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">
          Matching Keywords
        </h3>
        <div className="flex flex-wrap gap-2" role="list" aria-label="Matching keywords">
          {keywords.identifiedKeywords.length > 0 ? (
            keywords.identifiedKeywords.map((kw, index) => (
              <motion.span
                key={index}
                role="listitem"
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.05, duration: 0.3 }}
                className="px-2.5 py-1.5 sm:px-3 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-700 border border-green-200"
              >
                {kw.text}
              </motion.span>
            ))
          ) : (
            <p className="text-sm sm:text-base text-gray-500" role="status">No matching keywords found</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default KeywordAnalysisSection;
