import { describe, it, expect } from 'vitest';
import { JobMatcher } from './JobMatcher';
import { StructuredData } from '@resume-analyzer/shared';

describe('JobMatcher', () => {
  const matcher = new JobMatcher();

  describe('match() - basic matching', () => {
    it('should calculate 100% match when all required skills are present', () => {
      const data: StructuredData = {
        skills: ['JavaScript', 'Python', 'React'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'Looking for a developer with JavaScript, Python, and React experience';

      const result = matcher.match(data, jobDescription);

      expect(result.matchPercentage).toBe(100);
      expect(result.matchingSkills).toHaveLength(3);
      expect(result.missingSkills).toHaveLength(0);
    });

    it('should calculate 0% match when no required skills are present', () => {
      const data: StructuredData = {
        skills: ['Java', 'Spring'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'Looking for Python, Django, and AWS experience';

      const result = matcher.match(data, jobDescription);

      expect(result.matchPercentage).toBe(0);
      expect(result.matchingSkills).toHaveLength(0);
      expect(result.missingSkills.length).toBeGreaterThan(0);
    });

    it('should calculate partial match percentage correctly', () => {
      const data: StructuredData = {
        skills: ['JavaScript', 'React'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'Looking for JavaScript, React, Python, and Django';

      const result = matcher.match(data, jobDescription);

      expect(result.matchPercentage).toBe(50); // 2 out of 4
      expect(result.matchingSkills).toHaveLength(2);
      expect(result.missingSkills).toHaveLength(2);
    });

    it('should handle empty resume', () => {
      const data: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'Looking for JavaScript and Python';

      const result = matcher.match(data, jobDescription);

      expect(result.matchPercentage).toBe(0);
      expect(result.matchingSkills).toHaveLength(0);
      expect(result.missingSkills.length).toBeGreaterThan(0);
    });

    it('should handle empty job description', () => {
      const data: StructuredData = {
        skills: ['JavaScript', 'Python'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = '';

      const result = matcher.match(data, jobDescription);

      expect(result.matchPercentage).toBe(0);
      expect(result.matchingSkills).toHaveLength(0);
      expect(result.missingSkills).toHaveLength(0);
    });
  });

  describe('match() - skill extraction from job description', () => {
    it('should extract technical skills from job description', () => {
      const data: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'We need JavaScript, Python, React, and Docker skills';

      const result = matcher.match(data, jobDescription);

      expect(result.missingSkills).toContain('javascript');
      expect(result.missingSkills).toContain('python');
      expect(result.missingSkills).toContain('react');
      expect(result.missingSkills).toContain('docker');
    });

    it('should extract soft skills from job description', () => {
      const data: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'Strong leadership and communication skills required';

      const result = matcher.match(data, jobDescription);

      expect(result.missingSkills).toContain('leadership');
      expect(result.missingSkills).toContain('communication');
    });

    it('should extract certifications from job description', () => {
      const data: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'AWS Certified and Scrum Master certification preferred';

      const result = matcher.match(data, jobDescription);

      expect(result.missingSkills.some(s => s.includes('aws'))).toBe(true);
      expect(result.missingSkills.some(s => s.includes('scrum'))).toBe(true);
    });

    it('should handle multi-word skills', () => {
      const data: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'Experience with Machine Learning and Deep Learning required';

      const result = matcher.match(data, jobDescription);

      expect(result.missingSkills.some(s => s.includes('machine learning'))).toBe(true);
      expect(result.missingSkills.some(s => s.includes('deep learning'))).toBe(true);
    });

    it('should not duplicate skills in extraction', () => {
      const data: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'Python Python Python experience required';

      const result = matcher.match(data, jobDescription);

      const pythonCount = result.missingSkills.filter(s => s === 'python').length;
      expect(pythonCount).toBe(1);
    });
  });

  describe('match() - skill extraction from resume', () => {
    it('should extract skills from skills section', () => {
      const data: StructuredData = {
        skills: ['JavaScript', 'Python', 'React'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'JavaScript and Python required';

      const result = matcher.match(data, jobDescription);

      expect(result.matchingSkills).toContain('javascript');
      expect(result.matchingSkills).toContain('python');
    });

    it('should extract skills from experience descriptions', () => {
      const data: StructuredData = {
        skills: [],
        experience: [
          {
            jobTitle: 'Developer',
            company: 'Tech Corp',
            dates: '2020-2023',
            description: 'Worked with React and Node.js daily',
          },
        ],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'React and Node.js experience required';

      const result = matcher.match(data, jobDescription);

      expect(result.matchingSkills.length).toBeGreaterThan(0);
    });

    it('should extract skills from project technologies', () => {
      const data: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [
          {
            name: 'E-commerce',
            description: 'Built a platform',
            technologies: ['TypeScript', 'PostgreSQL', 'Docker'],
          },
        ],
        contact: {},
      };

      const jobDescription = 'TypeScript, PostgreSQL, and Docker required';

      const result = matcher.match(data, jobDescription);

      expect(result.matchingSkills.length).toBe(3);
      expect(result.missingSkills).toHaveLength(0);
    });

    it('should extract skills from project descriptions', () => {
      const data: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [
          {
            name: 'API',
            description: 'Built REST API using Python and Flask',
            technologies: [],
          },
        ],
        contact: {},
      };

      const jobDescription = 'Python and Flask experience';

      const result = matcher.match(data, jobDescription);

      expect(result.matchingSkills.length).toBeGreaterThan(0);
    });

    it('should not duplicate skills from multiple sources', () => {
      const data: StructuredData = {
        skills: ['JavaScript'],
        experience: [
          {
            jobTitle: 'Dev',
            company: 'Corp',
            dates: '2020-2023',
            description: 'Used JavaScript',
          },
        ],
        education: [],
        projects: [
          {
            name: 'Project',
            description: 'JavaScript project',
            technologies: ['JavaScript'],
          },
        ],
        contact: {},
      };

      const jobDescription = 'JavaScript required';

      const result = matcher.match(data, jobDescription);

      expect(result.matchingSkills).toHaveLength(1);
      expect(result.matchPercentage).toBe(100);
    });
  });

  describe('match() - matching and missing skills identification', () => {
    it('should correctly identify matching skills', () => {
      const data: StructuredData = {
        skills: ['JavaScript', 'Python', 'React', 'Docker'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'JavaScript, Python, and AWS required';

      const result = matcher.match(data, jobDescription);

      expect(result.matchingSkills).toContain('javascript');
      expect(result.matchingSkills).toContain('python');
      expect(result.matchingSkills).not.toContain('react');
      expect(result.matchingSkills).not.toContain('docker');
    });

    it('should correctly identify missing skills', () => {
      const data: StructuredData = {
        skills: ['JavaScript', 'React'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'JavaScript, Python, Django, and AWS required';

      const result = matcher.match(data, jobDescription);

      expect(result.missingSkills).toContain('python');
      expect(result.missingSkills).toContain('django');
      expect(result.missingSkills).toContain('aws');
      expect(result.missingSkills).not.toContain('javascript');
    });

    it('should handle case-insensitive matching', () => {
      const data: StructuredData = {
        skills: ['JAVASCRIPT', 'python', 'ReAcT'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'JavaScript, Python, and React required';

      const result = matcher.match(data, jobDescription);

      expect(result.matchPercentage).toBe(100);
      expect(result.matchingSkills).toHaveLength(3);
      expect(result.missingSkills).toHaveLength(0);
    });
  });

  describe('match() - missing skills ranking', () => {
    it('should rank certifications higher than other skills', () => {
      const data: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'JavaScript, AWS Certified, and leadership required';

      const result = matcher.match(data, jobDescription);

      // Certification should appear first
      const certIndex = result.missingSkills.findIndex(s => s.includes('aws') || s.includes('certified'));
      const jsIndex = result.missingSkills.findIndex(s => s === 'javascript');

      expect(certIndex).toBeGreaterThanOrEqual(0);
      expect(certIndex).toBeLessThan(jsIndex);
    });

    it('should rank technical skills higher than soft skills', () => {
      const data: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'Python and leadership skills required';

      const result = matcher.match(data, jobDescription);

      const techIndex = result.missingSkills.findIndex(s => s === 'python');
      const softIndex = result.missingSkills.findIndex(s => s === 'leadership');

      expect(techIndex).toBeGreaterThanOrEqual(0);
      expect(softIndex).toBeGreaterThanOrEqual(0);
      expect(techIndex).toBeLessThan(softIndex);
    });

    it('should rank by frequency when category weight is equal', () => {
      const data: StructuredData = {
        skills: [],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'Python Python Python Django Django JavaScript';

      const result = matcher.match(data, jobDescription);

      const pythonIndex = result.missingSkills.findIndex(s => s === 'python');
      const djangoIndex = result.missingSkills.findIndex(s => s === 'django');
      const jsIndex = result.missingSkills.findIndex(s => s === 'javascript');

      // Python (3x) should rank higher than Django (2x) and JavaScript (1x)
      expect(pythonIndex).toBeLessThan(djangoIndex);
      expect(djangoIndex).toBeLessThan(jsIndex);
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in skills', () => {
      const data: StructuredData = {
        skills: ['C++', 'C#', 'Node.js'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'C++, C#, and Node.js required';

      const result = matcher.match(data, jobDescription);

      expect(result.matchPercentage).toBeGreaterThan(0);
      expect(result.matchingSkills.length).toBeGreaterThan(0);
    });

    it('should handle job description with no recognizable skills', () => {
      const data: StructuredData = {
        skills: ['JavaScript'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'We are looking for a great person to join our team';

      const result = matcher.match(data, jobDescription);

      expect(result.matchPercentage).toBe(0);
      expect(result.matchingSkills).toHaveLength(0);
      expect(result.missingSkills).toHaveLength(0);
    });

    it('should round match percentage to nearest integer', () => {
      const data: StructuredData = {
        skills: ['JavaScript'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'JavaScript, Python, and React required';

      const result = matcher.match(data, jobDescription);

      // 1/3 = 33.33%, should round to 33
      expect(result.matchPercentage).toBe(33);
      expect(Number.isInteger(result.matchPercentage)).toBe(true);
    });

    it('should handle very long job descriptions', () => {
      const data: StructuredData = {
        skills: ['JavaScript', 'Python'],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = `
        We are looking for an experienced developer with JavaScript and Python skills.
        The ideal candidate will have experience with React, Node.js, Django, Flask,
        Docker, Kubernetes, AWS, Azure, PostgreSQL, MongoDB, Redis, and many other
        technologies. Strong communication and leadership skills are essential.
        AWS Certified and Scrum Master certifications are preferred.
      `;

      const result = matcher.match(data, jobDescription);

      expect(result.matchPercentage).toBeGreaterThan(0);
      expect(result.matchPercentage).toBeLessThan(100);
      expect(result.matchingSkills.length).toBeGreaterThan(0);
      expect(result.missingSkills.length).toBeGreaterThan(0);
    });

    it('should handle resume with many skills', () => {
      const data: StructuredData = {
        skills: [
          'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Angular',
          'Node.js', 'Express', 'Django', 'Spring', 'Docker', 'Kubernetes',
          'AWS', 'Azure', 'PostgreSQL', 'MongoDB', 'Leadership', 'Communication',
        ],
        experience: [],
        education: [],
        projects: [],
        contact: {},
      };

      const jobDescription = 'JavaScript, React, and Docker required';

      const result = matcher.match(data, jobDescription);

      expect(result.matchPercentage).toBe(100);
      expect(result.matchingSkills).toHaveLength(3);
      expect(result.missingSkills).toHaveLength(0);
    });
  });
});
