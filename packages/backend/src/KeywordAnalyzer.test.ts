import { describe, it, expect } from 'vitest';
import { KeywordAnalyzer } from './KeywordAnalyzer';
import { StructuredData } from '@resume-analyzer/shared';

describe('KeywordAnalyzer', () => {
  const analyzer = new KeywordAnalyzer();

  describe('analyze() - keyword identification', () => {
    it('should identify technical keywords from skills', () => {
      const data: StructuredData = {
        skills: ['JavaScript', 'Python', 'React', 'Node.js'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const result = analyzer.analyze(data);

      expect(result.identifiedKeywords.length).toBeGreaterThan(0);
      expect(result.identifiedKeywords.some(k => k.text === 'JavaScript')).toBe(true);
      expect(result.identifiedKeywords.some(k => k.text === 'Python')).toBe(true);
      expect(result.identifiedKeywords.some(k => k.category === 'technical')).toBe(true);
    });

    it('should categorize keywords correctly', () => {
      const data: StructuredData = {
        skills: ['JavaScript', 'Leadership', 'AWS Certified', 'Jira', 'Fintech'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const result = analyzer.analyze(data);

      const jsKeyword = result.identifiedKeywords.find(k => k.text === 'JavaScript');
      expect(jsKeyword?.category).toBe('technical');

      const leadershipKeyword = result.identifiedKeywords.find(k => k.text === 'Leadership');
      expect(leadershipKeyword?.category).toBe('soft_skill');

      const certKeyword = result.identifiedKeywords.find(k => k.text === 'AWS Certified');
      expect(certKeyword?.category).toBe('certification');

      const toolKeyword = result.identifiedKeywords.find(k => k.text === 'Jira');
      expect(toolKeyword?.category).toBe('tool');

      const industryKeyword = result.identifiedKeywords.find(k => k.text === 'Fintech');
      expect(industryKeyword?.category).toBe('industry');
    });

    it('should extract keywords from experience descriptions', () => {
      const data: StructuredData = {
        skills: [],
        experience: [
          {
            jobTitle: 'Software Engineer',
            company: 'Tech Corp',
            dates: '2020-2023',
            description: 'Developed applications using React and Node.js with Docker deployment',
          },
        ],
        education: [],
        projects: [],
        contact: {},
      };

      const result = analyzer.analyze(data);

      expect(result.identifiedKeywords.some(k => k.text.toLowerCase() === 'react')).toBe(true);
      expect(result.identifiedKeywords.some(k => k.text.toLowerCase() === 'node.js')).toBe(true);
      expect(result.identifiedKeywords.some(k => k.text.toLowerCase() === 'docker')).toBe(true);
    });

    it('should extract keywords from project technologies', () => {
      const data: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [
          {
            name: 'E-commerce Platform',
            description: 'Built a scalable platform',
            technologies: ['TypeScript', 'PostgreSQL', 'AWS'],
          },
        ],
        contact: {},
      };

      const result = analyzer.analyze(data);

      expect(result.identifiedKeywords.some(k => k.text === 'TypeScript')).toBe(true);
      expect(result.identifiedKeywords.some(k => k.text === 'PostgreSQL')).toBe(true);
      expect(result.identifiedKeywords.some(k => k.text === 'AWS')).toBe(true);
    });

    it('should not duplicate keywords', () => {
      const data: StructuredData = {
        skills: ['JavaScript', 'React'],
        experience: [
          {
            jobTitle: 'Developer',
            company: 'Tech',
            dates: '2020-2023',
            description: 'Used JavaScript and React daily',
          },
        ],
        education: [],
        projects: [
          {
            name: 'Project',
            description: 'Built with React',
            technologies: ['JavaScript'],
          },
        ],
        contact: {},
      };

      const result = analyzer.analyze(data);

      const jsCount = result.identifiedKeywords.filter(k => k.text === 'JavaScript').length;
      const reactCount = result.identifiedKeywords.filter(k => k.text === 'React').length;

      expect(jsCount).toBe(1);
      expect(reactCount).toBe(1);
    });

    it('should handle empty structured data', () => {
      const data: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const result = analyzer.analyze(data);

      expect(result.identifiedKeywords).toEqual([]);
      expect(result.missingKeywords).toEqual([]);
    });
  });

  describe('analyze() - missing keyword identification', () => {
    it('should identify missing keywords when job description provided', () => {
      const data: StructuredData = {
        skills: ['JavaScript', 'React'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'Looking for a developer with Python, Django, and AWS experience';

      const result = analyzer.analyze(data, jobDescription);

      expect(result.missingKeywords.length).toBeGreaterThan(0);
      expect(result.missingKeywords.some(k => k.text.toLowerCase() === 'python')).toBe(true);
      expect(result.missingKeywords.some(k => k.text.toLowerCase() === 'django')).toBe(true);
      expect(result.missingKeywords.some(k => k.text.toLowerCase() === 'aws')).toBe(true);
    });

    it('should not include resume keywords in missing keywords', () => {
      const data: StructuredData = {
        skills: ['Python', 'Django'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'Looking for Python and Django developer';

      const result = analyzer.analyze(data, jobDescription);

      expect(result.missingKeywords.some(k => k.text.toLowerCase() === 'python')).toBe(false);
      expect(result.missingKeywords.some(k => k.text.toLowerCase() === 'django')).toBe(false);
    });

    it('should rank missing keywords by frequency', () => {
      const data: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'Python Python Python Django Django AWS';

      const result = analyzer.analyze(data, jobDescription);

      // Python should appear first (frequency 3)
      const pythonIndex = result.missingKeywords.findIndex(k => k.text.toLowerCase() === 'python');
      const djangoIndex = result.missingKeywords.findIndex(k => k.text.toLowerCase() === 'django');
      const awsIndex = result.missingKeywords.findIndex(k => k.text.toLowerCase() === 'aws');

      expect(pythonIndex).toBeGreaterThanOrEqual(0);
      expect(pythonIndex).toBeLessThan(djangoIndex);
      expect(djangoIndex).toBeLessThan(awsIndex);
    });

    it('should include frequency in missing keywords', () => {
      const data: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'Python Python Django';

      const result = analyzer.analyze(data, jobDescription);

      const pythonKeyword = result.missingKeywords.find(k => k.text.toLowerCase() === 'python');
      const djangoKeyword = result.missingKeywords.find(k => k.text.toLowerCase() === 'django');

      expect(pythonKeyword?.frequency).toBe(2);
      expect(djangoKeyword?.frequency).toBe(1);
    });

    it('should rank by importance when frequency is equal', () => {
      const data: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      // All keywords appear once, but different categories
      const jobDescription = 'AWS Certified leadership';

      const result = analyzer.analyze(data, jobDescription);

      // Certification should rank higher than soft_skill
      const certIndex = result.missingKeywords.findIndex(k => k.category === 'certification');
      const softSkillIndex = result.missingKeywords.findIndex(k => k.category === 'soft_skill');

      expect(certIndex).toBeGreaterThanOrEqual(0);
      expect(softSkillIndex).toBeGreaterThanOrEqual(0);
      expect(certIndex).toBeLessThan(softSkillIndex);
    });

    it('should return empty missing keywords when no job description provided', () => {
      const data: StructuredData = {
        skills: ['JavaScript'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const result = analyzer.analyze(data);

      expect(result.missingKeywords).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in keywords', () => {
      const data: StructuredData = {
        skills: ['C++', 'C#', 'Node.js', '.NET'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const result = analyzer.analyze(data);

      expect(result.identifiedKeywords.some(k => k.text === 'C++')).toBe(true);
      expect(result.identifiedKeywords.some(k => k.text === 'C#')).toBe(true);
      expect(result.identifiedKeywords.some(k => k.text === 'Node.js')).toBe(true);
      expect(result.identifiedKeywords.some(k => k.text === '.NET')).toBe(true);
    });

    it('should handle case-insensitive matching', () => {
      const data: StructuredData = {
        skills: ['JAVASCRIPT', 'python', 'ReAcT'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'JavaScript Python React';

      const result = analyzer.analyze(data, jobDescription);

      // Should not show as missing since they match case-insensitively
      expect(result.missingKeywords.some(k => k.text.toLowerCase() === 'javascript')).toBe(false);
      expect(result.missingKeywords.some(k => k.text.toLowerCase() === 'python')).toBe(false);
      expect(result.missingKeywords.some(k => k.text.toLowerCase() === 'react')).toBe(false);
    });

    it('should filter out very short keywords', () => {
      const data: StructuredData = {
        skills: ['a', 'ab', 'abc', 'JavaScript'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const result = analyzer.analyze(data);

      // Should not include 'a' or 'ab' (too short)
      expect(result.identifiedKeywords.some(k => k.text === 'a')).toBe(false);
      expect(result.identifiedKeywords.some(k => k.text === 'ab')).toBe(false);
      // Should include longer keywords
      expect(result.identifiedKeywords.some(k => k.text === 'JavaScript')).toBe(true);
    });

    it('should handle multi-word keywords', () => {
      const data: StructuredData = {
        skills: ['Machine Learning', 'Deep Learning'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const result = analyzer.analyze(data);

      expect(result.identifiedKeywords.some(k => k.text === 'Machine Learning')).toBe(true);
      expect(result.identifiedKeywords.some(k => k.text === 'Deep Learning')).toBe(true);
    });
  });
});
