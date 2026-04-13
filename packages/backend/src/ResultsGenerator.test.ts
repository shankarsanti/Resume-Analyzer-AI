import { describe, it, expect } from 'vitest';
import { ResultsGenerator } from './ResultsGenerator';
import {
  StructuredData,
  ATSScore,
  KeywordAnalysis,
  JobMatchResult,
  ResumeSection,
} from '@resume-analyzer/shared';

describe('ResultsGenerator', () => {
  const generator = new ResultsGenerator();

  describe('generate', () => {
    it('should compile unified result with all components', () => {
      const atsScore: ATSScore = {
        score: 85,
        breakdown: {
          formatting: 22,
          sections: 23,
          keywords: 20,
          content: 20,
        },
      };

      const keywordAnalysis: KeywordAnalysis = {
        identifiedKeywords: [
          { text: 'JavaScript', category: 'technical' },
          { text: 'React', category: 'technical' },
        ],
        missingKeywords: [
          { text: 'TypeScript', category: 'technical', frequency: 3 },
        ],
      };

      const structuredData: StructuredData = {
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: [
          {
            jobTitle: 'Software Engineer',
            company: 'Tech Corp',
            dates: '2020-2023',
            description: 'Developed web applications using React and improved performance by 30%',
          },
        ],
        education: [
          {
            degree: 'BS Computer Science',
            institution: 'University',
            graduationDate: '2020',
          },
        ],
        projects: [],
        contact: { email: 'test@example.com', phone: '123-456-7890' },
      };

      const sections: ResumeSection[] = [
        { type: 'skills', content: 'JavaScript, React', confidence: 0.9 },
        { type: 'experience', content: 'Software Engineer...', confidence: 0.95 },
        { type: 'education', content: 'BS Computer Science', confidence: 0.9 },
        { type: 'contact', content: 'test@example.com', confidence: 0.95 },
      ];

      const jobMatch: JobMatchResult = {
        matchPercentage: 75,
        matchingSkills: ['JavaScript', 'React'],
        missingSkills: ['TypeScript'],
      };

      const result = generator.generate(
        atsScore,
        keywordAnalysis,
        structuredData,
        sections,
        jobMatch
      );

      expect(result.score).toBe(85);
      expect(result.breakdown).toEqual(atsScore.breakdown);
      expect(result.status).toBe('excellent');
      expect(result.keywords).toEqual(keywordAnalysis);
      expect(result.jobMatch).toEqual(jobMatch);
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.length).toBeLessThanOrEqual(5);
      expect(result.sectionsAnalysis).toBeDefined();
    });

    it('should include job match data when provided', () => {
      const atsScore: ATSScore = {
        score: 75,
        breakdown: { formatting: 20, sections: 20, keywords: 18, content: 17 },
      };

      const keywordAnalysis: KeywordAnalysis = {
        identifiedKeywords: [],
        missingKeywords: [],
      };

      const structuredData: StructuredData = {
        skills: ['Python'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const sections: ResumeSection[] = [
        { type: 'skills', content: 'Python', confidence: 0.9 },
      ];

      const jobMatch: JobMatchResult = {
        matchPercentage: 60,
        matchingSkills: ['Python'],
        missingSkills: ['Django', 'PostgreSQL'],
      };

      const result = generator.generate(
        atsScore,
        keywordAnalysis,
        structuredData,
        sections,
        jobMatch
      );

      expect(result.jobMatch).toBeDefined();
      expect(result.jobMatch?.matchPercentage).toBe(60);
      expect(result.jobMatch?.matchingSkills).toContain('Python');
      expect(result.jobMatch?.missingSkills).toContain('Django');
    });

    it('should work without job match data', () => {
      const atsScore: ATSScore = {
        score: 80,
        breakdown: { formatting: 20, sections: 20, keywords: 20, content: 20 },
      };

      const keywordAnalysis: KeywordAnalysis = {
        identifiedKeywords: [],
        missingKeywords: [],
      };

      const structuredData: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const sections: ResumeSection[] = [];

      const result = generator.generate(
        atsScore,
        keywordAnalysis,
        structuredData,
        sections
      );

      expect(result.jobMatch).toBeUndefined();
      expect(result.score).toBe(80);
    });
  });

  describe('score status transformation', () => {
    it('should return "excellent" for scores 71-100 (green)', () => {
      const atsScore: ATSScore = {
        score: 85,
        breakdown: { formatting: 22, sections: 23, keywords: 20, content: 20 },
      };

      const result = generator.generate(
        atsScore,
        { identifiedKeywords: [], missingKeywords: [] },
        {
          skills: [],
          experience: [],
          education: [],
          projects: [],
          contact: {},
        },
        []
      );

      expect(result.status).toBe('excellent');
    });

    it('should return "good" for scores 41-70 (yellow)', () => {
      const atsScore: ATSScore = {
        score: 55,
        breakdown: { formatting: 15, sections: 15, keywords: 13, content: 12 },
      };

      const result = generator.generate(
        atsScore,
        { identifiedKeywords: [], missingKeywords: [] },
        {
          skills: [],
          experience: [],
          education: [],
          projects: [],
          contact: {},
        },
        []
      );

      expect(result.status).toBe('good');
    });

    it('should return "needs_improvement" for scores 0-40 (red)', () => {
      const atsScore: ATSScore = {
        score: 30,
        breakdown: { formatting: 8, sections: 7, keywords: 8, content: 7 },
      };

      const result = generator.generate(
        atsScore,
        { identifiedKeywords: [], missingKeywords: [] },
        {
          skills: [],
          experience: [],
          education: [],
          projects: [],
          contact: {},
        },
        []
      );

      expect(result.status).toBe('needs_improvement');
    });
  });

  describe('sections analysis', () => {
    it('should transform detected sections into SectionAnalysis with status indicators', () => {
      const sections: ResumeSection[] = [
        { type: 'skills', content: 'JavaScript', confidence: 0.9 },
        { type: 'experience', content: 'Software Engineer', confidence: 0.95 },
      ];

      const result = generator.generate(
        { score: 70, breakdown: { formatting: 18, sections: 17, keywords: 18, content: 17 } },
        { identifiedKeywords: [], missingKeywords: [] },
        {
          skills: ['JavaScript'],
          experience: [],
          education: [],
          projects: [],
          contact: {},
        },
        sections
      );

      expect(result.sectionsAnalysis).toHaveLength(4); // experience, skills, education, projects
      
      const experienceSection = result.sectionsAnalysis.find(s => s.sectionType === 'experience');
      expect(experienceSection?.present).toBe(true);

      const skillsSection = result.sectionsAnalysis.find(s => s.sectionType === 'skills');
      expect(skillsSection?.present).toBe(true);

      const educationSection = result.sectionsAnalysis.find(s => s.sectionType === 'education');
      expect(educationSection?.present).toBe(false);

      const projectsSection = result.sectionsAnalysis.find(s => s.sectionType === 'projects');
      expect(projectsSection?.present).toBe(false);
    });
  });

  describe('suggestion generation', () => {
    it('should prioritize structural/formatting improvements when score < 70', () => {
      const atsScore: ATSScore = {
        score: 50,
        breakdown: {
          formatting: 10, // Low formatting score
          sections: 12,
          keywords: 15,
          content: 13,
        },
      };

      const result = generator.generate(
        atsScore,
        { identifiedKeywords: [], missingKeywords: [] },
        {
          skills: ['JavaScript'],
          experience: [],
          education: [],
          projects: [],
          contact: {},
        },
        []
      );

      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.some(s => s.includes('formatting'))).toBe(true);
    });

    it('should suggest incorporating missing keywords when identified', () => {
      const keywordAnalysis: KeywordAnalysis = {
        identifiedKeywords: [{ text: 'JavaScript', category: 'technical' }],
        missingKeywords: [
          { text: 'TypeScript', category: 'technical', frequency: 5 },
          { text: 'React', category: 'technical', frequency: 3 },
        ],
      };

      const result = generator.generate(
        { score: 70, breakdown: { formatting: 18, sections: 17, keywords: 18, content: 17 } },
        keywordAnalysis,
        {
          skills: ['JavaScript'],
          experience: [],
          education: [],
          projects: [],
          contact: {},
        },
        []
      );

      expect(result.suggestions.some(s => s.includes('keywords'))).toBe(true);
      expect(result.suggestions.some(s => s.includes('TypeScript'))).toBe(true);
    });

    it('should suggest adding metrics when experience lacks quantifiable achievements', () => {
      const structuredData: StructuredData = {
        skills: ['JavaScript'],
        experience: [
          {
            jobTitle: 'Developer',
            company: 'Company',
            dates: '2020-2023',
            description: 'Worked on web applications', // No metrics
          },
        ],
        education: [],
        projects: [],
        contact: {},
      };

      const atsScore: ATSScore = {
        score: 60,
        breakdown: {
          formatting: 18,
          sections: 17,
          keywords: 15,
          content: 10, // Low content score
        },
      };

      const result = generator.generate(
        atsScore,
        { identifiedKeywords: [], missingKeywords: [] },
        structuredData,
        []
      );

      expect(result.suggestions.some(s => s.includes('quantifiable') || s.includes('numbers'))).toBe(true);
    });

    it('should limit suggestions to top 5 most impactful improvements', () => {
      const atsScore: ATSScore = {
        score: 30, // Very low score to trigger many suggestions
        breakdown: {
          formatting: 5,
          sections: 5,
          keywords: 10,
          content: 10,
        },
      };

      const keywordAnalysis: KeywordAnalysis = {
        identifiedKeywords: [],
        missingKeywords: [
          { text: 'TypeScript', category: 'technical', frequency: 5 },
          { text: 'React', category: 'technical', frequency: 3 },
        ],
      };

      const structuredData: StructuredData = {
        skills: [], // No skills
        experience: [], // No experience
        education: [], // No education
        projects: [],
        contact: {}, // No contact info
      };

      const result = generator.generate(
        atsScore,
        keywordAnalysis,
        structuredData,
        []
      );

      expect(result.suggestions.length).toBeLessThanOrEqual(5);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should suggest adding missing sections when score < 70', () => {
      const atsScore: ATSScore = {
        score: 50,
        breakdown: {
          formatting: 15,
          sections: 10, // Low sections score
          keywords: 13,
          content: 12,
        },
      };

      const sections: ResumeSection[] = [
        { type: 'skills', content: 'JavaScript', confidence: 0.9 },
      ];

      const result = generator.generate(
        atsScore,
        { identifiedKeywords: [], missingKeywords: [] },
        {
          skills: ['JavaScript'],
          experience: [],
          education: [],
          projects: [],
          contact: {},
        },
        sections
      );

      expect(result.suggestions.some(s => s.includes('missing') && s.includes('sections'))).toBe(true);
    });

    it('should suggest using action verbs when content lacks them', () => {
      const structuredData: StructuredData = {
        skills: ['JavaScript'],
        experience: [
          {
            jobTitle: 'Developer',
            company: 'Company',
            dates: '2020-2023',
            description: 'Responsible for web applications', // No action verbs
          },
        ],
        education: [],
        projects: [],
        contact: {},
      };

      const atsScore: ATSScore = {
        score: 60,
        breakdown: {
          formatting: 18,
          sections: 17,
          keywords: 15,
          content: 10, // Low content score
        },
      };

      const result = generator.generate(
        atsScore,
        { identifiedKeywords: [], missingKeywords: [] },
        structuredData,
        []
      );

      expect(result.suggestions.some(s => s.includes('action verbs'))).toBe(true);
    });
  });

  describe('generateError', () => {
    it('should return descriptive error message identifying failed pipeline stage', () => {
      const result = generator.generateError('text_extraction', 'Failed to extract text from PDF');

      expect(result.error).toBe('Failed to extract text from PDF');
      expect(result.errorStage).toBe('text_extraction');
      expect(result.score).toBe(0);
      expect(result.status).toBe('needs_improvement');
      expect(result.suggestions).toEqual([]);
      expect(result.keywords.identifiedKeywords).toEqual([]);
      expect(result.keywords.missingKeywords).toEqual([]);
      expect(result.sectionsAnalysis).toEqual([]);
    });

    it('should handle different pipeline stages', () => {
      const stages = ['file_validation', 'text_extraction', 'section_detection', 'content_analysis'];

      stages.forEach(stage => {
        const result = generator.generateError(stage, `Error in ${stage}`);
        expect(result.errorStage).toBe(stage);
        expect(result.error).toBe(`Error in ${stage}`);
      });
    });
  });
});
