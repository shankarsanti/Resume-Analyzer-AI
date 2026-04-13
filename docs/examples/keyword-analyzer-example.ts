/**
 * Example usage of KeywordAnalyzer
 * 
 * This file demonstrates how to use the KeywordAnalyzer component
 * to identify and categorize keywords from resume data.
 */

import { KeywordAnalyzer } from './KeywordAnalyzer';
import { StructuredData } from '@resume-analyzer/shared';

// Create an instance of KeywordAnalyzer
const analyzer = new KeywordAnalyzer();

// Example 1: Analyze keywords from resume without job description
console.log('=== Example 1: Basic Keyword Analysis ===\n');

const resumeData: StructuredData = {
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Docker'],
  experience: [
    {
      jobTitle: 'Senior Software Engineer',
      company: 'Tech Corp',
      dates: '2020-2023',
      description: 'Led development of microservices using Python and Django. Implemented CI/CD pipelines with Jenkins.',
    },
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of Technology',
      graduationDate: '2020',
    },
  ],
  projects: [
    {
      name: 'E-commerce Platform',
      description: 'Built a scalable platform with PostgreSQL database',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
    },
  ],
  contact: {
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
  },
};

const analysis1 = analyzer.analyze(resumeData);

console.log('Identified Keywords:');
analysis1.identifiedKeywords.forEach(keyword => {
  console.log(`  - ${keyword.text} (${keyword.category})`);
});

console.log('\nMissing Keywords:', analysis1.missingKeywords.length === 0 ? 'None (no job description provided)' : analysis1.missingKeywords);

// Example 2: Analyze with job description to find gaps
console.log('\n\n=== Example 2: Gap Analysis with Job Description ===\n');

const jobDescription = `
We are seeking a Full Stack Developer with the following skills:
- Strong experience with Python and Django (required)
- Frontend development with React and TypeScript
- Cloud infrastructure experience with AWS and Kubernetes
- Database management with PostgreSQL and MongoDB
- Experience with Docker and CI/CD pipelines
- Excellent communication and leadership skills
`;

const analysis2 = analyzer.analyze(resumeData, jobDescription);

console.log('Identified Keywords from Resume:');
analysis2.identifiedKeywords.slice(0, 10).forEach(keyword => {
  console.log(`  - ${keyword.text} (${keyword.category})`);
});

console.log('\nMissing Keywords from Job Description (ranked by importance):');
analysis2.missingKeywords.slice(0, 10).forEach(keyword => {
  console.log(`  - ${keyword.text} (${keyword.category}, frequency: ${keyword.frequency})`);
});

// Example 3: Categorization demonstration
console.log('\n\n=== Example 3: Keyword Categorization ===\n');

const diverseData: StructuredData = {
  skills: [
    'Python',           // technical
    'Leadership',       // soft_skill
    'AWS Certified',    // certification
    'Jira',            // tool
    'Fintech',         // industry
  ],
  experience: [],
  education: [],
  projects: [],
  contact: {},
};

const analysis3 = analyzer.analyze(diverseData);

console.log('Keywords by Category:');
const byCategory = analysis3.identifiedKeywords.reduce((acc, keyword) => {
  if (!acc[keyword.category]) acc[keyword.category] = [];
  acc[keyword.category].push(keyword.text);
  return acc;
}, {} as Record<string, string[]>);

Object.entries(byCategory).forEach(([category, keywords]) => {
  console.log(`  ${category}: ${keywords.join(', ')}`);
});

console.log('\n=== Examples Complete ===\n');
