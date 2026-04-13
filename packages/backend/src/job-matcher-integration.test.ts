import { describe, it, expect } from 'vitest';
import { JobMatcher } from './JobMatcher';
import { KeywordAnalyzer } from './KeywordAnalyzer';
import { StructuredData } from '@resume-analyzer/shared';

describe('JobMatcher Integration', () => {
  const matcher = new JobMatcher();
  const keywordAnalyzer = new KeywordAnalyzer();

  it('should work together with KeywordAnalyzer for comprehensive analysis', () => {
    const resumeData: StructuredData = {
      skills: ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS'],
      experience: [
        {
          jobTitle: 'Frontend Developer',
          company: 'Tech Corp',
          dates: '2020-2023',
          description: 'Built web applications using React and TypeScript',
        },
      ],
      education: [],
      projects: [],
      contact: {},
    };

    const jobDescription = 'Looking for JavaScript, React, Python, Django, and AWS experience';

    // Get keyword analysis
    const keywordAnalysis = keywordAnalyzer.analyze(resumeData, jobDescription);

    // Get job match analysis
    const jobMatch = matcher.match(resumeData, jobDescription);

    // Both should identify missing keywords/skills
    expect(keywordAnalysis.missingKeywords.length).toBeGreaterThan(0);
    expect(jobMatch.missingSkills.length).toBeGreaterThan(0);

    // Both should identify matching keywords/skills
    expect(keywordAnalysis.identifiedKeywords.length).toBeGreaterThan(0);
    expect(jobMatch.matchingSkills.length).toBeGreaterThan(0);

    // Match percentage should be reasonable
    expect(jobMatch.matchPercentage).toBeGreaterThan(0);
    expect(jobMatch.matchPercentage).toBeLessThan(100);

    console.log('✓ Integration Test Results:');
    console.log(`  - Keywords identified: ${keywordAnalysis.identifiedKeywords.length}`);
    console.log(`  - Keywords missing: ${keywordAnalysis.missingKeywords.length}`);
    console.log(`  - Job match percentage: ${jobMatch.matchPercentage}%`);
    console.log(`  - Matching skills: ${jobMatch.matchingSkills.length}`);
    console.log(`  - Missing skills: ${jobMatch.missingSkills.length}`);
  });

  it('should provide complementary insights for resume optimization', () => {
    const resumeData: StructuredData = {
      skills: ['Python', 'Django', 'PostgreSQL'],
      experience: [
        {
          jobTitle: 'Backend Developer',
          company: 'Startup',
          dates: '2021-2023',
          description: 'Developed REST APIs using Django and PostgreSQL',
        },
      ],
      education: [],
      projects: [
        {
          name: 'API Service',
          description: 'Built microservices architecture',
          technologies: ['Python', 'Docker', 'Redis'],
        },
      ],
      contact: {},
    };

    const jobDescription = `
      Senior Backend Engineer position requiring:
      - Python and Django expertise
      - PostgreSQL and Redis experience
      - Docker and Kubernetes
      - AWS cloud services
      - Strong leadership and communication skills
    `;

    const keywordAnalysis = keywordAnalyzer.analyze(resumeData, jobDescription);
    const jobMatch = matcher.match(resumeData, jobDescription);

    // Should have high match for backend skills
    expect(jobMatch.matchPercentage).toBeGreaterThan(50);

    // Should identify cloud and soft skills as missing
    expect(jobMatch.missingSkills.some(s => s.includes('aws') || s.includes('kubernetes'))).toBe(true);

    // KeywordAnalyzer should also identify these gaps
    expect(keywordAnalysis.missingKeywords.length).toBeGreaterThan(0);

    console.log('✓ Complementary Analysis:');
    console.log(`  - Match percentage: ${jobMatch.matchPercentage}%`);
    console.log(`  - Top missing skills: ${jobMatch.missingSkills.slice(0, 3).join(', ')}`);
    console.log(`  - Missing keyword categories: ${[...new Set(keywordAnalysis.missingKeywords.map(k => k.category))].join(', ')}`);
  });

  it('should handle high skill match scenario', () => {
    const resumeData: StructuredData = {
      skills: [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Django',
        'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Git',
      ],
      experience: [
        {
          jobTitle: 'Full-Stack Developer',
          company: 'Tech Company',
          dates: '2019-2023',
          description: 'Developed full-stack applications with modern technologies',
        },
      ],
      education: [],
      projects: [],
      contact: {},
    };

    const jobDescription = 'JavaScript, React, Node.js, Python, and Docker required';

    const jobMatch = matcher.match(resumeData, jobDescription);

    // Should have high match percentage
    expect(jobMatch.matchPercentage).toBeGreaterThan(70);
    expect(jobMatch.matchingSkills.length).toBeGreaterThan(0);

    console.log('✓ High Match Scenario:');
    console.log(`  - Match percentage: ${jobMatch.matchPercentage}%`);
    console.log(`  - Matching skills: ${jobMatch.matchingSkills.join(', ')}`);
    console.log(`  - Missing skills: ${jobMatch.missingSkills.join(', ')}`);
  });
});
