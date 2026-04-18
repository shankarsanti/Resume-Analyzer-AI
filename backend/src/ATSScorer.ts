import { StructuredData, ATSScore, ScoreBreakdown } from '@resume-analyzer/shared';

/**
 * ATSScorer calculates ATS compatibility score based on multiple factors
 * Score range: 0-100 with breakdown across 4 categories (25 points each)
 */
export class ATSScorer {
  /**
   * Calculates ATS compatibility score from structured resume data
   * @param data - Structured resume data from ContentAnalyzer
   * @param text - Original resume text for formatting analysis
   * @returns ATSScore with total score (0-100) and breakdown
   */
  calculateScore(data: StructuredData, text: string): ATSScore {
    const breakdown: ScoreBreakdown = {
      formatting: this.evaluateFormatting(text),
      sections: this.evaluateSections(data),
      keywords: this.evaluateKeywords(data, text),
      content: this.evaluateContent(data)
    };

    const totalScore = breakdown.formatting + breakdown.sections + breakdown.keywords + breakdown.content;

    return {
      score: Math.round(totalScore),
      breakdown
    };
  }

  /**
   * Evaluates formatting complexity (0-25 points)
   * Penalizes complex layouts, rewards simple structure
   */
  private evaluateFormatting(text: string): number {
    let score = 25;

    // Penalize excessive special characters (indicates complex formatting)
    const specialCharCount = (text.match(/[│┤├┬┴┼╔╗╚╝═║╠╣╦╩╬▀▄█▌▐░▒▓■□▪▫]/g) || []).length;
    const specialCharRatio = specialCharCount / text.length;
    if (specialCharRatio > 0.01) {
      score -= 10; // Heavy penalty for box drawing characters
    } else if (specialCharRatio > 0.005) {
      score -= 5;
    }

    // Penalize excessive tabs (indicates complex table layouts)
    const tabCount = (text.match(/\t/g) || []).length;
    const allLines = text.split('\n');
    const avgTabsPerLine = tabCount / Math.max(1, allLines.length);
    if (avgTabsPerLine > 2) {
      score -= 5;
    } else if (avgTabsPerLine > 1) {
      score -= 3;
    }

    // Penalize very short lines (indicates multi-column layouts)
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const shortLines = lines.filter(l => l.trim().length < 20).length;
    const shortLineRatio = shortLines / lines.length;
    if (shortLineRatio > 0.5) {
      score -= 5;
    }

    // Reward consistent line structure
    const avgLineLength = text.length / lines.length;
    if (avgLineLength > 30 && avgLineLength < 100) {
      score += 0; // Neutral - already at max
    }

    return Math.max(0, Math.min(25, score));
  }

  /**
   * Evaluates section completeness (0-25 points)
   * Rewards presence of standard resume sections
   */
  private evaluateSections(data: StructuredData): number {
    let score = 0;

    // Standard sections with point values
    const sectionChecks = [
      { present: data.contact.email || data.contact.phone, points: 5 }, // Contact info
      { present: data.experience.length > 0, points: 7 }, // Experience (most important)
      { present: data.education.length > 0, points: 6 }, // Education
      { present: data.skills.length > 0, points: 5 }, // Skills
      { present: (data.projects?.length || 0) > 0, points: 2 }  // Projects (optional but good)
    ];

    sectionChecks.forEach(check => {
      if (check.present) {
        score += check.points;
      }
    });

    return Math.min(25, score);
  }

  /**
   * Evaluates keyword density (0-25 points)
   * Rewards appropriate keyword usage, penalizes sparse or stuffed
   */
  private evaluateKeywords(data: StructuredData, text: string): number {
    let score = 15; // Start at middle value

    // Count total keywords from skills
    const totalKeywords = data.skills.length;

    // Keyword density evaluation
    if (totalKeywords === 0) {
      score = 5; // Very low score for no keywords
    } else if (totalKeywords < 5) {
      score = 10; // Too sparse
    } else if (totalKeywords >= 5 && totalKeywords <= 20) {
      score = 25; // Optimal range
    } else if (totalKeywords > 20 && totalKeywords <= 30) {
      score = 20; // Slightly too many
    } else {
      score = 12; // Keyword stuffing
    }

    // Check for keyword repetition (stuffing indicator)
    const wordCounts = new Map<string, number>();
    const words = text.toLowerCase().split(/\s+/);
    
    words.forEach(word => {
      if (word.length > 3) { // Only count meaningful words
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    });

    // Penalize if any word appears excessively
    const totalWords = words.length;
    let hasStuffing = false;
    wordCounts.forEach(count => {
      const frequency = count / totalWords;
      if (frequency > 0.03 && count > 10) { // Word appears more than 3% of the time
        hasStuffing = true;
      }
    });

    if (hasStuffing) {
      score -= 5;
    }

    return Math.max(0, Math.min(25, score));
  }

  /**
   * Evaluates content quality (0-25 points)
   * Rewards quantifiable achievements and action verbs
   */
  private evaluateContent(data: StructuredData): number {
    let score = 0;

    // Analyze experience descriptions
    const experienceDescriptions = data.experience.map(exp => exp.description).join(' ');

    // Check for quantifiable achievements (numbers, percentages, metrics)
    const numberPattern = /\d+[%$]?|\$\d+|[0-9]+\+/g;
    const numbersFound = (experienceDescriptions.match(numberPattern) || []).length;
    
    if (numbersFound === 0) {
      score += 3; // Minimal points for no metrics
    } else if (numbersFound >= 1 && numbersFound <= 3) {
      score += 8; // Some quantification
    } else if (numbersFound >= 4 && numbersFound <= 8) {
      score += 12; // Good quantification
    } else {
      score += 10; // Many metrics (might be excessive)
    }

    // Check for action verbs (strong indicators of achievements)
    const actionVerbs = [
      'achieved', 'improved', 'increased', 'decreased', 'reduced', 'developed',
      'created', 'implemented', 'launched', 'led', 'managed', 'designed',
      'built', 'established', 'optimized', 'streamlined', 'delivered',
      'executed', 'coordinated', 'spearheaded', 'initiated', 'drove'
    ];

    const lowerDesc = experienceDescriptions.toLowerCase();
    const actionVerbsFound = actionVerbs.filter(verb => lowerDesc.includes(verb)).length;

    if (actionVerbsFound === 0) {
      score += 2; // Weak content
    } else if (actionVerbsFound >= 1 && actionVerbsFound <= 3) {
      score += 6; // Some action verbs
    } else if (actionVerbsFound >= 4) {
      score += 10; // Strong action-oriented content
    }

    // Reward substantial experience descriptions
    if (data.experience.length > 0) {
      const avgDescLength = experienceDescriptions.length / data.experience.length;
      if (avgDescLength > 100) {
        score += 3; // Detailed descriptions
      } else if (avgDescLength > 50) {
        score += 2; // Adequate descriptions
      } else if (avgDescLength > 0) {
        score += 1; // Minimal descriptions
      }
    }

    return Math.min(25, score);
  }
}
