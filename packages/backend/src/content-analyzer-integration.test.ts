import { describe, it, expect } from 'vitest';
import { SectionDetector } from './SectionDetector';
import { ContentAnalyzer } from './ContentAnalyzer';

describe('ContentAnalyzer Integration', () => {
  const sectionDetector = new SectionDetector();
  const contentAnalyzer = new ContentAnalyzer();

  it('should extract structured data from detected sections', () => {
    const resumeText = `CONTACT
john.doe@example.com | (555) 123-4567

SKILLS
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker

EXPERIENCE
Senior Software Engineer at Tech Corp
Jan 2020 - Present
Led development of microservices architecture
Improved system performance by 40%

Software Engineer at StartupCo
2018 - 2020
Developed RESTful APIs using Node.js

EDUCATION
Bachelor of Science in Computer Science, University of Technology
Graduated: May 2018

PROJECTS
E-commerce Platform
Built a full-stack e-commerce application
Technologies: React, Node.js, MongoDB`;

    // Step 1: Detect sections
    const detectionResult = sectionDetector.detectSections(resumeText);
    expect(detectionResult.error).toBeUndefined();
    expect(detectionResult.sections.length).toBeGreaterThan(0);

    // Step 2: Analyze content
    const structuredData = contentAnalyzer.analyze(detectionResult.sections);

    // Verify skills extraction
    expect(structuredData.skills.length).toBeGreaterThan(0);
    expect(structuredData.skills).toContain('JavaScript');
    expect(structuredData.skills).toContain('React');

    // Verify experience extraction
    expect(structuredData.experience.length).toBeGreaterThan(0);
    expect(structuredData.experience[0].jobTitle).toContain('Engineer');
    expect(structuredData.experience[0].company).toBeDefined();
    expect(structuredData.experience[0].dates).toBeDefined();

    // Verify education extraction
    expect(structuredData.education.length).toBeGreaterThan(0);
    expect(structuredData.education[0].degree).toContain('Computer Science');
    expect(structuredData.education[0].institution).toContain('University');

    // Verify projects extraction
    expect(structuredData.projects.length).toBeGreaterThan(0);
    expect(structuredData.projects[0].name).toBe('E-commerce Platform');
    expect(structuredData.projects[0].technologies).toContain('React');

    // Verify contact extraction
    expect(structuredData.contact.email).toBe('john.doe@example.com');
    expect(structuredData.contact.phone).toBeDefined();

    console.log('✓ ContentAnalyzer Integration Test Results:');
    console.log(`  - Skills extracted: ${structuredData.skills.length}`);
    console.log(`  - Experience entries: ${structuredData.experience.length}`);
    console.log(`  - Education entries: ${structuredData.education.length}`);
    console.log(`  - Projects: ${structuredData.projects.length}`);
    console.log(`  - Contact info: email=${!!structuredData.contact.email}, phone=${!!structuredData.contact.phone}`);
  });

  it('should handle resume with minimal sections', () => {
    const resumeText = `SKILLS
Python, Java, C++

EXPERIENCE
Developer at Company A
2020 - Present
Built applications`;

    const detectionResult = sectionDetector.detectSections(resumeText);
    const structuredData = contentAnalyzer.analyze(detectionResult.sections);

    expect(structuredData.skills.length).toBeGreaterThan(0);
    expect(structuredData.experience.length).toBeGreaterThan(0);
    expect(structuredData.education.length).toBe(0);
    expect(structuredData.projects.length).toBe(0);
  });

  it('should handle empty sections gracefully', () => {
    const structuredData = contentAnalyzer.analyze([]);

    expect(structuredData.skills).toEqual([]);
    expect(structuredData.experience).toEqual([]);
    expect(structuredData.education).toEqual([]);
    expect(structuredData.projects).toEqual([]);
    expect(structuredData.contact).toEqual({});
  });
});
