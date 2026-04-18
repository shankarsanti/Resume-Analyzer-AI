import { StructuredData, Keyword, KeywordAnalysis } from '@resume-analyzer/shared';

/**
 * KeywordAnalyzer identifies and categorizes keywords from resume content
 * and optionally compares against job descriptions to find gaps.
 */
export class KeywordAnalyzer {
  // Common keyword databases for categorization
  private readonly technicalKeywords = new Set([
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'asp.net', '.net',
    'html', 'css', 'sass', 'tailwind', 'bootstrap',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd',
    'git', 'github', 'gitlab', 'bitbucket',
    'rest', 'api', 'graphql', 'microservices', 'serverless',
    'machine learning', 'ai', 'deep learning', 'tensorflow', 'pytorch',
    'agile', 'scrum', 'devops', 'testing', 'tdd', 'unit testing',
  ]);

  private readonly softSkillKeywords = new Set([
    'leadership', 'communication', 'teamwork', 'collaboration', 'problem-solving',
    'critical thinking', 'analytical', 'creative', 'adaptable', 'flexible',
    'time management', 'organization', 'detail-oriented', 'self-motivated',
    'interpersonal', 'presentation', 'negotiation', 'conflict resolution',
    'mentoring', 'coaching', 'strategic thinking', 'decision making',
  ]);

  private readonly certificationKeywords = new Set([
    'aws certified', 'azure certified', 'gcp certified', 'pmp', 'cissp', 'ceh',
    'comptia', 'ccna', 'ccnp', 'ccie', 'cka', 'ckad',
    'scrum master', 'product owner', 'safe', 'itil',
    'certified', 'certification', 'professional certification',
  ]);

  private readonly toolKeywords = new Set([
    'jira', 'confluence', 'slack', 'trello', 'asana', 'notion',
    'figma', 'sketch', 'adobe', 'photoshop', 'illustrator',
    'vs code', 'intellij', 'eclipse', 'visual studio',
    'postman', 'insomnia', 'swagger',
    'tableau', 'power bi', 'excel', 'google analytics',
  ]);

  private readonly industryKeywords = new Set([
    'fintech', 'healthcare', 'e-commerce', 'saas', 'b2b', 'b2c',
    'startup', 'enterprise', 'consulting', 'banking', 'insurance',
    'retail', 'manufacturing', 'logistics', 'supply chain',
    'education', 'edtech', 'gaming', 'media', 'entertainment',
  ]);

  /**
   * Analyzes structured resume data to identify and categorize keywords.
   * Optionally compares against a job description to find missing keywords.
   * 
   * @param structuredData - Parsed resume data
   * @param jobDescription - Optional job description for gap analysis
   * @returns KeywordAnalysis with identified and missing keywords
   */
  analyze(structuredData: StructuredData, jobDescription?: string): KeywordAnalysis {
    // Extract keywords from resume
    const identifiedKeywords = this.extractKeywordsFromResume(structuredData);

    // If job description provided, identify missing keywords
    let missingKeywords: Keyword[] = [];
    if (jobDescription) {
      missingKeywords = this.identifyMissingKeywords(identifiedKeywords, jobDescription);
    }

    return {
      identifiedKeywords,
      missingKeywords,
    };
  }

  /**
   * Extracts and categorizes keywords from structured resume data.
   */
  private extractKeywordsFromResume(data: StructuredData): Keyword[] {
    const keywords: Keyword[] = [];
    const seenKeywords = new Set<string>();

    // Extract from skills
    for (const skill of data.skills) {
      const normalized = skill.toLowerCase().trim();
      if (!seenKeywords.has(normalized) && this.isValidKeywordLength(normalized)) {
        const category = this.categorizeKeyword(normalized);
        keywords.push({ text: skill, category });
        seenKeywords.add(normalized);
      }
    }

    // Extract from experience descriptions
    for (const exp of data.experience) {
      const expKeywords = this.extractKeywordsFromText(exp.description);
      for (const keyword of expKeywords) {
        const normalized = keyword.toLowerCase().trim();
        if (!seenKeywords.has(normalized)) {
          const category = this.categorizeKeyword(normalized);
          keywords.push({ text: keyword, category });
          seenKeywords.add(normalized);
        }
      }
    }

    // Extract from projects
    for (const project of data.projects || []) {
      // Extract from technologies
      for (const tech of project.technologies) {
        const normalized = tech.toLowerCase().trim();
        if (!seenKeywords.has(normalized) && this.isValidKeywordLength(normalized)) {
          const category = this.categorizeKeyword(normalized);
          keywords.push({ text: tech, category });
          seenKeywords.add(normalized);
        }
      }

      // Extract from project description
      const projKeywords = this.extractKeywordsFromText(project.description);
      for (const keyword of projKeywords) {
        const normalized = keyword.toLowerCase().trim();
        if (!seenKeywords.has(normalized)) {
          const category = this.categorizeKeyword(normalized);
          keywords.push({ text: keyword, category });
          seenKeywords.add(normalized);
        }
      }
    }

    return keywords;
  }

  /**
   * Checks if a keyword has valid length.
   * Allows 2-character keywords if they contain special characters (e.g., C#, C++).
   */
  private isValidKeywordLength(keyword: string): boolean {
    if (keyword.length > 2) return true;
    if (keyword.length === 2 && /[+#]/.test(keyword)) return true;
    return false;
  }

  /**
   * Extracts potential keywords from free-form text.
   * Looks for technical terms, tools, and important phrases.
   */
  private extractKeywordsFromText(text: string): string[] {
    const keywords: string[] = [];
    const words = text.toLowerCase().split(/\s+/);

    // Check single words and bigrams
    for (let i = 0; i < words.length; i++) {
      // Preserve special characters important for tech keywords (+, #, ., -)
      const word = words[i].replace(/[^a-z0-9+#.-]/g, '');
      
      // Single word
      if (word.length > 2 && this.isLikelyKeyword(word)) {
        keywords.push(word);
      }

      // Bigram (two-word phrases)
      if (i < words.length - 1) {
        const nextWord = words[i + 1].replace(/[^a-z0-9+#.-]/g, '');
        const bigram = `${word} ${nextWord}`;
        if (this.isLikelyKeyword(bigram)) {
          keywords.push(bigram);
        }
      }
    }

    return keywords;
  }

  /**
   * Determines if a word/phrase is likely a keyword worth tracking.
   */
  private isLikelyKeyword(term: string): boolean {
    // Check against known keyword databases
    if (this.technicalKeywords.has(term) ||
        this.softSkillKeywords.has(term) ||
        this.certificationKeywords.has(term) ||
        this.toolKeywords.has(term) ||
        this.industryKeywords.has(term)) {
      return true;
    }

    // Check for technical patterns
    if (term.includes('.js') || term.includes('.net') || 
        term.includes('++') || term.includes('#') ||
        term.match(/^[a-z]+\d+$/)) { // e.g., python3, java8
      return true;
    }

    return false;
  }

  /**
   * Categorizes a keyword into one of the defined types.
   */
  private categorizeKeyword(keyword: string): 'technical' | 'soft_skill' | 'certification' | 'tool' | 'industry' | 'domain' {
    if (this.technicalKeywords.has(keyword)) return 'technical';
    if (this.softSkillKeywords.has(keyword)) return 'soft_skill';
    if (this.certificationKeywords.has(keyword)) return 'certification';
    if (this.toolKeywords.has(keyword)) return 'tool';
    if (this.industryKeywords.has(keyword)) return 'industry';

    // Default categorization based on patterns
    if (keyword.includes('certified') || keyword.includes('certification')) {
      return 'certification';
    }
    if (keyword.match(/^[a-z]+\.(js|net|py)$/) || keyword.includes('++') || keyword.includes('#')) {
      return 'technical';
    }

    // Default to technical for unknown keywords
    return 'technical';
  }

  /**
   * Identifies keywords present in job description but missing from resume.
   * Ranks them by frequency and importance.
   */
  private identifyMissingKeywords(resumeKeywords: Keyword[], jobDescription: string): Keyword[] {
    const resumeKeywordSet = new Set(
      resumeKeywords.map(k => k.text.toLowerCase().trim())
    );

    // Extract keywords from job description
    const jobKeywords = this.extractKeywordsFromText(jobDescription);
    
    // Count frequency of each keyword in job description
    const keywordFrequency = new Map<string, number>();
    for (const keyword of jobKeywords) {
      const normalized = keyword.toLowerCase().trim();
      if (!resumeKeywordSet.has(normalized)) {
        keywordFrequency.set(normalized, (keywordFrequency.get(normalized) || 0) + 1);
      }
    }

    // Convert to Keyword objects with frequency
    const missingKeywords: Keyword[] = [];
    for (const [keyword, frequency] of keywordFrequency.entries()) {
      const category = this.categorizeKeyword(keyword);
      missingKeywords.push({
        text: keyword,
        category,
        frequency,
      });
    }

    // Rank by frequency (descending) and importance (technical/certification > others)
    missingKeywords.sort((a, b) => {
      // First, sort by importance (category weight)
      const weightA = this.getCategoryWeight(a.category);
      const weightB = this.getCategoryWeight(b.category);
      if (weightA !== weightB) {
        return weightB - weightA; // Higher weight first
      }

      // Then by frequency
      return (b.frequency || 0) - (a.frequency || 0);
    });

    return missingKeywords;
  }

  /**
   * Assigns importance weight to keyword categories.
   * Higher weight = more important for ATS matching.
   */
  private getCategoryWeight(category: 'technical' | 'soft_skill' | 'certification' | 'tool' | 'industry' | 'domain'): number {
    const weights = {
      certification: 5,
      technical: 4,
      tool: 3,
      domain: 2,
      industry: 2,
      soft_skill: 1,
    };
    return weights[category];
  }
}
