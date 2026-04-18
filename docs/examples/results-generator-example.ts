/**
 * Example usage of ResultsGenerator
 * 
 * This demonstrates how to use the ResultsGenerator to compile
 * analysis results and generate actionable suggestions.
 */

import { ResultsGenerator } from './ResultsGenerator';
import { ATSScorer } from './ATSScorer';
import { KeywordAnalyzer } from './KeywordAnalyzer';
import { JobMatcher } from './JobMatcher';
import { ContentAnalyzer } from './ContentAnalyzer';
import { SectionDetector } from './SectionDetector';

// Sample resume text
const resumeText = `
John Doe
john.doe@example.com | (555) 123-4567

SKILLS
JavaScript, React, Node.js, TypeScript, MongoDB, AWS, Docker

EXPERIENCE
Senior Software Engineer at Tech Corp
Jan 2020 - Present
• Led development of microservices architecture using Node.js and AWS
• Improved application performance by 40% through code optimization
• Mentored team of 5 junior developers
• Implemented CI/CD pipeline reducing deployment time by 60%

Software Engineer at StartupCo
Jun 2018 - Dec 2019
• Developed React-based web applications serving 100K+ users
• Built RESTful APIs using Node.js and Express
• Reduced page load time by 35% through performance optimization

EDUCATION
Bachelor of Science in Computer Science
University of Technology, 2018

PROJECTS
E-commerce Platform
Built full-stack e-commerce application with payment integration
Technologies: React, Node.js, MongoDB, Stripe, AWS
`;

// Optional job description for matching
const jobDescription = `
We are seeking a Senior Full Stack Developer with:
- 5+ years experience with JavaScript, TypeScript, React, and Node.js
- Strong experience with AWS cloud services
- Experience with Docker and Kubernetes
- Knowledge of microservices architecture
- Experience with PostgreSQL or MongoDB
- Excellent problem-solving and leadership skills
`;

// Initialize components
const sectionDetector = new SectionDetector();
const contentAnalyzer = new ContentAnalyzer();
const atsScorer = new ATSScorer();
const keywordAnalyzer = new KeywordAnalyzer();
const jobMatcher = new JobMatcher();
const resultsGenerator = new ResultsGenerator();

// Run analysis pipeline
console.log('🔍 Analyzing resume...\n');

// Step 1: Detect sections
const sectionResult = sectionDetector.detectSections(resumeText);
if (sectionResult.error) {
  console.error('❌ Section detection failed:', sectionResult.error);
  process.exit(1);
}
console.log(`✅ Detected ${sectionResult.sections.length} sections`);

// Step 2: Extract structured data
const structuredData = contentAnalyzer.analyze(sectionResult.sections);
console.log(`✅ Extracted structured data:`);
console.log(`   - Skills: ${structuredData.skills.length}`);
console.log(`   - Experience entries: ${structuredData.experience.length}`);
console.log(`   - Education entries: ${structuredData.education.length}`);
console.log(`   - Projects: ${structuredData.projects.length}`);

// Step 3: Calculate ATS score
const atsScore = atsScorer.calculateScore(structuredData, resumeText);
console.log(`✅ ATS Score calculated: ${atsScore.score}/100`);

// Step 4: Analyze keywords
const keywordAnalysis = keywordAnalyzer.analyze(structuredData, jobDescription);
console.log(`✅ Keywords analyzed:`);
console.log(`   - Identified: ${keywordAnalysis.identifiedKeywords.length}`);
console.log(`   - Missing: ${keywordAnalysis.missingKeywords.length}`);

// Step 5: Match against job description (optional)
const jobMatch = jobMatcher.match(structuredData, jobDescription);
console.log(`✅ Job match calculated: ${jobMatch.matchPercentage}%`);

// Step 6: Generate complete results with suggestions
const results = resultsGenerator.generate(
  atsScore,
  keywordAnalysis,
  structuredData,
  sectionResult.sections,
  jobMatch
);

// Display results
console.log('\n📊 ANALYSIS RESULTS\n');
console.log('═══════════════════════════════════════════════════════════');

console.log(`\n🎯 Overall Score: ${results.score}/100 (${results.status.toUpperCase()})`);

console.log('\n📈 Score Breakdown:');
console.log(`   Formatting:  ${results.breakdown.formatting}/25`);
console.log(`   Sections:    ${results.breakdown.sections}/25`);
console.log(`   Keywords:    ${results.breakdown.keywords}/25`);
console.log(`   Content:     ${results.breakdown.content}/25`);

console.log('\n📋 Resume Sections:');
results.sectionsAnalysis.forEach(section => {
  const status = section.present ? '✅' : '❌';
  console.log(`   ${status} ${section.sectionType}`);
});

if (results.jobMatch) {
  console.log(`\n🎯 Job Match: ${results.jobMatch.matchPercentage}%`);
  console.log(`   Matching skills: ${results.jobMatch.matchedSkills.length}`);
  console.log(`   Missing skills: ${results.jobMatch.missingSkills.length}`);
  
  if (results.jobMatch.missingSkills.length > 0) {
    console.log(`   Top missing: ${results.jobMatch.missingSkills.slice(0, 3).join(', ')}`);
  }
}

console.log('\n💡 Suggestions for Improvement:');
results.suggestions.forEach((suggestion, index) => {
  console.log(`   ${index + 1}. ${suggestion}`);
});

console.log('\n🔑 Keywords:');
console.log(`   Identified: ${results.keywords.identifiedKeywords.length} keywords`);
if (results.keywords.identifiedKeywords.length > 0) {
  const topKeywords = results.keywords.identifiedKeywords
    .slice(0, 5)
    .map(k => k.text)
    .join(', ');
  console.log(`   Top 5: ${topKeywords}`);
}

if (results.keywords.missingKeywords.length > 0) {
  console.log(`   Missing: ${results.keywords.missingKeywords.length} keywords`);
  const topMissing = results.keywords.missingKeywords
    .slice(0, 5)
    .map(k => k.text)
    .join(', ');
  console.log(`   Top 5 missing: ${topMissing}`);
}

console.log('\n═══════════════════════════════════════════════════════════');

// Example: Error handling
console.log('\n\n🔧 Error Handling Example:\n');
const errorResult = resultsGenerator.generateError(
  'text_extraction',
  'Failed to extract text from PDF - file may be corrupted or image-based'
);

console.log('Error Result:');
console.log(`   Stage: ${errorResult.errorStage}`);
console.log(`   Error: ${errorResult.error}`);
console.log(`   Score: ${errorResult.score}`);
console.log(`   Status: ${errorResult.status}`);
