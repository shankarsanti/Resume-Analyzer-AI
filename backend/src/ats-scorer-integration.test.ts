import { describe, it, expect } from 'vitest';
import { ATSScorer } from './ATSScorer';
import { ContentAnalyzer } from './ContentAnalyzer';
import { SectionDetector } from './SectionDetector';

describe('ATSScorer Integration', () => {
  const scorer = new ATSScorer();
  const analyzer = new ContentAnalyzer();
  const detector = new SectionDetector();

  it('should score a complete resume higher than an incomplete one', () => {
    // Complete resume text
    const completeResumeText = `
John Doe
john.doe@email.com | (555) 123-4567

SUMMARY
Experienced software engineer with 5+ years of experience

SKILLS
JavaScript, Python, React, Node.js, TypeScript, Git, Docker, AWS

EXPERIENCE
Senior Software Engineer at Tech Corp
Jan 2020 - Present
Developed and maintained web applications using React and Node.js. Improved performance by 50% and reduced costs by $10,000. Led team of 5 developers.

Software Engineer at StartUp Inc
Jun 2018 - Dec 2019
Built scalable backend services. Implemented automated testing that increased code coverage by 40%.

EDUCATION
Bachelor of Science in Computer Science, University of Technology
Graduated: May 2018

PROJECTS
E-commerce Platform
Built a full-stack e-commerce platform using React, Node.js, and PostgreSQL. Handled 10,000+ daily users.
Technologies: React, Node.js, PostgreSQL, AWS
    `;

    // Incomplete resume text
    const incompleteResumeText = `
Jane Smith
jane@email.com

EXPERIENCE
Developer at Company
Worked on projects.
    `;

    // Process complete resume
    const completeSections = detector.detectSections(completeResumeText);
    const completeData = analyzer.analyze(completeSections.sections);
    const completeScore = scorer.calculateScore(completeData, completeResumeText);

    // Process incomplete resume
    const incompleteSections = detector.detectSections(incompleteResumeText);
    const incompleteData = analyzer.analyze(incompleteSections.sections);
    const incompleteScore = scorer.calculateScore(incompleteData, incompleteResumeText);

    console.log('✓ Complete Resume Score:', completeScore.score);
    console.log('  - Formatting:', completeScore.breakdown.formatting);
    console.log('  - Sections:', completeScore.breakdown.sections);
    console.log('  - Keywords:', completeScore.breakdown.keywords);
    console.log('  - Content:', completeScore.breakdown.content);

    console.log('✓ Incomplete Resume Score:', incompleteScore.score);
    console.log('  - Formatting:', incompleteScore.breakdown.formatting);
    console.log('  - Sections:', incompleteScore.breakdown.sections);
    console.log('  - Keywords:', incompleteScore.breakdown.keywords);
    console.log('  - Content:', incompleteScore.breakdown.content);

    // Complete resume should score significantly higher
    expect(completeScore.score).toBeGreaterThan(incompleteScore.score);
    expect(completeScore.score).toBeGreaterThanOrEqual(70); // Should be in "good" range
    expect(incompleteScore.score).toBeLessThan(50); // Should be in "needs improvement" range
  });

  it('should give appropriate scores for different quality levels', () => {
    // High-quality resume with metrics and action verbs
    const highQualityText = `
John Doe
john.doe@email.com | (555) 123-4567

SKILLS
JavaScript, Python, React, Node.js, TypeScript, Docker, AWS, PostgreSQL

EXPERIENCE
Senior Software Engineer at Tech Corp
Jan 2020 - Present
Developed and launched 5 major features that increased user engagement by 35%. Optimized database queries reducing response time by 60%. Led cross-functional team of 8 members to deliver projects 20% ahead of schedule.

EDUCATION
Bachelor of Science in Computer Science, MIT
Graduated: 2019
    `;

    // Low-quality resume without metrics or action verbs
    const lowQualityText = `
Jane Smith
jane@email.com

SKILLS
Programming

EXPERIENCE
Developer at Company
Was responsible for various tasks and duties. Worked with team members.
    `;

    const highSections = detector.detectSections(highQualityText);
    const highData = analyzer.analyze(highSections.sections);
    const highScore = scorer.calculateScore(highData, highQualityText);

    const lowSections = detector.detectSections(lowQualityText);
    const lowData = analyzer.analyze(lowSections.sections);
    const lowScore = scorer.calculateScore(lowData, lowQualityText);

    console.log('✓ High Quality Resume Score:', highScore.score);
    console.log('✓ Low Quality Resume Score:', lowScore.score);

    expect(highScore.score).toBeGreaterThan(lowScore.score);
    expect(highScore.breakdown.content).toBeGreaterThan(lowScore.breakdown.content);
    expect(highScore.breakdown.keywords).toBeGreaterThan(lowScore.breakdown.keywords);
  });

  it('should handle resumes with complex formatting appropriately', () => {
    const simpleFormattingText = `
John Doe
john.doe@email.com

SKILLS
JavaScript, Python, React

EXPERIENCE
Software Engineer at Tech Corp
2020-2023
Developed web applications
    `;

    const complexFormattingText = `
║ John Doe ║
├──────────┤
│ Email: john@email.com │
└──────────┘

SKILLS
JavaScript	Python	React

EXPERIENCE
Software	Engineer	at	Tech	Corp
2020-2023
Developed	web	applications
    `;

    const simpleSections = detector.detectSections(simpleFormattingText);
    const simpleData = analyzer.analyze(simpleSections.sections);
    const simpleScore = scorer.calculateScore(simpleData, simpleFormattingText);

    const complexSections = detector.detectSections(complexFormattingText);
    const complexData = analyzer.analyze(complexSections.sections);
    const complexScore = scorer.calculateScore(complexData, complexFormattingText);

    console.log('✓ Simple Formatting Score:', simpleScore.breakdown.formatting);
    console.log('✓ Complex Formatting Score:', complexScore.breakdown.formatting);

    expect(simpleScore.breakdown.formatting).toBeGreaterThan(complexScore.breakdown.formatting);
  });
});
