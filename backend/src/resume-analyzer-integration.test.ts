import { describe, it, expect } from 'vitest';
import { ResumeAnalyzer } from './ResumeAnalyzer';
import * as fs from 'fs';
import * as path from 'path';

describe('ResumeAnalyzer Integration Tests', () => {
  it('should complete full pipeline analysis with a comprehensive resume', async () => {
    const analyzer = new ResumeAnalyzer();
    
    const testDir = path.join(__dirname, '../test-files');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    const testPdfPath = path.join(testDir, 'comprehensive-resume.pdf');
    
    // Create a comprehensive resume PDF for testing
    const comprehensivePdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 600 >>
stream
BT
/F1 12 Tf
50 700 Td
(JOHN DOE) Tj
0 -20 Td
(Contact Information) Tj
0 -15 Td
(Email: john.doe@email.com) Tj
0 -15 Td
(Phone: 555-123-4567) Tj
0 -30 Td
(Professional Summary) Tj
0 -15 Td
(Experienced software engineer with 5 years of expertise in full-stack development) Tj
0 -30 Td
(Skills) Tj
0 -15 Td
(JavaScript, TypeScript, Python, React, Node.js, Express, AWS, Docker, Kubernetes) Tj
0 -15 Td
(Git, CI/CD, Agile, Scrum, REST APIs, GraphQL, MongoDB, PostgreSQL) Tj
0 -30 Td
(Experience) Tj
0 -15 Td
(Senior Software Engineer at Tech Corp) Tj
0 -15 Td
(January 2020 - Present) Tj
0 -15 Td
(Led development of microservices architecture serving 1 million users) Tj
0 -15 Td
(Improved system performance by 40 percent through optimization) Tj
0 -15 Td
(Reduced deployment time by 60 percent by implementing CI/CD pipeline) Tj
0 -15 Td
(Mentored team of 5 junior developers) Tj
0 -30 Td
(Software Engineer at StartupXYZ) Tj
0 -15 Td
(June 2018 - December 2019) Tj
0 -15 Td
(Developed RESTful APIs using Node.js and Express) Tj
0 -15 Td
(Built responsive web applications with React) Tj
0 -15 Td
(Increased code coverage from 40 percent to 85 percent) Tj
0 -30 Td
(Education) Tj
0 -15 Td
(Master of Science in Computer Science) Tj
0 -15 Td
(Massachusetts Institute of Technology, 2018) Tj
0 -15 Td
(Bachelor of Science in Computer Science) Tj
0 -15 Td
(University of California Berkeley, 2016) Tj
0 -30 Td
(Projects) Tj
0 -15 Td
(E-commerce Platform) Tj
0 -15 Td
(Built a full-stack e-commerce platform using React, Node.js, and MongoDB) Tj
0 -15 Td
(Technologies: React, Node.js, Express, MongoDB, AWS, Docker) Tj
0 -15 Td
(Handled 10000 concurrent users with 99.9 percent uptime) Tj
0 -30 Td
(Certifications) Tj
0 -15 Td
(AWS Certified Solutions Architect) Tj
0 -15 Td
(Certified Kubernetes Administrator) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000229 00000 n
0000000330 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
980
%%EOF`;

    fs.writeFileSync(testPdfPath, comprehensivePdfContent);

    try {
      const startTime = Date.now();
      const result = await analyzer.analyze(testPdfPath, 'comprehensive-resume.pdf');
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Verify no errors
      expect(result.error).toBeUndefined();
      expect(result.errorStage).toBeUndefined();

      // Verify score is calculated
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);

      // Verify breakdown is complete
      expect(result.breakdown.formatting).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.formatting).toBeLessThanOrEqual(25);
      expect(result.breakdown.sections).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.sections).toBeLessThanOrEqual(25);
      expect(result.breakdown.keywords).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.keywords).toBeLessThanOrEqual(25);
      expect(result.breakdown.content).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.content).toBeLessThanOrEqual(25);

      // Verify status is set correctly
      expect(['excellent', 'good', 'needs_improvement']).toContain(result.status);

      // Verify suggestions are provided (max 5)
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.suggestions.length).toBeLessThanOrEqual(5);

      // Verify keywords are identified
      expect(result.keywords).toBeDefined();
      expect(Array.isArray(result.keywords.identifiedKeywords)).toBe(true);
      expect(result.keywords.identifiedKeywords.length).toBeGreaterThan(0);

      // Verify sections analysis
      expect(Array.isArray(result.sectionsAnalysis)).toBe(true);
      expect(result.sectionsAnalysis.length).toBeGreaterThan(0);

      // Verify processing time is reasonable (should be well under 30 seconds)
      expect(processingTime).toBeLessThan(30000);

      console.log('\n=== Resume Analysis Results ===');
      console.log(`Score: ${result.score}/100 (${result.status})`);
      console.log(`Processing Time: ${processingTime}ms`);
      console.log(`\nBreakdown:`);
      console.log(`  Formatting: ${result.breakdown.formatting}/25`);
      console.log(`  Sections: ${result.breakdown.sections}/25`);
      console.log(`  Keywords: ${result.breakdown.keywords}/25`);
      console.log(`  Content: ${result.breakdown.content}/25`);
      console.log(`\nIdentified Keywords: ${result.keywords.identifiedKeywords.length}`);
      console.log(`Suggestions: ${result.suggestions.length}`);
      console.log(`\nTop Suggestions:`);
      result.suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion}`);
      });
    } finally {
      if (fs.existsSync(testPdfPath)) {
        fs.unlinkSync(testPdfPath);
      }
    }
  });

  it('should include job match analysis when job description is provided', async () => {
    const analyzer = new ResumeAnalyzer();
    
    const testDir = path.join(__dirname, '../test-files');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    const testPdfPath = path.join(testDir, 'job-match-resume.pdf');
    
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 300 >>
stream
BT
/F1 12 Tf
50 700 Td
(Skills) Tj
0 -20 Td
(JavaScript, React, Node.js, Python, Git, Agile) Tj
0 -40 Td
(Experience) Tj
0 -20 Td
(Software Engineer at Tech Corp) Tj
0 -20 Td
(2020 - Present) Tj
0 -20 Td
(Developed web applications using React and Node.js) Tj
0 -20 Td
(Implemented RESTful APIs and microservices) Tj
0 -40 Td
(Education) Tj
0 -20 Td
(BS Computer Science, MIT, 2020) Tj
0 -40 Td
(Projects) Tj
0 -20 Td
(E-commerce Platform using React and Node.js) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000229 00000 n
0000000330 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
680
%%EOF`;

    fs.writeFileSync(testPdfPath, pdfContent);

    try {
      const jobDescription = `
        We are looking for a Senior Full-Stack Developer with the following skills:
        - JavaScript and TypeScript
        - React and Redux
        - Node.js and Express
        - Python and Django
        - AWS and Docker
        - Kubernetes
        - GraphQL
        - PostgreSQL
        - CI/CD experience
        - Agile methodology
      `;

      const result = await analyzer.analyze(testPdfPath, 'job-match-resume.pdf', jobDescription);

      // Verify job match is included
      expect(result.jobMatch).toBeDefined();
      expect(result.jobMatch?.matchPercentage).toBeGreaterThanOrEqual(0);
      expect(result.jobMatch?.matchPercentage).toBeLessThanOrEqual(100);
      
      // Verify matching skills are identified
      expect(Array.isArray(result.jobMatch?.matchedSkills)).toBe(true);
      expect(result.jobMatch?.matchedSkills.length).toBeGreaterThan(0);
      
      // Verify missing skills are identified
      expect(Array.isArray(result.jobMatch?.missingSkills)).toBe(true);
      
      console.log('\n=== Job Match Analysis ===');
      console.log(`Match Percentage: ${result.jobMatch?.matchPercentage}%`);
      console.log(`\nMatching Skills (${result.jobMatch?.matchedSkills.length}):`);
      result.jobMatch?.matchedSkills.forEach(skill => {
        console.log(`  ✓ ${skill}`);
      });
      console.log(`\nMissing Skills (${result.jobMatch?.missingSkills.length}):`);
      result.jobMatch?.missingSkills.slice(0, 5).forEach(skill => {
        console.log(`  ✗ ${skill}`);
      });
    } finally {
      if (fs.existsSync(testPdfPath)) {
        fs.unlinkSync(testPdfPath);
      }
    }
  });
});
