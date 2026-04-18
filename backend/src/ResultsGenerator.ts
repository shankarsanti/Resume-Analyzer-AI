import {
  StructuredData,
  ATSScore,
  KeywordAnalysis,
  JobMatchResult,
  AnalysisResults,
  SectionAnalysis,
  ResumeSection,
} from '@resume-analyzer/shared';

/**
 * ResultsGenerator compiles all analysis components into a unified result
 * and generates actionable suggestions for resume improvement.
 */
export class ResultsGenerator {
  /**
   * Generates complete analysis results with suggestions.
   * 
   * @param atsScore - ATS compatibility score and breakdown
   * @param keywordAnalysis - Identified and missing keywords
   * @param structuredData - Parsed resume data
   * @param sections - Detected resume sections
   * @param jobMatch - Optional job matching results
   * @returns Complete AnalysisResults with suggestions
   */
  generate(
    atsScore: ATSScore,
    keywordAnalysis: KeywordAnalysis,
    structuredData: StructuredData,
    sections: ResumeSection[],
    jobMatch?: JobMatchResult
  ): AnalysisResults {
    // Transform score into color-coded status
    const status = this.getScoreStatus(atsScore.score);

    // Transform detected sections into SectionAnalysis
    const sectionsAnalysis = this.analyzeSections(sections);

    // Generate actionable suggestions
    const suggestions = this.generateSuggestions(
      atsScore,
      keywordAnalysis,
      structuredData,
      sectionsAnalysis
    );

    return {
      score: atsScore.score,
      breakdown: atsScore.breakdown,
      status,
      suggestions,
      keywords: keywordAnalysis,
      sectionsAnalysis: sectionsAnalysis.map(s => ({
        sectionType: s.section,
        present: s.present
      })),
      jobMatch,
    };
  }

  /**
   * Generates error result when pipeline stage fails.
   * 
   * @param stage - Pipeline stage that failed
   * @param error - Error message
   * @returns AnalysisResults with error information
   */
  generateError(stage: string, error: string): AnalysisResults {
    return {
      score: 0,
      breakdown: {
        formatting: 0,
        sections: 0,
        keywords: 0,
        content: 0,
      },
      status: 'needs_improvement',
      suggestions: [],
      keywords: {
        identifiedKeywords: [],
        missingKeywords: [],
      },
      sectionsAnalysis: [],
      error,
      errorStage: stage,
    };
  }

  /**
   * Transforms score into color-coded status.
   * Red (0-40): needs_improvement
   * Yellow (41-70): good
   * Green (71-100): excellent
   */
  private getScoreStatus(score: number): 'excellent' | 'good' | 'needs_improvement' {
    if (score >= 71) {
      return 'excellent';
    } else if (score >= 41) {
      return 'good';
    } else {
      return 'needs_improvement';
    }
  }

  /**
   * Transforms detected sections into SectionAnalysis with status indicators.
   */
  private analyzeSections(sections: ResumeSection[]): SectionAnalysis[] {
    const standardSections = ['experience', 'skills', 'education', 'projects'] as const;
    const detectedTypes = new Set(sections.map(s => s.type));

    return standardSections.map(sectionType => ({
      section: sectionType,
      present: detectedTypes.has(sectionType),
      quality: detectedTypes.has(sectionType) ? 'good' as const : 'missing' as const,
      suggestions: detectedTypes.has(sectionType) ? [] : [`Add a ${sectionType} section to your resume`]
    }));
  }

  /**
   * Generates actionable suggestions based on identified weaknesses.
   * Prioritizes structural/formatting improvements when score < 70.
   * Limits to top 5 most impactful improvements.
   */
  private generateSuggestions(
    atsScore: ATSScore,
    keywordAnalysis: KeywordAnalysis,
    structuredData: StructuredData,
    sectionsAnalysis: SectionAnalysis[]
  ): string[] {
    const suggestions: Array<{ text: string; priority: number }> = [];

    // Priority 1: Structural and formatting improvements (when score < 70)
    if (atsScore.score < 70) {
      if (atsScore.breakdown.formatting < 15) {
        suggestions.push({
          text: 'Simplify your resume formatting - avoid complex layouts, tables, and columns that ATS systems struggle to parse',
          priority: 10,
        });
      }

      if (atsScore.breakdown.sections < 15) {
        const missingSections = sectionsAnalysis
          .filter(s => !s.present)
          .map(s => s.section);

        if (missingSections.length > 0) {
          suggestions.push({
            text: `Add missing resume sections: ${missingSections.join(', ')} - complete resumes score higher with ATS`,
            priority: 9,
          });
        }
      }
    }

    // Priority 2: Missing keywords (when identified)
    if (keywordAnalysis.missingKeywords.length > 0) {
      const topMissingKeywords = keywordAnalysis.missingKeywords
        .slice(0, 5)
        .map(k => k.text)
        .join(', ');

      suggestions.push({
        text: `Incorporate relevant keywords: ${topMissingKeywords} - these appear in the job description but are missing from your resume`,
        priority: 8,
      });
    }

    // Priority 3: Quantifiable achievements
    if (atsScore.breakdown.content < 15) {
      const hasMetrics = this.checkForMetrics(structuredData);
      
      if (!hasMetrics) {
        suggestions.push({
          text: 'Add quantifiable achievements with numbers, percentages, or metrics (e.g., "Increased sales by 25%" instead of "Improved sales")',
          priority: 7,
        });
      }

      const hasActionVerbs = this.checkForActionVerbs(structuredData);
      
      if (!hasActionVerbs) {
        suggestions.push({
          text: 'Use strong action verbs to describe your accomplishments (e.g., "Led", "Developed", "Achieved", "Implemented")',
          priority: 6,
        });
      }
    }

    // Priority 4: Keyword density issues
    if (atsScore.breakdown.keywords < 15) {
      if (structuredData.skills.length < 5) {
        suggestions.push({
          text: 'Add more relevant skills to your skills section - aim for 8-15 skills that match your experience and target role',
          priority: 5,
        });
      } else if (structuredData.skills.length > 30) {
        suggestions.push({
          text: 'Reduce the number of skills listed - focus on your strongest and most relevant skills (15-20 is optimal)',
          priority: 5,
        });
      }
    }

    // Priority 5: Experience details
    if (structuredData.experience.length === 0) {
      suggestions.push({
        text: 'Add work experience with job titles, company names, dates, and detailed descriptions of your responsibilities and achievements',
        priority: 4,
      });
    } else {
      const hasShortDescriptions = structuredData.experience.some(
        exp => exp.description.length < 50
      );

      if (hasShortDescriptions) {
        suggestions.push({
          text: 'Expand your experience descriptions - provide more detail about your responsibilities, achievements, and impact',
          priority: 3,
        });
      }
    }

    // Priority 6: Education
    if (structuredData.education.length === 0) {
      suggestions.push({
        text: 'Add your education background including degree, institution, and graduation date',
        priority: 2,
      });
    }

    // Priority 7: Contact information
    if (!structuredData.contact.email && !structuredData.contact.phone) {
      suggestions.push({
        text: 'Include contact information (email and phone number) at the top of your resume',
        priority: 1,
      });
    }

    // Sort by priority (descending) and limit to top 5
    const topSuggestions = suggestions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5)
      .map(s => s.text);

    return topSuggestions;
  }

  /**
   * Checks if experience descriptions contain quantifiable metrics.
   */
  private checkForMetrics(data: StructuredData): boolean {
    const experienceText = data.experience.map(exp => exp.description).join(' ');
    const numberPattern = /\d+[%$]?|\$\d+|[0-9]+\+/g;
    const numbersFound = (experienceText.match(numberPattern) || []).length;
    return numbersFound > 0;
  }

  /**
   * Checks if experience descriptions contain action verbs.
   */
  private checkForActionVerbs(data: StructuredData): boolean {
    const actionVerbs = [
      'achieved', 'improved', 'increased', 'decreased', 'reduced', 'developed',
      'created', 'implemented', 'launched', 'led', 'managed', 'designed',
      'built', 'established', 'optimized', 'streamlined', 'delivered',
      'executed', 'coordinated', 'spearheaded', 'initiated', 'drove',
    ];

    const experienceText = data.experience
      .map(exp => exp.description)
      .join(' ')
      .toLowerCase();

    return actionVerbs.some(verb => experienceText.includes(verb));
  }
}
