import { describe, it, expect } from 'vitest';
import { SectionDetector } from './SectionDetector';

describe('SectionDetector', () => {
  const detector = new SectionDetector();

  describe('Standard Section Detection', () => {
    it('should detect standard skills section', () => {
      const text = `
SKILLS
JavaScript, TypeScript, React, Node.js
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].type).toBe('skills');
      expect(result.sections[0].content).toContain('JavaScript');
      expect(result.sections[0].confidence).toBeGreaterThan(0.7);
    });

    it('should detect standard experience section', () => {
      const text = `
EXPERIENCE
Software Engineer at Tech Corp
2020 - Present
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].type).toBe('experience');
      expect(result.sections[0].content).toContain('Software Engineer');
    });

    it('should detect standard education section', () => {
      const text = `
EDUCATION
Bachelor of Science in Computer Science
University of Technology, 2020
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].type).toBe('education');
      expect(result.sections[0].content).toContain('Bachelor of Science');
    });

    it('should detect projects section', () => {
      const text = `
PROJECTS
E-commerce Platform
Built a full-stack e-commerce application
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].type).toBe('projects');
      expect(result.sections[0].content).toContain('E-commerce');
    });

    it('should detect contact section', () => {
      const text = `
CONTACT
Email: john@example.com
Phone: (555) 123-4567
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].type).toBe('contact');
      expect(result.sections[0].content).toContain('john@example.com');
    });

    it('should detect summary section', () => {
      const text = 'PROFESSIONAL SUMMARY\nExperienced software engineer with 5 years of expertise';

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].type).toBe('summary');
      expect(result.sections[0].content).toContain('Experienced software engineer');
    });

    it('should detect certifications section', () => {
      const text = `
CERTIFICATIONS
AWS Certified Solutions Architect
Google Cloud Professional
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].type).toBe('certifications');
      expect(result.sections[0].content).toContain('AWS Certified');
    });
  });

  describe('Non-Standard Terminology (Fuzzy Matching)', () => {
    it('should map "Work History" to experience', () => {
      const text = `
Work History
Software Engineer at Tech Corp
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].type).toBe('experience');
    });

    it('should map "Technical Skills" to skills', () => {
      const text = `
Technical Skills
Python, Java, C++
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections[0].type).toBe('skills');
    });

    it('should map "Core Competencies" to skills', () => {
      const text = `
Core Competencies
Leadership, Problem Solving, Communication
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections[0].type).toBe('skills');
    });

    it('should map "Employment History" to experience', () => {
      const text = `
Employment History
Senior Developer at StartupCo
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections[0].type).toBe('experience');
    });

    it('should map "Academic Background" to education', () => {
      const text = `
Academic Background
Master of Science in Data Science
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections[0].type).toBe('education');
    });

    it('should map "Career Objective" to summary', () => {
      const text = `
Career Objective
Seeking a challenging role in software development
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections[0].type).toBe('summary');
    });

    it('should map "Professional Certifications" to certifications', () => {
      const text = `
Professional Certifications
PMP, Scrum Master
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections[0].type).toBe('certifications');
    });
  });

  describe('Multiple Sections', () => {
    it('should detect multiple sections in order', () => {
      const text = `
PROFESSIONAL SUMMARY
Experienced software engineer

SKILLS
JavaScript, Python, React

EXPERIENCE
Software Engineer at Tech Corp
2020 - Present

EDUCATION
BS in Computer Science
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections).toHaveLength(4);
      expect(result.sections[0].type).toBe('summary');
      expect(result.sections[1].type).toBe('skills');
      expect(result.sections[2].type).toBe('experience');
      expect(result.sections[3].type).toBe('education');
    });

    it('should extract correct content for each section', () => {
      const text = `
SKILLS
JavaScript, TypeScript

EXPERIENCE
Software Engineer
Developed web applications
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.sections[0].content).toContain('JavaScript');
      expect(result.sections[0].content).not.toContain('Software Engineer');
      expect(result.sections[1].content).toContain('Software Engineer');
      expect(result.sections[1].content).not.toContain('JavaScript');
    });
  });

  describe('Confidence Scores', () => {
    it('should assign higher confidence to all-caps headers', () => {
      const text1 = `
SKILLS
JavaScript
      `.trim();

      const text2 = `
skills
JavaScript
      `.trim();

      const result1 = detector.detectSections(text1);
      const result2 = detector.detectSections(text2);
      
      expect(result1.sections[0].confidence).toBeGreaterThan(result2.sections[0].confidence);
    });

    it('should assign higher confidence to short headers', () => {
      const text = `
SKILLS
JavaScript, Python
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.sections[0].confidence).toBeGreaterThan(0.7);
    });

    it('should assign confidence scores between 0 and 1', () => {
      const text = `
SKILLS
JavaScript

EXPERIENCE
Software Engineer
      `.trim();

      const result = detector.detectSections(text);
      
      result.sections.forEach(section => {
        expect(section.confidence).toBeGreaterThanOrEqual(0);
        expect(section.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Duplicate Section Handling', () => {
    it('should keep section with higher confidence when duplicates exist', () => {
      const text = `
skills
Basic skills list

SKILLS
JavaScript, TypeScript, React, Node.js
      `.trim();

      const result = detector.detectSections(text);
      
      // Should only have one skills section
      const skillsSections = result.sections.filter(s => s.type === 'skills');
      expect(skillsSections).toHaveLength(1);
      
      // Should keep the one with higher confidence (all caps)
      expect(skillsSections[0].content).toContain('JavaScript');
    });
  });

  describe('Error Handling', () => {
    it('should return error when no text provided', () => {
      const result = detector.detectSections('');
      
      expect(result.sections).toHaveLength(0);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('No text provided');
    });

    it('should return error when no recognizable sections found', () => {
      const text = `
This is just some random text
without any section headers
that we can recognize
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.sections).toHaveLength(0);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('No recognizable resume sections found');
    });

    it('should return error when sections have no content', () => {
      const text = `
SKILLS

EXPERIENCE

EDUCATION
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.sections).toHaveLength(0);
      expect(result.error).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle sections with mixed case headers', () => {
      const text = `
Professional Skills
JavaScript, Python
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].type).toBe('skills');
    });

    it('should handle sections with extra whitespace', () => {
      const text = `
   SKILLS   
   
JavaScript, Python
   
   EXPERIENCE   
   
Software Engineer
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections).toHaveLength(2);
    });

    it('should skip very long lines as potential headers', () => {
      const text = `
This is a very long line that contains the word skills but should not be detected as a section header because it is too long to be a reasonable header
JavaScript, Python

SKILLS
React, Node.js
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].content).toContain('React');
    });

    it('should handle resume with only one section', () => {
      const text = `
SKILLS
JavaScript, TypeScript, React, Node.js, Python, Java
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].type).toBe('skills');
    });

    it('should handle sections at the end of document', () => {
      const text = `
SKILLS
JavaScript, Python

EXPERIENCE
Software Engineer at Tech Corp
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.sections).toHaveLength(2);
      expect(result.sections[1].content).toContain('Software Engineer');
    });
  });

  describe('Real-World Resume Formats', () => {
    it('should handle resume with title case headers', () => {
      const text = `
Professional Summary
Experienced developer with 5 years

Technical Skills
JavaScript, Python, React

Work Experience
Senior Developer at TechCo
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle resume with underlined headers (dashes)', () => {
      const text = `
SKILLS
------
JavaScript, Python

EXPERIENCE
----------
Software Engineer
      `.trim();

      const result = detector.detectSections(text);
      
      expect(result.error).toBeUndefined();
      expect(result.sections).toHaveLength(2);
    });
  });
});
