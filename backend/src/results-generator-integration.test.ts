import { describe, it, expect } from 'vitest';
import { ResultsGenerator } from './ResultsGenerator';
import { ATSScorer } from './ATSScorer';
import { KeywordAnalyzer } from './KeywordAnalyzer';
import { JobMatcher } from './JobMatcher';
import { ContentAnalyzer } from './ContentAnalyzer';
import { SectionDetector } from './SectionDetector';

describe('ResultsGenerator Integration', () => {
  const generator = new ResultsGenerator();
  const atsScorer = new ATSScorer();
  const keywordAnalyzer = new KeywordAnalyzer();
  const jobMatcher = new JobMatcher();
  const contentAnalyzer = new ContentAnalyzer();
  const sectionDetector = new SectionDetector();

  it('should generate complete results from real analysis pipeline', () => {
    // Simulate extracted resume text
    const resumeText = `
      John Doe
      john.doe@example.com | (555) 123-4567

      SKILLS
      JavaScript, React, Node.js, TypeScript, MongoDB, AWS

      EXPERIENCE
      Senior Software Engineer at Tech Corp
      Jan 2020 - Present
      Led development of microservices architecture using Node.js and AWS
      Improved application performance by 40% through optimization
      Mentored team of 5 junior developers

      Software Engineer at StartupCo
      Jun 2018 - Dec 2019
      Developed React-based web applications
      Implemented CI/CD pipeline using Jenkins

      EDUCATION
      Bachelor of Science in Computer Science
      University of Technology, 2018

      PROJECTS
      E-commerce Platform
      Built full-stack e-commerce application
      Technologies: React, Node.js, MongoDB, Stripe
    `;

    // Run through analysis pipeline
    const sectionResult = sectionDetector.detectSections(resumeText);
    expect(sectionResult.error).toBeUndefined();
    
    const structuredData = contentAnalyzer.analyze(sectionResult.sections);
    const atsScore = atsScorer.calculateScore(structuredData, resumeText);
    const keywordAnalysis = keywordAnalyzer.analyze(structuredData);

    // Generate results
    const results = generator.generate(
      atsScore,
      keywordAnalysis,
      structuredData,
      sectionResult.sections
    );

    // Verify complete results
    expect(results.score).toBeGreaterThan(0);
    expect(results.score).toBeLessThanOrEqual(100);
    expect(results.status).toBeDefined();
    expect(['excellent', 'good', 'needs_improvement']).toContain(results.status);
    
    expect(results.breakdown).toBeDefined();
    expect(results.breakdown.formatting).toBeGreaterThanOrEqual(0);
    expect(results.breakdown.sections).toBeGreaterThanOrEqual(0);
    expect(results.breakdown.keywords).toBeGreaterThanOrEqual(0);
    expect(results.breakdown.content).toBeGreaterThanOrEqual(0);

    expect(results.suggestions).toBeDefined();
    expect(results.suggestions.length).toBeGreaterThan(0);
    expect(results.suggestions.length).toBeLessThanOrEqual(5);

    expect(results.keywords).toBeDefined();
    expect(results.keywords.identifiedKeywords.length).toBeGreaterThan(0);

    expect(results.sectionsAnalysis).toBeDefined();
    expect(results.sectionsAnalysis.length).toBe(4); // experience, skills, education, projects

    // Verify sections are correctly identified
    const experienceSection = results.sectionsAnalysis.find(s => s.sectionType === 'experience');
    expect(experienceSection?.present).toBe(true);

    const skillsSection = results.sectionsAnalysis.find(s => s.sectionType === 'skills');
    expect(skillsSection?.present).toBe(true);

    const educationSection = results.sectionsAnalysis.find(s => s.sectionType === 'education');
    expect(educationSection?.present).toBe(true);

    const projectsSection = results.sectionsAnalysis.find(s => s.sectionType === 'projects');
    expect(projectsSection?.present).toBe(true);
  });

  it('should generate results with job matching', () => {
    const resumeText = `
      Jane Smith
      jane@example.com

      SKILLS
      Python, Django, PostgreSQL, Docker

      EXPERIENCE
      Backend Developer at WebCo
      2021 - Present
      Developed REST APIs using Django
      Optimized database queries reducing load time by 50%
    `;

    const jobDescription = `
      We are looking for a Backend Developer with experience in:
      - Python and Django
      - PostgreSQL database management
      - Docker containerization
      - AWS cloud services
      - Kubernetes orchestration
    `;

    // Run through analysis pipeline
    const sectionResult = sectionDetector.detectSections(resumeText);
    const structuredData = contentAnalyzer.analyze(sectionResult.sections);
    const atsScore = atsScorer.calculateScore(structuredData, resumeText);
    const keywordAnalysis = keywordAnalyzer.analyze(structuredData, jobDescription);
    const jobMatch = jobMatcher.match(structuredData, jobDescription);

    // Generate results with job matching
    const results = generator.generate(
      atsScore,
      keywordAnalysis,
      structuredData,
      sectionResult.sections,
      jobMatch
    );

    // Verify job match is included
    expect(results.jobMatch).toBeDefined();
    expect(results.jobMatch?.matchPercentage).toBeGreaterThan(0);
    expect(results.jobMatch?.matchPercentage).toBeLessThanOrEqual(100);
    expect(results.jobMatch?.matchedSkills).toBeDefined();
    expect(results.jobMatch?.missingSkills).toBeDefined();

    // Verify missing keywords suggestion is generated
    if (keywordAnalysis.missingKeywords.length > 0) {
      expect(results.suggestions.some(s => s.includes('keywords'))).toBe(true);
    }
  });

  it('should handle low-quality resume with appropriate suggestions', () => {
    const poorResumeText = `
      Bob Johnson
      
      SKILLS
      HTML, CSS
      
      EXPERIENCE
      Developer
      Worked on websites
    `;

    // Run through analysis pipeline
    const sectionResult = sectionDetector.detectSections(poorResumeText);
    const structuredData = contentAnalyzer.analyze(sectionResult.sections);
    const atsScore = atsScorer.calculateScore(structuredData, poorResumeText);
    const keywordAnalysis = keywordAnalyzer.analyze(structuredData);

    // Generate results
    const results = generator.generate(
      atsScore,
      keywordAnalysis,
      structuredData,
      sectionResult.sections
    );

    // Verify low score and appropriate suggestions
    expect(results.score).toBeLessThan(70);
    expect(results.status).not.toBe('excellent');
    
    // Should have suggestions for improvement
    expect(results.suggestions.length).toBeGreaterThan(0);
    
    // Should suggest adding missing sections
    const educationSection = results.sectionsAnalysis.find(s => s.sectionType === 'education');
    if (!educationSection?.present) {
      expect(results.suggestions.some(s => 
        s.includes('education') || s.includes('sections')
      )).toBe(true);
    }

    // Should suggest adding metrics (no quantifiable achievements)
    expect(results.suggestions.some(s => 
      s.includes('quantifiable') || s.includes('numbers') || s.includes('metrics')
    )).toBe(true);
  });

  it('should generate error results when pipeline fails', () => {
    const errorResult = generator.generateError(
      'section_detection',
      'No recognizable sections found in resume'
    );

    expect(errorResult.error).toBe('No recognizable sections found in resume');
    expect(errorResult.errorStage).toBe('section_detection');
    expect(errorResult.score).toBe(0);
    expect(errorResult.status).toBe('needs_improvement');
    expect(errorResult.suggestions).toEqual([]);
    expect(errorResult.sectionsAnalysis).toEqual([]);
  });

  it('should prioritize suggestions correctly based on score', () => {
    // Create a resume with multiple issues
    const resumeText = `
      Test User
      
      SKILLS
      Skill1, Skill2, Skill3, Skill4, Skill5, Skill6, Skill7, Skill8, Skill9, Skill10,
      Skill11, Skill12, Skill13, Skill14, Skill15, Skill16, Skill17, Skill18, Skill19, Skill20,
      Skill21, Skill22, Skill23, Skill24, Skill25, Skill26, Skill27, Skill28, Skill29, Skill30,
      Skill31, Skill32, Skill33, Skill34, Skill35
      
      EXPERIENCE
      Job Title
      Company Name
      Did some work
    `;

    const sectionResult = sectionDetector.detectSections(resumeText);
    const structuredData = contentAnalyzer.analyze(sectionResult.sections);
    const atsScore = atsScorer.calculateScore(structuredData, resumeText);
    const keywordAnalysis = keywordAnalyzer.analyze(structuredData);

    const results = generator.generate(
      atsScore,
      keywordAnalysis,
      structuredData,
      sectionResult.sections
    );

    // Should have exactly 5 suggestions (limit)
    expect(results.suggestions.length).toBeLessThanOrEqual(5);
    
    // If score is low, should prioritize structural improvements
    if (results.score < 70) {
      const hasStructuralSuggestion = results.suggestions.some(s => 
        s.includes('formatting') || s.includes('sections')
      );
      expect(hasStructuralSuggestion).toBe(true);
    }
  });
});
