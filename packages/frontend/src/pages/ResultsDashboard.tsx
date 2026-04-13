import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ResumeScoreSection, SuggestionsPanel, KeywordAnalysisSection, ResumeSectionsAnalysis } from '../components';

const ResultsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { analysisResults, resetState } = useAppContext();

  // Redirect to upload if no results
  React.useEffect(() => {
    if (!analysisResults) {
      navigate('/upload');
    }
  }, [analysisResults, navigate]);

  // Smooth scroll to top on mount
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAnalyzeAnother = () => {
    resetState();
    navigate('/upload');
  };

  if (!analysisResults) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
          Analysis Results
        </h1>

        {/* Top sections: 2-column layout on desktop, single column on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Resume Score Section */}
          <ResumeScoreSection score={analysisResults.score} />

          {/* Suggestions Panel */}
          <SuggestionsPanel suggestions={analysisResults.suggestions} />
        </div>

        {/* Keyword Analysis Section - Full width */}
        <KeywordAnalysisSection keywords={analysisResults.keywords} />

        {/* Resume Sections Analysis - Full width */}
        <ResumeSectionsAnalysis sections={analysisResults.sectionsAnalysis} />

        {/* Job Match Display (if available) */}
        {analysisResults.jobMatch && (
          <section
            className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-md border border-gray-200 mb-4 sm:mb-6"
            aria-labelledby="job-match-heading"
          >
            <h2 id="job-match-heading" className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">
              Job Match Analysis
            </h2>
            <div className="text-center mb-4 sm:mb-6">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2" aria-label={`${analysisResults.jobMatch.matchPercentage} percent match`}>
                {analysisResults.jobMatch.matchPercentage}%
              </div>
              <p className="text-base sm:text-lg text-gray-600">Match Percentage</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">
                  Matched Skills
                </h3>
                <div className="flex flex-wrap gap-2" role="list" aria-label="Matched skills">
                  {analysisResults.jobMatch.matchingSkills.map((skill, index) => (
                    <span
                      key={index}
                      role="listitem"
                      className="px-2.5 py-1.5 sm:px-3 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-700 border border-green-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">
                  Missing Skills
                </h3>
                <div className="flex flex-wrap gap-2" role="list" aria-label="Missing skills">
                  {analysisResults.jobMatch.missingSkills.map((skill, index) => (
                    <span
                      key={index}
                      role="listitem"
                      className="px-2.5 py-1.5 sm:px-3 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-700 border border-red-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={handleAnalyzeAnother}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-700 transition-all motion-reduce:transition-none hover:scale-105 motion-reduce:hover:scale-100 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
            aria-label="Analyze another resume"
          >
            <Upload className="w-5 h-5" aria-hidden="true" />
            Analyze Another Resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
