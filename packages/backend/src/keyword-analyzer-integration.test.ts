import { describe, it, expect } from 'vitest';
import { KeywordAnalyzer } from './KeywordAnalyzer';
import { ContentAnalyzer } from './ContentAnalyzer';
import { SectionDetector } from './SectionDetector';

describe('KeywordAnalyzer Integration Tests', () => {
  const sectionDetector = new SectionDetector();
  const contentAnalyzer = new ContentAnalyzer();
  const keywordAnalyzer = new KeywordAnalyzer();

  it('should analyze keywords from a complete resume text', () => {
    const resumeText = `
      John Doe
      john.doe@email.com | (555) 123-4567
      
      SKILLS
      JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, PostgreSQL, Agile
      
      EXPERIENCE
      Senior Software Engineer | Tech Corp | 2020-2023
      - Developed microservices using Node.js and Express
      - Implemented CI/CD pipelines with Jenkins and Docker
      - Led team of 5 developers using Agile methodology
      
      EDUCATION
      Bachelor of Science in Computer Science
      University of Technology | 2016-2020
      
      PROJECTS
      E-commerce Platform
      Built a scalable platform using React, Node.js, and PostgreSQL
      Technologies: TypeScript, AWS, Redis
    `;

    // Process through the pipeline
    const sections = sectionDetector.detectSections(resumeText);
    const structuredData = contentAnalyzer.analyze(sections.sections);
    const keywordAnalysis = keywordAnalyzer.analyze(structuredData);

    // Verify keywords were identified
    expect(keywordAnalysis.identifiedKeywords.length).toBeGreaterThan(0);
    
    // Check for specific technical keywords
    expect(keywordAnalysis.identifiedKeywords.some(k => 
      k.text.toLowerCase() === 'javascript'
    )).toBe(true);
    expect(keywordAnalysis.identifiedKeywords.some(k => 
      k.text.toLowerCase() === 'react'
    )).toBe(true);
    expect(keywordAnalysis.identifiedKeywords.some(k => 
      k.text.toLowerCase() === 'node.js'
    )).toBe(true);
    
    // Check for agile (now in skills section)
    expect(keywordAnalysis.identifiedKeywords.some(k => 
      k.text.toLowerCase() === 'agile'
    )).toBe(true);
    
    // Verify no missing keywords when no job description
    expect(keywordAnalysis.missingKeywords).toEqual([]);
  });

  it('should identify missing keywords when job description provided', () => {
    const resumeText = `
      SKILLS
      JavaScript, React, HTML, CSS
      
      EXPERIENCE
      Frontend Developer | Web Co | 2021-2023
      Built responsive web applications using React
    `;

    const jobDescription = `
      We are looking for a Full Stack Developer with experience in:
      - Python and Django for backend development
      - React for frontend (required)
      - AWS cloud services
      - Docker containerization
      - PostgreSQL database management
      - Experience with Kubernetes is a plus
    `;

    // Process through the pipeline
    const sections = sectionDetector.detectSections(resumeText);
    const structuredData = contentAnalyzer.analyze(sections.sections);
    const keywordAnalysis = keywordAnalyzer.analyze(structuredData, jobDescription);

    // Should have identified keywords from resume
    expect(keywordAnalysis.identifiedKeywords.some(k => 
      k.text.toLowerCase() === 'react'
    )).toBe(true);

    // Should identify missing keywords from job description
    expect(keywordAnalysis.missingKeywords.length).toBeGreaterThan(0);
    expect(keywordAnalysis.missingKeywords.some(k => 
      k.text.toLowerCase() === 'python'
    )).toBe(true);
    expect(keywordAnalysis.missingKeywords.some(k => 
      k.text.toLowerCase() === 'django'
    )).toBe(true);
    expect(keywordAnalysis.missingKeywords.some(k => 
      k.text.toLowerCase() === 'aws'
    )).toBe(true);
    expect(keywordAnalysis.missingKeywords.some(k => 
      k.text.toLowerCase() === 'docker'
    )).toBe(true);

    // React should NOT be in missing keywords (it's in the resume)
    expect(keywordAnalysis.missingKeywords.some(k => 
      k.text.toLowerCase() === 'react'
    )).toBe(false);
  });

  it('should properly categorize different types of keywords', () => {
    const resumeText = `
      SKILLS
      Python, JavaScript, Leadership, AWS Certified, Jira, Fintech
      
      EXPERIENCE
      Team Lead | Finance Tech | 2020-2023
      Led development team with strong communication skills
    `;

    const sections = sectionDetector.detectSections(resumeText);
    const structuredData = contentAnalyzer.analyze(sections.sections);
    const keywordAnalysis = keywordAnalyzer.analyze(structuredData);

    // Check technical keywords
    const technicalKeywords = keywordAnalysis.identifiedKeywords.filter(
      k => k.category === 'technical'
    );
    expect(technicalKeywords.length).toBeGreaterThan(0);

    // Check soft skill keywords
    const softSkillKeywords = keywordAnalysis.identifiedKeywords.filter(
      k => k.category === 'soft_skill'
    );
    expect(softSkillKeywords.length).toBeGreaterThan(0);

    // Check certification keywords
    const certKeywords = keywordAnalysis.identifiedKeywords.filter(
      k => k.category === 'certification'
    );
    expect(certKeywords.length).toBeGreaterThan(0);

    // Check tool keywords
    const toolKeywords = keywordAnalysis.identifiedKeywords.filter(
      k => k.category === 'tool'
    );
    expect(toolKeywords.length).toBeGreaterThan(0);

    // Check industry keywords
    const industryKeywords = keywordAnalysis.identifiedKeywords.filter(
      k => k.category === 'industry'
    );
    expect(industryKeywords.length).toBeGreaterThan(0);
  });

  it('should rank missing keywords by frequency and importance', () => {
    const resumeText = `
      SKILLS
      HTML, CSS
    `;

    const jobDescription = `
      Required: AWS Certified Solutions Architect
      Must have Python Python Python experience
      Django Django framework knowledge
      Leadership skills
    `;

    const sections = sectionDetector.detectSections(resumeText);
    const structuredData = contentAnalyzer.analyze(sections.sections);
    const keywordAnalysis = keywordAnalyzer.analyze(structuredData, jobDescription);

    // Python should rank high (frequency: 3, category: technical)
    const pythonIndex = keywordAnalysis.missingKeywords.findIndex(
      k => k.text.toLowerCase() === 'python'
    );
    expect(pythonIndex).toBeGreaterThanOrEqual(0);

    // AWS Certified should rank high (category: certification)
    const certIndex = keywordAnalysis.missingKeywords.findIndex(
      k => k.text.toLowerCase().includes('certified')
    );
    expect(certIndex).toBeGreaterThanOrEqual(0);

    // Certification should generally rank higher than soft skills
    const leadershipIndex = keywordAnalysis.missingKeywords.findIndex(
      k => k.text.toLowerCase() === 'leadership'
    );
    
    if (certIndex >= 0 && leadershipIndex >= 0) {
      expect(certIndex).toBeLessThan(leadershipIndex);
    }
  });
});
