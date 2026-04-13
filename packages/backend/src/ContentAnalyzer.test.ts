import { describe, it, expect } from 'vitest';
import { ContentAnalyzer } from './ContentAnalyzer';
import { ResumeSection } from '@resume-analyzer/shared';

describe('ContentAnalyzer', () => {
  const analyzer = new ContentAnalyzer();

  describe('Skills Extraction', () => {
    it('should extract comma-separated skills', () => {
      const sections: ResumeSection[] = [{
        type: 'skills',
        content: 'JavaScript, TypeScript, React, Node.js',
        confidence: 1.0
      }];

      const result = analyzer.analyze(sections);
      
      expect(result.skills).toHaveLength(4);
      expect(result.skills).toContain('JavaScript');
      expect(result.skills).toContain('TypeScript');
      expect(result.skills).toContain('React');
      expect(result.skills).toContain('Node.js');
    });

    it('should extract bulleted skills', () => {
      const sections: ResumeSection[] = [{
        type: 'skills',
        content: '• Python\n• Java\n• C++\n• SQL',
        confidence: 1.0
      }];

      const result = analyzer.analyze(sections);
      
      expect(result.skills).toHaveLength(4);
      expect(result.skills).toContain('Python');
      expect(result.skills).toContain('Java');
      expect(result.skills).toContain('C++');
      expect(result.skills).toContain('SQL');
    });

    it('should extract skills from paragraph format', () => {
      const sections: ResumeSection[] = [{
        type: 'skills',
        content: 'React\nVue.js\nAngular',
        confidence: 1.0
      }];

      const result = analyzer.analyze(sections);
      
      expect(result.skills).toHaveLength(3);
      expect(result.skills).toContain('React');
      expect(result.skills).toContain('Vue.js');
      expect(result.skills).toContain('Angular');
    });

    it('should handle mixed formats', () => {
      const sections: ResumeSection[] = [{
        type: 'skills',
        content: '• JavaScript, TypeScript, React\n• Python, Django\nDocker',
        confidence: 1.0
      }];

      const result = analyzer.analyze(sections);
      
      expect(result.skills.length).toBeGreaterThanOrEqual(5);
      expect(result.skills).toContain('JavaScript');
      expect(result.skills).toContain('Python');
      expect(result.skills).toContain('Docker');
    });

    it('should remove duplicate skills', () => {
      const sections: ResumeSection[] = [{
        type: 'skills',
        content: 'JavaScript, JavaScript, React, React',
        confidence: 1.0
      }];

      const result = analyzer.analyze(sections);
      
      expect(result.skills).toHaveLength(2);
      expect(result.skills).toContain('JavaScript');
      expect(result.skills).toContain('React');
    });
  });

  describe('Experience Extraction', () => {
    it('should extract experience with job title, company, dates, and description', () => {
      const sections: ResumeSection[] = [{
        type: 'experience',
        content: `Software Engineer at Tech Corp
Jan 2020 - Present
Developed web applications using React and Node.js
Led team of 5 developers`,
        confidence: 1.0
      }];

      const result = analyzer.analyze(sections);
      
      expect(result.experience).toHaveLength(1);
      expect(result.experience[0].jobTitle).toBe('Software Engineer');
      expect(result.experience[0].company).toBe('Tech Corp');
      expect(result.experience[0].dates).toContain('2020');
      expect(result.experience[0].description).toContain('React');
    });

    it('should extract multiple experience entries', () => {
      const sections: ResumeSection[] = [{
        type: 'experience',
        content: `Senior Developer at Company A
2021 - Present
Built scalable systems

Junior Developer at Company B
2019 - 2021
Maintained legacy code`,
        confidence: 1.0
      }];

      const result = analyzer.analyze(sections);
      
      expect(result.experience).toHaveLength(2);
      expect(result.experience[0].jobTitle).toContain('Developer');
      expect(result.experience[0].company).toContain('Company');
      expect(result.experience[1].jobTitle).toContain('Developer');
    });

    it('should handle experience with dates on separate line', () => {
      const sections: ResumeSection[] = [{
        type: 'experience',
        content: `Software Engineer
Tech Company
Jan 2020 - Dec 2022
Developed features`,
        confidence: 1.0
      }];

      const result = analyzer.analyze(sections);
      
      expect(result.experience).toHaveLength(1);
      expect(result.experience[0].jobTitle).toBe('Software Engineer');
      expect(result.experience[0].company).toBe('Tech Company');
      expect(result.experience[0].dates).toContain('2020');
    });
  });

  describe('Education Extraction', () => {
    it('should extract education with degree, institution, and graduation date', () => {
      const sections: ResumeSection[] = [{
        type: 'education',
        content: `Bachelor of Science in Computer Science, University of Technology
Graduated: May 2019`,
        confidence: 1.0
      }];

      const result = analyzer.analyze(sections);
      
      expect(result.education).toHaveLength(1);
      expect(result.education[0].degree).toContain('Bachelor');
      expect(result.education[0].institution).toContain('University');
      expect(result.education[0].graduationDate).toContain('2019');
    });

    it('should extract multiple education entries', () => {
      const sections: ResumeSection[] = [{
        type: 'education',
        content: `Master of Science in Computer Science
MIT
2021

Bachelor of Science in Computer Science
Stanford University
2019`,
        confidence: 1.0
      }];

      const result = analyzer.analyze(sections);
      
      expect(result.education).toHaveLength(2);
      expect(result.education[0].degree).toContain('Master');
      expect(result.education[1].degree).toContain('Bachelor');
    });

    it('should handle education with comma-separated format', () => {
      const sections: ResumeSection[] = [{
        type: 'education',
        content: 'B.S. Computer Science, Harvard University, 2020',
        confidence: 1.0
      }];

      const result = analyzer.analyze(sections);
      
      expect(result.education).toHaveLength(1);
      expect(result.education[0].degree).toContain('Computer Science');
      expect(result.education[0].institution).toContain('Harvard');
    });
  });

  describe('Projects Extraction', () => {
    it('should extract project with name, description, and technologies', () => {
      const sections: ResumeSection[] = [{
        type: 'projects',
        content: `E-commerce Platform
Built a full-stack e-commerce application
Technologies: React, Node.js, MongoDB`,
        confidence: 1.0
      }];

      const result = analyzer.analyze(sections);
      
      expect(result.projects).toHaveLength(1);
      expect(result.projects[0].name).toBe('E-commerce Platform');
      expect(result.projects[0].description).toContain('e-commerce');
      expect(result.projects[0].technologies).toContain('React');
      expect(result.projects[0].technologies).toContain('Node.js');
    });

    it('should extract multiple projects', () => {
      const sections: ResumeSection[] = [{
        type: 'projects',
        content: `Project A
Description of project A
Tech: Python, Django

Project B
Description of project B
Tech: JavaScript, React`,
        confidence: 1.0
      }];

      const result = analyzer.analyze(sections);
      
      expect(result.projects).toHaveLength(2);
      expect(result.projects[0].name).toBe('Project A');
      expect(result.projects[1].name).toBe('Project B');
    });

    it('should extract project dates when present', () => {
      const sections: ResumeSection[] = [{
        type: 'projects',
        content: `Mobile App - 2022
Built a mobile application
Technologies: React Native`,
        confidence: 1.0
      }];

      const result = analyzer.analyze(sections);
      
      expect(result.projects).toHaveLength(1);
      expect(result.projects[0].dates).toContain('2022');
    });
  });

  describe('Contact Information Extraction', () => {
    it('should extract email address', () => {
      const sections: ResumeSection[] = [{
        type: 'contact',
        content: 'Email: john.doe@example.com\nPhone: 123-456-7890',
        confidence: 1.0
      }];

      const result = analyzer.analyze(sections);
      
      expect(result.contact.email).toBe('john.doe@example.com');
    });

    it('should extract phone number in various formats', () => {
      const testCases = [
        '(123) 456-7890',
        '123-456-7890',
        '123.456.7890',
        '+1 123 456 7890'
      ];

      testCases.forEach(phone => {
        const sections: ResumeSection[] = [{
          type: 'contact',
          content: `Phone: ${phone}`,
          confidence: 1.0
        }];

        const result = analyzer.analyze(sections);
        expect(result.contact.phone).toBeDefined();
      });
    });

    it('should extract both email and phone', () => {
      const sections: ResumeSection[] = [{
        type: 'contact',
        content: 'john.doe@example.com\n(555) 123-4567',
        confidence: 1.0
      }];

      const result = analyzer.analyze(sections);
      
      expect(result.contact.email).toBe('john.doe@example.com');
      expect(result.contact.phone).toBeDefined();
    });
  });

  describe('Empty Sections', () => {
    it('should return empty arrays for missing sections', () => {
      const sections: ResumeSection[] = [{
        type: 'skills',
        content: 'JavaScript, Python',
        confidence: 1.0
      }];

      const result = analyzer.analyze(sections);
      
      expect(result.skills).toHaveLength(2);
      expect(result.experience).toHaveLength(0);
      expect(result.education).toHaveLength(0);
      expect(result.projects).toHaveLength(0);
    });

    it('should handle empty sections array', () => {
      const sections: ResumeSection[] = [];

      const result = analyzer.analyze(sections);
      
      expect(result.skills).toHaveLength(0);
      expect(result.experience).toHaveLength(0);
      expect(result.education).toHaveLength(0);
      expect(result.projects).toHaveLength(0);
      expect(result.contact).toEqual({});
    });
  });

  describe('Complete Resume Analysis', () => {
    it('should extract all sections from a complete resume', () => {
      const sections: ResumeSection[] = [
        {
          type: 'contact',
          content: 'john.doe@example.com\n(555) 123-4567',
          confidence: 1.0
        },
        {
          type: 'skills',
          content: 'JavaScript, TypeScript, React, Node.js, Python',
          confidence: 1.0
        },
        {
          type: 'experience',
          content: `Senior Software Engineer at Tech Corp
Jan 2020 - Present
Led development of web applications`,
          confidence: 1.0
        },
        {
          type: 'education',
          content: 'Bachelor of Science in Computer Science, MIT, 2019',
          confidence: 1.0
        },
        {
          type: 'projects',
          content: `E-commerce Platform
Built full-stack application
Technologies: React, Node.js`,
          confidence: 1.0
        }
      ];

      const result = analyzer.analyze(sections);
      
      expect(result.skills.length).toBeGreaterThan(0);
      expect(result.experience.length).toBeGreaterThan(0);
      expect(result.education.length).toBeGreaterThan(0);
      expect(result.projects.length).toBeGreaterThan(0);
      expect(result.contact.email).toBeDefined();
      expect(result.contact.phone).toBeDefined();
    });
  });
});
