import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface SuggestionsPanelProps {
  suggestions: string[];
}

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({ suggestions }) => {
  // Limit to top 5 suggestions
  const displayedSuggestions = suggestions.slice(0, 5);

  // Detect reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  return (
    <section
      className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-md border border-gray-200"
      aria-labelledby="suggestions-heading"
    >
      <h2 id="suggestions-heading" className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">Suggestions</h2>

      <ul className="space-y-2 sm:space-y-3" role="list" aria-label="Resume improvement suggestions">
        {displayedSuggestions.map((suggestion, index) => (
          <motion.li
            key={index}
            role="listitem"
            initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : {
              duration: 0.4,
              delay: index * 0.1, // 100ms staggered delay
              ease: 'easeOut',
            }}
            className="flex items-start gap-2 sm:gap-3"
          >
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-sm sm:text-base text-gray-700 leading-relaxed">
              {suggestion}
            </span>
          </motion.li>
        ))}
      </ul>

      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
        <p className="text-xs sm:text-sm text-gray-500 italic">
          Note: Real systems analyze 50+ factors for suggestions
        </p>
      </div>
    </section>
  );
};

export default SuggestionsPanel;
