import React from 'react';
import { CheckCircle, XCircle, Briefcase, Award, GraduationCap, FolderGit2 } from 'lucide-react';

interface ResumeSectionsAnalysisProps {
  sections: Array<{ sectionType: string; present: boolean }>;
}

const getSectionIcon = (sectionType: string) => {
  const type = sectionType.toLowerCase();
  if (type.includes('experience')) return Briefcase;
  if (type.includes('skill')) return Award;
  if (type.includes('education')) return GraduationCap;
  if (type.includes('project')) return FolderGit2;
  return Briefcase; // Default icon
};

const ResumeSectionsAnalysis: React.FC<ResumeSectionsAnalysisProps> = ({ sections }) => {
  return (
    <section
      className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-md border border-gray-200"
      aria-labelledby="sections-analysis-heading"
    >
      <h2 id="sections-analysis-heading" className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">
        Resume Sections Analysis
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4" role="list" aria-label="Resume sections">
        {sections.map((section, index) => {
          const SectionIcon = getSectionIcon(section.sectionType);
          const StatusIcon = section.present ? CheckCircle : XCircle;
          
          return (
            <div
              key={index}
              role="listitem"
              className={`rounded-lg p-3 sm:p-4 text-center border-2 transition-all motion-reduce:transition-none ${
                section.present
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200 animate-pulse motion-reduce:animate-none'
              }`}
              aria-label={`${section.sectionType}: ${section.present ? 'present' : 'missing'}`}
            >
              <SectionIcon
                className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1.5 sm:mb-2 ${
                  section.present ? 'text-green-600' : 'text-red-600'
                }`}
                aria-hidden="true"
              />
              <StatusIcon
                className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 sm:mb-2 ${
                  section.present ? 'text-green-600' : 'text-red-600'
                }`}
                aria-hidden="true"
              />
              <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-900">
                {section.sectionType}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ResumeSectionsAnalysis;
