import { StructuredData, JobMatchResult } from '@resume-analyzer/shared';

/**
 * JobMatcher compares resume content against job descriptions to calculate
 * match percentage and identify skill gaps.
 */
export class JobMatcher {
  // Common skill keywords for extraction
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

  /**
   * Matches resume content against a job description.
   * 
   * @param structuredData - Parsed resume data
   * @param jobDescription - Job description text
   * @returns JobMatchResult with match percentage, matching skills, and missing skills
   */
  match(structuredData: StructuredData, jobDescription: string): JobMatchResult {
    // Extract required skills from job description
    const requiredSkills = this.extractRequiredSkills(jobDescription);

    // Extract skills from resume
    const resumeSkills = this.extractResumeSkills(structuredData);

    // Find matching and missing skills
    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const required of requiredSkills) {
      const normalizedRequired = required.toLowerCase().trim();
      const isMatch = resumeSkills.some(
        resume => resume.toLowerCase().trim() === normalizedRequired
      );

      if (isMatch) {
        matchingSkills.push(required);
      } else {
        missingSkills.push(required);
      }
    }

    // Calculate match percentage
    const matchPercentage = requiredSkills.length > 0
      ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
      : 0;

    // Rank missing skills by importance
    const rankedMissingSkills = this.rankSkillsByImportance(missingSkills, jobDescription);

    return {
      matchScore: matchPercentage,
      matchPercentage,
      matchedSkills: matchingSkills,
      missingSkills: rankedMissingSkills,
      recommendations: [],
      relevantExperience: []
    };
  }

  /**
   * Extracts required skills and qualifications from job description.
   */
  private extractRequiredSkills(jobDescription: string): string[] {
    const skills: string[] = [];
    const seenSkills = new Set<string>();
    const text = jobDescription.toLowerCase();

    // Extract single words and bigrams
    const words = text.split(/\s+/);
    
    for (let i = 0; i < words.length; i++) {
      // Clean word, preserving special characters important for tech keywords
      const word = words[i].replace(/[^a-z0-9+#.-]/g, '');
      
      // Check single word
      if (this.isKnownSkill(word)) {
        const normalized = word.toLowerCase().trim();
        if (!seenSkills.has(normalized) && this.isValidSkillLength(word)) {
          skills.push(word);
          seenSkills.add(normalized);
        }
      }

      // Check bigram (two-word phrases)
      if (i < words.length - 1) {
        const nextWord = words[i + 1].replace(/[^a-z0-9+#.-]/g, '');
        const bigram = `${word} ${nextWord}`;
        
        if (this.isKnownSkill(bigram)) {
          const normalized = bigram.toLowerCase().trim();
          if (!seenSkills.has(normalized)) {
            skills.push(bigram);
            seenSkills.add(normalized);
          }
        }
      }
    }

    return skills;
  }

  /**
   * Extracts all skills from resume structured data.
   */
  private extractResumeSkills(data: StructuredData): string[] {
    const skills: string[] = [];
    const seenSkills = new Set<string>();

    // Add skills from skills section
    for (const skill of data.skills) {
      const normalized = skill.toLowerCase().trim();
      if (!seenSkills.has(normalized)) {
        skills.push(skill);
        seenSkills.add(normalized);
      }
    }

    // Extract skills from experience descriptions
    for (const exp of data.experience) {
      const expSkills = this.extractSkillsFromText(exp.description);
      for (const skill of expSkills) {
        const normalized = skill.toLowerCase().trim();
        if (!seenSkills.has(normalized)) {
          skills.push(skill);
          seenSkills.add(normalized);
        }
      }
    }

    // Extract skills from project technologies
    for (const project of data.projects || []) {
      for (const tech of project.technologies) {
        const normalized = tech.toLowerCase().trim();
        if (!seenSkills.has(normalized)) {
          skills.push(tech);
          seenSkills.add(normalized);
        }
      }

      // Extract from project descriptions
      const projSkills = this.extractSkillsFromText(project.description);
      for (const skill of projSkills) {
        const normalized = skill.toLowerCase().trim();
        if (!seenSkills.has(normalized)) {
          skills.push(skill);
          seenSkills.add(normalized);
        }
      }
    }

    return skills;
  }

  /**
   * Extracts skills from free-form text.
   */
  private extractSkillsFromText(text: string): string[] {
    const skills: string[] = [];
    const words = text.toLowerCase().split(/\s+/);

    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[^a-z0-9+#.-]/g, '');
      
      // Single word
      if (this.isKnownSkill(word) && this.isValidSkillLength(word)) {
        skills.push(word);
      }

      // Bigram
      if (i < words.length - 1) {
        const nextWord = words[i + 1].replace(/[^a-z0-9+#.-]/g, '');
        const bigram = `${word} ${nextWord}`;
        if (this.isKnownSkill(bigram)) {
          skills.push(bigram);
        }
      }
    }

    return skills;
  }

  /**
   * Checks if a term is a known skill keyword.
   */
  private isKnownSkill(term: string): boolean {
    if (this.technicalKeywords.has(term) ||
        this.softSkillKeywords.has(term) ||
        this.certificationKeywords.has(term)) {
      return true;
    }

    // Check for technical patterns
    if (term.includes('.js') || term.includes('.net') || 
        term.includes('++') || term.includes('#') ||
        term.match(/^[a-z]+\d+$/)) {
      return true;
    }

    return false;
  }

  /**
   * Validates skill length.
   * Allows 2-character skills with special characters (e.g., C#, C++).
   */
  private isValidSkillLength(skill: string): boolean {
    if (skill.length > 2) return true;
    if (skill.length === 2 && /[+#]/.test(skill)) return true;
    return false;
  }

  /**
   * Ranks missing skills by importance based on frequency in job description
   * and skill category weight.
   */
  private rankSkillsByImportance(skills: string[], jobDescription: string): string[] {
    const text = jobDescription.toLowerCase();
    
    // Count frequency of each skill in job description
    const skillFrequency = new Map<string, number>();
    for (const skill of skills) {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = text.match(regex);
      skillFrequency.set(skill, matches ? matches.length : 1);
    }

    // Sort by importance (category weight) and frequency
    const rankedSkills = [...skills].sort((a, b) => {
      const weightA = this.getSkillWeight(a);
      const weightB = this.getSkillWeight(b);

      // First by weight
      if (weightA !== weightB) {
        return weightB - weightA;
      }

      // Then by frequency
      const freqA = skillFrequency.get(a) || 0;
      const freqB = skillFrequency.get(b) || 0;
      return freqB - freqA;
    });

    return rankedSkills;
  }

  /**
   * Assigns importance weight to skills based on category.
   */
  private getSkillWeight(skill: string): number {
    const normalized = skill.toLowerCase();

    if (this.certificationKeywords.has(normalized)) {
      return 5; // Highest priority
    }
    if (this.technicalKeywords.has(normalized)) {
      return 4;
    }
    if (this.softSkillKeywords.has(normalized)) {
      return 2;
    }

    // Default weight for unknown skills (assume technical)
    return 3;
  }
}
