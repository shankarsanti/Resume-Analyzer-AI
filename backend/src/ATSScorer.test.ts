import { describe, it, expect } from 'vitest';
import { ATSScorer } from './ATSScorer';
import { StructuredData } from '@resume-analyzer/shared';

describe('ATSScorer', () => {
  const scorer = new ATSScorer();

  describe('calculateScore', () => {
    it('should return a score between 0 and 100', () => {
      const data: StructuredData = {
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: [{
          jobTitle: 'Software Engineer',
          company: 'Tech Corp',
          dates: '2020-2023',
          description: 'Developed web applications using React and Node.js. Improved performance by 50%.'
        }],
        education: [{
          degree: 'BS Computer Science',
          institution: 'University',
          graduationDate: '2020'
        }],
        projects: [],
        contact: { email: 'test@example.com', phone: '123-456-7890' }
      };

      const text = 'Simple resume text with standard formatting';
      const result = scorer.calculateScore(data, text);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should return breakdown with all four categories', () => {
      const data: StructuredData = {
        skills: ['Python'],
        experience: [],
        education: [],
        projects: [],
        contact: {}
      };

      const result = scorer.calculateScore(data, 'Simple text');

      expect(result.breakdown).toHaveProperty('formatting');
      expect(result.breakdown).toHaveProperty('sections');
      expect(result.breakdown).toHaveProperty('keywords');
      expect(result.breakdown).toHaveProperty('content');
    });

    it('should give each category a score between 0 and 25', () => {
      const data: StructuredData = {
        skills: ['JavaScript', 'Python', 'React'],
        experience: [{
          jobTitle: 'Developer',
          company: 'Company',
          dates: '2020-2023',
          description: 'Built applications'
        }],
        education: [{
          degree: 'BS',
          institution: 'University',
          graduationDate: '2020'
        }],
        projects: [],
        contact: { email: 'test@test.com' }
      };

      const result = scorer.calculateScore(data, 'Resume text');

      expect(result.breakdown.formatting).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.formatting).toBeLessThanOrEqual(25);
      expect(result.breakdown.sections).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.sections).toBeLessThanOrEqual(25);
      expect(result.breakdown.keywords).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.keywords).toBeLessThanOrEqual(25);
      expect(result.breakdown.content).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.content).toBeLessThanOrEqual(25);
    });
  });

  describe('formatting evaluation', () => {
    it('should penalize complex formatting with special characters', () => {
      const simpleData: StructuredData = {
        skills: ['JavaScript'],
        experience: [],
        education: [],
        projects: [],
        contact: {}
      };

      const simpleText = 'Simple resume with clean formatting\nNo special characters\nEasy to read';
      const complexText = '║ Complex ║ Resume ║\n├─────────┼─────────┤\n│ With │ Tables │';

      const simpleResult = scorer.calculateScore(simpleData, simpleText);
      const complexResult = scorer.calculateScore(simpleData, complexText);

      expect(simpleResult.breakdown.formatting).toBeGreaterThan(complexResult.breakdown.formatting);
    });

    it('should penalize excessive tabs', () => {
      const data: StructuredData = {
        skills: ['Python'],
        experience: [],
        education: [],
        projects: [],
        contact: {}
      };

      const cleanText = 'Resume without tabs and with reasonable line lengths that are easy to read and parse by ATS systems. This is a normal resume with standard formatting.';
      const tabbedText = 'Resume\t\t\t\twith\t\t\t\tmany\t\t\t\ttabs\t\t\t\teverywhere\t\t\t\t\nMore\t\t\t\ttabs\t\t\t\there\t\t\t\t\nAnd\t\t\t\teven\t\t\t\tmore\t\t\t\ttabs\t\t\t\t';

      const cleanResult = scorer.calculateScore(data, cleanText);
      const tabbedResult = scorer.calculateScore(data, tabbedText);

      expect(cleanResult.breakdown.formatting).toBeGreaterThan(tabbedResult.breakdown.formatting);
    });
  });

  describe('section completeness evaluation', () => {
    it('should reward complete resumes with all standard sections', () => {
      const completeData: StructuredData = {
        skills: ['JavaScript', 'Python'],
        experience: [{
          jobTitle: 'Engineer',
          company: 'Tech Co',
          dates: '2020-2023',
          description: 'Developed software'
        }],
        education: [{
          degree: 'BS Computer Science',
          institution: 'University',
          graduationDate: '2020'
        }],
        projects: [{
          name: 'Project',
          description: 'Built app',
          technologies: ['React']
        }],
        contact: { email: 'test@test.com', phone: '123-456-7890' }
      };

      const incompleteData: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        contact: {}
      };

      const completeResult = scorer.calculateScore(completeData, 'text');
      const incompleteResult = scorer.calculateScore(incompleteData, 'text');

      expect(completeResult.breakdown.sections).toBeGreaterThan(incompleteResult.breakdown.sections);
    });

    it('should give higher scores when more sections are present', () => {
      const oneSection: StructuredData = {
        skills: ['JavaScript'],
        experience: [],
        education: [],
        projects: [],
        contact: {}
      };

      const threeSections: StructuredData = {
        skills: ['JavaScript'],
        experience: [{
          jobTitle: 'Developer',
          company: 'Company',
          dates: '2020-2023',
          description: 'Work'
        }],
        education: [{
          degree: 'BS',
          institution: 'University',
          graduationDate: '2020'
        }],
        projects: [],
        contact: {}
      };

      const oneResult = scorer.calculateScore(oneSection, 'text');
      const threeResult = scorer.calculateScore(threeSections, 'text');

      expect(threeResult.breakdown.sections).toBeGreaterThan(oneResult.breakdown.sections);
    });
  });

  describe('keyword density evaluation', () => {
    it('should reward optimal keyword count (5-20)', () => {
      const optimalData: StructuredData = {
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Git', 'Docker', 'AWS'],
        experience: [],
        education: [],
        projects: [],
        contact: {}
      };

      const sparseData: StructuredData = {
        skills: ['JavaScript'],
        experience: [],
        education: [],
        projects: [],
        contact: {}
      };

      const optimalResult = scorer.calculateScore(optimalData, 'text');
      const sparseResult = scorer.calculateScore(sparseData, 'text');

      expect(optimalResult.breakdown.keywords).toBeGreaterThan(sparseResult.breakdown.keywords);
    });

    it('should penalize keyword stuffing (too many keywords)', () => {
      const stuffedData: StructuredData = {
        skills: Array.from({ length: 40 }, (_, i) => `Skill${i}`),
        experience: [],
        education: [],
        projects: [],
        contact: {}
      };

      const optimalData: StructuredData = {
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Git', 'Docker', 'AWS'],
        experience: [],
        education: [],
        projects: [],
        contact: {}
      };

      const stuffedResult = scorer.calculateScore(stuffedData, 'text');
      const optimalResult = scorer.calculateScore(optimalData, 'text');

      expect(optimalResult.breakdown.keywords).toBeGreaterThan(stuffedResult.breakdown.keywords);
    });

    it('should penalize excessive word repetition', () => {
      const data: StructuredData = {
        skills: ['JavaScript', 'Python', 'React'],
        experience: [],
        education: [],
        projects: [],
        contact: {}
      };

      const normalText = 'Experienced developer with skills in various technologies and frameworks';
      const repetitiveText = 'JavaScript JavaScript JavaScript JavaScript JavaScript JavaScript JavaScript JavaScript JavaScript JavaScript JavaScript JavaScript';

      const normalResult = scorer.calculateScore(data, normalText);
      const repetitiveResult = scorer.calculateScore(data, repetitiveText);

      expect(normalResult.breakdown.keywords).toBeGreaterThan(repetitiveResult.breakdown.keywords);
    });
  });

  describe('content quality evaluation', () => {
    it('should reward quantifiable achievements', () => {
      const withMetrics: StructuredData = {
        skills: [],
        experience: [{
          jobTitle: 'Engineer',
          company: 'Tech Co',
          dates: '2020-2023',
          description: 'Improved performance by 50%. Reduced costs by $10,000. Increased user base by 200%.'
        }],
        education: [],
        projects: [],
        contact: {}
      };

      const withoutMetrics: StructuredData = {
        skills: [],
        experience: [{
          jobTitle: 'Engineer',
          company: 'Tech Co',
          dates: '2020-2023',
          description: 'Worked on various projects and helped the team.'
        }],
        education: [],
        projects: [],
        contact: {}
      };

      const withMetricsResult = scorer.calculateScore(withMetrics, 'text');
      const withoutMetricsResult = scorer.calculateScore(withoutMetrics, 'text');

      expect(withMetricsResult.breakdown.content).toBeGreaterThan(withoutMetricsResult.breakdown.content);
    });

    it('should reward action verbs', () => {
      const withActionVerbs: StructuredData = {
        skills: [],
        experience: [{
          jobTitle: 'Engineer',
          company: 'Tech Co',
          dates: '2020-2023',
          description: 'Developed new features. Implemented security measures. Optimized database queries. Led team initiatives.'
        }],
        education: [],
        projects: [],
        contact: {}
      };

      const withoutActionVerbs: StructuredData = {
        skills: [],
        experience: [{
          jobTitle: 'Engineer',
          company: 'Tech Co',
          dates: '2020-2023',
          description: 'Was responsible for various tasks and duties.'
        }],
        education: [],
        projects: [],
        contact: {}
      };

      const withVerbsResult = scorer.calculateScore(withActionVerbs, 'text');
      const withoutVerbsResult = scorer.calculateScore(withoutActionVerbs, 'text');

      expect(withVerbsResult.breakdown.content).toBeGreaterThan(withoutVerbsResult.breakdown.content);
    });

    it('should reward detailed descriptions', () => {
      const detailedData: StructuredData = {
        skills: [],
        experience: [{
          jobTitle: 'Engineer',
          company: 'Tech Co',
          dates: '2020-2023',
          description: 'Developed and maintained multiple web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality software. Implemented automated testing strategies that improved code coverage by 40%.'
        }],
        education: [],
        projects: [],
        contact: {}
      };

      const briefData: StructuredData = {
        skills: [],
        experience: [{
          jobTitle: 'Engineer',
          company: 'Tech Co',
          dates: '2020-2023',
          description: 'Worked on projects.'
        }],
        education: [],
        projects: [],
        contact: {}
      };

      const detailedResult = scorer.calculateScore(detailedData, 'text');
      const briefResult = scorer.calculateScore(briefData, 'text');

      expect(detailedResult.breakdown.content).toBeGreaterThan(briefResult.breakdown.content);
    });
  });

  describe('edge cases', () => {
    it('should handle empty structured data', () => {
      const emptyData: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        contact: {}
      };

      const result = scorer.calculateScore(emptyData, '');

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle minimal text', () => {
      const data: StructuredData = {
        skills: ['JavaScript'],
        experience: [],
        education: [],
        projects: [],
        contact: {}
      };

      const result = scorer.calculateScore(data, 'a');

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle very long text', () => {
      const data: StructuredData = {
        skills: ['JavaScript'],
        experience: [],
        education: [],
        projects: [],
        contact: {}
      };

      const longText = 'word '.repeat(10000);
      const result = scorer.calculateScore(data, longText);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });
});
