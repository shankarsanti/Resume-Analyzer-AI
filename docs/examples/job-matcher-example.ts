/**
 * Example demonstrating JobMatcher usage with resume analysis
 */

import { JobMatcher } from './JobMatcher';
import { StructuredData } from '@resume-analyzer/shared';

// Example resume data
const resumeData: StructuredData = {
  skills: [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'HTML',
    'CSS',
    'Git',
  ],
  experience: [
    {
      jobTitle: 'Frontend Developer',
      company: 'Tech Startup',
      dates: '2021-2023',
      description: 'Built responsive web applications using React and TypeScript. Collaborated with backend team using REST APIs.',
    },
    {
      jobTitle: 'Junior Developer',
      company: 'Web Agency',
      dates: '2019-2021',
      description: 'Developed websites with JavaScript and worked with Docker for deployment.',
    },
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'State University',
      graduationDate: '2019',
    },
  ],
  projects: [
    {
      name: 'E-commerce Platform',
      description: 'Built a full-stack e-commerce platform with payment integration',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      dates: '2022',
    },
  ],
  contact: {
    email: 'developer@example.com',
    phone: '555-0123',
  },
};

// Example job description
const jobDescription = `
Senior Full-Stack Developer

We are looking for an experienced Full-Stack Developer to join our team.

Required Skills:
- JavaScript and TypeScript
- React and Node.js
- Python and Django
- PostgreSQL and MongoDB
- Docker and Kubernetes
- AWS cloud services
- REST API design
- Git version control

Preferred Skills:
- Leadership and mentoring experience
- Agile/Scrum methodology
- CI/CD pipeline experience
- AWS Certified Solutions Architect

Responsibilities:
- Design and develop scalable web applications
- Collaborate with cross-functional teams
- Mentor junior developers
- Participate in code reviews
`;

// Perform job matching
const matcher = new JobMatcher();
const matchResult = matcher.match(resumeData, jobDescription);

console.log('=== Job Match Analysis ===\n');
console.log(`Match Percentage: ${matchResult.matchPercentage}%\n`);

console.log(`Matching Skills (${matchResult.matchedSkills.length}):`);
matchResult.matchedSkills.forEach(skill => {
  console.log(`  ✓ ${skill}`);
});

console.log(`\nMissing Skills (${matchResult.missingSkills.length}):`);
matchResult.missingSkills.forEach(skill => {
  console.log(`  ✗ ${skill}`);
});

console.log('\n=== Recommendations ===');
console.log('To improve your match for this position:');
console.log('1. Add the top missing skills to your resume');
console.log('2. Highlight relevant experience with matching skills');
console.log('3. Consider obtaining certifications for high-priority skills');
